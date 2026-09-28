'use strict';

/**
 * 傻子文案大师 V0.1 —— 安全审计
 *
 * 跑法：node tools/security_check.js
 *
 * 核心问题只有一个：API Key 有没有可能跑到前端、日志、Git、响应体里去。
 * 这个脚本会把真实 Key 读出来，然后到每一个可能的泄漏点去找它。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = 'http://127.0.0.1:3100';

const checks = [];
function rec(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
  console.log((pass ? '[PASS] ' : '[FAIL] ') + name + (detail ? '  —— ' + detail : ''));
}

/* 读出真实 Key（只在本进程内存里用，不打印） */
function realKey() {
  try {
    const txt = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
    for (const line of txt.split(/\r?\n/)) {
      const s = line.trim();
      if (s.startsWith('API_KEY=')) return s.slice(8).trim();
    }
  } catch (e) { /* 忽略 */ }
  return '';
}

const KEY = realKey();
/* 同时按前缀模糊找，防止「部分泄露」 */
const KEY_PREFIX = KEY ? KEY.slice(0, 12) : '';

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === '.git') continue;
      walk(full, out);
    } else if (st.size < 3 * 1024 * 1024) {
      out.push(full);
    }
  }
  return out;
}

function scanFile(file, needles, excludeSelf) {
  if (excludeSelf && path.resolve(file) === path.resolve(__filename)) return [];
  let txt;
  try { txt = fs.readFileSync(file, 'utf8'); } catch (e) { return []; }
  const hits = [];
  for (const n of needles) {
    if (n && txt.indexOf(n) >= 0) hits.push(n.slice(0, 6) + '…');
  }
  return hits;
}

