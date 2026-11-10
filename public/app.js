'use strict';

/* ============================================================
   傻子文案大师 V0.2 全行业版 —— 前端交互
   这个文件里没有任何密钥，所有 AI 调用都走后端 /api/generate

   V0.2 新增：首页选行业 / 业态 / 店名，选一次记住，7 步流程一步不加。
   ============================================================ */

const API_OPTIONS = '/api/options';
const API_GENERATE = '/api/generate';
const PROFILE_KEY = 'swd-v2-profile';

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
  steps: [],          // 从后端拿到的六步定义（按当前行业）
  industries: [],     // 首页行业卡片
  subTypes: [],       // 当前行业的业态标签
  profile: { industry: 'fashion', subType: '', storeName: '' },
  // 这里不能调 blankSelection()：对象字面量构建期间 state 还没初始化完，
  // blankSelection 里读 state.profile 会触发 TDZ 报错，整个 app 起不来。
  sel: {
    industry: 'fashion', subType: '', storeName: '',
    topic: '', subject: '', goal: '', speaker: '', tone: '', duration: '45', extra: ''
  },
  cur: 0,
  result: null,
  meta: null,
  loading: false,
  advanceTimer: null,
  moreOpen: null       // 「更多行业」展开状态：null=跟随当前选择，true/false=用户手动开合过
};

function blankSelection() {
  const p = state.profile;
  return {
    industry: p.industry, subType: p.subType, storeName: p.storeName,
    topic: '', subject: '', goal: '', speaker: '', tone: '', duration: '45', extra: ''
  };
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
  homeNote: $('homeNote'),
  // V0.2
  industryGrid: $('industryGrid'),
  industryGridMore: $('industryGridMore'),
  industryMore: $('industryMore'),
  industryMoreText: $('industryMoreText'),
  industryMoreArrow: $('industryMoreArrow'),
  subTypeRow: $('subTypeRow'),
  subTypeBlock: $('subTypeBlock'),
  storeNameInput: $('storeNameInput'),
  profileBtn: $('profileBtn'),
  profileText: $('profileText')
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

/** 复制：优先 Clipboard API；局域网 http 下它不可用，退回 execCommand */
async function copyText(text) {
  const t = String(text || '');
  if (!t.trim()) return false;
  if (navigator.clipboard && window.isSecureContext) {
    try { await navigator.clipboard.writeText(t); return true; } catch (e) { /* 落到兜底 */ }
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
  } catch (e) { return false; }
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

/* ------------------------ 行业 / 业态 / 店名 ------------------------ */

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return;
    const p = JSON.parse(raw);
    if (!p || typeof p !== 'object') return;
    // 只认后端下发的合法行业，避免本地存了个无效值
    state.profile.industry = String(p.industry || 'fashion');
    state.profile.subType = String(p.subType || '');
    state.profile.storeName = String(p.storeName || '').slice(0, 20);
  } catch (e) { /* 存坏了就用默认值 */ }
}

function saveProfile() {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(state.profile)); } catch (e) { /* 忽略 */ }
}

function currentIndustryLabel() {
  const hit = state.industries.find((x) => x.id === state.profile.industry);
  return hit ? hit.label : '服装';
}
function currentSubTypeLabel() {
  const hit = state.subTypes.find((x) => x.id === state.profile.subType);
  return hit ? hit.label : '';
}

function updateProfileBar() {
  const bits = [currentIndustryLabel(), currentSubTypeLabel(), state.profile.storeName].filter(Boolean);
  el.profileText.textContent = bits.join(' · ') || '选行业';
  el.profileBtn.hidden = false;
}

function industryCardHtml(x, cur) {
  const classes = ['industry-card'];
  if (x.id === cur) classes.push('is-on');
  if (x.fallback) classes.push('is-fallback');
  return '<button class="' + classes.join(' ') + '" type="button" data-industry="' + escapeHtml(x.id) + '">' +
    '<span class="industry-emoji">' + escapeHtml(x.emoji || '') + '</span>' +
    '<span class="industry-label">' + escapeHtml(x.label) + '</span>' +
    '</button>';
}

