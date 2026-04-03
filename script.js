/* ══════════════════════════════════════
   MATCH-POINT — Tennis Match Tracker
   script.js  |  V1.4
   Adds: custom cursor tracking + hover
         states, advanced stats display
         on dashboard, adv stats toggle
         on match cards fully wired.
   All V1.3 logic unchanged.
══════════════════════════════════════ */

const STORAGE_KEY = 'matchpoint_matches';

/* ── State ── */
let matches        = loadFromStorage();
let selectedResult = null;
let currentFilter  = 'all';
let advOpen        = false;

/* ── DOM refs ── */
const landing      = document.getElementById('landing');
const app          = document.getElementById('app');
const btnStart     = document.getElementById('btn-start');
const btnSubmit    = document.getElementById('btn-submit');
const btnReset     = document.getElementById('btn-reset');
const btnQuickfill = document.getElementById('btn-quickfill');
const advToggle    = document.getElementById('adv-toggle');
const advSection   = document.getElementById('adv-section');
const toastEl      = document.getElementById('toast');
const modalOverlay = document.getElementById('modal-overlay');
const modalCancel  = document.getElementById('modal-cancel');
const modalConfirm = document.getElementById('modal-confirm');
const cursorPointer = document.getElementById('cursor-pointer');

/* ══════════════════════════════════════
   CUSTOM CURSOR — unified arrow + ball
══════════════════════════════════════ */

/* Tip of the arrow SVG is at x=5, y=2 inside the 44x44 viewBox */
const TIP_X = 5;
const TIP_Y = 2;

document.addEventListener('mousemove', function (e) {
  cursorPointer.style.left = (e.clientX - TIP_X) + 'px';
  cursorPointer.style.top  = (e.clientY - TIP_Y) + 'px';
});

document.addEventListener('mouseleave', function () {
  cursorPointer.style.opacity = '0';
});
document.addEventListener('mouseenter', function () {
  cursorPointer.style.opacity = '1';
});

/* Scale up on hoverable elements */
const HOVER_SELECTOR = [
  'button', 'a', '.result-opt', '.filter-chip',
  '.tab-btn', '.cta-btn', '.stat-card', '.match-card',
  '.surface-block', '.recent-row', '.land-badge',
  '.ball', '.adv-stat-item', '.opp-row', '.adv-expand-btn'
].join(', ');

document.addEventListener('mouseover', function (e) {
  if (e.target.closest(HOVER_SELECTOR)) document.body.classList.add('cursor-hover');
});
document.addEventListener('mouseout', function (e) {
  if (e.target.closest(HOVER_SELECTOR)) document.body.classList.remove('cursor-hover');
});

/* ══════════════════════════════════════
   LOCALSTORAGE
══════════════════════════════════════ */

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
  } catch (e) {
    showToast('Could not save — storage unavailable');
  }
}

/* ══════════════════════════════════════
   NAVIGATION
══════════════════════════════════════ */

