'use strict';

/**
 * 宠物行业包（宠物店 / 洗护 / 用品 / 寄养）。
 *
 * 这行最容易越界的是「治病」：皮肤病、驱虫、疫苗、生病怎么处理，
 * 都不是门店能承诺的事。写稿只讲洗护过程、用品挑选、寄养日常。
 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'pet',
  label: '宠物',
  emoji: '🐾',
  subTypes: [
    { id: 'shop', label: '宠物用品店' }, { id: 'grooming', label: '洗护美容' },
    { id: 'boarding', label: '寄养' }, { id: 'mix', label: '综合宠物店' }
  ],
  words: {
    store: '我们店', staff: '店员', goods: '东西', customer: '带毛孩子来的人',
    tryVerb: '试', place: '店里'
  },
  roleIntro: '你服务过大量宠物门店，知道这行说话的分寸：不诊断、不承诺治好，只讲洗护怎么做、东西怎么挑、寄养一天是怎么过的。',

  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '新到货', emoji: '🆕' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '到店福利', emoji: '🎁' },
    { id: 'outfit', label: '怎么挑不踩坑', emoji: '🧭' },
    { id: 'single', label: '主推服务 / 单品', emoji: '⭐' },
    { id: 'season', label: '换季照顾', emoji: '🍂' },
    { id: 'festival', label: '节日', emoji: '🎊' },
    { id: 'daily', label: '门店日常', emoji: '🏬' },
    { id: 'staff', label: '店主 / 美容师出镜', emoji: '🎤' },
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
      question: '这次到的是什么？',
      options: [
        { id: 'foodnew', label: '新到的粮' }, { id: 'snacknew', label: '新零食' },
        { id: 'toynew', label: '新玩具' }, { id: 'supplynew', label: '日用品（窝、牵引、猫砂）' },
        { id: 'clothesnew', label: '宠物衣服' }, { id: 'wholebatch', label: '整批新货' }, AI_PICK
      ]
    },
    activity: {
      question: '是什么活动？',
      options: [
        { id: 'openact', label: '开业活动' }, { id: 'festivalact', label: '节日活动' },
        { id: 'seasonact', label: '换季活动' }, { id: 'welfareact', label: '洗护福利' },
        { id: 'memberact', label: '会员活动' }, { id: 'annivact', label: '店庆活动' }, AI_PICK
      ]
    },
    welfare: {
      question: '这次是什么福利？',
      options: [
        { id: 'firstgroom', label: '第一次洗护可以先试' }, { id: 'oldcustomer', label: '老顾客回馈' },
        { id: 'freesuggest', label: '免费帮你看看毛量、指甲' }, { id: 'freenail', label: '免费剪指甲' },
        { id: 'surprise', label: '进店小惊喜' }, AI_PICK
      ]
    },
    outfit: {
      question: '想教大家怎么挑？',
      options: [
        { id: 'foodchoose', label: '粮怎么挑' }, { id: 'toychoose', label: '玩具怎么挑' },
        { id: 'harness', label: '牵引怎么挑' }, { id: 'catlitter', label: '猫砂怎么挑' },
        { id: 'groomchoose', label: '洗护项目怎么选' }, { id: 'avoidpit', label: '怎么避开常见的坑' }, AI_PICK
      ]
    },
    single: {
      question: '主推哪个？',
      options: [
        { id: 'bath', label: '洗澡' }, { id: 'haircut', label: '剪毛造型' },
        { id: 'deodor', label: '去味 / 深层清洁' }, { id: 'boarding', label: '寄养' },
        { id: 'foodnew', label: '主推的粮' }, { id: 'bestseller', label: '店里做得最多的' }, AI_PICK
      ]
    },
    season: {
      question: '这次换季主要拍什么？',
      options: [
        { id: 'hairfall', label: '换季掉毛' }, { id: 'hot', label: '天热降温' },
        { id: 'cold', label: '天冷保暖' }, { id: 'skin', label: '换季皮肤干、痒' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节点？',
      options: [
        { id: 'spring', label: '春节（寄养高峰）' }, { id: 'longholiday', label: '长假出游' },
        { id: 'birthday', label: '宠物生日' }, { id: 'newyear', label: '年末' }, AI_PICK
      ]
    },
    daily: {
      question: '拍店里的哪一面？',
      options: [
        { id: 'busy', label: '洗护忙的时候' }, { id: 'quiet', label: '人少的时候' },
        { id: 'behind', label: '洗护的准备' }, { id: 'detail', label: '别人不注意的细节' },
        { id: 'team', label: '店里的人和宠物' }, AI_PICK
      ]
    },
    staff: {
      question: '谁来说？',
      options: [
        { id: 'bossstory', label: '店主讲讲自己的看法' }, { id: 'whythis', label: '为什么开这家店' },
        { id: 'standard', label: '我们洗护的标准' }, { id: 'attitude', label: '我们怎么对待宠物' }, AI_PICK
      ]
    },
    auto: {
      question: '你大概想拍哪个方向？',
      options: [
        { id: 'wantnew', label: '想拍新到的货' }, { id: 'wantact', label: '想拍活动' },
        { id: 'wantsell', label: '想推洗护或寄养' }, { id: 'wantdaily', label: '想拍拍店里日常' },
        { id: 'wantknow', label: '想让大家认识我们店' }, { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  goals: [
    { id: 'comestore', label: '带它来店里' }, { id: 'tryon', label: '来洗一次试试' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '了解新到的东西' },
    { id: 'learntips', label: '学一个照顾方法' }, { id: 'solveproblem', label: '解决一个养宠困扰' },
    { id: 'knowstore', label: '认识这家店' }, { id: 'remember', label: '记住这家店' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「带宠物来洗一次」。
· 宠物主人最怕的是「洗的时候被粗暴对待、回来情绪不对」，开头先把这层顾虑说出来。
· 中间讲清楚洗护流程、大概多久、主人在不在场。
· 结尾轻一点：「第一次可以先来洗个基础款」。`,
    learntips: `目标是让人真的学到一点照顾方法。
· 完全站在养宠人一侧：教怎么挑、怎么判断、什么情况该去医院（可以说「这种情况要问医生」，但不下诊断）。
· 开头直接给方法，不要先介绍服务。
· 中间给 1~2 条能立刻用的判断标准（粮怎么看配料表顺序、猫砂看结团）。
· 绝不承诺治好任何问题。`,
    solveproblem: `目标是解决一个具体困扰，让人觉得「说的就是我」。
· 开头直接说困扰（洗完两天又臭、剪毛剪坏、寄养不放心、猫砂带得到处都是）。
· 中间给一个实际办法，讲清楚为什么。
· 不诊断、不承诺疗效。`
  },

  speakers: [
    { id: 'boss', label: '店主' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '美容师 / 店员' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍洗护过程和店里配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是美容师。天天跟猫狗打交道，说的是自己上手之后的真实经验。
· 口吻像「这只我一摸就知道毛打结在哪」。
· 可以讲手法、讲流程，但绝不许诊断病情。`,
    noface: `这条视频不露脸，只拍洗护过程、宠物、店里，配口播。
· 镜头语言：洗澡、吹毛、剪指甲、梳毛、宠物在笼位里的样子。
· 少依赖表情，多用「你看它这个反应」「这样梳一下」这种能配画面的说法。`
  },

  toneOverrides: {
    question: `开头抛一个问题切入，比如「你有没有洗完第二天，一进门还是一股味？」。
· 问题要真实，别夸张。
· 后面顺着这个问题往下答。`,
    friend: '整体像养宠人之间的交流：「我跟你说」「我家那只也这样」。'
  },

  subjectHint: {
    foodchoose: '这一条讲粮怎么挑，看配料表顺序和适口性，不评价品牌。',
    grooming: '这一条讲洗护项目怎么选，按毛量和需求分。',
    boarding: '这一条讲寄养，重点是每天怎么过、怎么反馈。'
  },

  sceneIdeas: [
    '具体的**养宠日常困扰**（掉毛、异味、指甲长、洗澡像打仗）',
    '具体的**带宠物出门**（进店怕生、别的狗叫、猫包一出门就叫）',
    '具体的**判断方法**（毛打结怎么摸、粮怎么挑、猫砂怎么试）',
    '具体的**洗护过程**（进水前的试探、吹毛时的反应、剪完的样子）',
    '**店里的样子**（笼位怎么安排、寄养的每天怎么遛）'
  ],
  forbiddenFacts: [
    '血统、证书、品种纯度、疫苗记录、驱虫记录',
    '治病、疗效、皮肤病怎么治、吃什么药、多久能好',
    '成分表细节、进口来源、检测报告',
    '价格、洗护套餐、寄养费用、折扣',
    '顾客案例、别人的宠物怎么样（不许虚构任何宠物案例）'
  ],
  hardBannedPhrases: ['纯种保证', '包健康', '包治', '一洗就好', '不掉毛',
    '不过敏', '绝对安全', '医院同款', '进口粮', '天然无添加'],
  compliance: [
    '绝对不许做任何诊断或治疗承诺（皮肤病、耳螨、驱虫、疫苗怎么打）。',
    '遇到健康问题只能建议「这个最好问一下医生」，不许给方案。',
    '不许用「最 / 第一 / 唯一 / 顶级」这类绝对化说法，也不许贬低同行。',
    '不许编造价格、套餐、寄养费用、血统与疫苗信息。'
  ],
  aiTasteWords: ['毛孩子的幸福', '科学养宠', '宠爱', '萌宠日常',
    '温柔以待', '陪伴', '治愈系', '精致养宠'],
  tasteReplacements: [
    '「科学养宠 / 精致养宠」→ 删掉，说「按它的情况来，别跟风买」',
    '「毛孩子的幸福 / 宠爱」→ 说「它舒不舒服，看它进店的反应就知道」',
    '「治愈系 / 陪伴」→ 直接删掉，换成具体场景',
    '「温柔以待」→ 说「洗的时候手轻一点，它就配合」'
  ],
  badExample: '科学养宠，精致呵护，让每一只毛孩子都被温柔以待。',
  goodExample: '猫洗完回来一直舔毛，多半是没吹透，你摸一下它后腿根，潮的就是没干。',
  titleBad: '「专业洗护，一洗就好，包治皮肤病！」',
  titleGood: '「洗完两天又臭？多半是这一步没做」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「我们店新到了几款猫砂，你可以来看看。」
✅ 可以说：「新到了几款猫砂，结团和带出情况不一样，你可以来看看哪种适合你家猫。」
❌ 不许变成：「天然无添加，零粉尘，猫用了不生病。」因为：成分和功效是编的。
❌ 不许变成：「原价 129，现价 69，买二送一。」因为：价格是编的。
❌ 不许变成：「上千只猫都在用，好评第一。」因为：数字和评价是编的。
**而你们这次连「到了几款猫砂」之外的信息都没有。**
那就讲怎么判断结团、怎么减少带出，绝不能自己补一个成分、功效或价格。`,

  contentRaw: [
    '猫砂先看结团：铲起来不散、不粘盆底，清理才省事',
    '看带出：颗粒大小和脚感，决定它会不会带得到处都是',
    '粮先看配料表前几位，再试小包装，别一次囤大袋',
    '洗护按毛量定：长毛和短毛的流程不一样',
    '第一次寄养先短住一天，看它适应不适应'
  ],
  customerPains: [
    '洗完第二天又有味道',
    '剪毛剪得不均匀，回来看着别扭',
    '寄养几天回来，瘦了也不爱动',
    '猫砂带得满屋都是',
    '粮换来换去，吃了就软便'
  ]
};

module.exports = pack;
