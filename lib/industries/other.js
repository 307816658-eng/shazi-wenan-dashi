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
