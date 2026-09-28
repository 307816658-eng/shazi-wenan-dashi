'use strict';

/**
 * 选项树 —— 整个产品的骨架
 *
 * 设计原则（对应需求文档三、四、五、六、七、八、九、十节）：
 *  1. 用户能选就不要让他写。这里每一条都是可点的卡片，不是一个输入框。
 *  2. 第二步（subject）不是固定列表，而是跟着第一步（topic）动态变。
 *  3. 第一步的「AI帮我选」不是模板，它只是把决定权交给模型 —— 后端会把它
 *     翻译成一句「你自己判断」，而不是套一段写死的文案。
 *
 * 前端只负责渲染这份数据，选项要增删改，改这里就行，不用动前端。
 */

/* ============================ 第一步 ============================ */

const TOPICS = [
  { id: 'opening', label: '新店开业', emoji: '\u{1F389}' },
  { id: 'newarrival', label: '新品到店', emoji: '\u{1F455}' },
  { id: 'activity', label: '门店活动', emoji: '\u{1F3F7}' },
  { id: 'welfare', label: '到店福利', emoji: '\u{1F381}' },
  { id: 'outfit', label: '穿搭分享', emoji: '\u{1F457}' },
  { id: 'single', label: '单品推荐', emoji: '\u{1F45C}' },
  { id: 'season', label: '换季上新', emoji: '\u{1F343}' },
  { id: 'festival', label: '节日 / 节庆', emoji: '\u{1F386}' },
  { id: 'daily', label: '门店日常', emoji: '\u{1F3EC}' },
  { id: 'staff', label: '老板 / 店长 / 导购出镜', emoji: '\u{1F3A4}' },
  { id: 'auto', label: 'AI 帮我选', emoji: '\u{2728}' }
];

/* ==================== 第二步：跟着第一步动态变 ==================== */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const SECOND = {
  opening: {
    question: '开业这段时间，主要拍什么？',
    options: [
      { id: 'openday', label: '开业当天现场' },
      { id: 'prepare', label: '开业前的准备' },
      { id: 'environment', label: '新店环境介绍' },
      { id: 'openact', label: '开业活动' },
      { id: 'firstcustomer', label: '第一批顾客' },
      { id: 'display', label: '货品陈列' },
      { id: 'teamstate', label: '店员状态' },
      AI_PICK
    ]
  },

  newarrival: {
    question: '今天主要拍什么？',
    options: [
      { id: 'dress', label: '连衣裙' },
      { id: 'coat', label: '外套' },
      { id: 'knit', label: '针织衫' },
      { id: 'top', label: '上衣' },
      { id: 'pants', label: '裤子' },
      { id: 'skirt', label: '半身裙' },
      { id: 'shoesbag', label: '鞋包配饰' },
      { id: 'several', label: '多款新品' },
      { id: 'wholestore', label: '整店新品' },
      AI_PICK
    ]
  },

  activity: {
    question: '是什么活动？',
    options: [
      { id: 'openact', label: '开业活动' },
      { id: 'festivalact', label: '节日活动' },
      { id: 'seasonact', label: '换季活动' },
      { id: 'welfareact', label: '到店福利' },
      { id: 'memberact', label: '会员活动' },
      { id: 'limitedact', label: '限时活动' },
      { id: 'annivact', label: '店庆活动' },
      AI_PICK
    ]
  },

  welfare: {
    question: '这次是什么福利？',
    options: [
      { id: 'visitorgift', label: '到店有礼' },
      { id: 'trygift', label: '试穿有礼' },
      { id: 'oldcustomer', label: '老顾客回馈' },
      { id: 'newexperience', label: '新品体验' },
      { id: 'freesuggest', label: '免费搭配建议' },
      { id: 'surprise', label: '进店小惊喜' },
      { id: 'memberonly', label: '会员专属' },
      AI_PICK
    ]
  },

  outfit: {
    question: '拍哪种穿搭？',
    options: [
      { id: 'commute', label: '日常通勤' },
      { id: 'date', label: '约会穿搭' },
      { id: 'casual', label: '休闲穿搭' },
      { id: 'elegant', label: '气质穿搭' },
      { id: 'slim', label: '显瘦穿搭' },
      { id: 'lightmature', label: '轻熟穿搭' },
      { id: 'young', label: '年轻感穿搭' },
      { id: 'seasonshift', label: '换季穿搭' },
      { id: 'oneitemmany', label: '一衣多穿' },
      AI_PICK
    ]
  },

  single: {
    question: '推荐什么单品？',
    options: [
      { id: 'dress', label: '连衣裙' },
      { id: 'coat', label: '外套' },
      { id: 'knit', label: '针织衫' },
      { id: 'top', label: '上衣' },
      { id: 'pants', label: '裤子' },
      { id: 'skirt', label: '半身裙' },
      { id: 'shoes', label: '鞋子' },
      { id: 'bag', label: '包包' },
      { id: 'accessory', label: '配饰' },
      AI_PICK
    ]
  },

  season: {
    question: '换季主要拍什么？',
    options: [
      { id: 'spring', label: '春装上新' },
      { id: 'summer', label: '夏装上新' },
      { id: 'autumn', label: '秋装上新' },
      { id: 'winter', label: '冬装上新' },
      { id: 'clearance', label: '换季清仓' },
      { id: 'seasonmix', label: '换季搭配' },
      { id: 'transition', label: '过渡款' },
      { id: 'wardrobe', label: '衣柜换季整理' },
      AI_PICK
    ]
  },

  festival: {
    question: '是哪个节日？',
    options: [
      { id: 'springfestival', label: '春节' },
      { id: 'valentine', label: '情人节' },
      { id: 'womenday', label: '三八节' },
      { id: 'motherday', label: '母亲节' },
      { id: 'love520', label: '520' },
      { id: 'children', label: '儿童节' },
      { id: 'qixi', label: '七夕' },
      { id: 'midautumn', label: '中秋节' },
      { id: 'national', label: '国庆' },
      { id: 'double11', label: '双十一' },
      { id: 'newyear', label: '元旦' },
      { id: 'christmas', label: '圣诞节' },
      AI_PICK
    ]
  },

  daily: {
    question: '店里是什么场景？',
    options: [
      { id: 'busy', label: '今天店里很忙' },
      { id: 'newgoods', label: '新货刚到' },
      { id: 'sorting', label: '店员整理货品' },
      { id: 'tryon', label: '顾客试衣场景' },
      { id: 'display', label: '店铺陈列' },
      { id: 'routine', label: '日常工作' },
      { id: 'recommend', label: '店员推荐' },
      { id: 'bossdaily', label: '老板日常' },
      AI_PICK
    ]
  },

  staff: {
    question: '想让镜头前的人，给大家留下什么印象？',
    options: [
      { id: 'bossself', label: '老板本人' },
      { id: 'managerself', label: '店长' },
      { id: 'seniorguide', label: '资深导购' },
      { id: 'newguide', label: '新来的店员' },
      { id: 'wholteam', label: '整个团队' },
      { id: 'bossheart', label: '老板讲心里话' },
      { id: 'managerpro', label: '店长讲专业' },
      { id: 'guidedaily', label: '导购讲日常' },
      AI_PICK
    ]
  },

  auto: {
    question: '大概想拍点什么？说不清楚也没关系。',
    options: [
      { id: 'wantnew', label: '想拍刚到的新款' },
      { id: 'wantact', label: '想拍店里搞的活动' },
      { id: 'wantoutfit', label: '想拍点穿搭内容' },
      { id: 'wantsingle', label: '想推荐一件单品' },
      { id: 'wantdaily', label: '想拍拍店里的日常' },
      { id: 'wantknow', label: '想让大家认识我们店' },
      { id: 'wantnothing', label: '完全没想法，全交给 AI' }
    ]
  }
};

