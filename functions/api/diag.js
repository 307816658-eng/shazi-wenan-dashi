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
  const url = base + '/chat/completions';

  let status = 0;
  let bodyText = '';
  let errMsg = '';
  const t0 = Date.now();

  try {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 60000);
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + String(env.API_KEY || '') },
      body: JSON.stringify({
        model: env.MODEL_NAME,
        messages: [{ role: 'user', content: '只回两个字：可以' }],
        max_tokens: 10
      }),
      signal: ac.signal
    });
    clearTimeout(timer);
    status = r.status;
    bodyText = (await r.text()).slice(0, 400);
  } catch (e) {
    errMsg = String((e && e.message) || e);
  }

  // 脱敏：万一响应体里回显了 key
  const key = String(env.API_KEY || '');
  if (key) bodyText = bodyText.split(key).join('sk-****');

  let host = '';
  try { host = new URL(url).host; } catch (e) { host = base; }

  return json({
    ok: status >= 200 && status < 300,
    status,
    ms: Date.now() - t0,
    host,
    model: env.MODEL_NAME,
    colo: (request.cf && request.cf.colo) || '',
    asn: (request.cf && request.cf.asn) || '',
    ray: request.headers.get('cf-ray') || '',
    body: bodyText,
    err: errMsg
  });
}

export async function onRequestGet() {
  return json({ ok: false, error: '请用 POST 调用诊断接口' }, 405);
}
