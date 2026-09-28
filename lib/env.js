'use strict';

/**
 * 极简 .env 解析器（零依赖）
 *
 * 为什么自己写而不装 dotenv？
 * —— 本机 npm 包装脚本会被企业安全软件拦截，能不装包就不装包。
 *    这个解析器只处理 KEY=VALUE、# 注释、引号包裹三种情况，完全够用。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function parseEnvText(text) {
  const out = {};
  const lines = String(text).split(/\r?\n/);
  for (const line of lines) {
    const s = line.trim();
    if (!s) continue;
    if (s.startsWith('#')) continue;
    const eq = s.indexOf('=');
    if (eq === -1) continue;
    const key = s.slice(0, eq).trim();
    let val = s.slice(eq + 1).trim();
    if (val.length >= 2) {
      const first = val[0];
      const last = val[val.length - 1];
      if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
        val = val.slice(1, -1);
      }
    }
    if (key) out[key] = val;
  }
  return out;
}

/**
 * 加载配置。优先级：进程环境变量 > .env 文件
 */
function loadConfig() {
  const envPath = path.join(ROOT, '.env');
  let fileEnv = {};
  if (fs.existsSync(envPath)) {
    try {
      fileEnv = parseEnvText(fs.readFileSync(envPath, 'utf8'));
    } catch (e) {
      console.warn('[env] 读取 .env 失败：' + e.message);
    }
  }

  const pick = (k, def) => {
    const v = process.env[k] !== undefined && process.env[k] !== '' ? process.env[k] : fileEnv[k];
    return (v === undefined || v === null || v === '') ? def : v;
  };

  const cfg = {
    API_KEY: pick('API_KEY', ''),
    API_URL: pick('API_URL', ''),
    MODEL_NAME: pick('MODEL_NAME', ''),
    PORT: parseInt(pick('PORT', '3100'), 10) || 3100
  };

  cfg.configured = !!(cfg.API_KEY && cfg.API_URL && cfg.MODEL_NAME);
  cfg.missing = [];
  if (!cfg.API_KEY) cfg.missing.push('API_KEY');
  if (!cfg.API_URL) cfg.missing.push('API_URL');
  if (!cfg.MODEL_NAME) cfg.missing.push('MODEL_NAME');

  return cfg;
}

/** 把 URL 规范成 .../v1/chat/completions */
function chatEndpoint(baseUrl) {
  let u = String(baseUrl || '').trim().replace(/\/+$/, '');
  if (/\/chat\/completions$/.test(u)) return u;
  if (/\/v1$/.test(u)) return u + '/chat/completions';
  return u + '/v1/chat/completions';
}

/**
 * 密钥脱敏：任何要写进日志/返回体的字符串都先过一遍。
 * 双保险，避免 Key 意外出现在日志里。
 */
function maskSecret(text) {
  let s = String(text == null ? '' : text);
  // 全部遮蔽，连首尾字符都不留 —— 日志里不应该出现密钥的任何部分
  s = s.replace(/sk-[A-Za-z0-9_\-]{6,}/g, 'sk-****');
  s = s.replace(/(Bearer\s+)[A-Za-z0-9_\-\.]{6,}/gi, '$1****');
  return s;
}

module.exports = { loadConfig, chatEndpoint, maskSecret, parseEnvText, ROOT };
