/**
 * GET /api/options —— Cloudflare Pages Function
 *
 * 下发选项树给前端渲染向导。选项要增删改，只改 lib/taxonomy.js 就行，前端不用动。
 */

import core from '../../lib/core.js';

export async function onRequestGet() {
  const r = core.handleOptions();
  return new Response(JSON.stringify(r.body), {
    status: r.status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}
