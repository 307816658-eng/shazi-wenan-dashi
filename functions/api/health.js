/**
 * GET /api/health —— Cloudflare Pages Function
 *
 * 只回「配置是否完整、用的哪个模型」，**绝不回密钥**。
 * 线上排障第一步就是打开这个地址看 configured 是不是 true。
 */

import core from '../../lib/core.js';

export async function onRequestGet(context) {
  const r = core.handleHealth(context.env);
  return new Response(JSON.stringify(r.body), {
    status: r.status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}
