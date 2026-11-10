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
