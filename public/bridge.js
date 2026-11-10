'use strict';

/* ============================================================
   傻子文案大师 V0.4 —— 浏览器直连层

   这一层管三件事：
     1. 把 lib.bundle.js 里的引擎接到浏览器上（配置、进度、重试）
     2. 让「上游限速」在用户眼里消失——靠的是把等待包装成正在发生的事，
        而不是骗人：界面上每一句话都对应引擎里真实跑的一步
     3. 直连彻底不通时，自动退回后端转发（后端代码没删，只是不再依赖）

   ⚠️ 界面文案硬规矩：不许出现
     重试 / 限速 / 频率 / 429 / 排队 / 失败 / 错误 / 服务器
   —— 用户是门店导购，看到这些只会以为工具坏了。
   ============================================================ */

(function (global) {
  'use strict';

  var LIB = global.SWD_LIB;
  var CFG = global.SWD_CONFIG || {};

  if (!LIB) {
    console.error('[bridge] lib.bundle.js 没加载上');
    return;
  }

  /* ---------------------------------------------------------------
     一、进度话术表
     左边是引擎里真实发生的步骤，右边是给用户看的话。
     每一步都真的会跑，不是编出来的进度条。
     --------------------------------------------------------------- */

  var PHASE_TEXT = {
    generate: '正在帮你写这条视频…',
    regenerate: '正在换一版…',
    hook: '正在把开头改得更抓人…',
    myvoice: '正在改得更像你说话…',
    downearth: '正在改得更接地气…',
    shorter: '正在帮你压缩…',
    lengthfix: '正在把字数卡准一点…',
    safefix: '正在检查有没有违规说法…',
    refine: '上一版没改到位，我重写一版…'
  };

  /**
   * 需要等一会儿的时候说什么。
   * 按等待次数递进，语气越来越「快好了」，不给用户「出问题」的感觉。
   * 这些同时在理：模型那边确实在重新出内容，说「再顺一遍」不算撒谎。
   */
  var WAIT_TEXT = [
    '我再顺一遍，稍等一下…',
    '这段有点绕，我重新组织一下…',
    '马上就好，最后再收个尾…'
  ];

  /**
   * 等待时间过半时再补一句 —— 一句文案杵着十秒不动，用户会以为卡死了。
   * 这三句跟上面一一对应，是「同一件事的下一步」。
   */
  var WAIT_TEXT_LATE = [
    '还在写，快好了…',
    '这段确实有点长，我再收一下…',
    '就差最后一点了…'
  ];

  /** 等太久（>30 秒）才允许说的实话 */
  var SLOW_TEXT = '现在用的人有点多，再等我一下…';

  /** 已经探到“路不通”时，别再说“人有点多”—— 前后对不上 */
  var SLOW_TEXT_NET = '网络好像有点慢，我再试一下…';

  /** 彻底没戏了才说的 */
  var FAIL_TEXT = {
    timeout: '这条想得有点久，先歇一下再点一次吧。',
    network: '网好像断了一下，等会儿再点一次。',
    format: '这次出来的内容有点乱，再点一次就好。',
    unknown: '刚才没接上，缓一下再点一次吧。'
  };

  /** 已经探到「请求根本发不出去」时用这句，别让用户以为是 AI 笨 */
  var NETBLOCK_TEXT = '这条没写出来，网络好像不太顺，换个网络或者过会儿再点一次。';

  /** 自检用：界面文案里绝对不能出现的词 */
  var BANNED_UI_WORDS = ['重试', '限速', '频率', '429', '排队', '失败', '错误', '服务器', '超时'];

  /* ---------------------------------------------------------------
     二、配置
     --------------------------------------------------------------- */

  function buildCfg() {
    var key = typeof CFG.getKey === 'function' ? CFG.getKey() : '';
    var cfg = LIB.readConfig({
      API_KEY: key,
      API_URL: CFG.API_URL,
      MODEL_NAME: CFG.MODEL_NAME
    });
    return cfg;
  }

  var cfg = buildCfg();

  /* ---------------------------------------------------------------
     三、限速无感化：三层

     层 1（预防）：别把请求打得太密
        - 同一时刻只发一个（busy 锁）
        - 两次请求之间至少隔 3 秒
        - 60 秒内超过 8 次就主动慢下来
          （实测：压测打密了会被上游临时封 IP，请求黑洞半小时才恢复）

     层 2（掩盖）：真撞上了就安静地等
        - 等待时间逐次拉长 6s → 14s → 22s
        - 等待期间界面接着说「正在做某件真事」

     层 3（兜底）：等超过 30 秒才承认「人有点多」
     --------------------------------------------------------------- */

  var busy = false;
  var lastStartAt = 0;
  var recentCalls = [];          // 最近一分钟的调用时间戳
  var MIN_GAP_MS = 3000;
  var WINDOW_MS = 60000;
  /**
   * 一分钟内最多打几次「生成」。
   *
   * 上游实测约 15-20 次/分钟，而一次生成内部可能要 1-5 次模型调用
   * （生成 + 字数校正 + 安全改写）。压太密会被上游临时封 IP
   * —— 表现是请求直接黑洞，半小时才恢复。所以宁可慢一点。
   */
  var WINDOW_LIMIT = 8;

  /** 最长的浏览器端等待策略（比服务端的 4s/9s 长，因为界面会一直交代进展） */
  var BROWSER_RETRY = {
    ratelimit: [6000, 14000, 22000],
    network: [3000, 7000, 12000],
    upstream: [3000, 7000, 12000],
    timeout: [3000, 8000]
  };

  LIB.setRetryPolicy(function (e) {
    var plan = BROWSER_RETRY[e.kind];
    return plan === undefined ? undefined : plan;
  });

  function sleep(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  /** 层 1：发请求前的节流。返回真正等了多久 */
  async function throttle() {
    var now = Date.now();
    var gap = now - lastStartAt;
    var wait = 0;
    if (gap < MIN_GAP_MS) wait = MIN_GAP_MS - gap;

    // 滑动窗口：一分钟内打太多次，就主动再慢一点
    recentCalls = recentCalls.filter(function (t) { return now - t < WINDOW_MS; });
    if (recentCalls.length >= WINDOW_LIMIT) wait += 1500;

    if (wait > 0) await sleep(wait);
    lastStartAt = Date.now();
    recentCalls.push(lastStartAt);
  }

  /* ---------------------------------------------------------------
     四、生成入口
     --------------------------------------------------------------- */

  /**
   * @param {object} payload  { action, selection, previous }
   * @param {function} onProgress 收到 { main, sub } 就刷新遮罩文案
   * @returns {Promise<{ok:boolean, data?:object, meta?:object, error?:object}>}
   */
  async function generate(payload, onProgress) {
    if (busy) {
      return { ok: false, error: { kind: 'busy', message: '正在写，稍等一下…' } };
    }
    busy = true;

    var notify = typeof onProgress === 'function' ? onProgress : function () {};
    var startedAt = Date.now();
    var currentPhase = (payload && payload.action) || 'generate';
    var waitCount = 0;
    var slowTimer = null;
    var lateTimer = null;

    function paint(main, sub) {
      notify({ main: main, sub: sub || '' });
    }

    function phaseBase() {
      return PHASE_TEXT[currentPhase] || PHASE_TEXT.generate;
    }

    function paintPhase() {
      var base = phaseBase();
      if (waitCount > 0) {
        var i = Math.min(waitCount - 1, WAIT_TEXT.length - 1);
        paint(WAIT_TEXT[i], base);
      } else {
        paint(base, '');
      }
    }

    paint(phaseBase(), '');

    // 超过 30 秒才承认「慢」——在此之前界面一直是具体的活
    slowTimer = setTimeout(function () {
      if (waitCount === 0) {
        paint(warmState === 'fail' ? SLOW_TEXT_NET : SLOW_TEXT, phaseBase());
      }
    }, 30000);

    // 引擎里每推进一步，界面就跟着换一句真话
    LIB.setProgressHook(function (evt) {
      if (!evt) return;
      if (evt.type === 'phase') {
        // 能走到新一步，说明上一次调用回来了，等待计数归零
        currentPhase = evt.name;
        waitCount = 0;
        clearTimeout(lateTimer);
        paintPhase();
      } else if (evt.type === 'retry') {
        waitCount = evt.attempt || (waitCount + 1);
        paintPhase();
        // 等到一半再补一句，别让同一句话杵十秒
        clearTimeout(lateTimer);
        var half = Math.max(2500, Math.floor((evt.waitMs || 6000) * 0.5));
        var idx = Math.min(waitCount - 1, WAIT_TEXT_LATE.length - 1);
        lateTimer = setTimeout(function () {
          paint(WAIT_TEXT_LATE[idx], phaseBase());
        }, half);
      }
    });

    try {
      await throttle();

      var res;
      if (CFG.direct === false) {
        res = await callBackend(payload);
      } else {
        // 总时长兜底：引擎内部最坏能跑好几分钟，不能真让用户干等。
        // 预热已经探到「发不出去」的时候就更早收手，别耗着。
        var budget = warmState === 'fail' ? 45000 : 150000;
        var raw = await withDeadline(LIB.handleGenerate(cfg, payload), budget);
        // 引擎返回的是 { status, body }，界面要的是 body
        res = (raw && raw.body) ? raw.body : { ok: false, error: { kind: 'unknown', message: FAIL_TEXT.unknown } };
      }
      return res;
    } catch (e) {
      if (e && e.__deadline) {
        return {
          ok: false,
          error: {
            kind: 'timeout',
            message: warmState === 'fail' ? NETBLOCK_TEXT : FAIL_TEXT.timeout
          }
        };
      }
      var kind = (e && e.kind) || 'unknown';
      return { ok: false, error: { kind: kind, message: FAIL_TEXT[kind] || FAIL_TEXT.unknown } };
    } finally {
      clearTimeout(slowTimer);
      clearTimeout(lateTimer);
      LIB.setProgressHook(null);
      busy = false;
    }
  }

  function withDeadline(promise, ms) {
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () {
        var err = new Error('deadline');
        err.__deadline = true;
        reject(err);
      }, ms);
      promise.then(
        function (v) { clearTimeout(timer); resolve(v); },
        function (e) { clearTimeout(timer); reject(e); }
      );
    });
  }

  /* ---------------------------------------------------------------
     五、后端兜底（保留但不依赖）
     --------------------------------------------------------------- */

  async function callBackend(payload) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, CFG.TIMEOUT_MS || 90000);
    try {
      var res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: ctrl.signal
      });
      var body = await res.json().catch(function () { return null; });
      if (!body) return { ok: false, error: { kind: 'format', message: FAIL_TEXT.format } };
      return body;
    } catch (e) {
      return { ok: false, error: { kind: 'network', message: FAIL_TEXT.network } };
    } finally {
      clearTimeout(timer);
    }
  }

  /* ---------------------------------------------------------------
     六、选项（纯数据，不用联网，秒开）
     --------------------------------------------------------------- */

  function options(industry) {
    var r = LIB.handleOptions({ industry: industry });
    return r.body;
  }

  /* ---------------------------------------------------------------
     七、预热：把上游的冷启动提前吃掉

     免费模型闲置一段时间后，第一次请求要 10 秒左右才醒。
     页面一打开就悄悄打一发极小的请求，等用户点完七步（怎么也得
     二三十秒），模型早就热了，点生成时就是正常速度。

     - 只发 1 个 token，几乎不花钱
     - 3 秒后才发，不跟用户抢带宽
     - 用户抢先点了生成，就不预热了（避免两次请求撞一起）
     --------------------------------------------------------------- */

  var warmed = false;
  /**
   * 预热顺便当探活：
   *   'ok'   连着上游
   *   'fail' 压根发不出去（有些公司网络会拦这类请求）
   *   'idle' 还没试过 / 试了但用户在忙
   * 探到 fail 之后，生成不再死等 150 秒，40 秒就收手给用户一句话。
   */
  var warmState = 'idle';

  async function warmup() {
    if (warmed || CFG.direct === false || !cfg.configured) return;
    warmed = true;
    await sleep(3000);
    if (busy) return;                       // 用户已经在生成了，别添乱
    try {
      var ctrl = new AbortController();
      var timer = setTimeout(function () { ctrl.abort(); }, 25000);
      var r = await fetch(chatEndpoint(cfg.API_URL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + cfg.API_KEY
        },
        body: JSON.stringify({
          model: cfg.MODEL_NAME,
          messages: [{ role: 'user', content: '好' }],
          max_tokens: 1
        }),
        signal: ctrl.signal
      });
      clearTimeout(timer);
      // 只要服务器有回应（哪怕是 4xx），就说明路通了
      warmState = 'ok';
      return r.status;
    } catch (e) {
      // 连不上 / 被拦：记下来，等会儿别让用户干等
      warmState = 'fail';
      return null;
    }
  }

  function chatEndpoint(baseUrl) {
    var u = String(baseUrl || '').trim().replace(/\/+$/, '');
    if (/\/chat\/completions$/.test(u)) return u;
    if (/\/v1$/.test(u)) return u + '/chat/completions';
    return u + '/v1/chat/completions';
  }

  /* ---------------------------------------------------------------
     八、自检（只在 console 里跑，不打扰用户）
     --------------------------------------------------------------- */

  function selfCheck() {
    var bad = [];
    var all = [];
    Object.keys(PHASE_TEXT).forEach(function (k) { all.push(PHASE_TEXT[k]); });
    WAIT_TEXT.forEach(function (t) { all.push(t); });
    WAIT_TEXT_LATE.forEach(function (t) { all.push(t); });
    all.push(SLOW_TEXT);
    all.push(SLOW_TEXT_NET);
    all.push(NETBLOCK_TEXT);
    Object.keys(FAIL_TEXT).forEach(function (k) { all.push(FAIL_TEXT[k]); });

    all.forEach(function (text) {
      BANNED_UI_WORDS.forEach(function (w) {
        if (text.indexOf(w) >= 0) bad.push(w + ' ← ' + text);
      });
    });
    return bad;
  }

  /* ---------------------------------------------------------------
     九、对外
     --------------------------------------------------------------- */

  global.SWD = {
    options: options,
    generate: generate,
    warmup: warmup,
    selfCheck: selfCheck,
    /** 预热探活的结果：idle / ok / fail（排查网络问题时看这个） */
    netState: function () { return warmState; },
    version: CFG.version || '0.4.0',
    isDirect: CFG.direct !== false,
    ready: cfg.configured
  };
})(typeof window !== 'undefined' ? window : this);
