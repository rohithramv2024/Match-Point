/* ══════════════════════════════════════
   MATCH-POINT — Tennis Match Tracker
   script.js  |  V1.1
   Adds: tab switching, CTA nav, form logic,
         dashboard render, history render,
         filter chips, delete, toast.
   Note: data lives in memory only this version.
         localStorage added in V1.2.
══════════════════════════════════════ */

/* ── State ── */
let matches        = [];
let selectedResult = null;
let currentFilter  = 'all';
let advOpen        = false;

/* ── DOM refs ── */
const landing    = document.getElementById('landing');
const app        = document.getElementById('app');
const btnStart   = document.getElementById('btn-start');
const btnSubmit  = document.getElementById('btn-submit');
const btnReset   = document.getElementById('btn-reset');
const advToggle  = document.getElementById('adv-toggle');
const advSection = document.getElementById('adv-section');
const toastEl    = document.getElementById('toast');

/* ══════════════════════════════════════
   NAVIGATION
══════════════════════════════════════ */

btnStart.addEventListener('click', function () {
  landing.style.display = 'none';
  app.style.display     = 'block';
  renderDashboard();
  renderHistory();
});

document.querySelectorAll('.tab-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    switchTab(btn.getAttribute('data-tab'), btn);
  });
});

function switchTab(tab, btn) {
  document.querySelectorAll('.tab-panel').forEach(function (p) {
    p.classList.remove('active');
  });
  document.querySelectorAll('.tab-btn').forEach(function (b) {
    b.classList.remove('active');
  });
  document.getElementById('panel-' + tab).classList.add('active');
  btn.classList.add('active');

  if (tab === 'dashboard') renderDashboard();
  if (tab === 'history')   renderHistory();
}

/* ══════════════════════════════════════
   LOG MATCH FORM
══════════════════════════════════════ */

document.getElementById('inp-date').valueAsDate = new Date();

document.getElementById('opt-win').addEventListener('click', function () {
  selectResult('win');
});
document.getElementById('opt-loss').addEventListener('click', function () {
  selectResult('loss');
});

function selectResult(r) {
  selectedResult = r;
  document.getElementById('opt-win').className  =
    'result-opt' + (r === 'win'  ? ' opt-win-active'  : '');
  document.getElementById('opt-loss').className =
    'result-opt' + (r === 'loss' ? ' opt-loss-active' : '');
}

advToggle.addEventListener('click', function () {
  advOpen = !advOpen;
  advSection.classList.toggle('open', advOpen);
  advToggle.querySelector('span').textContent =
    advOpen ? '⊖ \u00a0Advanced Stats' : '⊕ \u00a0Advanced Stats';
});

btnSubmit.addEventListener('click', logMatch);

function logMatch() {
  const opp   = document.getElementById('inp-opp').value.trim();
  const date  = document.getElementById('inp-date').value;
  const my    = document.getElementById('inp-my').value;
  const op    = document.getElementById('inp-op').value;
  const surf  = document.getElementById('inp-surf').value;
  const notes = document.getElementById('inp-notes').value.trim();

  if (!opp)                   return showToast('Enter opponent name');
  if (!date)                  return showToast('Pick a date');
  if (my === '' || op === '') return showToast('Enter set scores');
  if (!selectedResult)        return showToast('Select Win or Loss');

  const adv = {
    aces:    parseInt(document.getElementById('inp-aces').value)     || 0,
    df:      parseInt(document.getElementById('inp-df').value)       || 0,
    winners: parseInt(document.getElementById('inp-winners').value)  || 0,
    ue:      parseInt(document.getElementById('inp-ue').value)       || 0,
    bpWon:   parseInt(document.getElementById('inp-bp-won').value)   || 0,
    bpFaced: parseInt(document.getElementById('inp-bp-faced').value) || 0,
  };
  const hasAdv = Object.values(adv).some(function (v) { return v > 0; });

  const match = {
    id:     Date.now(),
    opp:    opp,
    date:   date,
    my:     parseInt(my),
    op:     parseInt(op),
    surf:   surf,
    result: selectedResult,
    notes:  notes,
    adv:    hasAdv ? adv : null,
  };

  matches.unshift(match);
  resetForm();
  showToast('Match saved!');
  renderDashboard();
}

