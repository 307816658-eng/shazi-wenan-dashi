/* 傻子文案大师 —— 浏览器端 lib 打包产物（自动生成，别手改）
 * 生成命令：node tools/build_browser.js
 * 源文件：lib/ 共 23 个模块
 * 生成时间：2026-11-10 15:28:22
 */
(function (global) {
  'use strict';
  var __defs = {};
  var __cache = {};

  function __resolve(spec, fromId) {
    var segs = fromId.split('/'); segs.pop();
    var parts = spec.split('/');
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (p === '.' || p === '') continue;
      if (p === '..') segs.pop(); else segs.push(p);
    }
    return segs.join('/');
  }

  function __require(id, fromId) {
    var real = id.charAt(0) === '.' ? __resolve(id, fromId) : id;
    if (__cache[real]) return __cache[real].exports;
    var def = __defs[real];
    var alt = __defs[real + "/index"];
    if (!def && alt) { real = real + "/index"; def = alt; }
    if (!def) throw new Error('模块没打进包里: ' + real);
    var mod = { exports: {} };
    __cache[real] = mod;
    def.call(mod.exports, mod, mod.exports, function (s) { return __require(s, real); });
    return mod.exports;
  }

  /* ---------- base ---------- */
  __defs['base'] = function (module, exports, require) {
'use strict';

/**
 * 通用底座 —— 与行业无关的部分全部放这里。
 *
 * V0.2 的核心设计：
 *   base.js            通用骨架、通用铁律、通用策略生成器
 *   industries/*.js    每个行业只写「差异」：选项、专属禁编、合规、AI 腔、正反例、内容原料
 *   industries/index.js 静态注册表（Cloudflare Workers 打包不支持动态 require）
 *
 * 这个文件不引用任何 Node 内置模块，本地 Node 与 Cloudflare Workers 共用。
 */

/* ============================ 时长与字数 ============================ */

const DURATIONS = [
  { id: '30', label: '30 秒', sub: '短平快' },
  { id: '45', label: '45 秒', sub: '刚刚好' },
  { id: '60', label: '60 秒', sub: '说透一点' }
];
const DEFAULT_DURATION = '45';
const DURATION_WORDS = { '30': '110 ~ 145', '45': '175 ~ 215', '60': '235 ~ 285' };
const SHORT_WORDS = { '30': '70 ~ 95', '45': '100 ~ 130', '60': '130 ~ 170' };
const SENTENCE_HINT = { '30': '8~9 句', '45': '13 句左右', '60': '17 句左右' };
const DURATION_RANGE = { '30': [110, 145], '45': [175, 215], '60': [235, 285] };
const LENGTH_TOLERANCE = 12;

/* ============================ 七步骨架 ============================ */

/** 每步的通用题干与提示。第二步的题干由行业包自己给。 */
const STEP_META = [
  { key: 'topic', n: 1, question: '今天拍什么？', hint: '先选一个，后面我会问你更细一点。' },
  { key: 'subject', n: 2, dynamic: true, question: '今天主要拍什么？', hint: '这一步会跟着上一步变。' },
  { key: 'goal', n: 3, question: '这条视频主要想让顾客干什么？', hint: '会影响开场、结构和结尾怎么收。' },
  { key: 'speaker', n: 4, question: '谁来出镜？', hint: '同一条内容，老板说和店员说，完全不一样。' },
  { key: 'tone', n: 5, question: '想怎么说？', hint: '选你听着最舒服的那一种。' },
  { key: 'duration', n: 6, question: '视频多长？', hint: '拿不准就选 45 秒。' }
];

/* ============================ 通用铁律片段 ============================ */

/** 所有行业都不许编的东西 —— 行业专属禁编由 pack.forbiddenFacts 追加 */
const GENERAL_FORBIDDEN = [
  '价格、原价、划线价、折扣、优惠、满减、赠品、名额、限时、清仓、特价',
  '销量、排名、第一、冠军、全网最低、全城最低、专柜同款、明星同款、正品授权、厂家直供',
  '顾客评价、顾客原话、顾客反馈（不许虚构任何顾客说过的话）',
  '活动细则（送什么、减多少、什么时候结束）',
  '门店信息（开了多少年、多少会员、多少家分店、获得过什么荣誉、多少老顾客）',
  '库存、备货量、补货时间、有多少件'
];

/** 通用绝对化用语与广告腔 */
const GENERAL_AD_BAN = '最 / 第一 / 唯一 / 顶级 / 极致 / 全网 / 全国 / 首个 / 有效 / 保证 / 百分百 / 绝对 / 彻底解决';
const GENERAL_AD_CLICHE = '本产品、采用、打造、卓越、赋能、一站式、致力于、匠心、品质生活、为您、完美诠释';
const GENERAL_HYPE = '大家好、今天给大家介绍一下、宝子们、家人们、姐妹们冲、不容错过、千万不要错过、' +
  '闭眼入、天花板、绝绝子、高级感拉满、狠狠拿下、YYDS、绝了、冲就完了';

/** 兜底话术：没事实可用时怎么绕开，全行业通用 */
const FALLBACK_PHRASES = '「你到店里看一下就知道了」/「这个得你自己上手试一下才算数」/「具体的你到店里问一下更清楚」';

/* ============================ 违规词兜底扫描 ============================ */

/**
 * 生成后兜底扫描：Prompt 再严，模型偶尔还是会把禁词带出来。
 * 这里用「正则白名单例外」的办法区分真违规和正常口语：
 *   - 「最近 / 最后 / 最多」是正常口语，不算绝对化 → 用负向前瞻排除
 *   - 「第一次来 / 第一步」是序数词，不是「第一品牌」→ 同样排除
 *   - 医疗功效 / 瘦身承诺（瘦十斤、根治、降三高……）整类封杀
 */
const BANNED_SOURCE = [
  /* 高风险「最」组合（全网最低价 / 最正宗 / 最好看…）。
     ⚠️ 只抓「对商品/服务的最高级评价」，不抓建议式说法：
        「你最好提前三天洗」「最合适」「最真实」「最容易」这类日常口语一律放行，
        否则每篇稿子都会被误判，白花一次改写调用。 */
  '(?:全网|全国|全城|全市|全省|史上)?(?:最低价|最便宜|最划算|最实惠|最省钱|最正宗|最专业|最先进|最优秀|最高级|最顶尖|最强|最佳|最值得|最贵|最赚)',
  '最好[看吃喝用]',
  '史上最[^，。！？!?、\\s]{0,4}',
  '第[一二三]?(?!次|步|天|件|句|批|时间|位|个|轮|波|名顾客)(?:品牌|名|之?选|首选|名店)', // 第一品牌 / 首选
  '唯一', '顶级', '极致', '绝无仅有', '百分百', '100%', '绝对',
  '国家级', '销量(?:第一|冠军)', '全网销量',
  '瘦(?:十|[一二两三四五六七八九]|\\d+)斤', '月瘦\\d+', '包瘦', '吃了能瘦', '喝了能瘦',
  '降(?:三高|血糖|血压|血脂)', '根治', '包治', '包好', '治愈', '抗癌', '防癌',
  '杀菌率?\\s*\\d', '消炎', '降火', '败火'
].join('|');

const BANNED_REGEX = new RegExp('(' + BANNED_SOURCE + ')', 'g');

/** 扫 title+hook+script，返回命中的违规词列表（去重） */
function findBannedWords(text) {
  const s = String(text || '');
  const hits = s.match(BANNED_REGEX) || [];
  return Array.from(new Set(hits));
}

/* ============================ 策略生成器 ============================ */

/**
 * 第三步「想让顾客干什么」—— 8 个通用目标 + 行业覆盖。
 * 用 pack.words 把行业词填进去，避免每个行业重复写一遍。
 */
function buildGoalStrategy(pack) {
  const w = pack.words;
  const base = {
    comestore: `目标是让人觉得「这家店值得走进去一趟」。
· 开头别急着叫人到店，先给一个画面或一个说法，让人对这家店产生好奇。
· 中间讲店里正在发生什么、适合什么样的人来。
· 结尾自然地说一句到店 —— 像随口一提，不要像喊口号。`,
    joinact: `目标是让人知道有个活动、并且愿意来参加。
· 只讲「有活动」以及活动大概是什么方向，绝对不许编价格、折扣、赠品、名额、截止日期。
· 中间讲清楚这个活动适合谁来、能有什么体验。
· 结尾给一个清楚的参与方式（到店问一下 / 到店看看）。`,
    knownew: `目标是让人知道店里来了新的东西。
· 只讲「到了新东西」以及大概是什么方向，绝不许编规格、成分、价格、数量、型号。
· 中间讲这些新东西适合什么场合、什么样的人。
· 结尾轻推一下来看，不要用力过猛。`,
    knowstore: `目标是让人知道「这是家什么店、和别处有什么不一样」。
· 开头给这个店一个清晰的定位（做什么、服务什么样的人）。
· 中间讲店的特点、选货思路、待客方式 —— 但不许编开了多少年、有多少会员、什么荣誉。
· 结尾邀请来看一眼。`,
    remember: `目标是让人记住这家店，留下一个记忆点。
· 全篇要围绕一个「记忆点」来讲（可以是店的做法、取向、待客态度）。
· 不要罗列一堆信息，抓住一件事讲透。
· 结尾用一句话把这个点再收一下，但不要喊口号。`,
    exposure: `目标是拿到更好的完播和互动，不以卖货为目的。
· 内容价值优先 —— 这条可以完全不提「买」，甚至可以不带任何到店引导。
· 开头必须足够有意思，让人愿意多看两秒。
· 中间给足信息量或情绪价值，让人愿意看完。
· 结尾可以留一句自然的互动或收尾，不要贴广告。`,
    auto: '你自己判断这条视频最该让顾客做什么，然后按那个目标来写。'
  };
  // 体验类 / 教学类目标由行业包给（差异最大）
  return Object.assign(base, pack.goalOverrides || {});
}

/** 第五步「想怎么说」—— 参数化，行业只提供动词差异 */
function buildToneStrategy(pack) {
  const w = pack.words;
  const base = {
    chat: '整体像跟人闲聊，语气松弛，不端着，允许有「嗯」「你看」这种停顿感。',
    warm: '整体偏亲切温和，像对待老熟人，语气软一点，能让人感到被照顾。',
    downearth: '整体接地气，用最日常的词，说人话，不修饰，不讲排场。',
    humor: '整体带一点点幽默感，可以自嘲或者开个小玩笑，但不要油腻、不要网络梗堆砌，不要用力搞笑。',
    pro: '整体显得专业，有判断、有依据，但语气是平等的，不是教训人、不是说教。',
    friend: `整体像朋友之间的推荐：「我跟你说」「我自己是这么${w.tryVerb}的」这种口吻。`,
    bossshare: '整体像老板本人的真实分享：有自己的看法、有取舍标准，语气实在，不喊口号。',
    guideshare: `整体像${w.staff}在真实推荐：说的是自己天天接触${w.goods}之后的真实感受，具体、不夸大。`,
    question: `开头用「抛一个问题」的方式切入（这一条主要影响开头）。
· 这个问题要问到人心上，要跟${w.goods}有关，但不能编具体产品。
· 后面要顺着这个问题往下答。`,
    curious: `开头用「制造好奇心」的方式切入（这一条主要影响开头）。
· 用一个让人想知道下文的话开场，但绝对不许变成标题党、不许夸大、不许吊人胃口之后给空洞内容。
· 后面必须真的给出有意思的内容。`,
    pain: `开头用「讲一个顾客常见痛点」的方式切入（这一条主要影响开头）。
· 直接把顾客的困扰说出来，让人产生「这说的不就是我吗」的感觉。
· 后面要给出解决思路。`,
    auto: '你自己判断哪种语气最合适。'
  };
  return Object.assign(base, pack.toneOverrides || {});
}

/** 第四步「谁出镜」—— 通用部分 + 行业覆盖（导购/不露脸差异最大） */
function buildSpeakerStrategy(pack) {
  const w = pack.words;
  const base = {
    boss: `出镜人是老板。老板说话有分量、有取舍标准，像是「我们做这行，我自己的判断是……」。
· 有主见，敢下判断，语气稳。
· 但不要摆架子、不要像在给员工开会。`,
    manager: `出镜人是店长。店长更专业、更有判断，习惯帮顾客做选择。
· 说话有条理，会给建议、会解释为什么。
· 但不要变成念说明书，也不要像培训。`,
    multi: `这条视频是多个人一起出镜。
· 文案要能自然分给不同的人说（可以用简短的对话或接力感）。
· 给每个人的口吻留出差别，不要像同一个人在自言自语。
· 不要写得太复杂，两三个人各说一两句就够。`,
    auto: '你自己判断谁出镜最合适，并按那个身份来写。'
  };
  return Object.assign(base, pack.speakerOverrides || {});
}

/* ============================ 系统提示词 ============================ */

/** 把行业包里的数组拼成带「·」的清单 */
function bullets(arr) {
  return (arr || []).map((x) => '· ' + x).join('\n');
}

/**
 * 生成完整系统提示词：通用底座 + 注入行业片段。
 * 服装包提供的内容与 V0.1 原文一致，保证回归不退化。
 */
function systemPrompt(pack, storeName) {
  const w = pack.words;
  const storeLine = storeName
    ? `这家店的名字是「${storeName}」。店名最多原样出现一次，除此之外不许围绕店名编造任何东西
  （不许说开了多少年、老字号、几家分店、口碑多好、得过什么奖）。
  如果这次的文案里放店名不自然，就干脆不放，直接用「我们店」。`
    : '这家店没有给名字。文案里一律用「我们店」「店里」来称呼，不要编造任何店名、品牌名或品牌口号。';

  return `你是一名长期服务中国${pack.label}门店短视频的资深口播文案策划。
${pack.roleIntro}
你现在服务的对象是${pack.label}门店的老板、店长、${w.staff}。
他们不是文案，也不会写文案 —— 他们连需求都说不清楚，只会点几个选项。
他们要的不是「一篇漂亮的文案」，而是一条他本人拿起手机就能对着镜头说出口的话。

你写出来的东西，唯一的标准是：这个人读一遍，会觉得「这话我平时就会说」。

${storeLine}


================ 你必须先接受一个现实 ================

用户这次**没有提供任何具体事实**。
你手上只有几个标签（拍什么方向、想让顾客做什么、谁出镜、什么语气、多长），
除此之外，你不知道任何价格、规格、参数、活动、销量。

所以：
**不许为了「写得具体」而编造细节。**
一条不编造的口播，照样可以写得有内容 —— 靠的是下面这些，它们不需要任何数字：

${bullets(pack.sceneIdeas)}

**你的内容价值应该来自这里，而不是来自编数字。**

⚠️ 「主题名不等于事实」：用户选了一个拍摄方向，只说明他想拍这个话题，
不代表店里真有对应的活动、价格、赠品、政策、认证或数量。
例如选了「套餐」不代表有 99 元套餐，选了「活动」不代表有折扣，选了「新品」不代表有具体的件数。
看到这类词，绝不许顺着它编出一个具体事实。


================ 铁律一：绝对不许编造任何事实 ================

用户没有提供的，一律不许自己加。以下是高危清单，**一条都不许碰**：

${bullets(GENERAL_FORBIDDEN)}
${bullets(pack.forbiddenFacts)}

⚠️ 【最容易漏的一类编造：替没见过的${w.goods}下结论】
你根本没见过店里这件东西，所以**任何关于它长什么样、用起来怎么样的正面描述都不许写**。
例如不许说「版型很正 / 垂坠感不错 / 剪裁利落 / 面料挺括 / 颜色百搭 / 质感很好 /
腰部收得刚好 / 坐着很舒服 / 分量很足 / 食材新鲜 / 操作很简单 / 特别省电 / 静音」。
这些话听着不像编造，其实全是你在替店里下结论 —— 和编一个价格一样严重。
要表达同样的意思，只能换成邀请式说法：
「你自己来${w.tryVerb}一下就知道」「合不合适，上手了才算数」「到店里比一比最准」。
**宁可少写一句，也不许替商品说一句好话。**

【${pack.label}行业最常被误写的说法 —— 写完后逐字检查，一个都不许出现】
${(pack.hardBannedPhrases || []).join(' / ')}
只要成品里出现上面任何一个词，这条文案就算失败，必须重写那一句。

${pack.realExample || ''}

【用户没给信息时的兜底话术】
如果某个信息你没有，就绕开它说，或者用这些说法带过：
${FALLBACK_PHRASES}
绝对不可以自己填一个数字、参数或成分上去。


================ 铁律二：说人话 ================

· 短句。一句一个意思。长句拆开。
· 用口语，不用书面语。说「你」不说「消费者」。
· 不要形容词堆砌，不要空话，不要行业黑话。
· 读起来要有自然的停顿感，是真能一口气念下去的。

【${pack.label}行业最典型的 AI 腔 —— 一个都不许出现在成品里】
${(pack.aiTasteWords || []).join(' / ')}

${pack.tasteReplacements ? '写完一定要回头搜一遍，只要出现其中一个，就换成大白话：\n' + bullets(pack.tasteReplacements) : ''}

【通用广告腔 —— 一并禁止】
${GENERAL_AD_CLICHE}

反例（❌）：${pack.badExample}
正例（✅）：${pack.goodExample}


================ 铁律三：像真人说话，不像 AI ================

· 可以用「我跟你说」「其实」「说白了」「你看」「你别看」这类口语词，但别每句都用。
· 不要排比句，不要「不仅……而且……」，不要「既……又……」。
· 不要每段都总结一遍，不要结尾拔高、不要升华。
· 不要用 emoji，不要用「第一、第二、第三」这种罗列腔。
· 不要对称式的小标题感，不要每段长度都一样。
· 宁可少说，不要凑字数。写不够就别硬写，短一点没关系。

【这些词除非用户明确要求，否则一句都不许出现】
${GENERAL_HYPE}
注意：不要机械使用网络流行语。判断标准是 —— 一个真实的门店老板，会不会对着镜头说这句话？


================ 铁律四：广告合规 ================

你写的是要公开发布到抖音的商业内容，必须避开广告法风险：
· 不许出现「${GENERAL_AD_BAN}」这类绝对化用语或无依据承诺。
· 不许贬低同行、拉踩其他品牌、暗示别人家不好。
· 不许制造虚假紧迫感（最后一天、仅剩几件、随时涨价）。
· 不许编造任何优惠、活动、赠品。
${bullets(pack.compliance)}

标题同样要守这条线：
❌ ${pack.titleBad}
✅ ${pack.titleGood}


================ 铁律五：内部信息保护 ================

用户可能在补充说明里告诉你一些不该公开的东西，例如：
内部价格、内部活动规则、员工信息、尚未公开的活动安排、内部政策、货源和供应链信息。
店名输入框里也可能被塞进不该公开的内容。

你要判断：这句话适合公开出现在抖音上吗？
· 如果明显是内部 / 非公开信息：**不要写进口播**，一个字都不要带。
· 同时在 risk_notice 里非常简短地提醒一句，例如：
  「你补充的信息里有一项可能是内部信息，我没有放进公开口播。」
· 提醒时**不要把那项敏感内容再复述一遍**，也不要展示细节。
· 如果补充说明里是正常要求（比如「这次要提到我们店刚开业」），照做，不用提醒。


================ 时长控制 ================

用户选了多长，正文就必须多长。**这是一个区间，不是参考值。**

**先卡句子数，再卡字数。**
· 选 30 秒 → 写 8~9 句，正文 110~145 字
· 选 45 秒 → 写 13 句左右，正文 175~215 字
· 选 60 秒 → 写 17 句左右，正文 235~285 字

（口播就是短句连缀，**平均每句 15 个字上下**。
句子数比字数好把握得多 —— 先数句子，句数够了，字数基本就对了。）

【写完必须做一次自检】
1. 数一遍 script 有几个句子，和上面说的句数对得上吗？
2. 数一遍**汉字**（标点、空格、换行统统不算），填进 word_count 字段。
3. 超了就删（先删铺垫、重复、可有可无的形容词），少了就补一个具体的场景细节。
4. 确认无误，再输出。
**句数和字数都对不上，这条文案就算不合格。** 不要偷懒，真的去数。


================ 输出格式 ================

只输出一个 JSON 对象，不要任何多余文字，不要 markdown 代码块标记。

{
  "title": "视频标题。适合抖音短视频，简洁、有信息量、有点击动机，但不能夸张、不能虚假。不要直接照抄开头第一句。",
  "hook": "3 秒开头。1~2 句，控制在 30 字以内，必须是能直接说出口的话，而且要真的抓人。不要为了抓人而虚假夸张。",
  "script": "完整口播稿。从头念到尾的完整文本，开头部分就是 hook 的内容（不要让 hook 凭空消失）。段落之间用换行。",
  "word_count": 这里是 script 里的汉字个数，填一个整数（标点、空格、换行都不算）,
  "risk_notice": "只有在确实存在风险时才填，用一句很简短的话说明。没有风险就留空字符串。"
}

再次强调：
· script 必须包含 hook 那一两句。
· 你不是在写广告，你是在替一个真人写他要说出口的话。
· 编造任何一个数字、参数、折扣、销量，这条文案就是失败的。`;
}

module.exports = {
  DURATIONS, DEFAULT_DURATION, DURATION_WORDS, SHORT_WORDS, SENTENCE_HINT,
  DURATION_RANGE, LENGTH_TOLERANCE, STEP_META,
  GENERAL_FORBIDDEN, FALLBACK_PHRASES,
  findBannedWords,
  buildGoalStrategy, buildToneStrategy, buildSpeakerStrategy,
  systemPrompt
};

  };

  /* ---------- core ---------- */
  __defs['core'] = function (module, exports, require) {
'use strict';

/**
 * 业务核心 —— 本地 Node 服务和 Cloudflare Pages Functions 共用这一份。
 *
 * 设计约束（很重要）：
 *   这个文件**不能 require 任何 Node 内置模块**（fs / path / os 都不行），
 *   因为 Cloudflare Workers 运行时没有它们。
 *
 * V0.2 改动：
 *   - handleOptions(query) 按行业下发选项，同时给首页行业卡片
 *   - handleGenerate 统一使用规范化后的 sel（V0.1 里生成用原始值、字数校正用规范化值，不一致）
 *   - 行业 / 业态 / 店名随 selection 一起走，二次操作不会串回默认行业
 */

const { chatJSON, LLMError, userFacingMessage, countHanzi, emitProgress, setProgressHook, setRetryPolicy } = require('./llm');
const prompts = require('./prompts');
const T = require('./taxonomy');
const { findBannedWords } = require('./base');

const ACTIONS = ['generate', 'regenerate', 'hook', 'myvoice', 'downearth', 'shorter'];

/* ---------------------------- 配置 ---------------------------- */

function readConfig(env) {
  const e = env || {};
  const pick = (k) => (e[k] === undefined || e[k] === null || e[k] === '') ? '' : String(e[k]).trim();

  const cfg = {
    API_KEY: pick('API_KEY'),
    API_URL: pick('API_URL'),
    MODEL_NAME: pick('MODEL_NAME')
  };
  cfg.configured = !!(cfg.API_KEY && cfg.API_URL && cfg.MODEL_NAME);
  cfg.missing = [];
  if (!cfg.API_KEY) cfg.missing.push('API_KEY');
  if (!cfg.API_URL) cfg.missing.push('API_URL');
  if (!cfg.MODEL_NAME) cfg.missing.push('MODEL_NAME');
  return cfg;
}

function nowStr() {
  return new Date().toLocaleTimeString('zh-CN', { hour12: false });
}

/* ---------------------------- 工具 ---------------------------- */

function distTo(n, range) {
  if (n < range[0]) return range[0] - n;
  if (n > range[1]) return n - range[1];
  return 0;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 去空白比较：判断两版正文是不是一字不差 */
function sameScript(a, b) {
  return String(a || '').replace(/\s/g, '') === String(b || '').replace(/\s/g, '');
}

/**
 * 保证 hook 一定出现在 script 里。
 * 字数校正只重写了正文，很容易让「3 秒开头」和正文脱节。
 */
function syncHook(result) {
  const script = String(result.script || '');
  const hook = String(result.hook || '').trim();
  if (!script) return result;

  const probe = hook.replace(/\s/g, '').slice(0, 10);
  if (probe && script.replace(/\s/g, '').indexOf(probe) >= 0) return result;

  const parts = script.split(/(?<=[。！？!?；;\n])/).map((s) => s.trim()).filter(Boolean);
  const fallback = parts.slice(0, 2).join('') || script.slice(0, 30);
  console.log(`[${nowStr()}] ~ 开头与正文脱节，已用正文前两句同步`);
  return Object.assign({}, result, { hook: fallback });
}

/* ---------------------------- 选项树 ---------------------------- */

/**
 * @param {object} query 形如 { industry: 'food' }，来自 URL 查询串
 * 只下发当前行业的选项，不把 4 个行业全量塞给前端。
 */
function handleOptions(query) {
  const q = query && typeof query === 'object' ? query : {};
  const industry = T.hasIndustry(q.industry) ? q.industry : T.DEFAULT_INDUSTRY;
  const pack = T.getPack(industry);
  return {
    status: 200,
    body: {
      ok: true,
      version: '0.4.0',
      industries: T.listIndustries(),
      industry,
      industryLabel: pack.label,
      subTypes: pack.subTypes.map((s) => ({ id: s.id, label: s.label })),
      steps: T.clientSteps(industry),
      defaultDuration: T.DEFAULT_DURATION
    }
  };
}

/* ---------------------------- 健康检查 ---------------------------- */

function handleHealth(env) {
  const cfg = readConfig(env);
  return {
    status: 200,
    body: {
      ok: true,
      version: '0.4.0',
      configured: cfg.configured,
      missing: cfg.missing,
      model: cfg.MODEL_NAME || null,
      industries: T.listIndustries().map((x) => x.id),
      apiHost: (() => { try { return new URL(cfg.API_URL).host; } catch (e) { return null; } })(),
      runtime: (typeof caches !== 'undefined' && typeof WebSocketPair !== 'undefined') ? 'workers' : 'node',
      time: new Date().toISOString()
    }
  };
}

/* ---------------------------- 生成 ---------------------------- */

async function handleGenerate(env, payload) {
  const cfg = readConfig(env);

  if (!cfg.configured) {
    return {
      status: 503,
      body: { ok: false, error: { message: userFacingMessage('config'), kind: 'config', missing: cfg.missing } }
    };
  }

  const p = payload && typeof payload === 'object' ? payload : {};
  const action = ACTIONS.includes(p.action) ? p.action : 'generate';
  const selection = p.selection || {};
  const previous = p.previous || null;

  if (action !== 'generate' && (!previous || !previous.script)) {
    return {
      status: 400,
      body: { ok: false, error: { message: '上一版内容丢了，点一下「重新填写」再来一次吧。', kind: 'input' } }
    };
  }

  // 统一规范化一次，后面三处（生成 / 二次操作 / 字数校正）都用同一份 sel
  const sel = T.normalizeSelection(selection);
  const t0 = Date.now();
  console.log(
    `[${nowStr()}] -> action=${action}  industry=${sel.industry}/${sel.subType || '-'}  ` +
    `store=${sel.storeName ? '有' : '无'}  topic=${sel.topic}/${sel.subject}  goal=${sel.goal}  ` +
    `speaker=${sel.speaker}  tone=${sel.tone}  ${sel.duration}s  extra=${sel.extra ? sel.extra.length + '字' : '无'}`
  );

  try {
    const messages = action === 'generate'
      ? prompts.buildGenerateMessages(sel)
      : prompts.buildRefineMessages(action, sel, previous);

    let result = await chatJSON(cfg, messages, action, { timeoutMs: 90000 });

    if (!result.script) {
      throw new LLMError('format', '模型没有返回口播内容');
    }

    /* ---- 二次操作偷懒兜底：模型偶尔原样返回，自动再要一次 ---- */
    if (action !== 'generate' && previous && previous.script && sameScript(result.script, previous.script)) {
      console.log(`[${nowStr()}] ~ 二次操作原样返回，自动重试一次`);
      emitProgress({ type: 'phase', name: 'refine', action });
      try {
        const again = await chatJSON(cfg, messages, 'regenerate', { timeoutMs: 90000 });
        if (again.script && !sameScript(again.script, previous.script)) {
          result = again;
          console.log(`[${nowStr()}] ~ 重试拿到新内容`);
        }
      } catch (e) { /* 重试失败就保留原稿，用户可以再点一次 */ }
    }

    /* ---- 字数校正：Prompt 管不住精度，这里兜一道 ---- */
    const range = prompts.DURATION_RANGE[sel.duration];
    const charsBefore = countHanzi(result.script);
    let charsAfter = charsBefore;
    let corrected = false;
    let round = 0;
    let rlWaits = 0;

    while (range && round < 3 && distTo(charsAfter, range) > prompts.LENGTH_TOLERANCE) {
      round += 1;
      console.log(`[${nowStr()}] ~ 第 ${round} 次校正：当前 ${charsAfter} 字，目标 ${range[0]}~${range[1]}`);
      emitProgress({ type: 'phase', name: 'lengthfix', action, round });
      try {
        const fixed = await chatJSON(
          cfg,
          prompts.buildLengthFixMessages(sel, result, range),
          'lengthfix',
          { timeoutMs: 90000 }
        );
        const c1 = countHanzi(fixed.script);
        if (fixed.script && distTo(c1, range) < distTo(charsAfter, range)) {
          result = fixed;
          corrected = true;
          console.log(`[${nowStr()}] ~ 校正生效：${charsAfter} 字 -> ${c1} 字`);
          charsAfter = c1;
        } else {
          console.log(`[${nowStr()}] ~ 校正后 ${c1} 字，没有更好，停止校正`);
          break;
        }
      } catch (e) {
        // 撞限流不算一次校正：退回去、等一会儿再来，最多额外等 3 次
        if (e.kind === 'ratelimit' && rlWaits < 3) {
          rlWaits += 1;
          round -= 1;
          console.log(`[${nowStr()}] ~ 校正撞限流，等 15s 后再试（第 ${rlWaits} 次等待）`);
          emitProgress({ type: 'retry', action, attempt: rlWaits, waitMs: 15000, kind: 'ratelimit' });
          await sleep(15000);
          continue;
        }
        console.log(`[${nowStr()}] ~ 校正失败：${e.kind || e.message}`);
        break;
      }
    }

    /* ---- 违规词兜底：Prompt 管不住概率，这里扫一遍，扫到就定向改写 ---- */
    let safeFixed = false;
    let safeRound = 0;
    let safeWaits = 0;
    let hits = findBannedWords((result.title || '') + '\n' + (result.hook || '') + '\n' + (result.script || ''));

    while (hits.length && safeRound < 2) {
      safeRound += 1;
      console.log(`[${nowStr()}] ~ 第 ${safeRound} 次安全改写：发现违规词 ${hits.join('、')}`);
      emitProgress({ type: 'phase', name: 'safefix', action, round: safeRound });
      try {
        const fixed = await chatJSON(
          cfg,
          prompts.buildSafeFixMessages(sel, result, hits),
          'safefix',
          { timeoutMs: 90000 }
        );
        const hitsAfter = findBannedWords((fixed.title || '') + '\n' + (fixed.hook || '') + '\n' + (fixed.script || ''));
        if (fixed.script && hitsAfter.length < hits.length) {
          result = fixed;
          safeFixed = true;
          hits = hitsAfter;
          console.log(`[${nowStr()}] ~ 安全改写生效，剩余违规词 ${hits.length} 个`);
        } else {
          console.log(`[${nowStr()}] ~ 安全改写后仍有 ${hitsAfter.length} 个，停止改写`);
          break;
        }
      } catch (e) {
        // 同字数校正：限流等待不占用改写轮次
        if (e.kind === 'ratelimit' && safeWaits < 3) {
          safeWaits += 1;
          safeRound -= 1;
          console.log(`[${nowStr()}] ~ 安全改写撞限流，等 15s 后再试（第 ${safeWaits} 次等待）`);
          emitProgress({ type: 'retry', action, attempt: safeWaits, waitMs: 15000, kind: 'ratelimit' });
          await sleep(15000);
          continue;
        }
        console.log(`[${nowStr()}] ~ 安全改写失败：${e.kind || e.message}`);
        break;
      }
    }

    /* ---- 安全改写可能带偏字数，再校一次 ---- */
    if (safeFixed && range) {
      const c2 = countHanzi(result.script);
      if (distTo(c2, range) > prompts.LENGTH_TOLERANCE) {
        console.log(`[${nowStr()}] ~ 安全改写后字数 ${c2}，再校正一次`);
        emitProgress({ type: 'phase', name: 'lengthfix', action, round: 'final' });
        try {
          const fixed = await chatJSON(
            cfg,
            prompts.buildLengthFixMessages(sel, result, range),
            'lengthfix',
            { timeoutMs: 90000 }
          );
          const c3 = countHanzi(fixed.script);
          // ⚠️ 复校也要扫一遍违规词：安全改写刚清掉的词，字数校正有可能顺手带回来
          const hits3 = findBannedWords(
            (fixed.title || '') + '\n' + (fixed.hook || '') + '\n' + (fixed.script || '')
          );
          if (fixed.script && distTo(c3, range) < distTo(c2, range) && hits3.length === 0) {
            result = fixed;
            charsAfter = c3;
            console.log(`[${nowStr()}] ~ 复校生效：${c2} 字 -> ${c3} 字`);
          } else if (hits3.length) {
            console.log(`[${nowStr()}] ~ 复校版带回了违规词 ${hits3.join('、')}，放弃这版，保留上一版`);
          }
        } catch (e) { /* 字数略有偏差可以接受，不再折腾 */ }
      }
    }

    result = syncHook(result);

    const ms = Date.now() - t0;
    console.log(
      `[${nowStr()}] <- 成功  action=${action}  ${ms}ms  ` +
      `tokens=${(result.usage && result.usage.total_tokens) || '?'}  ` +
      `script=${countHanzi(result.script)}汉字${corrected ? '（已校正）' : ''}`
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          title: result.title,
          hook: result.hook,
          script: result.script,
          risk_notice: result.risk_notice || ''
        },
        meta: {
          action,
          action_label: prompts.ACTION_LABEL[action] || action,
          industry: sel.industry,
          industry_label: T.getPack(sel.industry).label,
          model: result.model,
          ms,
          tokens: (result.usage && result.usage.total_tokens) || null,
          chars: countHanzi(result.script),
          corrected,
          safe_fixed: safeFixed,
          chars_before: charsBefore
        }
      }
    };
  } catch (e) {
    const kind = e instanceof LLMError ? e.kind : 'unknown';
    console.error(`[错误] action=${action} kind=${kind} :: ${e && e.message ? e.message : e}`);
    const status = kind === 'config' ? 503
      : kind === 'timeout' ? 504
        : kind === 'ratelimit' ? 429
          : 502;
    return {
      status,
      body: { ok: false, error: { message: userFacingMessage(kind), kind } }
    };
  }
}

module.exports = {
  ACTIONS,
  readConfig,
  handleOptions,
  handleHealth,
  handleGenerate,
  // 浏览器直连时用这两个：注册进度回调、换一套更长的重试等待
  setProgressHook,
  setRetryPolicy
};

  };

  /* ---------- industries/appliance ---------- */
  __defs['industries/appliance'] = function (module, exports, require) {
'use strict';

/** 家电行业包。选项 id 与其它行业保持一致。 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'appliance',
  label: '家电',
  emoji: '🔌',
  subTypes: [
    { id: 'big', label: '大家电' }, { id: 'kitchen', label: '厨电' },
    { id: 'small', label: '生活小电' }, { id: 'digital', label: '数码' }
  ],
  words: {
    store: '我们店', staff: '店员', goods: '机器', customer: '来挑机器的人',
    tryVerb: '用', place: '家里'
  },
  roleIntro: '你服务过大量实体家电门店，清楚顾客最怕的不是不会买，是买回去发现用不上、放不下、操作太复杂。',

  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '新款到店', emoji: '🆕' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '到店福利', emoji: '🎁' },
    { id: 'outfit', label: '选购避坑', emoji: '🧭' },
    { id: 'single', label: '单品讲解', emoji: '🔌' },
    { id: 'season', label: '换季换新', emoji: '🍃' },
    { id: 'festival', label: '节日换新', emoji: '🎊' },
    { id: 'daily', label: '门店日常', emoji: '🏬' },
    { id: 'staff', label: '老板 / 店长出镜', emoji: '🎤' },
    { id: 'auto', label: 'AI 帮我选', emoji: '✨' }
  ],

  second: {
    opening: {
      question: '开业这段时间，主要拍什么？',
      options: [
        { id: 'openday', label: '开业当天现场' }, { id: 'prepare', label: '开业前的准备' },
        { id: 'environment', label: '新店环境介绍' }, { id: 'openact', label: '开业活动' },
        { id: 'firstcustomer', label: '第一批客人' }, { id: 'display', label: '展台陈列' },
        { id: 'teamstate', label: '店员状态' }, AI_PICK
      ]
    },
    newarrival: {
      question: '这次到的新款，主要拍什么？',
      options: [
        { id: 'fridge', label: '冰箱 / 冷柜' }, { id: 'washer', label: '洗衣机' },
        { id: 'aircon', label: '空调' }, { id: 'cook', label: '厨房电器' },
        { id: 'small', label: '生活小电' }, { id: 'digital', label: '数码产品' },
        { id: 'several', label: '好几款新品' }, { id: 'wholestore', label: '整店新陈列' }, AI_PICK
      ]
    },
    activity: {
      question: '是什么活动？',
      options: [
        { id: 'openact', label: '开业活动' }, { id: 'festivalact', label: '节日活动' },
        { id: 'seasonact', label: '换季活动' }, { id: 'welfareact', label: '到店福利' },
        { id: 'memberact', label: '会员活动' }, { id: 'limitedact', label: '限时活动' },
        { id: 'annivact', label: '店庆活动' }, AI_PICK
      ]
    },
    welfare: {
      question: '这次是什么福利？',
      options: [
        { id: 'visitorgift', label: '到店有礼' }, { id: 'freesuggest', label: '免费选购建议' },
        { id: 'oldcustomer', label: '老顾客回馈' }, { id: 'newexperience', label: '新机现场体验' },
        { id: 'demo', label: '现场演示' }, { id: 'memberonly', label: '会员专属' }, AI_PICK
      ]
    },
    outfit: {
      question: '想讲哪种选购场景？',
      options: [
        { id: 'commute', label: '第一次置办' }, { id: 'date', label: '两口子一起挑' },
        { id: 'casual', label: '家里换新' }, { id: 'elegant', label: '给长辈挑' },
        { id: 'young', label: '小空间怎么选' }, { id: 'first', label: '预算怎么想' },
        { id: 'takeaway', label: '买回去怎么用' }, AI_PICK
      ]
    },
    single: {
      question: '讲解哪一类？',
      options: [
        { id: 'fridge', label: '冰箱' }, { id: 'washer', label: '洗衣机' },
        { id: 'aircon', label: '空调' }, { id: 'cook', label: '厨房电器' },
        { id: 'small', label: '生活小电' }, { id: 'digital', label: '数码产品' },
        { id: 'combo', label: '一套怎么搭' }, AI_PICK
      ]
    },
    season: {
      question: '这个季节主要拍什么？',
      options: [
        { id: 'spring', label: '开春除潮' }, { id: 'summer', label: '夏天制冷' },
        { id: 'autumn', label: '秋天换机' }, { id: 'winter', label: '冬天取暖' },
        { id: 'decorate', label: '装修季怎么配' }, { id: 'seasonmix', label: '换季保养' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节日？',
      options: [
        { id: 'springfestival', label: '春节' }, { id: 'valentine', label: '情人节' },
        { id: 'motherday', label: '母亲节' }, { id: 'love520', label: '520' },
        { id: 'midautumn', label: '中秋节' }, { id: 'national', label: '国庆' },
        { id: 'double11', label: '双十一' }, { id: 'newyear', label: '元旦' }, AI_PICK
      ]
    },
    daily: {
      question: '店里是什么场景？',
      options: [
        { id: 'busy', label: '今天店里挺忙' }, { id: 'newgoods', label: '新机刚到' },
        { id: 'sorting', label: '店员调试展机' }, { id: 'tryon', label: '客人现场试机' },
        { id: 'display', label: '展台细节' }, { id: 'routine', label: '开门前的检查' },
        { id: 'recommend', label: '店员推荐' }, { id: 'bossdaily', label: '老板日常' }, AI_PICK
      ]
    },
    staff: {
      question: '想让镜头前的人，给大家留下什么印象？',
      options: [
        { id: 'bossself', label: '老板本人' }, { id: 'managerself', label: '店长' },
        { id: 'seniorguide', label: '老店员' }, { id: 'tech', label: '懂技术的人' },
        { id: 'wholteam', label: '整个团队' }, { id: 'bossheart', label: '老板讲心里话' },
        { id: 'managerpro', label: '店长讲门道' }, { id: 'guidedaily', label: '店员讲日常' }, AI_PICK
      ]
    },
    auto: {
      question: '大概想拍点什么？说不清楚也没关系。',
      options: [
        { id: 'wantnew', label: '想拍刚到的新款' }, { id: 'wantact', label: '想拍店里的活动' },
        { id: 'wantoutfit', label: '想讲怎么挑不踩坑' }, { id: 'wantsingle', label: '想讲一台机器' },
        { id: 'wantdaily', label: '想拍拍店里日常' }, { id: 'wantknow', label: '想让大家认识我们店' },
        { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  goals: [
    { id: 'comestore', label: '来店里看看' }, { id: 'tryon', label: '来现场试一下' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '了解新款' },
    { id: 'learntips', label: '学一个选购方法' }, { id: 'solveproblem', label: '解决一个使用问题' },
    { id: 'knowstore', label: '认识这家店' }, { id: 'remember', label: '记住这家店' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「亲自来现场试一下」。
· 开头点破一个事实：参数表看得再明白，实际操作顺不顺手是另一回事。
· 中间讲清楚来之前先想哪几件事、到店该试哪几个动作。
· 结尾把「来试一下」说出来，语气轻松，不给压力。`,
    learntips: `目标是让看的人真的学到一点怎么挑，从而觉得「这个人懂」。
· 硬广感降到最低 —— 这条更像一个真心在分享经验的人。
· 开头别介绍机型，直接给方法、给判断。
· 中间给 1~2 条真正能用的方法，用大白话讲（可以用下面的行业通用方法）。
· 全篇几乎不推型号，最多最后一句自然带到「店里可以来试」。`,
    solveproblem: `目标是解决一个具体的使用或选购困扰，让人觉得「说的就是我」。
· 开头直接把困扰说出来（买回去放不下、家里人不会用、功能太多挑花眼、用了一阵不知道怎么收拾）。
· 中间给一个切实能用的小办法，讲清楚为什么有用。
· 不要用参数堆砌，越像隔壁用过的人在教你越好。
· 结尾可以自然带到店里，也可以不带 —— 内容价值优先。`
  },

  speakers: [
    { id: 'boss', label: '老板' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '店员' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍机器和演示配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是店员。店员天天在店里给人演示，说的是看多了之后的真实感受。
· 口吻像「你要是拿不准，我一般建议你先按一下这个地方」。
· 具体、实在，不讲大道理，不背参数表。`,
    noface: `这条视频不露脸，只拍机器和操作，配口播。
· 文案必须考虑镜头语言：按键特写、门盖开合、屏幕点亮、手部操作、运行中的细节、展台全景。
· 少依赖「表情」和「眼神」这类只有露脸才能传达的东西。
· 多用「你看这个按下去」「镜头拉近看一下」「转一下这个旋钮」这种能配画面的说法。
· 语气可以更客观、更聚焦在「怎么用」这件事上。`
  },

  toneOverrides: {
    question: `开头用「抛一个问题」的方式切入（这一条主要影响开头）。
· 这个问题要问到人心上，比如「你有没有那种，买之前看着功能挺多，回家其实就只用一两个的时候？」
· 后面要顺着这个问题往下答。`,
    friend: '整体像朋友之间的推荐：「我跟你说」「我自己家就是这么用的」这种口吻。'
  },

  subjectHint: {
    fridge: '这一条围绕冰箱 / 冷柜来讲。', several: '这一条讲好几款，要有整体感，不要只盯着一台。',
    wholestore: '这一条讲整店这一波新陈列，重点是整体给人的感觉。',
    combo: '这一条重点讲一套东西怎么搭着用。'
  },

  sceneIdeas: [
    '具体的**家里使用场景**（早上赶时间、一家人同时用、厨房台面本来就挤）',
    '具体的**选购困扰**（参数看不懂、功能太多挑花眼、怕买回去用不上）',
    '具体的**判断方法**（先量放的地方、先想谁用得最多、到店按哪几个键）',
    '具体的**使用感受**（按键顺不顺手、开门会不会挡、声音能不能接受）',
    '**门店的氛围感**（展机亮着屏、店员在演示、客人自己上手按了一下）'
  ],
  forbiddenFacts: [
    '能效等级、省电百分比、耗电量、功率、匹数、容量升数、噪音分贝、制冷速度等任何参数',
    '保修年限、免费上门、包安装、以旧换新金额、国补 / 政府补贴金额、分期方案',
    '零辐射、绝对安全、母婴级、杀菌率、除菌率、净化率、健康功效',
    '原装进口、德国技术、某品牌同款、核心专利、获奖情况',
    '销量、排名、卖得最好、全网最低、官方授权、厂家直供',
    '具体机型细节（几个按键、什么屏幕、什么颜色、多大尺寸）—— 你没见过这台机器，就别说它长什么样'
  ],
  hardBannedPhrases: ['特别省电', '静音', '操作很简单', '老人也能用', '功能很全', '一步到位',
    '一键搞定', '运行很稳', '噪音很小', '用着顺手'],
  compliance: [
    '不许承诺省电比例、杀菌率、保修年限，也不许提任何补贴金额或政策。',
    '不许用「零辐射 / 绝对安全 / 全网最低 / 销量第一」这类绝对化和安全承诺。'
  ],
  aiTasteWords: ['黑科技', '硬核', '旗舰', '性能拉满', '极致体验', '智能生态',
    '重新定义', '科技感', '品质生活', '一站式', '解放双手', '颠覆'],
  tasteReplacements: [
    '「黑科技 / 硬核」→ 直接删掉，说「这个按一下你就明白了」',
    '「旗舰 / 性能拉满」→ 说「这台用着挺顺」',
    '「智能生态 / 重新定义」→ 说「跟家里其它东西能搭上」',
    '「解放双手 / 颠覆」→ 说「能少折腾一步」',
    '「科技感」→ 说「看着挺利落」'
  ],
  badExample: '搭载黑科技芯片，性能拉满，重新定义智能生态，为您打造极致品质生活。',
  goodExample: '这台我觉得挺适合家里人多的，你别光看功能表，来按一下，顺不顺手一试就知道。',
  titleBad: '「全网最省电的一台，闭眼入！」',
  titleGood: '「买之前先量这个位置，能少跑一趟」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「店里新到一台机器，适合家里人多的。」
✅ 可以说：「新到一台，家里人多的话可以来看看，先想想平时谁用得最多。」
❌ 不许变成：「一级能效，一天不到半度电，十年保修！」因为：能效、耗电、保修全是编的。
❌ 不许变成：「国补直降 2000，以旧换新再减 500。」因为：补贴和金额一个字都没给过。
❌ 不许变成：「德国原装进口，零辐射，母婴都能用。」因为：产地和安全承诺全是编的。
**而你们这次连「家里人多」之外的信息都没有。**
那就靠使用场景、谁用得最多、到店按哪几个键来写，绝不能自己补一个参数、认证或价格。`,

  contentRaw: [
    '先量位置：不只是宽高，还要看开门方向、插座在哪、散热那一边留没留空',
    '再想谁用得最多：老人用、孩子用、一家人抢着用，挑的重点不一样',
    '功能表别从头看到尾，先想清楚自己平时到底用哪两三个',
    '到店一定要自己按一遍：按键、门盖、屏幕，顺不顺手一上手就知道',
    '问清楚日常怎么收拾、怎么清洁，比多两个用不上的功能实在'
  ],
  customerPains: [
    '参数看了一堆，回家其实只用了最基本那一两个',
    '尺寸没量开门方向，搬回去门打不开',
    '功能太多，家里人谁都不会用',
    '只看外观，没注意平时好不好清理',
    '买完才发现插座位置不对，还得重新挪'
  ]
};

module.exports = pack;

  };

  /* ---------- industries/auto ---------- */
  __defs['industries/auto'] = function (module, exports, require) {
'use strict';

/**
 * 汽车服务行业包（洗车美容 / 保养维修 / 轮胎 / 贴膜改装）。
 *
 * 这行的信任成本最高：车主默认「进店就被坑」。
 * 所以写稿不提技术参数、不提原厂正品，只讲「怎么看、怎么问、哪笔钱可以先不花」。
 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'auto',
  label: '汽车服务',
  emoji: '🚗',
  subTypes: [
    { id: 'wash', label: '洗车美容' }, { id: 'maintain', label: '保养维修' },
    { id: 'tire', label: '轮胎' }, { id: 'film', label: '贴膜改装' }
  ],
  words: {
    store: '我们店', staff: '师傅', goods: '项目', customer: '车主',
    tryVerb: '试', place: '店里'
  },
  roleIntro: '你服务过大量汽车服务门店，知道车主最怕被坑——所以内容只能讲判断方法、讲怎么问价，不能替店家承诺「原厂」「正品」「保修几年」。',

  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '新项目 / 新设备', emoji: '🆕' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '到店福利', emoji: '🎁' },
    { id: 'outfit', label: '怎么养车不花冤枉钱', emoji: '🧭' },
    { id: 'single', label: '主推项目', emoji: '⭐' },
    { id: 'season', label: '换季养护', emoji: '🌡' },
    { id: 'festival', label: '节前检查', emoji: '🎊' },
    { id: 'daily', label: '门店日常', emoji: '🏬' },
    { id: 'staff', label: '老板 / 师傅出镜', emoji: '🎤' },
    { id: 'auto', label: 'AI 帮我选', emoji: '✨' }
  ],

  second: {
    opening: {
      question: '开业这段时间，主要拍什么？',
      options: [
        { id: 'openday', label: '开业当天' }, { id: 'prepare', label: '开业前的准备' },
        { id: 'environment', label: '车间什么样' }, { id: 'openact', label: '开业活动' },
        { id: 'firstcustomer', label: '第一批车主' }, { id: 'teamstate', label: '师傅团队' }, AI_PICK
      ]
    },
    newarrival: {
      question: '这次上的是什么？',
      options: [
        { id: 'newservice', label: '一个新项目' }, { id: 'newequip', label: '新到设备' },
        { id: 'newzone', label: '新开的工位' }, { id: 'newstaff', label: '新来的师傅' },
        { id: 'newproduct', label: '新换的材料' }, AI_PICK
      ]
    },
    activity: {
      question: '是什么活动？',
      options: [
        { id: 'openact', label: '开业活动' }, { id: 'festivalact', label: '节日活动' },
        { id: 'seasonact', label: '换季活动' }, { id: 'welfareact', label: '到店福利' },
        { id: 'memberact', label: '会员活动' }, { id: 'annivact', label: '店庆活动' }, AI_PICK
      ]
    },
    welfare: {
      question: '这次是什么福利？',
      options: [
        { id: 'freecheck', label: '免费做个基础检查' }, { id: 'oldcustomer', label: '老客户回馈' },
        { id: 'freesuggest', label: '免费帮你看看该不该做' }, { id: 'freewash', label: '免费洗个车' },
        { id: 'surprise', label: '进店小惊喜' }, AI_PICK
      ]
    },
    outfit: {
      question: '想教车主什么？',
      options: [
        { id: 'howtoask', label: '怎么问价不被绕' }, { id: 'howtojudge', label: '哪些项目可以先不做' },
        { id: 'howoften', label: '多久保养一次' }, { id: 'howtocheck', label: '自己怎么看出问题' },
        { id: 'avoidpit', label: '怎么避开常见的坑' }, AI_PICK
      ]
    },
    single: {
      question: '主推哪个方向？',
      options: [
        { id: 'carwash', label: '洗车 / 精洗' }, { id: 'maintainitem', label: '保养' },
        { id: 'tireitem', label: '轮胎' }, { id: 'filmitem', label: '贴膜' },
        { id: 'detailing', label: '内饰 / 深度清洁' }, { id: 'bestseller', label: '店里做得最多的' }, AI_PICK
      ]
    },
    season: {
      question: '这次是哪种季节变化？',
      options: [
        { id: 'summer', label: '入夏（空调、防晒）' }, { id: 'winter', label: '入冬（防冻、电瓶）' },
        { id: 'rainy', label: '雨季（雨刮、除雾）' }, { id: 'longtrip', label: '长途前检查' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节点？',
      options: [
        { id: 'spring', label: '春节前（返乡）' }, { id: 'longholiday', label: '长假出游' },
        { id: 'newyear', label: '年末' }, { id: 'summerstart', label: '入夏前' }, AI_PICK
      ]
    },
    daily: {
      question: '拍店里的哪一面？',
      options: [
        { id: 'busy', label: '忙的时候' }, { id: 'quiet', label: '闲的时候' },
        { id: 'behind', label: '车间里在干什么' }, { id: 'detail', label: '别人不注意的细节' },
        { id: 'team', label: '师傅和学徒' }, AI_PICK
      ]
    },
    staff: {
      question: '谁来说？',
      options: [
        { id: 'bossstory', label: '老板讲讲自己的看法' }, { id: 'whythis', label: '为什么做这一行' },
        { id: 'standard', label: '我们干活的标准' }, { id: 'attitude', label: '我们怎么对待车主' }, AI_PICK
      ]
    },
    auto: {
      question: '你大概想拍哪个方向？',
      options: [
        { id: 'wantnew', label: '想拍新项目' }, { id: 'wantact', label: '想拍活动' },
        { id: 'wantsell', label: '想推一个主推项目' }, { id: 'wantdaily', label: '想拍拍车间日常' },
        { id: 'wantknow', label: '想让大家认识我们店' }, { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  goals: [
    { id: 'comestore', label: '来店里看看' }, { id: 'tryon', label: '来试一次' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '了解新项目' },
    { id: 'learntips', label: '学一个养车方法' }, { id: 'solveproblem', label: '解决一个用车的困扰' },
    { id: 'knowstore', label: '认识这家店' }, { id: 'remember', label: '记住这家店' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「开过来试一次」。
· 车主最怕的是「进店就被推销」，开头先把这层顾虑说破。
· 中间讲清楚来了会做什么、大概多久、能不能先只做一样。
· 结尾轻一点：「先来看看，做不做你自己定」。`,
    learntips: `目标是让车主真的学到一点判断方法。
· 完全站在车主一侧：教怎么问、怎么看、哪笔钱可以先不花。
· 开头直接给结论，不要先介绍项目。
· 中间给 1~2 条能立刻用的方法（比如看轮胎磨损、问价先问工序）。
· 绝不承诺修复效果，也不诊断故障。`,
    solveproblem: `目标是解决一个具体困扰，让人觉得「说的就是我」。
· 开头直接说困扰（报价不清、小病大修、不知道多久保养、等太久）。
· 中间给一个能落地的小办法，讲清楚为什么。
· 语气像老实师傅，不像销售。`
  },

  speakers: [
    { id: 'boss', label: '老板' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '师傅' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍车间和车配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是师傅。师傅天天在车间干活，说的是自己上手之后的真实判断。
· 口吻像「我一看这个磨损就知道你平时跑什么路」。
· 可以讲工序、讲判断，但绝不承诺原厂件或保修年限。`,
    noface: `这条视频不露脸，只拍车、工位、工具，配口播。
· 镜头语言：举升机、轮胎花纹、内饰、擦拭前后对比、师傅手上的动作。
· 少依赖表情，多用「你看这个花纹」「镜头拉近一点」这种能配画面的说法。`
  },

  toneOverrides: {
    question: `开头抛一个问题切入，比如「你有没有过，进店本来只想洗个车，最后花了一千多？」。
· 问题要真实，不夸张。
· 后面顺着这个问题往下答。`,
    friend: '整体像朋友之间的提醒：「我跟你说」「我自己车就这么养」。'
  },

  subjectHint: {
    howtoask: '这一条教怎么问价，不给具体价格。',
    howtojudge: '这一条讲哪些项目可以先不做，讲判断依据。',
    howoften: '这一条讲频率，不给死板的公里数规定。',
    maintainitem: '这一条讲保养，重点是什么情况该做、做完能感觉到什么。'
  },

  sceneIdeas: [
    '具体的**进店顾虑**（怕被坑、怕看不懂报价、怕小病大修）',
    '具体的**用车场景**（天天通勤、周末带娃、跑长途、停车难）',
    '具体的**判断方法**（看轮胎、听异响、闻味道、自己摸一下）',
    '具体的**做完的差别**（擦干净之后的样子、开起来的感觉）',
    '**车间本身**（举升机上的车、师傅在拆什么、工具怎么摆）'
  ],
  forbiddenFacts: [
    '原厂件、原厂油、正品、官方授权、进口材料',
    '保修年限、质保里程、免费次数、返修承诺',
    '价格、工时费、套餐价、折扣、以旧换新金额',
    '检测数据、故障诊断结论、电池健康度、油品型号',
    '车主案例、别人的车怎么修的、修过多少台'
  ],
  hardBannedPhrases: ['原厂正品', '假一赔十', '终身质保', '省油', '动力提升',
    '包过年检', '一次修好', '彻底解决', '全国联保', '官方指定'],
  compliance: [
    '不许承诺原厂件、正品、保修年限——没有授权就不许说。',
    '不许做故障诊断结论或承诺修好（「你这肯定是某某坏了」这类一律不许）。',
    '不许用「最 / 第一 / 唯一 / 顶级」这类绝对化说法，也不许贬低同行。',
    '不许编造价格、工时、套餐、质保里程。'
  ],
  aiTasteWords: ['专业团队', '一站式服务', '匠心工艺', '品质保障',
    '全程无忧', '尊享服务', '技术领先', '原厂标准'],
  tasteReplacements: [
    '「专业团队 / 技术领先」→ 删掉，说「我们店里就这几个师傅，干了多久你一问就知道」',
    '「一站式 / 全程无忧」→ 说「能做的我们做，做不了的我会告诉你」',
    '「原厂标准 / 品质保障」→ 说「按工序走，做完你自己看」',
    '「匠心工艺 / 尊享服务」→ 直接删掉，换成具体的一道工序'
  ],
  badExample: '专业团队，原厂标准，一站式服务，全程无忧，让您的爱车焕然一新。',
  goodExample: '轮胎花纹磨到跟磨损标记齐平就该换了，这个你自己蹲下就能看，不用等别人说。',
  titleBad: '「原厂正品，终身质保，全城最低价！」',
  titleGood: '「保养别急着做全套，先看这两样」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「我们店新上了一台设备，可以做内饰深度清洁。」
✅ 可以说：「新上了一台设备，内饰脏得厉害的车可以来看看，做之前先让师傅看一眼值不值得做。」
❌ 不许变成：「原厂工艺，杀菌除螨，一次搞定。」因为：功效和工艺都没依据。
❌ 不许变成：「原价 899，现在只要 299。」因为：价格是编的。
❌ 不许变成：「上千位车主都做过，好评如潮。」因为：数字和评价是编的。
**而你们这次连「上了台新设备」之外的信息都没有。**
那就讲什么情况值得做、怎么判断该不该做，绝不能自己补一个价格或效果。`,

  contentRaw: [
    '先问工序：多少钱、做几步、用什么材料，问清楚了再决定',
    '轮胎自己就能看：花纹磨到标记齐平，就该换了',
    '异响先别急着拆：记清楚什么时候响（起步、刹车、过坎）再进店',
    '保养不是越勤越好：按自己的用车情况定，别照搬别人的周期',
    '拿不准就问「这个不做会怎么样」，能说清楚的店才靠谱'
  ],
  customerPains: [
    '进店本来只想洗个车，最后花了一千多',
    '报价单上看不懂，不知道哪项是必须的',
    '小问题被说成大问题',
    '保养一次要等大半天',
    '不知道该多久保养一次，怕被说拖太久'
  ]
};

module.exports = pack;

  };

  /* ---------- industries/beauty ---------- */
  __defs['industries/beauty'] = function (module, exports, require) {
'use strict';

/**
 * 美业行业包（美容 / 美发 / 美甲美睫）。
 *
 * 这个行业最大的坑是「疗效」：美白、祛斑、抗衰、祛痘、瘦脸，
 * 一句写进视频就是行政处罚级的风险，写稿时一律绕开，只讲过程、判断、感受。
 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'beauty',
  label: '美业',
  emoji: '💅',
  subTypes: [
    { id: 'hair', label: '美发' }, { id: 'skin', label: '美容护肤' },
    { id: 'nail', label: '美甲美睫' }, { id: 'mix', label: '综合美业' }
  ],
  words: {
    store: '我们店', staff: '美容师', goods: '项目', customer: '来做的人',
    tryVerb: '做', place: '店里'
  },
  roleIntro: '你服务过大量美发美容门店，清楚这个行业最不能碰的是「效果承诺」——能做的是把过程讲清楚，让人敢进门、敢开口问。',

  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '上新项目 / 新手法', emoji: '🆕' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '到店体验福利', emoji: '🎁' },
    { id: 'outfit', label: '怎么选项目不踩坑', emoji: '🧭' },
    { id: 'single', label: '主推项目', emoji: '⭐' },
    { id: 'season', label: '换季护理', emoji: '🍂' },
    { id: 'festival', label: '节前打理', emoji: '🎊' },
    { id: 'daily', label: '门店日常', emoji: '🏬' },
    { id: 'staff', label: '店主 / 技师出镜', emoji: '🎤' },
    { id: 'auto', label: 'AI 帮我选', emoji: '✨' }
  ],

  second: {
    opening: {
      question: '开业这段时间，主要拍什么？',
      options: [
        { id: 'openday', label: '开业当天' }, { id: 'prepare', label: '开店前的准备' },
        { id: 'environment', label: '店里什么样' }, { id: 'openact', label: '开业活动' },
        { id: 'firstcustomer', label: '第一批客人' }, { id: 'teamstate', label: '技师团队' }, AI_PICK
      ]
    },
    newarrival: {
      question: '这次上的是什么？',
      options: [
        { id: 'newservice', label: '一个新项目' }, { id: 'newskill', label: '一个新手法' },
        { id: 'newdevice', label: '新到一台仪器' }, { id: 'newproduct', label: '新换的产品' },
        { id: 'newcolor', label: '新的颜色 / 款式' }, AI_PICK
      ]
    },
    activity: {
      question: '是什么活动？',
      options: [
        { id: 'openact', label: '开业活动' }, { id: 'festivalact', label: '节日活动' },
        { id: 'seasonact', label: '换季活动' }, { id: 'welfareact', label: '体验福利' },
        { id: 'memberact', label: '会员活动' }, { id: 'annivact', label: '店庆活动' }, AI_PICK
      ]
    },
    welfare: {
      question: '这次是什么福利？',
      options: [
        { id: 'firsttry', label: '第一次来可以先试' }, { id: 'oldcustomer', label: '老顾客回馈' },
        { id: 'freesuggest', label: '免费帮你看看适合什么' }, { id: 'freecheck', label: '免费做个基础检测' },
        { id: 'surprise', label: '进店小惊喜' }, AI_PICK
      ]
    },
    outfit: {
      question: '想教大家怎么选？',
      options: [
        { id: 'hairfit', label: '怎么判断适不适合自己' }, { id: 'servicechoose', label: '项目怎么选不浪费' },
        { id: 'howtosay', label: '怎么跟技师说清楚想要什么' }, { id: 'avoidpit', label: '怎么避开常见的坑' },
        { id: 'frequency', label: '多久做一次比较合适' }, AI_PICK
      ]
    },
    single: {
      question: '主推哪个方向？',
      options: [
        { id: 'cut', label: '剪发' }, { id: 'color', label: '染发 / 烫发' },
        { id: 'care', label: '头皮 / 发质护理' }, { id: 'facial', label: '面部护理' },
        { id: 'nailart', label: '美甲美睫' }, { id: 'bestseller', label: '店里做得最多的' }, AI_PICK
      ]
    },
    season: {
      question: '这次是什么变化？',
      options: [
        { id: 'dryhair', label: '换季头发干、毛躁' }, { id: 'skindry', label: '换季皮肤不稳定' },
        { id: 'hairfall', label: '换季掉发多' }, { id: 'colorfade', label: '染的颜色褪了' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节点？',
      options: [
        { id: 'spring', label: '春节前' }, { id: 'valentine', label: '情人节 / 七夕' },
        { id: 'wedding', label: '婚礼 / 拍婚纱前' }, { id: 'interview', label: '面试 / 见客户前' },
        { id: 'party', label: '聚会 / 年会' }, AI_PICK
      ]
    },
    daily: {
      question: '拍店里的哪一面？',
      options: [
        { id: 'busy', label: '忙的时候' }, { id: 'quiet', label: '闲的时候' },
        { id: 'behind', label: '准备工作' }, { id: 'detail', label: '别人不注意的细节' },
        { id: 'team', label: '店里的人' }, AI_PICK
      ]
    },
    staff: {
      question: '谁来说？',
      options: [
        { id: 'bossstory', label: '店主讲讲自己的看法' }, { id: 'whythis', label: '为什么做这一行' },
        { id: 'standard', label: '我们做事的标准' }, { id: 'attitude', label: '我们怎么对待客人' }, AI_PICK
      ]
    },
    auto: {
      question: '你大概想拍哪个方向？',
      options: [
        { id: 'wantnew', label: '想拍新项目' }, { id: 'wantact', label: '想拍活动' },
        { id: 'wantsell', label: '想推一个主打项目' }, { id: 'wantdaily', label: '想拍拍店里日常' },
        { id: 'wantknow', label: '想让大家认识我们店' }, { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  goals: [
    { id: 'comestore', label: '来店里看看' }, { id: 'tryon', label: '来试一次' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '了解新项目' },
    { id: 'learntips', label: '学一个判断方法' }, { id: 'solveproblem', label: '解决一个困扰' },
    { id: 'knowstore', label: '认识这家店' }, { id: 'remember', label: '记住这家店' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「走进来试一次」。
· 美业最大的门槛是「不敢进门、怕被推销」，开头先把这层心理说破。
· 中间讲清楚第一次来会经历什么、大概多久、要不要提前说需求。
· 结尾轻一点：「先来聊两句也行」，不要逼下单。`,
    learntips: `目标是让人真的学到一点「怎么判断适不适合自己」。
· 完全站在顾客一侧：教她怎么问、怎么看、什么情况可以先不做。
· 开头直接给判断标准，不要先介绍项目。
· 中间给 1~2 条立刻能用的话术或方法（怎么描述想要的长度、怎么看发质）。
· 结尾自然带到「拿不准可以来店里让我们看看」，不硬推。`,
    solveproblem: `目标是解决一个具体困扰，让人觉得「说的就是我」。
· 开头直接说困扰（说不清想要什么、做完和想象不一样、烫完更难打理）。
· 中间给一个实际能用的办法，讲清楚为什么。
· 绝不承诺效果，只讲过程和方法。`
  },

  speakers: [
    { id: 'boss', label: '店主' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '技师 / 美容师' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍手法和店里配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是技师。技师天天上手，说的是自己看多了之后的真实判断。
· 口吻像「我一般会先看你这个情况，再决定做不做」。
· 可以讲手法、讲过程，但绝不承诺效果。`,
    noface: `这条视频不露脸，只拍手法、工具、店里，配口播。
· 镜头语言：手部动作、工具特写、洗头床、色板、镜子前的过程。
· 少依赖表情，多用「你看这个手法」「镜头拉近看一下」这种能配画面的说法。
· 可以边做边讲，节奏慢一点也没关系。`
  },

  toneOverrides: {
    question: `开头抛一个问题切入，比如「你有没有过，坐下了却说不太清自己想要什么？」。
· 问题要真实、具体，不要客服腔。
· 后面顺着这个问题往下答。`,
    friend: '整体像朋友之间的建议：「我跟你说」「我自己剪头发一般这么跟师傅说」。'
  },

  subjectHint: {
    cut: '这一条围绕剪发讲，重点是怎么沟通、怎么看适不适合。',
    color: '这一条围绕染烫讲，重点是怎么选色、怎么减少折腾。',
    care: '这一条围绕护理讲，重点是什么情况需要做、多久做一次。',
    howtosay: '这一条教怎么跟技师描述需求，不推项目。',
    frequency: '这一条讲频率，不给具体周期数字。'
  },

  sceneIdeas: [
    '具体的**进店心理**（怕被推销、不好意思拒绝、不知道要花多久）',
    '具体的**沟通困扰**（说不清长度、描述不出来、拿图给师傅也做不一样）',
    '具体的**判断方法**（看发质、看脸型、看平时愿不愿意打理）',
    '具体的**做完之后的真实状态**（好不好打理、多久要补、上班能不能扎起来）',
    '**店里的过程**（洗头、上色、吹干、镜子前看效果）'
  ],
  forbiddenFacts: [
    '疗效：美白、祛斑、祛痘、抗衰、抗皱、瘦脸、生发、防脱、修复敏感',
    '产品品牌、仪器型号、进口来源、成分浓度、认证资质',
    '价格、办卡金额、充值优惠、套餐包含几次、赠送什么',
    '顾客案例、前后对比、别人做完怎么样（不许虚构任何顾客效果）',
    '技师从业年限、获奖经历、培训背景'
  ],
  hardBannedPhrases: ['焕肤', '逆龄', '素颜杀手', '年轻十岁', '一洗就顺', '发质变好',
    '皮肤像剥了壳的鸡蛋', '做完像换了个人', '零伤害', '不伤发', '无痛'],
  compliance: [
    '绝对不许承诺任何效果（变白、变美、变年轻、头发变好、皮肤变好）。',
    '不许涉及医疗行为（祛斑、祛痘治疗、皮肤病理），也不许用「医美」类表述。',
    '不许用「最 / 第一 / 唯一 / 顶级」这类绝对化说法，也不许贬低同行。',
    '不许编造价格、卡项、赠送内容、次数。'
  ],
  aiTasteWords: ['焕活', '奢宠', '尊享', '定制美学', '轻奢护理', '由内而外',
    '唤醒肌肤', '焕然一新', '高级感', '氛围感', '仪式感'],
  tasteReplacements: [
    '「焕活 / 唤醒肌肤」→ 直接删掉，说「做完你自己摸摸看什么感觉」',
    '「奢宠 / 尊享」→ 说「来了就是躺着歇一会儿」',
    '「定制美学」→ 说「先看你平时怎么打理，再定做什么」',
    '「由内而外 / 焕然一新」→ 说「做完照镜子你自己判断」'
  ],
  badExample: '焕活肌肤，奢宠体验，专属定制美学，让你由内而外焕然一新。',
  goodExample: '你要是平时不太会打理，我一般建议先别做太复杂的，剪一个自己能吹得出来的，比什么都强。',
  titleBad: '「做完年轻十岁，素颜也能出门！」',
  titleGood: '「说不清想要什么发型？先跟师傅说这三句」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「我们店最近上了一个新的护理项目，你可以来试试。」
✅ 可以说：「最近上了一个新项目，你要是最近头发干得厉害，可以来试试，做完什么感觉你自己判断。」
❌ 不许变成：「深层修复，一次见效，做完头发顺滑如丝。」因为：效果承诺是红线。
❌ 不许变成：「进口原料，沙龙级护理，原价 398 现价 99。」因为：原料、价格全是编的。
❌ 不许变成：「顾客做完都说像换了个人。」因为：顾客评价是编的。
**而你们这次连「上了个新项目」之外的信息都没有。**
那就讲过程、讲适合什么情况、讲怎么判断要不要做，绝不能自己补一个效果或价格。`,

  contentRaw: [
    '先看你平时愿不愿意打理：不愿意打理的，别选需要每天造型的',
    '再看发质和现状：干、油、受损，处理方式不一样',
    '描述需求用具体的话：不要「短一点」，要说「到锁骨上面一点」',
    '拿不准就先小范围试：先剪一点、先做一个区域，不合适还能改',
    '做完当场问清楚：几天内能洗、多久要补、平时怎么打理'
  ],
  customerPains: [
    '坐下了却说不清自己想要什么',
    '拿着图去，做出来完全不一样',
    '烫完更难打理，每天早上要多花二十分钟',
    '怕一进门就被推销办卡',
    '做完不好意思说不好，只能自己忍着'
  ]
};

module.exports = pack;

  };

  /* ---------- industries/cleaning ---------- */
  __defs['industries/cleaning'] = function (module, exports, require) {
'use strict';

/**
 * 家政保洁行业包（日常保洁 / 深度保洁 / 家电清洗 / 月嫂育儿）。
 *
 * 这行的信任点是「敢不敢让人进门」。资质、保险、几小时干完都不能替门店承诺，
 * 只能讲：怎么约、怎么看干得细不细、哪些地方最容易被糊弄。
 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'cleaning',
  label: '家政保洁',
  emoji: '🧹',
  subTypes: [
    { id: 'daily', label: '日常保洁' }, { id: 'deep', label: '深度保洁' },
    { id: 'appliance', label: '家电清洗' }, { id: 'nanny', label: '月嫂育儿' }
  ],
  words: {
    store: '我们店', staff: '保洁师', goods: '服务', customer: '下单的客户',
    tryVerb: '试', place: '客户家里'
  },
  roleIntro: '你服务过很多家政保洁团队，知道客户最怕「约了不来、来了应付」。内容就讲怎么约、怎么验收、哪里最容易出问题。',

  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '新服务 / 新设备', emoji: '🆕' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '到店福利', emoji: '🎁' },
    { id: 'outfit', label: '怎么验收不踩坑', emoji: '🧭' },
    { id: 'single', label: '主推服务', emoji: '⭐' },
    { id: 'season', label: '换季大扫除', emoji: '🍂' },
    { id: 'festival', label: '节前保洁', emoji: '🎊' },
    { id: 'daily', label: '上门日常', emoji: '🏬' },
    { id: 'staff', label: '老板 / 保洁师出镜', emoji: '🎤' },
    { id: 'auto', label: 'AI 帮我选', emoji: '✨' }
  ],

  second: {
    opening: {
      question: '开业这段时间，主要拍什么？',
      options: [
        { id: 'openday', label: '开业当天' }, { id: 'prepare', label: '开业前的准备' },
        { id: 'environment', label: '团队和装备' }, { id: 'openact', label: '开业活动' },
        { id: 'firstcustomer', label: '第一单' }, { id: 'teamstate', label: '保洁师状态' }, AI_PICK
      ]
    },
    newarrival: {
      question: '这次新的是什么？',
      options: [
        { id: 'newservice', label: '新服务项目' }, { id: 'newequip', label: '新设备' },
        { id: 'newarea', label: '新开的服务区域' }, { id: 'newteam', label: '新来的保洁师' },
        { id: 'newproduct', label: '新换的清洁用品' }, AI_PICK
      ]
    },
    activity: {
      question: '是什么活动？',
      options: [
        { id: 'openact', label: '开业活动' }, { id: 'festivalact', label: '节前活动' },
        { id: 'seasonact', label: '换季活动' }, { id: 'welfareact', label: '下单福利' },
        { id: 'memberact', label: '老客回馈' }, { id: 'annivact', label: '周年活动' }, AI_PICK
      ]
    },
    welfare: {
      question: '这次是什么福利？',
      options: [
        { id: 'freecheck', label: '免费上门看一眼' }, { id: 'oldcustomer', label: '老客户回馈' },
        { id: 'freesuggest', label: '免费给个清洁方案' }, { id: 'freearea', label: '顺手做一个区域' },
        { id: 'surprise', label: '免费小惊喜' }, AI_PICK
      ]
    },
    outfit: {
      question: '想教客户什么？',
      options: [
        { id: 'howtobook', label: '怎么约比较靠谱' }, { id: 'howtocheck', label: '怎么验收' },
        { id: 'beforeafter', label: '哪些地方最容易糊弄' }, { id: 'deepordaily', label: '深度和日常怎么选' },
        { id: 'avoidpit', label: '怎么避开常见的坑' }, AI_PICK
      ]
    },
    single: {
      question: '主推哪一类？',
      options: [
        { id: 'dailyclean', label: '日常保洁' }, { id: 'deepclean', label: '深度保洁' },
        { id: 'applianceclean', label: '家电清洗' }, { id: 'nannyservice', label: '月嫂育儿' },
        { id: 'moveclean', label: '搬入 / 搬出保洁' }, { id: 'bestseller', label: '下单最多的' }, AI_PICK
      ]
    },
    season: {
      question: '这次是什么节点？',
      options: [
        { id: 'springclean', label: '开春大扫除' }, { id: 'summer', label: '夏天除螨、空调' },
        { id: 'autumn', label: '秋天换季收纳' }, { id: 'winter', label: '冬天暖气前' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节点？',
      options: [
        { id: 'spring', label: '春节前' }, { id: 'newyear', label: '年末' },
        { id: 'movein', label: '搬家前后' }, { id: 'longholiday', label: '长假前' }, AI_PICK
      ]
    },
    daily: {
      question: '拍哪一面？',
      options: [
        { id: 'busy', label: '忙的时候' }, { id: 'quiet', label: '平时' },
        { id: 'behind', label: '出发前的准备' }, { id: 'detail', label: '别人不注意的细节' },
        { id: 'team', label: '保洁师的状态' }, AI_PICK
      ]
    },
    staff: {
      question: '谁来说？',
      options: [
        { id: 'bossstory', label: '老板讲讲自己的看法' }, { id: 'whythis', label: '为什么做这一行' },
        { id: 'standard', label: '我们干活的顺序' }, { id: 'attitude', label: '我们怎么对待客户家' }, AI_PICK
      ]
    },
    auto: {
      question: '你大概想拍哪个方向？',
      options: [
        { id: 'wantnew', label: '想拍新服务' }, { id: 'wantact', label: '想拍活动' },
        { id: 'wantsell', label: '想推一个主推服务' }, { id: 'wantdaily', label: '想拍上门日常' },
        { id: 'wantknow', label: '想让大家认识我们' }, { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  goals: [
    { id: 'comestore', label: '先了解我们' }, { id: 'tryon', label: '先下一单试试' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '了解新服务' },
    { id: 'learntips', label: '学一个验收方法' }, { id: 'solveproblem', label: '解决一个打扫的困扰' },
    { id: 'knowstore', label: '认识我们团队' }, { id: 'remember', label: '记住我们' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「先下一单试试」。
· 家政最大的门槛是「敢不敢让人进家门」，开头先把这层顾虑说破。
· 中间讲清楚上门会怎么做、需要客户配合什么、干多久大概。
· 结尾轻一点：「第一次可以先做日常，看看合不合适」。`,
    learntips: `目标是让人真的学到一点验收方法。
· 完全站在客户一侧：教怎么约、怎么验收、哪里最容易糊弄。
· 开头直接给方法，不要先介绍服务。
· 中间给 1~2 条能立刻用的检查点（门框顶、油烟机滤网、床底）。
· 绝不承诺「保证干净」「不满意免单」。`,
    solveproblem: `目标是解决一个具体困扰，让人觉得「说的就是我」。
· 开头直接说困扰（约了不来、来了应付、东西被弄坏、价格不透明）。
· 中间给一个实际办法，讲清楚为什么。
· 语气像干这行多年的人在说实话。`
  },

  speakers: [
    { id: 'boss', label: '老板' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '保洁师' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍清洁过程和对比配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是保洁师。天天上门干活，说的是自己手上的真实经验。
· 口吻像「我一般进门先看这几个地方」。
· 可以讲顺序、讲工具，但不许承诺「保证多干净」。`,
    noface: `这条视频不露脸，只拍清洁过程、工具、前后对比，配口播。
· 镜头语言：门框顶、油烟机、滤网、地脚线、抹布折法。
· 少依赖表情，多用「你看这里」「这样擦一遍」这种能配画面的说法。`
  },

  toneOverrides: {
    question: `开头抛一个问题切入，比如「你有没有请过保洁，来了两个小时，一看还是那样？」。
· 问题要真实，不贬低同行（说现象，不点名）。
· 后面顺着这个问题往下答。`,
    friend: '整体像朋友之间的提醒：「我跟你说」「我家请保洁都这么看」。'
  },

  subjectHint: {
    howtobook: '这一条讲怎么约，重点是把要求说清楚。',
    howtocheck: '这一条讲验收，给具体检查点。',
    deepordaily: '这一条讲两种服务的区别，帮客户选。',
    applianceclean: '这一条讲家电清洗，重点是什么情况该洗。'
  },

  sceneIdeas: [
    '具体的**请人上门的顾虑**（不敢让人进家、怕丢东西、怕弄坏）',
    '具体的**打扫困扰**（油烟机擦不动、床底积灰、玻璃有水印）',
    '具体的**判断方法**（看门框顶、看地脚线、看抹布是不是一块用到底）',
    '具体的**干活的顺序**（从上到下、从里到外）',
    '**上门的样子**（工具包、鞋套、分区干活）'
  ],
  forbiddenFacts: [
    '资质证书、保险、备案、培训认证',
    '服务时长承诺（几小时干完）、上门人数',
    '价格、套餐、加价项目、折扣',
    '员工人数、开了多少年、服务过多少家庭',
    '客户案例、别人家怎么打扫的（不许虚构订单）'
  ],
  hardBannedPhrases: ['五星级服务', '专业认证', '保证干净', '不满意免单',
    '全网最低', '一次到位', '彻底除菌', '母婴级安全', '零投诉'],
  compliance: [
    '不许承诺服务效果（保证干净、一次到位、彻底除菌）。',
    '不许编资质、保险、认证、备案。',
    '不许用「最 / 第一 / 唯一 / 顶级」这类绝对化说法，也不许贬低同行。',
    '不许编价格、时长、套餐内容。'
  ],
  aiTasteWords: ['焕然一新', '深度洁净', '呵护每一个角落', '品质生活',
    '省心省力', '专业团队', '安心之选', '一站式服务'],
  tasteReplacements: [
    '「焕然一新 / 深度洁净」→ 删掉，说「你自己看门框顶和地脚线，那两处最说明问题」',
    '「呵护每一个角落」→ 说「从里到外、从上到下，顺序不能乱」',
    '「省心省力」→ 说「你在旁边该干嘛干嘛，我们干完叫你」',
    '「专业团队 / 安心之选」→ 直接删掉，换成具体的干活细节'
  ],
  badExample: '专业团队，深度洁净，呵护每一个角落，让家焕然一新。',
  goodExample: '验收别只看地面：摸一下门框顶、看一眼地脚线，这两处糊弄不过去。',
  titleBad: '「五星级深度保洁，保证干净，不满意免单！」',
  titleGood: '「请保洁别只看地面，摸这两个地方」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「我们新上了一台设备，可以做沙发和床垫的深层清洁。」
✅ 可以说：「新上了一台设备，沙发和床垫可以上门做，做之前先看看材质合不合适。」
❌ 不许变成：「彻底除菌，除螨率 99%，母婴安全。」因为：功效和认证都是编的。
❌ 不许变成：「原价 599，现在 299。」因为：价格是编的。
❌ 不许变成：「服务过上万家庭，零投诉。」因为：数字是编的。
**而你们这次连「上了台新设备」之外的信息都没有。**
那就讲什么情况值得做、怎么判断，绝不能自己补一个效果或价格。`,

  contentRaw: [
    '验收先摸门框顶和地脚线，这两处最容易被跳过',
    '看抹布：一块抹布从厨房擦到卫生间，等于白擦',
    '深度和日常怎么选：油烟重、搬入前后做深度，平时做日常',
    '家电清洗看情况：油烟机滤网能抠出油就该洗了',
    '贵重物品、易碎的先收起来，别等出事再说'
  ],
  customerPains: [
    '约好了时间，人迟到或者临时不来',
    '来了两小时，看着哪儿都没怎么动',
    '擦完玻璃还是花的，有水印',
    '东西被弄坏了，也说不清是谁的责任',
    '价格一开始说得好，干到一半要加钱'
  ]
};

module.exports = pack;

  };

  /* ---------- industries/digital ---------- */
  __defs['industries/digital'] = function (module, exports, require) {
'use strict';

/**
 * 手机数码行业包（手机零售 / 维修 / 配件 / 二手机）。
 *
 * 这行的信任问题集中在「是不是原装、有没有被换过件」。
 * 写稿不能替店承诺正品和保修，只能讲怎么验、怎么问、怎么少花冤枉钱。
 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'digital',
  label: '手机数码',
  emoji: '📱',
  subTypes: [
    { id: 'phone', label: '手机零售' }, { id: 'repair', label: '手机维修' },
    { id: 'accessory', label: '配件' }, { id: 'secondhand', label: '二手机' }
  ],
  words: {
    store: '我们店', staff: '店员', goods: '机子', customer: '来买的人',
    tryVerb: '试', place: '店里'
  },
  roleIntro: '你服务过大量手机数码门店，清楚这行最忌讳替店打包票：不说原装正品、不报保修年限，只讲怎么验机、怎么问、怎么挑到合适的。',

  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '新机 / 新货到店', emoji: '🆕' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '到店福利', emoji: '🎁' },
    { id: 'outfit', label: '怎么挑不踩坑', emoji: '🧭' },
    { id: 'single', label: '主推机型 / 服务', emoji: '⭐' },
    { id: 'season', label: '换机周期', emoji: '🗓' },
    { id: 'festival', label: '节前 / 开学', emoji: '🎊' },
    { id: 'daily', label: '门店日常', emoji: '🏬' },
    { id: 'staff', label: '店主 / 店员出镜', emoji: '🎤' },
    { id: 'auto', label: 'AI 帮我选', emoji: '✨' }
  ],

  second: {
    opening: {
      question: '开业这段时间，主要拍什么？',
      options: [
        { id: 'openday', label: '开业当天' }, { id: 'prepare', label: '开业前的准备' },
        { id: 'environment', label: '店里什么样' }, { id: 'openact', label: '开业活动' },
        { id: 'firstcustomer', label: '第一批客人' }, { id: 'teamstate', label: '店员状态' }, AI_PICK
      ]
    },
    newarrival: {
      question: '这次到的是什么？',
      options: [
        { id: 'newphone', label: '新机' }, { id: 'secondbatch', label: '一批二手机' },
        { id: 'newaccessory', label: '新配件' }, { id: 'newservice', label: '新服务（贴膜、换电池）' },
        { id: 'wholebatch', label: '整批到货' }, AI_PICK
      ]
    },
    activity: {
      question: '是什么活动？',
      options: [
        { id: 'openact', label: '开业活动' }, { id: 'festivalact', label: '节日活动' },
        { id: 'schoolact', label: '开学季' }, { id: 'welfareact', label: '到店福利' },
        { id: 'memberact', label: '会员活动' }, { id: 'annivact', label: '店庆活动' }, AI_PICK
      ]
    },
    welfare: {
      question: '这次是什么福利？',
      options: [
        { id: 'freefilm', label: '免费贴膜' }, { id: 'freecheck', label: '免费帮你验一下机子' },
        { id: 'oldcustomer', label: '老顾客回馈' }, { id: 'freeclean', label: '免费清灰、清洁' },
        { id: 'surprise', label: '进店小惊喜' }, AI_PICK
      ]
    },
    outfit: {
      question: '想教大家什么？',
      options: [
        { id: 'howtocheck', label: '二手怎么验' }, { id: 'howtochoose', label: '新机怎么选' },
        { id: 'howtoask', label: '怎么问价不被绕' }, { id: 'repairjudge', label: '坏到什么程度值得修' },
        { id: 'avoidpit', label: '怎么避开常见的坑' }, AI_PICK
      ]
    },
    single: {
      question: '主推哪个方向？',
      options: [
        { id: 'phonemodel', label: '某一款机子' }, { id: 'seconditem', label: '二手好货' },
        { id: 'repairitem', label: '换屏 / 换电池' }, { id: 'accessoryitem', label: '配件（壳膜充电）' },
        { id: 'bestseller', label: '店里卖得最多的' }, AI_PICK
      ]
    },
    season: {
      question: '这次是什么节点？',
      options: [
        { id: 'schoolstart', label: '开学季' }, { id: 'newphone', label: '新机发布' },
        { id: 'yearstart', label: '年初换机' }, { id: 'batteryold', label: '电池不耐用了' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节点？',
      options: [
        { id: 'spring', label: '春节' }, { id: 'schoolstart', label: '开学' },
        { id: 'longholiday', label: '长假出游' }, { id: 'newyear', label: '年末' }, AI_PICK
      ]
    },
    daily: {
      question: '拍店里的哪一面？',
      options: [
        { id: 'busy', label: '忙的时候' }, { id: 'quiet', label: '闲的时候' },
        { id: 'behind', label: '验机、贴膜' }, { id: 'detail', label: '别人不注意的细节' },
        { id: 'team', label: '店里的人' }, AI_PICK
      ]
    },
    staff: {
      question: '谁来说？',
      options: [
        { id: 'bossstory', label: '店主讲讲自己的看法' }, { id: 'whythis', label: '为什么开这家店' },
        { id: 'standard', label: '我们验机的标准' }, { id: 'attitude', label: '我们怎么对待客人' }, AI_PICK
      ]
    },
    auto: {
      question: '你大概想拍哪个方向？',
      options: [
        { id: 'wantnew', label: '想拍新到的机子' }, { id: 'wantact', label: '想拍活动' },
        { id: 'wantsell', label: '想推一款机子' }, { id: 'wantdaily', label: '想拍拍店里日常' },
        { id: 'wantknow', label: '想让大家认识我们店' }, { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  goals: [
    { id: 'comestore', label: '来店里看看' }, { id: 'tryon', label: '来上手试' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '了解新到的机子' },
    { id: 'learntips', label: '学一个验机方法' }, { id: 'solveproblem', label: '解决一个用机困扰' },
    { id: 'knowstore', label: '认识这家店' }, { id: 'remember', label: '记住这家店' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「来上手试一台」。
· 手机最怕参数好看、上手不顺手，开头把这个道理说清楚。
· 中间讲清楚来了能试什么（握感、屏幕、拍照、声音）。
· 结尾轻一点：「先上手玩十分钟，比看参数准」。`,
    learntips: `目标是让人真的学到一点验机、选择的方法。
· 完全站在顾客一侧：教怎么验、怎么问、什么情况不值得修。
· 开头直接给方法，不要先介绍机型。
· 中间给 1~2 条立刻能用的标准（看电池、看屏幕边框、问换过什么件）。
· 绝不承诺正品、保修、官保。`,
    solveproblem: `目标是解决一个具体困扰，让人觉得「说的就是我」。
· 开头直接说困扰（电池一天两充、换屏后手感不对、怕买到翻新）。
· 中间给一个实际办法，讲清楚为什么。
· 语气像懂行的朋友，不像销售。`
  },

  speakers: [
    { id: 'boss', label: '店主' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '店员' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍机子和手部操作配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是店员。天天验机、贴膜，说的是自己上手之后的判断。
· 口吻像「我一般接过来先看这三个地方」。
· 可以讲验机方法、讲手感，但绝不打包票说原装正品。`,
    noface: `这条视频不露脸，只拍机子、手部操作、店里，配口播。
· 镜头语言：屏幕特写、边框、后盖、电池页面、插口、贴膜过程。
· 少依赖表情，多用「你看这个边」「镜头拉近一点」这种能配画面的说法。`
  },

  toneOverrides: {
    question: `开头抛一个问题切入，比如「你有没有买过二手，用了两个月才发现屏幕换过？」。
· 问题要真实，不吓人。
· 后面顺着这个问题往下答。`,
    friend: '整体像朋友之间的提醒：「我跟你说」「我自己验机都看这几样」。'
  },

  subjectHint: {
    howtocheck: '这一条教二手怎么验，不评价具体商家。',
    howtochoose: '这一条讲新机怎么选，重点在用途不跑分。',
    repairjudge: '这一条讲什么情况值得修，不承诺修复效果。',
    phonemodel: '这一条讲某一款机子，只讲上手感受，不报参数和价格。'
  },

  sceneIdeas: [
    '具体的**用机场景**（通勤刷视频、带娃拍照、打游戏、老人用）',
    '具体的**购买顾虑**（怕翻新、怕换过件、怕买了就降价）',
    '具体的**判断方法**（看屏幕边框、看电池、试指纹、试拍照）',
    '具体的**用起来的感受**（握感、重量、声音、发热）',
    '**店里的样子**（验机台、贴膜、成排的机子）'
  ],
  forbiddenFacts: [
    '原装、正品、官方授权、官保、全国联保',
    '电池健康度、跑分、处理器型号、内存规格',
    '价格、以旧换新金额、补贴、分期',
    '保修年限、免费换新、包修次数',
    '顾客案例、别人的机子怎么修的（不许虚构维修记录）'
  ],
  hardBannedPhrases: ['原装正品', '假一赔十', '全网最低', '官方授权', '国行全新',
    '无拆无修', '包过检', '官方翻新', '三年保修'],
  compliance: [
    '不许承诺原装正品、官方授权、保修年限——没有授权就不许说。',
    '不许承诺维修效果（「换完跟新的一样」这类一律不许）。',
    '不许用「最 / 第一 / 唯一 / 顶级」这类绝对化说法，也不许贬低同行。',
    '不许编价格、补贴、以旧换新金额、参数。'
  ],
  aiTasteWords: ['性能怪兽', '旗舰体验', '极致轻薄', '黑科技',
    '性价比之王', '全能选手', '畅快体验', '硬核配置'],
  tasteReplacements: [
    '「性能怪兽 / 硬核配置」→ 删掉，说「你平时就刷视频聊微信，这类机子完全够用」',
    '「旗舰体验 / 极致轻薄」→ 说「拿在手里轻不轻、单手能不能用，你自己试」',
    '「性价比之王」→ 说「同价位里这几台的差别在哪，我给你摆一摆」',
    '「黑科技」→ 直接删掉，换成具体能试的功能'
  ],
  badExample: '旗舰性能，极致轻薄，黑科技加持，性价比之王，买到就是赚到。',
  goodExample: '二手先看屏幕边框：换过屏的边框会有点溢胶，用手摸一圈就能感觉出来。',
  titleBad: '「原装正品，全网最低，假一赔十！」',
  titleGood: '「买二手先看这一个地方，能少踩很多坑」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「我们店到了一批二手机，成色不错。」
✅ 可以说：「到了一批二手机，成色有高有低，你可以来上手挑，我教你怎么看。」
❌ 不许变成：「原装正品，无拆无修，官方保修一年。」因为：这些都没有依据。
❌ 不许变成：「原价 4999，现在只要 1999。」因为：价格是编的。
❌ 不许变成：「上千位顾客回购，好评第一。」因为：数字和评价是编的。
**而你们这次连「到了一批二手机」之外的信息都没有。**
那就讲怎么验、怎么看，绝不能自己补一个正品承诺、参数或价格。`,

  contentRaw: [
    '二手先看屏幕边框：换过屏的会溢胶，手指摸一圈就有感觉',
    '试指纹和人脸：这两个坏了修起来最贵',
    '拍照对着白墙拍一张，看有没有黑点',
    '问清楚换过什么件，敢直接说的店更靠谱',
    '电池不耐用先别换机：多数情况换块电池还能用一两年'
  ],
  customerPains: [
    '怕买到翻新机、换过屏的',
    '换完屏手感不对，边缘还翘',
    '换机时数据导不过去，怕丢东西',
    '参数看不懂，不知道选哪款',
    '刚买完就降价，心里不舒服'
  ]
};

module.exports = pack;

  };

  /* ---------- industries/fashion ---------- */
  __defs['industries/fashion'] = function (module, exports, require) {
'use strict';

/**
 * 服装行业包 —— V0.1 的全部内容原样搬到这里，保证回归不退化。
 * 通用部分（7 步骨架、时长、通用铁律）在 lib/base.js。
 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'fashion',
  label: '服装',
  emoji: '👕',
  subTypes: [
    { id: 'womens', label: '女装' },
    { id: 'mens', label: '男装' },
    { id: 'kids', label: '童装' },
    { id: 'mix', label: '综合集合店' }
  ],

  words: {
    store: '我们店', staff: '导购', goods: '衣服', customer: '顾客',
    tryVerb: '穿', place: '店里'
  },

  roleIntro: '你服务过大量实体服装店，非常清楚一条门店口播视频该长什么样、不该长什么样。',

  /* ------------------------- 第一步：今天拍什么 ------------------------- */
  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '新品到店', emoji: '👕' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '到店福利', emoji: '🎁' },
    { id: 'outfit', label: '穿搭分享', emoji: '👗' },
    { id: 'single', label: '单品推荐', emoji: '👜' },
    { id: 'season', label: '换季上新', emoji: '🍃' },
    { id: 'festival', label: '节日 / 节庆', emoji: '🎊' },
    { id: 'daily', label: '门店日常', emoji: '🏬' },
    { id: 'staff', label: '老板 / 店长 / 导购出镜', emoji: '🎤' },
    { id: 'auto', label: 'AI 帮我选', emoji: '✨' }
  ],

  /* ------------------------- 第二步：跟着第一步变 ------------------------- */
  second: {
    opening: {
      question: '开业这段时间，主要拍什么？',
      options: [
        { id: 'openday', label: '开业当天现场' }, { id: 'prepare', label: '开业前的准备' },
        { id: 'environment', label: '新店环境介绍' }, { id: 'openact', label: '开业活动' },
        { id: 'firstcustomer', label: '第一批顾客' }, { id: 'display', label: '货品陈列' },
        { id: 'teamstate', label: '店员状态' }, AI_PICK
      ]
    },
    newarrival: {
      question: '今天主要拍什么？',
      options: [
        { id: 'dress', label: '连衣裙' }, { id: 'coat', label: '外套' }, { id: 'knit', label: '针织衫' },
        { id: 'top', label: '上衣' }, { id: 'pants', label: '裤子' }, { id: 'skirt', label: '半身裙' },
        { id: 'shoesbag', label: '鞋包配饰' }, { id: 'several', label: '多款新品' },
        { id: 'wholestore', label: '整店新品' }, AI_PICK
      ]
    },
    activity: {
      question: '是什么活动？',
      options: [
        { id: 'openact', label: '开业活动' }, { id: 'festivalact', label: '节日活动' },
        { id: 'seasonact', label: '换季活动' }, { id: 'welfareact', label: '到店福利' },
        { id: 'memberact', label: '会员活动' }, { id: 'limitedact', label: '限时活动' },
        { id: 'annivact', label: '店庆活动' }, AI_PICK
      ]
    },
    welfare: {
      question: '这次是什么福利？',
      options: [
        { id: 'visitorgift', label: '到店有礼' }, { id: 'trygift', label: '试穿有礼' },
        { id: 'oldcustomer', label: '老顾客回馈' }, { id: 'newexperience', label: '新品体验' },
        { id: 'freesuggest', label: '免费搭配建议' }, { id: 'surprise', label: '进店小惊喜' },
        { id: 'memberonly', label: '会员专属' }, AI_PICK
      ]
    },
    outfit: {
      question: '拍哪种穿搭？',
      options: [
        { id: 'commute', label: '日常通勤' }, { id: 'date', label: '约会穿搭' },
        { id: 'casual', label: '休闲穿搭' }, { id: 'elegant', label: '气质穿搭' },
        { id: 'slim', label: '显瘦穿搭' }, { id: 'lightmature', label: '轻熟穿搭' },
        { id: 'young', label: '年轻感穿搭' }, { id: 'seasonshift', label: '换季穿搭' },
        { id: 'oneitemmany', label: '一衣多穿' }, AI_PICK
      ]
    },
    single: {
      question: '推荐什么单品？',
      options: [
        { id: 'dress', label: '连衣裙' }, { id: 'coat', label: '外套' }, { id: 'knit', label: '针织衫' },
        { id: 'top', label: '上衣' }, { id: 'pants', label: '裤子' }, { id: 'skirt', label: '半身裙' },
        { id: 'shoes', label: '鞋子' }, { id: 'bag', label: '包包' },
        { id: 'accessory', label: '配饰' }, AI_PICK
      ]
    },
    season: {
      question: '换季主要拍什么？',
      options: [
        { id: 'spring', label: '春装上新' }, { id: 'summer', label: '夏装上新' },
        { id: 'autumn', label: '秋装上新' }, { id: 'winter', label: '冬装上新' },
        { id: 'clearance', label: '换季清仓' }, { id: 'seasonmix', label: '换季搭配' },
        { id: 'transition', label: '过渡款' }, { id: 'wardrobe', label: '衣柜换季整理' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节日？',
      options: [
        { id: 'springfestival', label: '春节' }, { id: 'valentine', label: '情人节' },
        { id: 'womenday', label: '三八节' }, { id: 'motherday', label: '母亲节' },
        { id: 'love520', label: '520' }, { id: 'children', label: '儿童节' },
        { id: 'qixi', label: '七夕' }, { id: 'midautumn', label: '中秋节' },
        { id: 'national', label: '国庆' }, { id: 'double11', label: '双十一' },
        { id: 'newyear', label: '元旦' }, { id: 'christmas', label: '圣诞节' }, AI_PICK
      ]
    },
    daily: {
      question: '店里是什么场景？',
      options: [
        { id: 'busy', label: '今天店里很忙' }, { id: 'newgoods', label: '新货刚到' },
        { id: 'sorting', label: '店员整理货品' }, { id: 'tryon', label: '顾客试衣场景' },
        { id: 'display', label: '店铺陈列' }, { id: 'routine', label: '日常工作' },
        { id: 'recommend', label: '店员推荐' }, { id: 'bossdaily', label: '老板日常' }, AI_PICK
      ]
    },
    staff: {
      question: '想让镜头前的人，给大家留下什么印象？',
      options: [
        { id: 'bossself', label: '老板本人' }, { id: 'managerself', label: '店长' },
        { id: 'seniorguide', label: '资深导购' }, { id: 'newguide', label: '新来的店员' },
        { id: 'wholteam', label: '整个团队' }, { id: 'bossheart', label: '老板讲心里话' },
        { id: 'managerpro', label: '店长讲专业' }, { id: 'guidedaily', label: '导购讲日常' }, AI_PICK
      ]
    },
    auto: {
      question: '大概想拍点什么？说不清楚也没关系。',
      options: [
        { id: 'wantnew', label: '想拍刚到的新款' }, { id: 'wantact', label: '想拍店里搞的活动' },
        { id: 'wantoutfit', label: '想拍点穿搭内容' }, { id: 'wantsingle', label: '想推荐一件单品' },
        { id: 'wantdaily', label: '想拍拍店里的日常' }, { id: 'wantknow', label: '想让大家认识我们店' },
        { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  /* ------------------------- 第三步：想让顾客干什么 ------------------------- */
  goals: [
    { id: 'comestore', label: '来店里看看' }, { id: 'tryon', label: '来试试衣服' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '了解新品' },
    { id: 'learntips', label: '学一个穿搭方法' }, { id: 'solveproblem', label: '解决一个穿衣问题' },
    { id: 'knowstore', label: '认识这家店' }, { id: 'remember', label: '记住这家店' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「亲自穿上试一试」。
· 开头点破一个事实：衣服好不好，看图和上身是两回事。
· 中间讲清楚为什么这件（这类）值得试、试的时候该注意什么。
· 结尾把「来试一下」说出来，语气要轻松，不要有推销压力。`,
    learntips: `目标是让看的人真的学到一点穿搭方法，从而觉得「这个人懂」。
· 硬广感要降到最低 —— 这条更像一个真心分享穿搭经验的人，不是在卖货。
· 开头不要介绍商品，直接给方法、给判断。
· 中间给出 1~2 条真正可操作的方法，用大白话讲（可以直接用下面的行业通用方法）。
· 全篇几乎不提产品，最多最后一句自然带到「店里可以试」。`,
    solveproblem: `目标是解决一个具体的穿衣困扰，让人觉得「说的就是我」。
· 开头直接把困扰说出来（显胖、没衣服穿、不会配色、买回来不会搭、季节交替不知道穿什么……）。
· 中间给一个切实能用的小办法，讲清楚为什么有用。
· 不要用行业黑话，越像隔壁懂穿衣服的人在教你越好。
· 结尾可以自然带到店里试，也可以不带 —— 内容价值优先。`
  },

  /* ------------------------- 第四步：谁出镜 ------------------------- */
  speakers: [
    { id: 'boss', label: '老板' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '导购' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍衣服配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是导购。导购离衣服最近，说的是自己天天摸、天天看之后的真实感受。
· 口吻像「这件我真的建议大家去试一下」。
· 具体、实在，不讲大道理。`,
    noface: `这条视频不露脸，只拍衣服，配口播。
· 文案必须考虑镜头语言：衣服特写、上身效果、搭配展示、门店环境、手部展示、细节展示。
· 因此文案要少依赖「表情」和「眼神」这类只有露脸才能传达的东西。
· 多用「你摸摸这个料子」「你看这个肩线」「镜头拉近看一下」这种能配画面的说法。
· 语气可以更客观、更聚焦在衣服本身。`
  },

  toneOverrides: {
    question: `开头用「抛一个问题」的方式切入（这一条主要影响开头）。
· 这个问题要问到人心上，比如「你有没有那种，衣柜里塞满了，但早上还是觉得没得穿的时候？」
· 后面要顺着这个问题往下答。`
  },

  /* ------------------------- 第二步内容方向提示 ------------------------- */
  subjectHint: {
    dress: '这一条围绕连衣裙来讲。', coat: '这一条围绕外套来讲。',
    knit: '这一条围绕针织衫来讲。', top: '这一条围绕上衣来讲。',
    pants: '这一条围绕裤子来讲。', skirt: '这一条围绕半身裙来讲。',
    shoesbag: '这一条围绕鞋包配饰来讲。', shoes: '这一条围绕鞋子来讲。',
    bag: '这一条围绕包包来讲。', accessory: '这一条围绕配饰来讲。',
    several: '这一条讲的是多款新品，要有整体感，不要只盯着一个款。',
    wholestore: '这一条讲整店的新品，重点是这批货整体给人的感觉。'
  },

  /* ------------------------- 行业知识（反编造 / 反 AI 腔） ------------------------- */
  sceneIdeas: [
    '具体的**生活场景**（早上出门前站在衣柜前那种犹豫）',
    '具体的**穿衣困扰**（显胖、显矮、买了一堆但还是没得穿）',
    '具体的**判断方法**（怎么挑版型、怎么搭颜色、怎么看出适不适合自己）',
    '具体的**穿着感受**（穿上去松不松、抬手会不会紧绷、坐下来舒不舒服）',
    '**门店的氛围感**（店员在忙什么、衣服挂出来的样子、试衣间里的对话）'
  ],
  forbiddenFacts: [
    '面料成分、含毛量、含棉量、克重、产地、工艺、功能（免烫 / 防皱 / 抗起球 / 保暖指数）',
    '尺码、断码情况、可调货范围',
    '功效承诺（显瘦多少斤、显白、显高多少厘米、抗皱不变形、穿上就显年轻十岁）',
    '具体款式细节（什么颜色、什么版型、几个扣子、什么面料）—— 你没见过这件衣服，就别说它长什么样'
  ],
  hardBannedPhrases: ['版型宽松', '不挑身材', '颜色百搭', '料子很有质感', '穿上显气质', '不显臃肿',
    '版型很正', '垂坠感不错', '剪裁利落', '面料挺括', '质感很好', '腰部收得刚好'],
  compliance: [
    '不许出现任何「显瘦多少斤 / 显白 / 显高多少厘米」这类没有依据的功效承诺。'
  ],
  aiTasteWords: ['廓形', '高级感', '氛围感', '质感拉满', '显白到发光', '设计理念',
    '彰显', '优雅气质', '轻奢', '匠心', '穿搭灵感', '时尚态度'],
  tasteReplacements: [
    '「廓形」→ 说「版型」，或者直接说穿上是什么样子',
    '「高级感」→ 说「看着干净、不显廉价」',
    '「氛围感」→ 说「整体顺眼」',
    '「彰显」→ 说「显」「看着」',
    '「轻奢」→ 直接删掉，或说「不贵但体面」'
  ],
  badExample: '这款连衣裙采用时尚设计理念，能够充分彰显女性优雅魅力。',
  goodExample: '这条裙子我觉得挺适合平时不太会搭衣服的人，穿上不用折腾，整体就比较顺。',
  titleBad: '「全网最好看的裙子来了！」',
  titleGood: '「今年春天，这几种裙子真的很适合日常穿」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「这件羊绒大衣 1200 多，含羊毛，适合通勤穿。」
✅ 可以说：「一千二的预算，含羊毛的大衣，通勤穿挺合适，你可以来店里试一下。」
❌ 不许变成：「原价 2999，今天只要 1299！」因为：用户没说过原价，也没说过现在卖 1299。
❌ 不许变成：「100% 纯山羊绒，专柜同款。」因为：用户只说「含羊毛」，没说纯羊绒，也没说专柜。
❌ 不许变成：「穿上立马显瘦十斤。」因为：这是功效承诺，用户从没说过。
**而你们这次的情况更极端 —— 连「1200 多」「含羊毛」这样的信息都没有。**
那就连「一千二的预算」「含羊毛」都不许写。你只能写：
「通勤穿的大衣，其实最怕的就是显得人很笨重 —— 所以到店里，你一定要先做这个动作。」`,

  contentRaw: [
    '先看身形：肩宽、身高、上下身比例，决定版型往哪个方向选',
    '再看场合：通勤、约会、休闲，同一件衣服不同搭法差别很大',
    '一定要摸面料：捏一下看回弹，看会不会起球、透不透',
    '试穿要做几个动作：抬手、坐下、转身，看会不会绷',
    '基础款太多的时候，不用急着买新的，先换掉三个地方：鞋、包、外搭'
  ],
  customerPains: [
    '只看图片下单，到手发现色差和垂坠感完全不一样',
    '不看面料，穿两次就起球变形',
    '尺码按平时穿的买，没试就下单，肩线不对',
    '只图便宜，忽略版型，穿一次就压箱底',
    '买了一堆，但互相搭不起来，还是没得穿'
  ]
};

module.exports = pack;

  };

  /* ---------- industries/fitness ---------- */
  __defs['industries/fitness'] = function (module, exports, require) {
'use strict';

/**
 * 健身行业包（健身房 / 瑜伽普拉提 / 私教工作室 / 舞蹈）。
 *
 * 这行最容易被逼着说「月瘦十斤」「七天练出马甲线」，
 * 一句写进去就是虚假宣传，所以全部改成「怎么开始、怎么判断、怎么不受伤」。
 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'fitness',
  label: '健身',
  emoji: '🏋️',
  subTypes: [
    { id: 'gym', label: '健身房' }, { id: 'yoga', label: '瑜伽 / 普拉提' },
    { id: 'pt', label: '私教工作室' }, { id: 'dance', label: '舞蹈' }
  ],
  words: {
    store: '我们馆', staff: '教练', goods: '课程', customer: '来练的人',
    tryVerb: '练', place: '馆里'
  },
  roleIntro: '你服务过大量健身和舞蹈场馆，清楚这行不能卖「结果」，只能卖「开始的第一步」——把门槛讲低，让人敢来第一次。',

  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '新课 / 新器械', emoji: '🆕' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '体验福利', emoji: '🎁' },
    { id: 'outfit', label: '新手怎么开始', emoji: '🧭' },
    { id: 'single', label: '主推课程', emoji: '⭐' },
    { id: 'season', label: '季节 / 时间安排', emoji: '🗓' },
    { id: 'festival', label: '节后恢复', emoji: '🎊' },
    { id: 'daily', label: '馆里日常', emoji: '🏬' },
    { id: 'staff', label: '教练 / 主理人出镜', emoji: '🎤' },
    { id: 'auto', label: 'AI 帮我选', emoji: '✨' }
  ],

  second: {
    opening: {
      question: '开业这段时间，主要拍什么？',
      options: [
        { id: 'openday', label: '开业当天' }, { id: 'prepare', label: '开业前的准备' },
        { id: 'environment', label: '场地什么样' }, { id: 'openact', label: '开业活动' },
        { id: 'firstmember', label: '第一批来练的人' }, { id: 'teamstate', label: '教练团队' }, AI_PICK
      ]
    },
    newarrival: {
      question: '这次上的是什么？',
      options: [
        { id: 'newclass', label: '一门新课' }, { id: 'newdevice', label: '新到器械' },
        { id: 'newtime', label: '新加的时段' }, { id: 'newcoach', label: '新来的教练' },
        { id: 'newzone', label: '新开的区域' }, AI_PICK
      ]
    },
    activity: {
      question: '是什么活动？',
      options: [
        { id: 'openact', label: '开业活动' }, { id: 'festivalact', label: '节日活动' },
        { id: 'seasonact', label: '换季活动' }, { id: 'welfareact', label: '体验福利' },
        { id: 'memberact', label: '会员活动' }, { id: 'annivact', label: '周年活动' }, AI_PICK
      ]
    },
    welfare: {
      question: '这次是什么福利？',
      options: [
        { id: 'firsttry', label: '第一次来可以先体验' }, { id: 'oldmember', label: '老会员回馈' },
        { id: 'freeassess', label: '免费帮你看看基础情况' }, { id: 'freeclass', label: '免费跟一节团课' },
        { id: 'surprise', label: '进店小惊喜' }, AI_PICK
      ]
    },
    outfit: {
      question: '想教新手什么？',
      options: [
        { id: 'howtostart', label: '第一次来该做什么' }, { id: 'howtochoose', label: '课程怎么选' },
        { id: 'howtojudge', label: '怎么判断教练适不适合自己' }, { id: 'avoidhurt', label: '怎么不受伤' },
        { id: 'frequency', label: '一周练几次合适' }, AI_PICK
      ]
    },
    single: {
      question: '主推哪类课程？',
      options: [
        { id: 'gymclass', label: '器械 / 力量' }, { id: 'cardio', label: '有氧 / 减脂课' },
        { id: 'yogaclass', label: '瑜伽 / 普拉提' }, { id: 'danceclass', label: '舞蹈' },
        { id: 'ptclass', label: '一对一私教' }, { id: 'bestseller', label: '馆里报得最多的' }, AI_PICK
      ]
    },
    season: {
      question: '这次是什么变化？',
      options: [
        { id: 'summer', label: '天热了' }, { id: 'winter', label: '天冷了' },
        { id: 'busyseason', label: '忙起来了，时间少' }, { id: 'holiday', label: '放假期间' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节点？',
      options: [
        { id: 'spring', label: '春节后' }, { id: 'newyear', label: '年末年初' },
        { id: 'summerstart', label: '入夏前' }, { id: 'longholiday', label: '长假期间' }, AI_PICK
      ]
    },
    daily: {
      question: '拍馆里的哪一面？',
      options: [
        { id: 'busy', label: '上课的时候' }, { id: 'quiet', label: '人少的时候' },
        { id: 'behind', label: '教练在准备什么' }, { id: 'detail', label: '别人不注意的细节' },
        { id: 'team', label: '馆里的人' }, AI_PICK
      ]
    },
    staff: {
      question: '谁来说？',
      options: [
        { id: 'bossstory', label: '主理人讲讲自己的看法' }, { id: 'whythis', label: '为什么做这一行' },
        { id: 'standard', label: '我们教课的标准' }, { id: 'attitude', label: '我们怎么对待新手' }, AI_PICK
      ]
    },
    auto: {
      question: '你大概想拍哪个方向？',
      options: [
        { id: 'wantnew', label: '想拍新课 / 新器械' }, { id: 'wantact', label: '想拍活动' },
        { id: 'wantsell', label: '想推一门主推课' }, { id: 'wantdaily', label: '想拍拍馆里日常' },
        { id: 'wantknow', label: '想让大家认识我们馆' }, { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  goals: [
    { id: 'comestore', label: '来馆里看看' }, { id: 'tryon', label: '来试一节课' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '了解新课程' },
    { id: 'learntips', label: '学一个开始的思路' }, { id: 'solveproblem', label: '解决一个练不动的困扰' },
    { id: 'knowstore', label: '认识这家馆' }, { id: 'remember', label: '记住这家馆' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「来试一节课」。
· 新手最大的门槛是「怕自己不行、怕被人看」，开头先把这层顾虑说出来。
· 中间讲清楚第一次来会做什么、需要带什么、会不会跟不上。
· 结尾轻一点：「先来跟一节试试，跟不上也没关系」。`,
    learntips: `目标是让人真的学到一点「怎么开始、怎么判断」。
· 完全站在新手一侧：教怎么选课、怎么看教练、怎么避免受伤。
· 开头直接给结论，不要先介绍场馆。
· 中间给 1~2 条立刻能用的方法（第一次先做什么、什么课不适合新手）。
· 绝不承诺任何身材或体重变化。`,
    solveproblem: `目标是解决一个具体困扰，让人觉得「说的就是我」。
· 开头直接说困扰（办了卡不去、不知道从哪开始、一个人不敢进器械区）。
· 中间给一个能落地的小办法，讲清楚为什么有用。
· 语气像过来人，不像教练在训人。`
  },

  speakers: [
    { id: 'boss', label: '主理人' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '教练' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍课上和场地配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是教练。教练天天带人练，说的是自己看多了之后的真实判断。
· 口吻像「第一次来我一般会让你先做这个」。
· 可以讲动作、讲节奏，但绝不许承诺身材变化。`,
    noface: `这条视频不露脸，只拍课上的动作、器械、场地，配口播。
· 镜头语言：动作示范、器械特写、团体课全景、纠正手法的近景。
· 少依赖表情，多用「你看这个动作」「注意这一步」这种能配画面的说法。
· 可以边示范边讲。`
  },

  toneOverrides: {
    question: `开头抛一个问题切入，比如「你有没有办过卡，去了三次就再也没去过？」。
· 问题要真实，别像销售话术。
· 后面顺着这个问题往下答。`,
    friend: '整体像朋友之间的建议：「我跟你说」「我一开始也是这么过来的」。'
  },

  subjectHint: {
    howtostart: '这一条教第一步做什么，不推课。',
    howtochoose: '这一条讲怎么选课，讲清楚什么情况适合什么。',
    howtojudge: '这一条讲怎么判断教练，不评价具体人。',
    ptclass: '这一条讲一对一，重点是什么人适合、怎么用。'
  },

  sceneIdeas: [
    '具体的**新手门槛**（不会用器械、怕动作被笑、跟不上团课节奏）',
    '具体的**坚持困扰**（忙起来就不去、练两天没感觉就放弃、一个人很难开始）',
    '具体的**判断方法**（先练什么、怎么排顺序、怎么判断强度够不够）',
    '具体的**练完的真实状态**（第二天酸、出汗、睡得沉、吃饭香）',
    '**场馆本身的样子**（早课、晚高峰、教练在纠正动作）'
  ],
  forbiddenFacts: [
    '体重、体脂、围度变化，以及任何「多久能瘦多少」的承诺',
    '课程价格、卡种、折扣、赠送课时、有效期',
    '教练资质证书、比赛名次、带过多少学员、从业年限',
    '器械品牌型号、场地面积、门店数量',
    '会员案例、前后对比、别人练了多久'
  ],
  hardBannedPhrases: ['月瘦十斤', '躺着瘦', '七天练出马甲线', '包瘦', '暴汗燃脂',
    '快速见效', '一次就有效果', '不练也能瘦', '塑形神器', '燃脂黑科技'],
  compliance: [
    '绝对不许承诺减重、减脂、塑形效果，也不许给具体数字。',
    '不许涉及医疗（治疗腰颈椎、康复训练、矫正体态当成治疗）。',
    '不许用「最 / 第一 / 唯一 / 顶级」这类绝对化说法，也不许贬低同行。',
    '不许编造价格、课时、有效期、赠送内容。'
  ],
  aiTasteWords: ['燃脂', '塑形', '打造完美身材', '科学训练体系', '专业指导',
    '蜕变', '自律即自由', '汗水不会辜负', '解锁更好的自己'],
  tasteReplacements: [
    '「燃脂 / 塑形」→ 删掉，说「这节课主要练哪块，练完你自己能感觉到」',
    '「蜕变 / 更好的自己」→ 说「先坚持来几次，身体会给你反馈」',
    '「科学训练体系」→ 说「先看你现在的状态，再决定练什么」',
    '「汗水不会辜负」→ 直接删掉，换成具体动作或感受'
  ],
  badExample: '科学训练体系，专业指导，帮你燃烧脂肪，重塑完美身材，遇见更好的自己。',
  goodExample: '第一次来别急着上大重量，先让教练看你几个基础动作，知道哪里紧、哪里弱，再排计划。',
  titleBad: '「七天练出马甲线，躺着也能瘦！」',
  titleGood: '「办了卡不去？先解决这一步」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「我们馆新开了一门课，适合新手。」
✅ 可以说：「新开了一门课，动作难度是给新手准备的，你可以来跟一节看看跟不跟得上。」
❌ 不许变成：「七天速成，月瘦十斤，一次就见效。」因为：效果承诺是红线。
❌ 不许变成：「原价 2999，现在报名只要 999。」因为：价格是编的。
❌ 不许变成：「国家级教练亲自带，带出过多少学员。」因为：资质和数字全是编的。
**而你们这次连「开了门新课、面向新手」之外的信息都没有。**
那就讲第一节课会发生什么、怎么判断跟不跟得上，绝不能自己补一个效果或价格。`,

  contentRaw: [
    '第一次先做基础动作：深蹲、推、拉、走，把动作做对再谈重量',
    '先看自己的时间：一周能来几次，再决定报什么课',
    '判断教练看两点：会不会先问你情况、会不会纠正细节',
    '练完第二天酸是正常的，疼到影响走路就要停',
    '别一上来就追求出汗多，能做完整套动作更重要'
  ],
  customerPains: [
    '办了卡，去了三次就再也没去过',
    '进了器械区不知道先练哪个',
    '一个人练怕动作错了被人看见',
    '练了两周没感觉，就不想去了',
    '团课跟不上，站在最后面越练越没信心'
  ]
};

module.exports = pack;

  };

  /* ---------- industries/flower ---------- */
  __defs['industries/flower'] = function (module, exports, require) {
'use strict';

/**
 * 花艺行业包（鲜花花束 / 花礼定制 / 绿植盆栽 / 花艺课）。
 *
 * 花店的核心不是「花多好看」，是「送对人、别两天就蔫」。
 * 产地、进口、花期天数都别碰，讲怎么挑、怎么养、什么场合送什么。
 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'flower',
  label: '花艺',
  emoji: '💐',
  subTypes: [
    { id: 'bouquet', label: '鲜花花束' }, { id: 'gift', label: '花礼定制' },
    { id: 'plant', label: '绿植盆栽' }, { id: 'class', label: '花艺课' }
  ],
  words: {
    store: '我们店', staff: '花艺师', goods: '花', customer: '来买花的人',
    tryVerb: '看', place: '店里'
  },
  roleIntro: '你服务过很多花店，知道买花的人最怕两件事：送错了、拿回去两天就蔫。内容就讲这两件事怎么避免，不碰产地和进口。',

  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '新到的花', emoji: '🆕' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '到店福利', emoji: '🎁' },
    { id: 'outfit', label: '怎么选花不踩坑', emoji: '🧭' },
    { id: 'single', label: '主推花礼', emoji: '⭐' },
    { id: 'season', label: '当季花材', emoji: '🌿' },
    { id: 'festival', label: '节日送花', emoji: '🎊' },
    { id: 'daily', label: '门店日常', emoji: '🏬' },
    { id: 'staff', label: '店主 / 花艺师出镜', emoji: '🎤' },
    { id: 'auto', label: 'AI 帮我选', emoji: '✨' }
  ],

  second: {
    opening: {
      question: '开业这段时间，主要拍什么？',
      options: [
        { id: 'openday', label: '开业当天' }, { id: 'prepare', label: '开业前的准备' },
        { id: 'environment', label: '店里什么样' }, { id: 'openact', label: '开业活动' },
        { id: 'firstcustomer', label: '第一批客人' }, { id: 'teamstate', label: '店里的人' }, AI_PICK
      ]
    },
    newarrival: {
      question: '这次到的是什么花？',
      options: [
        { id: 'freshflowers', label: '鲜花' }, { id: 'potted', label: '绿植盆栽' },
        { id: 'dried', label: '干花' }, { id: 'giftbox', label: '花礼盒' },
        { id: 'seasonal', label: '当季才有的' }, { id: 'wholebatch', label: '整批新货' }, AI_PICK
      ]
    },
    activity: {
      question: '是什么活动？',
      options: [
        { id: 'openact', label: '开业活动' }, { id: 'festivalact', label: '节日活动' },
        { id: 'seasonact', label: '换季活动' }, { id: 'welfareact', label: '到店福利' },
        { id: 'memberact', label: '会员活动' }, { id: 'annivact', label: '店庆活动' }, AI_PICK
      ]
    },
    welfare: {
      question: '这次是什么福利？',
      options: [
        { id: 'visitorgift', label: '到店送一支' }, { id: 'oldcustomer', label: '老顾客回馈' },
        { id: 'freesuggest', label: '免费帮你配' }, { id: 'freewrap', label: '免费换包装' },
        { id: 'surprise', label: '进店小惊喜' }, AI_PICK
      ]
    },
    outfit: {
      question: '想教大家怎么挑？',
      options: [
        { id: 'howtochoose', label: '怎么挑新鲜的花' }, { id: 'howtokeep', label: '拿回去怎么养' },
        { id: 'sendwho', label: '送什么人配什么花' }, { id: 'budget', label: '预算怎么定' },
        { id: 'avoidpit', label: '怎么避开常见的坑' }, AI_PICK
      ]
    },
    single: {
      question: '主推哪一类？',
      options: [
        { id: 'bouquetgift', label: '一束花' }, { id: 'giftbox', label: '花礼盒' },
        { id: 'potted', label: '一盆绿植' }, { id: 'dried', label: '干花摆件' },
        { id: 'bestseller', label: '店里卖得最好的' }, AI_PICK
      ]
    },
    season: {
      question: '这一季主推什么？',
      options: [
        { id: 'spring', label: '春天的花' }, { id: 'summer', label: '夏天的花' },
        { id: 'autumn', label: '秋天的花' }, { id: 'winter', label: '冬天的花' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节日？',
      options: [
        { id: 'valentine', label: '情人节 / 七夕' }, { id: 'motherday', label: '母亲节' },
        { id: 'teacherday', label: '教师节' }, { id: 'graduation', label: '毕业季' },
        { id: 'anniversary', label: '纪念日 / 生日' }, { id: 'qixi', label: '婚礼 / 求婚' }, AI_PICK
      ]
    },
    daily: {
      question: '拍店里的哪一面？',
      options: [
        { id: 'busy', label: '节日忙的时候' }, { id: 'quiet', label: '平时' },
        { id: 'behind', label: '修花、备货' }, { id: 'detail', label: '别人不注意的细节' },
        { id: 'team', label: '店里的人' }, AI_PICK
      ]
    },
    staff: {
      question: '谁来说？',
      options: [
        { id: 'bossstory', label: '店主讲讲自己的看法' }, { id: 'whythis', label: '为什么开花店' },
        { id: 'standard', label: '我们挑花的标准' }, { id: 'attitude', label: '我们怎么配花' }, AI_PICK
      ]
    },
    auto: {
      question: '你大概想拍哪个方向？',
      options: [
        { id: 'wantnew', label: '想拍新到的花' }, { id: 'wantact', label: '想拍活动' },
        { id: 'wantsell', label: '想推一束主打的花' }, { id: 'wantdaily', label: '想拍拍店里日常' },
        { id: 'wantknow', label: '想让大家认识我们店' }, { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  goals: [
    { id: 'comestore', label: '来店里看看' }, { id: 'tryon', label: '来挑一束' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '看看新到的花' },
    { id: 'learntips', label: '学一个挑花方法' }, { id: 'solveproblem', label: '解决一个送花难题' },
    { id: 'knowstore', label: '认识这家店' }, { id: 'remember', label: '记住这家店' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「来店里挑一束」。
· 买花的人最怕选错，开头先把这层顾虑说出来。
· 中间讲清楚来了怎么挑、能不能只说场合和预算让花艺师配。
· 结尾轻一点：「不知道送什么，来说两句就行」。`,
    learntips: `目标是让人真的学到一点挑花、养花的方法。
· 完全站在买花人一侧：教怎么判断新鲜、拿回去怎么养。
· 开头直接给方法，不要先介绍花。
· 中间给 1~2 条立刻能用的标准（看花苞、摸花杆、剪根换水）。
· 绝不承诺花期能撑多少天。`,
    solveproblem: `目标是解决一个具体困扰，让人觉得「说的就是我」。
· 开头直接说困扰（送花不知道送什么、买回去两天就蔫、图片和实物不一样）。
· 中间给一个实际办法，讲清楚为什么。
· 不夸张、不承诺。`
  },

  speakers: [
    { id: 'boss', label: '店主' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '花艺师' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍花和包花过程配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是花艺师。天天修花包花，说的是自己上手之后的判断。
· 口吻像「这束我一看花苞就知道还能放几天」。
· 可以讲手法、讲搭配，但不许编产地和花期。`,
    noface: `这条视频不露脸，只拍花、包花、店里，配口播。
· 镜头语言：花苞特写、剪根、包纸、系带、摆放。
· 少依赖表情，多用「你看这个花苞」「这样剪一刀」这种能配画面的说法。`
  },

  toneOverrides: {
    question: `开头抛一个问题切入，比如「你有没有买过一束花，第三天就开始掉瓣？」。
· 问题要真实，不夸张。
· 后面顺着这个问题往下答。`,
    friend: '整体像朋友之间的建议：「我跟你说」「我自己买花都这么挑」。'
  },

  subjectHint: {
    howtochoose: '这一条教怎么判断花新不新鲜，不推具体花材。',
    howtokeep: '这一条讲拿回去怎么养，不给具体天数。',
    sendwho: '这一条讲什么场合送什么方向，不评价别人。',
    budget: '这一条讲预算怎么定，不报价格。'
  },

  sceneIdeas: [
    '具体的**送花场景**（第一次约会、道歉、看病人、给妈妈、开业道贺）',
    '具体的**买花困扰**（不知道送什么、怕太俗、预算不知道定多少）',
    '具体的**判断方法**（看花苞紧不紧、摸花杆硬不硬、看叶子）',
    '具体的**养花的真实状态**（换水、剪根、放哪儿不容易蔫）',
    '**店里的样子**（修花台、水桶、包花的纸和带子）'
  ],
  forbiddenFacts: [
    '进口、产地、厄瓜多尔 / 荷兰这类来源说明',
    '花期能放多少天、保鲜几天、永不凋谢',
    '价格、花束规格（几枝）、包装费用、配送费',
    '花的品种学名、等级、检测',
    '顾客案例、别人订过什么（不许虚构订单）'
  ],
  hardBannedPhrases: ['进口玫瑰', '永不凋谢', '花期一个月', '香得满屋',
    '空运直达', '顶级花材', '限量款', '网红同款'],
  compliance: [
    '不许编造产地、进口、品种等级。',
    '不许承诺花期天数（「能放半个月」这类一律不许）。',
    '不许用「最 / 第一 / 唯一 / 顶级」这类绝对化说法，也不许贬低同行。',
    '不许编价格、规格、配送时效。'
  ],
  aiTasteWords: ['浪漫满屋', '用心甄选', '花语传情', '仪式感',
    '美好生活', '治愈系', '高级花艺', '美学空间'],
  tasteReplacements: [
    '「甄选 / 高级花艺」→ 删掉，说「这几样我今天早上刚修的」',
    '「浪漫满屋 / 仪式感」→ 说「她收到的时候是什么反应，你自己去想」',
    '「花语传情」→ 说「什么场合送什么，我帮你配」',
    '「治愈系 / 美好生活」→ 直接删掉，换成具体的花或场景'
  ],
  badExample: '用心甄选进口花材，浪漫满屋，让每一束花都传递你的心意。',
  goodExample: '挑花先看花苞，还包得紧的能放；已经全开的，今天好看，明天就开始掉。',
  titleBad: '「进口玫瑰，永不凋谢，全城最低价！」',
  titleGood: '「买花别只看开得大，先摸一下这里」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「我们店这周到了新的花，可以来看看。」
✅ 可以说：「这周到了新花，你要是最近有场合要送，可以来挑，我帮你配。」
❌ 不许变成：「厄瓜多尔进口玫瑰，花期长达半个月。」因为：产地和花期是编的。
❌ 不许变成：「原价 399，本周只要 199。」因为：价格是编的。
❌ 不许变成：「上千对情侣都选我们。」因为：数字是编的。
**而你们这次连「到了新花」之外的信息都没有。**
那就讲怎么挑、什么场合送什么，绝不能自己补一个产地、花期或价格。`,

  contentRaw: [
    '看花苞：包得紧的还能放，全开的只管当天好看',
    '摸花杆：硬挺的是新的，软塌的已经放几天了',
    '拿回去先剪根：斜剪一刀，换水勤一点',
    '别放太阳直晒和空调风口，蔫得快',
    '不知道送什么就说场合和预算，让花艺师配，比自己在网上挑靠谱'
  ],
  customerPains: [
    '买回去第三天就开始掉瓣',
    '网上图片和实物差太远',
    '不知道送什么人该送什么花',
    '节日一到价格翻倍，还挑不到好的',
    '想自己配又不懂，怕配出来很土'
  ]
};

module.exports = pack;

  };

  /* ---------- industries/food ---------- */
  __defs['industries/food'] = function (module, exports, require) {
'use strict';

/** 餐饮行业包。选项 id 与其它行业保持一致，只是中文标签不同。 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'food',
  label: '餐饮',
  emoji: '🍜',
  subTypes: [
    { id: 'meal', label: '正餐' }, { id: 'fast', label: '快餐小吃' },
    { id: 'drink', label: '奶茶饮品' }, { id: 'bakery', label: '烘焙甜品' }
  ],
  words: {
    store: '我们店', staff: '店员', goods: '菜', customer: '来吃的人',
    tryVerb: '吃', place: '店里'
  },
  roleIntro: '你服务过大量实体餐饮店，清楚一条门店短视频该长什么样 —— 它靠的是让人想吃，而不是靠喊口号。',

  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '新菜上架', emoji: '🍲' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '到店福利', emoji: '🎁' },
    { id: 'outfit', label: '怎么点不踩雷', emoji: '🥢' },
    { id: 'single', label: '招牌单品', emoji: '🍽' },
    { id: 'season', label: '时令换季', emoji: '🍃' },
    { id: 'festival', label: '节日聚餐', emoji: '🎊' },
    { id: 'daily', label: '门店日常', emoji: '🏬' },
    { id: 'staff', label: '老板 / 厨师出镜', emoji: '🎤' },
    { id: 'auto', label: 'AI 帮我选', emoji: '✨' }
  ],

  second: {
    opening: {
      question: '开业这段时间，主要拍什么？',
      options: [
        { id: 'openday', label: '开业当天现场' }, { id: 'prepare', label: '开业前的准备' },
        { id: 'environment', label: '新店环境介绍' }, { id: 'openact', label: '开业活动' },
        { id: 'firstcustomer', label: '第一批客人' }, { id: 'kitchen', label: '后厨备料' },
        { id: 'teamstate', label: '店员状态' }, AI_PICK
      ]
    },
    newarrival: {
      question: '这次上新，主要拍什么？',
      options: [
        { id: 'signature', label: '主打的那道菜' }, { id: 'several', label: '好几道新菜' },
        { id: 'drinknew', label: '新饮品' }, { id: 'dessert', label: '新甜品' },
        { id: 'seasonnew', label: '时令菜' }, { id: 'combo', label: '新搭配的套餐' },
        { id: 'wholestore', label: '整店换新' }, AI_PICK
      ]
    },
    activity: {
      question: '是什么活动？',
      options: [
        { id: 'openact', label: '开业活动' }, { id: 'festivalact', label: '节日活动' },
        { id: 'seasonact', label: '时令活动' }, { id: 'welfareact', label: '到店福利' },
        { id: 'memberact', label: '会员活动' }, { id: 'limitedact', label: '限时活动' },
        { id: 'annivact', label: '店庆活动' }, AI_PICK
      ]
    },
    welfare: {
      question: '这次是什么福利？',
      options: [
        { id: 'visitorgift', label: '到店有礼' }, { id: 'oldcustomer', label: '老顾客回馈' },
        { id: 'newexperience', label: '新菜试吃' }, { id: 'freesuggest', label: '免费点菜建议' },
        { id: 'surprise', label: '进店小惊喜' }, { id: 'memberonly', label: '会员专属' }, AI_PICK
      ]
    },
    outfit: {
      question: '想讲哪种点菜场景？',
      options: [
        { id: 'commute', label: '一个人来吃' }, { id: 'date', label: '两个人来吃' },
        { id: 'casual', label: '几个人聚餐' }, { id: 'elegant', label: '带长辈来吃' },
        { id: 'young', label: '带孩子来吃' }, { id: 'first', label: '第一次来' },
        { id: 'takeaway', label: '打包带走' }, AI_PICK
      ]
    },
    single: {
      question: '推荐哪一类？',
      options: [
        { id: 'signature', label: '招牌主菜' }, { id: 'staple', label: '主食' },
        { id: 'snack', label: '小吃' }, { id: 'drinknew', label: '饮品' },
        { id: 'dessert', label: '甜品' }, { id: 'soup', label: '汤品' },
        { id: 'combo', label: '搭配好的一套' }, AI_PICK
      ]
    },
    season: {
      question: '换季主要拍什么？',
      options: [
        { id: 'spring', label: '春天这一口' }, { id: 'summer', label: '夏天开胃的' },
        { id: 'autumn', label: '秋天进补感' }, { id: 'winter', label: '冬天热乎的' },
        { id: 'seasonmix', label: '时令怎么搭' }, { id: 'warm', label: '冷热怎么选' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节日？',
      options: [
        { id: 'springfestival', label: '春节' }, { id: 'valentine', label: '情人节' },
        { id: 'motherday', label: '母亲节' }, { id: 'love520', label: '520' },
        { id: 'children', label: '儿童节' }, { id: 'midautumn', label: '中秋节' },
        { id: 'national', label: '国庆' }, { id: 'newyear', label: '元旦' },
        { id: 'christmas', label: '圣诞节' }, AI_PICK
      ]
    },
    daily: {
      question: '店里是什么场景？',
      options: [
        { id: 'busy', label: '饭点正忙' }, { id: 'newgoods', label: '食材刚到' },
        { id: 'sorting', label: '后厨备餐' }, { id: 'tryon', label: '客人吃饭的场景' },
        { id: 'display', label: '摆台出餐' }, { id: 'routine', label: '开门前的准备' },
        { id: 'recommend', label: '店员推荐' }, { id: 'bossdaily', label: '老板日常' }, AI_PICK
      ]
    },
    staff: {
      question: '想让镜头前的人，给大家留下什么印象？',
      options: [
        { id: 'bossself', label: '老板本人' }, { id: 'managerself', label: '店长' },
        { id: 'seniorguide', label: '老店员' }, { id: 'chef', label: '厨师' },
        { id: 'wholteam', label: '整个团队' }, { id: 'bossheart', label: '老板讲心里话' },
        { id: 'managerpro', label: '店长讲门道' }, { id: 'guidedaily', label: '店员讲日常' }, AI_PICK
      ]
    },
    auto: {
      question: '大概想拍点什么？说不清楚也没关系。',
      options: [
        { id: 'wantnew', label: '想拍刚上的新菜' }, { id: 'wantact', label: '想拍店里的活动' },
        { id: 'wantoutfit', label: '想讲怎么点菜' }, { id: 'wantsingle', label: '想推一道招牌' },
        { id: 'wantdaily', label: '想拍拍店里日常' }, { id: 'wantknow', label: '想让大家认识我们店' },
        { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  goals: [
    { id: 'comestore', label: '来店里吃一顿' }, { id: 'tryon', label: '来尝一尝' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '了解新菜' },
    { id: 'learntips', label: '学一个点菜方法' }, { id: 'solveproblem', label: '解决一个吃饭难题' },
    { id: 'knowstore', label: '认识这家店' }, { id: 'remember', label: '记住这家店' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「亲自来尝一尝」。
· 开头点破一个事实：看图片和自己坐下吃，是两回事。
· 中间讲清楚什么情况下来吃最合适、来了怎么点比较省心。
· 结尾把「来尝一下」说出来，语气轻松，不要有推销压力。`,
    learntips: `目标是让看的人真的学到一点怎么点菜、怎么搭配，从而觉得「这个人懂吃」。
· 硬广感降到最低 —— 这条更像一个真心在分享经验的人。
· 开头别介绍菜品，直接给方法、给判断。
· 中间给 1~2 条真正能用的方法，用大白话讲（可以用下面的行业通用方法）。
· 全篇几乎不推菜，最多最后一句自然带到「店里可以来试」。`,
    solveproblem: `目标是解决一个具体的吃饭困扰，让人觉得「说的就是我」。
· 开头直接把困扰说出来（不知道点什么、几个人不好点、怕等太久、带老人孩子不知道点啥……）。
· 中间给一个切实能用的小办法，讲清楚为什么有用。
· 不要用行业黑话，越像隔壁常来吃的人在教你越好。
· 结尾可以自然带到店里，也可以不带 —— 内容价值优先。`
  },

  speakers: [
    { id: 'boss', label: '老板' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '店员' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍菜和店里配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是店员。店员天天在店里招呼客人，说的是自己看多了之后的真实感受。
· 口吻像「你要是第一次来，我一般建议你先点这个」。
· 具体、实在，不讲大道理。`,
    noface: `这条视频不露脸，只拍菜和店里，配口播。
· 文案必须考虑镜头语言：出餐、锅气、菜品特写、摆台、后厨、手部展示、店里坐满人的样子。
· 少依赖「表情」和「眼神」这类只有露脸才能传达的东西。
· 多用「你看这个刚出锅的样子」「镜头拉近看一下」「端上来还在冒热气」这种能配画面的说法。
· 语气可以更客观、更聚焦在吃这件事本身。`
  },

  toneOverrides: {
    question: `开头用「抛一个问题」的方式切入（这一条主要影响开头）。
· 这个问题要问到人心上，比如「你有没有那种，坐下来翻了半天菜单，最后还是点了上次那几样的时候？」
· 后面要顺着这个问题往下答。`,
    friend: '整体像朋友之间的推荐：「我跟你说」「我自己来一般就这么点」这种口吻。'
  },

  subjectHint: {
    signature: '这一条围绕招牌菜来讲。', several: '这一条讲好几道菜，要有整体感，不要只盯着一道。',
    combo: '这一条讲搭配好的一套，重点是怎么搭着吃更顺。', drinknew: '这一条围绕饮品来讲。',
    dessert: '这一条围绕甜品来讲。', wholestore: '这一条讲整店这一波上新，重点是整体给人的感觉。'
  },

  sceneIdeas: [
    '具体的**吃饭场景**（下班不想做饭、几个人临时约、带孩子出门找地方坐）',
    '具体的**点菜困扰**（菜单翻半天、点多了吃不完、不知道哪个适合老人孩子）',
    '具体的**判断方法**（几个人怎么配、先上什么后上什么、口味怎么搭不重）',
    '具体的**吃饭感受**（坐下那一刻、刚端上来的热气、吃完不腻不撑）',
    '**门店的氛围感**（饭点店里在忙什么、后厨的声音、邻桌聊天声）'
  ],
  forbiddenFacts: [
    '食材产地、有机、无添加、现杀、当天直供、祖传秘方、手工现做、独家配方',
    '卫生等级、检测报告、营养功效（养胃、降火、减肥、增强免疫）',
    '排队时长、日销份数、翻台率、一天卖多少、有多少人打卡',
    '优惠价格、套餐价、折扣、免单承诺（「不好吃免单」也算）',
    '具体菜品细节（几两、什么部位、放几种料、什么火候）—— 你没见过这道菜，就别说它具体什么样'
  ],
  hardBannedPhrases: ['分量很足', '食材新鲜', '口味地道', '不踩雷', '老少皆宜', '回头客特别多',
    '入口即化', '外酥里嫩', '香气扑鼻', '汤汁浓郁', '用料扎实'],
  compliance: [
    '不许承诺任何功效（养胃、降火、减肥、养生、调理）。',
    '不许用「最正宗 / 全城第一 / 唯一一家」这类绝对化说法，也不许贬低同行。'
  ],
  aiTasteWords: ['匠心', '烟火气', '舌尖上的', '治愈系', '一口入魂', '味蕾盛宴',
    '甄选食材', '慢火熬制', '地道风味', '灵魂一口', '美食美学', '仪式感拉满'],
  tasteReplacements: [
    '「匠心 / 甄选食材」→ 直接删掉，说「怎么做的你到店看一眼就明白」',
    '「烟火气」→ 说「饭点的时候店里挺热闹」',
    '「舌尖上的 / 味蕾盛宴」→ 说「挺下饭」「吃着顺口」',
    '「一口入魂 / 治愈系」→ 说「吃完挺舒服」',
    '「仪式感拉满」→ 说「摆上来看着挺利落」'
  ],
  badExample: '甄选上等食材，匠心慢炖，唤醒您的味蕾，给您好好吃饭的仪式感。',
  goodExample: '这道菜我觉得挺适合两三个人一起点，不用纠结，量刚好，来了可以先问问今天哪个更合适。',
  titleBad: '「全城最好吃的一碗面来了！」',
  titleGood: '「几个人来吃，其实先点这两样就够了」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「我们这周上了一道新菜，适合两三个人一起吃。」
✅ 可以说：「这周上了一道新菜，两三个人来点着吃挺合适，你可以来试试。」
❌ 不许变成：「新菜上市，第二份半价，最后三天！」因为：用户没说过任何优惠和时限。
❌ 不许变成：「当天现杀的土鸡，祖传秘方慢炖八小时。」因为：食材来源和做法全是编的。
❌ 不许变成：「日销三百份，全城回头客最多。」因为：销量和口碑都是编的。
**而你们这次连「两三个人」「新菜」之外的信息都没有。**
那就靠场景、点菜方法、吃饭感受来写，绝不能自己补一个价格、产地或数字。`,

  contentRaw: [
    '先看几个人：一个人、两个人、一桌人，点的思路完全不一样',
    '再看口味搭：别全点一个味型，有重有轻吃着才不腻',
    '第一次来，先问一句今天哪个最合适，比照着图片点省心',
    '有老人孩子一起来，先想清楚有没有能一起吃的',
    '拿不准分量，先少点一点，不够再加'
  ],
  customerPains: [
    '菜单翻半天，最后还是点了上次那几样',
    '一桌全点一个口味，吃到后面腻得慌',
    '点多了吃不完，点少了又觉得没吃够',
    '带老人孩子出来，不知道哪个大家都能吃',
    '只看图片点，端上来跟想的完全不一样'
  ]
};

module.exports = pack;

  };

  /* ---------- industries/home ---------- */
  __defs['industries/home'] = function (module, exports, require) {
'use strict';

/** 家居行业包。选项 id 与其它行业保持一致。 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'home',
  label: '家居',
  emoji: '🛋',
  subTypes: [
    { id: 'furniture', label: '家具' }, { id: 'soft', label: '软装布艺' },
    { id: 'material', label: '建材' }, { id: 'custom', label: '全屋定制' }
  ],
  words: {
    store: '我们店', staff: '店员', goods: '家具', customer: '来挑东西的人',
    tryVerb: '摆', place: '家里'
  },
  roleIntro: '你服务过大量实体家居店，清楚顾客最怕的不是贵，是买回去放不下、不搭、用着别扭。',

  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '新款到店', emoji: '🛋' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '到店福利', emoji: '🎁' },
    { id: 'outfit', label: '搭配分享', emoji: '🪴' },
    { id: 'single', label: '单品推荐', emoji: '🪑' },
    { id: 'season', label: '装修季 / 换季', emoji: '🍃' },
    { id: 'festival', label: '节日布置', emoji: '🎊' },
    { id: 'daily', label: '门店日常', emoji: '🏬' },
    { id: 'staff', label: '老板 / 店长出镜', emoji: '🎤' },
    { id: 'auto', label: 'AI 帮我选', emoji: '✨' }
  ],

  second: {
    opening: {
      question: '开业这段时间，主要拍什么？',
      options: [
        { id: 'openday', label: '开业当天现场' }, { id: 'prepare', label: '开业前的布置' },
        { id: 'environment', label: '新店环境介绍' }, { id: 'openact', label: '开业活动' },
        { id: 'firstcustomer', label: '第一批客人' }, { id: 'display', label: '样板间陈列' },
        { id: 'teamstate', label: '店员状态' }, AI_PICK
      ]
    },
    newarrival: {
      question: '这次到的新款，主要拍什么？',
      options: [
        { id: 'sofa', label: '沙发 / 坐具' }, { id: 'table', label: '桌几' },
        { id: 'storage', label: '柜类收纳' }, { id: 'bed', label: '床具' },
        { id: 'light', label: '灯具' }, { id: 'soft', label: '布艺软装' },
        { id: 'several', label: '好几款新品' }, { id: 'wholestore', label: '整店新陈列' }, AI_PICK
      ]
    },
    activity: {
      question: '是什么活动？',
      options: [
        { id: 'openact', label: '开业活动' }, { id: 'festivalact', label: '节日活动' },
        { id: 'seasonact', label: '装修季活动' }, { id: 'welfareact', label: '到店福利' },
        { id: 'memberact', label: '会员活动' }, { id: 'limitedact', label: '限时活动' },
        { id: 'annivact', label: '店庆活动' }, AI_PICK
      ]
    },
    welfare: {
      question: '这次是什么福利？',
      options: [
        { id: 'visitorgift', label: '到店有礼' }, { id: 'freesuggest', label: '免费摆放建议' },
        { id: 'oldcustomer', label: '老顾客回馈' }, { id: 'newexperience', label: '新品体验' },
        { id: 'measure', label: '上门量尺咨询' }, { id: 'memberonly', label: '会员专属' }, AI_PICK
      ]
    },
    outfit: {
      question: '想讲哪种搭配 / 摆放？',
      options: [
        { id: 'commute', label: '小户型怎么摆' }, { id: 'date', label: '客厅整体搭配' },
        { id: 'casual', label: '卧室这一块' }, { id: 'elegant', label: '颜色怎么统一' },
        { id: 'young', label: '有孩子怎么摆' }, { id: 'first', label: '第一次置办' },
        { id: 'oneitemmany', label: '一件东西多种用法' }, AI_PICK
      ]
    },
    single: {
      question: '推荐哪一类？',
      options: [
        { id: 'sofa', label: '沙发' }, { id: 'table', label: '餐桌 / 茶几' },
        { id: 'storage', label: '收纳柜' }, { id: 'bed', label: '床' },
        { id: 'light', label: '灯具' }, { id: 'soft', label: '窗帘布艺' },
        { id: 'accessory', label: '小件摆饰' }, AI_PICK
      ]
    },
    season: {
      question: '这个季节主要拍什么？',
      options: [
        { id: 'spring', label: '开春换布置' }, { id: 'summer', label: '夏天清爽感' },
        { id: 'autumn', label: '秋天换软装' }, { id: 'winter', label: '冬天暖一点' },
        { id: 'decorate', label: '装修季怎么挑' }, { id: 'seasonmix', label: '换季收纳' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节日？',
      options: [
        { id: 'springfestival', label: '春节' }, { id: 'valentine', label: '情人节' },
        { id: 'motherday', label: '母亲节' }, { id: 'love520', label: '520' },
        { id: 'midautumn', label: '中秋节' }, { id: 'national', label: '国庆' },
        { id: 'newyear', label: '元旦' }, { id: 'christmas', label: '圣诞节' }, AI_PICK
      ]
    },
    daily: {
      question: '店里是什么场景？',
      options: [
        { id: 'busy', label: '今天店里挺忙' }, { id: 'newgoods', label: '新货刚到' },
        { id: 'sorting', label: '店员摆场调整' }, { id: 'tryon', label: '客人坐着试的场景' },
        { id: 'display', label: '样板间细节' }, { id: 'routine', label: '开门前的整理' },
        { id: 'recommend', label: '店员推荐' }, { id: 'bossdaily', label: '老板日常' }, AI_PICK
      ]
    },
    staff: {
      question: '想让镜头前的人，给大家留下什么印象？',
      options: [
        { id: 'bossself', label: '老板本人' }, { id: 'managerself', label: '店长' },
        { id: 'seniorguide', label: '老店员' }, { id: 'designer', label: '做搭配的人' },
        { id: 'wholteam', label: '整个团队' }, { id: 'bossheart', label: '老板讲心里话' },
        { id: 'managerpro', label: '店长讲门道' }, { id: 'guidedaily', label: '店员讲日常' }, AI_PICK
      ]
    },
    auto: {
      question: '大概想拍点什么？说不清楚也没关系。',
      options: [
        { id: 'wantnew', label: '想拍刚到的新款' }, { id: 'wantact', label: '想拍店里的活动' },
        { id: 'wantoutfit', label: '想讲怎么搭配摆放' }, { id: 'wantsingle', label: '想推荐一件东西' },
        { id: 'wantdaily', label: '想拍拍店里日常' }, { id: 'wantknow', label: '想让大家认识我们店' },
        { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  goals: [
    { id: 'comestore', label: '来店里看看' }, { id: 'tryon', label: '来坐一坐试一试' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '了解新款' },
    { id: 'learntips', label: '学一个搭配方法' }, { id: 'solveproblem', label: '解决一个摆放问题' },
    { id: 'knowstore', label: '认识这家店' }, { id: 'remember', label: '记住这家店' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「亲自来坐一坐、比一比」。
· 开头点破一个事实：图片上看着合适，摆到家里是两回事。
· 中间讲清楚来之前先想哪几件事、到店怎么试最省时间。
· 结尾把「来坐一下」说出来，语气轻松，不给压力。`,
    learntips: `目标是让看的人真的学到一点怎么挑、怎么摆，从而觉得「这个人懂」。
· 硬广感降到最低 —— 这条更像一个真心在分享经验的人。
· 开头别介绍商品，直接给方法、给判断。
· 中间给 1~2 条真正能用的方法，用大白话讲（可以用下面的行业通用方法）。
· 全篇几乎不推货，最多最后一句自然带到「店里可以来比一比」。`,
    solveproblem: `目标是解决一个具体的家里摆放困扰，让人觉得「说的就是我」。
· 开头直接把困扰说出来（尺寸拿不准、买回去堵路、颜色各买各的搭不到一起、有孩子不敢摆）。
· 中间给一个切实能用的小办法，讲清楚为什么有用。
· 不要用行业黑话，越像隔壁刚装修完的人在教你越好。
· 结尾可以自然带到店里，也可以不带 —— 内容价值优先。`
  },

  speakers: [
    { id: 'boss', label: '老板' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '店员' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍空间和细节配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是店员。店员天天在店里帮人比尺寸、比颜色，说的是看多了之后的真实感受。
· 口吻像「你要是拿不准，我一般建议你先量一下这个地方」。
· 具体、实在，不讲大道理。`,
    noface: `这条视频不露脸，只拍空间和细节，配口播。
· 文案必须考虑镜头语言：样板间全景、边角收口、布料近拍、抽屉开合、手部抚过表面、光线变化。
· 少依赖「表情」和「眼神」这类只有露脸才能传达的东西。
· 多用「你看这个转角」「镜头拉近看一下」「坐下来就是这个高度」这种能配画面的说法。
· 语气可以更客观、更聚焦在空间本身。`
  },

  toneOverrides: {
    question: `开头用「抛一个问题」的方式切入（这一条主要影响开头）。
· 这个问题要问到人心上，比如「你有没有那种，东西搬回家才发现，过道刚好差那么一点的时候？」
· 后面要顺着这个问题往下答。`,
    friend: '整体像朋友之间的推荐：「我跟你说」「我自己家就是这么摆的」这种口吻。'
  },

  subjectHint: {
    sofa: '这一条围绕沙发 / 坐具来讲。', several: '这一条讲好几款，要有整体感，不要只盯着一件。',
    wholestore: '这一条讲整店这一波新陈列，重点是整体给人的感觉。',
    oneitemmany: '这一条重点讲一件东西在不同位置怎么用。'
  },

  sceneIdeas: [
    '具体的**家里场景**（进门那一块怎么留、全家坐一起时东西够不够放）',
    '具体的**摆放困扰**（尺寸拿不准、买回去堵路、各买各的搭不到一起）',
    '具体的**判断方法**（先量哪几个尺寸、怎么比高度、怎么看动线）',
    '具体的**使用感受**（坐下去的高度、抽屉顺不顺手、日常好不好收拾）',
    '**门店的氛围感**（样板间刚摆好的样子、店员在调位置、光线落到布面上的变化）'
  ],
  forbiddenFacts: [
    '零甲醛、E0/E1 级、环保等级、检测报告、认证编号、母婴级、孕妇可用',
    '实木、纯实木、进口、原产地、板材产地、五金品牌、承重量、质保年限',
    '尺寸数字、面积、适配户型、能放多少东西、送货天数、安装时长',
    '销量、排名、卖得最好、工厂直供、源头价、全网最低',
    '具体款式细节（什么木纹、几个抽屉、什么面料、什么颜色）—— 你没见过这件东西，就别说它长什么样'
  ],
  hardBannedPhrases: ['很百搭', '不挑户型', '显大', '质感很好', '收纳特别能装', '坐着特别舒服',
    '摸着挺扎实', '线条利落', '做工精细', '颜色耐看'],
  compliance: [
    '不许出现「零甲醛 / 绝对环保 / 母婴级 / 无甲醛」等健康与环保承诺。',
    '不许承诺质保年限、免费安装、包送货，也不许用「最划算 / 全城最低」这类绝对化说法。'
  ],
  aiTasteWords: ['高级感', '氛围感', '质感拉满', '极简美学', '轻奢', '匠心',
    '空间叙事', '设计语言', '生活美学', '格调', '治愈系', '理想之家'],
  tasteReplacements: [
    '「高级感」→ 说「看着干净、不显乱」',
    '「氛围感 / 空间叙事」→ 说「这一块看着挺顺」',
    '「轻奢 / 格调」→ 直接删掉，或说「不贵但耐看」',
    '「生活美学 / 理想之家」→ 说「家里用着顺手」',
    '「质感拉满」→ 说「摸着挺扎实」'
  ],
  badExample: '甄选进口实木，匠心打造极简美学空间，为您诠释理想之家的生活格调。',
  goodExample: '这件我觉得挺适合进门那一块，先量一下过道还剩多少，别光看摆着好看。',
  titleBad: '「全网最显大的客厅方案来了！」',
  titleGood: '「买之前先量这三个地方，能少折腾一趟」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「店里新到一组柜子，适合小一点的房间。」
✅ 可以说：「新到一组柜子，房间不大的话可以来看看，先量一下你那面墙。」
❌ 不许变成：「E0 级环保板材，零甲醛，孕妇孩子都能用！」因为：环保等级和功效全是编的。
❌ 不许变成：「纯实木进口，承重 200 斤，质保十年。」因为：材质、参数、承诺全没给过。
❌ 不许变成：「原价八千，装修季直降三千。」因为：价格一个字都没有。
**而你们这次连「小一点的房间」之外的信息都没有。**
那就靠量尺寸、看动线、坐下来的感受来写，绝不能自己补一个材质、认证或数字。`,

  contentRaw: [
    '先量尺寸：不只看长宽，还要看过道、开门方向、插座位置',
    '再看动线：东西摆进去，人平时怎么走，别只看空着的时候',
    '颜色别一件一件挑，先定一个主调，其它往上面靠',
    '到店一定要坐一下、拉一下抽屉，光看照片判断不了高度和手感',
    '有孩子或宠物，先想清楚边角和好不好收拾'
  ],
  customerPains: [
    '看着尺寸差不多，搬回家发现过道被堵了',
    '一件一件都挺好看，放一起怎么都不搭',
    '只看了正面，没注意背面和边角',
    '没量开门方向，抽屉拉不开',
    '买回去才发现日常收拾特别费劲'
  ]
};

module.exports = pack;

  };

  /* ---------- industries/index ---------- */
  __defs['industries/index'] = function (module, exports, require) {
'use strict';

/**
 * 行业包静态注册表。
 *
 * ⚠️ 这里必须一个一个静态 require，不能写 require('./' + id)：
 *    Cloudflare Pages Functions 用 esbuild 打包，动态拼路径的 require 无法静态分析，
 *    打包时不会把行业包带进去，线上会直接报「模块找不到」。
 * 新增一个行业 = 加一个 require + 在 PACKS 里加一行，前后端和测试都不用改。
 *
 * HOT：首页第一屏显示的行业（顺序即展示顺序），其余收在「更多行业」里。
 * FALLBACK：导购找不到自己行业时的兜底，永远排在最后，不进热门位。
 */

const fashion = require('./fashion');
const food = require('./food');
const home = require('./home');
const appliance = require('./appliance');
const beauty = require('./beauty');
const fitness = require('./fitness');
const maternal = require('./maternal');
const pet = require('./pet');
const auto = require('./auto');
const flower = require('./flower');
const jewelry = require('./jewelry');
const digital = require('./digital');
const photo = require('./photo');
const optical = require('./optical');
const cleaning = require('./cleaning');
const tea = require('./tea');
const other = require('./other');

const PACKS = {
  fashion, food, home, appliance,
  beauty, fitness, maternal, pet,
  auto, flower, jewelry, digital,
  photo, optical, cleaning, tea,
  other
};
const DEFAULT_ID = 'fashion';
const HOT = ['fashion', 'food', 'home', 'appliance', 'beauty', 'fitness'];
const FALLBACK_ID = 'other';

/** 给首页渲染的行业卡片（不含庞大的选项树，省流量） */
function list() {
  return Object.keys(PACKS).map((id) => {
    const p = PACKS[id];
    return {
      id: p.id,
      label: p.label,
      emoji: p.emoji,
      hot: HOT.includes(id),
      fallback: id === FALLBACK_ID,
      subTypes: p.subTypes.map((s) => ({ id: s.id, label: s.label }))
    };
  });
}

function has(id) {
  return Object.prototype.hasOwnProperty.call(PACKS, id);
}

/** 非法行业一律静默回落到服装，用户不该看到技术报错 */
function get(id) {
  return has(id) ? PACKS[id] : PACKS[DEFAULT_ID];
}

/** 业态合法性校验 */
function hasSubType(pack, subTypeId) {
  return !subTypeId || pack.subTypes.some((s) => s.id === subTypeId);
}

module.exports = { PACKS, DEFAULT_ID, HOT, FALLBACK_ID, list, get, has, hasSubType };

  };

  /* ---------- industries/jewelry ---------- */
  __defs['industries/jewelry'] = function (module, exports, require) {
'use strict';

/**
 * 珠宝首饰行业包（黄金 / 银饰 / 钻石定制 / 珍珠彩宝）。
 *
 * 这行有三个雷区：保值升值、克重金价、成色证书。
 * 内容只能讲「怎么挑、怎么戴、怎么送」，一句投资回报都不许提。
 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'jewelry',
  label: '珠宝首饰',
  emoji: '💍',
  subTypes: [
    { id: 'gold', label: '黄金' }, { id: 'silver', label: '银饰' },
    { id: 'diamond', label: '钻石定制' }, { id: 'pearl', label: '珍珠彩宝' }
  ],
  words: {
    store: '我们店', staff: '店员', goods: '首饰', customer: '来看的人',
    tryVerb: '试戴', place: '店里'
  },
  roleIntro: '你服务过很多珠宝门店，知道这行不能卖「升值」，只能卖「合不合适、戴不戴得住」——把挑选和试戴讲透，比夸材质有用。',

  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '新到款式', emoji: '🆕' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '到店福利', emoji: '🎁' },
    { id: 'outfit', label: '怎么挑不踩坑', emoji: '🧭' },
    { id: 'single', label: '主推款式', emoji: '⭐' },
    { id: 'season', label: '换季 / 场合', emoji: '🌿' },
    { id: 'festival', label: '节日送礼', emoji: '🎊' },
    { id: 'daily', label: '门店日常', emoji: '🏬' },
    { id: 'staff', label: '店主 / 店员出镜', emoji: '🎤' },
    { id: 'auto', label: 'AI 帮我选', emoji: '✨' }
  ],

  second: {
    opening: {
      question: '开业这段时间，主要拍什么？',
      options: [
        { id: 'openday', label: '开业当天' }, { id: 'prepare', label: '开业前的准备' },
        { id: 'environment', label: '店里什么样' }, { id: 'openact', label: '开业活动' },
        { id: 'firstcustomer', label: '第一批客人' }, { id: 'teamstate', label: '店员状态' }, AI_PICK
      ]
    },
    newarrival: {
      question: '这次到的是什么？',
      options: [
        { id: 'goldnew', label: '黄金新款' }, { id: 'silvernew', label: '银饰新款' },
        { id: 'diamondnew', label: '钻饰新款' }, { id: 'pearlnew', label: '珍珠 / 彩宝' },
        { id: 'couplenew', label: '情侣款 / 对戒' }, { id: 'wholebatch', label: '整批新货' }, AI_PICK
      ]
    },
    activity: {
      question: '是什么活动？',
      options: [
        { id: 'openact', label: '开业活动' }, { id: 'festivalact', label: '节日活动' },
        { id: 'seasonact', label: '换季活动' }, { id: 'welfareact', label: '到店福利' },
        { id: 'memberact', label: '会员活动' }, { id: 'annivact', label: '店庆活动' }, AI_PICK
      ]
    },
    welfare: {
      question: '这次是什么福利？',
      options: [
        { id: 'visitorgift', label: '到店有礼' }, { id: 'oldcustomer', label: '老顾客回馈' },
        { id: 'freetryon', label: '免费试戴、帮你看搭配' }, { id: 'freeclean', label: '免费清洗保养' },
        { id: 'surprise', label: '进店小惊喜' }, AI_PICK
      ]
    },
    outfit: {
      question: '想教大家怎么挑？',
      options: [
        { id: 'howtochoose', label: '怎么挑适合自己的' }, { id: 'howtofit', label: '尺寸怎么定' },
        { id: 'dailywear', label: '日常戴什么不容易挂到' }, { id: 'giftsomeone', label: '送人怎么挑' },
        { id: 'avoidpit', label: '怎么避开常见的坑' }, AI_PICK
      ]
    },
    single: {
      question: '主推哪一类？',
      options: [
        { id: 'golditem', label: '黄金' }, { id: 'silveritem', label: '银饰' },
        { id: 'diamonditem', label: '钻饰' }, { id: 'pearlitem', label: '珍珠' },
        { id: 'coupleitem', label: '对戒 / 情侣款' }, { id: 'bestseller', label: '店里卖得最好的' }, AI_PICK
      ]
    },
    season: {
      question: '这次是哪种变化？',
      options: [
        { id: 'summer', label: '夏天露脖颈' }, { id: 'winter', label: '冬天戴在毛衣外' },
        { id: 'wedding', label: '婚礼季' }, { id: 'newjob', label: '换工作 / 通勤' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节点？',
      options: [
        { id: 'valentine', label: '情人节 / 七夕' }, { id: 'motherday', label: '母亲节' },
        { id: 'birthday', label: '生日' }, { id: 'anniversary', label: '结婚纪念日' },
        { id: 'spring', label: '春节' }, { id: 'graduation', label: '毕业 / 升学' }, AI_PICK
      ]
    },
    daily: {
      question: '拍店里的哪一面？',
      options: [
        { id: 'busy', label: '忙的时候' }, { id: 'quiet', label: '闲的时候' },
        { id: 'behind', label: '擦洗、理货' }, { id: 'detail', label: '别人不注意的细节' },
        { id: 'team', label: '店里的人' }, AI_PICK
      ]
    },
    staff: {
      question: '谁来说？',
      options: [
        { id: 'bossstory', label: '店主讲讲自己的看法' }, { id: 'whythis', label: '为什么做这一行' },
        { id: 'standard', label: '我们挑货的标准' }, { id: 'attitude', label: '我们怎么陪客人挑' }, AI_PICK
      ]
    },
    auto: {
      question: '你大概想拍哪个方向？',
      options: [
        { id: 'wantnew', label: '想拍新款' }, { id: 'wantact', label: '想拍活动' },
        { id: 'wantsell', label: '想推一个主打款' }, { id: 'wantdaily', label: '想拍拍店里日常' },
        { id: 'wantknow', label: '想让大家认识我们店' }, { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  goals: [
    { id: 'comestore', label: '来店里看看' }, { id: 'tryon', label: '来试戴' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '看看新款式' },
    { id: 'learntips', label: '学一个挑选方法' }, { id: 'solveproblem', label: '解决一个送礼 / 搭配难题' },
    { id: 'knowstore', label: '认识这家店' }, { id: 'remember', label: '记住这家店' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「来试戴一下」。
· 首饰不上手永远看不出合不合适，开头先把这个道理说清楚。
· 中间讲清楚来了怎么看、试戴要注意什么（手围、链长、日常场景）。
· 结尾轻一点：「戴上看一眼，比看图片准」。`,
    learntips: `目标是让人真的学到一点挑选方法。
· 完全站在顾客一侧：教怎么定尺寸、怎么挑日常能戴的、送人怎么选。
· 开头直接给方法，不要先介绍材质。
· 中间给 1~2 条立刻能用的标准（链长怎么选、戒指怎么量）。
· 绝不提保值升值、克重、金价。`,
    solveproblem: `目标是解决一个具体困扰，让人觉得「说的就是我」。
· 开头直接说困扰（不知道怎么选、戴久了发黑、送人怕不合适）。
· 中间给一个实际办法，讲清楚为什么。
· 不承诺升值，也不谈价格。`
  },

  speakers: [
    { id: 'boss', label: '店主' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '店员' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍首饰和店里配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是店员。店员天天陪人试戴，说的是自己看多了之后的经验。
· 口吻像「我一般会先问你是日常戴还是场合戴」。
· 可以讲搭配、讲尺寸，但绝不承诺保值。`,
    noface: `这条视频不露脸，只拍首饰、手部、店里，配口播。
· 镜头语言：上手试戴、链子垂下来的样子、扣头细节、灯光下的光泽。
· 少依赖表情，多用「你看这个扣」「戴上之后到这里」这种能配画面的说法。`
  },

  toneOverrides: {
    question: `开头抛一个问题切入，比如「你有没有买过一条链子，戴两次就压箱底了？」。
· 问题要真实，不夸张。
· 后面顺着这个问题往下答。`,
    friend: '整体像朋友之间的建议：「我跟你说」「我自己戴的就这几个」。'
  },

  subjectHint: {
    howtochoose: '这一条讲怎么挑适合自己的，不讲材质参数。',
    howtofit: '这一条讲尺寸怎么定，不给具体价格和克重。',
    giftsomeone: '这一条讲送人怎么挑，重点在场合和对方习惯。',
    dailywear: '这一条讲日常佩戴，重点是不挂衣服、不碍事。'
  },

  sceneIdeas: [
    '具体的**佩戴场景**（上班、带娃、穿高领、夏天露脖子）',
    '具体的**挑选困扰**（不知道买哪种、怕买了不戴、尺寸拿不准）',
    '具体的**判断方法**（链长怎么比、戒指怎么量、日常会不会挂到）',
    '具体的**戴久了的状态**（发黑、变形、扣头松）',
    '**店里的样子**（柜台、灯、试戴时的手部特写）'
  ],
  forbiddenFacts: [
    '保值、升值、投资、传家、硬通货',
    '金价、克重、成色、纯度、工费、折扣',
    '证书、检测报告、产地、切工等级',
    '价格、活动力度、以旧换新金额',
    '顾客案例、别人买过什么（不许虚构订单和评价）'
  ],
  hardBannedPhrases: ['保值增值', '传家', '永不掉色', '纯天然', '投资首选',
    '稳赚不赔', '硬通货', '国际认证', '限量收藏'],
  compliance: [
    '绝对不许提保值、升值、投资回报。',
    '不许承诺成色、纯度、克重、证书（没有实物依据就不说）。',
    '不许用「最 / 第一 / 唯一 / 顶级」这类绝对化说法，也不许贬低同行。',
    '不许编价格、工费、折扣、以旧换新金额。'
  ],
  aiTasteWords: ['璀璨', '奢华', '传世', '永恒之爱', '经典之作',
    '匠心镶嵌', '闪耀时刻', '见证爱情'],
  tasteReplacements: [
    '「璀璨 / 闪耀」→ 删掉，说「灯下你自己看一眼就知道了」',
    '「传世 / 永恒」→ 说「戴得住才有意义」',
    '「见证爱情」→ 说「你们自己觉得合适就行」',
    '「匠心镶嵌 / 经典之作」→ 直接删掉，换成扣头、链长这些具体细节'
  ],
  badExample: '璀璨钻石，奢华镶嵌，见证永恒之爱，值得传世的经典之作。',
  goodExample: '链子别只看吊坠，先看自己平时穿什么领口：圆领配短链，高领配长链，戴出去才不别扭。',
  titleBad: '「保值增值，永不过时的传家之宝！」',
  titleGood: '「首饰买回去不戴？多半是这一步选错了」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「我们店新到了一批对戒，可以来看看。」
✅ 可以说：「新到了一批对戒，你们要是最近在挑，可以来试一下手寸，戴上感觉最准。」
❌ 不许变成：「18K 金镶钻，保值升值，传家之选。」因为：材质和升值都是编的。
❌ 不许变成：「原价 5999，活动价 3999。」因为：价格是编的。
❌ 不许变成：「上百对新人选择，好评第一。」因为：数字和评价是编的。
**而你们这次连「到了批对戒」之外的信息都没有。**
那就讲怎么量手寸、日常戴要注意什么，绝不能自己补一个材质、价格或升值。`,

  contentRaw: [
    '先看日常：天天戴的选简单款，场合戴的可以选有存在感的',
    '链长按领口定：圆领配短链，高领配长链，别按流行买',
    '戒指量手寸要在下午量，早上手指偏细',
    '扣头要试几次：好不好扣、会不会自己开，比样式重要',
    '拿不准就先戴一整天试试，别急着定'
  ],
  customerPains: [
    '买回来戴两次就压箱底',
    '不知道自己的手寸和链长',
    '戴久了发黑，不知道是不是质量问题',
    '送人怕尺寸不对、款式不喜欢',
    '柜台上看着好看，戴自己身上不是那个味'
  ]
};

module.exports = pack;

  };

  /* ---------- industries/maternal ---------- */
  __defs['industries/maternal'] = function (module, exports, require) {
'use strict';

/**
 * 母婴行业包（母婴用品 / 童装童鞋 / 奶粉辅食 / 玩具绘本）。
 *
 * 这行的敏感点是「安全」和「功效」：食品级、零添加、增强免疫力、更聪明，
 * 全部属于不能自己说的范畴。能讲的是：怎么挑、怎么试、什么情况不用买贵的。
 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'maternal',
  label: '母婴',
  emoji: '🍼',
  subTypes: [
    { id: 'supply', label: '母婴用品' }, { id: 'kidwear', label: '童装童鞋' },
    { id: 'formula', label: '奶粉辅食' }, { id: 'toy', label: '玩具绘本' }
  ],
  words: {
    store: '我们店', staff: '店员', goods: '东西', customer: '来买的宝妈',
    tryVerb: '试', place: '店里'
  },
  roleIntro: '你服务过大量母婴门店，清楚这行说话必须稳：不吓人、不承诺功效、不评价别人家孩子，只讲怎么挑、怎么用、什么时候不用买。',

  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '新到货', emoji: '🆕' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '到店福利', emoji: '🎁' },
    { id: 'outfit', label: '怎么挑不踩坑', emoji: '🧭' },
    { id: 'single', label: '主推单品', emoji: '⭐' },
    { id: 'season', label: '换季用品', emoji: '🍂' },
    { id: 'festival', label: '节日送礼', emoji: '🎊' },
    { id: 'daily', label: '门店日常', emoji: '🏬' },
    { id: 'staff', label: '店主 / 店员出镜', emoji: '🎤' },
    { id: 'auto', label: 'AI 帮我选', emoji: '✨' }
  ],

  second: {
    opening: {
      question: '开业这段时间，主要拍什么？',
      options: [
        { id: 'openday', label: '开业当天' }, { id: 'prepare', label: '开业前的准备' },
        { id: 'environment', label: '店里什么样' }, { id: 'openact', label: '开业活动' },
        { id: 'firstcustomer', label: '第一批客人' }, { id: 'teamstate', label: '店员状态' }, AI_PICK
      ]
    },
    newarrival: {
      question: '这次到的是什么？',
      options: [
        { id: 'clothes', label: '新一季童装' }, { id: 'shoes', label: '童鞋' },
        { id: 'supplies', label: '日用品（奶瓶、湿巾这类）' }, { id: 'formulanew', label: '奶粉 / 辅食' },
        { id: 'toynew', label: '玩具 / 绘本' }, { id: 'wholebatch', label: '整批新货' }, AI_PICK
      ]
    },
    activity: {
      question: '是什么活动？',
      options: [
        { id: 'openact', label: '开业活动' }, { id: 'festivalact', label: '节日活动' },
        { id: 'seasonact', label: '换季活动' }, { id: 'welfareact', label: '到店福利' },
        { id: 'memberact', label: '会员活动' }, { id: 'annivact', label: '店庆活动' }, AI_PICK
      ]
    },
    welfare: {
      question: '这次是什么福利？',
      options: [
        { id: 'visitorgift', label: '到店有礼' }, { id: 'oldcustomer', label: '老顾客回馈' },
        { id: 'freesuggest', label: '免费帮你看看缺什么' }, { id: 'freesize', label: '免费量尺码' },
        { id: 'surprise', label: '进店小惊喜' }, AI_PICK
      ]
    },
    outfit: {
      question: '想教大家怎么挑？',
      options: [
        { id: 'kidclothes', label: '童装怎么挑' }, { id: 'kidshoes', label: '童鞋怎么挑' },
        { id: 'bottle', label: '奶瓶怎么挑' }, { id: 'toychoose', label: '玩具怎么挑' },
        { id: 'size', label: '尺码怎么定' }, { id: 'avoidpit', label: '怎么避开常见的坑' }, AI_PICK
      ]
    },
    single: {
      question: '主推哪一类？',
      options: [
        { id: 'kidclothes', label: '童装' }, { id: 'kidshoes', label: '童鞋' },
        { id: 'bottle', label: '奶瓶餐具' }, { id: 'toynew', label: '玩具绘本' },
        { id: 'bestseller', label: '店里卖得最多的' }, AI_PICK
      ]
    },
    season: {
      question: '这次换季主要拍什么？',
      options: [
        { id: 'springsummer', label: '春夏换季' }, { id: 'autumnwinter', label: '秋冬换季' },
        { id: 'sensitive', label: '换季皮肤敏感' }, { id: 'sizeup', label: '孩子长个换尺码' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节点？',
      options: [
        { id: 'childday', label: '儿童节' }, { id: 'spring', label: '春节' },
        { id: 'birthday', label: '生日' }, { id: 'fullmoon', label: '满月 / 百天' },
        { id: 'schoolstart', label: '开学' }, AI_PICK
      ]
    },
    daily: {
      question: '拍店里的哪一面？',
      options: [
        { id: 'busy', label: '忙的时候' }, { id: 'quiet', label: '闲的时候' },
        { id: 'behind', label: '理货、备货' }, { id: 'detail', label: '别人不注意的细节' },
        { id: 'team', label: '店里的人' }, AI_PICK
      ]
    },
    staff: {
      question: '谁来说？',
      options: [
        { id: 'bossstory', label: '店主讲讲自己的看法' }, { id: 'whythis', label: '为什么开这家店' },
        { id: 'standard', label: '我们挑货的标准' }, { id: 'attitude', label: '我们怎么对待宝妈' }, AI_PICK
      ]
    },
    auto: {
      question: '你大概想拍哪个方向？',
      options: [
        { id: 'wantnew', label: '想拍新到的货' }, { id: 'wantact', label: '想拍活动' },
        { id: 'wantsell', label: '想推一个主打的' }, { id: 'wantdaily', label: '想拍拍店里日常' },
        { id: 'wantknow', label: '想让大家认识我们店' }, { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  goals: [
    { id: 'comestore', label: '来店里看看' }, { id: 'tryon', label: '来看看、试试' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '了解新到的货' },
    { id: 'learntips', label: '学一个挑选方法' }, { id: 'solveproblem', label: '解决一个买东西的难题' },
    { id: 'knowstore', label: '认识这家店' }, { id: 'remember', label: '记住这家店' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「来店里看一眼、试一试」。
· 宝妈最怕买了用不上，开头先替她说出这层顾虑。
· 中间讲清楚来了能怎么看、怎么试、尺码怎么定。
· 结尾轻一点：「孩子的东西，最好还是上手摸一下」。`,
    learntips: `目标是让人真的学到一点挑选方法。
· 完全站在宝妈一侧：教怎么避坑、什么情况不用买贵的。
· 开头直接给方法，不要先介绍商品。
· 中间给 1~2 条能立刻用的判断标准（鞋要能按下鞋头、衣服看是否影响活动）。
· 绝不评价别人家孩子，也不承诺任何功效。`,
    solveproblem: `目标是解决一个具体困扰，让人觉得「说的就是我」。
· 开头直接说困扰（尺码拿不准、买回去孩子不穿、不知道先买哪个）。
· 中间给一个实际办法，讲清楚为什么。
· 不吓人、不制造焦虑。`
  },

  speakers: [
    { id: 'boss', label: '店主' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '店员' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍货和店里配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是店员。店员天天接待宝妈，说的是自己见多了之后的真实经验。
· 口吻像「我一般会先问你孩子多高多重」。
· 具体、实在，不夸大，不评价孩子。`,
    noface: `这条视频不露脸，只拍货品、店里，配口播。
· 镜头语言：衣服细节、鞋底软硬、奶瓶口径、货架、手上的对比。
· 少依赖表情，多用「你看这个鞋头」「这样折一下」这种能配画面的说法。`
  },

  toneOverrides: {
    question: `开头抛一个问题切入，比如「你有没有买回去一堆，孩子一件都不穿的经历？」。
· 问题要真实，不要制造焦虑。
· 后面顺着这个问题往下答。`,
    friend: '整体像宝妈之间的交流：「我跟你说」「我家孩子那时候我就这么挑的」。'
  },

  subjectHint: {
    kidclothes: '这一条讲童装，重点是怎么看活动是否方便、尺码怎么定。',
    kidshoes: '这一条讲童鞋，重点是鞋头、鞋底、怎么试。',
    size: '这一条讲尺码，不给具体年龄对照表，讲怎么量。',
    bottle: '这一条讲奶瓶餐具，重点是口径、清洗、手感。'
  },

  sceneIdeas: [
    '具体的**带娃出门**（商场里孩子乱跑、试衣服不配合、鞋穿一半就脱）',
    '具体的**选购困扰**（尺码拿不准、材质不放心、买回去不用）',
    '具体的**判断方法**（怎么量、怎么试、什么情况买大一码）',
    '具体的**用起来的真实感受**（好不好穿脱、洗了变形不变形）',
    '**店里的样子**（货怎么摆、店员在帮宝妈量尺码）'
  ],
  forbiddenFacts: [
    '成分、配方、有机、零添加、食品级、医用级、检测认证',
    '功效：增强免疫力、更聪明、助长高、防过敏、改善睡眠',
    '适用月龄的功效说明、医生推荐、专家背书',
    '价格、折扣、赠品、活动细则',
    '销量、排名、多少宝妈买过、门店开了多少年'
  ],
  hardBannedPhrases: ['增强免疫力', '更聪明', '绝对安全', '医用级', '零添加',
    '宝宝吃了更好', '专家推荐', '医院同款', '不过敏', '无害'],
  compliance: [
    '绝对不许承诺任何功效（营养、免疫、发育、防过敏、助眠）。',
    '不许给医疗或喂养建议（该吃什么、该补什么、生病怎么办）。',
    '不许用「最 / 第一 / 唯一 / 顶级」这类绝对化说法，也不许评价别人家孩子。',
    '不许编造价格、折扣、赠品、认证。'
  ],
  aiTasteWords: ['甄选', '呵护', '安心之选', '母婴优选', '科学育儿',
    '温柔陪伴', '成长每一步', '给宝宝最好的'],
  tasteReplacements: [
    '「甄选 / 安心之选」→ 删掉，说「这几样我都自己上手摸过」',
    '「呵护 / 温柔陪伴」→ 说「孩子用着方不方便，你上手一摸就知道」',
    '「科学育儿」→ 说「每个孩子情况不一样，先看你家孩子的习惯」',
    '「给宝宝最好的」→ 直接删掉，换成具体的一句话'
  ],
  badExample: '甄选母婴好物，科学育儿，给宝宝最安心的呵护，陪伴成长每一步。',
  goodExample: '买童鞋先按一下鞋头，能按下去一点、弯得动的，孩子跑起来才不容易绊。',
  titleBad: '「增强免疫力，宝宝吃了更聪明！」',
  titleGood: '「童鞋别只看好看，先按一下这里」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「我们店里到了新一季的童装，你可以带孩子来看看。」
✅ 可以说：「新一季童装到了，孩子长得快的话，可以带他来试试尺码。」
❌ 不许变成：「A 类面料，零甲醛，宝宝穿了不过敏。」因为：材质和功效全是编的。
❌ 不许变成：「买两件送一件，仅限本周。」因为：用户没说过任何优惠。
❌ 不许变成：「宝妈们都说好，回购率第一。」因为：评价和数字是编的。
**而你们这次连「到了新一季童装」之外的信息都没有。**
那就讲怎么挑、怎么试、怎么定尺码，绝不能自己补一个材质、功效或价格。`,

  contentRaw: [
    '先量再买：身高体重报给店员，比按年龄猜靠谱',
    '童鞋要按鞋头：能按下去、能弯，跑起来不容易绊',
    '衣服看活动：抬手、蹲下不勒，比好看重要',
    '奶瓶看口径和清洗：广口的刷起来省事',
    '拿不准就少买：孩子长得快，先买当季够穿的'
  ],
  customerPains: [
    '尺码拿不准，买回去穿两次就小了',
    '买回去一堆，孩子一件都不穿',
    '不知道材质怎么样，摸起来心里没底',
    '玩具买回去玩两天就扔一边',
    '店里东西太多，不知道先买哪个'
  ]
};

module.exports = pack;

  };

  /* ---------- industries/optical ---------- */
  __defs['industries/optical'] = function (module, exports, require) {
'use strict';

/**
 * 眼镜行业包（眼镜零售 / 验光配镜 / 太阳镜 / 隐形眼镜）。
 *
 * 这行有一条绝对红线：治疗近视。任何「降度数、摘眼镜、度数不涨」的说法都不能出现。
 * 能讲的是：怎么选镜框、怎么验光、戴着头晕怎么办、孩子多久查一次。
 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'optical',
  label: '眼镜',
  emoji: '👓',
  subTypes: [
    { id: 'frame', label: '眼镜零售' }, { id: 'exam', label: '验光配镜' },
    { id: 'sunglass', label: '太阳镜' }, { id: 'contact', label: '隐形眼镜' }
  ],
  words: {
    store: '我们店', staff: '验光师', goods: '眼镜', customer: '来配镜的人',
    tryVerb: '试戴', place: '店里'
  },
  roleIntro: '你服务过大量眼镜门店，清楚这行有一条不能碰的线：治疗近视。内容只讲怎么选、怎么验、戴不舒服怎么办，不碰任何疗效。',

  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '新到镜架 / 镜片', emoji: '🆕' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '到店福利', emoji: '🎁' },
    { id: 'outfit', label: '怎么选不踩坑', emoji: '🧭' },
    { id: 'single', label: '主推款', emoji: '⭐' },
    { id: 'season', label: '换季 / 用眼高峰', emoji: '☀️' },
    { id: 'festival', label: '开学季', emoji: '🎊' },
    { id: 'daily', label: '门店日常', emoji: '🏬' },
    { id: 'staff', label: '店主 / 验光师出镜', emoji: '🎤' },
    { id: 'auto', label: 'AI 帮我选', emoji: '✨' }
  ],

  second: {
    opening: {
      question: '开业这段时间，主要拍什么？',
      options: [
        { id: 'openday', label: '开业当天' }, { id: 'prepare', label: '开业前的准备' },
        { id: 'environment', label: '店里什么样' }, { id: 'openact', label: '开业活动' },
        { id: 'firstcustomer', label: '第一批客人' }, { id: 'teamstate', label: '店员状态' }, AI_PICK
      ]
    },
    newarrival: {
      question: '这次到的是什么？',
      options: [
        { id: 'newframe', label: '新镜架' }, { id: 'newlens', label: '新镜片' },
        { id: 'newsun', label: '新太阳镜' }, { id: 'newcontact', label: '新隐形' },
        { id: 'kidnew', label: '儿童款' }, AI_PICK
      ]
    },
    activity: {
      question: '是什么活动？',
      options: [
        { id: 'openact', label: '开业活动' }, { id: 'schoolact', label: '开学活动' },
        { id: 'seasonact', label: '换季活动' }, { id: 'welfareact', label: '到店福利' },
        { id: 'memberact', label: '会员活动' }, { id: 'annivact', label: '店庆活动' }, AI_PICK
      ]
    },
    welfare: {
      question: '这次是什么福利？',
      options: [
        { id: 'freecheck', label: '免费验光' }, { id: 'freeadjust', label: '免费调校、清洗' },
        { id: 'oldcustomer', label: '老顾客回馈' }, { id: 'freesuggest', label: '免费帮你看看镜架合不合适' },
        { id: 'surprise', label: '进店小惊喜' }, AI_PICK
      ]
    },
    outfit: {
      question: '想教大家怎么选？',
      options: [
        { id: 'framefit', label: '镜架怎么挑' }, { id: 'lenschoose', label: '镜片怎么选' },
        { id: 'childmyopia', label: '孩子多久查一次' }, { id: 'dizzy', label: '戴着头晕怎么办' },
        { id: 'avoidpit', label: '怎么避开常见的坑' }, AI_PICK
      ]
    },
    single: {
      question: '主推哪一类？',
      options: [
        { id: 'frameitem', label: '镜架' }, { id: 'lensitem', label: '镜片' },
        { id: 'sunit', label: '太阳镜' }, { id: 'contactitem', label: '隐形眼镜' },
        { id: 'kiditem', label: '儿童镜' }, { id: 'bestseller', label: '店里配得最多的' }, AI_PICK
      ]
    },
    season: {
      question: '这次是什么变化？',
      options: [
        { id: 'summer', label: '夏天（防晒、强光）' }, { id: 'winter', label: '冬天（起雾）' },
        { id: 'school', label: '开学用眼多' }, { id: 'dryeye', label: '换季眼睛干' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节点？',
      options: [
        { id: 'schoolstart', label: '开学季' }, { id: 'childday', label: '儿童节' },
        { id: 'summerstart', label: '入夏' }, { id: 'newyear', label: '年末' }, AI_PICK
      ]
    },
    daily: {
      question: '拍店里的哪一面？',
      options: [
        { id: 'busy', label: '忙的时候' }, { id: 'quiet', label: '闲的时候' },
        { id: 'behind', label: '验光、加工' }, { id: 'detail', label: '别人不注意的细节' },
        { id: 'team', label: '店里的人' }, AI_PICK
      ]
    },
    staff: {
      question: '谁来说？',
      options: [
        { id: 'bossstory', label: '店主讲讲自己的看法' }, { id: 'whythis', label: '为什么做这一行' },
        { id: 'standard', label: '我们验光的流程' }, { id: 'attitude', label: '我们怎么帮客人挑' }, AI_PICK
      ]
    },
    auto: {
      question: '你大概想拍哪个方向？',
      options: [
        { id: 'wantnew', label: '想拍新到的镜架' }, { id: 'wantact', label: '想拍活动' },
        { id: 'wantsell', label: '想推一款主打的' }, { id: 'wantdaily', label: '想拍拍店里日常' },
        { id: 'wantknow', label: '想让大家认识我们店' }, { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  goals: [
    { id: 'comestore', label: '来店里看看' }, { id: 'tryon', label: '来试戴' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '看看新到的镜架' },
    { id: 'learntips', label: '学一个挑选方法' }, { id: 'solveproblem', label: '解决一个戴镜困扰' },
    { id: 'knowstore', label: '认识这家店' }, { id: 'remember', label: '记住这家店' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「来试戴、来验一次光」。
· 眼镜不上脸看不出合不合适，开头先把这个道理说清楚。
· 中间讲清楚来了会做什么（验光、试戴、调校）。
· 结尾轻一点：「戴上走两圈，比看图片准」。`,
    learntips: `目标是让人真的学到一点挑选、护眼的方法。
· 完全站在顾客一侧：教怎么选镜架、怎么看镜片、戴着头晕怎么处理。
· 开头直接给方法，不要先介绍款式。
· 中间给 1~2 条立刻能用的标准（镜架宽度、瞳距、镜腿松紧）。
· 绝不承诺度数变化，也不提治疗。`,
    solveproblem: `目标是解决一个具体困扰，让人觉得「说的就是我」。
· 开头直接说困扰（戴着头晕、镜架老下滑、孩子度数涨得快）。
· 中间给一个实际办法，讲清楚为什么。
· 遇到度数变化，只能说「建议去正规机构查一下」，不给方案。`
  },

  speakers: [
    { id: 'boss', label: '店主' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '验光师' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍镜架和验光过程配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是验光师。天天验光调校，说的是自己上手之后的判断。
· 口吻像「我一看你原来的镜腿就知道为什么老下滑」。
· 可以讲验光流程、讲调校，但绝不许承诺度数变化。`,
    noface: `这条视频不露脸，只拍镜架、验光设备、调校过程，配口播。
· 镜头语言：镜架特写、试戴侧面、验光仪、螺丝刀调校。
· 少依赖表情，多用「你看这个镜腿」「这样调一下」这种能配画面的说法。`
  },

  toneOverrides: {
    question: `开头抛一个问题切入，比如「你有没有配完新眼镜，戴两天就头晕？」。
· 问题要真实，不吓人。
· 后面顺着这个问题往下答。`,
    friend: '整体像朋友之间的建议：「我跟你说」「我自己配镜都这么挑」。'
  },

  subjectHint: {
    framefit: '这一条讲镜架怎么挑，重点在宽度和脸型，不讲品牌。',
    lenschoose: '这一条讲镜片怎么选，按用途讲，不报折射率参数。',
    childmyopia: '这一条讲孩子查眼睛的频率，只说建议检查，绝不承诺控制度数。',
    dizzy: '这一条讲新镜戴着不舒服怎么处理，强调回店调校。'
  },

  sceneIdeas: [
    '具体的**戴镜困扰**（老下滑、压鼻梁、镜腿夹耳朵、看久了累）',
    '具体的**配镜场景**（第一次配、换新、孩子查视力、开车要偏光）',
    '具体的**判断方法**（镜架宽度、瞳距、试戴走两步）',
    '具体的**验光过程**（看视力表、试镜片、调校）',
    '**店里的样子**（镜架墙、验光室、加工台）'
  ],
  forbiddenFacts: [
    '治疗近视、降度数、控制度数、摘掉眼镜、恢复视力',
    '折射率、阿贝数、镀膜层数、品牌型号',
    '价格、折扣、镜片加价、套餐',
    '验光数据、度数、散光值（不许给具体数字建议）',
    '顾客案例、孩子配了之后怎么样（不许虚构效果）'
  ],
  hardBannedPhrases: ['治疗近视', '摘掉眼镜', '度数不涨', '控制度数',
    '防蓝光护眼治病', '恢复视力', '矫正视力', '医学验光', '一分钱一分货'],
  compliance: [
    '绝对不许宣称治疗近视或控制度数——这是红线。',
    '不许给验光数据建议（该配多少度、要不要加散光），只能说去正规机构检查。',
    '不许用「最 / 第一 / 唯一 / 顶级」这类绝对化说法，也不许贬低同行。',
    '不许编价格、套餐、镜片参数。'
  ],
  aiTasteWords: ['清晰视界', '护眼黑科技', '轻盈舒适', '匠心工艺',
    '时尚百搭', '专业验配', '呵护双眼', '品质之选'],
  tasteReplacements: [
    '「清晰视界 / 呵护双眼」→ 删掉，说「戴上走两步，看远处清不清楚你自己知道」',
    '「护眼黑科技」→ 说「这个镜片是干什么用的，我给你讲清楚」',
    '「时尚百搭」→ 说「你这张脸配这个宽度更稳」',
    '「专业验配 / 品质之选」→ 直接删掉，换成验光流程里的具体一步'
  ],
  badExample: '专业验配，护眼黑科技，守护清晰视界，让您告别眼镜烦恼。',
  goodExample: '镜架老往下滑，多半不是鼻子的问题，是镜腿太松，回店调一下就好，两分钟的事。',
  titleBad: '「科学护眼，度数不涨，帮孩子摘掉眼镜！」',
  titleGood: '「眼镜老下滑？两分钟就能调好」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「我们店到了新一批镜架，可以来看看。」
✅ 可以说：「到了批新镜架，宽度和框型都不太一样，你来试戴一下才知道哪种稳。」
❌ 不许变成：「防蓝光镜片，保护视力，度数不涨。」因为：功效承诺是红线。
❌ 不许变成：「原价 899，现价 299，还送一副。」因为：价格是编的。
❌ 不许变成：「上万人都配过，好评第一。」因为：数字和评价是编的。
**而你们这次连「到了批新镜架」之外的信息都没有。**
那就讲怎么挑宽度、怎么试戴、戴着不舒服怎么调，绝不能碰任何疗效。`,

  contentRaw: [
    '镜架先看宽度：和脸最宽处齐平，太窄夹头、太宽老下滑',
    '试戴别只照镜子：戴上低头、抬头、走两步，看滑不滑',
    '新镜戴着晕，先回店调镜腿和鼻托，别硬扛',
    '孩子查视力按固定节奏去，别等看不清黑板才去',
    '开车用的太阳镜要偏光，颜色别太深'
  ],
  customerPains: [
    '眼镜老往下滑，一天要推几十次',
    '新配的戴着晕，走路都不稳',
    '镜腿夹耳朵，戴久了疼',
    '不知道孩子的度数有没有变',
    '网上配的镜架好看，戴上不合适'
  ]
};

module.exports = pack;

  };

  /* ---------- industries/other ---------- */
  __defs['industries/other'] = function (module, exports, require) {
'use strict';

/**
 * 通用兜底行业包（「其他行业」）。
 *
 * 定位：导购找不到自己行业时的最后一道保险。
 * 特点：不假设任何产品形态，只讲「到店、看货、怎么挑、怎么用」这类放之四海皆准的事；
 *      禁编清单取最保守的一档，宁可写得平淡，也不许编一个数字。
 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'other',
  label: '其他行业',
  emoji: '🧩',
  subTypes: [
    { id: 'retail', label: '零售门店' }, { id: 'service', label: '服务门店' },
    { id: 'studio', label: '工作室' }, { id: 'unknown', label: '说不太清' }
  ],
  words: {
    store: '我们店', staff: '店员', goods: '东西', customer: '顾客',
    tryVerb: '试', place: '店里'
  },
  roleIntro: '你服务过各种各样的实体小店，知道不管卖什么，一条能用的门店短视频讲的是「人来了会看到什么、怎么挑、怎么用」，而不是形容词。',

  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '新到货 / 上新', emoji: '🆕' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '到店福利', emoji: '🎁' },
    { id: 'outfit', label: '怎么挑不踩坑', emoji: '🧭' },
    { id: 'single', label: '主推这一个', emoji: '⭐' },
    { id: 'season', label: '换季 / 换时段', emoji: '🌿' },
    { id: 'festival', label: '节日', emoji: '🎊' },
    { id: 'daily', label: '门店日常', emoji: '🏬' },
    { id: 'staff', label: '老板 / 店员出镜', emoji: '🎤' },
    { id: 'auto', label: 'AI 帮我选', emoji: '✨' }
  ],

  second: {
    opening: {
      question: '开业这段时间，主要拍什么？',
      options: [
        { id: 'openday', label: '开业当天现场' }, { id: 'prepare', label: '开业前的准备' },
        { id: 'environment', label: '店里是什么样' }, { id: 'openact', label: '开业活动' },
        { id: 'firstcustomer', label: '第一批客人' }, { id: 'teamstate', label: '店员状态' },
        { id: 'whyopen', label: '为什么开这家店' }, AI_PICK
      ]
    },
    newarrival: {
      question: '这次上新，主要拍什么？',
      options: [
        { id: 'signature', label: '主推的那一个' }, { id: 'several', label: '好几个新品' },
        { id: 'wholebatch', label: '整批新货' }, { id: 'newcategory', label: '新加的品类' },
        { id: 'restock', label: '老款补货' }, AI_PICK
      ]
    },
    activity: {
      question: '是什么活动？',
      options: [
        { id: 'openact', label: '开业活动' }, { id: 'festivalact', label: '节日活动' },
        { id: 'seasonact', label: '换季活动' }, { id: 'welfareact', label: '到店福利' },
        { id: 'memberact', label: '会员活动' }, { id: 'annivact', label: '店庆活动' }, AI_PICK
      ]
    },
    welfare: {
      question: '这次是什么福利？',
      options: [
        { id: 'visitorgift', label: '到店有礼' }, { id: 'oldcustomer', label: '老顾客回馈' },
        { id: 'freesuggest', label: '免费帮你挑' }, { id: 'newexperience', label: '新品试用' },
        { id: 'surprise', label: '进店小惊喜' }, AI_PICK
      ]
    },
    outfit: {
      question: '想教大家挑什么？',
      options: [
        { id: 'howtochoose', label: '怎么挑不出错' }, { id: 'avoidpit', label: '怎么避开常见的坑' },
        { id: 'budget', label: '预算怎么分配' }, { id: 'fitfirst', label: '先看什么再看什么' },
        { id: 'mistake', label: '别人常犯的错' }, AI_PICK
      ]
    },
    single: {
      question: '主推的是哪一类？',
      options: [
        { id: 'bestseller', label: '店里走得最好的' }, { id: 'newone', label: '刚到的新品' },
        { id: 'valueone', label: '性价比高的' }, { id: 'uniqueone', label: '别处不好找的' },
        { id: 'ownerpick', label: '老板自己推荐的' }, AI_PICK
      ]
    },
    season: {
      question: '这次是哪种变化？',
      options: [
        { id: 'seasonchange', label: '换季' }, { id: 'timechange', label: '换时段（早晚 / 工作日周末）' },
        { id: 'needchange', label: '顾客需求变了' }, { id: 'stockchange', label: '货换了' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节日？',
      options: [
        { id: 'spring', label: '春节前后' }, { id: 'midautumn', label: '中秋 / 国庆' },
        { id: 'valentine', label: '情人节 / 七夕' }, { id: 'motherday', label: '母亲节 / 父亲节' },
        { id: 'childday', label: '儿童节' }, { id: 'newyear', label: '元旦 / 年末' }, AI_PICK
      ]
    },
    daily: {
      question: '拍店里的哪一面？',
      options: [
        { id: 'busy', label: '忙的时候' }, { id: 'quiet', label: '闲的时候' },
        { id: 'behind', label: '背后的准备' }, { id: 'detail', label: '别人不注意的细节' },
        { id: 'team', label: '店里的人' }, AI_PICK
      ]
    },
    staff: {
      question: '谁来说？',
      options: [
        { id: 'bossstory', label: '老板讲讲自己的看法' }, { id: 'whythis', label: '为什么做这一行' },
        { id: 'standard', label: '我们挑东西的标准' }, { id: 'attitude', label: '我们怎么对待顾客' }, AI_PICK
      ]
    },
    auto: {
      question: '你大概想拍哪个方向？',
      options: [
        { id: 'wantnew', label: '想拍新到的东西' }, { id: 'wantact', label: '想拍活动' },
        { id: 'wantsell', label: '想推一个主打的' }, { id: 'wantdaily', label: '想拍拍店里日常' },
        { id: 'wantknow', label: '想让大家认识我们店' }, { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  goals: [
    { id: 'comestore', label: '来店里看看' }, { id: 'tryon', label: '来试一下' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '了解新到的东西' },
    { id: 'learntips', label: '学一个挑选方法' }, { id: 'solveproblem', label: '解决一个选购难题' },
    { id: 'knowstore', label: '认识这家店' }, { id: 'remember', label: '记住这家店' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「亲自来试一下」。
· 开头点破一个事实：光看图片和亲手试，完全是两回事。
· 中间讲清楚什么情况下来试最合适、来了怎么试比较省时间。
· 结尾把「来试一下」说出来，语气轻松，不要有推销压力。`,
    learntips: `目标是让看的人真的学到一点挑选方法，从而觉得「这个人懂行」。
· 硬广感降到最低 —— 这条更像一个真心在分享经验的人。
· 开头别介绍货，直接给方法、给判断。
· 中间给 1~2 条真正能用的方法，用大白话讲。
· 全篇几乎不推货，最多最后一句自然带到「店里可以来看看」。`,
    solveproblem: `目标是解决一个具体的选购困扰，让人觉得「说的就是我」。
· 开头直接把困扰说出来（不知道买哪个、怕买回去用不上、预算不知道定多少……）。
· 中间给一个切实能用的小办法，讲清楚为什么有用。
· 不要用行业黑话，越像邻居在教你越好。
· 结尾可以自然带到店里，也可以不带 —— 内容价值优先。`
  },

  speakers: [
    { id: 'boss', label: '老板' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '店员' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍东西和店里配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是店员。店员天天在店里招呼客人，说的是自己看多了之后的真实感受。
· 口吻像「你要是拿不准，我一般会先问你这几个问题」。
· 具体、实在，不讲大道理。`,
    noface: `这条视频不露脸，只拍东西和店里，配口播。
· 文案必须考虑镜头语言：货架、手感、上手演示、店里环境、拿取动作。
· 少依赖「表情」和「眼神」这类只有露脸才能传达的东西。
· 多用「你看这个细节」「镜头拉近一点」「这样拿一下你就明白了」这种能配画面的说法。`
  },

  toneOverrides: {
    question: `开头用「抛一个问题」的方式切入（这一条主要影响开头）。
· 这个问题要问到人心上，比如「你有没有那种，进店转了两圈，最后还是空手出来的经历？」
· 后面要顺着这个问题往下答。`,
    friend: '整体像朋友之间的推荐：「我跟你说」「我自己一般就这么挑」这种口吻。'
  },

  subjectHint: {
    signature: '这一条围绕店里最想推的那一个东西讲。',
    several: '这一条讲好几个新品，要有整体感，不要只盯一个。',
    howtochoose: '这一条讲挑选方法，不推具体哪个。',
    budget: '这一条讲预算怎么分配，不报具体价格。',
    bestseller: '这一条讲走得最好的那个，重点讲清楚「为什么是它」。'
  },

  sceneIdeas: [
    '具体的**到店场景**（下班顺路、周末带家人、临时缺个东西）',
    '具体的**挑选困扰**（不知道买哪个、怕买贵、怕用不上、尺寸拿不准）',
    '具体的**判断方法**（先看什么、怎么试、什么情况不用买贵的）',
    '具体的**使用感受**（拿在手里的分量、用起来顺不顺手、放家里占不占地方）',
    '**门店本身的样子**（货怎么摆、店员在忙什么、老顾客回来干什么）'
  ],
  forbiddenFacts: [
    '价格、原价、折扣、优惠、赠品、活动细则、名额、时间限制',
    '销量、排名、复购率、开了多少年、多少会员、获得过什么荣誉',
    '具体参数、材质成分、检测认证、产地、工艺细节',
    '顾客评价、顾客原话、别人怎么说（不许虚构任何顾客说过的话）'
  ],
  hardBannedPhrases: ['性价比超高', '闭眼入', '不买后悔', '抢疯了', '卖爆了', '全网最低',
    '良心推荐', '亲测有效', '品质保证', '假一赔十'],
  compliance: [
    '不许承诺任何功效（好用、耐用、有效、能省钱都要有依据，没有就别写）。',
    '不许用「最好 / 第一 / 唯一 / 顶级」这类绝对化说法，也不许贬低同行。',
    '不许编造任何数字：价格、销量、年份、人数、次数、时长。'
  ],
  aiTasteWords: ['甄选', '严选', '匠心', '品质生活', '轻奢', '一站式', '全方位',
    '贴心服务', '极致体验', '尊享', '优选好物'],
  tasteReplacements: [
    '「甄选 / 严选」→ 直接删掉，说「我们店里就这几样，都是我一个个挑的」',
    '「匠心 / 品质生活」→ 说「用起来顺不顺手，你自己上手一下就知道了」',
    '「一站式 / 全方位」→ 说「你要的那几样，我们店里基本都有」',
    '「尊享 / 极致体验」→ 说「来了慢慢看，不着急」'
  ],
  badExample: '甄选全球好物，匠心打造品质生活，一站式满足您的所有需求。',
  goodExample: '你要是不确定买哪个，进来先跟我说说用在什么地方，我帮你缩到两三个，再自己上手试试。',
  titleBad: '「全网最低价，闭眼入不后悔！」',
  titleGood: '「拿不准买哪个？先弄清楚这三件事」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「我们店里最近到了些新东西，你可以来看看。」
✅ 可以说：「最近到了些新东西，你要是正好缺，可以进来看看。」
❌ 不许变成：「新品上市，全场八折，仅限三天！」因为：用户没说过任何价格和时限。
❌ 不许变成：「销量第一，回头客百分之九十。」因为：数字全是编的。
❌ 不许变成：「采用进口材质，国家认证。」因为：材质和认证都是编的。
**而你们这次连「到了什么」之外的信息都没有。**
那就靠场景、挑选方法、使用感受来写，绝不能自己补一个价格、参数或数字。`,

  contentRaw: [
    '先问用途：买回去干什么用，比看多少张图都管用',
    '再看尺寸和场景：放哪儿、给谁用、多久用一次',
    '拿不准就少买：先买一个试试，合适再来',
    '别一次问太多：先说最在意的一点，店员才好帮你缩范围',
    '贵的不一定合适，合适的用起来才不折腾'
  ],
  customerPains: [
    '进店转两圈，不知道从哪看起',
    '怕买贵了，又不好意思问',
    '买回去才发现用不上',
    '网上图片和实物差太远',
    '店员一上来就推贵的，反而不敢问了'
  ]
};

module.exports = pack;

  };

  /* ---------- industries/pet ---------- */
  __defs['industries/pet'] = function (module, exports, require) {
'use strict';

/**
 * 宠物行业包（宠物店 / 洗护 / 用品 / 寄养）。
 *
 * 这行最容易越界的是「治病」：皮肤病、驱虫、疫苗、生病怎么处理，
 * 都不是门店能承诺的事。写稿只讲洗护过程、用品挑选、寄养日常。
 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'pet',
  label: '宠物',
  emoji: '🐾',
  subTypes: [
    { id: 'shop', label: '宠物用品店' }, { id: 'grooming', label: '洗护美容' },
    { id: 'boarding', label: '寄养' }, { id: 'mix', label: '综合宠物店' }
  ],
  words: {
    store: '我们店', staff: '店员', goods: '东西', customer: '带毛孩子来的人',
    tryVerb: '试', place: '店里'
  },
  roleIntro: '你服务过大量宠物门店，知道这行说话的分寸：不诊断、不承诺治好，只讲洗护怎么做、东西怎么挑、寄养一天是怎么过的。',

  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '新到货', emoji: '🆕' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '到店福利', emoji: '🎁' },
    { id: 'outfit', label: '怎么挑不踩坑', emoji: '🧭' },
    { id: 'single', label: '主推服务 / 单品', emoji: '⭐' },
    { id: 'season', label: '换季照顾', emoji: '🍂' },
    { id: 'festival', label: '节日', emoji: '🎊' },
    { id: 'daily', label: '门店日常', emoji: '🏬' },
    { id: 'staff', label: '店主 / 美容师出镜', emoji: '🎤' },
    { id: 'auto', label: 'AI 帮我选', emoji: '✨' }
  ],

  second: {
    opening: {
      question: '开业这段时间，主要拍什么？',
      options: [
        { id: 'openday', label: '开业当天' }, { id: 'prepare', label: '开业前的准备' },
        { id: 'environment', label: '店里什么样' }, { id: 'openact', label: '开业活动' },
        { id: 'firstcustomer', label: '第一批客人' }, { id: 'teamstate', label: '店里的人' }, AI_PICK
      ]
    },
    newarrival: {
      question: '这次到的是什么？',
      options: [
        { id: 'foodnew', label: '新到的粮' }, { id: 'snacknew', label: '新零食' },
        { id: 'toynew', label: '新玩具' }, { id: 'supplynew', label: '日用品（窝、牵引、猫砂）' },
        { id: 'clothesnew', label: '宠物衣服' }, { id: 'wholebatch', label: '整批新货' }, AI_PICK
      ]
    },
    activity: {
      question: '是什么活动？',
      options: [
        { id: 'openact', label: '开业活动' }, { id: 'festivalact', label: '节日活动' },
        { id: 'seasonact', label: '换季活动' }, { id: 'welfareact', label: '洗护福利' },
        { id: 'memberact', label: '会员活动' }, { id: 'annivact', label: '店庆活动' }, AI_PICK
      ]
    },
    welfare: {
      question: '这次是什么福利？',
      options: [
        { id: 'firstgroom', label: '第一次洗护可以先试' }, { id: 'oldcustomer', label: '老顾客回馈' },
        { id: 'freesuggest', label: '免费帮你看看毛量、指甲' }, { id: 'freenail', label: '免费剪指甲' },
        { id: 'surprise', label: '进店小惊喜' }, AI_PICK
      ]
    },
    outfit: {
      question: '想教大家怎么挑？',
      options: [
        { id: 'foodchoose', label: '粮怎么挑' }, { id: 'toychoose', label: '玩具怎么挑' },
        { id: 'harness', label: '牵引怎么挑' }, { id: 'catlitter', label: '猫砂怎么挑' },
        { id: 'groomchoose', label: '洗护项目怎么选' }, { id: 'avoidpit', label: '怎么避开常见的坑' }, AI_PICK
      ]
    },
    single: {
      question: '主推哪个？',
      options: [
        { id: 'bath', label: '洗澡' }, { id: 'haircut', label: '剪毛造型' },
        { id: 'deodor', label: '去味 / 深层清洁' }, { id: 'boarding', label: '寄养' },
        { id: 'foodnew', label: '主推的粮' }, { id: 'bestseller', label: '店里做得最多的' }, AI_PICK
      ]
    },
    season: {
      question: '这次换季主要拍什么？',
      options: [
        { id: 'hairfall', label: '换季掉毛' }, { id: 'hot', label: '天热降温' },
        { id: 'cold', label: '天冷保暖' }, { id: 'skin', label: '换季皮肤干、痒' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节点？',
      options: [
        { id: 'spring', label: '春节（寄养高峰）' }, { id: 'longholiday', label: '长假出游' },
        { id: 'birthday', label: '宠物生日' }, { id: 'newyear', label: '年末' }, AI_PICK
      ]
    },
    daily: {
      question: '拍店里的哪一面？',
      options: [
        { id: 'busy', label: '洗护忙的时候' }, { id: 'quiet', label: '人少的时候' },
        { id: 'behind', label: '洗护的准备' }, { id: 'detail', label: '别人不注意的细节' },
        { id: 'team', label: '店里的人和宠物' }, AI_PICK
      ]
    },
    staff: {
      question: '谁来说？',
      options: [
        { id: 'bossstory', label: '店主讲讲自己的看法' }, { id: 'whythis', label: '为什么开这家店' },
        { id: 'standard', label: '我们洗护的标准' }, { id: 'attitude', label: '我们怎么对待宠物' }, AI_PICK
      ]
    },
    auto: {
      question: '你大概想拍哪个方向？',
      options: [
        { id: 'wantnew', label: '想拍新到的货' }, { id: 'wantact', label: '想拍活动' },
        { id: 'wantsell', label: '想推洗护或寄养' }, { id: 'wantdaily', label: '想拍拍店里日常' },
        { id: 'wantknow', label: '想让大家认识我们店' }, { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  goals: [
    { id: 'comestore', label: '带它来店里' }, { id: 'tryon', label: '来洗一次试试' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '了解新到的东西' },
    { id: 'learntips', label: '学一个照顾方法' }, { id: 'solveproblem', label: '解决一个养宠困扰' },
    { id: 'knowstore', label: '认识这家店' }, { id: 'remember', label: '记住这家店' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「带宠物来洗一次」。
· 宠物主人最怕的是「洗的时候被粗暴对待、回来情绪不对」，开头先把这层顾虑说出来。
· 中间讲清楚洗护流程、大概多久、主人在不在场。
· 结尾轻一点：「第一次可以先来洗个基础款」。`,
    learntips: `目标是让人真的学到一点照顾方法。
· 完全站在养宠人一侧：教怎么挑、怎么判断、什么情况该去医院（可以说「这种情况要问医生」，但不下诊断）。
· 开头直接给方法，不要先介绍服务。
· 中间给 1~2 条能立刻用的判断标准（粮怎么看配料表顺序、猫砂看结团）。
· 绝不承诺治好任何问题。`,
    solveproblem: `目标是解决一个具体困扰，让人觉得「说的就是我」。
· 开头直接说困扰（洗完两天又臭、剪毛剪坏、寄养不放心、猫砂带得到处都是）。
· 中间给一个实际办法，讲清楚为什么。
· 不诊断、不承诺疗效。`
  },

  speakers: [
    { id: 'boss', label: '店主' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '美容师 / 店员' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍洗护过程和店里配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是美容师。天天跟猫狗打交道，说的是自己上手之后的真实经验。
· 口吻像「这只我一摸就知道毛打结在哪」。
· 可以讲手法、讲流程，但绝不许诊断病情。`,
    noface: `这条视频不露脸，只拍洗护过程、宠物、店里，配口播。
· 镜头语言：洗澡、吹毛、剪指甲、梳毛、宠物在笼位里的样子。
· 少依赖表情，多用「你看它这个反应」「这样梳一下」这种能配画面的说法。`
  },

  toneOverrides: {
    question: `开头抛一个问题切入，比如「你有没有洗完第二天，一进门还是一股味？」。
· 问题要真实，别夸张。
· 后面顺着这个问题往下答。`,
    friend: '整体像养宠人之间的交流：「我跟你说」「我家那只也这样」。'
  },

  subjectHint: {
    foodchoose: '这一条讲粮怎么挑，看配料表顺序和适口性，不评价品牌。',
    grooming: '这一条讲洗护项目怎么选，按毛量和需求分。',
    boarding: '这一条讲寄养，重点是每天怎么过、怎么反馈。'
  },

  sceneIdeas: [
    '具体的**养宠日常困扰**（掉毛、异味、指甲长、洗澡像打仗）',
    '具体的**带宠物出门**（进店怕生、别的狗叫、猫包一出门就叫）',
    '具体的**判断方法**（毛打结怎么摸、粮怎么挑、猫砂怎么试）',
    '具体的**洗护过程**（进水前的试探、吹毛时的反应、剪完的样子）',
    '**店里的样子**（笼位怎么安排、寄养的每天怎么遛）'
  ],
  forbiddenFacts: [
    '血统、证书、品种纯度、疫苗记录、驱虫记录',
    '治病、疗效、皮肤病怎么治、吃什么药、多久能好',
    '成分表细节、进口来源、检测报告',
    '价格、洗护套餐、寄养费用、折扣',
    '顾客案例、别人的宠物怎么样（不许虚构任何宠物案例）'
  ],
  hardBannedPhrases: ['纯种保证', '包健康', '包治', '一洗就好', '不掉毛',
    '不过敏', '绝对安全', '医院同款', '进口粮', '天然无添加'],
  compliance: [
    '绝对不许做任何诊断或治疗承诺（皮肤病、耳螨、驱虫、疫苗怎么打）。',
    '遇到健康问题只能建议「这个最好问一下医生」，不许给方案。',
    '不许用「最 / 第一 / 唯一 / 顶级」这类绝对化说法，也不许贬低同行。',
    '不许编造价格、套餐、寄养费用、血统与疫苗信息。'
  ],
  aiTasteWords: ['毛孩子的幸福', '科学养宠', '宠爱', '萌宠日常',
    '温柔以待', '陪伴', '治愈系', '精致养宠'],
  tasteReplacements: [
    '「科学养宠 / 精致养宠」→ 删掉，说「按它的情况来，别跟风买」',
    '「毛孩子的幸福 / 宠爱」→ 说「它舒不舒服，看它进店的反应就知道」',
    '「治愈系 / 陪伴」→ 直接删掉，换成具体场景',
    '「温柔以待」→ 说「洗的时候手轻一点，它就配合」'
  ],
  badExample: '科学养宠，精致呵护，让每一只毛孩子都被温柔以待。',
  goodExample: '猫洗完回来一直舔毛，多半是没吹透，你摸一下它后腿根，潮的就是没干。',
  titleBad: '「专业洗护，一洗就好，包治皮肤病！」',
  titleGood: '「洗完两天又臭？多半是这一步没做」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「我们店新到了几款猫砂，你可以来看看。」
✅ 可以说：「新到了几款猫砂，结团和带出情况不一样，你可以来看看哪种适合你家猫。」
❌ 不许变成：「天然无添加，零粉尘，猫用了不生病。」因为：成分和功效是编的。
❌ 不许变成：「原价 129，现价 69，买二送一。」因为：价格是编的。
❌ 不许变成：「上千只猫都在用，好评第一。」因为：数字和评价是编的。
**而你们这次连「到了几款猫砂」之外的信息都没有。**
那就讲怎么判断结团、怎么减少带出，绝不能自己补一个成分、功效或价格。`,

  contentRaw: [
    '猫砂先看结团：铲起来不散、不粘盆底，清理才省事',
    '看带出：颗粒大小和脚感，决定它会不会带得到处都是',
    '粮先看配料表前几位，再试小包装，别一次囤大袋',
    '洗护按毛量定：长毛和短毛的流程不一样',
    '第一次寄养先短住一天，看它适应不适应'
  ],
  customerPains: [
    '洗完第二天又有味道',
    '剪毛剪得不均匀，回来看着别扭',
    '寄养几天回来，瘦了也不爱动',
    '猫砂带得满屋都是',
    '粮换来换去，吃了就软便'
  ]
};

module.exports = pack;

  };

  /* ---------- industries/photo ---------- */
  __defs['industries/photo'] = function (module, exports, require) {
'use strict';

/**
 * 摄影行业包（婚纱照 / 写真 / 儿童摄影 / 证件照）。
 *
 * 这行两条红线：拿别人样片冒充自己的作品、承诺「拍出来显瘦/像明星」。
 * 内容只能讲怎么沟通、怎么选、拍之前要准备什么。
 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'photo',
  label: '婚纱摄影',
  emoji: '📷',
  subTypes: [
    { id: 'wedding', label: '婚纱照' }, { id: 'portrait', label: '写真' },
    { id: 'kids', label: '儿童摄影' }, { id: 'idphoto', label: '证件照' }
  ],
  words: {
    store: '我们店', staff: '摄影师', goods: '片子', customer: '来拍的人',
    tryVerb: '拍', place: '店里'
  },
  roleIntro: '你服务过很多摄影工作室，清楚这行最怕两件事：客人拍完觉得不像自己、选片时被套加钱。内容就讲怎么避免这两件事。',

  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '新主题 / 新场景', emoji: '🆕' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '到店福利', emoji: '🎁' },
    { id: 'outfit', label: '拍之前怎么准备', emoji: '🧭' },
    { id: 'single', label: '主推套系', emoji: '⭐' },
    { id: 'season', label: '季节 / 档期', emoji: '🍂' },
    { id: 'festival', label: '节日档期', emoji: '🎊' },
    { id: 'daily', label: '工作室日常', emoji: '🏬' },
    { id: 'staff', label: '摄影师 / 主理人出镜', emoji: '🎤' },
    { id: 'auto', label: 'AI 帮我选', emoji: '✨' }
  ],

  second: {
    opening: {
      question: '开业这段时间，主要拍什么？',
      options: [
        { id: 'openday', label: '开业当天' }, { id: 'prepare', label: '开业前的准备' },
        { id: 'environment', label: '棚里什么样' }, { id: 'openact', label: '开业活动' },
        { id: 'firstcustomer', label: '第一批客人' }, { id: 'teamstate', label: '团队' }, AI_PICK
      ]
    },
    newarrival: {
      question: '这次上的是什么？',
      options: [
        { id: 'newtheme', label: '新主题' }, { id: 'newscene', label: '新场景 / 新棚' },
        { id: 'newoutfit', label: '新服装' }, { id: 'newmakeup', label: '新妆造风格' },
        { id: 'newservice', label: '新的服务方式' }, AI_PICK
      ]
    },
    activity: {
      question: '是什么活动？',
      options: [
        { id: 'openact', label: '开业活动' }, { id: 'festivalact', label: '节日活动' },
        { id: 'seasonact', label: '档期活动' }, { id: 'welfareact', label: '到店福利' },
        { id: 'memberact', label: '老客回馈' }, { id: 'annivact', label: '店庆' }, AI_PICK
      ]
    },
    welfare: {
      question: '这次是什么福利？',
      options: [
        { id: 'freesuggest', label: '免费帮你看看适合什么风格' }, { id: 'freetry', label: '免费试妆' },
        { id: 'freeconsult', label: '免费聊一次拍摄方案' }, { id: 'oldcustomer', label: '老客回馈' },
        { id: 'surprise', label: '进店小惊喜' }, AI_PICK
      ]
    },
    outfit: {
      question: '想教大家准备什么？',
      options: [
        { id: 'howtosay', label: '怎么跟摄影师说自己想要的' }, { id: 'howtoprepare', label: '拍之前要准备什么' },
        { id: 'howtocheck', label: '怎么看成片是不是自己' }, { id: 'avoidpit', label: '怎么避开加钱的坑' },
        { id: 'poses', label: '不会摆姿势怎么办' }, AI_PICK
      ]
    },
    single: {
      question: '主推哪一类？',
      options: [
        { id: 'weddingset', label: '婚纱套系' }, { id: 'portraitset', label: '个人写真' },
        { id: 'kidsset', label: '儿童写真' }, { id: 'idphotoset', label: '证件照 / 形象照' },
        { id: 'coupleset', label: '情侣照' }, { id: 'bestseller', label: '店里拍得最多的' }, AI_PICK
      ]
    },
    season: {
      question: '这一季拍什么？',
      options: [
        { id: 'spring', label: '春天外景' }, { id: 'summer', label: '夏天的光' },
        { id: 'autumn', label: '秋天落叶' }, { id: 'winter', label: '冬天 & 室内' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节点？',
      options: [
        { id: 'weddingseason', label: '婚礼旺季前' }, { id: 'valentine', label: '情人节 / 七夕' },
        { id: 'childday', label: '儿童节' }, { id: 'graduation', label: '毕业季' },
        { id: 'newyear', label: '年末全家福' }, AI_PICK
      ]
    },
    daily: {
      question: '拍工作室的哪一面？',
      options: [
        { id: 'busy', label: '拍摄当天' }, { id: 'quiet', label: '没人的时候' },
        { id: 'behind', label: '布光、修片' }, { id: 'detail', label: '别人不注意的细节' },
        { id: 'team', label: '团队在一起' }, AI_PICK
      ]
    },
    staff: {
      question: '谁来说？',
      options: [
        { id: 'bossstory', label: '主理人讲讲自己的看法' }, { id: 'whythis', label: '为什么做这一行' },
        { id: 'standard', label: '我们的拍摄标准' }, { id: 'attitude', label: '我们怎么对待客人' }, AI_PICK
      ]
    },
    auto: {
      question: '你大概想拍哪个方向？',
      options: [
        { id: 'wantnew', label: '想拍新主题' }, { id: 'wantact', label: '想拍活动' },
        { id: 'wantsell', label: '想推一个套系' }, { id: 'wantdaily', label: '想拍拍工作室日常' },
        { id: 'wantknow', label: '想让大家认识我们' }, { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  goals: [
    { id: 'comestore', label: '来店里看看' }, { id: 'tryon', label: '来试妆 / 试拍' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '看看新主题' },
    { id: 'learntips', label: '学一个准备方法' }, { id: 'solveproblem', label: '解决一个拍照的顾虑' },
    { id: 'knowstore', label: '认识我们' }, { id: 'remember', label: '记住这家工作室' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「来试妆、来聊一次」。
· 拍之前最大的顾虑是「拍出来不像自己」，开头先把这层顾虑说破。
· 中间讲清楚来了会做什么（聊风格、试妆、看服装），没有压力。
· 结尾轻一点：「先来聊聊，不合适也不算白来」。`,
    learntips: `目标是让人真的学到一点准备方法。
· 完全站在客人一侧：教怎么选风格、怎么沟通、怎么避免加钱。
· 开头直接给方法，不要先介绍套系。
· 中间给 1~2 条立刻能用的做法（存三张自己喜欢的照片、提早一周剪头发）。
· 绝不承诺拍摄效果。`,
    solveproblem: `目标是解决一个具体顾虑，让人觉得「说的就是我」。
· 开头直接说顾虑（不会摆姿势、怕拍得不像自己、怕选片被推销）。
· 中间给一个实际办法，讲清楚为什么。
· 语气像拍过很多次的朋友。`
  },

  speakers: [
    { id: 'boss', label: '主理人' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '摄影师' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍棚里和成片配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是摄影师。天天在棚里，说的是自己拍多了之后的判断。
· 口吻像「我一般会先问你平时拍照爱笑还是不爱笑」。
· 可以讲怎么引导、怎么找角度，但不许承诺效果。`,
    noface: `这条视频不露脸，只拍棚里、灯光、相机、成片，配口播。
· 镜头语言：布光、快门、翻看成片、服装间、化妆台。
· 少依赖表情，多用「你看这个光」「这样站一下」这种能配画面的说法。`
  },

  toneOverrides: {
    question: `开头抛一个问题切入，比如「你有没有拍完一组照片，回家越看越不像自己？」。
· 问题要真实，不夸张。
· 后面顺着这个问题往下答。`,
    friend: '整体像朋友之间的建议：「我跟你说」「我拍之前都这么准备」。'
  },

  subjectHint: {
    howtosay: '这一条教怎么表达想要的风格，不推套系。',
    howtoprepare: '这一条讲拍摄前的准备，具体到能做的事。',
    avoidpit: '这一条讲怎么避免加钱，讲清楚哪些要提前问。',
    poses: '这一条讲不会摆姿势怎么办，给具体做法。'
  },

  sceneIdeas: [
    '具体的**拍摄顾虑**（不会摆姿势、怕不像自己、怕妆太浓）',
    '具体的**准备场景**（提前挑衣服、剪头发、带什么来）',
    '具体的**沟通方法**（给摄影师看什么、怎么说自己喜欢的风格）',
    '具体的**拍摄当天**（棚里的光、化妆台、翻看成片的时刻）',
    '**工作室的样子**（服装间、相机、布光）'
  ],
  forbiddenFacts: [
    '样片是谁拍的、用了什么客片（不许拿别人作品当自己的）',
    '拍摄张数、精修数量、服装套数、场景数',
    '价格、套系内容、加片价格、折扣',
    '摄影师从业年限、获奖、合作过谁',
    '客人案例、别人拍完怎么样（不许虚构客片和评价）'
  ],
  hardBannedPhrases: ['明星同款', '拍出明星感', '显瘦十斤', '不满意退款',
    '全网最低', '样片级', '一对一专属', '包出片', '绝对好看'],
  compliance: [
    '绝对不许用别人的样片冒充自己的作品。',
    '不许承诺拍摄效果（显瘦、像明星、一定好看）。',
    '不许用「最 / 第一 / 唯一 / 顶级」这类绝对化说法，也不许贬低同行。',
    '不许编价格、套系内容、张数、精修数量。'
  ],
  aiTasteWords: ['定格美好', '光影艺术', '专属定制', '记录最美时刻',
    '唯美', '浪漫大片', '电影感', '妆造美学'],
  tasteReplacements: [
    '「定格美好 / 记录最美时刻」→ 删掉，说「拍完你自己翻一遍，觉得像自己就对了」',
    '「光影艺术 / 电影感」→ 说「这个光打在脸上是什么效果，来棚里看一眼」',
    '「专属定制 / 唯美」→ 说「先聊你平时什么样，再定风格」',
    '「妆造美学」→ 直接删掉，换成具体的妆造细节'
  ],
  badExample: '光影艺术，专属定制，定格最美时刻，拍出电影感大片。',
  goodExample: '不会摆姿势没关系，拍摄时我会一直跟你说话，你回答的时候那个表情就是最自然的。',
  titleBad: '「明星同款妆造，拍出来显瘦十斤！」',
  titleGood: '「拍完不像自己？问题多半出在这一步」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「我们棚里新搭了一个场景，可以来看看。」
✅ 可以说：「新搭了一个场景，你要是最近想拍一组，可以来棚里看看是不是你喜欢的调子。」
❌ 不许变成：「全新唯美场景，专业团队一对一，拍出明星感。」因为：效果承诺没依据。
❌ 不许变成：「原价 6999，现在 3999，还送精修 30 张。」因为：价格和张数是编的。
❌ 不许变成：「上千对新人都在这里拍。」因为：数字是编的。
**而你们这次连「新搭了一个场景」之外的信息都没有。**
那就讲适合什么人拍、怎么沟通风格，绝不能自己补一个价格或效果。`,

  contentRaw: [
    '存三张你喜欢的照片给摄影师看，比说「我想要自然一点」有用',
    '提前一周剪头发，别拍摄前一天剪',
    '拍摄当天穿好打理的衣服，换装省时间',
    '不会摆姿势就说不会，摄影师会带着你做动作',
    '选片前先想清楚自己要几张，别在现场被推着加'
  ],
  customerPains: [
    '拍完觉得不像自己，妆太浓、姿势太假',
    '选片的时候一直劝加钱，很尴尬',
    '成片和当初看的样片差太远',
    '不会摆姿势，全程都很僵',
    '拍完等片等很久，修出来还是不满意'
  ]
};

module.exports = pack;

  };

  /* ---------- industries/tea ---------- */
  __defs['industries/tea'] = function (module, exports, require) {
'use strict';

/**
 * 茶叶行业包（茶叶零售 / 茶空间 / 茶礼定制 / 茶具）。
 *
 * 这行有两个坑：编年份山头（古树、明前、核心产区）、讲功效（降三高、养生）。
 * 内容只讲怎么泡、怎么闻、怎么选、送礼怎么配。
 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'tea',
  label: '茶叶',
  emoji: '🍵',
  subTypes: [
    { id: 'retail', label: '茶叶零售' }, { id: 'space', label: '茶空间' },
    { id: 'gift', label: '茶礼定制' }, { id: 'ware', label: '茶具' }
  ],
  words: {
    store: '我们店', staff: '店员', goods: '茶', customer: '来喝茶的人',
    tryVerb: '尝', place: '店里'
  },
  roleIntro: '你服务过很多茶店和茶空间，知道这行不能编年份山头、不能讲功效，只能讲怎么泡、怎么闻、怎么选到合口的。',

  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '新茶到店', emoji: '🆕' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '到店福利', emoji: '🎁' },
    { id: 'outfit', label: '怎么挑茶不踩坑', emoji: '🧭' },
    { id: 'single', label: '主推茶品', emoji: '⭐' },
    { id: 'season', label: '时令 / 新茶季', emoji: '🌿' },
    { id: 'festival', label: '节日茶礼', emoji: '🎊' },
    { id: 'daily', label: '店里日常', emoji: '🏬' },
    { id: 'staff', label: '店主 / 茶艺师出镜', emoji: '🎤' },
    { id: 'auto', label: 'AI 帮我选', emoji: '✨' }
  ],

  second: {
    opening: {
      question: '开业这段时间，主要拍什么？',
      options: [
        { id: 'openday', label: '开业当天' }, { id: 'prepare', label: '开业前的准备' },
        { id: 'environment', label: '店里什么样' }, { id: 'openact', label: '开业活动' },
        { id: 'firstcustomer', label: '第一批客人' }, { id: 'teamstate', label: '店里的人' }, AI_PICK
      ]
    },
    newarrival: {
      question: '这次到的是什么茶？',
      options: [
        { id: 'greentea', label: '绿茶' }, { id: 'oolong', label: '乌龙' },
        { id: 'blacktea', label: '红茶' }, { id: 'puertea', label: '普洱' },
        { id: 'whitetea', label: '白茶 / 花茶' }, { id: 'wholebatch', label: '整批新茶' }, AI_PICK
      ]
    },
    activity: {
      question: '是什么活动？',
      options: [
        { id: 'openact', label: '开业活动' }, { id: 'festivalact', label: '节日活动' },
        { id: 'seasonact', label: '新茶季' }, { id: 'welfareact', label: '到店福利' },
        { id: 'memberact', label: '会员活动' }, { id: 'annivact', label: '店庆活动' }, AI_PICK
      ]
    },
    welfare: {
      question: '这次是什么福利？',
      options: [
        { id: 'freetaste', label: '到店免费尝一泡' }, { id: 'oldcustomer', label: '老顾客回馈' },
        { id: 'freesuggest', label: '免费帮你选' }, { id: 'freebrew', label: '免费教你泡一次' },
        { id: 'surprise', label: '进店小惊喜' }, AI_PICK
      ]
    },
    outfit: {
      question: '想教大家怎么选？',
      options: [
        { id: 'howtotaste', label: '怎么尝出合不合口' }, { id: 'howtobrew', label: '怎么泡不苦' },
        { id: 'giftsomeone', label: '送人怎么挑' }, { id: 'budget', label: '预算怎么定' },
        { id: 'avoidpit', label: '怎么避开常见的坑' }, AI_PICK
      ]
    },
    single: {
      question: '主推哪一类？',
      options: [
        { id: 'greentea', label: '绿茶' }, { id: 'oolong', label: '乌龙' },
        { id: 'blacktea', label: '红茶' }, { id: 'puertea', label: '普洱' },
        { id: 'teaward', label: '茶具' }, { id: 'bestseller', label: '店里卖得最好的' }, AI_PICK
      ]
    },
    season: {
      question: '这一季拍什么？',
      options: [
        { id: 'springtea', label: '春茶' }, { id: 'summertea', label: '夏天冷泡' },
        { id: 'autumntea', label: '秋天喝什么' }, { id: 'wintertea', label: '冬天煮茶' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节日？',
      options: [
        { id: 'spring', label: '春节送茶' }, { id: 'midautumn', label: '中秋' },
        { id: 'teacherday', label: '教师节' }, { id: 'newyear', label: '年末走访' }, AI_PICK
      ]
    },
    daily: {
      question: '拍店里的哪一面？',
      options: [
        { id: 'busy', label: '客人多的时候' }, { id: 'quiet', label: '没人的时候' },
        { id: 'behind', label: '选茶、分装' }, { id: 'detail', label: '别人不注意的细节' },
        { id: 'team', label: '店里的人' }, AI_PICK
      ]
    },
    staff: {
      question: '谁来说？',
      options: [
        { id: 'bossstory', label: '店主讲讲自己的看法' }, { id: 'whythis', label: '为什么开这家店' },
        { id: 'standard', label: '我们挑茶的标准' }, { id: 'attitude', label: '我们怎么招待客人' }, AI_PICK
      ]
    },
    auto: {
      question: '你大概想拍哪个方向？',
      options: [
        { id: 'wantnew', label: '想拍新到的茶' }, { id: 'wantact', label: '想拍活动' },
        { id: 'wantsell', label: '想推一款茶' }, { id: 'wantdaily', label: '想拍拍店里日常' },
        { id: 'wantknow', label: '想让大家认识我们店' }, { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  goals: [
    { id: 'comestore', label: '来店里坐坐' }, { id: 'tryon', label: '来尝一泡' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '看看新茶' },
    { id: 'learntips', label: '学一个泡茶方法' }, { id: 'solveproblem', label: '解决一个喝茶的困扰' },
    { id: 'knowstore', label: '认识这家店' }, { id: 'remember', label: '记住这家店' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「来店里尝一泡」。
· 茶好不好喝，只有喝了才知道，开头先把这个说清楚。
· 中间讲清楚来了怎么尝、喝哪几种、要不要带东西。
· 结尾轻一点：「先来坐半小时，喝两口再决定」。`,
    learntips: `目标是让人真的学到一点泡茶、选茶的方法。
· 完全站在喝茶人一侧：教怎么泡不苦、怎么判断合不合口。
· 开头直接给方法，不要先介绍茶。
· 中间给 1~2 条立刻能用的做法（水温、投茶量、出汤时间）。
· 绝不讲功效，也不编年份山头。`,
    solveproblem: `目标是解决一个具体困扰，让人觉得「说的就是我」。
· 开头直接说困扰（泡出来苦、买回去放坏了、送礼不知道挑什么）。
· 中间给一个实际办法，讲清楚为什么。
· 不夸大、不讲功效。`
  },

  speakers: [
    { id: 'boss', label: '店主' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '茶艺师 / 店员' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍泡茶和茶汤配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是茶艺师。天天泡茶，说的是自己喝多了之后的判断。
· 口吻像「这款我一般用 90 度水，出汤快一点」。
· 可以讲泡法、讲口感，但不编年份山头。`,
    noface: `这条视频不露脸，只拍泡茶、茶汤、店里，配口播。
· 镜头语言：注水、出汤、茶汤颜色、叶底、茶具细节。
· 少依赖表情，多用「你看这个汤色」「注水到这里」这种能配画面的说法。`
  },

  toneOverrides: {
    question: `开头抛一个问题切入，比如「你有没有买过一饼茶，泡出来又苦又涩？」。
· 问题要真实，不夸张。
· 后面顺着这个问题往下答。`,
    friend: '整体像朋友之间的分享：「我跟你说」「我自己在家就这么泡」。'
  },

  subjectHint: {
    howtotaste: '这一条教怎么尝，讲口感层次，不编产地。',
    howtobrew: '这一条讲泡法，给水温和出汤节奏。',
    giftsomeone: '这一条讲送礼怎么挑，重点在对方平时喝什么。',
    budget: '这一条讲预算怎么定，不报价格。'
  },

  sceneIdeas: [
    '具体的**喝茶场景**（办公室、饭后、招待客人、一个人下午）',
    '具体的**喝茶困扰**（泡苦了、放久了变味、不知道买哪种）',
    '具体的**判断方法**（闻干茶、看汤色、看叶底、尝回甘）',
    '具体的**泡的过程**（温杯、注水、出汤的节奏）',
    '**店里的样子**（茶台、茶罐、分装、客人围坐）'
  ],
  forbiddenFacts: [
    '年份、山头、古树、核心产区、海拔',
    '功效：降三高、减肥、养生、助眠、解酒',
    '等级、获奖、比赛名次、大师制作',
    '价格、克价、折扣、礼盒内容',
    '顾客案例、别人喝过怎么样（不许虚构评价）'
  ],
  hardBannedPhrases: ['古树纯料', '降三高', '养生保健', '收藏升值',
    '明前特级', '核心产区', '百年古树', '大师手作', '越陈越香'],
  compliance: [
    '不许讲任何功效（降三高、减肥、养生、助眠、解酒）。',
    '不许编年份、山头、古树、产区、等级。',
    '不许用「最 / 第一 / 唯一 / 顶级」这类绝对化说法，也不许贬低同行。',
    '不许编价格、克价、礼盒内容。'
  ],
  aiTasteWords: ['茶香四溢', '禅意生活', '东方美学', '一盏清欢',
    '茶道精神', '岁月沉淀', '匠心制茶', '雅致生活'],
  tasteReplacements: [
    '「茶香四溢 / 一盏清欢」→ 删掉，说「你闻一下这个干茶，再看汤色」',
    '「禅意生活 / 东方美学」→ 说「坐下来喝两口，急不起来」',
    '「岁月沉淀 / 匠心制茶」→ 说「这批是今年新到的，怎么存的我不瞎说」',
    '「雅致生活」→ 直接删掉，换成具体的茶具或泡法'
  ],
  badExample: '匠心制茶，茶香四溢，一盏清欢，品味东方美学与禅意生活。',
  goodExample: '绿茶别用刚烧开的水，晾一两分钟再冲，泡出来才不苦。',
  titleBad: '「百年古树，降三高，养生必备！」',
  titleGood: '「茶泡出来苦？水温多半高了」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「我们店新到了一批绿茶，可以来尝尝。」
✅ 可以说：「新到了一批绿茶，你要是有兴趣可以来尝一泡，合不合口自己喝最准。」
❌ 不许变成：「明前核心产区，古树纯料，一年只有这一批。」因为：年份和产区是编的。
❌ 不许变成：「原价 1280，现价 680。」因为：价格是编的。
❌ 不许变成：「老茶客都说好，回头率第一。」因为：评价和数字是编的。
**而你们这次连「到了批绿茶」之外的信息都没有。**
那就讲怎么泡、怎么尝、什么口味适合什么人，绝不能自己补一个产地、年份或价格。`,

  contentRaw: [
    '绿茶水温别太高：烧开后晾一两分钟再冲，不容易苦',
    '出汤要快：第一泡十几秒就倒出来，泡久了涩',
    '尝茶看三样：闻干茶、看汤色、尝回甘',
    '买之前先尝：同一款不同批次味道也不一样',
    '存茶避光避味：别放冰箱和有味道的东西一起'
  ],
  customerPains: [
    '不懂怎么挑，怕买贵了还不好喝',
    '泡出来又苦又涩，怀疑买错了',
    '买回去放半年，味道全变了',
    '送人不知道挑哪种，怕不合对方口味',
    '同一款茶两次买的味道不一样'
  ]
};

module.exports = pack;

  };

  /* ---------- llm ---------- */
  __defs['llm'] = function (module, exports, require) {
'use strict';

/**
 * 第三方大模型调用层（OpenAI Chat Completions 兼容）
 *
 * 职责：
 *  1. 发请求（带超时）—— 上游实测会慢到 40 秒以上，超时必须给足
 *  2. 把模型返回的文本解析成 { title, hook, script, risk_notice }
 *  3. 解析失败时四级兜底，绝不让前端拿到空数据
 *  4. 错误分类，并且保证错误信息里不会出现 API Key
 */

/**
 * ⚠️ 这个文件刻意**不 require 任何 Node 内置模块**（原来 require 过 ./env，但它用了 fs）。
 * 因为同一份代码要被两处复用：
 *   1. 本地 Node 服务（server.js）
 *   2. Cloudflare Pages Functions（Workers 运行时，没有 fs / path / os）
 * 所以下面把需要的两个小工具函数直接内联进来，保持这个文件「纯逻辑、零运行时依赖」。
 */

/** 把 URL 规范成 .../v1/chat/completions */
function chatEndpoint(baseUrl) {
  let u = String(baseUrl || '').trim().replace(/\/+$/, '');
  if (/\/chat\/completions$/.test(u)) return u;
  if (/\/v1$/.test(u)) return u + '/chat/completions';
  return u + '/v1/chat/completions';
}

/** 密钥脱敏：任何要写进日志/返回体的字符串都先过一遍 */
function maskSecret(text) {
  let s = String(text == null ? '' : text);
  s = s.replace(/sk-[A-Za-z0-9_\-]{6,}/g, 'sk-****');
  s = s.replace(/(Bearer\s+)[A-Za-z0-9_\-\.]{6,}/gi, '$1****');
  return s;
}

/** 不同操作的采样温度：换一版要更发散，压缩要更收敛 */
const TEMPERATURE = {
  generate: 0.9,
  regenerate: 1.0,
  hook: 0.85,
  myvoice: 0.75,
  downearth: 0.8,
  shorter: 0.6,
  lengthfix: 0.4,   // 定量改写，要收敛，不要发散
  safefix: 0.4      // 违规词改写，同样要收敛
};

class LLMError extends Error {
  constructor(kind, message, status) {
    super(maskSecret(message));
    this.name = 'LLMError';
    this.kind = kind;      // config | timeout | network | upstream | format | unknown
    this.status = status || 0;
  }
}

/** 调用方（前端）能看懂的提示语 —— 绝不包含任何密钥或内部细节 */
const USER_FACING = {
  config: 'AI 服务还没配置好，请联系管理员检查接口配置。',
  timeout: 'AI 想得有点久，再等一会儿也未必有结果 —— 稍后再点一次吧。',
  network: 'AI 暂时没连上，缓一下再点一次。',
  upstream: 'AI 暂时没连上，缓一下再点一次。',
  ratelimit: '这会儿用的人有点多，等几秒再点一次就好。',
  format: 'AI 这次回的内容有点乱，再点一次就好。',
  unknown: '出了点小问题，缓一下再试。'
};

function userFacingMessage(kind) {
  return USER_FACING[kind] || USER_FACING.unknown;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------
 * 进度回调（V0.4 新增）
 *
 * 浏览器直连时，整个生成过程都在用户眼皮底下跑，界面必须能显示
 * 「现在到底在干什么」。所以把内部真实步骤抛出来，前端照着写文案。
 *
 * 只抛**真的发生过**的事情：真的要校正字数就抛 lengthfix，
 * 真的撞了限流要等就抛 retry。前端不许凭空编造进度。
 *
 * Node / Cloudflare 端不注册回调，行为跟以前完全一样。
 * ------------------------------------------------------------------ */

let progressHook = null;

function setProgressHook(fn) {
  progressHook = typeof fn === 'function' ? fn : null;
}

function emitProgress(evt) {
  if (!progressHook) return;
  try { progressHook(evt); } catch (e) { /* 回调出错不能影响主流程 */ }
}

/**
 * 重试等待策略也可以被替换。
 * 浏览器端会换成长等待（用户就坐在屏幕前，界面会一直给它交代进展），
 * 服务端保持默认的短等待（请求不能挂太久）。
 */
let retryPolicy = null;

function setRetryPolicy(fn) {
  retryPolicy = typeof fn === 'function' ? fn : null;
}

/**
 * 哪些错误值得再试一次，以及每次等多久。
 *
 * 上游是免费额度的公开接口，实测连续请求会撞 429（速率限制）。
 * 不重试的话，用户连点两下就看到「没连上」，体验很差 ——
 * 而后端多等几秒再试一次，往往就过了。
 */
function retryWaits(e) {
  if (retryPolicy) {
    const custom = retryPolicy(e);
    if (custom !== undefined) return custom;
  }
  if (e.kind === 'ratelimit') return [4000, 9000];                    // 限流：等久一点
  if (e.kind === 'network') return [1500, 3500];                      // 网络抖一下
  if (e.kind === 'upstream' && e.status >= 500) return [2000, 5000];  // 上游 5xx
  if (e.kind === 'timeout') return [2000];                            // 上游偶发慢，自动再试一次
  return null;                                                        // 配置/格式 不重试
}

/**
 * 调用大模型，返回结构化结果（带自动重试）
 */
async function chatJSON(cfg, messages, action, opts) {
  let attempt = 0;
  for (;;) {
    try {
      return await chatOnce(cfg, messages, action, opts);
    } catch (e) {
      const waits = retryWaits(e);
      if (!waits || attempt >= waits.length) throw e;
      const w = waits[attempt];
      attempt += 1;
      console.warn('[llm] 第 ' + attempt + ' 次重试，等待 ' + w + 'ms（原因：' + e.kind +
        (e.status ? ' HTTP ' + e.status : '') + '）');
      // 告诉前端「要等一会儿」，但别说是限流 —— 前端会翻译成人话
      emitProgress({ type: 'retry', action, attempt, waitMs: w, kind: e.kind });
      await sleep(w);
    }
  }
}

/**
 * 单次调用
 * @param {object} cfg   { API_KEY, API_URL, MODEL_NAME }
 * @param {Array}  messages
 * @param {string} action 用于取 temperature
 * @param {object} opts  { timeoutMs, maxTokens }
 */
async function chatOnce(cfg, messages, action, opts) {
  const options = opts || {};
  const timeoutMs = options.timeoutMs || 90000;

  if (!cfg.configured) {
    throw new LLMError('config', '缺少配置：' + (cfg.missing || []).join(', '));
  }

  const url = chatEndpoint(cfg.API_URL);
  const body = {
    model: cfg.MODEL_NAME,
    messages,
    temperature: TEMPERATURE[action] !== undefined ? TEMPERATURE[action] : 0.8,
    max_tokens: options.maxTokens || 1600,
    response_format: { type: 'json_object' }
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  let text;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + cfg.API_KEY
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    text = await res.text();
  } catch (e) {
    clearTimeout(timer);
    if (e && e.name === 'AbortError') {
      throw new LLMError('timeout', '请求超时（' + timeoutMs + 'ms）');
    }
    throw new LLMError('network', '网络请求失败：' + (e && e.message ? e.message : e));
  }
  clearTimeout(timer);

  if (!res.ok) {
    // 上游报错：只保留状态码和一小段响应体，并且脱敏
    const snippet = maskSecret(String(text || '').slice(0, 400));
    // 429 是「请求太频繁」，单独归类 —— 上层会退避重试，用户看到的提示也更准确
    const kind = res.status === 429 ? 'ratelimit' : 'upstream';
    throw new LLMError(kind, 'HTTP ' + res.status + ' ' + snippet, res.status);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new LLMError('upstream', '上游返回的不是合法 JSON：' + maskSecret(String(text).slice(0, 200)));
  }

  const content = extractContent(data);
  if (!content) {
    throw new LLMError('upstream', '上游返回里没有可用的文本内容');
  }

  const parsed = parseStructured(content);

  return {
    title: parsed.title,
    hook: parsed.hook,
    script: parsed.script,
    risk_notice: parsed.risk_notice,
    usage: (data && data.usage) || {},
    model: (data && data.model) || cfg.MODEL_NAME,
    raw: content
  };
}

/** 从各家可能的响应结构里取出正文 */
function extractContent(data) {
  if (!data) return '';
  // 标准 OpenAI
  if (data.choices && data.choices[0]) {
    const c = data.choices[0];
    if (c.message && typeof c.message.content === 'string') return c.message.content;
    if (c.delta && typeof c.delta.content === 'string') return c.delta.content;
    if (typeof c.text === 'string') return c.text;
  }
  // 少数中转的简化结构
  if (typeof data.content === 'string') return data.content;
  if (typeof data.output_text === 'string') return data.output_text;
  if (typeof data.result === 'string') return data.result;
  return '';
}

/**
 * 把模型输出解析成四段。
 * 顺序：直接 JSON → 剥 ```json 围栏 → 正则抠出第一个 {...} → 纯文本兜底
 * 任何情况下都不允许把空数据丢给前端。
 */
function parseStructured(content) {
  const text = String(content || '').trim();

  // 1) 直接就是 JSON
  const direct = tryJSON(text);
  if (direct) return normalizeResult(direct);

  // 2) 被 markdown 围栏包住
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    const inner = tryJSON(fence[1].trim());
    if (inner) return normalizeResult(inner);
  }

  // 3) 文本里夹着 JSON 对象
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last > first) {
    const inner = tryJSON(text.slice(first, last + 1));
    if (inner) return normalizeResult(inner);
  }

  // 4) 完全不是 JSON —— 兜底成纯口语稿
  return fallbackFromPlainText(text);
}

function tryJSON(s) {
  try {
    const o = JSON.parse(s);
    if (o && typeof o === 'object' && !Array.isArray(o)) return o;
  } catch (e) { /* 忽略 */ }
  return null;
}

function pickString(obj, keys) {
  for (const k of keys) {
    const v = obj && obj[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (Array.isArray(v) && v.length) return v.map((x) => String(x).trim()).filter(Boolean).join('\n');
  }
  return '';
}

/** 字段名容错：模型可能写成 script / 口播 / full_script 等 */
function normalizeResult(o) {
  const title = pickString(o, ['title', 'video_title', '标题', '视频标题']);
  const hook = pickString(o, ['hook', 'opening', 'start', '开头', '3秒开头', '三秒开头']);
  const script = pickString(o, ['script', 'full_script', 'fullScript', 'content', 'text', '口播', '完整口播', '完整口播稿']);
  const risk = pickString(o, ['risk_notice', 'riskNotice', 'risk', 'notice', '风险提示', '提醒']);

  let finalScript = script;
  let finalHook = hook;

  if (!finalScript && finalHook) finalScript = finalHook;
  if (!finalHook && finalScript) finalHook = firstSentences(finalScript, 2);
  if (!finalScript) finalScript = title || '';

  // 标题是必须项：模型没给就从句子里压一个短的（不是直接复制第一句话）
  const finalTitle = title || condenseTitle(finalScript);

  return {
    title: finalTitle,
    hook: finalHook,
    script: finalScript,
    // 只有确实有内容才算风险提示，空字符串/null 一律归零
    risk_notice: /^(无|没有|none|null|n\/a|-)$/i.test(risk) ? '' : risk
  };
}

/** 纯文本兜底：整段当口播，前两句当开头 */
function fallbackFromPlainText(text) {
  const clean = String(text)
    .replace(/^\s*```[\s\S]*?\n/, '')
    .replace(/```\s*$/, '')
    .trim();

  if (!clean) {
    return { title: '', hook: '', script: '', risk_notice: '' };
  }
  return {
    title: condenseTitle(clean),
    hook: firstSentences(clean, 2),
    script: clean,
    risk_notice: ''
  };
}

/** 从句子里压一个短标题（不做「复制第一句」这件事，所以先剥掉引导性开头） */
function condenseTitle(script) {
  const s = String(script || '').replace(/\s+/g, ' ').trim();
  if (!s) return '';
  const firstSentence = (s.split(/(?<=[。！？!?；;\n])/)[0] || s).trim();
  if (firstSentence.length >= 8 && firstSentence.length <= 26) return firstSentence.replace(/[。！？!?；;]$/, '');
  return firstSentence.slice(0, 22);
}

/** 只数汉字（标点、数字、字母、空白都不算）—— 和 Prompt 里对模型的说法保持一致 */
function countHanzi(s) {
  const m = String(s || '').match(/[\u4e00-\u9fa5]/g);
  return m ? m.length : 0;
}

function firstSentences(text, n) {
  const parts = String(text)
    .split(/(?<=[。！？!?；;\n])/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.slice(0, n).join('') || String(text).slice(0, 60);
}

module.exports = { chatJSON, LLMError, userFacingMessage, maskSecret, countHanzi, emitProgress, setProgressHook, setRetryPolicy };

  };

  /* ---------- prompts ---------- */
  __defs['prompts'] = function (module, exports, require) {
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
· 不要直接截断句子 —— 删完必须还是一句一句通顺的口语。
· **改完必须真的短下来**：宁可删多、不要删少。删完自己数一遍，超过 ${hi} 字就是没改到位。`
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

  };

  /* ---------- taxonomy ---------- */
  __defs['taxonomy'] = function (module, exports, require) {
'use strict';

/**
 * 选项树门面 —— V0.2
 *
 * 这个文件不再存具体的行业数据，只做三件事：
 *   1. 从静态注册表取行业包
 *   2. 组装给前端的 7 步定义（第二步仍随第一步动态变）
 *   3. 白名单规范化用户提交的选择（含 industry / subType / storeName）
 *
 * 前端不用关心行业：它拿到的 steps 结构和 V0.1 完全一样。
 * 选项 id 全行业统一（boss / guide / tryon / comestore …），只是中文标签不同。
 */

const BASE = require('./base');
const REG = require('./industries');

/* ============================ 通用选项（全行业一致） ============================ */

const TONES = [
  { id: 'chat', label: '自然聊天' },
  { id: 'warm', label: '亲切' },
  { id: 'downearth', label: '接地气' },
  { id: 'humor', label: '有一点幽默' },
  { id: 'pro', label: '专业但不生硬' },
  { id: 'friend', label: '像朋友推荐' },
  { id: 'bossshare', label: '老板真实分享' },
  { id: 'guideshare', label: '店员真实推荐' },
  { id: 'question', label: '先抛一个问题' },
  { id: 'curious', label: '先制造好奇心' },
  { id: 'pain', label: '先讲一个顾客常见痛点' },
  { id: 'auto', label: 'AI 帮我选' }
];

const TONE_MAP = index(TONES);
const VALID_TONE = Object.keys(TONE_MAP);
const VALID_DURATION = Object.keys(BASE.DURATION_WORDS);

/* ============ 兼容 V0.1 的旧导出（取服装包，供旧脚本/回归用） ============ */

const FASHION = REG.get('fashion');
const TOPICS = FASHION.topics;
const SECOND = FASHION.second;
const GOALS = FASHION.goals;
const SPEAKERS = FASHION.speakers;
const DURATIONS = BASE.DURATIONS;
const DEFAULT_DURATION = BASE.DEFAULT_DURATION;
const DURATION_WORDS = BASE.DURATION_WORDS;
const SHORT_WORDS = BASE.SHORT_WORDS;

/* ============================ 工具 ============================ */

function index(list) {
  const m = {};
  for (const o of list) m[o.id] = o.label;
  return m;
}

function findLabel(list, id, fallback) {
  const m = index(list);
  return m[id] || (list[0] && list[0].label) || fallback || '';
}

/* ==================== id → 中文（给 Prompt 用） ==================== */

function topicLabel(id, industry) {
  const p = REG.get(industry);
  return findLabel(p.topics, id, p.topics[0].label);
}

/** 第二步标签：跟着 topic 走，所以要两个 id */
function subjectLabel(topicId, subjectId, industry) {
  const p = REG.get(industry);
  const g = p.second[topicId];
  if (!g) return '';
  const found = g.options.find((o) => o.id === subjectId);
  return found ? found.label : '';
}

function subjectQuestion(topicId, industry) {
  const p = REG.get(industry);
  const g = p.second[topicId];
  return g ? g.question : '今天主要拍什么？';
}

function goalLabel(id, industry) {
  return id === 'auto' ? 'AI 帮我选' : findLabel(REG.get(industry).goals, id);
}
function speakerLabel(id, industry) {
  return id === 'auto' ? 'AI 帮我选' : findLabel(REG.get(industry).speakers, id);
}
function toneLabel(id) {
  return id === 'auto' ? 'AI 帮我选' : (TONE_MAP[id] || TONES[0].label);
}
function subTypeLabel(subTypeId, industry) {
  const p = REG.get(industry);
  const f = p.subTypes.find((s) => s.id === subTypeId);
  return f ? f.label : '';
}

/* ==================== 给前端的完整结构 ==================== */

/** 前端渲染用：六步定义（第七步是可选的自由输入，前端固定渲染） */
function clientSteps(industry) {
  const p = REG.get(industry);
  return BASE.STEP_META.map((m) => {
    const step = { key: m.key, n: m.n, kind: 'single', question: m.question, hint: m.hint };
    switch (m.key) {
      case 'topic':
        step.options = p.topics.map((o) => ({ id: o.id, label: o.label, emoji: o.emoji || '' }));
        break;
      case 'subject':
        step.dynamic = true;
        step.optionsByTopic = p.second;
        break;
      case 'goal':
        step.options = p.goals;
        break;
      case 'speaker':
        step.options = p.speakers;
        break;
      case 'tone':
        step.options = TONES;
        break;
      case 'duration':
        step.default = BASE.DEFAULT_DURATION;
        step.options = BASE.DURATIONS;
        break;
      default:
        break;
    }
    return step;
  });
}

/* ==================== 规范化 + 白名单 ==================== */

/**
 * 把前端提交的选择规范化。
 * 任何非法值都不报错，静默回落到安全默认值 —— 用户不该看到技术报错。
 *
 * @param {object} raw       前端提交的 selection
 * @param {string} industry  可选，来自 URL query（options 接口用）
 */
function normalizeSelection(raw, industry) {
  const r = raw && typeof raw === 'object' ? raw : {};

  const ind = REG.has(r.industry) ? r.industry
    : (REG.has(industry) ? industry : REG.DEFAULT_ID);
  const p = REG.get(ind);

  const subType = REG.hasSubType(p, r.subType) ? String(r.subType || '') : '';

  // 店名：完全可选，只留一行纯文本，最长 20 字
  const storeName = String(r.storeName || '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, 20);

  const topicIds = Object.keys(index(p.topics));
  const topic = topicIds.includes(r.topic) ? r.topic : 'auto';

  const group = p.second[topic];
  let subject = 'auto';
  if (group && group.options.some((o) => o.id === r.subject)) subject = r.subject;

  const goalIds = Object.keys(index(p.goals));
  const speakerIds = Object.keys(index(p.speakers));

  return {
    industry: ind,
    subType,
    storeName,
    topic,
    subject,
    goal: goalIds.includes(r.goal) ? r.goal : 'auto',
    speaker: speakerIds.includes(r.speaker) ? r.speaker : 'auto',
    tone: VALID_TONE.includes(r.tone) ? r.tone : 'auto',
    duration: VALID_DURATION.includes(String(r.duration)) ? String(r.duration) : BASE.DEFAULT_DURATION,
    extra: String(r.extra || '').trim().slice(0, 600)
  };
}

module.exports = {
  // 兼容 V0.1 的旧导出
  TOPICS, SECOND, GOALS, SPEAKERS, TONES, DURATIONS, DEFAULT_DURATION,
  DURATION_WORDS, SHORT_WORDS,
  // V0.2 新增
  listIndustries: REG.list,
  getPack: REG.get,
  hasIndustry: REG.has,
  DEFAULT_INDUSTRY: REG.DEFAULT_ID,
  clientSteps, normalizeSelection,
  // label 函数（全部支持 industry）
  topicLabel, subjectLabel, subjectQuestion, goalLabel, speakerLabel, toneLabel, subTypeLabel
};

  };

  global.SWD_LIB = __require('core', '');
  global.SWD_LIB.__modules = Object.keys(__defs);
})(typeof window !== 'undefined' ? window : this);
