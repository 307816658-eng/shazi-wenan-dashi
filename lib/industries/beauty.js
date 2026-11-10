'use strict';

/**
 * 美业行业包（美容 / 美发 / 美甲美睫）。
 *
 * 这个行业最大的坑是「疗效」：美白、祛斑、抗衰、祛痘、瘦脸，
 * 一句写进视频就是行政处罚级的风险，写稿时一律绕开，只讲过程、判断、感受。
 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'beauty',
  label: '美业',
  emoji: '💅',
  subTypes: [
    { id: 'hair', label: '美发' }, { id: 'skin', label: '美容护肤' },
    { id: 'nail', label: '美甲美睫' }, { id: 'mix', label: '综合美业' }
  ],
  words: {
    store: '我们店', staff: '美容师', goods: '项目', customer: '来做的人',
    tryVerb: '做', place: '店里'
  },
  roleIntro: '你服务过大量美发美容门店，清楚这个行业最不能碰的是「效果承诺」——能做的是把过程讲清楚，让人敢进门、敢开口问。',

  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '上新项目 / 新手法', emoji: '🆕' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '到店体验福利', emoji: '🎁' },
    { id: 'outfit', label: '怎么选项目不踩坑', emoji: '🧭' },
    { id: 'single', label: '主推项目', emoji: '⭐' },
    { id: 'season', label: '换季护理', emoji: '🍂' },
    { id: 'festival', label: '节前打理', emoji: '🎊' },
    { id: 'daily', label: '门店日常', emoji: '🏬' },
    { id: 'staff', label: '店主 / 技师出镜', emoji: '🎤' },
    { id: 'auto', label: 'AI 帮我选', emoji: '✨' }
  ],

  second: {
    opening: {
      question: '开业这段时间，主要拍什么？',
      options: [
        { id: 'openday', label: '开业当天' }, { id: 'prepare', label: '开店前的准备' },
        { id: 'environment', label: '店里什么样' }, { id: 'openact', label: '开业活动' },
        { id: 'firstcustomer', label: '第一批客人' }, { id: 'teamstate', label: '技师团队' }, AI_PICK
      ]
    },
    newarrival: {
      question: '这次上的是什么？',
      options: [
        { id: 'newservice', label: '一个新项目' }, { id: 'newskill', label: '一个新手法' },
        { id: 'newdevice', label: '新到一台仪器' }, { id: 'newproduct', label: '新换的产品' },
        { id: 'newcolor', label: '新的颜色 / 款式' }, AI_PICK
      ]
    },
    activity: {
      question: '是什么活动？',
      options: [
        { id: 'openact', label: '开业活动' }, { id: 'festivalact', label: '节日活动' },
        { id: 'seasonact', label: '换季活动' }, { id: 'welfareact', label: '体验福利' },
        { id: 'memberact', label: '会员活动' }, { id: 'annivact', label: '店庆活动' }, AI_PICK
      ]
    },
    welfare: {
      question: '这次是什么福利？',
      options: [
        { id: 'firsttry', label: '第一次来可以先试' }, { id: 'oldcustomer', label: '老顾客回馈' },
        { id: 'freesuggest', label: '免费帮你看看适合什么' }, { id: 'freecheck', label: '免费做个基础检测' },
        { id: 'surprise', label: '进店小惊喜' }, AI_PICK
      ]
    },
    outfit: {
      question: '想教大家怎么选？',
      options: [
        { id: 'hairfit', label: '怎么判断适不适合自己' }, { id: 'servicechoose', label: '项目怎么选不浪费' },
        { id: 'howtosay', label: '怎么跟技师说清楚想要什么' }, { id: 'avoidpit', label: '怎么避开常见的坑' },
        { id: 'frequency', label: '多久做一次比较合适' }, AI_PICK
      ]
    },
    single: {
      question: '主推哪个方向？',
      options: [
        { id: 'cut', label: '剪发' }, { id: 'color', label: '染发 / 烫发' },
        { id: 'care', label: '头皮 / 发质护理' }, { id: 'facial', label: '面部护理' },
        { id: 'nailart', label: '美甲美睫' }, { id: 'bestseller', label: '店里做得最多的' }, AI_PICK
      ]
    },
    season: {
      question: '这次是什么变化？',
      options: [
        { id: 'dryhair', label: '换季头发干、毛躁' }, { id: 'skindry', label: '换季皮肤不稳定' },
        { id: 'hairfall', label: '换季掉发多' }, { id: 'colorfade', label: '染的颜色褪了' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节点？',
      options: [
        { id: 'spring', label: '春节前' }, { id: 'valentine', label: '情人节 / 七夕' },
        { id: 'wedding', label: '婚礼 / 拍婚纱前' }, { id: 'interview', label: '面试 / 见客户前' },
        { id: 'party', label: '聚会 / 年会' }, AI_PICK
      ]
    },
    daily: {
      question: '拍店里的哪一面？',
      options: [
        { id: 'busy', label: '忙的时候' }, { id: 'quiet', label: '闲的时候' },
        { id: 'behind', label: '准备工作' }, { id: 'detail', label: '别人不注意的细节' },
        { id: 'team', label: '店里的人' }, AI_PICK
      ]
    },
    staff: {
      question: '谁来说？',
      options: [
        { id: 'bossstory', label: '店主讲讲自己的看法' }, { id: 'whythis', label: '为什么做这一行' },
        { id: 'standard', label: '我们做事的标准' }, { id: 'attitude', label: '我们怎么对待客人' }, AI_PICK
      ]
    },
    auto: {
      question: '你大概想拍哪个方向？',
      options: [
        { id: 'wantnew', label: '想拍新项目' }, { id: 'wantact', label: '想拍活动' },
        { id: 'wantsell', label: '想推一个主打项目' }, { id: 'wantdaily', label: '想拍拍店里日常' },
        { id: 'wantknow', label: '想让大家认识我们店' }, { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  goals: [
    { id: 'comestore', label: '来店里看看' }, { id: 'tryon', label: '来试一次' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '了解新项目' },
    { id: 'learntips', label: '学一个判断方法' }, { id: 'solveproblem', label: '解决一个困扰' },
    { id: 'knowstore', label: '认识这家店' }, { id: 'remember', label: '记住这家店' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「走进来试一次」。
· 美业最大的门槛是「不敢进门、怕被推销」，开头先把这层心理说破。
· 中间讲清楚第一次来会经历什么、大概多久、要不要提前说需求。
· 结尾轻一点：「先来聊两句也行」，不要逼下单。`,
    learntips: `目标是让人真的学到一点「怎么判断适不适合自己」。
· 完全站在顾客一侧：教她怎么问、怎么看、什么情况可以先不做。
· 开头直接给判断标准，不要先介绍项目。
· 中间给 1~2 条立刻能用的话术或方法（怎么描述想要的长度、怎么看发质）。
· 结尾自然带到「拿不准可以来店里让我们看看」，不硬推。`,
    solveproblem: `目标是解决一个具体困扰，让人觉得「说的就是我」。
· 开头直接说困扰（说不清想要什么、做完和想象不一样、烫完更难打理）。
· 中间给一个实际能用的办法，讲清楚为什么。
· 绝不承诺效果，只讲过程和方法。`
  },

  speakers: [
    { id: 'boss', label: '店主' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '技师 / 美容师' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍手法和店里配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是技师。技师天天上手，说的是自己看多了之后的真实判断。
· 口吻像「我一般会先看你这个情况，再决定做不做」。
· 可以讲手法、讲过程，但绝不承诺效果。`,
    noface: `这条视频不露脸，只拍手法、工具、店里，配口播。
· 镜头语言：手部动作、工具特写、洗头床、色板、镜子前的过程。
· 少依赖表情，多用「你看这个手法」「镜头拉近看一下」这种能配画面的说法。
· 可以边做边讲，节奏慢一点也没关系。`
  },

  toneOverrides: {
    question: `开头抛一个问题切入，比如「你有没有过，坐下了却说不太清自己想要什么？」。
· 问题要真实、具体，不要客服腔。
· 后面顺着这个问题往下答。`,
    friend: '整体像朋友之间的建议：「我跟你说」「我自己剪头发一般这么跟师傅说」。'
  },

  subjectHint: {
    cut: '这一条围绕剪发讲，重点是怎么沟通、怎么看适不适合。',
    color: '这一条围绕染烫讲，重点是怎么选色、怎么减少折腾。',
    care: '这一条围绕护理讲，重点是什么情况需要做、多久做一次。',
    howtosay: '这一条教怎么跟技师描述需求，不推项目。',
    frequency: '这一条讲频率，不给具体周期数字。'
  },

  sceneIdeas: [
    '具体的**进店心理**（怕被推销、不好意思拒绝、不知道要花多久）',
    '具体的**沟通困扰**（说不清长度、描述不出来、拿图给师傅也做不一样）',
    '具体的**判断方法**（看发质、看脸型、看平时愿不愿意打理）',
    '具体的**做完之后的真实状态**（好不好打理、多久要补、上班能不能扎起来）',
    '**店里的过程**（洗头、上色、吹干、镜子前看效果）'
  ],
  forbiddenFacts: [
    '疗效：美白、祛斑、祛痘、抗衰、抗皱、瘦脸、生发、防脱、修复敏感',
    '产品品牌、仪器型号、进口来源、成分浓度、认证资质',
    '价格、办卡金额、充值优惠、套餐包含几次、赠送什么',
    '顾客案例、前后对比、别人做完怎么样（不许虚构任何顾客效果）',
    '技师从业年限、获奖经历、培训背景'
  ],
  hardBannedPhrases: ['焕肤', '逆龄', '素颜杀手', '年轻十岁', '一洗就顺', '发质变好',
    '皮肤像剥了壳的鸡蛋', '做完像换了个人', '零伤害', '不伤发', '无痛'],
  compliance: [
    '绝对不许承诺任何效果（变白、变美、变年轻、头发变好、皮肤变好）。',
    '不许涉及医疗行为（祛斑、祛痘治疗、皮肤病理），也不许用「医美」类表述。',
    '不许用「最 / 第一 / 唯一 / 顶级」这类绝对化说法，也不许贬低同行。',
    '不许编造价格、卡项、赠送内容、次数。'
  ],
  aiTasteWords: ['焕活', '奢宠', '尊享', '定制美学', '轻奢护理', '由内而外',
    '唤醒肌肤', '焕然一新', '高级感', '氛围感', '仪式感'],
  tasteReplacements: [
    '「焕活 / 唤醒肌肤」→ 直接删掉，说「做完你自己摸摸看什么感觉」',
    '「奢宠 / 尊享」→ 说「来了就是躺着歇一会儿」',
    '「定制美学」→ 说「先看你平时怎么打理，再定做什么」',
    '「由内而外 / 焕然一新」→ 说「做完照镜子你自己判断」'
  ],
  badExample: '焕活肌肤，奢宠体验，专属定制美学，让你由内而外焕然一新。',
  goodExample: '你要是平时不太会打理，我一般建议先别做太复杂的，剪一个自己能吹得出来的，比什么都强。',
  titleBad: '「做完年轻十岁，素颜也能出门！」',
  titleGood: '「说不清想要什么发型？先跟师傅说这三句」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「我们店最近上了一个新的护理项目，你可以来试试。」
✅ 可以说：「最近上了一个新项目，你要是最近头发干得厉害，可以来试试，做完什么感觉你自己判断。」
❌ 不许变成：「深层修复，一次见效，做完头发顺滑如丝。」因为：效果承诺是红线。
❌ 不许变成：「进口原料，沙龙级护理，原价 398 现价 99。」因为：原料、价格全是编的。
❌ 不许变成：「顾客做完都说像换了个人。」因为：顾客评价是编的。
**而你们这次连「上了个新项目」之外的信息都没有。**
那就讲过程、讲适合什么情况、讲怎么判断要不要做，绝不能自己补一个效果或价格。`,

  contentRaw: [
    '先看你平时愿不愿意打理：不愿意打理的，别选需要每天造型的',
    '再看发质和现状：干、油、受损，处理方式不一样',
    '描述需求用具体的话：不要「短一点」，要说「到锁骨上面一点」',
    '拿不准就先小范围试：先剪一点、先做一个区域，不合适还能改',
    '做完当场问清楚：几天内能洗、多久要补、平时怎么打理'
  ],
  customerPains: [
    '坐下了却说不清自己想要什么',
    '拿着图去，做出来完全不一样',
    '烫完更难打理，每天早上要多花二十分钟',
    '怕一进门就被推销办卡',
    '做完不好意思说不好，只能自己忍着'
  ]
};

module.exports = pack;