function resetForm() {
  ['inp-opp','inp-my','inp-op','inp-notes',
   'inp-aces','inp-df','inp-winners','inp-ue',
   'inp-bp-won','inp-bp-faced'].forEach(function (id) {
    document.getElementById(id).value = '';
  });
  document.getElementById('inp-date').valueAsDate = new Date();
  selectedResult = null;
  document.getElementById('opt-win').className  = 'result-opt';
  document.getElementById('opt-loss').className = 'result-opt';
  advOpen = false;
  advSection.classList.remove('open');
  advToggle.querySelector('span').textContent = '⊕ \u00a0Advanced Stats';
}

/* ══════════════════════════════════════
   DASHBOARD
══════════════════════════════════════ */

function renderDashboard() {
  const total  = matches.length;
  const wins   = matches.filter(function (m) { return m.result === 'win'; }).length;
  const losses = total - wins;
  const rate   = total > 0 ? Math.round((wins / total) * 100) : 0;

  /* Streak */
  let streak = 0, sType = '';
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    if (!streak) { sType = m.result; streak = 1; }
    else if (m.result === sType) { streak++; }
    else { break; }
  }
  const streakStr = total > 0 ? streak + (sType === 'win' ? 'W' : 'L') : '—';

  /* Stat strip */
  setStatValue(0, total,         '');
  setStatValue(1, wins,          'color-win');
  setStatValue(2, losses,        'color-loss');
  setStatValue(3, rate + '%',    '');
  setStatValue(4, streakStr,     '');

  /* Progress bar */
  document.querySelector('.progress-fill').style.width = rate + '%';
  const counts = document.querySelector('.progress-counts');
  counts.children[0].textContent = wins   + 'W';
  counts.children[1].textContent = losses + 'L';

  renderSurfaces();
  renderH2H();
  renderRecent();
}

function setStatValue(index, value, cls) {
  const valEl = document.querySelectorAll('.stat-card')[index]
                         .querySelector('.stat-value');
  valEl.textContent = value;
  valEl.className   = 'stat-value' + (cls ? ' ' + cls : '');
}

function renderSurfaces() {
  const surfs  = ['Clay', 'Hard', 'Grass'];
  const blocks = document.querySelectorAll('.surface-block');
  surfs.forEach(function (s, i) {
    const sm = matches.filter(function (m) { return m.surf === s; });
    const sw = sm.filter(function (m) { return m.result === 'win'; }).length;
    const sl = sm.length - sw;
    const sr = sm.length > 0 ? Math.round((sw / sm.length) * 100) + '%' : '—';
    blocks[i].querySelector('.surf-record').textContent = sw + 'W / ' + sl + 'L';
    blocks[i].querySelector('.surf-rate').textContent   = sr;
  });
}

function renderH2H() {
  const el = document.getElementById('opp-list');
  if (!matches.length) {
    el.innerHTML = '<div class="empty-recent">Log matches to see opponents.</div>';
    return;
  }
  const oppMap = {};
  matches.forEach(function (m) {
    if (!oppMap[m.opp]) oppMap[m.opp] = { w: 0, l: 0 };
    if (m.result === 'win') oppMap[m.opp].w++;
    else                    oppMap[m.opp].l++;
  });
  const oppArr = Object.keys(oppMap).map(function (name) {
    return { name: name, w: oppMap[name].w, l: oppMap[name].l };
  }).sort(function (a, b) { return (b.w + b.l) - (a.w + a.l); });

  el.innerHTML = oppArr.map(function (o) {
    const total = o.w + o.l;
    const rate  = Math.round((o.w / total) * 100);
    return (
      '<div class="opp-row">' +
        '<span class="opp-name">'   + o.name + '</span>' +
        '<span class="opp-record">' + o.w + 'W / ' + o.l + 'L</span>' +
        '<span class="opp-rate">'   + rate + '%</span>' +
      '</div>'
    );
  }).join('');
}

