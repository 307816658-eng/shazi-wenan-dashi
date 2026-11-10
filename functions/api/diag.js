/**
 * 临时诊断接口（排障用完即删）：从 Workers 环境直连上游，返回原始状态码与原因。
 * 不回显密钥全文，只回显长度与前缀。
 */
export async function onRequestGet({ env }) {
  const key = String((env && env.API_KEY) || '');
  const base = String((env && env.API_URL) || '').replace(/\/+$/, '');
  const model = String((env && env.MODEL_NAME) || '');
  const out = { runtime: 'workers', base, model, keyLen: key.length, keyPrefix: key.slice(0, 3) };
  const t0 = Date.now();
  try {
    const r = await fetch(base + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key,
        'User-Agent': 'Mozilla/5.0 (compatible; ShaziWenanDashi/1.0)'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: '说两个字：你好' }],
        max_tokens: 20
      })
    });
    const txt = await r.text();
    out.status = r.status;
    out.ms = Date.now() - t0;
    out.body = String(txt).slice(0, 600).split(key).join('<key>');
    out.retryAfter = r.headers.get('retry-after');
    out.rateLimit = r.headers.get('x-ratelimit-limit-requests');
  } catch (e) {
    out.error = String(e);
    out.ms = Date.now() - t0;
  }
  return new Response(JSON.stringify(out), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}
