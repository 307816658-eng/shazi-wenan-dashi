'use strict';

/**
 * Prompt 引擎 —— V0.2 全行业版
 *
 * 分层：
 *   lib/base.js             通用底座、通用铁律、策略生成器、systemPrompt()
 *   lib/industries/*.js     每个行业的选项与专属知识（禁编、合规、AI 腔、正反例、原料）
 *   lib/prompts.js（本文件） 只负责把「这次的选择 + 行业包」组装成消息
 *
 * 三条硬约束：
 *   1. 用户全程只点选，没有任何具体事实 → 内容价值必须来自场景/方法/痛点/感受，绝不靠编数字
 *   2. 生成、5 个二次操作、字数校正，三处都必须注入同一个行业包，否则会串回默认行业
 *   3. 店名完全可选；不填时一律「我们店」，填了也只准原样出现一次
 */

const T = require('./taxonomy');
const BASE = require('./base');

/* ============================ 兼容导出 ============================ */

const DURATION_RANGE = BASE.DURATION_RANGE;
const LENGTH_TOLERANCE = BASE.LENGTH_TOLERANCE;
const SENTENCE_HINT = BASE.SENTENCE_HINT;

/** 默认系统提示词（服装），仅供旧脚本引用；实际运行都用 systemPrompt(pack, storeName) */
const SYSTEM_PROMPT = BASE.systemPrompt(T.getPack(T.DEFAULT_INDUSTRY), '');

/** 生成带行业上下文的系统提示词 */
function systemPrompt(sel) {
  return BASE.systemPrompt(T.getPack(sel.industry), sel.storeName);
}

/* ============================ 用户提示词 ============================ */

/** 把「AI 帮我选」翻译成一句让模型自己判断的指令，而不是丢弃这一项 */
function orAuto(label, id, selfTask) {
  return id === 'auto' ? `AI 帮我选（这一项由${selfTask}）` : label;
}

function subjectText(sel) {
  const label = T.subjectLabel(sel.topic, sel.subject, sel.industry);
  if (sel.subject === 'auto' || !label) {
    return 'AI 帮我选（你自己根据上面的大方向判断具体拍什么）';
  }
  return label;
}

/** 拼「这次的选择」区块 —— 这是模型能拿到的全部信息 */
function selectionBlock(sel) {
  const ind = sel.industry;
  const pack = T.getPack(ind);
  const sub = sel.subType ? T.subTypeLabel(sel.subType, ind) : '';

  const lines = [
    `【门店类型】${pack.label}${sub ? ' · ' + sub : ''}`,
    `【门店称呼】${sel.storeName ? '店名「' + sel.storeName + '」（最多原样出现一次，其余一律用「我们店」）' : '没有店名，一律用「我们店」「店里」'}`,
    `【大方向】${sel.topic === 'auto' ? 'AI 帮我选（你自己判断今天这条拍什么方向最合适）' : T.topicLabel(sel.topic, ind)}`,
    `【具体拍什么】${subjectText(sel)}`,
    `【这条想让顾客干什么】${orAuto(T.goalLabel(sel.goal, ind), sel.goal, '你自己判断这条视频最该让顾客做什么')}`,
    `【谁出镜】${orAuto(T.speakerLabel(sel.speaker, ind), sel.speaker, '你自己判断谁出镜最合适')}`,
    `【怎么说】${orAuto(T.toneLabel(sel.tone), sel.tone, '你自己判断哪种语气最合适')}`,
    `【时长】${sel.duration} 秒 → ${SENTENCE_HINT[sel.duration]}，正文汉字数落在 ${T.DURATION_WORDS[sel.duration]} 之间`
  ];
  return lines.join('\n');
}

/** 拼「写作要求」区块 —— 只把被选中的策略带进来，不是全塞 */
function strategyBlock(sel) {
  const pack = T.getPack(sel.industry);
  const parts = [];

  const goals = BASE.buildGoalStrategy(pack);
  const speakers = BASE.buildSpeakerStrategy(pack);
  const tones = BASE.buildToneStrategy(pack);

  if (goals[sel.goal]) parts.push('【这条视频的目标 —— 怎么写】\n' + goals[sel.goal]);
  if (speakers[sel.speaker]) parts.push('【出镜人 —— 口吻怎么写】\n' + speakers[sel.speaker]);
  if (tones[sel.tone]) parts.push('【语气 —— 怎么说话】\n' + tones[sel.tone]);

  const hint = (pack.subjectHint || {})[sel.subject];
  if (hint) parts.push('【内容方向】\n' + hint);

  // 「学一个方法」「解决一个问题」这两类，给一点真正能用的行业原料
  if (sel.goal === 'learntips' || sel.goal === 'solveproblem') {
    parts.push(`【可以用的${pack.label}行业方法（只是思路，不是让你照抄）】\n` +
      (pack.contentRaw || []).map((x) => '· ' + x).join('\n') +
      `\n\n【顾客最常见的坑（可以拿来当痛点，但不要编具体产品）】\n` +
      (pack.customerPains || []).map((x) => '· ' + x).join('\n'));
  }

  return parts.join('\n\n');
}

