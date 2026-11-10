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
