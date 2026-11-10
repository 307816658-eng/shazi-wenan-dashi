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
