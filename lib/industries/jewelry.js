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
