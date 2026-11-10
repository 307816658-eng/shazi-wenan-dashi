/**
 * POST /api/diag —— 临时诊断接口（定位 Cloudflare 出口被上游限流的问题）
 *
 * 鉴权：请求头 x-diag 必须等于 API_KEY 的 SHA-256 前 16 位。
 * 返回：上游真实 HTTP 状态码、响应体前 400 字（已脱敏）、Worker 所在机房。
 * 绝不返回密钥本身。
 */

const json = (o, s = 200) =>
  new Response(JSON.stringify(o), {
    status: s,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });

async function sha16(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(s || '')));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

export async function onRequestPost(context) {
  const { env, request } = context;

  const expect = await sha16(env.API_KEY);
  if ((request.headers.get('x-diag') || '') !== expect) return json({ ok: false, error: 'forbidden' }, 403);

  const base = String(env.API_URL || '').replace(/\/+$/, '');
  const key = String(env.API_KEY || '');

  // 四种模式，用来区分：IP 全站封 / 只看路径 / 看 UA 指纹
  const mode = new URL(request.url).searchParams.get('mode') || 'plain';

  const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

  let url = base + '/chat/completions';
  let init = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
    body: JSON.stringify({
      model: env.MODEL_NAME,
      messages: [{ role: 'user', content: '只回两个字：可以' }],
      max_tokens: 10
    })
  };

  if (mode === 'ua') {
    init.headers['User-Agent'] = CHROME_UA;
  } else if (mode === 'browser') {
    // 完整浏览器指纹：UA + 常见 Accept 系头 + Origin/Referer
    init.headers['User-Agent'] = CHROME_UA;
    init.headers['Accept'] = 'application/json, text/plain, */*';
    init.headers['Accept-Language'] = 'zh-CN,zh;q=0.9';
    init.headers['Origin'] = 'https://apihub.agnes-ai.com';
    init.headers['Referer'] = 'https://apihub.agnes-ai.com/';
  } else if (mode === 'models') {
    // 换路径：GET /v1/models，看是否也 429（判断是路径限流还是 IP 全封）
    url = base + '/models';
    init = { method: 'GET', headers: { Authorization: 'Bearer ' + key } };
  } else if (mode === 'socket') {
    // 走 TCP socket（L4）而非 fetch，出口通道与 HTTP 子请求不同，用于判断能否绕过 IP 封禁
    return socketProbe(base, key, env.MODEL_NAME);
  }

  let status = 0;
  let bodyText = '';
  let errMsg = '';
  const t0 = Date.now();

  try {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 60000);
    const r = await fetch(url, { ...init, signal: ac.signal });
    clearTimeout(timer);
    status = r.status;
    bodyText = (await r.text()).slice(0, 400);
  } catch (e) {
    errMsg = String((e && e.message) || e);
  }

  // 脱敏：万一响应体里回显了 key
  if (key) bodyText = bodyText.split(key).join('sk-****');

  let host = '';
  try { host = new URL(url).host; } catch (e) { host = base; }

  return json({
    ok: status >= 200 && status < 300,
    mode,
    status,
    ms: Date.now() - t0,
    path: new URL(url).pathname,
    host,
    model: env.MODEL_NAME,
    colo: (request.cf && request.cf.colo) || '',
    ray: request.headers.get('cf-ray') || '',
    body: bodyText,
    err: errMsg
  });
}

/**
 * 用 cloudflare:sockets 的 TCP 连接发一个 HTTP/1.1 请求。
 * 目的：L4 出口通道与 fetch 子请求不同，用于判断能否绕过上游对 Workers 出口 IP 的 1015 封禁。
 */
async function socketProbe(base, key, model) {
  let host = '';
  let path = '';
  try {
    const u = new URL(base);
    host = u.hostname;
    path = u.pathname.replace(/\/+$/, '') + '/chat/completions';
  } catch (e) {
    return json({ ok: false, mode: 'socket', err: 'API_URL 解析失败' }, 500);
  }

  let mod;
  try {
    mod = await import('cloudflare:sockets');
  } catch (e) {
    return json({ ok: false, mode: 'socket', err: 'sockets 不可用：' + String((e && e.message) || e) }, 500);
  }

  const bodyText = JSON.stringify({
    model,
    messages: [{ role: 'user', content: '只回两个字：可以' }],
    max_tokens: 10
  });
  const enc = new TextEncoder();
  const head =
    'POST ' + path + ' HTTP/1.1\r\n' +
    'Host: ' + host + '\r\n' +
    'Content-Type: application/json\r\n' +
    'Authorization: Bearer ' + key + '\r\n' +
    'Content-Length: ' + enc.encode(bodyText).length + '\r\n' +
    'Connection: close\r\n\r\n';

  const t0 = Date.now();
  let raw = '';
  let err = '';
  try {
    const socket = mod.connect({ hostname: host, port: 443 }, { secureTransport: 'on', allowHalfOpen: false });
    await socket.opened;
    const w = socket.writable.getWriter();
    await w.write(enc.encode(head + bodyText));
    await w.close();

    const reader = socket.readable.getReader();
    const dec = new TextDecoder();
    let total = 0;
    while (total < 4096) {
      const { done, value } = await reader.read();
      if (done) break;
      raw += dec.decode(value, { stream: true });
      total += (value && value.length) || 0;
    }
    try { socket.close(); } catch (e2) { /* 忽略关闭异常 */ }
  } catch (e) {
    err = String((e && e.message) || e);
  }

  const statusMatch = raw.match(/^HTTP\/1\.[01] (\d{3})/);
  const status = statusMatch ? Number(statusMatch[1]) : 0;
  const splitAt = raw.indexOf('\r\n\r\n');
  const bodyOut = (splitAt >= 0 ? raw.slice(splitAt + 4) : raw).slice(0, 300);

  return json({
    ok: status >= 200 && status < 300,
    mode: 'socket',
    status,
    ms: Date.now() - t0,
    method: 'TCP+TLS',
    host,
    path,
    bytes: raw.length,
    body: bodyOut.split(key).join('sk-****'),
    err
  });
}

export async function onRequestGet() {
  return json({ ok: false, error: '请用 POST 调用诊断接口' }, 405);
}
