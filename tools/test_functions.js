'use strict';

/**
 * 本地验证 Cloudflare 版逻辑 —— 不部署就能先跑通
 *
 * 跑法：node tools/test_functions.js
 *
 * 原理：Cloudflare Pages Functions 只是薄薄一层包装，真正的逻辑在 lib/core.js。
 * 这个脚本模拟 Cloudflare 传进来的 context.env，直接调 core，
 * 验证「同一份代码在没有 Node 内置模块的环境里也能跑」。
 *
 * 这样上云之前就能确认：配置读取、Prompt 组装、字数校正、错误兜底全是通的。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const core = require(path.join(ROOT, 'lib', 'core.js'));

/* ---- 模拟 Cloudflare 的 context.env（本地从 .env 读，两者键名完全一致） ---- */
function fakeCloudflareEnv() {
  const env = {};
  try {
    const txt = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
    for (const line of txt.split(/\r?\n/)) {
      const s = line.trim();
      if (!s || s.startsWith('#')) continue;
      const i = s.indexOf('=');
      if (i === -1) continue;
      env[s.slice(0, i).trim()] = s.slice(i + 1).trim();
    }
  } catch (e) {
    console.log('读不到 .env：' + e.message);
  }
  return env;
}

const checks = [];
function rec(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
  console.log((pass ? '[PASS] ' : '[FAIL] ') + name + (detail ? '  —— ' + detail : ''));
}

function looksLikeResponse(body) {
  return body && typeof body === 'object' && typeof body.ok === 'boolean';
}

(async () => {
  const env = fakeCloudflareEnv();
  console.log('='.repeat(66));
  console.log('Cloudflare 版逻辑本地验证（走 lib/core.js，与线上同一份代码）');
  console.log('='.repeat(66));
  console.log('模拟 context.env：API_KEY=' + (env.API_KEY ? '已注入(' + env.API_KEY.length + '位)' : '缺失') +
    '  MODEL=' + (env.MODEL_NAME || '缺失'));
  console.log('');

  /* --- 1. 确认 core 没有拖进任何 Node 内置模块 --- */
  const coreSrc = fs.readFileSync(path.join(ROOT, 'lib', 'core.js'), 'utf8');
  const llmSrc = fs.readFileSync(path.join(ROOT, 'lib', 'llm.js'), 'utf8');
  const badRequire = /require\(['"](fs|path|os|http|https|child_process|url)['"]\)/;
  rec('core.js 没有 require Node 内置模块', !badRequire.test(coreSrc),
    (coreSrc.match(badRequire) || ['无'])[0]);
  rec('llm.js 没有 require Node 内置模块', !badRequire.test(llmSrc),
    (llmSrc.match(badRequire) || ['无'])[0]);

  const promptsSrc = fs.readFileSync(path.join(ROOT, 'lib', 'prompts.js'), 'utf8');
  const taxSrc = fs.readFileSync(path.join(ROOT, 'lib', 'taxonomy.js'), 'utf8');
  rec('prompts.js 没有 require Node 内置模块', !badRequire.test(promptsSrc));
  rec('taxonomy.js 没有 require Node 内置模块', !badRequire.test(taxSrc));

  /* --- 2. /api/options --- */
  const opt = core.handleOptions();
  rec('/api/options 返回结构正确',
    opt.status === 200 && looksLikeResponse(opt.body) && Array.isArray(opt.body.steps) && opt.body.steps.length === 6,
    'status=' + opt.status + ' steps=' + (opt.body.steps ? opt.body.steps.length : '?'));

  /* --- 3. /api/health --- */
  const hea = core.handleHealth(env);
  rec('/api/health 返回 configured=true',
    hea.status === 200 && hea.body.configured === true,
    'model=' + hea.body.model + ' runtime=' + hea.body.runtime);
  rec('/api/health 不泄露密钥', JSON.stringify(hea.body).indexOf(env.API_KEY) < 0, '响应体干净');

  /* --- 4. 配置缺失时的行为 --- */
  const empty = core.handleHealth({});
  rec('配置缺失时不报错、只标记未配置', empty.body.configured === false && empty.body.missing.length === 3,
    'missing=' + empty.body.missing.join(','));
  const noCfg = await core.handleGenerate({}, { action: 'generate', selection: {} });
  rec('配置缺失时生成接口返回友好提示而非崩溃',
    noCfg.status === 503 && noCfg.body.ok === false && noCfg.body.error.kind === 'config',
    JSON.stringify(noCfg.body.error));

  /* --- 5. 参数校验 --- */
  const noPrev = await core.handleGenerate(env, { action: 'regenerate', selection: { topic: 'daily' } });
  rec('二次操作缺上一版内容时返回 400 且不调 AI',
    noPrev.status === 400 && noPrev.body.error.kind === 'input',
    JSON.stringify(noPrev.body.error));

  /* --- 6. 真实生成（这一步会真的花钱，但必须验证） --- */
  console.log('\n真实调用一次大模型（走 core，不经过 HTTP）…');
  const t0 = Date.now();
  const gen = await core.handleGenerate(env, {
    action: 'generate',
    selection: { topic: 'newarrival', subject: 'dress', goal: 'comestore', speaker: 'guide', tone: 'chat', duration: '45', extra: '' }
  });
  const ms = Date.now() - t0;

  if (gen.status === 200 && gen.body.ok) {
    const d = gen.body.data;
    console.log('  耗时 ' + (ms / 1000).toFixed(1) + 's   正文 ' + gen.body.meta.chars + ' 汉字' +
      (gen.body.meta.corrected ? '（字数校正 ' + gen.body.meta.chars_before + ' -> ' + gen.body.meta.chars + '）' : ''));
    console.log('  ── 标题：' + d.title);
    console.log('  ── 开头：' + d.hook);
    console.log('  ── 正文：' + String(d.script).replace(/\n/g, ' / ').slice(0, 160) + '…');
    rec('经 core 真实生成成功', d.title && d.hook && d.script && d.script.length > 50);
    rec('返回体里没有密钥', JSON.stringify(gen.body).indexOf(env.API_KEY) < 0);
  } else {
    rec('经 core 真实生成成功', false, 'status=' + gen.status + ' ' + JSON.stringify(gen.body.error || {}));
  }

  /* --- 7. Functions 文件确实是薄包装 --- */
  for (const f of ['generate', 'options', 'health']) {
    const p = path.join(ROOT, 'functions', 'api', f + '.js');
    const src = fs.readFileSync(p, 'utf8');
    const hasExport = /export\s+(async\s+)?function\s+onRequest/.test(src);
    const importsCore = /from\s+['"]\.\.\/\.\.\/lib\/core\.js['"]/.test(src);
    const thin = src.split('\n').length < 80;
    rec('functions/api/' + f + '.js 是薄包装（导出 handler + import core）', hasExport && importsCore && thin,
      'export=' + hasExport + ' importCore=' + importsCore + ' 行数=' + src.split('\n').length);
  }

  const failed = checks.filter((c) => !c.pass);
  console.log('\n' + '='.repeat(66));
  console.log('共 ' + checks.length + ' 项，通过 ' + (checks.length - failed.length) + ' 项，失败 ' + failed.length + ' 项');
  if (failed.length) failed.forEach((f) => console.log('  ✗ ' + f.name + ' :: ' + f.detail));
  console.log('='.repeat(66));

  fs.writeFileSync(path.join(__dirname, 'functions_result.json'),
    JSON.stringify({ at: new Date().toISOString(), checks }, null, 2), 'utf8');
  process.exit(failed.length ? 1 : 0);
})();
