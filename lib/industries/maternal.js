'use strict';

/**
 * 母婴行业包（母婴用品 / 童装童鞋 / 奶粉辅食 / 玩具绘本）。
 *
 * 这行的敏感点是「安全」和「功效」：食品级、零添加、增强免疫力、更聪明，
 * 全部属于不能自己说的范畴。能讲的是：怎么挑、怎么试、什么情况不用买贵的。
 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'maternal',
  label: '母婴',
  emoji: '🍼',
  subTypes: [
    { id: 'supply', label: '母婴用品' }, { id: 'kidwear', label: '童装童鞋' },
    { id: 'formula', label: '奶粉辅食' }, { id: 'toy', label: '玩具绘本' }
  ],
  words: {
    store: '我们店', staff: '店员', goods: '东西', customer: '来买的宝妈',
    tryVerb: '试', place: '店里'
  },
  roleIntro: '你服务过大量母婴门店，清楚这行说话必须稳：不吓人、不承诺功效、不评价别人家孩子，只讲怎么挑、怎么用、什么时候不用买。',

  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '新到货', emoji: '🆕' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '到店福利', emoji: '🎁' },
    { id: 'outfit', label: '怎么挑不踩坑', emoji: '🧭' },
    { id: 'single', label: '主推单品', emoji: '⭐' },
    { id: 'season', label: '换季用品', emoji: '🍂' },
    { id: 'festival', label: '节日送礼', emoji: '🎊' },
    { id: 'daily', label: '门店日常', emoji: '🏬' },
    { id: 'staff', label: '店主 / 店员出镜', emoji: '🎤' },
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
        { id: 'clothes', label: '新一季童装' }, { id: 'shoes', label: '童鞋' },
        { id: 'supplies', label: '日用品（奶瓶、湿巾这类）' }, { id: 'formulanew', label: '奶粉 / 辅食' },
        { id: 'toynew', label: '玩具 / 绘本' }, { id: 'wholebatch', label: '整批新货' }, AI_PICK
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
        { id: 'visitorgift', label: '到店有礼' }, { id: 'oldcustomer', label: '老顾客回馈' },
        { id: 'freesuggest', label: '免费帮你看看缺什么' }, { id: 'freesize', label: '免费量尺码' },
        { id: 'surprise', label: '进店小惊喜' }, AI_PICK
      ]
    },
    outfit: {
      question: '想教大家怎么挑？',
      options: [
        { id: 'kidclothes', label: '童装怎么挑' }, { id: 'kidshoes', label: '童鞋怎么挑' },
        { id: 'bottle', label: '奶瓶怎么挑' }, { id: 'toychoose', label: '玩具怎么挑' },
        { id: 'size', label: '尺码怎么定' }, { id: 'avoidpit', label: '怎么避开常见的坑' }, AI_PICK
      ]
    },
    single: {
      question: '主推哪一类？',
      options: [
        { id: 'kidclothes', label: '童装' }, { id: 'kidshoes', label: '童鞋' },
        { id: 'bottle', label: '奶瓶餐具' }, { id: 'toynew', label: '玩具绘本' },
        { id: 'bestseller', label: '店里卖得最多的' }, AI_PICK
      ]
    },
    season: {
      question: '这次换季主要拍什么？',
      options: [
        { id: 'springsummer', label: '春夏换季' }, { id: 'autumnwinter', label: '秋冬换季' },
        { id: 'sensitive', label: '换季皮肤敏感' }, { id: 'sizeup', label: '孩子长个换尺码' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节点？',
      options: [
        { id: 'childday', label: '儿童节' }, { id: 'spring', label: '春节' },
        { id: 'birthday', label: '生日' }, { id: 'fullmoon', label: '满月 / 百天' },
        { id: 'schoolstart', label: '开学' }, AI_PICK
      ]
    },
    daily: {
      question: '拍店里的哪一面？',
      options: [
        { id: 'busy', label: '忙的时候' }, { id: 'quiet', label: '闲的时候' },
        { id: 'behind', label: '理货、备货' }, { id: 'detail', label: '别人不注意的细节' },
        { id: 'team', label: '店里的人' }, AI_PICK
      ]
    },
    staff: {
      question: '谁来说？',
      options: [
        { id: 'bossstory', label: '店主讲讲自己的看法' }, { id: 'whythis', label: '为什么开这家店' },
        { id: 'standard', label: '我们挑货的标准' }, { id: 'attitude', label: '我们怎么对待宝妈' }, AI_PICK
      ]
    },
    auto: {
      question: '你大概想拍哪个方向？',
      options: [
        { id: 'wantnew', label: '想拍新到的货' }, { id: 'wantact', label: '想拍活动' },
        { id: 'wantsell', label: '想推一个主打的' }, { id: 'wantdaily', label: '想拍拍店里日常' },
        { id: 'wantknow', label: '想让大家认识我们店' }, { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  goals: [
    { id: 'comestore', label: '来店里看看' }, { id: 'tryon', label: '来看看、试试' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '了解新到的货' },
    { id: 'learntips', label: '学一个挑选方法' }, { id: 'solveproblem', label: '解决一个买东西的难题' },
    { id: 'knowstore', label: '认识这家店' }, { id: 'remember', label: '记住这家店' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「来店里看一眼、试一试」。
· 宝妈最怕买了用不上，开头先替她说出这层顾虑。
· 中间讲清楚来了能怎么看、怎么试、尺码怎么定。
· 结尾轻一点：「孩子的东西，最好还是上手摸一下」。`,
    learntips: `目标是让人真的学到一点挑选方法。
· 完全站在宝妈一侧：教怎么避坑、什么情况不用买贵的。
· 开头直接给方法，不要先介绍商品。
· 中间给 1~2 条能立刻用的判断标准（鞋要能按下鞋头、衣服看是否影响活动）。
· 绝不评价别人家孩子，也不承诺任何功效。`,
    solveproblem: `目标是解决一个具体困扰，让人觉得「说的就是我」。
· 开头直接说困扰（尺码拿不准、买回去孩子不穿、不知道先买哪个）。
· 中间给一个实际办法，讲清楚为什么。
· 不吓人、不制造焦虑。`
  },

  speakers: [
    { id: 'boss', label: '店主' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '店员' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍货和店里配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是店员。店员天天接待宝妈，说的是自己见多了之后的真实经验。
· 口吻像「我一般会先问你孩子多高多重」。
· 具体、实在，不夸大，不评价孩子。`,
    noface: `这条视频不露脸，只拍货品、店里，配口播。
· 镜头语言：衣服细节、鞋底软硬、奶瓶口径、货架、手上的对比。
· 少依赖表情，多用「你看这个鞋头」「这样折一下」这种能配画面的说法。`
  },

  toneOverrides: {
    question: `开头抛一个问题切入，比如「你有没有买回去一堆，孩子一件都不穿的经历？」。
· 问题要真实，不要制造焦虑。
· 后面顺着这个问题往下答。`,
    friend: '整体像宝妈之间的交流：「我跟你说」「我家孩子那时候我就这么挑的」。'
  },

  subjectHint: {
    kidclothes: '这一条讲童装，重点是怎么看活动是否方便、尺码怎么定。',
    kidshoes: '这一条讲童鞋，重点是鞋头、鞋底、怎么试。',
    size: '这一条讲尺码，不给具体年龄对照表，讲怎么量。',
    bottle: '这一条讲奶瓶餐具，重点是口径、清洗、手感。'
  },

  sceneIdeas: [
    '具体的**带娃出门**（商场里孩子乱跑、试衣服不配合、鞋穿一半就脱）',
    '具体的**选购困扰**（尺码拿不准、材质不放心、买回去不用）',
    '具体的**判断方法**（怎么量、怎么试、什么情况买大一码）',
    '具体的**用起来的真实感受**（好不好穿脱、洗了变形不变形）',
    '**店里的样子**（货怎么摆、店员在帮宝妈量尺码）'
  ],
  forbiddenFacts: [
    '成分、配方、有机、零添加、食品级、医用级、检测认证',
    '功效：增强免疫力、更聪明、助长高、防过敏、改善睡眠',
    '适用月龄的功效说明、医生推荐、专家背书',
    '价格、折扣、赠品、活动细则',
    '销量、排名、多少宝妈买过、门店开了多少年'
  ],
  hardBannedPhrases: ['增强免疫力', '更聪明', '绝对安全', '医用级', '零添加',
    '宝宝吃了更好', '专家推荐', '医院同款', '不过敏', '无害'],
  compliance: [
    '绝对不许承诺任何功效（营养、免疫、发育、防过敏、助眠）。',
    '不许给医疗或喂养建议（该吃什么、该补什么、生病怎么办）。',
    '不许用「最 / 第一 / 唯一 / 顶级」这类绝对化说法，也不许评价别人家孩子。',
    '不许编造价格、折扣、赠品、认证。'
  ],
  aiTasteWords: ['甄选', '呵护', '安心之选', '母婴优选', '科学育儿',
    '温柔陪伴', '成长每一步', '给宝宝最好的'],
  tasteReplacements: [
    '「甄选 / 安心之选」→ 删掉，说「这几样我都自己上手摸过」',
    '「呵护 / 温柔陪伴」→ 说「孩子用着方不方便，你上手一摸就知道」',
    '「科学育儿」→ 说「每个孩子情况不一样，先看你家孩子的习惯」',
    '「给宝宝最好的」→ 直接删掉，换成具体的一句话'
  ],
  badExample: '甄选母婴好物，科学育儿，给宝宝最安心的呵护，陪伴成长每一步。',
  goodExample: '买童鞋先按一下鞋头，能按下去一点、弯得动的，孩子跑起来才不容易绊。',
  titleBad: '「增强免疫力，宝宝吃了更聪明！」',
  titleGood: '「童鞋别只看好看，先按一下这里」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「我们店里到了新一季的童装，你可以带孩子来看看。」
✅ 可以说：「新一季童装到了，孩子长得快的话，可以带他来试试尺码。」
❌ 不许变成：「A 类面料，零甲醛，宝宝穿了不过敏。」因为：材质和功效全是编的。
❌ 不许变成：「买两件送一件，仅限本周。」因为：用户没说过任何优惠。
❌ 不许变成：「宝妈们都说好，回购率第一。」因为：评价和数字是编的。
**而你们这次连「到了新一季童装」之外的信息都没有。**
那就讲怎么挑、怎么试、怎么定尺码，绝不能自己补一个材质、功效或价格。`,

  contentRaw: [
    '先量再买：身高体重报给店员，比按年龄猜靠谱',
    '童鞋要按鞋头：能按下去、能弯，跑起来不容易绊',
    '衣服看活动：抬手、蹲下不勒，比好看重要',
    '奶瓶看口径和清洗：广口的刷起来省事',
    '拿不准就少买：孩子长得快，先买当季够穿的'
  ],
  customerPains: [
    '尺码拿不准，买回去穿两次就小了',
    '买回去一堆，孩子一件都不穿',
    '不知道材质怎么样，摸起来心里没底',
    '玩具买回去玩两天就扔一边',
    '店里东西太多，不知道先买哪个'
  ]
};

module.exports = pack;
