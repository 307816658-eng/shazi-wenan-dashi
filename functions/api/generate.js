/**
 * POST /api/generate —— Cloudflare Pages Function
 *
 * 这一层只做「Workers 的事」：解析请求、调 core、把结果包成 Response。
 * 真正的业务逻辑全在 ../../lib/core.js（和本地 Node 服务用的是同一份代码）。
 *
 * API Key 从 Cloudflare 后台的环境变量里读（context.env.API_KEY），
 * 永远不出现在前端、日志或响应体里。
 */

import core from '../../lib/core.js';

function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let payload = {};
  try {
    payload = await request.json();
  } catch (e) {
    return jsonResponse({ ok: false, error: { message: '提交的数据格式不对，请刷新页面重试。', kind: 'format' } }, 400);
  }

  try {
    const r = await core.handleGenerate(env, payload);
    return jsonResponse(r.body, r.status);
  } catch (e) {
    // 兜底：绝不让用户看到白屏或原始异常
    console.error('[generate] 未捕获异常:', e && e.message ? e.message : e);
    return jsonResponse({ ok: false, error: { message: '服务出了点问题，请稍后再试。', kind: 'unknown' } }, 500);
  }
}

/** 其他方法一律拒绝，避免误用 */
export async function onRequest(context) {
  if (context.request.method === 'POST') {
    return onRequestPost(context);
  }
  return jsonResponse({ ok: false, error: { message: '方法不允许', kind: 'format' } }, 405);
}
