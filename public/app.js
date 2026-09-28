'use strict';

/* ============================================================
   傻子文案大师 V0.1 —— 前端交互
   这个文件里没有任何密钥，所有 AI 调用都走后端 /api/generate
   ============================================================ */

const API_OPTIONS = '/api/options';
const API_GENERATE = '/api/generate';

/** 前端请求超时：上游实测会慢到 40 秒以上，这里给到 120 秒 */
const TIMEOUT_MS = 120000;

/** 点选后停留多久再自动进下一步（让用户看见选中态） */
const AUTO_ADVANCE_MS = 320;

const ACTION_LOADING = {
  generate: '正在帮你写这条视频…',
  regenerate: '正在换一版…',
  hook: '正在把开头改得更抓人…',
  myvoice: '正在改得更像你说话…',
  downearth: '正在改得更接地气…',
  shorter: '正在帮你压缩…'
};

const state = {
  steps: [],          // 从后端拿到的六步定义
  sel: blankSelection(),
  cur: 0,             // 当前步索引，0..steps.length（最后一个是「特别要求」）
  result: null,
  meta: null,
  loading: false,
  advanceTimer: null
};

function blankSelection() {
  return { topic: '', subject: '', goal: '', speaker: '', tone: '', duration: '45', extra: '' };
}

/* ------------------------------ DOM ------------------------------ */

const $ = (id) => document.getElementById(id);

const el = {
  homeView: $('homeView'),
  wizardView: $('wizardView'),
  resultView: $('resultView'),
  startBtn: $('startBtn'),
  backBtn: $('backBtn'),
  stepLabel: $('stepLabel'),
  progBar: $('progBar'),
  stepHost: $('stepHost'),
  stepActions: $('stepActions'),
  overlay: $('overlay'),
  overlayText: $('overlayText'),
  toast: $('toast'),
  themeToggle: $('themeToggle'),
  restartBtn: $('restartBtn'),
  againBtn: $('againBtn'),
  copyAllBtn: $('copyAllBtn'),
  resultMeta: $('resultMeta'),
  outTitle: $('outTitle'),
  outHook: $('outHook'),
  outScript: $('outScript'),
  outRisk: $('outRisk'),
  riskCard: $('riskCard'),
  homeNote: $('homeNote')
};

/* ---------------------------- 小工具 ---------------------------- */

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

let toastTimer = null;
function toast(msg) {
  el.toast.textContent = msg;
  el.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove('show'), 2400);
}

function showOverlay(text) {
  el.overlayText.textContent = text || ACTION_LOADING.generate;
  el.overlay.hidden = false;
}
function hideOverlay() {
  el.overlay.hidden = true;
}

/**
 * 复制：优先 Clipboard API；局域网 http 下它不可用，
 * 必须退回 execCommand + 临时 textarea（手机上唯一可行的方案）。
 */
async function copyText(text) {
  const t = String(text || '');
  if (!t.trim()) return false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(t);
      return true;
    } catch (e) { /* 落到下面的兜底 */ }
  }

  try {
    const ta = document.createElement('textarea');
    ta.value = t;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.left = '0';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    if (typeof ta.setSelectionRange === 'function') ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (e) {
    return false;
  }
}

/** 显式超时的 fetch —— 浏览器 fetch 默认不超时，不给会一直转圈 */
async function fetchWithTimeout(url, opts, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, Object.assign({}, opts, { signal: ctrl.signal }));
  } finally {
    clearTimeout(timer);
  }
}

/* ---------------------------- 视图切换 ---------------------------- */

function goHome() {
  el.homeView.hidden = false;
  el.wizardView.hidden = true;
  el.resultView.hidden = true;
  window.scrollTo(0, 0);
}

function goWizard() {
  el.homeView.hidden = true;
  el.wizardView.hidden = false;
  el.resultView.hidden = true;
  renderStep();
}

function goResult() {
  el.homeView.hidden = true;
  el.wizardView.hidden = true;
  el.resultView.hidden = false;
  window.scrollTo(0, 0);
}

/* ---------------------------- 向导渲染 ---------------------------- */

const TOTAL = () => state.steps.length + 1;

/** 第 index 步（0 起）：前 steps.length 步来自后端，最后一步是「特别要求」 */
function renderStep() {
  const total = TOTAL();
  const i = state.cur;

  el.stepLabel.textContent = '第 ' + (i + 1) + ' 步 / 共 ' + total + ' 步';
  el.progBar.style.width = Math.round(((i + 1) / total) * 100) + '%';
  el.backBtn.style.visibility = i === 0 ? 'hidden' : 'visible';

  if (i < state.steps.length) {
    renderChoiceStep(state.steps[i]);
  } else {
    renderExtraStep();
  }

  // 每次换步都把页面拉回顶部，手机上好找
  window.scrollTo(0, 0);
}

