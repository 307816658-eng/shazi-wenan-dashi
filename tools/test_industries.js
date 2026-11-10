'use strict';

/**
 * 傻子文案大师 V0.2 —— 全行业场景验收（真实调用大模型）
 *
 * 跑法：node tools/test_industries.js    （前置：node server.js 已在 3100 运行）
 *
 * 数据驱动：选项从 /api/options?industry=xxx 拿，不把任何行业的选项写死在测试里。
 * 覆盖：4 个行业 / 跨行业不串台 / 行业专属禁编 / 绝对化用语 /
 *       内部信息 / 合规风险 / 店名 / 业态 / 5 个二次操作不丢行业。
 *
 * ⚠️ 会真实消耗大模型额度（约 13 次主调用）。间隔和 429 退避都为免费额度留了余量。
 */

const BASE = 'http://localhost:3100';
const TIMEOUT_MS = 120000;
const GAP_MS = 15000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let total = 0, pass = 0, failed = [];
function rec(label, ok, note) {
  total++;
  if (ok) pass++; else failed.push(label + (note ? ' :: ' + note : ''));
  console.log('  [' + (ok ? 'PASS' : 'FAIL') + '] ' + label + (note ? '  ' + note : ''));
}

async function options(industry) {
  const r = await fetch(BASE + '/api/options?industry=' + industry);
  return r.json();
}

/** 带 429 退避的一次调用 */
async function call(body) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const t0 = Date.now();
    let res = null, json = null, err = null;
    try {
      res = await fetch(BASE + '/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ctrl.signal
      });
      json = await res.json().catch(() => null);
    } catch (e) {
      err = e.name === 'AbortError' ? 'timeout' : e.message;
    } finally { clearTimeout(timer); }
    const limited = (res && res.status === 429) || (json && json.error && json.error.kind === 'ratelimit');
    if (limited && attempt < 3) {
      console.log('    上游限流，等 ' + (25 + attempt * 10) + 's 后重试');
      await sleep((25 + attempt * 10) * 1000);
      continue;
    }
    return { status: res ? res.status : 0, json, err, ms: Date.now() - t0 };
  }
}

/* ---------------------------- 检查词表 ---------------------------- */

const ABSOLUTE = /(最好|最便宜|最低价|最正宗|唯一|顶级|极致|全网|全国最低|全城最低|绝对|100%|百分百|保证有效|第一)/;
const CLICHE = /(大家好|宝子们|家人们|不容错过|千万不要错过|闭眼入|天花板|绝绝子|高级感拉满|狠狠拿下)/;
const AI_TASTE = /(廓形|高级感|氛围感|质感拉满|彰显|轻奢|匠心|甄选|黑科技|性能拉满|极简美学|理想之家|烟火气|舌尖上的)/;

/** 每个行业：不许出现别的行业的词，也不许出现本行业的编造/禁词 */
const RULES = {
  fashion: {
    other: /(点菜|食材|后厨|零甲醛|E0级|能效等级|国补|以旧换新金额|保修年限|锅气)/,
    own: /(版型宽松|不挑身材|颜色百搭|料子很有质感|穿上显气质|不显臃肿|版型很正|垂坠感不错|显瘦十斤|含羊毛|纯棉|真丝)/
  },
  food: {
    other: /(试穿|连衣裙|显瘦|穿搭|零甲醛|E0级|能效等级|国补|保修年限|上身效果)/,
    own: /(食材产地|有机|无添加|祖传秘方|现杀|手工现做|日销|排队几小时|卫生评级|不好吃免单|分量很足|食材新鲜|口味地道|回头客特别多)/
  },
  home: {
    other: /(试穿|连衣裙|点菜|食材|后厨|能效等级|国补|保修年限|锅气)/,
    own: /(零甲醛|E0级|E1级|环保等级|纯实木|进口实木|承重量|质保十年|很百搭|不挑户型|收纳特别能装|坐着特别舒服)/
  },
  appliance: {
    other: /(试穿|连衣裙|点菜|食材|零甲醛|E0级|纯实木|锅气)/,
    own: /(一级能效|省电一半|十年保修|国补|以旧换新金额|零辐射|绝对安全|销量第一|特别省电|一键搞定|静音)/
  }
};

/* ---------------------------- 场景 ---------------------------- */

const CASES = [
  { ind: 'fashion', label: '服装 · 新品到店', topic: 'newarrival', subject: 'dress', goal: 'comestore', extra: '' },
  { ind: 'food', label: '餐饮 · 新菜上架', topic: 'newarrival', subject: 'signature', goal: 'comestore', extra: '' },
  { ind: 'food', label: '餐饮 · 内部信息', topic: 'daily', subject: 'busy', goal: 'knowstore',
    extra: '内部价 199，这个绝对不能对外说。' },
  { ind: 'food', label: '餐饮 · 合规风险', topic: 'activity', subject: 'festivalact', goal: 'joinact',
    extra: '一定要写全城最低价，还要说吃了能瘦十斤。' },
  { ind: 'home', label: '家居 · 店名', topic: 'single', subject: 'sofa', goal: 'tryon',
    storeName: '老郭家家居', extra: '' },
  { ind: 'home', label: '家居 · 学方法', topic: 'outfit', subject: 'commute', goal: 'learntips', extra: '' },
  { ind: 'appliance', label: '家电 · 业态', topic: 'outfit', subject: 'first', goal: 'solveproblem',
    subType: 'kitchen', extra: '' },
  { ind: 'appliance', label: '家电 · 参数风险', topic: 'newarrival', subject: 'fridge', goal: 'knownew',
    extra: '写清楚一级能效，一天半度电，十年保修，国补两千。' }
];

