'use strict';

/**
 * 傻子文案大师 —— 本地 Node 服务（零依赖，只用内置模块）
 *
 * 这一层只负责「HTTP 的事」：
 *   1. 托管 public/ 静态页面
 *   2. 把 /api/options、/api/health、/api/generate 转给 lib/core.js
 *   3. 统一错误处理，保证前端永远拿不到密钥
 *
 * 所有业务逻辑都在 lib/core.js —— 那份代码同时被 Cloudflare Pages Functions 复用，
 * 所以本地和线上跑的是同一套逻辑。
 *
 * 启动：node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { loadConfig, maskSecret, ROOT } = require('./lib/env');
const core = require('./lib/core');
const REG = require('./lib/industries');

const cfg = loadConfig();
const PORT = cfg.PORT;
const PUBLIC_DIR = path.join(ROOT, 'public');
const BODY_LIMIT = 64 * 1024; // 64KB，防滥用

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json'
};

/* ----------------------------- 工具函数 ----------------------------- */

function sendJSON(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > BODY_LIMIT) {
        reject(new Error('BODY_TOO_LARGE'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/** 静态文件：严格限制在 public/ 目录内，防路径穿越 */
function serveStatic(req, res, urlPath) {
  let rel = decodeURIComponent(urlPath.split('?')[0]);
  if (rel === '/' || rel === '') rel = '/index.html';

  const safeRel = path.normalize(rel).replace(/^([/\\])+/, '');
  const full = path.join(PUBLIC_DIR, safeRel);

  if (!full.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403');
    return;
  }

  fs.readFile(full, (err, buf) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(full).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Length': buf.length,
      'Cache-Control': 'no-cache'
    });
    res.end(buf);
  });
}

/** 取本机局域网 IPv4，给手机访问用 */
function lanAddresses() {
  const out = [];
  const ifs = os.networkInterfaces();
  for (const name of Object.keys(ifs)) {
    for (const info of ifs[name] || []) {
      if (info.family === 'IPv4' && !info.internal) out.push(info.address);
    }
  }
  return out;
}

/* ------------------------------ 路由层 ------------------------------ */

async function routeGenerate(req, res) {
  let payload;
  try {
    const raw = await readBody(req);
    payload = JSON.parse(raw || '{}');
  } catch (e) {
    if (e && e.message === 'BODY_TOO_LARGE') {
      sendJSON(res, 413, { ok: false, error: { message: '提交的内容太长了，精简一下再试。', kind: 'format' } });
      return;
    }
    sendJSON(res, 400, { ok: false, error: { message: '提交的数据格式不对，请刷新页面重试。', kind: 'format' } });
    return;
  }

  const r = await core.handleGenerate(cfg, payload);
  sendJSON(res, r.status, r.body);
}

const server = http.createServer((req, res) => {
  const url = req.url || '/';

  // 选项树：按行业下发，前端渲染向导全靠它
  if (url.startsWith('/api/options')) {
    let industry = '';
    try { industry = new URL(url, 'http://localhost').searchParams.get('industry') || ''; }
    catch (e) { /* 非法 URL 就当没传 */ }
    const r = core.handleOptions({ industry });
    sendJSON(res, r.status, r.body);
    return;
  }

  // 健康检查：只回配置状态，绝不回密钥
  if (url.startsWith('/api/health')) {
    const r = core.handleHealth(cfg);
    sendJSON(res, r.status, r.body);
    return;
  }

  if (url.startsWith('/api/generate')) {
    if (req.method !== 'POST') {
      sendJSON(res, 405, { ok: false, error: { message: '方法不允许', kind: 'format' } });
      return;
    }
    routeGenerate(req, res).catch((e) => {
      console.error('[致命错误]', maskSecret(e && e.stack ? e.stack : String(e)));
      if (!res.headersSent) {
        sendJSON(res, 500, { ok: false, error: { message: '服务出了点问题，请稍后再试。', kind: 'unknown' } });
      }
    });
    return;
  }

  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('405');
    return;
  }

  serveStatic(req, res, url);
});

server.on('error', (e) => {
  if (e && e.code === 'EADDRINUSE') {
    console.error(`\n[启动失败] 端口 ${PORT} 已被占用。`);
    console.error(`换个端口：PORT=${PORT + 1} node server.js\n`);
    process.exit(1);
  }
  console.error('[服务错误]', e);
});

server.listen(PORT, '0.0.0.0', () => {
  const lans = lanAddresses();
  console.log('');
  console.log('==========================================================');
  console.log('   傻子文案大师  V0.2 全行业版  —— 一个专门服务于傻子的工具');
  console.log('==========================================================');
  console.log(`   本机打开：   http://localhost:${PORT}`);
  if (lans.length) {
    lans.forEach((ip) => console.log(`   手机打开：   http://${ip}:${PORT}   (手机需连同一个 WiFi)`));
  } else {
    console.log('   手机打开：   未检测到局域网地址');
  }
  console.log('----------------------------------------------------------');
  console.log(`   适用行业：   ${REG.list().map((x) => x.label).join(' / ')}`);
  if (cfg.configured) {
    console.log(`   大模型：     ${cfg.MODEL_NAME}`);
    console.log(`   接口地址：   ${cfg.API_URL}`);
    console.log(`   密钥：       已加载（${cfg.API_KEY.length} 位字符，仅服务端内存可见，前端与日志均不出现）`);
  } else {
    console.log(`   [警告] 配置不完整，缺少：${cfg.missing.join(', ')}`);
    console.log('          请编辑项目根目录的 .env 文件后重启。');
  }
  console.log('==========================================================');
  console.log('');
});