btnStart.addEventListener('click', function () {
  landing.style.display = 'none';
  app.style.display     = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

  /* Smooth scroll to top of app body on every tab switch */
  window.scrollTo({ top: 0, behavior: 'smooth' });

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

/* ── Field-level validation helpers ── */
function setError(inputId, message) {
  const group = document.getElementById(inputId).closest('.form-group');
  clearError(inputId);
  group.classList.add('error');
  const msg = document.createElement('div');
  msg.className = 'field-error';
  msg.textContent = message;
  group.appendChild(msg);
}

function setGroupError(groupEl, message) {
  clearGroupError(groupEl);
  groupEl.classList.add('error');
  const msg = document.createElement('div');
  msg.className = 'field-error';
  msg.textContent = message;
  groupEl.appendChild(msg);
}

function clearError(inputId) {
  const group = document.getElementById(inputId).closest('.form-group');
  group.classList.remove('error');
  const existing = group.querySelector('.field-error');
  if (existing) existing.remove();
}

function clearGroupError(groupEl) {
  groupEl.classList.remove('error');
  const existing = groupEl.querySelector('.field-error');
  if (existing) existing.remove();
}

function clearAllErrors() {
  document.querySelectorAll('.form-group.error').forEach(function (g) {
    g.classList.remove('error');
    const e = g.querySelector('.field-error');
    if (e) e.remove();
  });
}

/* Clear error on input */
['inp-opp','inp-date','inp-my','inp-op'].forEach(function (id) {
  document.getElementById(id).addEventListener('input', function () { clearError(id); });
});

function logMatch() {
  clearAllErrors();

  const opp    = document.getElementById('inp-opp').value.trim();
  const date   = document.getElementById('inp-date').value;
  const myVal  = document.getElementById('inp-my').value;
  const opVal  = document.getElementById('inp-op').value;
  const surf   = document.getElementById('inp-surf').value;
  const notes  = document.getElementById('inp-notes').value.trim();
  const resultGroup = document.getElementById('opt-win').closest('.form-group');

  let valid = true;

  /* Opponent name */
  if (!opp) {
    setError('inp-opp', 'Enter your opponent\'s name');
    valid = false;
  } else if (opp.length < 2) {
    setError('inp-opp', 'Name must be at least 2 characters');
    valid = false;
  }

  /* Date */
  if (!date) {
    setError('inp-date', 'Pick a match date');
    valid = false;
  } else {
    const today    = new Date(); today.setHours(23,59,59,999);
    const picked   = new Date(date);
    if (picked > today) {
      setError('inp-date', 'Date can\'t be in the future');
      valid = false;
    }
  }

  /* Set scores */
  const my = parseInt(myVal);
  const op = parseInt(opVal);

  if (myVal === '' || isNaN(my)) {
    setError('inp-my', 'Enter your sets won');
    valid = false;
  } else if (my < 0 || my > 7) {
    setError('inp-my', 'Sets must be between 0 and 7');
    valid = false;
  }

  if (opVal === '' || isNaN(op)) {
    setError('inp-op', 'Enter opponent sets won');
    valid = false;
  } else if (op < 0 || op > 7) {
    setError('inp-op', 'Sets must be between 0 and 7');
    valid = false;
  }

  /* Can't be equal and both non-zero without a tiebreak — warn if both 0 */
  if (!isNaN(my) && !isNaN(op) && my === 0 && op === 0) {
    setError('inp-my', 'Both sets can\'t be 0');
    setError('inp-op', ' ');
    valid = false;
  }

  /* Result vs score consistency */
  if (!selectedResult) {
    setGroupError(resultGroup, 'Select Win or Loss');
    valid = false;
  } else if (!isNaN(my) && !isNaN(op) && myVal !== '' && opVal !== '') {
    if (selectedResult === 'win' && my <= op) {
      setGroupError(resultGroup, 'Your sets should be higher for a Win');
      valid = false;
    } else if (selectedResult === 'loss' && op <= my) {
      setGroupError(resultGroup, 'Opponent sets should be higher for a Loss');
      valid = false;
    }
  }

  if (!valid) return;

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
    my:     my,
    op:     op,
    surf:   surf,
    result: selectedResult,
    notes:  notes,
    adv:    hasAdv ? adv : null,
  };

  matches.unshift(match);
  saveToStorage();
  resetForm();
  showToast('Match saved!');
  renderDashboard();
}

function resetForm() {
  clearAllErrors();
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
   RESET MODAL
══════════════════════════════════════ */

btnReset.addEventListener('click', openModal);
modalCancel.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', function (e) {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeModal();
});

modalConfirm.addEventListener('click', function () {
  matches = [];
  saveToStorage();
  closeModal();
  renderDashboard();
  renderHistory();
  showToast('All data cleared');
});

function openModal()  { modalOverlay.classList.add('open'); }
function closeModal() { modalOverlay.classList.remove('open'); }

/* ══════════════════════════════════════
   QUICK-FILL (TESTING)
══════════════════════════════════════ */

const TEST_DATA = [
  { opp:'Rahul',   date: daysAgo(1),  my:2, op:1, surf:'Clay',  result:'win',
    notes:'Dominated baseline rallies',
    adv:{ aces:4, df:1, winners:18, ue:9,  bpWon:3, bpFaced:4 } },
  { opp:'Arjun',   date: daysAgo(3),  my:1, op:2, surf:'Hard',  result:'loss',
    notes:'Struggled with second serve',
    adv:{ aces:2, df:3, winners:11, ue:15, bpWon:1, bpFaced:5 } },
  { opp:'Vikram',  date: daysAgo(5),  my:2, op:0, surf:'Clay',  result:'win',
    notes:'Clean performance, great net play',
    adv:{ aces:6, df:0, winners:22, ue:7,  bpWon:4, bpFaced:2 } },
  { opp:'Karan',   date: daysAgo(8),  my:2, op:1, surf:'Grass', result:'win',
    notes: null, adv: null },
  { opp:'Rahul',   date: daysAgo(10), my:0, op:2, surf:'Clay',  result:'loss',
    notes:'Off day, too many errors',
    adv:{ aces:1, df:4, winners:8,  ue:20, bpWon:0, bpFaced:6 } },
  { opp:'Suresh',  date: daysAgo(14), my:2, op:1, surf:'Hard',  result:'win',
    notes: null, adv: null },
  { opp:'Arjun',   date: daysAgo(18), my:2, op:0, surf:'Clay',  result:'win',
    notes:'Best match of the month',
    adv:{ aces:7, df:1, winners:25, ue:6,  bpWon:5, bpFaced:3 } },
  { opp:'Dev',     date: daysAgo(22), my:1, op:2, surf:'Grass', result:'loss',
    notes: null, adv: null },
];

btnQuickfill.addEventListener('click', function () {
  const existingKeys = new Set(matches.map(function (m) { return m.opp + m.date; }));
  let added = 0;
  TEST_DATA.forEach(function (d, i) {
    if (!existingKeys.has(d.opp + d.date)) {
      matches.push(Object.assign({}, d, { id: Date.now() + i }));
      added++;
    }
  });
  matches.sort(function (a, b) { return b.id - a.id; });
  saveToStorage();
  renderDashboard();
  renderHistory();
  showToast(added > 0 ? added + ' test matches added!' : 'Test data already loaded');
});

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

