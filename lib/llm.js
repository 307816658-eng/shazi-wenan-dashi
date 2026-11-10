'use strict';

/**
 * 第三方大模型调用层（OpenAI Chat Completions 兼容）
 *
 * 职责：
 *  1. 发请求（带超时）—— 上游实测会慢到 40 秒以上，超时必须给足
 *  2. 把模型返回的文本解析成 { title, hook, script, risk_notice }
 *  3. 解析失败时四级兜底，绝不让前端拿到空数据
 *  4. 错误分类，并且保证错误信息里不会出现 API Key
 */

/**
 * ⚠️ 这个文件刻意**不 require 任何 Node 内置模块**（原来 require 过 ./env，但它用了 fs）。
 * 因为同一份代码要被两处复用：
 *   1. 本地 Node 服务（server.js）
 *   2. Cloudflare Pages Functions（Workers 运行时，没有 fs / path / os）
 * 所以下面把需要的两个小工具函数直接内联进来，保持这个文件「纯逻辑、零运行时依赖」。
 */

/** 把 URL 规范成 .../v1/chat/completions */
function chatEndpoint(baseUrl) {
  let u = String(baseUrl || '').trim().replace(/\/+$/, '');
  if (/\/chat\/completions$/.test(u)) return u;
  if (/\/v1$/.test(u)) return u + '/chat/completions';
  return u + '/v1/chat/completions';
}

/** 密钥脱敏：任何要写进日志/返回体的字符串都先过一遍 */
function maskSecret(text) {
  let s = String(text == null ? '' : text);
  s = s.replace(/sk-[A-Za-z0-9_\-]{6,}/g, 'sk-****');
  s = s.replace(/(Bearer\s+)[A-Za-z0-9_\-\.]{6,}/gi, '$1****');
  return s;
}

/** 不同操作的采样温度：换一版要更发散，压缩要更收敛 */
const TEMPERATURE = {
  generate: 0.9,
  regenerate: 1.0,
  hook: 0.85,
  myvoice: 0.75,
  downearth: 0.8,
  shorter: 0.6,
  lengthfix: 0.4,   // 定量改写，要收敛，不要发散
  safefix: 0.4      // 违规词改写，同样要收敛
};

class LLMError extends Error {
  constructor(kind, message, status) {
    super(maskSecret(message));
    this.name = 'LLMError';
    this.kind = kind;      // config | timeout | network | upstream | format | unknown
    this.status = status || 0;
  }
}

/** 调用方（前端）能看懂的提示语 —— 绝不包含任何密钥或内部细节 */
const USER_FACING = {
  config: 'AI 服务还没配置好，请联系管理员检查接口配置。',
  timeout: 'AI 想得有点久，再等一会儿也未必有结果 —— 稍后再点一次吧。',
  network: 'AI 暂时没连上，缓一下再点一次。',
  upstream: 'AI 暂时没连上，缓一下再点一次。',
  ratelimit: '这会儿用的人有点多，等几秒再点一次就好。',
  format: 'AI 这次回的内容有点乱，再点一次就好。',
  unknown: '出了点小问题，缓一下再试。'
};

function userFacingMessage(kind) {
  return USER_FACING[kind] || USER_FACING.unknown;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 哪些错误值得再试一次，以及每次等多久。
 *
 * 上游是免费额度的公开接口，实测连续请求会撞 429（速率限制）。
 * 不重试的话，用户连点两下就看到「没连上」，体验很差 ——
 * 而后端多等几秒再试一次，往往就过了。
 */
function retryWaits(e) {
  if (e.kind === 'ratelimit') return [4000, 9000];                    // 限流：等久一点
  if (e.kind === 'network') return [1500, 3500];                      // 网络抖一下
  if (e.kind === 'upstream' && e.status >= 500) return [2000, 5000];  // 上游 5xx
  if (e.kind === 'timeout') return [2000];                            // 上游偶发慢，自动再试一次
  return null;                                                        // 配置/格式 不重试
}

/**
 * 调用大模型，返回结构化结果（带自动重试）
 */
async function chatJSON(cfg, messages, action, opts) {
  let attempt = 0;
  for (;;) {
    try {
      return await chatOnce(cfg, messages, action, opts);
    } catch (e) {
      const waits = retryWaits(e);
      if (!waits || attempt >= waits.length) throw e;
      const w = waits[attempt];
      attempt += 1;
      console.warn('[llm] 第 ' + attempt + ' 次重试，等待 ' + w + 'ms（原因：' + e.kind +
        (e.status ? ' HTTP ' + e.status : '') + '）');
      await sleep(w);
    }
  }
}

/**
 * 单次调用
 * @param {object} cfg   { API_KEY, API_URL, MODEL_NAME }
 * @param {Array}  messages
 * @param {string} action 用于取 temperature
 * @param {object} opts  { timeoutMs, maxTokens }
 */
async function chatOnce(cfg, messages, action, opts) {
  const options = opts || {};
  const timeoutMs = options.timeoutMs || 90000;

  if (!cfg.configured) {
    throw new LLMError('config', '缺少配置：' + (cfg.missing || []).join(', '));
  }

  const url = chatEndpoint(cfg.API_URL);
  const body = {
    model: cfg.MODEL_NAME,
    messages,
    temperature: TEMPERATURE[action] !== undefined ? TEMPERATURE[action] : 0.8,
    max_tokens: options.maxTokens || 1600,
    response_format: { type: 'json_object' }
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  let text;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + cfg.API_KEY
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    text = await res.text();
  } catch (e) {
    clearTimeout(timer);
    if (e && e.name === 'AbortError') {
      throw new LLMError('timeout', '请求超时（' + timeoutMs + 'ms）');
    }
    throw new LLMError('network', '网络请求失败：' + (e && e.message ? e.message : e));
  }
  clearTimeout(timer);

  if (!res.ok) {
    // 上游报错：只保留状态码和一小段响应体，并且脱敏
    const snippet = maskSecret(String(text || '').slice(0, 400));
    // 429 是「请求太频繁」，单独归类 —— 上层会退避重试，用户看到的提示也更准确
    const kind = res.status === 429 ? 'ratelimit' : 'upstream';
    throw new LLMError(kind, 'HTTP ' + res.status + ' ' + snippet, res.status);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new LLMError('upstream', '上游返回的不是合法 JSON：' + maskSecret(String(text).slice(0, 200)));
  }

  const content = extractContent(data);
  if (!content) {
    throw new LLMError('upstream', '上游返回里没有可用的文本内容');
  }

  const parsed = parseStructured(content);

  return {
    title: parsed.title,
    hook: parsed.hook,
    script: parsed.script,
    risk_notice: parsed.risk_notice,
    usage: (data && data.usage) || {},
    model: (data && data.model) || cfg.MODEL_NAME,
    raw: content
  };
}

/** 从各家可能的响应结构里取出正文 */
function extractContent(data) {
  if (!data) return '';
  // 标准 OpenAI
  if (data.choices && data.choices[0]) {
    const c = data.choices[0];
    if (c.message && typeof c.message.content === 'string') return c.message.content;
    if (c.delta && typeof c.delta.content === 'string') return c.delta.content;
    if (typeof c.text === 'string') return c.text;
  }
  // 少数中转的简化结构
  if (typeof data.content === 'string') return data.content;
  if (typeof data.output_text === 'string') return data.output_text;
  if (typeof data.result === 'string') return data.result;
  return '';
}

/**
 * 把模型输出解析成四段。
 * 顺序：直接 JSON → 剥 ```json 围栏 → 正则抠出第一个 {...} → 纯文本兜底
 * 任何情况下都不允许把空数据丢给前端。
 */
function parseStructured(content) {
  const text = String(content || '').trim();

  // 1) 直接就是 JSON
  const direct = tryJSON(text);
  if (direct) return normalizeResult(direct);

  // 2) 被 markdown 围栏包住
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    const inner = tryJSON(fence[1].trim());
    if (inner) return normalizeResult(inner);
  }

  // 3) 文本里夹着 JSON 对象
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last > first) {
    const inner = tryJSON(text.slice(first, last + 1));
    if (inner) return normalizeResult(inner);
  }

  // 4) 完全不是 JSON —— 兜底成纯口语稿
  return fallbackFromPlainText(text);
}

