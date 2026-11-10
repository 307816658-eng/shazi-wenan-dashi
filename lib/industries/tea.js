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
