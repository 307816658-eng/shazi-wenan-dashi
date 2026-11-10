/**
 * 临时对照探测（带 token 保护）：
 * 用同一个 key，从 Cloudflare Worker 分别请求【新地址】和【旧地址】，
 * 对比返回形态，证明 Worker 出网正常，只是新地址在 CDN 层封了 Worker 的 IP。
 * 诊断完即删除。
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
  if ((request.headers.get('x-diag') || '') !== (await sha16(env.API_KEY))) {
    return json({ ok: false, error: 'forbidden' }, 403);
  }

  const key = String(env.API_KEY || '');
  const model = env.MODEL_NAME;
  const body = JSON.stringify({
    model,
    messages: [{ role: 'user', content: '只回两个字：可以' }],
    max_tokens: 10
  });

  const targets = {
    new: 'https://apihub.agnes-ai.com/v1/chat/completions', // 当前配置的新地址
    old: 'https://api.agnes-ai.cn/v1/chat/completions'      // 之前能用的旧地址（同一个新 key）
  };

  const out = {};
  for (const [name, url] of Object.entries(targets)) {
    const t0 = Date.now();
    let status = 0;
    let text = '';
    let err = '';
    try {
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), 30000);
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
        body,
        signal: ac.signal
      });
      clearTimeout(timer);
      status = r.status;
      text = (await r.text()).slice(0, 260);
    } catch (e) {
      err = String((e && e.message) || e);
    }
    out[name] = {
      status,
      ms: Date.now() - t0,
      // 判断这层是谁拦的：纯文本 "error code: xxxx" = Cloudflare CDN 层；JSON = 到了 API 层
      layer: /^\s*error code: \d+/.test(text) ? 'CDN(Cloudflare)' : (text.trim().startsWith('{') ? 'API(业务层)' : '未知'),
      body: text.split(key).join('sk-****'),
      err
    };
  }

  return json({ ok: true, model, egressColo: (request.cf && request.cf.colo) || '', result: out });
}

export async function onRequestGet() {
  return json({ ok: false, error: '请用 POST' }, 405);
}
