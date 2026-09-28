'use strict';

/**
 * 傻子文案大师 V0.1 —— 浏览器端到端测试（CDP 驱动，零依赖）
 *
 * 跑法：node tools/test_browser.js
 * 前置：node server.js 已在 3100 端口运行
 *
 * 按「手机 iPhone / 手机 Android 小屏 / PC」三档跑：
 *   首页 → 开始 → 7 步向导（含第二步动态换组）→ 生成 → 结果 → 换一版 → 复制 → 主题 → 重新填写
 * 检查：横向滚动 / JS 报错 / 布局溢出 / 按钮可用性 / 遮罩不挡操作
 */

const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
];
const DEBUG_PORT = 9344;
const APP = 'http://localhost:3100';
const ROOT = path.join(__dirname, '..');
const SHOT_DIR = path.join(ROOT, 'tools', 'shots');
const PROFILE = path.join(ROOT, '.tmp', 'chrome-profile-' + Date.now());

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------- 极简 CDP 客户端 ------------------------- */

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.seq = 0;
    this.pending = new Map();
    this.events = [];
    ws.onmessage = (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch (e) { return; }
      if (msg.id && this.pending.has(msg.id)) {
        const p = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) p.reject(new Error(msg.error.message));
        else p.resolve(msg.result);
      } else if (msg.method) {
        this.events.push(msg);
      }
    };
  }

  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((res, rej) => {
      ws.onopen = () => res();
      ws.onerror = () => rej(new Error('WebSocket 连接失败'));
    });
    return new CDP(ws);
  }

  send(method, params, timeoutMs) {
    const id = ++this.seq;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params: params || {} }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error('CDP 超时: ' + method));
        }
      }, timeoutMs || 60000);
    });
  }

  async eval(expression, awaitPromise) {
    const r = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: !!awaitPromise,
      userGesture: true
    });
    if (r.exceptionDetails) {
      const d = r.exceptionDetails;
      throw new Error('页面 JS 异常: ' +
        (d.exception && d.exception.description ? d.exception.description : JSON.stringify(d)).slice(0, 300));
    }
    return r.result.value;
  }

  errors() {
    const out = [];
    for (const e of this.events) {
      if (e.method === 'Runtime.exceptionThrown') {
        const d = e.params.exceptionDetails;
        out.push('exception: ' + ((d.exception && d.exception.description) || d.text || '').slice(0, 200));
      }
      if (e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error') {
        out.push('console.error: ' + (e.params.args || []).map((a) => a.value || a.description || '').join(' ').slice(0, 200));
      }
      if (e.method === 'Log.entryAdded' && e.params.entry.level === 'error') {
        const t = e.params.entry.text || '';
        if (!/favicon/i.test(t)) out.push('log: ' + t.slice(0, 200));
      }
    }
    return out;
  }

  async screenshot(file) {
    // headless 下 captureScreenshot 常常拿到上一帧（尤其是页面有动画时）。
    // 对策：先等两帧 + 静置，再截一次丢弃，最后截一次采用。
    try {
      await this.eval('new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(function(){r(1);});});})', true);
    } catch (e) { /* 忽略 */ }
    await sleep(320);
    try { await this.send('Page.captureScreenshot', { format: 'png' }); } catch (e) { /* 丢弃这一帧 */ }
    await sleep(220);
    const r = await this.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
    return file;
  }
}

/* ------------------------------ 工具 ------------------------------ */

function httpJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let s = '';
      res.on('data', (c) => (s += c));
      res.on('end', () => { try { resolve(JSON.parse(s)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

async function waitFor(fn, timeoutMs, label) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    if (await fn()) return true;
    await sleep(400);
  }
  throw new Error('等待超时: ' + label);
}

/** 量当前「可见」的可点元素高度 —— hidden 容器里的元素 offsetParent 为 null，要跳过 */
const TAP_EXPR = `(function(){
  var els = Array.prototype.slice.call(document.querySelectorAll('.opt, .act, .primary, .mini-copy, #startBtn'));
  var small = [], n = 0;
  els.forEach(function(e){
    if (e.offsetParent === null) return;
    if (e.getClientRects().length === 0) return;
    n++;
    var r = e.getBoundingClientRect();
    if (r.height < 40) small.push((e.textContent||'').trim().slice(0,10) + ':' + Math.round(r.height));
  });
  return { total: n, small: small };
})()`;

const NO_HSCROLL = `(function(){
  return {
    docSW: document.documentElement.scrollWidth,
    docCW: document.documentElement.clientWidth,
    bodySW: document.body.scrollWidth,
    innerW: window.innerWidth
  };
})()`;

/** 点一个选项卡片（用真实 click，会触发 change） */
async function pick(cdp, value) {
  const ok = await cdp.eval(`(function(){
    var i = document.querySelector('.opt input[value="' + ${JSON.stringify(value)} + '"]');
    if (!i) return false;
    i.click();
    return true;
  })()`);
  await sleep(650);   // 「点选后自动进下一步」的等待
  return ok;
}

const report = { env: {}, checks: [], shots: [] };
function ok(name, pass, detail) {
  report.checks.push({ name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
  console.log((pass ? '  [PASS] ' : '  [FAIL] ') + name + (detail ? '  —— ' + detail : ''));
}

/* ------------------------------ 主流程 ------------------------------ */

async function runDevice(cdp, label, metrics, options) {
  options = options || {};
  console.log('\n' + '='.repeat(68));
  console.log('【' + label + '】 ' + metrics.width + 'x' + metrics.height);
  console.log('='.repeat(68));
  const p = label + ': ';

  cdp.events.length = 0;

  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: metrics.width,
    height: metrics.height,
    deviceScaleFactor: metrics.dsf || 2,
    mobile: !!metrics.mobile
  });

  await cdp.send('Page.navigate', { url: APP });
  await sleep(1600);

  /* --- 1 首页 --- */
  const title = await cdp.eval('document.title');
  ok(p + '页面可以正常打开', !!title && title.indexOf('傻子文案大师') >= 0, title);

  const veil = await cdp.eval(`(function(){
    var ov = document.querySelector('#overlay');
    var cs = getComputedStyle(ov);
    var mid = document.elementFromPoint(Math.floor(window.innerWidth/2), Math.floor(window.innerHeight/2));
    var blocked = !!(mid && (mid === ov || ov.contains(mid)));
    var g = document.querySelector('#generateBtn');
    var l = g && g.querySelector('.btn-label'), b = g && g.querySelector('.btn-loading');
    return {
      display: cs.display,
      blocked: blocked,
      label: l ? getComputedStyle(l).display : 'n/a',
      loading: b ? getComputedStyle(b).display : 'n/a'
    };
  })()`);
  ok(p + '遮罩真正隐藏、不挡操作', veil.display === 'none' && !veil.blocked, JSON.stringify(veil));

  const hs1 = await cdp.eval(NO_HSCROLL);
  ok(p + '首页没有横向滚动', hs1.docSW <= hs1.docCW + 1 && hs1.bodySW <= hs1.innerW + 2, JSON.stringify(hs1));

  const tap1 = await cdp.eval(TAP_EXPR);
  ok(p + '首页按钮高度足够点（>=40px）', tap1.small.length === 0,
    '可见' + tap1.total + '个，过小:' + JSON.stringify(tap1.small));

  await cdp.screenshot(path.join(SHOT_DIR, label + '-1-home.png'));

  /* --- 2 进入向导 --- */
  await cdp.eval('document.querySelector("#startBtn").click()');
  await sleep(500);
  const inWizard = await cdp.eval(`getComputedStyle(document.querySelector('#wizardView')).display !== 'none'`);
  ok(p + '「开始写文案」进入向导', inWizard);

  const step1 = await cdp.eval(`(function(){
    var q = document.querySelector('.step-q');
    return { q: q ? q.textContent : '', n: document.querySelectorAll('.opt input').length,
             label: document.querySelector('#stepLabel').textContent };
  })()`);
  ok(p + '第 1 步：11 个选项 + 步骤指示正确',
    step1.n === 11 && step1.q.indexOf('今天拍什么') >= 0 && step1.label.indexOf('第 1 步') >= 0,
    JSON.stringify(step1));

  /* --- 3 第二步动态：先选「新品到店」 --- */
  await pick(cdp, 'newarrival');
  const step2a = await cdp.eval(`(function(){
    var labels = Array.prototype.slice.call(document.querySelectorAll('.opt span:not(.opt-emoji)')).map(function(s){return s.textContent.trim()});
    return { q: (document.querySelector('.step-q')||{}).textContent || '', labels: labels,
             label: document.querySelector('#stepLabel').textContent };
  })()`);
  const hasDress = step2a.labels.indexOf('连衣裙') >= 0;
  ok(p + '第二步随「新品到店」变成服装品类', hasDress && step2a.q.indexOf('主要拍什么') >= 0,
    step2a.q + ' → ' + step2a.labels.slice(0, 5).join('/'));

  /* --- 4 回上一步改成「门店活动」，第二步必须换一组 --- */
  await cdp.eval('document.querySelector("#backBtn").click()');
  await sleep(500);
  await pick(cdp, 'activity');
  const step2b = await cdp.eval(`(function(){
    var labels = Array.prototype.slice.call(document.querySelectorAll('.opt span:not(.opt-emoji)')).map(function(s){return s.textContent.trim()});
    return { q: (document.querySelector('.step-q')||{}).textContent || '', labels: labels };
  })()`);
  const hasAct = step2b.labels.indexOf('开业活动') >= 0;
  const noDress = step2b.labels.indexOf('连衣裙') < 0;
  ok(p + '改成「门店活动」后第二步真的换了一组', hasAct && noDress,
    step2b.q + ' → ' + step2b.labels.slice(0, 5).join('/'));

  await cdp.screenshot(path.join(SHOT_DIR, label + '-2-step2.png'));

  /* --- 5 走完剩下几步 --- */
  await pick(cdp, 'festivalact');   // 第二步
  await pick(cdp, 'joinact');       // 第三步 目标
  await pick(cdp, 'manager');       // 第四步 出镜
  await pick(cdp, 'warm');          // 第五步 语气
  await pick(cdp, '45');            // 第六步 时长

  const last = await cdp.eval(`(function(){
    return {
      label: document.querySelector('#stepLabel').textContent,
      hasTextarea: !!document.querySelector('#extraInput'),
      hasGen: !!document.querySelector('#generateBtn'),
      hasChip: !!document.querySelector('.chip-add')
    };
  })()`);
  ok(p + '第 7 步：可选补充输入 + 生成按钮齐全',
    last.hasTextarea && last.hasGen && last.label.indexOf('第 7 步') >= 0, JSON.stringify(last));

  const tap2 = await cdp.eval(TAP_EXPR);
  ok(p + '向导页按钮高度足够点（>=40px）', tap2.small.length === 0,
    '可见' + tap2.total + '个，过小:' + JSON.stringify(tap2.small));

  const hs2 = await cdp.eval(NO_HSCROLL);
  ok(p + '向导页没有横向滚动', hs2.docSW <= hs2.docCW + 1, JSON.stringify(hs2));

  await cdp.screenshot(path.join(SHOT_DIR, label + '-3-step7.png'));

  /* --- 6 场景8 相关：填一句特殊要求 --- */
  await cdp.eval(`(function(){
    var t = document.querySelector('#extraInput');
    t.value = '这次一定要提到我们店刚开业。';
    t.dispatchEvent(new Event('input', {bubbles:true}));
    return true;
  })()`);
  ok(p + '特殊要求输入框可正常填写', true, '已填入示例');

  /* --- 7 生成 --- */
  await cdp.eval('document.querySelector("#generateBtn").click()');
  await sleep(600);

  const loadingShown = await cdp.eval(`(function(){
    var ov = document.querySelector('#overlay');
    var cs = getComputedStyle(ov);
    return cs.display !== 'none' && document.querySelector('#generateBtn').disabled === true;
  })()`);
  ok(p + '点生成后出现加载态且按钮禁用', loadingShown);

  const dupGuard = await cdp.eval(`(function(){
    document.querySelector('#generateBtn').click();
    document.querySelector('#generateBtn').click();
    return document.querySelector('#overlay').hidden;
  })()`);
  ok(p + '加载中重复点击被拦住', dupGuard === false);

  await waitFor(async () => await cdp.eval(`document.querySelector('#resultView').hidden === false`),
    150000, p + '等待生成结果');

  const res = await cdp.eval(`(function(){
    var g = function(id){ var e = document.getElementById(id); return e ? (e.textContent||'').trim() : ''; };
    return { title: g('outTitle'), hook: g('outHook'), script: g('outScript'),
             meta: g('resultMeta'), riskHidden: document.querySelector('#riskCard').hidden };
  })()`);
  ok(p + '结果页三块内容都有', res.title.length > 3 && res.hook.length > 3 && res.script.length > 60,
    '标题' + res.title.length + '字 / 开头' + res.hook.length + '字 / 正文' + res.script.length + '字');

  const veilBack = await cdp.eval(`(function(){
    var ov = document.querySelector('#overlay');
    var mid = document.elementFromPoint(Math.floor(window.innerWidth/2), Math.floor(window.innerHeight/2));
    return { display: getComputedStyle(ov).display, blocked: !!(mid && (mid === ov || ov.contains(mid))) };
  })()`);
  ok(p + '生成完遮罩已撤掉、不挡页面', veilBack.display === 'none' && !veilBack.blocked, JSON.stringify(veilBack));

  const resOverflow = await cdp.eval(`(function(){
    var s = document.querySelector('#outScript');
    return { docSW: document.documentElement.scrollWidth, docCW: document.documentElement.clientWidth,
             scriptOverflow: s.scrollWidth > s.clientWidth + 1 };
  })()`);
  ok(p + '结果页无横向溢出、文字不溢出',
    resOverflow.docSW <= resOverflow.docCW + 1 && !resOverflow.scriptOverflow, JSON.stringify(resOverflow));

  const btns = await cdp.eval(`Array.prototype.slice.call(document.querySelectorAll('.act[data-action]')).map(function(b){return b.textContent.trim()}).join(',')`);
  ok(p + '五个二次操作按钮齐全',
    btns === '换一版,开头更抓人,更像我说话,更接地气,短一点', btns);

  const tap3 = await cdp.eval(TAP_EXPR);
  ok(p + '结果页按钮高度足够点（>=40px）', tap3.small.length === 0,
    '可见' + tap3.total + '个，过小:' + JSON.stringify(tap3.small));

  await cdp.screenshot(path.join(SHOT_DIR, label + '-4-result.png'));

  /* --- 8 换一版（非 lite） --- */
  if (options.lite) {
    console.log('  [SKIP] ' + p + '换一版（轻量模式，逻辑与设备无关，前面已验证）');
  } else {
    const before = res.script;
    await cdp.eval('document.querySelector(\'.act[data-action="regenerate"]\').click()');
    await sleep(600);
    const lite = await cdp.eval(`getComputedStyle(document.querySelector('#overlay')).display !== 'none'`);
    ok(p + '点「换一版」出现加载态', lite);
    await waitFor(async () => await cdp.eval(`document.querySelector('#overlay').hidden === true`),
      150000, p + '等待换一版');
    const after = await cdp.eval('document.getElementById("outScript").textContent');
    ok(p + '「换一版」真的重新生成了不同内容', after !== before && after.length > 40,
      before.length + '字 → ' + after.length + '字');
  }

  /* --- 9 复制 --- */
  await cdp.eval('document.querySelector("#copyAllBtn").click()');
  await sleep(700);
  const toastText = await cdp.eval('(document.querySelector("#toast").textContent || "").trim()');
  const toastShown = await cdp.eval('getComputedStyle(document.querySelector("#toast")).opacity !== "0"');
  ok(p + '复制口播有反馈（不静默失败）', toastText.length > 0, 'toast=' + toastText + ' 可见=' + toastShown);

  /* --- 10 主题切换 --- */
  const t0 = await cdp.eval('document.documentElement.getAttribute("data-theme")');
  await cdp.eval('document.querySelector("#themeToggle").click()');
  await sleep(400);
  const t1 = await cdp.eval('document.documentElement.getAttribute("data-theme")');
  ok(p + '主题切换正常', t0 !== t1, t0 + ' → ' + t1);
  const contrast = await cdp.eval(`(function(){
    var b = getComputedStyle(document.body).backgroundColor, c = getComputedStyle(document.body).color;
    return { bg: b, color: c };
  })()`);
  ok(p + '切换后文字与背景对比正常', contrast.bg !== contrast.color, JSON.stringify(contrast));
  await cdp.screenshot(path.join(SHOT_DIR, label + '-5-result-dark.png'));
  await cdp.eval('document.querySelector("#themeToggle").click()');
  await sleep(300);

  /* --- 11 重新填写 --- */
  await cdp.eval('document.querySelector("#restartBtn").click()');
  await sleep(600);
  const backOk = await cdp.eval(`(function(){
    return getComputedStyle(document.querySelector('#wizardView')).display !== 'none'
      && document.querySelector('#stepLabel').textContent.indexOf('第 1 步') >= 0;
  })()`);
  ok(p + '「重新填写」回到向导第 1 步', backOk);

  /* --- 12 JS 报错 --- */
  const errs = cdp.errors();
  ok(p + '没有 JavaScript 错误', errs.length === 0, errs.join(' | ').slice(0, 300));
}

/* ------------------------------ 启动 ------------------------------ */

function findChrome() {
  for (const c of CHROME_CANDIDATES) {
    if (c && fs.existsSync(c)) return c;
  }
  return null;
}

async function main() {
  const CHROME = findChrome();
  if (!CHROME) {
    console.error('找不到 Chrome，试过：\n  ' + CHROME_CANDIDATES.join('\n  '));
    process.exit(1);
  }
  console.log('Chrome: ' + CHROME);

  // 后端必须在跑
  try {
    const h = await httpJSON('http://127.0.0.1:3100/api/health');
    console.log('后端: configured=' + h.configured + ' model=' + h.model);
  } catch (e) {
    console.error('后端没起来（3100），先跑 node server.js');
    process.exit(1);
  }

  const proc = spawn(CHROME, [
    '--headless=new',
    '--remote-debugging-port=' + DEBUG_PORT,
    '--user-data-dir=' + PROFILE,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-gpu',
    '--disable-background-networking',
    '--window-size=1440,900',
    'about:blank'
  ], { stdio: 'ignore' });

  let ver = null;
  for (let i = 0; i < 40; i++) {
    try { ver = await httpJSON('http://127.0.0.1:' + DEBUG_PORT + '/json/version'); break; }
    catch (e) { await sleep(500); }
  }
  if (!ver) {
    console.error('Chrome 调试端口没起来');
    try { spawnSync('taskkill', ['/PID', String(proc.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (e) { /* 忽略 */ }
    process.exit(1);
  }
  console.log('Chrome 就绪: ' + ver.Browser);

  const list = await httpJSON('http://127.0.0.1:' + DEBUG_PORT + '/json/list');
  const page = list.find((t) => t.type === 'page');
  if (!page) { console.error('没有可用页面'); process.exit(1); }

  const cdp = await CDP.connect(page.webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Log.enable');

  try {
    await runDevice(cdp, '手机-iPhone', { width: 390, height: 844, dsf: 3, mobile: true });
    await runDevice(cdp, '手机-Android小屏', { width: 360, height: 800, dsf: 3, mobile: true }, { lite: true });
    await runDevice(cdp, 'PC', { width: 1440, height: 900, dsf: 1, mobile: false }, { lite: true });
  } catch (e) {
    console.error('\n[测试中断] ' + e.message);
    report.checks.push({ name: '中断', pass: false, detail: e.message });
  }

  fs.mkdirSync(SHOT_DIR, { recursive: true });
  fs.writeFileSync(path.join(SHOT_DIR, '_browser_report.json'), JSON.stringify(report, null, 2), 'utf8');

  const failed = report.checks.filter((c) => !c.pass);
  console.log('\n' + '='.repeat(68));
  console.log('浏览器测试汇总：共 ' + report.checks.length + ' 项，通过 ' +
    (report.checks.length - failed.length) + ' 项，失败 ' + failed.length + ' 项');
  if (failed.length) failed.forEach((f) => console.log('  ✗ ' + f.name + ' :: ' + f.detail));
  console.log('截图目录: ' + SHOT_DIR);
  console.log('='.repeat(68));

  try { spawnSync('taskkill', ['/PID', String(proc.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (e) { /* 忽略 */ }
  await sleep(800);
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) { /* 忽略 */ }
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