function tryJSON(s) {
  try {
    const o = JSON.parse(s);
    if (o && typeof o === 'object' && !Array.isArray(o)) return o;
  } catch (e) { /* 忽略 */ }
  return null;
}

function pickString(obj, keys) {
  for (const k of keys) {
    const v = obj && obj[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (Array.isArray(v) && v.length) return v.map((x) => String(x).trim()).filter(Boolean).join('\n');
  }
  return '';
}

/** 字段名容错：模型可能写成 script / 口播 / full_script 等 */
function normalizeResult(o) {
  const title = pickString(o, ['title', 'video_title', '标题', '视频标题']);
  const hook = pickString(o, ['hook', 'opening', 'start', '开头', '3秒开头', '三秒开头']);
  const script = pickString(o, ['script', 'full_script', 'fullScript', 'content', 'text', '口播', '完整口播', '完整口播稿']);
  const risk = pickString(o, ['risk_notice', 'riskNotice', 'risk', 'notice', '风险提示', '提醒']);

  let finalScript = script;
  let finalHook = hook;

  if (!finalScript && finalHook) finalScript = finalHook;
  if (!finalHook && finalScript) finalHook = firstSentences(finalScript, 2);
  if (!finalScript) finalScript = title || '';

  // 标题是必须项：模型没给就从句子里压一个短的（不是直接复制第一句话）
  const finalTitle = title || condenseTitle(finalScript);

  return {
    title: finalTitle,
    hook: finalHook,
    script: finalScript,
    // 只有确实有内容才算风险提示，空字符串/null 一律归零
    risk_notice: /^(无|没有|none|null|n\/a|-)$/i.test(risk) ? '' : risk
  };
}

/** 纯文本兜底：整段当口播，前两句当开头 */
function fallbackFromPlainText(text) {
  const clean = String(text)
    .replace(/^\s*```[\s\S]*?\n/, '')
    .replace(/```\s*$/, '')
    .trim();

  if (!clean) {
    return { title: '', hook: '', script: '', risk_notice: '' };
  }
  return {
    title: condenseTitle(clean),
    hook: firstSentences(clean, 2),
    script: clean,
    risk_notice: ''
  };
}

/** 从句子里压一个短标题（不做「复制第一句」这件事，所以先剥掉引导性开头） */
function condenseTitle(script) {
  const s = String(script || '').replace(/\s+/g, ' ').trim();
  if (!s) return '';
  const firstSentence = (s.split(/(?<=[。！？!?；;\n])/)[0] || s).trim();
  if (firstSentence.length >= 8 && firstSentence.length <= 26) return firstSentence.replace(/[。！？!?；;]$/, '');
  return firstSentence.slice(0, 22);
}

/** 只数汉字（标点、数字、字母、空白都不算）—— 和 Prompt 里对模型的说法保持一致 */
function countHanzi(s) {
  const m = String(s || '').match(/[\u4e00-\u9fa5]/g);
  return m ? m.length : 0;
}

function firstSentences(text, n) {
  const parts = String(text)
    .split(/(?<=[。！？!?；;\n])/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.slice(0, n).join('') || String(text).slice(0, 60);
}

module.exports = { chatJSON, LLMError, userFacingMessage, maskSecret, countHanzi };
