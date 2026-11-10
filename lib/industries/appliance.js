'use strict';

/** 家电行业包。选项 id 与其它行业保持一致。 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'appliance',
  label: '家电',
  emoji: '🔌',
  subTypes: [
    { id: 'big', label: '大家电' }, { id: 'kitchen', label: '厨电' },
    { id: 'small', label: '生活小电' }, { id: 'digital', label: '数码' }
  ],
  words: {
    store: '我们店', staff: '店员', goods: '机器', customer: '来挑机器的人',
    tryVerb: '用', place: '家里'
  },
  roleIntro: '你服务过大量实体家电门店，清楚顾客最怕的不是不会买，是买回去发现用不上、放不下、操作太复杂。',

  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '新款到店', emoji: '🆕' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '到店福利', emoji: '🎁' },
    { id: 'outfit', label: '选购避坑', emoji: '🧭' },
    { id: 'single', label: '单品讲解', emoji: '🔌' },
    { id: 'season', label: '换季换新', emoji: '🍃' },
    { id: 'festival', label: '节日换新', emoji: '🎊' },
    { id: 'daily', label: '门店日常', emoji: '🏬' },
    { id: 'staff', label: '老板 / 店长出镜', emoji: '🎤' },
    { id: 'auto', label: 'AI 帮我选', emoji: '✨' }
  ],

  second: {
    opening: {
      question: '开业这段时间，主要拍什么？',
      options: [
        { id: 'openday', label: '开业当天现场' }, { id: 'prepare', label: '开业前的准备' },
        { id: 'environment', label: '新店环境介绍' }, { id: 'openact', label: '开业活动' },
        { id: 'firstcustomer', label: '第一批客人' }, { id: 'display', label: '展台陈列' },
        { id: 'teamstate', label: '店员状态' }, AI_PICK
      ]
    },
    newarrival: {
      question: '这次到的新款，主要拍什么？',
      options: [
        { id: 'fridge', label: '冰箱 / 冷柜' }, { id: 'washer', label: '洗衣机' },
        { id: 'aircon', label: '空调' }, { id: 'cook', label: '厨房电器' },
        { id: 'small', label: '生活小电' }, { id: 'digital', label: '数码产品' },
        { id: 'several', label: '好几款新品' }, { id: 'wholestore', label: '整店新陈列' }, AI_PICK
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
        { id: 'visitorgift', label: '到店有礼' }, { id: 'freesuggest', label: '免费选购建议' },
        { id: 'oldcustomer', label: '老顾客回馈' }, { id: 'newexperience', label: '新机现场体验' },
        { id: 'demo', label: '现场演示' }, { id: 'memberonly', label: '会员专属' }, AI_PICK
      ]
    },
    outfit: {
      question: '想讲哪种选购场景？',
      options: [
        { id: 'commute', label: '第一次置办' }, { id: 'date', label: '两口子一起挑' },
        { id: 'casual', label: '家里换新' }, { id: 'elegant', label: '给长辈挑' },
        { id: 'young', label: '小空间怎么选' }, { id: 'first', label: '预算怎么想' },
        { id: 'takeaway', label: '买回去怎么用' }, AI_PICK
      ]
    },
    single: {
      question: '讲解哪一类？',
      options: [
        { id: 'fridge', label: '冰箱' }, { id: 'washer', label: '洗衣机' },
        { id: 'aircon', label: '空调' }, { id: 'cook', label: '厨房电器' },
        { id: 'small', label: '生活小电' }, { id: 'digital', label: '数码产品' },
        { id: 'combo', label: '一套怎么搭' }, AI_PICK
      ]
    },
    season: {
      question: '这个季节主要拍什么？',
      options: [
        { id: 'spring', label: '开春除潮' }, { id: 'summer', label: '夏天制冷' },
        { id: 'autumn', label: '秋天换机' }, { id: 'winter', label: '冬天取暖' },
        { id: 'decorate', label: '装修季怎么配' }, { id: 'seasonmix', label: '换季保养' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节日？',
      options: [
        { id: 'springfestival', label: '春节' }, { id: 'valentine', label: '情人节' },
        { id: 'motherday', label: '母亲节' }, { id: 'love520', label: '520' },
        { id: 'midautumn', label: '中秋节' }, { id: 'national', label: '国庆' },
        { id: 'double11', label: '双十一' }, { id: 'newyear', label: '元旦' }, AI_PICK
      ]
    },
    daily: {
      question: '店里是什么场景？',
      options: [
        { id: 'busy', label: '今天店里挺忙' }, { id: 'newgoods', label: '新机刚到' },
        { id: 'sorting', label: '店员调试展机' }, { id: 'tryon', label: '客人现场试机' },
        { id: 'display', label: '展台细节' }, { id: 'routine', label: '开门前的检查' },
        { id: 'recommend', label: '店员推荐' }, { id: 'bossdaily', label: '老板日常' }, AI_PICK
      ]
    },
    staff: {
      question: '想让镜头前的人，给大家留下什么印象？',
      options: [
        { id: 'bossself', label: '老板本人' }, { id: 'managerself', label: '店长' },
        { id: 'seniorguide', label: '老店员' }, { id: 'tech', label: '懂技术的人' },
        { id: 'wholteam', label: '整个团队' }, { id: 'bossheart', label: '老板讲心里话' },
        { id: 'managerpro', label: '店长讲门道' }, { id: 'guidedaily', label: '店员讲日常' }, AI_PICK
      ]
    },
    auto: {
      question: '大概想拍点什么？说不清楚也没关系。',
      options: [
        { id: 'wantnew', label: '想拍刚到的新款' }, { id: 'wantact', label: '想拍店里的活动' },
        { id: 'wantoutfit', label: '想讲怎么挑不踩坑' }, { id: 'wantsingle', label: '想讲一台机器' },
        { id: 'wantdaily', label: '想拍拍店里日常' }, { id: 'wantknow', label: '想让大家认识我们店' },
        { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  goals: [
    { id: 'comestore', label: '来店里看看' }, { id: 'tryon', label: '来现场试一下' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '了解新款' },
    { id: 'learntips', label: '学一个选购方法' }, { id: 'solveproblem', label: '解决一个使用问题' },
    { id: 'knowstore', label: '认识这家店' }, { id: 'remember', label: '记住这家店' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「亲自来现场试一下」。
· 开头点破一个事实：参数表看得再明白，实际操作顺不顺手是另一回事。
· 中间讲清楚来之前先想哪几件事、到店该试哪几个动作。
· 结尾把「来试一下」说出来，语气轻松，不给压力。`,
    learntips: `目标是让看的人真的学到一点怎么挑，从而觉得「这个人懂」。
· 硬广感降到最低 —— 这条更像一个真心在分享经验的人。
· 开头别介绍机型，直接给方法、给判断。
· 中间给 1~2 条真正能用的方法，用大白话讲（可以用下面的行业通用方法）。
· 全篇几乎不推型号，最多最后一句自然带到「店里可以来试」。`,
    solveproblem: `目标是解决一个具体的使用或选购困扰，让人觉得「说的就是我」。
· 开头直接把困扰说出来（买回去放不下、家里人不会用、功能太多挑花眼、用了一阵不知道怎么收拾）。
· 中间给一个切实能用的小办法，讲清楚为什么有用。
· 不要用参数堆砌，越像隔壁用过的人在教你越好。
· 结尾可以自然带到店里，也可以不带 —— 内容价值优先。`
  },

  speakers: [
    { id: 'boss', label: '老板' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '店员' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍机器和演示配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是店员。店员天天在店里给人演示，说的是看多了之后的真实感受。
· 口吻像「你要是拿不准，我一般建议你先按一下这个地方」。
· 具体、实在，不讲大道理，不背参数表。`,
    noface: `这条视频不露脸，只拍机器和操作，配口播。
· 文案必须考虑镜头语言：按键特写、门盖开合、屏幕点亮、手部操作、运行中的细节、展台全景。
· 少依赖「表情」和「眼神」这类只有露脸才能传达的东西。
· 多用「你看这个按下去」「镜头拉近看一下」「转一下这个旋钮」这种能配画面的说法。
· 语气可以更客观、更聚焦在「怎么用」这件事上。`
  },

  toneOverrides: {
    question: `开头用「抛一个问题」的方式切入（这一条主要影响开头）。
· 这个问题要问到人心上，比如「你有没有那种，买之前看着功能挺多，回家其实就只用一两个的时候？」
· 后面要顺着这个问题往下答。`,
    friend: '整体像朋友之间的推荐：「我跟你说」「我自己家就是这么用的」这种口吻。'
  },

  subjectHint: {
    fridge: '这一条围绕冰箱 / 冷柜来讲。', several: '这一条讲好几款，要有整体感，不要只盯着一台。',
    wholestore: '这一条讲整店这一波新陈列，重点是整体给人的感觉。',
    combo: '这一条重点讲一套东西怎么搭着用。'
  },

  sceneIdeas: [
    '具体的**家里使用场景**（早上赶时间、一家人同时用、厨房台面本来就挤）',
    '具体的**选购困扰**（参数看不懂、功能太多挑花眼、怕买回去用不上）',
    '具体的**判断方法**（先量放的地方、先想谁用得最多、到店按哪几个键）',
    '具体的**使用感受**（按键顺不顺手、开门会不会挡、声音能不能接受）',
    '**门店的氛围感**（展机亮着屏、店员在演示、客人自己上手按了一下）'
  ],
  forbiddenFacts: [
    '能效等级、省电百分比、耗电量、功率、匹数、容量升数、噪音分贝、制冷速度等任何参数',
    '保修年限、免费上门、包安装、以旧换新金额、国补 / 政府补贴金额、分期方案',
    '零辐射、绝对安全、母婴级、杀菌率、除菌率、净化率、健康功效',
    '原装进口、德国技术、某品牌同款、核心专利、获奖情况',
    '销量、排名、卖得最好、全网最低、官方授权、厂家直供',
    '具体机型细节（几个按键、什么屏幕、什么颜色、多大尺寸）—— 你没见过这台机器，就别说它长什么样'
  ],
  hardBannedPhrases: ['特别省电', '静音', '操作很简单', '老人也能用', '功能很全', '一步到位',
    '一键搞定', '运行很稳', '噪音很小', '用着顺手'],
  compliance: [
    '不许承诺省电比例、杀菌率、保修年限，也不许提任何补贴金额或政策。',
    '不许用「零辐射 / 绝对安全 / 全网最低 / 销量第一」这类绝对化和安全承诺。'
  ],
  aiTasteWords: ['黑科技', '硬核', '旗舰', '性能拉满', '极致体验', '智能生态',
    '重新定义', '科技感', '品质生活', '一站式', '解放双手', '颠覆'],
  tasteReplacements: [
    '「黑科技 / 硬核」→ 直接删掉，说「这个按一下你就明白了」',
    '「旗舰 / 性能拉满」→ 说「这台用着挺顺」',
    '「智能生态 / 重新定义」→ 说「跟家里其它东西能搭上」',
    '「解放双手 / 颠覆」→ 说「能少折腾一步」',
    '「科技感」→ 说「看着挺利落」'
  ],
  badExample: '搭载黑科技芯片，性能拉满，重新定义智能生态，为您打造极致品质生活。',
  goodExample: '这台我觉得挺适合家里人多的，你别光看功能表，来按一下，顺不顺手一试就知道。',
  titleBad: '「全网最省电的一台，闭眼入！」',
  titleGood: '「买之前先量这个位置，能少跑一趟」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「店里新到一台机器，适合家里人多的。」
✅ 可以说：「新到一台，家里人多的话可以来看看，先想想平时谁用得最多。」
❌ 不许变成：「一级能效，一天不到半度电，十年保修！」因为：能效、耗电、保修全是编的。
❌ 不许变成：「国补直降 2000，以旧换新再减 500。」因为：补贴和金额一个字都没给过。
❌ 不许变成：「德国原装进口，零辐射，母婴都能用。」因为：产地和安全承诺全是编的。
**而你们这次连「家里人多」之外的信息都没有。**
那就靠使用场景、谁用得最多、到店按哪几个键来写，绝不能自己补一个参数、认证或价格。`,

  contentRaw: [
    '先量位置：不只是宽高，还要看开门方向、插座在哪、散热那一边留没留空',
    '再想谁用得最多：老人用、孩子用、一家人抢着用，挑的重点不一样',
    '功能表别从头看到尾，先想清楚自己平时到底用哪两三个',
    '到店一定要自己按一遍：按键、门盖、屏幕，顺不顺手一上手就知道',
    '问清楚日常怎么收拾、怎么清洁，比多两个用不上的功能实在'
  ],
  customerPains: [
    '参数看了一堆，回家其实只用了最基本那一两个',
    '尺寸没量开门方向，搬回去门打不开',
    '功能太多，家里人谁都不会用',
    '只看外观，没注意平时好不好清理',
    '买完才发现插座位置不对，还得重新挪'
  ]
};

module.exports = pack;
