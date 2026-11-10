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
