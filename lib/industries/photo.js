'use strict';

/**
 * 摄影行业包（婚纱照 / 写真 / 儿童摄影 / 证件照）。
 *
 * 这行两条红线：拿别人样片冒充自己的作品、承诺「拍出来显瘦/像明星」。
 * 内容只能讲怎么沟通、怎么选、拍之前要准备什么。
 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'photo',
  label: '婚纱摄影',
  emoji: '📷',
  subTypes: [
    { id: 'wedding', label: '婚纱照' }, { id: 'portrait', label: '写真' },
    { id: 'kids', label: '儿童摄影' }, { id: 'idphoto', label: '证件照' }
  ],
  words: {
    store: '我们店', staff: '摄影师', goods: '片子', customer: '来拍的人',
    tryVerb: '拍', place: '店里'
  },
  roleIntro: '你服务过很多摄影工作室，清楚这行最怕两件事：客人拍完觉得不像自己、选片时被套加钱。内容就讲怎么避免这两件事。',

  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '新主题 / 新场景', emoji: '🆕' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '到店福利', emoji: '🎁' },
    { id: 'outfit', label: '拍之前怎么准备', emoji: '🧭' },
    { id: 'single', label: '主推套系', emoji: '⭐' },
    { id: 'season', label: '季节 / 档期', emoji: '🍂' },
    { id: 'festival', label: '节日档期', emoji: '🎊' },
    { id: 'daily', label: '工作室日常', emoji: '🏬' },
    { id: 'staff', label: '摄影师 / 主理人出镜', emoji: '🎤' },
    { id: 'auto', label: 'AI 帮我选', emoji: '✨' }
  ],

  second: {
    opening: {
      question: '开业这段时间，主要拍什么？',
      options: [
        { id: 'openday', label: '开业当天' }, { id: 'prepare', label: '开业前的准备' },
        { id: 'environment', label: '棚里什么样' }, { id: 'openact', label: '开业活动' },
        { id: 'firstcustomer', label: '第一批客人' }, { id: 'teamstate', label: '团队' }, AI_PICK
      ]
    },
    newarrival: {
      question: '这次上的是什么？',
      options: [
        { id: 'newtheme', label: '新主题' }, { id: 'newscene', label: '新场景 / 新棚' },
        { id: 'newoutfit', label: '新服装' }, { id: 'newmakeup', label: '新妆造风格' },
        { id: 'newservice', label: '新的服务方式' }, AI_PICK
      ]
    },
    activity: {
      question: '是什么活动？',
      options: [
        { id: 'openact', label: '开业活动' }, { id: 'festivalact', label: '节日活动' },
        { id: 'seasonact', label: '档期活动' }, { id: 'welfareact', label: '到店福利' },
        { id: 'memberact', label: '老客回馈' }, { id: 'annivact', label: '店庆' }, AI_PICK
      ]
    },
    welfare: {
      question: '这次是什么福利？',
      options: [
        { id: 'freesuggest', label: '免费帮你看看适合什么风格' }, { id: 'freetry', label: '免费试妆' },
        { id: 'freeconsult', label: '免费聊一次拍摄方案' }, { id: 'oldcustomer', label: '老客回馈' },
        { id: 'surprise', label: '进店小惊喜' }, AI_PICK
      ]
    },
    outfit: {
      question: '想教大家准备什么？',
      options: [
        { id: 'howtosay', label: '怎么跟摄影师说自己想要的' }, { id: 'howtoprepare', label: '拍之前要准备什么' },
        { id: 'howtocheck', label: '怎么看成片是不是自己' }, { id: 'avoidpit', label: '怎么避开加钱的坑' },
        { id: 'poses', label: '不会摆姿势怎么办' }, AI_PICK
      ]
    },
    single: {
      question: '主推哪一类？',
      options: [
        { id: 'weddingset', label: '婚纱套系' }, { id: 'portraitset', label: '个人写真' },
        { id: 'kidsset', label: '儿童写真' }, { id: 'idphotoset', label: '证件照 / 形象照' },
        { id: 'coupleset', label: '情侣照' }, { id: 'bestseller', label: '店里拍得最多的' }, AI_PICK
      ]
    },
    season: {
      question: '这一季拍什么？',
      options: [
        { id: 'spring', label: '春天外景' }, { id: 'summer', label: '夏天的光' },
        { id: 'autumn', label: '秋天落叶' }, { id: 'winter', label: '冬天 & 室内' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节点？',
      options: [
        { id: 'weddingseason', label: '婚礼旺季前' }, { id: 'valentine', label: '情人节 / 七夕' },
        { id: 'childday', label: '儿童节' }, { id: 'graduation', label: '毕业季' },
        { id: 'newyear', label: '年末全家福' }, AI_PICK
      ]
    },
    daily: {
      question: '拍工作室的哪一面？',
      options: [
        { id: 'busy', label: '拍摄当天' }, { id: 'quiet', label: '没人的时候' },
        { id: 'behind', label: '布光、修片' }, { id: 'detail', label: '别人不注意的细节' },
        { id: 'team', label: '团队在一起' }, AI_PICK
      ]
    },
    staff: {
      question: '谁来说？',
      options: [
        { id: 'bossstory', label: '主理人讲讲自己的看法' }, { id: 'whythis', label: '为什么做这一行' },
        { id: 'standard', label: '我们的拍摄标准' }, { id: 'attitude', label: '我们怎么对待客人' }, AI_PICK
      ]
    },
    auto: {
      question: '你大概想拍哪个方向？',
      options: [
        { id: 'wantnew', label: '想拍新主题' }, { id: 'wantact', label: '想拍活动' },
        { id: 'wantsell', label: '想推一个套系' }, { id: 'wantdaily', label: '想拍拍工作室日常' },
        { id: 'wantknow', label: '想让大家认识我们' }, { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  goals: [
    { id: 'comestore', label: '来店里看看' }, { id: 'tryon', label: '来试妆 / 试拍' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '看看新主题' },
    { id: 'learntips', label: '学一个准备方法' }, { id: 'solveproblem', label: '解决一个拍照的顾虑' },
    { id: 'knowstore', label: '认识我们' }, { id: 'remember', label: '记住这家工作室' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「来试妆、来聊一次」。
· 拍之前最大的顾虑是「拍出来不像自己」，开头先把这层顾虑说破。
· 中间讲清楚来了会做什么（聊风格、试妆、看服装），没有压力。
· 结尾轻一点：「先来聊聊，不合适也不算白来」。`,
    learntips: `目标是让人真的学到一点准备方法。
· 完全站在客人一侧：教怎么选风格、怎么沟通、怎么避免加钱。
· 开头直接给方法，不要先介绍套系。
· 中间给 1~2 条立刻能用的做法（存三张自己喜欢的照片、提早一周剪头发）。
· 绝不承诺拍摄效果。`,
    solveproblem: `目标是解决一个具体顾虑，让人觉得「说的就是我」。
· 开头直接说顾虑（不会摆姿势、怕拍得不像自己、怕选片被推销）。
· 中间给一个实际办法，讲清楚为什么。
· 语气像拍过很多次的朋友。`
  },

  speakers: [
    { id: 'boss', label: '主理人' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '摄影师' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍棚里和成片配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是摄影师。天天在棚里，说的是自己拍多了之后的判断。
· 口吻像「我一般会先问你平时拍照爱笑还是不爱笑」。
· 可以讲怎么引导、怎么找角度，但不许承诺效果。`,
    noface: `这条视频不露脸，只拍棚里、灯光、相机、成片，配口播。
· 镜头语言：布光、快门、翻看成片、服装间、化妆台。
· 少依赖表情，多用「你看这个光」「这样站一下」这种能配画面的说法。`
  },

  toneOverrides: {
    question: `开头抛一个问题切入，比如「你有没有拍完一组照片，回家越看越不像自己？」。
· 问题要真实，不夸张。
· 后面顺着这个问题往下答。`,
    friend: '整体像朋友之间的建议：「我跟你说」「我拍之前都这么准备」。'
  },

  subjectHint: {
    howtosay: '这一条教怎么表达想要的风格，不推套系。',
    howtoprepare: '这一条讲拍摄前的准备，具体到能做的事。',
    avoidpit: '这一条讲怎么避免加钱，讲清楚哪些要提前问。',
    poses: '这一条讲不会摆姿势怎么办，给具体做法。'
  },

  sceneIdeas: [
    '具体的**拍摄顾虑**（不会摆姿势、怕不像自己、怕妆太浓）',
    '具体的**准备场景**（提前挑衣服、剪头发、带什么来）',
    '具体的**沟通方法**（给摄影师看什么、怎么说自己喜欢的风格）',
    '具体的**拍摄当天**（棚里的光、化妆台、翻看成片的时刻）',
    '**工作室的样子**（服装间、相机、布光）'
  ],
  forbiddenFacts: [
    '样片是谁拍的、用了什么客片（不许拿别人作品当自己的）',
    '拍摄张数、精修数量、服装套数、场景数',
    '价格、套系内容、加片价格、折扣',
    '摄影师从业年限、获奖、合作过谁',
    '客人案例、别人拍完怎么样（不许虚构客片和评价）'
  ],
  hardBannedPhrases: ['明星同款', '拍出明星感', '显瘦十斤', '不满意退款',
    '全网最低', '样片级', '一对一专属', '包出片', '绝对好看'],
  compliance: [
    '绝对不许用别人的样片冒充自己的作品。',
    '不许承诺拍摄效果（显瘦、像明星、一定好看）。',
    '不许用「最 / 第一 / 唯一 / 顶级」这类绝对化说法，也不许贬低同行。',
    '不许编价格、套系内容、张数、精修数量。'
  ],
  aiTasteWords: ['定格美好', '光影艺术', '专属定制', '记录最美时刻',
    '唯美', '浪漫大片', '电影感', '妆造美学'],
  tasteReplacements: [
    '「定格美好 / 记录最美时刻」→ 删掉，说「拍完你自己翻一遍，觉得像自己就对了」',
    '「光影艺术 / 电影感」→ 说「这个光打在脸上是什么效果，来棚里看一眼」',
    '「专属定制 / 唯美」→ 说「先聊你平时什么样，再定风格」',
    '「妆造美学」→ 直接删掉，换成具体的妆造细节'
  ],
  badExample: '光影艺术，专属定制，定格最美时刻，拍出电影感大片。',
  goodExample: '不会摆姿势没关系，拍摄时我会一直跟你说话，你回答的时候那个表情就是最自然的。',
  titleBad: '「明星同款妆造，拍出来显瘦十斤！」',
  titleGood: '「拍完不像自己？问题多半出在这一步」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「我们棚里新搭了一个场景，可以来看看。」
✅ 可以说：「新搭了一个场景，你要是最近想拍一组，可以来棚里看看是不是你喜欢的调子。」
❌ 不许变成：「全新唯美场景，专业团队一对一，拍出明星感。」因为：效果承诺没依据。
❌ 不许变成：「原价 6999，现在 3999，还送精修 30 张。」因为：价格和张数是编的。
❌ 不许变成：「上千对新人都在这里拍。」因为：数字是编的。
**而你们这次连「新搭了一个场景」之外的信息都没有。**
那就讲适合什么人拍、怎么沟通风格，绝不能自己补一个价格或效果。`,

  contentRaw: [
    '存三张你喜欢的照片给摄影师看，比说「我想要自然一点」有用',
    '提前一周剪头发，别拍摄前一天剪',
    '拍摄当天穿好打理的衣服，换装省时间',
    '不会摆姿势就说不会，摄影师会带着你做动作',
    '选片前先想清楚自己要几张，别在现场被推着加'
  ],
  customerPains: [
    '拍完觉得不像自己，妆太浓、姿势太假',
    '选片的时候一直劝加钱，很尴尬',
    '成片和当初看的样片差太远',
    '不会摆姿势，全程都很僵',
    '拍完等片等很久，修出来还是不满意'
  ]
};

module.exports = pack;