function renderChoiceStep(step) {
  const key = step.key;
  const isDynamic = !!step.dynamic;

  let question = step.question;
  let options = step.options || [];

  if (isDynamic) {
    const group = (step.optionsByTopic || {})[state.sel.topic];
    if (group) {
      question = group.question || question;
      options = group.options || [];
    } else {
      options = [];
    }
  }

  const current = state.sel[key] || (step.default || '');
  const wide = options.some((o) => String(o.label).length > 8) ? ' data-wide="1"' : '';
  const many = options.length >= 10 ? ' data-count="more"' : '';

  const optsHtml = options.map((o) => {
    const checked = String(current) === String(o.id) ? ' checked' : '';
    const emoji = o.emoji ? '<span class="opt-emoji">' + o.emoji + '</span>' : '';
    const auto = o.id === 'auto' ? ' data-auto="1"' : '';
    return '<label class="opt"' + auto + '>' +
      '<input type="radio" name="' + key + '" value="' + escapeHtml(o.id) + '"' + checked + '>' +
      emoji + '<span>' + escapeHtml(o.label) + '</span>' +
      '</label>';
  }).join('');

  el.stepHost.innerHTML =
    '<div class="card step-card">' +
      '<div class="step-head">' +
        '<h2 class="step-q">' + escapeHtml(question) + '</h2>' +
        (step.hint ? '<p class="step-hint">' + escapeHtml(step.hint) + '</p>' : '') +
      '</div>' +
      '<div class="options"' + wide + many + '>' + optsHtml + '</div>' +
    '</div>';

  // 绑定点选。
  // 注意：必须绑在 label 的 click 上，不能只绑 radio 的 change ——
  // 「视频多长」这一步有默认值（45 秒），用户点一下那张已经选中的卡片时，
  // radio 不会触发 change 事件，页面就会卡在这一步、点什么都不动。
  el.stepHost.querySelectorAll('.opt').forEach((lab) => {
    lab.addEventListener('click', (ev) => {
      ev.preventDefault();
      const input = lab.querySelector('input');
      if (!input) return;
      el.stepHost.querySelectorAll('input[name="' + key + '"]').forEach((i) => {
        if (i !== input) i.checked = false;
      });
      input.checked = true;
      chooseValue(key, input.value);
    });
  });

  renderNavButtons(!!current);
}

function renderExtraStep() {
  const v = state.sel.extra || '';

  el.stepHost.innerHTML =
    '<div class="card step-card">' +
      '<div class="step-head">' +
        '<h2 class="step-q">还有什么想特别告诉 AI 的？</h2>' +
        '<p class="step-hint">没有也没关系，有特殊情况再告诉我。</p>' +
      '</div>' +
      '<textarea id="extraInput" maxlength="600" ' +
        'placeholder="例如：&#10;这次一定要提到我们店刚开业。&#10;老板本人出镜。&#10;这条不要太像广告。&#10;这个活动价格不能公开。"></textarea>' +
      '<div class="qa-chips">' +
        '<span class="qa-label">懒得打字？点一下就直接填进去：</span>' +
        '<button class="chip-add" type="button" data-fill="这次一定要提到我们店刚开业。">提到新店开业</button>' +
        '<button class="chip-add" type="button" data-fill="老板本人出镜。">老板本人出镜</button>' +
        '<button class="chip-add" type="button" data-fill="这条不要太像广告。">不要太像广告</button>' +
        '<button class="chip-add" type="button" data-fill="活动价格不能公开。">价格不能公开</button>' +
      '</div>' +
    '</div>';

  const ta = $('extraInput');
  if (ta) {
    ta.value = v;
    ta.addEventListener('input', () => {
      state.sel.extra = ta.value;
      renderNavButtons(true); // 最后一步永远可以生成
    });
  }

  el.stepHost.querySelectorAll('.chip-add').forEach((btn) => {
    btn.addEventListener('click', () => {
      const fill = btn.getAttribute('data-fill') || '';
      const box = $('extraInput');
      if (!box) return;
      box.value = box.value ? (box.value.replace(/\s+$/, '') + '\n' + fill) : fill;
      state.sel.extra = box.value;
      box.focus();
    });
  });

  renderNavButtons(true);
}

/** 底部按钮：有值时给「下一步」，最后一步给「生成」 */
function renderNavButtons(canNext) {
  const isLast = state.cur >= state.steps.length;

  if (isLast) {
    el.stepActions.innerHTML =
      '<button class="primary big" id="generateBtn" type="button">' +
        '<span class="btn-label">生成我的文案</span>' +
        '<span class="btn-loading" hidden><span class="spinner"></span><span>正在帮你写…</span></span>' +
      '</button>' +
      '<p class="bar-note">AI 会按你选的这些，写一条能直接拍的口播稿</p>';
    $('generateBtn').addEventListener('click', () => runGenerate('generate'));
    return;
  }

  if (canNext) {
    el.stepActions.innerHTML =
      '<button class="primary big" id="nextBtn" type="button">下一步 →</button>';
    $('nextBtn').addEventListener('click', next);
  } else {
    el.stepActions.innerHTML = '';
  }
}

function chooseValue(key, value) {
  // 第一步改了，第二步的选择就失效了，要清掉
  if (key === 'topic' && state.sel.topic !== value) {
    state.sel.subject = '';
  }
  state.sel[key] = value;

  clearTimeout(state.advanceTimer);
  state.advanceTimer = setTimeout(() => {
    // 下一步不存在（已是最后一步）就不动
    if (state.cur < TOTAL() - 1) next();
    else renderStep();
  }, AUTO_ADVANCE_MS);
}

