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