function extraBlock(sel) {
  return sel.extra
    ? `【用户补充的特别说明】\n${sel.extra}`
    : '【用户补充的特别说明】\n（没有补充）';
}

/**
 * 生成场景：用户走完 7 步，点「生成我的文案」
 */
function buildGenerateMessages(rawSelection) {
  const sel = T.normalizeSelection(rawSelection);

  const user = `以下是这位门店人员这次的全部选择：
${selectionBlock(sel)}

${strategyBlock(sel)}

${extraBlock(sel)}

【开始之前，最后提醒一次】
1. 这位用户**没有提供任何具体事实**。
   你没有价格、没有参数、没有规格、没有活动细则、没有销量 —— 这些一个都不许编。
   主题名只表示「想拍这个话题」，不代表店里真有对应的活动或优惠。
   请靠场景、方法、痛点、感受来把内容写扎实。
2. script 的汉字数必须落在 ${T.DURATION_WORDS[sel.duration]} 字之间（标点不算）。
   写完真的数一遍，填进 word_count，超了就删、少了就补，确认无误再输出。
3. 只输出 JSON。`;

  return [
    { role: 'system', content: systemPrompt(sel) },
    { role: 'user', content: user }
  ];
}

/* ======================= 二次操作（全部真调 AI） ======================= */

const ACTION_LABEL = {
  regenerate: '换一版',
  hook: '开头更抓人',
  myvoice: '更像我说话',
  downearth: '更接地气',
  shorter: '短一点'
};

const REFINE_INSTRUCTION = {
  regenerate: (sel) => `【本次任务：换一版】

把这条口播重新写一版。
· 和上一版**不能只是换几个词**，要换一种真的讲法。
· 换一个开头、换一个切入角度、换一套说法。
· 如果一时想不到新角度，从下面挑一个和上一版不同的：
  · 从一个具体的生活场景切入
  · 从一个提问切入
  · 从一句大实话切入
  · 从一个反常识的说法切入
  · 直接从一个具体的动作切入
· title 也要跟着换，不要沿用上一版的标题。
· 长度保持：约 ${T.DURATION_WORDS[sel.duration]} 字。
· 注意：你依然没有拿到任何新的事实，所以规则不变 —— 一个字都不许编。`,

  hook: () => `【本次任务：开头更抓人】

只重写开头（hook），让最前面 1~2 句更有吸引力，让人舍不得划走。
· hook 控制在 30 字以内。
· script 的其余部分保持原意，只把开头自然地接上去。
· 不要夸张的标题党，不要编造任何信息。
· 尽量用「跟你有关」的一句话开头，而不是介绍商品。
· 整体长度基本保持原样。`,

  myvoice: (sel) => `【本次任务：更像我说话】

把整段口播改得更像出镜人（${T.speakerLabel(sel.speaker, sel.industry)}）本人随口说出来的话。
· 减少 AI 腔和书面语，把长句拆短。
· 更口语、更像面对面聊天。
· 可以用「我跟你说」「你看」「说白了」这类口头语，但不要每句都用。
· 长度基本保持不变。
· 一个字都不许编。`,

  downearth: () => `【本次任务：更接地气】

把整段口播改得更有生活气息、更实在。
· 去掉书面词和空泛的形容词。
· 多用具体、日常的说法，让人听着像隔壁邻居在聊天。
· 不要加方言（怕别人听不懂），用普通话，但要像平时说话那样。
· 长度基本保持不变。
· 一个字都不许编。`,

  shorter: (sel) => `【本次任务：短一点】

把这条口播压缩得更短、更干脆。
· 目标长度：大约 ${T.SHORT_WORDS[sel.duration]} 字，比上一版明显短。
· 不允许直接截断，要重新组织语言。
· 保留最有价值的一两句话，砍掉铺垫、重复和可有可无的形容。
· hook 也要跟着变短。
· 一个字都不许编。`
};

/**
 * 微调场景：换一版 / 开头更抓人 / 更像我说话 / 更接地气 / 短一点
 * 每次都把**完整的选择（含行业、业态、店名）重新带上**，否则模型会串回默认行业。
 */
function buildRefineMessages(action, rawSelection, previous) {
  const sel = T.normalizeSelection(rawSelection);
  const fn = REFINE_INSTRUCTION[action];
  if (!fn) throw new Error('未知的操作类型: ' + action);

  const prev = previous && typeof previous === 'object' ? previous : {};
  const prevText = [
    prev.title ? `【上一版·标题】\n${prev.title}` : '',
    prev.hook ? `【上一版·3秒开头】\n${prev.hook}` : '',
    prev.script ? `【上一版·完整口播】\n${prev.script}` : ''
  ].filter(Boolean).join('\n\n');

  const user = `以下是这位门店人员最初的全部选择（每次都要重新看一遍，不要忘，尤其别把行业弄错）：
${selectionBlock(sel)}

${strategyBlock(sel)}

${extraBlock(sel)}

${prevText ? prevText + '\n\n' : ''}${fn(sel)}

【最后再提醒一次】
用户没有提供任何事实，你依然不许编价格、参数、规格、活动、销量。
门店类型和上一版完全一致，不要换成别的行业。
只输出 JSON，字段和上次完全一样：title / hook / script / risk_notice。`;

  return [
    { role: 'system', content: systemPrompt(sel) },
    { role: 'user', content: user }
  ];
}

