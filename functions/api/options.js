/**
 * GET /api/options?industry=food —— Cloudflare Pages Function
 *
 * 只下发当前行业的选项（不把 4 个行业全量塞给前端），
 * 同时把首页要用的行业卡片列表一并返回。
 */

import core from '../../lib/core.js';

export async function onRequestGet(context) {
  let industry = '';
  try {
    industry = new URL(context.request.url).searchParams.get('industry') || '';
  } catch (e) { /* 非法 URL 就当没传，回落到默认行业 */ }

  const r = core.handleOptions({ industry });
  return new Response(JSON.stringify(r.body), {
    status: r.status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}
