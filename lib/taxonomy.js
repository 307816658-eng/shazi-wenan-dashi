'use strict';

/**
 * 选项树门面 —— V0.2
 *
 * 这个文件不再存具体的行业数据，只做三件事：
 *   1. 从静态注册表取行业包
 *   2. 组装给前端的 7 步定义（第二步仍随第一步动态变）
 *   3. 白名单规范化用户提交的选择（含 industry / subType / storeName）
 *
 * 前端不用关心行业：它拿到的 steps 结构和 V0.1 完全一样。
 * 选项 id 全行业统一（boss / guide / tryon / comestore …），只是中文标签不同。
 */

const BASE = require('./base');
const REG = require('./industries');

/* ============================ 通用选项（全行业一致） ============================ */

const TONES = [
  { id: 'chat', label: '自然聊天' },
  { id: 'warm', label: '亲切' },
  { id: 'downearth', label: '接地气' },
  { id: 'humor', label: '有一点幽默' },
  { id: 'pro', label: '专业但不生硬' },
  { id: 'friend', label: '像朋友推荐' },
  { id: 'bossshare', label: '老板真实分享' },
  { id: 'guideshare', label: '店员真实推荐' },
  { id: 'question', label: '先抛一个问题' },
  { id: 'curious', label: '先制造好奇心' },
  { id: 'pain', label: '先讲一个顾客常见痛点' },
  { id: 'auto', label: 'AI 帮我选' }
];

const TONE_MAP = index(TONES);
const VALID_TONE = Object.keys(TONE_MAP);
const VALID_DURATION = Object.keys(BASE.DURATION_WORDS);

/* ============ 兼容 V0.1 的旧导出（取服装包，供旧脚本/回归用） ============ */

const FASHION = REG.get('fashion');
const TOPICS = FASHION.topics;
const SECOND = FASHION.second;
const GOALS = FASHION.goals;
const SPEAKERS = FASHION.speakers;
const DURATIONS = BASE.DURATIONS;
const DEFAULT_DURATION = BASE.DEFAULT_DURATION;
const DURATION_WORDS = BASE.DURATION_WORDS;
const SHORT_WORDS = BASE.SHORT_WORDS;

/* ============================ 工具 ============================ */

function index(list) {
  const m = {};
  for (const o of list) m[o.id] = o.label;
  return m;
}

function findLabel(list, id, fallback) {
  const m = index(list);
  return m[id] || (list[0] && list[0].label) || fallback || '';
}

/* ==================== id → 中文（给 Prompt 用） ==================== */

function topicLabel(id, industry) {
  const p = REG.get(industry);
  return findLabel(p.topics, id, p.topics[0].label);
}

/** 第二步标签：跟着 topic 走，所以要两个 id */
function subjectLabel(topicId, subjectId, industry) {
  const p = REG.get(industry);
  const g = p.second[topicId];
  if (!g) return '';
  const found = g.options.find((o) => o.id === subjectId);
  return found ? found.label : '';
}

function subjectQuestion(topicId, industry) {
  const p = REG.get(industry);
  const g = p.second[topicId];
  return g ? g.question : '今天主要拍什么？';
}

function goalLabel(id, industry) {
  return id === 'auto' ? 'AI 帮我选' : findLabel(REG.get(industry).goals, id);
}
function speakerLabel(id, industry) {
  return id === 'auto' ? 'AI 帮我选' : findLabel(REG.get(industry).speakers, id);
}
function toneLabel(id) {
  return id === 'auto' ? 'AI 帮我选' : (TONE_MAP[id] || TONES[0].label);
}
function subTypeLabel(subTypeId, industry) {
  const p = REG.get(industry);
  const f = p.subTypes.find((s) => s.id === subTypeId);
  return f ? f.label : '';
}

/* ==================== 给前端的完整结构 ==================== */

/** 前端渲染用：六步定义（第七步是可选的自由输入，前端固定渲染） */
function clientSteps(industry) {
  const p = REG.get(industry);
  return BASE.STEP_META.map((m) => {
    const step = { key: m.key, n: m.n, kind: 'single', question: m.question, hint: m.hint };
    switch (m.key) {
      case 'topic':
        step.options = p.topics.map((o) => ({ id: o.id, label: o.label, emoji: o.emoji || '' }));
        break;
      case 'subject':
        step.dynamic = true;
        step.optionsByTopic = p.second;
        break;
      case 'goal':
        step.options = p.goals;
        break;
      case 'speaker':
        step.options = p.speakers;
        break;
      case 'tone':
        step.options = TONES;
        break;
      case 'duration':
        step.default = BASE.DEFAULT_DURATION;
        step.options = BASE.DURATIONS;
        break;
      default:
        break;
    }
    return step;
  });
}

/* ==================== 规范化 + 白名单 ==================== */

/**
 * 把前端提交的选择规范化。
 * 任何非法值都不报错，静默回落到安全默认值 —— 用户不该看到技术报错。
 *
 * @param {object} raw       前端提交的 selection
 * @param {string} industry  可选，来自 URL query（options 接口用）
 */
function normalizeSelection(raw, industry) {
  const r = raw && typeof raw === 'object' ? raw : {};

  const ind = REG.has(r.industry) ? r.industry
    : (REG.has(industry) ? industry : REG.DEFAULT_ID);
  const p = REG.get(ind);

  const subType = REG.hasSubType(p, r.subType) ? String(r.subType || '') : '';

  // 店名：完全可选，只留一行纯文本，最长 20 字
  const storeName = String(r.storeName || '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, 20);

  const topicIds = Object.keys(index(p.topics));
  const topic = topicIds.includes(r.topic) ? r.topic : 'auto';

  const group = p.second[topic];
  let subject = 'auto';
  if (group && group.options.some((o) => o.id === r.subject)) subject = r.subject;

  const goalIds = Object.keys(index(p.goals));
  const speakerIds = Object.keys(index(p.speakers));

  return {
    industry: ind,
    subType,
    storeName,
    topic,
    subject,
    goal: goalIds.includes(r.goal) ? r.goal : 'auto',
    speaker: speakerIds.includes(r.speaker) ? r.speaker : 'auto',
    tone: VALID_TONE.includes(r.tone) ? r.tone : 'auto',
    duration: VALID_DURATION.includes(String(r.duration)) ? String(r.duration) : BASE.DEFAULT_DURATION,
    extra: String(r.extra || '').trim().slice(0, 600)
  };
}

module.exports = {
  // 兼容 V0.1 的旧导出
  TOPICS, SECOND, GOALS, SPEAKERS, TONES, DURATIONS, DEFAULT_DURATION,
  DURATION_WORDS, SHORT_WORDS,
  // V0.2 新增
  listIndustries: REG.list,
  getPack: REG.get,
  hasIndustry: REG.has,
  DEFAULT_INDUSTRY: REG.DEFAULT_ID,
  clientSteps, normalizeSelection,
  // label 函数（全部支持 industry）
  topicLabel, subjectLabel, subjectQuestion, goalLabel, speakerLabel, toneLabel, subTypeLabel
};