/* =================== 字数校正（后端的最后一道保险） =================== */

/**
 * 生成完发现字数明显跑偏时，再让模型做一次「定量改写」。
 * 实测单靠 Prompt 约束字数只能做到 ±30%，必须由后端数字数、发现偏了再补一次。
 */
function buildLengthFixMessages(rawSelection, previous, range) {
  const sel = T.normalizeSelection(rawSelection);
  const lo = range[0];
  const hi = range[1];
  const target = Math.round((lo + hi) / 2);

  const prev = previous && typeof previous === 'object' ? previous : {};
  const cur = (String(prev.script || '').match(/[\u4e00-\u9fa5]/g) || []).length;
  const tooLong = cur > hi;
  const gap = Math.abs(target - cur);
  const extraSentences = Math.max(1, Math.round(gap / 15));

  const user = `【本次任务：把字数改到刚好，别的一律不动】

上一版的完整口播是 ${cur} 个汉字（标点不算）。
用户选的时长是 ${sel.duration} 秒，正文应该落在 ${lo}~${hi} 字之间，最理想是 ${target} 字左右。

${tooLong
    ? `现在**太长了**：需要减掉约 ${gap} 字（大概少 ${extraSentences} 句），压到 ${target} 字左右。
· 先删铺垫、重复的话、可有可无的形容词和多余的例子。
· 保留最有价值的一两句，以及全部真正有用的内容。
· 不要直接截断句子 —— 删完必须还是一句一句通顺的口语。`
    : `现在**太短了**：需要补上约 ${gap} 字（大概再加 ${extraSentences} 句），补到 ${target} 字左右。
· 补一个具体的场景细节，或者一个能用的判断方法。
· 不要重复已经说过的话，也不要为了凑字加空话。
· 口播是短句连缀，一句 15 个字上下就够，不要写成长句。`}

【其它一切保持原样】
· 事实一个字都不许新增（价格 / 参数 / 规格 / 活动 / 销量照样一律不许编）。
· 行业、业态、门店称呼、语气、出镜人的口吻、这条视频想让顾客做什么，全部照旧。
· title 和 hook 可以跟着微调，但不要换掉整体意思。
· 不要出现任何 AI 腔和绝对化用语（和上次的规矩完全一样）。

【上一版正文】
${prev.script || ''}

只输出 JSON，字段和上次完全一样：title / hook / script / word_count / risk_notice。`;

  return [
    { role: 'system', content: systemPrompt(sel) },
    { role: 'user', content: user }
  ];
}

/**
 * 违规词定向改写（服务端兜底扫描命中后调用）。
 * 和字数校正同一个思路：只改必须改的，其它一律不动。
 */
function buildSafeFixMessages(rawSelection, previous, hits) {
  const sel = T.normalizeSelection(rawSelection);
  const list = (hits || []).map((h) => '·「' + h + '」').join('\n');

  const user = `【本次任务：把违规词全部改掉，别的一律不动】

下面这篇口播里混进了不合规的词，一条都不能留：
${list}

改法：
· 绝对化用语（最 / 第一 / 唯一 / 顶级……）→ 换成具体、可验证的普通说法。比如「全城最低价」删掉，改成「价格你到店里对比了再定」；「最准」改成「试过才算数」。
· 医疗功效、瘦身承诺（瘦十斤 / 根治 / 降三高……）→ 整句改掉，不许换一种说法继续承诺效果，改成邀请式说法（「合不合适你自己来判断」）。
· 语气词、铺垫、结尾全部照旧，就当只是把那几个词换掉。

【其它一切保持原样】
· 字数和原版基本一样（${sel.duration} 秒口播还是 ${sel.duration} 秒，不要变长变短）。
· 事实一个字都不许新增（价格 / 参数 / 活动 / 销量照样一律不许编）。
· 行业、门店称呼、出镜人口吻、整体结构，全部照旧。

【上一版完整内容】
标题：${previous.title || ''}
开头：${previous.hook || ''}
正文：
${previous.script || ''}

只输出 JSON，字段和上次完全一样：title / hook / script / word_count / risk_notice。`;

  return [
    { role: 'system', content: systemPrompt(sel) },
    { role: 'user', content: user }
  ];
}

module.exports = {
  SYSTEM_PROMPT,
  systemPrompt,
  ACTION_LABEL,
  DURATION_RANGE,
  LENGTH_TOLERANCE,
  buildGenerateMessages,
  buildRefineMessages,
  buildLengthFixMessages,
  buildSafeFixMessages
};