function renderIndustries() {
  const cur = state.profile.industry;
  const hot = state.industries.filter((x) => x.hot);
  const rest = state.industries.filter((x) => !x.hot);
  // null = 用户还没手动开合过：当前行业在「更多」里就自动展开，否则收起
  const open = state.moreOpen === null
    ? rest.some((x) => x.id === cur)
    : state.moreOpen;

  el.industryGrid.innerHTML = hot.map((x) => industryCardHtml(x, cur)).join('');
  el.industryGridMore.innerHTML = rest.map((x) => industryCardHtml(x, cur)).join('');
  el.industryGridMore.hidden = !open;

  el.industryMore.hidden = rest.length === 0;
  el.industryMore.classList.toggle('is-open', open);
  el.industryMoreText.textContent = open ? '收起其他行业' : '更多行业（' + rest.length + '）';
  el.industryMoreArrow.textContent = open ? '▴' : '▾';

  [el.industryGrid, el.industryGridMore].forEach((grid) => {
    grid.querySelectorAll('.industry-card').forEach((btn) => {
      btn.addEventListener('click', () => switchIndustry(btn.getAttribute('data-industry')));
    });
  });
}

function renderSubTypes() {
  el.subTypeRow.innerHTML = state.subTypes.map((x) => {
    const on = x.id === state.profile.subType ? ' is-on' : '';
    return '<button class="subtype-chip' + on + '" type="button" data-sub="' + escapeHtml(x.id) + '">' +
      escapeHtml(x.label) + '</button>';
  }).join('');
  el.subTypeBlock.hidden = state.subTypes.length === 0;

  el.subTypeRow.querySelectorAll('.subtype-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-sub');
      // 再点一次已选中的，就取消细分
      state.profile.subType = state.profile.subType === id ? '' : id;
      saveProfile();
      state.sel.subType = state.profile.subType;
      renderSubTypes();
      updateProfileBar();
    });
  });
}

function renderSetup() {
  renderIndustries();
  renderSubTypes();
  el.storeNameInput.value = state.profile.storeName;
  updateProfileBar();
}

/** 切换行业：重新拉该行业的选项，并清掉旧行业的选择 */
async function switchIndustry(id) {
  if (!id || id === state.profile.industry) return;
  state.profile.industry = id;
  state.profile.subType = '';   // 业态属于上一个行业，不能带过去
  saveProfile();
  state.sel = blankSelection();
  state.sel.duration = '45';
  state.cur = 0;
  state.result = null;
  el.startBtn.disabled = true;
  renderSetup();
  await fetchOptions();
  goHome();
}

async function fetchOptions() {
  try {
    const url = API_OPTIONS + '?industry=' + encodeURIComponent(state.profile.industry);
    const res = await fetchWithTimeout(url, { method: 'GET' }, 15000);
    const data = await res.json();
    if (!data || !data.ok || !Array.isArray(data.steps)) throw new Error('bad options');

    state.steps = data.steps;
    state.industries = Array.isArray(data.industries) ? data.industries : [];
    state.subTypes = Array.isArray(data.subTypes) ? data.subTypes : [];

    // 后端可能把非法行业回落到默认，同步回来
    if (data.industry && data.industry !== state.profile.industry) {
      state.profile.industry = data.industry;
      state.profile.subType = '';
      saveProfile();
    }

    state.sel.industry = state.profile.industry;
    state.sel.subType = state.profile.subType;
    state.sel.storeName = state.profile.storeName;
    state.sel.duration = data.defaultDuration || '45';

    renderSetup();
    el.startBtn.disabled = false;
    return true;
  } catch (e) {
    el.startBtn.disabled = true;
    el.startBtn.textContent = '服务没起来，刷新一下';
    toast('没拿到选项，确认服务是不是开着，然后刷新页面。');
    return false;
  }
}

/* ---------------------------- 视图切换 ---------------------------- */

function goHome() {
  el.homeView.hidden = false;
  el.wizardView.hidden = true;
  el.resultView.hidden = true;
  renderSetup();
  window.scrollTo(0, 0);
}

