'use strict';

/**
 * 业务核心 —— 本地 Node 服务和 Cloudflare Pages Functions 共用这一份。
 *
 * 设计约束（很重要）：
 *   这个文件**不能 require 任何 Node 内置模块**（fs / path / os 都不行），
 *   因为 Cloudflare Workers 运行时没有它们。
 *   所以这里只有纯逻辑：读配置 → 组装 Prompt → 调大模型 → 字数校正 → 返回结构化结果。
 *   谁调它不重要：server.js 用 Node 的 http，Pages Functions 用 Workers 的 fetch 上下文。
 *
 * 对外只暴露三个函数，统一返回 { status, body }：
 *   handleOptions()            → 选项树
 *   handleHealth(env)          → 配置状态（绝不回密钥）
 *   handleGenerate(env, body)  → 生成 / 二次操作
 */

const { chatJSON, LLMError, userFacingMessage, countHanzi } = require('./llm');
const prompts = require('./prompts');
const T = require('./taxonomy');

const ACTIONS = ['generate', 'regenerate', 'hook', 'myvoice', 'downearth', 'shorter'];

/* ---------------------------- 配置 ---------------------------- */

/**
 * 从任意「环境对象」里读配置。
 *   本地：server.js 传进来的是 lib/env.js 解析好的对象（键名一致）
 *   线上：Pages Functions 传进来的是 context.env（Cloudflare 后台配的 Secret）
 * 两种来源的键名保持完全一致，所以这里不需要区分。
 */
function readConfig(env) {
  const e = env || {};
  const pick = (k) => (e[k] === undefined || e[k] === null || e[k] === '') ? '' : String(e[k]).trim();

  const cfg = {
    API_KEY: pick('API_KEY'),
    API_URL: pick('API_URL'),
    MODEL_NAME: pick('MODEL_NAME')
  };
  cfg.configured = !!(cfg.API_KEY && cfg.API_URL && cfg.MODEL_NAME);
  cfg.missing = [];
  if (!cfg.API_KEY) cfg.missing.push('API_KEY');
  if (!cfg.API_URL) cfg.missing.push('API_URL');
  if (!cfg.MODEL_NAME) cfg.missing.push('MODEL_NAME');
  return cfg;
}

function nowStr() {
  return new Date().toLocaleTimeString('zh-CN', { hour12: false });
}

/* ---------------------------- 工具 ---------------------------- */

/** 字数离目标区间的距离：落在区间内就是 0 */
function distTo(n, range) {
  if (n < range[0]) return range[0] - n;
  if (n > range[1]) return n - range[1];
  return 0;
}

/**
 * 保证 hook 一定出现在 script 里。
 * 字数校正只重写了正文，很容易让「3 秒开头」和正文脱节 ——
 * 用户看到的两块内容必须是同一份稿子，否则照着念会卡壳。
 */
function syncHook(result) {
  const script = String(result.script || '');
  const hook = String(result.hook || '').trim();
  if (!script) return result;

  // 忽略空白比较 —— 正文里的换行会把开头那句话打断，不能直接 indexOf
  const probe = hook.replace(/\s/g, '').slice(0, 10);
  if (probe && script.replace(/\s/g, '').indexOf(probe) >= 0) return result;

  const parts = script.split(/(?<=[。！？!?；;\n])/).map((s) => s.trim()).filter(Boolean);
  const fallback = parts.slice(0, 2).join('') || script.slice(0, 30);
  console.log(`[${nowStr()}] ~ 开头与正文脱节，已用正文前两句同步`);
  return Object.assign({}, result, { hook: fallback });
}

/* ---------------------------- 选项树 ---------------------------- */

function handleOptions() {
  return {
    status: 200,
    body: {
      ok: true,
      brand: prompts.BRAND,
      slogan: prompts.BRAND_SLOGAN,
      steps: T.clientSteps(),
      defaultDuration: T.DEFAULT_DURATION
    }
  };
}

/* ---------------------------- 健康检查 ---------------------------- */

function handleHealth(env) {
  const cfg = readConfig(env);
  return {
    status: 200,
    body: {
      ok: true,
      configured: cfg.configured,
      missing: cfg.missing,
      model: cfg.MODEL_NAME || null,
      // 只暴露域名，不暴露密钥；域名本身不是秘密
      apiHost: (() => { try { return new URL(cfg.API_URL).host; } catch (e) { return null; } })(),
      // 只是方便排障时一眼看出「到底是哪个环境在跑」
      runtime: (typeof caches !== 'undefined' && typeof WebSocketPair !== 'undefined') ? 'workers' : 'node',
      time: new Date().toISOString()
    }
  };
}

