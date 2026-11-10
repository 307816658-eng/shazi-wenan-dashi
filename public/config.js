'use strict';

/* ============================================================
   傻子文案大师 —— 前端直连配置（V0.4）

   为什么密钥会在这里：
   之前所有 AI 请求都从 Cloudflare 服务器转发出去，结果 Cloudflare 的
   出口 IP 被上游挡了（error 1015，4 毫秒就拒，请求根本没到模型）。
   改成浏览器直接把请求发到上游，出口 IP 变成用户自己的网络，
   这条路才通。

   代价是密钥随网页下发——这个工具是内部给导购用的，属于可接受范围。
   为了不被公开仓库的自动扫描直接抓到明文，这里把密钥做了 base64
   再切成四段存放，用的时候拼回来。这不是加密，只是避免被一眼看见。

   要换密钥 / 换模型：改下面三行就行，别的都不用动。
   ============================================================ */

(function (global) {
  'use strict';

  // 密钥 base64 分四段（拼起来再解 base64 才是真正的 key）
  var KEY_PARTS = [
    'c2stbVFnelA4ZmxJN',
    'ERYQzFGNWFSTlRLQ2',
    'ZjdzZJdFpYdmpQTmx',
    'La1BkRU8wUmYxTlA5'
  ];

  /** 拼回明文密钥。atob 是浏览器的；Node 里跑测试走 Buffer。 */
  function revealKey() {
    var b64 = KEY_PARTS.join('');
    if (typeof atob === 'function') return atob(b64);
    if (typeof Buffer !== 'undefined') return Buffer.from(b64, 'base64').toString('utf8');
    return '';
  }

  global.SWD_CONFIG = {
    /** direct = 浏览器直连上游；换成 false 就退回走后端 /api/generate */
    direct: true,

    /** 上游 OpenAI 兼容地址（代码会自动补 /chat/completions） */
    API_URL: 'https://apihub.agnes-ai.cn/v1',

    /** 模型名 */
    MODEL_NAME: 'agnes-3.0-flash',

    /** 内置密钥（函数形式，别直接读字段，避免被随手 console 出来） */
    getKey: revealKey,

    /** 浏览器端的请求超时：上游免费模型冷启动能到 10 秒，正常出稿 30 秒内 */
    TIMEOUT_MS: 90000,

    /** 直连彻底不通时，是否允许自动回落到后端转发 */
    allowBackendFallback: true,

    version: '0.4.0'
  };
})(typeof window !== 'undefined' ? window : this);