/* ============================ 第三步 ============================ */

const GOALS = [
  { id: 'comestore', label: '来店里看看' },
  { id: 'tryon', label: '来试试衣服' },
  { id: 'joinact', label: '来参加活动' },
  { id: 'knownew', label: '了解新品' },
  { id: 'learntips', label: '学一个穿搭方法' },
  { id: 'solveproblem', label: '解决一个穿衣问题' },
  { id: 'knowstore', label: '认识这家店' },
  { id: 'remember', label: '记住这家店' },
  { id: 'exposure', label: '增加曝光' },
  { id: 'auto', label: 'AI 帮我选' }
];

/* ============================ 第四步 ============================ */

const SPEAKERS = [
  { id: 'boss', label: '老板' },
  { id: 'manager', label: '店长' },
  { id: 'guide', label: '导购' },
  { id: 'multi', label: '多人' },
  { id: 'noface', label: '不露脸，只拍衣服配口播' },
  { id: 'auto', label: 'AI 帮我选' }
];

/* ============================ 第五步 ============================ */

const TONES = [
  { id: 'chat', label: '自然聊天' },
  { id: 'warm', label: '亲切' },
  { id: 'downearth', label: '接地气' },
  { id: 'humor', label: '有一点幽默' },
  { id: 'pro', label: '专业但不生硬' },
  { id: 'friend', label: '像朋友推荐' },
  { id: 'bossshare', label: '老板真实分享' },
  { id: 'guideshare', label: '导购真实推荐' },
  { id: 'question', label: '先抛一个问题' },
  { id: 'curious', label: '先制造好奇心' },
  { id: 'pain', label: '先讲一个顾客常见痛点' },
  { id: 'auto', label: 'AI 帮我选' }
];

/* ============================ 第六步 ============================ */

const DURATIONS = [
  { id: '30', label: '30 秒', sub: '短平快' },
  { id: '45', label: '45 秒', sub: '刚刚好' },
  { id: '60', label: '60 秒', sub: '说透一点' }
];
const DEFAULT_DURATION = '45';

