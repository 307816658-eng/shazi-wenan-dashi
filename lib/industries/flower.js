'use strict';

/**
 * 花艺行业包（鲜花花束 / 花礼定制 / 绿植盆栽 / 花艺课）。
 *
 * 花店的核心不是「花多好看」，是「送对人、别两天就蔫」。
 * 产地、进口、花期天数都别碰，讲怎么挑、怎么养、什么场合送什么。
 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'flower',
  label: '花艺',
  emoji: '💐',
  subTypes: [
    { id: 'bouquet', label: '鲜花花束' }, { id: 'gift', label: '花礼定制' },
    { id: 'plant', label: '绿植盆栽' }, { id: 'class', label: '花艺课' }
  ],
  words: {
    store: '我们店', staff: '花艺师', goods: '花', customer: '来买花的人',
    tryVerb: '看', place: '店里'
  },
  roleIntro: '你服务过很多花店，知道买花的人最怕两件事：送错了、拿回去两天就蔫。内容就讲这两件事怎么避免，不碰产地和进口。',

  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '新到的花', emoji: '🆕' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '到店福利', emoji: '🎁' },
    { id: 'outfit', label: '怎么选花不踩坑', emoji: '🧭' },
    { id: 'single', label: '主推花礼', emoji: '⭐' },
    { id: 'season', label: '当季花材', emoji: '🌿' },
    { id: 'festival', label: '节日送花', emoji: '🎊' },
    { id: 'daily', label: '门店日常', emoji: '🏬' },
    { id: 'staff', label: '店主 / 花艺师出镜', emoji: '🎤' },
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
      question: '这次到的是什么花？',
      options: [
        { id: 'freshflowers', label: '鲜花' }, { id: 'potted', label: '绿植盆栽' },
        { id: 'dried', label: '干花' }, { id: 'giftbox', label: '花礼盒' },
        { id: 'seasonal', label: '当季才有的' }, { id: 'wholebatch', label: '整批新货' }, AI_PICK
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
        { id: 'visitorgift', label: '到店送一支' }, { id: 'oldcustomer', label: '老顾客回馈' },
        { id: 'freesuggest', label: '免费帮你配' }, { id: 'freewrap', label: '免费换包装' },
        { id: 'surprise', label: '进店小惊喜' }, AI_PICK
      ]
    },
    outfit: {
      question: '想教大家怎么挑？',
      options: [
        { id: 'howtochoose', label: '怎么挑新鲜的花' }, { id: 'howtokeep', label: '拿回去怎么养' },
        { id: 'sendwho', label: '送什么人配什么花' }, { id: 'budget', label: '预算怎么定' },
        { id: 'avoidpit', label: '怎么避开常见的坑' }, AI_PICK
      ]
    },
    single: {
      question: '主推哪一类？',
      options: [
        { id: 'bouquetgift', label: '一束花' }, { id: 'giftbox', label: '花礼盒' },
        { id: 'potted', label: '一盆绿植' }, { id: 'dried', label: '干花摆件' },
        { id: 'bestseller', label: '店里卖得最好的' }, AI_PICK
      ]
    },
    season: {
      question: '这一季主推什么？',
      options: [
        { id: 'spring', label: '春天的花' }, { id: 'summer', label: '夏天的花' },
        { id: 'autumn', label: '秋天的花' }, { id: 'winter', label: '冬天的花' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节日？',
      options: [
        { id: 'valentine', label: '情人节 / 七夕' }, { id: 'motherday', label: '母亲节' },
        { id: 'teacherday', label: '教师节' }, { id: 'graduation', label: '毕业季' },
        { id: 'anniversary', label: '纪念日 / 生日' }, { id: 'qixi', label: '婚礼 / 求婚' }, AI_PICK
      ]
    },
    daily: {
      question: '拍店里的哪一面？',
      options: [
        { id: 'busy', label: '节日忙的时候' }, { id: 'quiet', label: '平时' },
        { id: 'behind', label: '修花、备货' }, { id: 'detail', label: '别人不注意的细节' },
        { id: 'team', label: '店里的人' }, AI_PICK
      ]
    },
    staff: {
      question: '谁来说？',
      options: [
        { id: 'bossstory', label: '店主讲讲自己的看法' }, { id: 'whythis', label: '为什么开花店' },
        { id: 'standard', label: '我们挑花的标准' }, { id: 'attitude', label: '我们怎么配花' }, AI_PICK
      ]
    },
    auto: {
      question: '你大概想拍哪个方向？',
      options: [
        { id: 'wantnew', label: '想拍新到的花' }, { id: 'wantact', label: '想拍活动' },
        { id: 'wantsell', label: '想推一束主打的花' }, { id: 'wantdaily', label: '想拍拍店里日常' },
        { id: 'wantknow', label: '想让大家认识我们店' }, { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  goals: [
    { id: 'comestore', label: '来店里看看' }, { id: 'tryon', label: '来挑一束' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '看看新到的花' },
    { id: 'learntips', label: '学一个挑花方法' }, { id: 'solveproblem', label: '解决一个送花难题' },
    { id: 'knowstore', label: '认识这家店' }, { id: 'remember', label: '记住这家店' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「来店里挑一束」。
· 买花的人最怕选错，开头先把这层顾虑说出来。
· 中间讲清楚来了怎么挑、能不能只说场合和预算让花艺师配。
· 结尾轻一点：「不知道送什么，来说两句就行」。`,
    learntips: `目标是让人真的学到一点挑花、养花的方法。
· 完全站在买花人一侧：教怎么判断新鲜、拿回去怎么养。
· 开头直接给方法，不要先介绍花。
· 中间给 1~2 条立刻能用的标准（看花苞、摸花杆、剪根换水）。
· 绝不承诺花期能撑多少天。`,
    solveproblem: `目标是解决一个具体困扰，让人觉得「说的就是我」。
· 开头直接说困扰（送花不知道送什么、买回去两天就蔫、图片和实物不一样）。
· 中间给一个实际办法，讲清楚为什么。
· 不夸张、不承诺。`
  },

  speakers: [
    { id: 'boss', label: '店主' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '花艺师' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍花和包花过程配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是花艺师。天天修花包花，说的是自己上手之后的判断。
· 口吻像「这束我一看花苞就知道还能放几天」。
· 可以讲手法、讲搭配，但不许编产地和花期。`,
    noface: `这条视频不露脸，只拍花、包花、店里，配口播。
· 镜头语言：花苞特写、剪根、包纸、系带、摆放。
· 少依赖表情，多用「你看这个花苞」「这样剪一刀」这种能配画面的说法。`
  },

  toneOverrides: {
    question: `开头抛一个问题切入，比如「你有没有买过一束花，第三天就开始掉瓣？」。
· 问题要真实，不夸张。
· 后面顺着这个问题往下答。`,
    friend: '整体像朋友之间的建议：「我跟你说」「我自己买花都这么挑」。'
  },

  subjectHint: {
    howtochoose: '这一条教怎么判断花新不新鲜，不推具体花材。',
    howtokeep: '这一条讲拿回去怎么养，不给具体天数。',
    sendwho: '这一条讲什么场合送什么方向，不评价别人。',
    budget: '这一条讲预算怎么定，不报价格。'
  },

  sceneIdeas: [
    '具体的**送花场景**（第一次约会、道歉、看病人、给妈妈、开业道贺）',
    '具体的**买花困扰**（不知道送什么、怕太俗、预算不知道定多少）',
    '具体的**判断方法**（看花苞紧不紧、摸花杆硬不硬、看叶子）',
    '具体的**养花的真实状态**（换水、剪根、放哪儿不容易蔫）',
    '**店里的样子**（修花台、水桶、包花的纸和带子）'
  ],
  forbiddenFacts: [
    '进口、产地、厄瓜多尔 / 荷兰这类来源说明',
    '花期能放多少天、保鲜几天、永不凋谢',
    '价格、花束规格（几枝）、包装费用、配送费',
    '花的品种学名、等级、检测',
    '顾客案例、别人订过什么（不许虚构订单）'
  ],
  hardBannedPhrases: ['进口玫瑰', '永不凋谢', '花期一个月', '香得满屋',
    '空运直达', '顶级花材', '限量款', '网红同款'],
  compliance: [
    '不许编造产地、进口、品种等级。',
    '不许承诺花期天数（「能放半个月」这类一律不许）。',
    '不许用「最 / 第一 / 唯一 / 顶级」这类绝对化说法，也不许贬低同行。',
    '不许编价格、规格、配送时效。'
  ],
  aiTasteWords: ['浪漫满屋', '用心甄选', '花语传情', '仪式感',
    '美好生活', '治愈系', '高级花艺', '美学空间'],
  tasteReplacements: [
    '「甄选 / 高级花艺」→ 删掉，说「这几样我今天早上刚修的」',
    '「浪漫满屋 / 仪式感」→ 说「她收到的时候是什么反应，你自己去想」',
    '「花语传情」→ 说「什么场合送什么，我帮你配」',
    '「治愈系 / 美好生活」→ 直接删掉，换成具体的花或场景'
  ],
  badExample: '用心甄选进口花材，浪漫满屋，让每一束花都传递你的心意。',
  goodExample: '挑花先看花苞，还包得紧的能放；已经全开的，今天好看，明天就开始掉。',
  titleBad: '「进口玫瑰，永不凋谢，全城最低价！」',
  titleGood: '「买花别只看开得大，先摸一下这里」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「我们店这周到了新的花，可以来看看。」
✅ 可以说：「这周到了新花，你要是最近有场合要送，可以来挑，我帮你配。」
❌ 不许变成：「厄瓜多尔进口玫瑰，花期长达半个月。」因为：产地和花期是编的。
❌ 不许变成：「原价 399，本周只要 199。」因为：价格是编的。
❌ 不许变成：「上千对情侣都选我们。」因为：数字是编的。
**而你们这次连「到了新花」之外的信息都没有。**
那就讲怎么挑、什么场合送什么，绝不能自己补一个产地、花期或价格。`,

  contentRaw: [
    '看花苞：包得紧的还能放，全开的只管当天好看',
    '摸花杆：硬挺的是新的，软塌的已经放几天了',
    '拿回去先剪根：斜剪一刀，换水勤一点',
    '别放太阳直晒和空调风口，蔫得快',
    '不知道送什么就说场合和预算，让花艺师配，比自己在网上挑靠谱'
  ],
  customerPains: [
    '买回去第三天就开始掉瓣',
    '网上图片和实物差太远',
    '不知道送什么人该送什么花',
    '节日一到价格翻倍，还挑不到好的',
    '想自己配又不懂，怕配出来很土'
  ]
};

module.exports = pack;