function goWizard() {
  // 用户可能刚在首页改了店名，进向导前同步一次
  state.profile.storeName = el.storeNameInput.value.slice(0, 20);
  saveProfile();
  state.sel.industry = state.profile.industry;
  state.sel.subType = state.profile.subType;
  state.sel.storeName = state.profile.storeName;

  el.homeView.hidden = true;
  el.wizardView.hidden = false;
  el.resultView.hidden = true;
  updateProfileBar();
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

function renderStep() {
  const total = TOTAL();
  const i = state.cur;

  el.stepLabel.textContent = '第 ' + (i + 1) + ' 步 / 共 ' + total + ' 步';
  el.progBar.style.width = Math.round(((i + 1) / total) * 100) + '%';
  el.backBtn.style.visibility = i === 0 ? 'hidden' : 'visible';

  if (i < state.steps.length) renderChoiceStep(state.steps[i]);
  else renderExtraStep();

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

  // 必须绑 label 的 click：时长那步有默认值，点已选中的卡片不会触发 radio 的 change，
  // 只绑 change 会让页面卡住不动（V0.1 实测踩过）。
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
      renderNavButtons(true);
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
    el.stepActions.innerHTML = '<button class="primary big" id="nextBtn" type="button">下一步 →</button>';
    $('nextBtn').addEventListener('click', next);
  } else {
    el.stepActions.innerHTML = '';
  }
}

function chooseValue(key, value) {
  if (key === 'topic' && state.sel.topic !== value) state.sel.subject = '';
  state.sel[key] = value;

  clearTimeout(state.advanceTimer);
  state.advanceTimer = setTimeout(() => {
    if (state.cur < TOTAL() - 1) next();
    else renderStep();
  }, AUTO_ADVANCE_MS);
}

function next() {
  if (state.cur < TOTAL() - 1) { state.cur += 1; renderStep(); }
}
function back() {
  if (state.cur > 0) { state.cur -= 1; renderStep(); }
}

/* ---------------------------- 生成 ---------------------------- */

async function runGenerate(action) {
  if (state.loading) return;
  if (action !== 'generate' && !state.result) return;

  state.loading = true;
  showOverlay(ACTION_LOADING[action] || ACTION_LOADING.generate);
  setActionsDisabled(true);

  // industry / subType / storeName 都在 state.sel 里，二次操作不会串回默认行业
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
    if (e && e.name === 'AbortError') toast('AI 想得有点久，这次先算了，再点一次试试。');
    else toast('网络好像断了，检查一下再试。');
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
  if (el.copyAllBtn) el.copyAllBtn.disabled = disabled;
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
  if (state.meta && state.meta.industry_label) bits.push(state.meta.industry_label);
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
  el.profileBtn.addEventListener('click', () => {
    goHome();
    const card = document.querySelector('.setup-card');
    if (card && card.scrollIntoView) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  el.industryMore.addEventListener('click', () => {
    const wasOpen = !el.industryGridMore.hidden;
    state.moreOpen = !wasOpen;
    renderIndustries();
    // 展开后滚一下，让新增的卡片进视野（手机上尤其需要）
    if (state.moreOpen && el.industryGridMore.scrollIntoView) {
      el.industryGridMore.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
  el.storeNameInput.addEventListener('input', () => {
    state.profile.storeName = el.storeNameInput.value.slice(0, 20);
    state.sel.storeName = state.profile.storeName;
    saveProfile();
    updateProfileBar();
  });
  el.copyAllBtn.addEventListener('click', async () => {
    const ok = await copyText(el.outScript.textContent);
    toast(ok ? '口播稿已复制，去拍吧' : '复制没成功，长按选中手动复制也行');
  });

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

  el.themeToggle.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', cur);
    try { localStorage.setItem('swd-theme', cur); } catch (e) { /* 忽略 */ }
  });
}

function restart() {
  clearTimeout(state.advanceTimer);
  // 行业 / 业态 / 店名是长期设置，重新填写时不能清掉
  state.sel = blankSelection();
  state.sel.duration = '45';
  state.cur = 0;
  state.result = null;
  state.meta = null;
  goWizard();
}

/* ---------------------------- 启动 ---------------------------- */

async function init() {
  try {
    const saved = localStorage.getItem('swd-theme');
    if (saved === 'dark' || saved === 'light') {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (e) { /* 忽略 */ }

  loadProfile();
  bindEvents();
  await fetchOptions();
  goHome();
}

init();
