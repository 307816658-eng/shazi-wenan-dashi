'use strict';

/**
 * 行业包离线自检（不调用大模型，零成本）
 *
 * 跑法：node tools/test_packs_offline.js
 *
 * 查的是「结构完整性」和「内容底线」，查不出文案好不好：
 *   1. 必备字段是否齐全、类型对不对
 *   2. 11 个拍摄主题是否都有对应的第二步选项组（漏一个，用户点到就空白）
 *   3. 每组选项是否有 AI 帮我选、选项 id 是否重复
 *   4. goals / speakers 是否包含 base.js 里写死策略的 id（漏了会掉策略）
 *   5. 禁编清单、合规条款、AI 腔词表、正反例、痛点是否为空
 *   6. 行业 id 全局唯一
 */

const REG = require('../lib/industries');

const REQUIRED_GOAL_IDS = ['comestore', 'joinact', 'knownew', 'knowstore', 'remember', 'exposure', 'auto'];
const REQUIRED_SPEAKER_IDS = ['boss', 'manager', 'guide', 'multi', 'noface', 'auto'];
const REQUIRED_WORDS = ['store', 'staff', 'goods', 'customer', 'tryVerb', 'place'];

let total = 0, failed = [];
function check(pack, label, ok, note) {
  total++;
  if (!ok) failed.push(`[${pack}] ${label}${note ? ' :: ' + note : ''}`);
  if (!ok) console.log(`  ✗ [${pack}] ${label}${note ? ' :: ' + note : ''}`);
}

const packs = REG.PACKS;
const ids = Object.keys(packs);

for (const id of ids) {
  const p = packs[id];
  console.log(`\n=== ${p.label || id} (${id}) ===`);

  check(id, 'id 与注册表键一致', p.id === id, `pack.id=${p.id}`);
  check(id, 'label / emoji 非空', !!p.label && !!p.emoji);
  check(id, 'roleIntro 非空', typeof p.roleIntro === 'string' && p.roleIntro.length >= 20);

  // 业态
  check(id, 'subTypes 2~6 个', Array.isArray(p.subTypes) && p.subTypes.length >= 2 && p.subTypes.length <= 6);
  const stIds = (p.subTypes || []).map((s) => s.id);
  check(id, 'subTypes id 不重复', new Set(stIds).size === stIds.length);

  // 行业词
  const missingWords = REQUIRED_WORDS.filter((k) => !p.words || !p.words[k]);
  check(id, 'words 六个词齐全', missingWords.length === 0, missingWords.join(','));

  // 拍摄主题 + 第二步
  check(id, 'topics ≥ 8 个', Array.isArray(p.topics) && p.topics.length >= 8, `实际 ${(p.topics || []).length}`);
  const topicIds = (p.topics || []).map((t) => t.id);
  check(id, 'topics id 不重复', new Set(topicIds).size === topicIds.length);
  const missingSecond = topicIds.filter((t) => !p.second || !p.second[t]);
  check(id, '每个主题都有第二步选项组', missingSecond.length === 0, missingSecond.join(','));
  check(id, 'second 里没有多余主题', Object.keys(p.second || {}).every((k) => topicIds.includes(k)),
    Object.keys(p.second || {}).filter((k) => !topicIds.includes(k)).join(','));
  check(id, '有 auto（全交给 AI）分组', !!(p.second && p.second.auto));

  for (const t of topicIds) {
    const g = p.second && p.second[t];
    if (!g) continue;
    check(id, `「${t}」有问句`, !!g.question);
    check(id, `「${t}」选项 ≥ 4 个`, Array.isArray(g.options) && g.options.length >= 4, `实际 ${(g.options || []).length}`);
    const oIds = (g.options || []).map((o) => o.id);
    check(id, `「${t}」选项 id 不重复`, new Set(oIds).size === oIds.length);
    const noLabel = (g.options || []).filter((o) => !o.label || !String(o.label).trim());
    check(id, `「${t}」选项 label 都非空`, noLabel.length === 0, `${noLabel.length} 个空`);
    // 「auto」主题本身就是「全交给 AI」，里面不需要再放一个「AI 帮我选」
    if (t !== 'auto') {
      check(id, `「${t}」含 AI 帮我选`, oIds.includes('auto'));
    }
  }

  // 目标 / 出镜人
  const goalIds = (p.goals || []).map((g) => g.id);
  const missGoal = REQUIRED_GOAL_IDS.filter((g) => !goalIds.includes(g));
  check(id, 'goals 含全部必备目标', missGoal.length === 0, missGoal.join(','));
  check(id, 'goals id 不重复', new Set(goalIds).size === goalIds.length);
  const spIds = (p.speakers || []).map((s) => s.id);
  const missSp = REQUIRED_SPEAKER_IDS.filter((s) => !spIds.includes(s));
  check(id, 'speakers 含全部必备出镜人', missSp.length === 0, missSp.join(','));
  check(id, 'speakers id 不重复', new Set(spIds).size === spIds.length);

  // 内容底线（这几项空了，Prompt 里就是真空，模型会开始编）
  const arrs = ['forbiddenFacts', 'compliance', 'hardBannedPhrases', 'aiTasteWords', 'contentRaw', 'customerPains', 'sceneIdeas'];
  for (const k of arrs) {
    // compliance 的硬底线由 lib/base.js 的全局禁词扫描兜着，行业包给 1 条以上即可
    const min = k === 'compliance' ? 1 : 3;
    check(id, `${k} 非空且 ≥${min} 条`, Array.isArray(p[k]) && p[k].length >= min, `实际 ${(p[k] || []).length}`);
  }
  check(id, 'tasteReplacements ≥3 条', Array.isArray(p.tasteReplacements) && p.tasteReplacements.length >= 3);
  check(id, 'badExample / goodExample 非空', !!p.badExample && !!p.goodExample);
  check(id, 'titleBad / titleGood 非空', !!p.titleBad && !!p.titleGood);
  check(id, 'realExample 非空（有对照样本）', typeof p.realExample === 'string' && p.realExample.length > 80);
  check(id, 'goalOverrides 覆盖 tryon/learntips/solveproblem',
    !!p.goalOverrides && ['tryon', 'learntips', 'solveproblem'].every((k) => !!p.goalOverrides[k]));

  // 禁编清单里不许出现「可以编价格」这类反向内容（低级错误防呆）
  const badHint = (p.forbiddenFacts || []).filter((x) => /可以说|允许|不限制/.test(x));
  check(id, 'forbiddenFacts 没有反向表述', badHint.length === 0, badHint.join('|'));
}

// 全局唯一性
check('*', '行业 id 全局唯一', new Set(ids).size === ids.length);

console.log('\n======================================================================');
console.log(`行业包自检：共 ${total} 项，通过 ${total - failed.length} 项，失败 ${failed.length} 项`);
if (failed.length) failed.forEach((f) => console.log('  ✗ ' + f));
console.log('======================================================================');
process.exit(failed.length ? 1 : 0);