function next() {
  if (state.cur < TOTAL() - 1) {
    state.cur += 1;
    renderStep();
  }
}

function back() {
  if (state.cur > 0) {
    state.cur -= 1;
    renderStep();
  }
}

/* ---------------------------- 生成 ---------------------------- */

async function runGenerate(action) {
  if (state.loading) return;              // 双保险：逻辑层拦截重复点击
  if (action !== 'generate' && !state.result) return;

  state.loading = true;
  showOverlay(ACTION_LOADING[action] || ACTION_LOADING.generate);
  setActionsDisabled(true);

  const body = { action, selection: state.sel };
  if (action !== 'generate') body.previous = state.result;

  try {
    const res = await fetchWithTimeout(API_GENERATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }, TIMEOUT_MS);

    const data = await res.json().catch(() => null);

    if (!res.ok || !data || !data.ok) {
      const msg = (data && data.error && data.error.message) || 'AI 暂时没连上，缓一下再点一次。';
      toast(msg);
      return;
    }

    state.result = data.data;
    state.meta = data.meta || null;
    renderResult();
    goResult();
  } catch (e) {
    // 网络层错误（含超时 AbortError）—— 绝不能让页面白屏或卡死
    if (e && e.name === 'AbortError') {
      toast('AI 想得有点久，这次先算了，再点一次试试。');
    } else {
      toast('网络好像断了，检查一下再试。');
    }
  } finally {
    state.loading = false;
    hideOverlay();
    setActionsDisabled(false);
  }
}

function setActionsDisabled(disabled) {
  document.querySelectorAll('.act').forEach((b) => { b.disabled = disabled; });
  const g = $('generateBtn');
  if (g) g.disabled = disabled;
  const c = el.copyAllBtn;
  if (c) c.disabled = disabled;
}

function renderResult() {
  const r = state.result || {};
  el.outTitle.textContent = r.title || '';
  el.outHook.textContent = r.hook || '';
  el.outScript.textContent = r.script || '';

  if (r.risk_notice && r.risk_notice.trim()) {
    el.outRisk.textContent = r.risk_notice.trim();
    el.riskCard.hidden = false;
  } else {
    el.riskCard.hidden = true;
  }

  const bits = [];
  if (state.meta && state.meta.model) bits.push('由 AI 生成');
  if (r.script) bits.push(r.script.replace(/\s/g, '').length + ' 字');
  if (state.meta && state.meta.ms) bits.push((state.meta.ms / 1000).toFixed(1) + ' 秒');
  el.resultMeta.textContent = bits.join(' · ');

  window.scrollTo(0, 0);
}

/* ---------------------------- 事件绑定 ---------------------------- */

function bindEvents() {
  el.startBtn.addEventListener('click', goWizard);
  el.backBtn.addEventListener('click', back);
  el.restartBtn.addEventListener('click', restart);
  el.againBtn.addEventListener('click', restart);
  el.copyAllBtn.addEventListener('click', async () => {
    const ok = await copyText(el.outScript.textContent);
    toast(ok ? '口播稿已复制，去拍吧' : '复制没成功，长按选中手动复制也行');
  });

  // 各个小「复制」按钮
  document.querySelectorAll('.mini-copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const target = $(btn.getAttribute('data-copy'));
      const ok = await copyText(target ? target.textContent : '');
      toast(ok ? '已复制' : '复制没成功，长按选中手动复制也行');
    });
  });

  // 五个二次操作 —— 每一次都是真实重新调用 AI
  document.querySelectorAll('.act[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => runGenerate(btn.getAttribute('data-action')));
  });

  // 主题
  el.themeToggle.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', cur);
    try { localStorage.setItem('swd-theme', cur); } catch (e) { /* 忽略 */ }
  });
}

function restart() {
  clearTimeout(state.advanceTimer);
  state.sel = blankSelection();
  state.cur = 0;
  state.result = null;
  state.meta = null;
  goWizard();
}

/* ---------------------------- 启动 ---------------------------- */

async function init() {
  // 主题偏好
  try {
    const saved = localStorage.getItem('swd-theme');
    if (saved === 'dark' || saved === 'light') {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (e) { /* 忽略 */ }

  bindEvents();

  try {
    const res = await fetchWithTimeout(API_OPTIONS, { method: 'GET' }, 15000);
    const data = await res.json();
    if (!data || !data.ok || !Array.isArray(data.steps)) throw new Error('bad options');

    state.steps = data.steps;
    state.sel.duration = data.defaultDuration || '45';

    if (data.brand) {
      el.homeNote.textContent = data.brand + (data.slogan ? ' · ' + data.slogan : '');
    }
    el.startBtn.disabled = false;
  } catch (e) {
    // 选项拿不到也不能让用户面对一个死页面
    el.startBtn.disabled = true;
    el.startBtn.textContent = '服务没起来，刷新一下';
    toast('没拿到选项，确认服务是不是开着，然后刷新页面。');
  }
}

init();