/* ══════════════════════════════════════
   DASHBOARD
══════════════════════════════════════ */

function renderDashboard() {
  const total  = matches.length;
  const wins   = matches.filter(function (m) { return m.result === 'win'; }).length;
  const losses = total - wins;
  const rate   = total > 0 ? Math.round((wins / total) * 100) : 0;

  let streak = 0, sType = '';
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    if (!streak) { sType = m.result; streak = 1; }
    else if (m.result === sType) { streak++; }
    else { break; }
  }
  const streakStr = total > 0 ? streak + (sType === 'win' ? 'W' : 'L') : '—';

  countUp(0, total,  '',  '');
  countUp(1, wins,   '',  'color-win');
  countUp(2, losses, '',  'color-loss');
  countUp(3, rate,   '%', '');
  setStatValue(4, streakStr, '');

  document.querySelector('.progress-fill').style.width = rate + '%';
  const counts = document.querySelector('.progress-counts');
  counts.children[0].textContent = wins   + 'W';
  counts.children[1].textContent = losses + 'L';

  renderSurfaces();
  renderH2H();
  renderRecent();
  renderAdvSummary();   /* V1.4 — advanced stats summary on dashboard */
}

function countUp(cardIndex, targetVal, suffix, cls) {
  const valEl = document.querySelectorAll('.stat-card')[cardIndex]
                         .querySelector('.stat-value');
  valEl.className = 'stat-value' + (cls ? ' ' + cls : '');
  if (targetVal === 0) { valEl.textContent = '0' + suffix; return; }
  const steps = 24, duration = 600;
  let current = 0;
  const timer = setInterval(function () {
    current++;
    valEl.textContent = Math.round((current / steps) * targetVal) + suffix;
    if (current >= steps) {
      clearInterval(timer);
      valEl.textContent = targetVal + suffix;
    }
  }, duration / steps);
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
        '<span class="surf-pill surf-pill-' + m.surf.toLowerCase() + '">' + m.surf + '</span>' +
        '<span class="recent-score">' + m.my + ' \u2013 ' + m.op + '</span>' +
      '</div>'
    );
  }).join('');
}

/* ── Advanced stats summary card on dashboard ── */
function renderAdvSummary() {
  /* Find or create the adv summary card in dash-left */
  let card = document.getElementById('adv-summary-card');
  if (!card) {
    card = document.createElement('div');
    card.className = 'card adv-summary-card';
    card.id        = 'adv-summary-card';
    document.querySelector('.dash-left').appendChild(card);
  }

  /* Aggregate across all matches that have adv data */
  const advMatches = matches.filter(function (m) { return m.adv; });

  if (!advMatches.length) {
    card.innerHTML =
      '<div class="card-heading">Advanced Stats Average</div>' +
      '<div class="empty-recent">Log matches with advanced stats to see averages here.</div>';
    return;
  }

  function avg(field) {
    const sum = advMatches.reduce(function (acc, m) { return acc + m.adv[field]; }, 0);
    return (sum / advMatches.length).toFixed(1);
  }

  const metrics = [
    { label: 'Aces / Match',    val: avg('aces')    },
    { label: 'Double Faults',   val: avg('df')       },
    { label: 'Winners',         val: avg('winners')  },
    { label: 'Unforced Errors', val: avg('ue')       },
    { label: 'BP Won',          val: avg('bpWon')    },
    { label: 'BP Faced',        val: avg('bpFaced')  },
  ];

  card.innerHTML =
    '<div class="card-heading">Advanced Stats — Match Averages ' +
      '<span style="opacity:0.5;font-size:10px;">(' + advMatches.length + ' matches)</span>' +
    '</div>' +
    '<div class="adv-summary-grid">' +
      metrics.map(function (m) {
        return (
          '<div class="adv-stat-item">' +
            '<span class="adv-stat-label">' + m.label + '</span>' +
            '<span class="adv-stat-val">'   + m.val   + '</span>' +
          '</div>'
        );
      }).join('') +
    '</div>';
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

  el.innerHTML = list.map(function (m, idx) {
    const win   = m.result === 'win';
    const delay = (idx * 0.06).toFixed(2) + 's';

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
      '<div class="match-card" id="card-' + m.id + '" style="animation-delay:' + delay + '">' +
        '<div class="res-badge ' + (win ? 'rb-win' : 'rb-loss') + '">' +
          (win ? 'W' : 'L') +
        '</div>' +
        '<div class="match-info">' +
          '<div class="match-opp">vs ' + m.opp + '</div>' +
          '<div class="match-meta">' +
            formatDate(m.date) +
            ' &nbsp;<span class="surf-pill surf-pill-' + m.surf.toLowerCase() + '">' + m.surf + '</span>' +
          '</div>' +
          notesHtml +
          advHtml +
        '</div>' +
        advBtnHtml +
        '<div class="match-score">' + m.my + ' \u2013 ' + m.op + '</div>' +
        '<button class="del-btn" onclick="deleteMatch(' + m.id + ')" title="Delete">\u2715</button>' +
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
  saveToStorage();
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
