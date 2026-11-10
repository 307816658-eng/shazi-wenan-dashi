'use strict';

/**
 * 眼镜行业包（眼镜零售 / 验光配镜 / 太阳镜 / 隐形眼镜）。
 *
 * 这行有一条绝对红线：治疗近视。任何「降度数、摘眼镜、度数不涨」的说法都不能出现。
 * 能讲的是：怎么选镜框、怎么验光、戴着头晕怎么办、孩子多久查一次。
 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'optical',
  label: '眼镜',
  emoji: '👓',
  subTypes: [
    { id: 'frame', label: '眼镜零售' }, { id: 'exam', label: '验光配镜' },
    { id: 'sunglass', label: '太阳镜' }, { id: 'contact', label: '隐形眼镜' }
  ],
  words: {
    store: '我们店', staff: '验光师', goods: '眼镜', customer: '来配镜的人',
    tryVerb: '试戴', place: '店里'
  },
  roleIntro: '你服务过大量眼镜门店，清楚这行有一条不能碰的线：治疗近视。内容只讲怎么选、怎么验、戴不舒服怎么办，不碰任何疗效。',

  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '新到镜架 / 镜片', emoji: '🆕' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '到店福利', emoji: '🎁' },
    { id: 'outfit', label: '怎么选不踩坑', emoji: '🧭' },
    { id: 'single', label: '主推款', emoji: '⭐' },
    { id: 'season', label: '换季 / 用眼高峰', emoji: '☀️' },
    { id: 'festival', label: '开学季', emoji: '🎊' },
    { id: 'daily', label: '门店日常', emoji: '🏬' },
    { id: 'staff', label: '店主 / 验光师出镜', emoji: '🎤' },
    { id: 'auto', label: 'AI 帮我选', emoji: '✨' }
  ],

  second: {
    opening: {
      question: '开业这段时间，主要拍什么？',
      options: [
        { id: 'openday', label: '开业当天' }, { id: 'prepare', label: '开业前的准备' },
        { id: 'environment', label: '店里什么样' }, { id: 'openact', label: '开业活动' },
        { id: 'firstcustomer', label: '第一批客人' }, { id: 'teamstate', label: '店员状态' }, AI_PICK
      ]
    },
    newarrival: {
      question: '这次到的是什么？',
      options: [
        { id: 'newframe', label: '新镜架' }, { id: 'newlens', label: '新镜片' },
        { id: 'newsun', label: '新太阳镜' }, { id: 'newcontact', label: '新隐形' },
        { id: 'kidnew', label: '儿童款' }, AI_PICK
      ]
    },
    activity: {
      question: '是什么活动？',
      options: [
        { id: 'openact', label: '开业活动' }, { id: 'schoolact', label: '开学活动' },
        { id: 'seasonact', label: '换季活动' }, { id: 'welfareact', label: '到店福利' },
        { id: 'memberact', label: '会员活动' }, { id: 'annivact', label: '店庆活动' }, AI_PICK
      ]
    },
    welfare: {
      question: '这次是什么福利？',
      options: [
        { id: 'freecheck', label: '免费验光' }, { id: 'freeadjust', label: '免费调校、清洗' },
        { id: 'oldcustomer', label: '老顾客回馈' }, { id: 'freesuggest', label: '免费帮你看看镜架合不合适' },
        { id: 'surprise', label: '进店小惊喜' }, AI_PICK
      ]
    },
    outfit: {
      question: '想教大家怎么选？',
      options: [
        { id: 'framefit', label: '镜架怎么挑' }, { id: 'lenschoose', label: '镜片怎么选' },
        { id: 'childmyopia', label: '孩子多久查一次' }, { id: 'dizzy', label: '戴着头晕怎么办' },
        { id: 'avoidpit', label: '怎么避开常见的坑' }, AI_PICK
      ]
    },
    single: {
      question: '主推哪一类？',
      options: [
        { id: 'frameitem', label: '镜架' }, { id: 'lensitem', label: '镜片' },
        { id: 'sunit', label: '太阳镜' }, { id: 'contactitem', label: '隐形眼镜' },
        { id: 'kiditem', label: '儿童镜' }, { id: 'bestseller', label: '店里配得最多的' }, AI_PICK
      ]
    },
    season: {
      question: '这次是什么变化？',
      options: [
        { id: 'summer', label: '夏天（防晒、强光）' }, { id: 'winter', label: '冬天（起雾）' },
        { id: 'school', label: '开学用眼多' }, { id: 'dryeye', label: '换季眼睛干' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节点？',
      options: [
        { id: 'schoolstart', label: '开学季' }, { id: 'childday', label: '儿童节' },
        { id: 'summerstart', label: '入夏' }, { id: 'newyear', label: '年末' }, AI_PICK
      ]
    },
    daily: {
      question: '拍店里的哪一面？',
      options: [
        { id: 'busy', label: '忙的时候' }, { id: 'quiet', label: '闲的时候' },
        { id: 'behind', label: '验光、加工' }, { id: 'detail', label: '别人不注意的细节' },
        { id: 'team', label: '店里的人' }, AI_PICK
      ]
    },
    staff: {
      question: '谁来说？',
      options: [
        { id: 'bossstory', label: '店主讲讲自己的看法' }, { id: 'whythis', label: '为什么做这一行' },
        { id: 'standard', label: '我们验光的流程' }, { id: 'attitude', label: '我们怎么帮客人挑' }, AI_PICK
      ]
    },
    auto: {
      question: '你大概想拍哪个方向？',
      options: [
        { id: 'wantnew', label: '想拍新到的镜架' }, { id: 'wantact', label: '想拍活动' },
        { id: 'wantsell', label: '想推一款主打的' }, { id: 'wantdaily', label: '想拍拍店里日常' },
        { id: 'wantknow', label: '想让大家认识我们店' }, { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  goals: [
    { id: 'comestore', label: '来店里看看' }, { id: 'tryon', label: '来试戴' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '看看新到的镜架' },
    { id: 'learntips', label: '学一个挑选方法' }, { id: 'solveproblem', label: '解决一个戴镜困扰' },
    { id: 'knowstore', label: '认识这家店' }, { id: 'remember', label: '记住这家店' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「来试戴、来验一次光」。
· 眼镜不上脸看不出合不合适，开头先把这个道理说清楚。
· 中间讲清楚来了会做什么（验光、试戴、调校）。
· 结尾轻一点：「戴上走两圈，比看图片准」。`,
    learntips: `目标是让人真的学到一点挑选、护眼的方法。
· 完全站在顾客一侧：教怎么选镜架、怎么看镜片、戴着头晕怎么处理。
· 开头直接给方法，不要先介绍款式。
· 中间给 1~2 条立刻能用的标准（镜架宽度、瞳距、镜腿松紧）。
· 绝不承诺度数变化，也不提治疗。`,
    solveproblem: `目标是解决一个具体困扰，让人觉得「说的就是我」。
· 开头直接说困扰（戴着头晕、镜架老下滑、孩子度数涨得快）。
· 中间给一个实际办法，讲清楚为什么。
· 遇到度数变化，只能说「建议去正规机构查一下」，不给方案。`
  },

  speakers: [
    { id: 'boss', label: '店主' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '验光师' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍镜架和验光过程配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是验光师。天天验光调校，说的是自己上手之后的判断。
· 口吻像「我一看你原来的镜腿就知道为什么老下滑」。
· 可以讲验光流程、讲调校，但绝不许承诺度数变化。`,
    noface: `这条视频不露脸，只拍镜架、验光设备、调校过程，配口播。
· 镜头语言：镜架特写、试戴侧面、验光仪、螺丝刀调校。
· 少依赖表情，多用「你看这个镜腿」「这样调一下」这种能配画面的说法。`
  },

  toneOverrides: {
    question: `开头抛一个问题切入，比如「你有没有配完新眼镜，戴两天就头晕？」。
· 问题要真实，不吓人。
· 后面顺着这个问题往下答。`,
    friend: '整体像朋友之间的建议：「我跟你说」「我自己配镜都这么挑」。'
  },

  subjectHint: {
    framefit: '这一条讲镜架怎么挑，重点在宽度和脸型，不讲品牌。',
    lenschoose: '这一条讲镜片怎么选，按用途讲，不报折射率参数。',
    childmyopia: '这一条讲孩子查眼睛的频率，只说建议检查，绝不承诺控制度数。',
    dizzy: '这一条讲新镜戴着不舒服怎么处理，强调回店调校。'
  },

  sceneIdeas: [
    '具体的**戴镜困扰**（老下滑、压鼻梁、镜腿夹耳朵、看久了累）',
    '具体的**配镜场景**（第一次配、换新、孩子查视力、开车要偏光）',
    '具体的**判断方法**（镜架宽度、瞳距、试戴走两步）',
    '具体的**验光过程**（看视力表、试镜片、调校）',
    '**店里的样子**（镜架墙、验光室、加工台）'
  ],
  forbiddenFacts: [
    '治疗近视、降度数、控制度数、摘掉眼镜、恢复视力',
    '折射率、阿贝数、镀膜层数、品牌型号',
    '价格、折扣、镜片加价、套餐',
    '验光数据、度数、散光值（不许给具体数字建议）',
    '顾客案例、孩子配了之后怎么样（不许虚构效果）'
  ],
  hardBannedPhrases: ['治疗近视', '摘掉眼镜', '度数不涨', '控制度数',
    '防蓝光护眼治病', '恢复视力', '矫正视力', '医学验光', '一分钱一分货'],
  compliance: [
    '绝对不许宣称治疗近视或控制度数——这是红线。',
    '不许给验光数据建议（该配多少度、要不要加散光），只能说去正规机构检查。',
    '不许用「最 / 第一 / 唯一 / 顶级」这类绝对化说法，也不许贬低同行。',
    '不许编价格、套餐、镜片参数。'
  ],
  aiTasteWords: ['清晰视界', '护眼黑科技', '轻盈舒适', '匠心工艺',
    '时尚百搭', '专业验配', '呵护双眼', '品质之选'],
  tasteReplacements: [
    '「清晰视界 / 呵护双眼」→ 删掉，说「戴上走两步，看远处清不清楚你自己知道」',
    '「护眼黑科技」→ 说「这个镜片是干什么用的，我给你讲清楚」',
    '「时尚百搭」→ 说「你这张脸配这个宽度更稳」',
    '「专业验配 / 品质之选」→ 直接删掉，换成验光流程里的具体一步'
  ],
  badExample: '专业验配，护眼黑科技，守护清晰视界，让您告别眼镜烦恼。',
  goodExample: '镜架老往下滑，多半不是鼻子的问题，是镜腿太松，回店调一下就好，两分钟的事。',
  titleBad: '「科学护眼，度数不涨，帮孩子摘掉眼镜！」',
  titleGood: '「眼镜老下滑？两分钟就能调好」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「我们店到了新一批镜架，可以来看看。」
✅ 可以说：「到了批新镜架，宽度和框型都不太一样，你来试戴一下才知道哪种稳。」
❌ 不许变成：「防蓝光镜片，保护视力，度数不涨。」因为：功效承诺是红线。
❌ 不许变成：「原价 899，现价 299，还送一副。」因为：价格是编的。
❌ 不许变成：「上万人都配过，好评第一。」因为：数字和评价是编的。
**而你们这次连「到了批新镜架」之外的信息都没有。**
那就讲怎么挑宽度、怎么试戴、戴着不舒服怎么调，绝不能碰任何疗效。`,

  contentRaw: [
    '镜架先看宽度：和脸最宽处齐平，太窄夹头、太宽老下滑',
    '试戴别只照镜子：戴上低头、抬头、走两步，看滑不滑',
    '新镜戴着晕，先回店调镜腿和鼻托，别硬扛',
    '孩子查视力按固定节奏去，别等看不清黑板才去',
    '开车用的太阳镜要偏光，颜色别太深'
  ],
  customerPains: [
    '眼镜老往下滑，一天要推几十次',
    '新配的戴着晕，走路都不稳',
    '镜腿夹耳朵，戴久了疼',
    '不知道孩子的度数有没有变',
    '网上配的镜架好看，戴上不合适'
  ]
};

module.exports = pack;