function renderRecent() {
  const el = document.getElementById('recent-list');
  if (!matches.length) {
    el.innerHTML = '<div class="empty-recent">No matches logged yet.</div>';
    return;
  }
  el.innerHTML = matches.slice(0, 4).map(function (m) {
    const win = m.result === 'win';
    return (
      '<div class="recent-row">' +
        '<div class="recent-badge ' + (win ? 'rb-win' : 'rb-loss') + '">' +
          (win ? 'W' : 'L') +
        '</div>' +
        '<span class="recent-opp">vs ' + m.opp + '</span>' +
        '<span class="recent-surf">' + m.surf + '</span>' +
        '<span class="recent-score">' + m.my + ' – ' + m.op + '</span>' +
      '</div>'
    );
  }).join('');
}

/* ══════════════════════════════════════
   MATCH HISTORY
══════════════════════════════════════ */

document.querySelectorAll('.filter-chip').forEach(function (chip) {
  chip.addEventListener('click', function () {
    currentFilter = chip.getAttribute('data-filter');
    document.querySelectorAll('.filter-chip').forEach(function (c) {
      c.classList.remove('active');
    });
    chip.classList.add('active');
    renderHistory();
  });
});

function renderHistory() {
  const list = applyFilter(matches, currentFilter);
  const el   = document.getElementById('match-list');

  if (!list.length) {
    el.innerHTML =
      '<div class="empty-state">' +
        '<div class="empty-icon">🎾</div>' +
        '<div class="empty-text">No matches here yet.<br>' +
        'Head to Log Match to get started.</div>' +
      '</div>';
    return;
  }

  el.innerHTML = list.map(function (m) {
    const win = m.result === 'win';

    const advHtml = m.adv
      ? '<div class="match-adv-stats" id="adv-' + m.id + '">' +
          advItem('Aces',            m.adv.aces)    +
          advItem('Double Faults',   m.adv.df)      +
          advItem('Winners',         m.adv.winners) +
          advItem('Unforced Errors', m.adv.ue)      +
          advItem('BP Won',          m.adv.bpWon)   +
          advItem('BP Faced',        m.adv.bpFaced) +
        '</div>'
      : '';

    const advBtnHtml = m.adv
      ? '<button class="adv-expand-btn" onclick="toggleAdvStats(' + m.id + ')">Stats ▾</button>'
      : '';

    const notesHtml = m.notes
      ? '<div class="match-notes">' + m.notes + '</div>'
      : '';

    return (
      '<div class="match-card" id="card-' + m.id + '">' +
        '<div class="res-badge ' + (win ? 'rb-win' : 'rb-loss') + '">' +
          (win ? 'W' : 'L') +
        '</div>' +
        '<div class="match-info">' +
          '<div class="match-opp">vs ' + m.opp + '</div>' +
          '<div class="match-meta">' + formatDate(m.date) + ' &nbsp;·&nbsp; ' + m.surf + '</div>' +
          notesHtml +
          advHtml +
        '</div>' +
        advBtnHtml +
        '<div class="match-score">' + m.my + ' – ' + m.op + '</div>' +
        '<button class="del-btn" onclick="deleteMatch(' + m.id + ')" title="Delete">✕</button>' +
      '</div>'
    );
  }).join('');
}

function advItem(label, val) {
  return (
    '<div class="adv-stat-item">' +
      '<span class="adv-stat-label">' + label + '</span>' +
      '<span class="adv-stat-val">'   + val   + '</span>' +
    '</div>'
  );
}

function toggleAdvStats(id) {
  const el  = document.getElementById('adv-' + id);
  const btn = document.getElementById('card-' + id).querySelector('.adv-expand-btn');
  if (!el) return;
  el.classList.toggle('open');
  btn.textContent = el.classList.contains('open') ? 'Stats ▴' : 'Stats ▾';
}

function deleteMatch(id) {
  matches = matches.filter(function (m) { return m.id !== id; });
  renderHistory();
  renderDashboard();
  showToast('Match removed');
}

function applyFilter(arr, filter) {
  if (filter === 'all')  return arr;
  if (filter === 'win')  return arr.filter(function (m) { return m.result === 'win'; });
  if (filter === 'loss') return arr.filter(function (m) { return m.result === 'loss'; });
  return arr.filter(function (m) { return m.surf === filter; });
}

/* ══════════════════════════════════════
   RESET
══════════════════════════════════════ */

btnReset.addEventListener('click', function () {
  if (!confirm('Reset all match data? This cannot be undone.')) return;
  matches = [];
  renderDashboard();
  renderHistory();
  showToast('All data cleared');
});

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
}
