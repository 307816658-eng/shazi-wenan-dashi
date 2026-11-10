'use strict';

/**
 * V0.3 新行业真实生成验收（会真实调用大模型，11 个行业各 1 条）
 *
 * 跑法：node tools/test_new_industries.js   （前置：node server.js 在 3100 运行）
 *
 * 每条检查：生成成功 / 行业没串 / 字数在区间 / 无违规词 / 无 AI 腔 /
 *          开头并入正文 / 标题不是照抄开头。正文完整落盘，供人工看语气。
 */

const BASE = 'http://localhost:3100';
const TIMEOUT_MS = 180000;
const GAP_MS = 20000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let total = 0, pass = 0, failed = [];
function rec(label, ok, note) {
  total++;
  if (ok) pass++; else failed.push(label + (note ? ' :: ' + note : ''));
  console.log('  [' + (ok ? 'PASS' : 'FAIL') + '] ' + label + (note ? '  ' + note : ''));
}

const { findBannedWords } = require('../lib/base');

const AI_TASTE = /(匠心|甄选|轻奢|极致|焕然一新|一站式|品质生活|尊享|黑科技|氛围感|高级感|烟火气|治愈系|赋能)/;
const ABSOLUTE = /(最低价|最便宜|最正宗|最好[看吃喝用]|唯一|顶级|极致|百分百|100%|第一品牌)/;

const CASES = [
  { ind: 'maternal', sub: 'supply', topic: 'newarrival', subject: 'clothes', goal: 'comestore', extra: '' },
  { ind: 'pet', sub: 'grooming', topic: 'single', subject: 'bath', goal: 'tryon', extra: '' },
  { ind: 'auto', sub: 'wash', topic: 'outfit', subject: 'howtoask', goal: 'learntips', extra: '' },
  { ind: 'flower', sub: 'bouquet', topic: 'festival', subject: 'valentine', goal: 'joinact', extra: '' },
  { ind: 'jewelry', sub: 'gold', topic: 'single', subject: 'coupleitem', goal: 'tryon', extra: '' },
  { ind: 'digital', sub: 'secondhand', topic: 'outfit', subject: 'howtocheck', goal: 'learntips', extra: '' },
  { ind: 'photo', sub: 'wedding', topic: 'outfit', subject: 'howtoprepare', goal: 'comestore', extra: '' },
  { ind: 'optical', sub: 'frame', topic: 'outfit', subject: 'framefit', goal: 'tryon', extra: '' },
  { ind: 'cleaning', sub: 'deep', topic: 'outfit', subject: 'howtocheck', goal: 'tryon', extra: '' },
  { ind: 'tea', sub: 'retail', topic: 'single', subject: 'greentea', goal: 'tryon', extra: '' },
  { ind: 'other', sub: 'retail', topic: 'newarrival', subject: 'several', goal: 'comestore', extra: '' }
];

async function call(body) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    let res = null, json = null;
    try {
      res = await fetch(BASE + '/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal: ctrl.signal
      });
      json = await res.json().catch(() => null);
    } catch (e) {
      json = null;
    } finally { clearTimeout(timer); }

    const limited = (res && res.status === 429) || (json && json.error && json.error.kind === 'ratelimit');
    const transient = limited || (res && [502, 503, 504].includes(res.status));
    if (transient && attempt <= 3) {
      const wait = 30 + attempt * 15;
      console.log('    上游' + (limited ? '限流' : '超时/5xx') + '，等 ' + wait + 's 重试');
      await sleep(wait * 1000);
      continue;
    }
    return { status: res ? res.status : 0, json };
  }
}

const results = [];

async function main() {
for (const c of CASES) {
  console.log('\n=== ' + c.ind + ' ===');
  const r = await call({
    action: 'generate',
    selection: {
      industry: c.ind, subType: c.sub, storeName: '',
      topic: c.topic, subject: c.subject, goal: c.goal,
      speaker: 'guide', tone: 'chat', duration: '45', extra: c.extra
    }
  });
  const ok = r.status === 200 && r.json && r.json.ok;
  rec(c.ind + ' 生成成功', !!ok, ok ? (r.json.meta.ms + 'ms · ' + r.json.meta.industry_label) :
    (r.status + ' ' + JSON.stringify(r.json && r.json.error || {}).slice(0, 100)));
  if (!ok) { await sleep(GAP_MS); continue; }

  const d = r.json.data;
  const all = (d.title || '') + '\n' + (d.hook || '') + '\n' + (d.script || '');
  // 字数按汉字口径（与产品内部 countHanzi 一致）：45 秒目标 175~215，容差 ±12
  const chars = String(d.script || '').replace(/[^\u4e00-\u9fa5]/g, '').length;

  rec(c.ind + ' 行业没串', r.json.meta.industry === c.ind, r.json.meta.industry);
  rec(c.ind + ' 汉字 160~235', chars >= 160 && chars <= 235, chars + ' 汉字');
  const banned = findBannedWords(all);
  rec(c.ind + ' 无违规词', banned.length === 0, banned.join(','));
  rec(c.ind + ' 无 AI 腔', !AI_TASTE.test(all), (all.match(AI_TASTE) || [''])[0]);
  rec(c.ind + ' 无绝对化', !ABSOLUTE.test(all), (all.match(ABSOLUTE) || [''])[0]);
  rec(c.ind + ' 开头并入正文', !!d.hook &&
    String(d.script).replace(/\s/g, '').indexOf(String(d.hook).replace(/\s/g, '').slice(0, 10)) >= 0);
  rec(c.ind + ' 标题不是照抄开头', !!d.title && d.title.trim() !== d.hook.trim());

  results.push({ ind: c.ind, meta: r.json.meta, data: d });
  console.log('    标题：' + d.title);
  console.log('    开头：' + d.hook.split('\n')[0]);
  await sleep(GAP_MS);
}

console.log('\n======================================================================');
console.log(`新行业验收：共 ${total} 项，通过 ${pass} 项，失败 ${total - pass} 项`);
failed.forEach((x) => console.log('  ✗ ' + x));
console.log('======================================================================');

try {
  const fs = require('fs');
  const path = require('path');
  const dir = path.join(__dirname, '..', '.tmp');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'v03_new_industries.json'),
    JSON.stringify({ time: new Date().toISOString(), total, pass, failed, results }, null, 2));
  console.log('完整正文已存 .tmp/v03_new_industries.json');
} catch (e) { /* 落盘失败不影响结论 */ }

process.exit(failed.length ? 1 : 0);
}

main().catch((e) => { console.error('脚本异常：', e); process.exit(1); });
