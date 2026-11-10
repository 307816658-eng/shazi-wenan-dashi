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