/* ---------------------------- 生成 ---------------------------- */

async function handleGenerate(env, payload) {
  const cfg = readConfig(env);

  if (!cfg.configured) {
    return {
      status: 503,
      body: { ok: false, error: { message: userFacingMessage('config'), kind: 'config', missing: cfg.missing } }
    };
  }

  const p = payload && typeof payload === 'object' ? payload : {};
  const action = ACTIONS.includes(p.action) ? p.action : 'generate';
  const selection = p.selection || {};
  const previous = p.previous || null;

  // 二次操作必须有上一版内容，否则没法改
  if (action !== 'generate' && (!previous || !previous.script)) {
    return {
      status: 400,
      body: { ok: false, error: { message: '上一版内容丢了，点一下「重新填写」再来一次吧。', kind: 'input' } }
    };
  }

  const sel = T.normalizeSelection(selection);
  const t0 = Date.now();
  console.log(
    `[${nowStr()}] -> action=${action}  topic=${sel.topic}/${sel.subject}  goal=${sel.goal}  ` +
    `speaker=${sel.speaker}  tone=${sel.tone}  ${sel.duration}s  extra=${sel.extra ? sel.extra.length + '字' : '无'}`
  );

  try {
    const messages = action === 'generate'
      ? prompts.buildGenerateMessages(selection)
      : prompts.buildRefineMessages(action, selection, previous);

    let result = await chatJSON(cfg, messages, action, { timeoutMs: 90000 });

    if (!result.script) {
      throw new LLMError('format', '模型没有返回口播内容');
    }

    /* ---- 字数校正：Prompt 管不住精度，这里兜一道 ----
       实测单靠 Prompt 约束字数只能做到 ±30% —— 模型天然倾向「把话说完整」，
       而不是「说到第 13 句就停」。所以自己数汉字，明显跑偏就定向改写。
       最多两轮；一旦没有改善就立刻停，不白烧额度。 */
    const range = prompts.DURATION_RANGE[sel.duration];
    const charsBefore = countHanzi(result.script);
    let charsAfter = charsBefore;
    let corrected = false;
    let round = 0;

    while (range && round < 2 && distTo(charsAfter, range) > prompts.LENGTH_TOLERANCE) {
      round += 1;
      console.log(`[${nowStr()}] ~ 第 ${round} 次校正：当前 ${charsAfter} 字，目标 ${range[0]}~${range[1]}`);
      try {
        const fixed = await chatJSON(
          cfg,
          prompts.buildLengthFixMessages(selection, result, range),
          'lengthfix',
          { timeoutMs: 90000 }
        );
        const c1 = countHanzi(fixed.script);
        if (fixed.script && distTo(c1, range) < distTo(charsAfter, range)) {
          result = fixed;
          corrected = true;
          console.log(`[${nowStr()}] ~ 校正生效：${charsAfter} 字 -> ${c1} 字`);
          charsAfter = c1;
        } else {
          console.log(`[${nowStr()}] ~ 校正后 ${c1} 字，没有更好，停止校正`);
          break;
        }
      } catch (e) {
        console.log(`[${nowStr()}] ~ 校正失败：${e.kind || e.message}`);
        break;
      }
    }

    result = syncHook(result);

    const ms = Date.now() - t0;
    console.log(
      `[${nowStr()}] <- 成功  action=${action}  ${ms}ms  ` +
      `tokens=${(result.usage && result.usage.total_tokens) || '?'}  ` +
      `script=${countHanzi(result.script)}汉字${corrected ? '（已校正）' : ''}`
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          title: result.title,
          hook: result.hook,
          script: result.script,
          risk_notice: result.risk_notice || ''
        },
        meta: {
          action,
          action_label: prompts.ACTION_LABEL[action] || action,
          model: result.model,
          ms,
          tokens: (result.usage && result.usage.total_tokens) || null,
          chars: countHanzi(result.script),
          corrected,
          chars_before: charsBefore
        }
      }
    };
  } catch (e) {
    const kind = e instanceof LLMError ? e.kind : 'unknown';
    console.error(`[错误] action=${action} kind=${kind} :: ${e && e.message ? e.message : e}`);
    // 429 原样透出 —— 让前端知道是「请求太频繁」，不是服务坏了
    const status = kind === 'config' ? 503
      : kind === 'timeout' ? 504
        : kind === 'ratelimit' ? 429
          : 502;
    return {
      status,
      body: { ok: false, error: { message: userFacingMessage(kind), kind } }
    };
  }
}

module.exports = {
  ACTIONS,
  readConfig,
  handleOptions,
  handleHealth,
  handleGenerate
};