/* ======================= 给前端的完整结构 ======================= */

/** 前端渲染用：六步的完整定义（第七步是可选的自由输入，前端固定渲染） */
function clientSteps() {
  return [
    {
      key: 'topic', n: 1, kind: 'single',
      question: '今天拍什么？',
      hint: '先选一个，后面我会问你更细一点。',
      options: TOPICS.map((o) => ({ id: o.id, label: o.label, emoji: o.emoji || '' }))
    },
    {
      key: 'subject', n: 2, kind: 'single', dynamic: true,
      question: '今天主要拍什么？',
      hint: '这一步会跟着上一步变。',
      optionsByTopic: SECOND
    },
    {
      key: 'goal', n: 3, kind: 'single',
      question: '这条视频主要想让顾客干什么？',
      hint: '会影响开场、结构和结尾怎么收。',
      options: GOALS
    },
    {
      key: 'speaker', n: 4, kind: 'single',
      question: '谁来出镜？',
      hint: '同一条内容，老板说和导购说，完全不一样。',
      options: SPEAKERS
    },
    {
      key: 'tone', n: 5, kind: 'single',
      question: '想怎么说？',
      hint: '选你听着最舒服的那一种。',
      options: TONES
    },
    {
      key: 'duration', n: 6, kind: 'single',
      question: '视频多长？',
      hint: '拿不准就选 45 秒。',
      default: DEFAULT_DURATION,
      options: DURATIONS
    }
  ];
}

/* ==================== id → 中文（给 Prompt 用） ==================== */

/** 时长 → 目标字数（中文口播约 4.3 字/秒，留余量，宁少不凑） */
const DURATION_WORDS = { '30': '110 ~ 145', '45': '175 ~ 215', '60': '235 ~ 285' };
const SHORT_WORDS = { '30': '70 ~ 95', '45': '100 ~ 130', '60': '130 ~ 170' };

const TOPIC_MAP = index(TOPICS);
const GOAL_MAP = index(GOALS);
const SPEAKER_MAP = index(SPEAKERS);
const TONE_MAP = index(TONES);

function index(list) {
  const m = {};
  for (const o of list) m[o.id] = o.label;
  return m;
}

function topicLabel(id) {
  return TOPIC_MAP[id] || TOPICS[0].label;
}

/** 第二步标签：它跟着 topic 走，所以要两个 id */
function subjectLabel(topicId, subjectId) {
  const g = SECOND[topicId];
  if (!g) return '';
  const found = g.options.find((o) => o.id === subjectId);
  return found ? found.label : '';
}

/** 第二步的题干也跟着 topic 变 */
function subjectQuestion(topicId) {
  const g = SECOND[topicId];
  return g ? g.question : '今天主要拍什么？';
}

function goalLabel(id) {
  return id === 'auto' ? 'AI 帮我选' : (GOAL_MAP[id] || GOALS[0].label);
}
function speakerLabel(id) {
  return id === 'auto' ? 'AI 帮我选' : (SPEAKER_MAP[id] || SPEAKERS[0].label);
}
function toneLabel(id) {
  return id === 'auto' ? 'AI 帮我选' : (TONE_MAP[id] || TONES[0].label);
}

const VALID = {
  topic: Object.keys(TOPIC_MAP),
  goal: Object.keys(GOAL_MAP),
  speaker: Object.keys(SPEAKER_MAP),
  tone: Object.keys(TONE_MAP),
  duration: Object.keys(DURATION_WORDS)
};

/**
 * 把前端提交的选择规范化 + 白名单校验。
 * 任何非法值都不报错，而是静默回落到一个安全默认值 —— 用户不该看到技术报错。
 */
function normalizeSelection(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};

  const topic = VALID.topic.includes(r.topic) ? r.topic : 'auto';

  // 第二步必须属于当前 topic 的那一组，否则视为「AI 帮我选」
  const group = SECOND[topic];
  let subject = 'auto';
  if (group) {
    const ok = group.options.some((o) => o.id === r.subject);
    subject = ok ? r.subject : 'auto';
  }

  const goal = VALID.goal.includes(r.goal) ? r.goal : 'auto';
  const speaker = VALID.speaker.includes(r.speaker) ? r.speaker : 'auto';
  const tone = VALID.tone.includes(r.tone) ? r.tone : 'auto';
  const duration = VALID.duration.includes(String(r.duration)) ? String(r.duration) : DEFAULT_DURATION;

  return {
    topic,
    subject,
    goal,
    speaker,
    tone,
    duration,
    extra: String(r.extra || '').trim().slice(0, 600)
  };
}

module.exports = {
  TOPICS, SECOND, GOALS, SPEAKERS, TONES, DURATIONS, DEFAULT_DURATION,
  DURATION_WORDS, SHORT_WORDS,
  clientSteps, normalizeSelection,
  topicLabel, subjectLabel, subjectQuestion, goalLabel, speakerLabel, toneLabel
};
