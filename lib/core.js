'use strict';

/**
 * 业务核心 —— 本地 Node 服务和 Cloudflare Pages Functions 共用这一份。
 *
 * 设计约束（很重要）：
 *   这个文件**不能 require 任何 Node 内置模块**（fs / path / os 都不行），
 *   因为 Cloudflare Workers 运行时没有它们。
 *
 * V0.2 改动：
 *   - handleOptions(query) 按行业下发选项，同时给首页行业卡片
 *   - handleGenerate 统一使用规范化后的 sel（V0.1 里生成用原始值、字数校正用规范化值，不一致）
 *   - 行业 / 业态 / 店名随 selection 一起走，二次操作不会串回默认行业
 */

const { chatJSON, LLMError, userFacingMessage, countHanzi } = require('./llm');
const prompts = require('./prompts');
const T = require('./taxonomy');
const { findBannedWords } = require('./base');

const ACTIONS = ['generate', 'regenerate', 'hook', 'myvoice', 'downearth', 'shorter'];

/* ---------------------------- 配置 ---------------------------- */

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

function distTo(n, range) {
  if (n < range[0]) return range[0] - n;
  if (n > range[1]) return n - range[1];
  return 0;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 去空白比较：判断两版正文是不是一字不差 */
function sameScript(a, b) {
  return String(a || '').replace(/\s/g, '') === String(b || '').replace(/\s/g, '');
}

/**
 * 保证 hook 一定出现在 script 里。
 * 字数校正只重写了正文，很容易让「3 秒开头」和正文脱节。
 */
function syncHook(result) {
  const script = String(result.script || '');
  const hook = String(result.hook || '').trim();
  if (!script) return result;

  const probe = hook.replace(/\s/g, '').slice(0, 10);
  if (probe && script.replace(/\s/g, '').indexOf(probe) >= 0) return result;

  const parts = script.split(/(?<=[。！？!?；;\n])/).map((s) => s.trim()).filter(Boolean);
  const fallback = parts.slice(0, 2).join('') || script.slice(0, 30);
  console.log(`[${nowStr()}] ~ 开头与正文脱节，已用正文前两句同步`);
  return Object.assign({}, result, { hook: fallback });
}

/* ---------------------------- 选项树 ---------------------------- */

/**
 * @param {object} query 形如 { industry: 'food' }，来自 URL 查询串
 * 只下发当前行业的选项，不把 4 个行业全量塞给前端。
 */
function handleOptions(query) {
  const q = query && typeof query === 'object' ? query : {};
  const industry = T.hasIndustry(q.industry) ? q.industry : T.DEFAULT_INDUSTRY;
  const pack = T.getPack(industry);
  return {
    status: 200,
    body: {
      ok: true,
      version: '0.2',
      industries: T.listIndustries(),
      industry,
      industryLabel: pack.label,
      subTypes: pack.subTypes.map((s) => ({ id: s.id, label: s.label })),
      steps: T.clientSteps(industry),
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
      version: '0.2',
      configured: cfg.configured,
      missing: cfg.missing,
      model: cfg.MODEL_NAME || null,
      industries: T.listIndustries().map((x) => x.id),
      apiHost: (() => { try { return new URL(cfg.API_URL).host; } catch (e) { return null; } })(),
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

  if (action !== 'generate' && (!previous || !previous.script)) {
    return {
      status: 400,
      body: { ok: false, error: { message: '上一版内容丢了，点一下「重新填写」再来一次吧。', kind: 'input' } }
    };
  }

  // 统一规范化一次，后面三处（生成 / 二次操作 / 字数校正）都用同一份 sel
  const sel = T.normalizeSelection(selection);
  const t0 = Date.now();
  console.log(
    `[${nowStr()}] -> action=${action}  industry=${sel.industry}/${sel.subType || '-'}  ` +
    `store=${sel.storeName ? '有' : '无'}  topic=${sel.topic}/${sel.subject}  goal=${sel.goal}  ` +
    `speaker=${sel.speaker}  tone=${sel.tone}  ${sel.duration}s  extra=${sel.extra ? sel.extra.length + '字' : '无'}`
  );

  try {
    const messages = action === 'generate'
      ? prompts.buildGenerateMessages(sel)
      : prompts.buildRefineMessages(action, sel, previous);

    let result = await chatJSON(cfg, messages, action, { timeoutMs: 90000 });

    if (!result.script) {
      throw new LLMError('format', '模型没有返回口播内容');
    }

    /* ---- 二次操作偷懒兜底：模型偶尔原样返回，自动再要一次 ---- */
    if (action !== 'generate' && previous && previous.script && sameScript(result.script, previous.script)) {
      console.log(`[${nowStr()}] ~ 二次操作原样返回，自动重试一次`);
      try {
        const again = await chatJSON(cfg, messages, 'regenerate', { timeoutMs: 90000 });
        if (again.script && !sameScript(again.script, previous.script)) {
          result = again;
          console.log(`[${nowStr()}] ~ 重试拿到新内容`);
        }
      } catch (e) { /* 重试失败就保留原稿，用户可以再点一次 */ }
    }

    /* ---- 字数校正：Prompt 管不住精度，这里兜一道 ---- */
    const range = prompts.DURATION_RANGE[sel.duration];
    const charsBefore = countHanzi(result.script);
    let charsAfter = charsBefore;
    let corrected = false;
    let round = 0;

    while (range && round < 3 && distTo(charsAfter, range) > prompts.LENGTH_TOLERANCE) {
      round += 1;
      console.log(`[${nowStr()}] ~ 第 ${round} 次校正：当前 ${charsAfter} 字，目标 ${range[0]}~${range[1]}`);
      try {
        const fixed = await chatJSON(
          cfg,
          prompts.buildLengthFixMessages(sel, result, range),
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
        if (e.kind === 'ratelimit' && round < 3) {
          console.log(`[${nowStr()}] ~ 校正撞限流，等 12s 后再试`);
          await sleep(12000);
          continue;
        }
        console.log(`[${nowStr()}] ~ 校正失败：${e.kind || e.message}`);
        break;
      }
    }

    /* ---- 违规词兜底：Prompt 管不住概率，这里扫一遍，扫到就定向改写 ---- */
    let safeFixed = false;
    let safeRound = 0;
    let hits = findBannedWords((result.title || '') + '\n' + (result.hook || '') + '\n' + (result.script || ''));

    while (hits.length && safeRound < 2) {
      safeRound += 1;
      console.log(`[${nowStr()}] ~ 第 ${safeRound} 次安全改写：发现违规词 ${hits.join('、')}`);
      try {
        const fixed = await chatJSON(
          cfg,
          prompts.buildSafeFixMessages(sel, result, hits),
          'safefix',
          { timeoutMs: 90000 }
        );
        const hitsAfter = findBannedWords((fixed.title || '') + '\n' + (fixed.hook || '') + '\n' + (fixed.script || ''));
        if (fixed.script && hitsAfter.length < hits.length) {
          result = fixed;
          safeFixed = true;
          hits = hitsAfter;
          console.log(`[${nowStr()}] ~ 安全改写生效，剩余违规词 ${hits.length} 个`);
        } else {
          console.log(`[${nowStr()}] ~ 安全改写后仍有 ${hitsAfter.length} 个，停止改写`);
          break;
        }
      } catch (e) {
        if (e.kind === 'ratelimit' && safeRound < 2) {
          console.log(`[${nowStr()}] ~ 安全改写撞限流，等 12s 后再试`);
          await sleep(12000);
          continue;
        }
        console.log(`[${nowStr()}] ~ 安全改写失败：${e.kind || e.message}`);
        break;
      }
    }

    /* ---- 安全改写可能带偏字数，再校一次 ---- */
    if (safeFixed && range) {
      const c2 = countHanzi(result.script);
      if (distTo(c2, range) > prompts.LENGTH_TOLERANCE) {
        console.log(`[${nowStr()}] ~ 安全改写后字数 ${c2}，再校正一次`);
        try {
          const fixed = await chatJSON(
            cfg,
            prompts.buildLengthFixMessages(sel, result, range),
            'lengthfix',
            { timeoutMs: 90000 }
          );
          const c3 = countHanzi(fixed.script);
          if (fixed.script && distTo(c3, range) < distTo(c2, range)) {
            result = fixed;
            charsAfter = c3;
            console.log(`[${nowStr()}] ~ 复校生效：${c2} 字 -> ${c3} 字`);
          }
        } catch (e) { /* 字数略有偏差可以接受，不再折腾 */ }
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
          industry: sel.industry,
          industry_label: T.getPack(sel.industry).label,
          model: result.model,
          ms,
          tokens: (result.usage && result.usage.total_tokens) || null,
          chars: countHanzi(result.script),
          corrected,
          safe_fixed: safeFixed,
          chars_before: charsBefore
        }
      }
    };
  } catch (e) {
    const kind = e instanceof LLMError ? e.kind : 'unknown';
    console.error(`[错误] action=${action} kind=${kind} :: ${e && e.message ? e.message : e}`);
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
