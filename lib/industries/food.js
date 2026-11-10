'use strict';

/** 餐饮行业包。选项 id 与其它行业保持一致，只是中文标签不同。 */

const AI_PICK = { id: 'auto', label: 'AI 帮我选' };

const pack = {
  id: 'food',
  label: '餐饮',
  emoji: '🍜',
  subTypes: [
    { id: 'meal', label: '正餐' }, { id: 'fast', label: '快餐小吃' },
    { id: 'drink', label: '奶茶饮品' }, { id: 'bakery', label: '烘焙甜品' }
  ],
  words: {
    store: '我们店', staff: '店员', goods: '菜', customer: '来吃的人',
    tryVerb: '吃', place: '店里'
  },
  roleIntro: '你服务过大量实体餐饮店，清楚一条门店短视频该长什么样 —— 它靠的是让人想吃，而不是靠喊口号。',

  topics: [
    { id: 'opening', label: '新店开业', emoji: '🎉' },
    { id: 'newarrival', label: '新菜上架', emoji: '🍲' },
    { id: 'activity', label: '门店活动', emoji: '🏷' },
    { id: 'welfare', label: '到店福利', emoji: '🎁' },
    { id: 'outfit', label: '怎么点不踩雷', emoji: '🥢' },
    { id: 'single', label: '招牌单品', emoji: '🍽' },
    { id: 'season', label: '时令换季', emoji: '🍃' },
    { id: 'festival', label: '节日聚餐', emoji: '🎊' },
    { id: 'daily', label: '门店日常', emoji: '🏬' },
    { id: 'staff', label: '老板 / 厨师出镜', emoji: '🎤' },
    { id: 'auto', label: 'AI 帮我选', emoji: '✨' }
  ],

  second: {
    opening: {
      question: '开业这段时间，主要拍什么？',
      options: [
        { id: 'openday', label: '开业当天现场' }, { id: 'prepare', label: '开业前的准备' },
        { id: 'environment', label: '新店环境介绍' }, { id: 'openact', label: '开业活动' },
        { id: 'firstcustomer', label: '第一批客人' }, { id: 'kitchen', label: '后厨备料' },
        { id: 'teamstate', label: '店员状态' }, AI_PICK
      ]
    },
    newarrival: {
      question: '这次上新，主要拍什么？',
      options: [
        { id: 'signature', label: '主打的那道菜' }, { id: 'several', label: '好几道新菜' },
        { id: 'drinknew', label: '新饮品' }, { id: 'dessert', label: '新甜品' },
        { id: 'seasonnew', label: '时令菜' }, { id: 'combo', label: '新搭配的套餐' },
        { id: 'wholestore', label: '整店换新' }, AI_PICK
      ]
    },
    activity: {
      question: '是什么活动？',
      options: [
        { id: 'openact', label: '开业活动' }, { id: 'festivalact', label: '节日活动' },
        { id: 'seasonact', label: '时令活动' }, { id: 'welfareact', label: '到店福利' },
        { id: 'memberact', label: '会员活动' }, { id: 'limitedact', label: '限时活动' },
        { id: 'annivact', label: '店庆活动' }, AI_PICK
      ]
    },
    welfare: {
      question: '这次是什么福利？',
      options: [
        { id: 'visitorgift', label: '到店有礼' }, { id: 'oldcustomer', label: '老顾客回馈' },
        { id: 'newexperience', label: '新菜试吃' }, { id: 'freesuggest', label: '免费点菜建议' },
        { id: 'surprise', label: '进店小惊喜' }, { id: 'memberonly', label: '会员专属' }, AI_PICK
      ]
    },
    outfit: {
      question: '想讲哪种点菜场景？',
      options: [
        { id: 'commute', label: '一个人来吃' }, { id: 'date', label: '两个人来吃' },
        { id: 'casual', label: '几个人聚餐' }, { id: 'elegant', label: '带长辈来吃' },
        { id: 'young', label: '带孩子来吃' }, { id: 'first', label: '第一次来' },
        { id: 'takeaway', label: '打包带走' }, AI_PICK
      ]
    },
    single: {
      question: '推荐哪一类？',
      options: [
        { id: 'signature', label: '招牌主菜' }, { id: 'staple', label: '主食' },
        { id: 'snack', label: '小吃' }, { id: 'drinknew', label: '饮品' },
        { id: 'dessert', label: '甜品' }, { id: 'soup', label: '汤品' },
        { id: 'combo', label: '搭配好的一套' }, AI_PICK
      ]
    },
    season: {
      question: '换季主要拍什么？',
      options: [
        { id: 'spring', label: '春天这一口' }, { id: 'summer', label: '夏天开胃的' },
        { id: 'autumn', label: '秋天进补感' }, { id: 'winter', label: '冬天热乎的' },
        { id: 'seasonmix', label: '时令怎么搭' }, { id: 'warm', label: '冷热怎么选' }, AI_PICK
      ]
    },
    festival: {
      question: '是哪个节日？',
      options: [
        { id: 'springfestival', label: '春节' }, { id: 'valentine', label: '情人节' },
        { id: 'motherday', label: '母亲节' }, { id: 'love520', label: '520' },
        { id: 'children', label: '儿童节' }, { id: 'midautumn', label: '中秋节' },
        { id: 'national', label: '国庆' }, { id: 'newyear', label: '元旦' },
        { id: 'christmas', label: '圣诞节' }, AI_PICK
      ]
    },
    daily: {
      question: '店里是什么场景？',
      options: [
        { id: 'busy', label: '饭点正忙' }, { id: 'newgoods', label: '食材刚到' },
        { id: 'sorting', label: '后厨备餐' }, { id: 'tryon', label: '客人吃饭的场景' },
        { id: 'display', label: '摆台出餐' }, { id: 'routine', label: '开门前的准备' },
        { id: 'recommend', label: '店员推荐' }, { id: 'bossdaily', label: '老板日常' }, AI_PICK
      ]
    },
    staff: {
      question: '想让镜头前的人，给大家留下什么印象？',
      options: [
        { id: 'bossself', label: '老板本人' }, { id: 'managerself', label: '店长' },
        { id: 'seniorguide', label: '老店员' }, { id: 'chef', label: '厨师' },
        { id: 'wholteam', label: '整个团队' }, { id: 'bossheart', label: '老板讲心里话' },
        { id: 'managerpro', label: '店长讲门道' }, { id: 'guidedaily', label: '店员讲日常' }, AI_PICK
      ]
    },
    auto: {
      question: '大概想拍点什么？说不清楚也没关系。',
      options: [
        { id: 'wantnew', label: '想拍刚上的新菜' }, { id: 'wantact', label: '想拍店里的活动' },
        { id: 'wantoutfit', label: '想讲怎么点菜' }, { id: 'wantsingle', label: '想推一道招牌' },
        { id: 'wantdaily', label: '想拍拍店里日常' }, { id: 'wantknow', label: '想让大家认识我们店' },
        { id: 'wantnothing', label: '完全没想法，全交给 AI' }
      ]
    }
  },

  goals: [
    { id: 'comestore', label: '来店里吃一顿' }, { id: 'tryon', label: '来尝一尝' },
    { id: 'joinact', label: '来参加活动' }, { id: 'knownew', label: '了解新菜' },
    { id: 'learntips', label: '学一个点菜方法' }, { id: 'solveproblem', label: '解决一个吃饭难题' },
    { id: 'knowstore', label: '认识这家店' }, { id: 'remember', label: '记住这家店' },
    { id: 'exposure', label: '增加曝光' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  goalOverrides: {
    tryon: `目标是让人愿意「亲自来尝一尝」。
· 开头点破一个事实：看图片和自己坐下吃，是两回事。
· 中间讲清楚什么情况下来吃最合适、来了怎么点比较省心。
· 结尾把「来尝一下」说出来，语气轻松，不要有推销压力。`,
    learntips: `目标是让看的人真的学到一点怎么点菜、怎么搭配，从而觉得「这个人懂吃」。
· 硬广感降到最低 —— 这条更像一个真心在分享经验的人。
· 开头别介绍菜品，直接给方法、给判断。
· 中间给 1~2 条真正能用的方法，用大白话讲（可以用下面的行业通用方法）。
· 全篇几乎不推菜，最多最后一句自然带到「店里可以来试」。`,
    solveproblem: `目标是解决一个具体的吃饭困扰，让人觉得「说的就是我」。
· 开头直接把困扰说出来（不知道点什么、几个人不好点、怕等太久、带老人孩子不知道点啥……）。
· 中间给一个切实能用的小办法，讲清楚为什么有用。
· 不要用行业黑话，越像隔壁常来吃的人在教你越好。
· 结尾可以自然带到店里，也可以不带 —— 内容价值优先。`
  },

  speakers: [
    { id: 'boss', label: '老板' }, { id: 'manager', label: '店长' },
    { id: 'guide', label: '店员' }, { id: 'multi', label: '多人' },
    { id: 'noface', label: '不露脸，只拍菜和店里配口播' }, { id: 'auto', label: 'AI 帮我选' }
  ],
  speakerOverrides: {
    guide: `出镜人是店员。店员天天在店里招呼客人，说的是自己看多了之后的真实感受。
· 口吻像「你要是第一次来，我一般建议你先点这个」。
· 具体、实在，不讲大道理。`,
    noface: `这条视频不露脸，只拍菜和店里，配口播。
· 文案必须考虑镜头语言：出餐、锅气、菜品特写、摆台、后厨、手部展示、店里坐满人的样子。
· 少依赖「表情」和「眼神」这类只有露脸才能传达的东西。
· 多用「你看这个刚出锅的样子」「镜头拉近看一下」「端上来还在冒热气」这种能配画面的说法。
· 语气可以更客观、更聚焦在吃这件事本身。`
  },

  toneOverrides: {
    question: `开头用「抛一个问题」的方式切入（这一条主要影响开头）。
· 这个问题要问到人心上，比如「你有没有那种，坐下来翻了半天菜单，最后还是点了上次那几样的时候？」
· 后面要顺着这个问题往下答。`,
    friend: '整体像朋友之间的推荐：「我跟你说」「我自己来一般就这么点」这种口吻。'
  },

  subjectHint: {
    signature: '这一条围绕招牌菜来讲。', several: '这一条讲好几道菜，要有整体感，不要只盯着一道。',
    combo: '这一条讲搭配好的一套，重点是怎么搭着吃更顺。', drinknew: '这一条围绕饮品来讲。',
    dessert: '这一条围绕甜品来讲。', wholestore: '这一条讲整店这一波上新，重点是整体给人的感觉。'
  },

  sceneIdeas: [
    '具体的**吃饭场景**（下班不想做饭、几个人临时约、带孩子出门找地方坐）',
    '具体的**点菜困扰**（菜单翻半天、点多了吃不完、不知道哪个适合老人孩子）',
    '具体的**判断方法**（几个人怎么配、先上什么后上什么、口味怎么搭不重）',
    '具体的**吃饭感受**（坐下那一刻、刚端上来的热气、吃完不腻不撑）',
    '**门店的氛围感**（饭点店里在忙什么、后厨的声音、邻桌聊天声）'
  ],
  forbiddenFacts: [
    '食材产地、有机、无添加、现杀、当天直供、祖传秘方、手工现做、独家配方',
    '卫生等级、检测报告、营养功效（养胃、降火、减肥、增强免疫）',
    '排队时长、日销份数、翻台率、一天卖多少、有多少人打卡',
    '优惠价格、套餐价、折扣、免单承诺（「不好吃免单」也算）',
    '具体菜品细节（几两、什么部位、放几种料、什么火候）—— 你没见过这道菜，就别说它具体什么样'
  ],
  hardBannedPhrases: ['分量很足', '食材新鲜', '口味地道', '不踩雷', '老少皆宜', '回头客特别多',
    '入口即化', '外酥里嫩', '香气扑鼻', '汤汁浓郁', '用料扎实'],
  compliance: [
    '不许承诺任何功效（养胃、降火、减肥、养生、调理）。',
    '不许用「最正宗 / 全城第一 / 唯一一家」这类绝对化说法，也不许贬低同行。'
  ],
  aiTasteWords: ['匠心', '烟火气', '舌尖上的', '治愈系', '一口入魂', '味蕾盛宴',
    '甄选食材', '慢火熬制', '地道风味', '灵魂一口', '美食美学', '仪式感拉满'],
  tasteReplacements: [
    '「匠心 / 甄选食材」→ 直接删掉，说「怎么做的你到店看一眼就明白」',
    '「烟火气」→ 说「饭点的时候店里挺热闹」',
    '「舌尖上的 / 味蕾盛宴」→ 说「挺下饭」「吃着顺口」',
    '「一口入魂 / 治愈系」→ 说「吃完挺舒服」',
    '「仪式感拉满」→ 说「摆上来看着挺利落」'
  ],
  badExample: '甄选上等食材，匠心慢炖，唤醒您的味蕾，给您好好吃饭的仪式感。',
  goodExample: '这道菜我觉得挺适合两三个人一起点，不用纠结，量刚好，来了可以先问问今天哪个更合适。',
  titleBad: '「全城最好吃的一碗面来了！」',
  titleGood: '「几个人来吃，其实先点这两样就够了」',

  realExample: `【真实对照例子 —— 请严格按照这个尺度来写】
如果有人告诉你：「我们这周上了一道新菜，适合两三个人一起吃。」
✅ 可以说：「这周上了一道新菜，两三个人来点着吃挺合适，你可以来试试。」
❌ 不许变成：「新菜上市，第二份半价，最后三天！」因为：用户没说过任何优惠和时限。
❌ 不许变成：「当天现杀的土鸡，祖传秘方慢炖八小时。」因为：食材来源和做法全是编的。
❌ 不许变成：「日销三百份，全城回头客最多。」因为：销量和口碑都是编的。
**而你们这次连「两三个人」「新菜」之外的信息都没有。**
那就靠场景、点菜方法、吃饭感受来写，绝不能自己补一个价格、产地或数字。`,

  contentRaw: [
    '先看几个人：一个人、两个人、一桌人，点的思路完全不一样',
    '再看口味搭：别全点一个味型，有重有轻吃着才不腻',
    '第一次来，先问一句今天哪个最合适，比照着图片点省心',
    '有老人孩子一起来，先想清楚有没有能一起吃的',
    '拿不准分量，先少点一点，不够再加'
  ],
  customerPains: [
    '菜单翻半天，最后还是点了上次那几样',
    '一桌全点一个口味，吃到后面腻得慌',
    '点多了吃不完，点少了又觉得没吃够',
    '带老人孩子出来，不知道哪个大家都能吃',
    '只看图片点，端上来跟想的完全不一样'
  ]
};

module.exports = pack;