(async () => {
  console.log('='.repeat(70));
  console.log('傻子文案大师 V0.1 · 安全审计');
  console.log('='.repeat(70));
  console.log('真实 Key 已加载用于比对：' + (KEY ? '是（' + KEY.length + ' 位，不打印内容）' : '否 —— 没读到 .env'));
  console.log('');

  const needles = [KEY, KEY_PREFIX].filter(Boolean);

  /* --- 1. 前端目录：绝对不许出现 Key --- */
  const publicFiles = walk(path.join(ROOT, 'public'), []);
  let frontLeak = [];
  for (const f of publicFiles) {
    const h = scanFile(f, needles);
    if (h.length) frontLeak.push(path.relative(ROOT, f));
  }
  rec('前端文件里没有 API Key', frontLeak.length === 0, frontLeak.join(', ') || publicFiles.length + ' 个文件全部干净');

  /* --- 2. 前端里连 "sk-" 这种形状都不该有 --- */
  let shapeLeak = [];
  for (const f of publicFiles) {
    try {
      const t = fs.readFileSync(f, 'utf8');
      if (/sk-[A-Za-z0-9]{10,}/.test(t)) shapeLeak.push(path.relative(ROOT, f));
    } catch (e) { /* 忽略 */ }
  }
  rec('前端里没有密钥形状的字符串（sk-xxxx）', shapeLeak.length === 0, shapeLeak.join(', ') || '干净');

  /* --- 3. 后端源码不许硬编码 Key（脱敏函数里的占位符除外） --- */
  const codeFiles = [
    path.join(ROOT, 'server.js'),
    ...walk(path.join(ROOT, 'lib'), [])
  ];
  let codeLeak = [];
  for (const f of codeFiles) {
    const h = scanFile(f, needles);
    if (h.length) codeLeak.push(path.relative(ROOT, f));
  }
  rec('后端源码里没有硬编码 Key', codeLeak.length === 0, codeLeak.join(', ') || codeFiles.length + ' 个文件全部干净');

  /* --- 4. .env 必须在 .gitignore 里 --- */
  let gitignoreOk = false;
  let gitignoreDetail = '';
  try {
    const gi = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
    const lines = gi.split(/\r?\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith('#'));
    gitignoreOk = lines.includes('.env');
    gitignoreDetail = gitignoreOk ? '.gitignore 第 ' + (gi.split(/\r?\n/).findIndex((l) => l.trim() === '.env') + 1) + ' 行' : '没找到 .env 这一行';
  } catch (e) {
    gitignoreDetail = '.gitignore 不存在';
  }
  rec('.env 已被 .gitignore 排除', gitignoreOk, gitignoreDetail);

  /* --- 5. README / 文档里不许出现真实 Key --- */
  const docFiles = fs.readdirSync(ROOT)
    .filter((f) => /\.(md|txt|html)$/i.test(f) && f !== '.env')
    .map((f) => path.join(ROOT, f));
  let docLeak = [];
  for (const f of docFiles) {
    const h = scanFile(f, needles, true);
    if (h.length) docLeak.push(path.basename(f));
  }
  rec('README 等文档里没有真实 Key', docLeak.length === 0, docLeak.join(', ') || (docFiles.length ? docFiles.length + ' 个文档干净' : '暂无文档'));

  /* --- 6. .env.example 里只能是空值 --- */
  let exampleOk = true;
  let exampleDetail = '';
  try {
    const t = fs.readFileSync(path.join(ROOT, '.env.example'), 'utf8');
    const m = t.match(/^API_KEY=(.*)$/m);
    exampleOk = !!m && m[1].trim() === '';
    exampleDetail = exampleOk ? 'API_KEY 为空' : 'API_KEY 行有内容！';
  } catch (e) {
    exampleOk = false;
    exampleDetail = '.env.example 不存在';
  }
  rec('.env.example 里没有真实值', exampleOk, exampleDetail);

  /* --- 7. 接口响应体不许带 Key --- */
  try {
    const h = await (await fetch(BASE + '/api/health')).json();
    const s = JSON.stringify(h);
    const leak = needles.some((n) => s.indexOf(n) >= 0);
    rec('/api/health 响应里没有 Key', !leak, '字段：' + Object.keys(h).join(', '));
  } catch (e) {
    rec('/api/health 响应里没有 Key', false, '请求失败：' + e.message);
  }

  // 用一个不消耗大模型额度的路径（二次操作但没带上一版内容 → 400）
  try {
    const res = await fetch(BASE + '/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'regenerate', selection: { topic: 'daily' } })
    });
    const raw = await res.text();
    const leak = needles.some((n) => raw.indexOf(n) >= 0);
    rec('/api/generate 错误响应里没有 Key', !leak,
      'HTTP ' + res.status + '，响应体 ' + raw.length + ' 字节');
  } catch (e) {
    rec('/api/generate 错误响应里没有 Key', false, '请求失败：' + e.message);
  }

  // 真实成功生成的响应存档（由 test_scenarios.js 产出）也不许带 Key
  try {
    const p = path.join(__dirname, 'scenarios_result.json');
    if (fs.existsSync(p)) {
      const t = fs.readFileSync(p, 'utf8');
      const leak = needles.some((n) => t.indexOf(n) >= 0);
      rec('真实生成结果存档里没有 Key', !leak, leak ? '存档里出现了 Key！' : '存档 ' + t.length + ' 字节，干净');
    } else {
      rec('真实生成结果存档里没有 Key', true, '（本次未产出存档，跳过）');
    }
  } catch (e) {
    rec('真实生成结果存档里没有 Key', false, e.message);
  }

  /* --- 8. 服务端控制台日志不该带 Key（用一个脱敏函数实例自检） --- */
  const { maskSecret } = require(path.join(ROOT, 'lib', 'env.js'));
  const masked = maskSecret('Authorization: Bearer ' + KEY + ' sk-abcdefghijklmnop');
  const maskOk = masked.indexOf(KEY) < 0 && masked.indexOf('sk-abcdefghijklmnop') < 0 && masked.indexOf('sk-****') >= 0;
  rec('脱敏函数能完整遮蔽密钥', maskOk, '示例输出：' + masked.slice(0, 60));

  /* --- 9. 运行时日志文件扫描（如果有） --- */
  const logCandidates = [];
  for (const d of [ROOT, path.join(ROOT, 'logs'), path.join(ROOT, '.tmp')]) {
    try {
      for (const f of fs.readdirSync(d)) {
        if (/\.log$/i.test(f)) logCandidates.push(path.join(d, f));
      }
    } catch (e) { /* 忽略 */ }
  }
  let logLeak = [];
  for (const f of logCandidates) {
    if (scanFile(f, needles).length) logLeak.push(path.basename(f));
  }
  rec('日志文件里没有 Key', logLeak.length === 0, logLeak.join(', ') || (logCandidates.length ? logCandidates.length + ' 个日志干净' : '暂无 .log 文件'));

  const failed = checks.filter((c) => !c.pass);
  const out = {
    at: new Date().toISOString(),
    keyLoaded: !!KEY,
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks
  };
  fs.writeFileSync(path.join(__dirname, 'security_result.json'), JSON.stringify(out, null, 2), 'utf8');

  console.log('\n' + '='.repeat(70));
  console.log('安全审计：共 ' + out.summary.total + ' 项，通过 ' + out.summary.pass + ' 项，失败 ' + out.summary.fail + ' 项');
  if (failed.length) failed.forEach((f) => console.log('  ✗ ' + f.name + ' :: ' + f.detail));
  console.log('='.repeat(70));
  process.exit(failed.length ? 1 : 0);
})();