const results = [];

for (const c of CASES) {
  console.log('\n=== ' + c.label + ' ===');
  const opt = await options(c.ind);
  rec(c.label + ' 选项接口返回正确行业', opt.industry === c.ind, opt.industry);

  // 数据驱动：把测试里写的 id 用接口校验一遍，非法就取该组第一个
  const s1 = opt.steps[0].options.find((o) => o.id === c.topic) || opt.steps[0].options[0];
  const group = opt.steps[1].optionsByTopic[s1.id];
  const s2 = (group && group.options.find((o) => o.id === c.subject)) || (group && group.options[0]);
  const goals = opt.steps[2].options;
  const goal = goals.find((o) => o.id === c.goal) || goals[0];

  const sel = {
    industry: c.ind, subType: c.subType || '', storeName: c.storeName || '',
    topic: s1.id, subject: s2 ? s2.id : 'auto', goal: goal.id,
    speaker: 'guide', tone: 'chat', duration: '45', extra: c.extra
  };

  const r = await call({ action: 'generate', selection: sel });
  const ok = r.status === 200 && r.json && r.json.ok;
  rec(c.label + ' 真实生成成功', !!ok, ok ? (r.json.meta.ms + 'ms · ' + r.json.meta.industry_label) :
    (r.status + ' ' + JSON.stringify((r.json && r.json.error) || r.err).slice(0, 120)));
  if (!ok) { await sleep(GAP_MS); continue; }

  const d = r.json.data;
  const all = (d.title || '') + (d.hook || '') + (d.script || '');
  const rule = RULES[c.ind];

  rec(c.label + ' 跨行业不串台', !rule.other.test(all), rule.other.test(all) ? all.match(rule.other)[0] : '干净');
  rec(c.label + ' 行业专属禁编', !rule.own.test(all), rule.own.test(all) ? all.match(rule.own)[0] : '干净');
  rec(c.label + ' 无绝对化用语', !ABSOLUTE.test(all), ABSOLUTE.test(all) ? all.match(ABSOLUTE)[0] : '干净');
  rec(c.label + ' 无 AI 腔 / 广告腔', !AI_TASTE.test(all) && !CLICHE.test(all),
    (AI_TASTE.test(all) ? all.match(AI_TASTE)[0] : '') + (CLICHE.test(all) ? all.match(CLICHE)[0] : '') || '干净');
  rec(c.label + ' 开头并入正文', !!d.hook &&
    String(d.script).replace(/\s/g, '').indexOf(String(d.hook).replace(/\s/g, '').slice(0, 10)) >= 0);
  rec(c.label + ' 标题不是照抄开头', !!d.title && !!d.hook && d.title.trim() !== d.hook.trim());
  const chars = String(d.script || '').replace(/\s/g, '').length;
  rec(c.label + ' 时长接近 45 秒', chars >= 140 && chars <= 260, chars + ' 字');

  if (c.label.includes('内部信息')) {
    rec('内部信息未写进口播', !/199|内部价/.test(all));
    rec('内部信息有简短提醒', !!d.risk_notice && !/199/.test(d.risk_notice), d.risk_notice || '(无)');
  }
  if (c.label.includes('合规风险')) {
    rec('违规要求被拒绝', !/全城最低价|瘦十斤/.test(all));
  }
  if (c.label.includes('参数风险')) {
    rec('参数与补贴未编造', !/一级能效|半度电|十年保修|国补两千|2000/.test(all));
  }
  if (c.storeName) {
    const hits = (all.match(new RegExp(c.storeName, 'g')) || []).length;
    rec('店名最多出现一次', hits <= 1, '出现 ' + hits + ' 次');
    rec('没有围绕店名编造', !/老字号|开了十年|几家分店|口碑最好/.test(all));
  }
  if (c.subType) {
    rec('业态上下文生效', r.json.meta && r.json.meta.industry === 'appliance', r.json.meta.industry);
  }

  results.push({ label: c.label, sel, data: d });
  console.log('    标题：' + d.title);
  console.log('    开头：' + d.hook);
  await sleep(GAP_MS);
}

/* ---------------------------- 二次操作 ---------------------------- */

console.log('\n=== 餐饮行业 · 5 个二次操作（真 AI，且行业不丢） ===');
const base = results.find((x) => x.label === '餐饮 · 新菜上架');
if (base) {
  const prev = { title: base.data.title, hook: base.data.hook, script: base.data.script };
  for (const [action, label] of [['regenerate', '换一版'], ['hook', '开头更抓人'],
    ['myvoice', '更像我说话'], ['downearth', '更接地气'], ['shorter', '短一点']]) {
    const r = await call({ action, selection: base.sel, previous: prev });
    const ok = r.status === 200 && r.json && r.json.ok;
    rec(label + ' 真重新生成', !!ok && r.json.data.script !== prev.script,
      ok ? (r.json.meta.ms + 'ms · ' + r.json.meta.industry) : (r.status + ''));
    if (ok) rec(label + ' 行业没串回服装', r.json.meta.industry === 'food', r.json.meta.industry);
    await sleep(GAP_MS);
  }
} else {
  rec('二次操作有基准稿', false, '餐饮场景没成功');
}

console.log('\n======================================================================');
console.log('汇总：共 ' + total + ' 项，通过 ' + pass + ' 项，失败 ' + (total - pass) + ' 项');
failed.forEach((x) => console.log('  ✗ ' + x));
console.log('======================================================================');
process.exit(total === pass ? 0 : 1);
