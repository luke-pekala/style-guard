/* ═══════════════════════════════════════════════════════════════
   STYLEGUARD — app.js
   Includes: rule definitions · analysis engine · DOM wiring
             theme toggle with localStorage persistence
═══════════════════════════════════════════════════════════════ */

'use strict';

// ── 1. STYLE RULES ────────────────────────────────────────────
const STYLE_RULES = [

  // PASSIVE VOICE
  {
    name: "Passive voice — was/were",
    regex: /\b(was|were)\s+(?:\w+ly\s+)?(abused|accepted|added|affected|allowed|analysed|analyzed|approved|assigned|assumed|built|called|cancelled|canceled|changed|checked|closed|collected|completed|configured|confirmed|considered|controlled|converted|created|defined|deleted|deployed|described|designed|detected|determined|developed|disabled|discovered|done|enabled|established|evaluated|expected|extended|fixed|found|generated|given|handled|identified|implemented|improved|included|increased|installed|integrated|introduced|issued|kept|launched|made|managed|modified|moved|named|noted|obtained|opened|placed|planned|processed|produced|provided|published|raised|received|released|removed|replaced|reported|requested|required|resolved|reviewed|run|saved|scheduled|sent|set|shown|specified|started|stopped|stored|submitted|tested|triggered|updated|used|validated|verified|written)\b/gi,
    description: 'Passive voice (was/were). Name the actor. e.g. "The file was created" → "The system created the file".',
    category: "passive",
  },
  {
    name: "Passive voice — is/are",
    regex: /\b(is|are)\s+(?:\w+ly\s+)?(abused|accepted|added|affected|allowed|analysed|analyzed|approved|assigned|assumed|built|called|cancelled|canceled|changed|checked|closed|collected|completed|configured|confirmed|considered|controlled|converted|created|defined|deleted|deployed|described|designed|detected|determined|developed|disabled|discovered|done|enabled|established|evaluated|expected|extended|fixed|found|generated|given|handled|identified|implemented|improved|included|increased|installed|integrated|introduced|issued|kept|launched|made|managed|modified|moved|named|noted|obtained|opened|placed|planned|processed|produced|provided|published|raised|received|released|removed|replaced|reported|requested|required|resolved|reviewed|run|saved|scheduled|sent|set|shown|specified|started|stopped|stored|submitted|tested|triggered|updated|used|validated|verified|written)\b/gi,
    description: 'Passive voice (is/are). State who does what. e.g. "The config is updated by the installer" → "The installer updates the config".',
    category: "passive",
  },
  {
    name: "Passive voice — has/have been",
    regex: /\b(has|have)\s+been\s+(?:\w+ly\s+)?(abused|accepted|added|affected|allowed|analysed|analyzed|approved|assigned|assumed|built|called|cancelled|canceled|changed|checked|closed|collected|completed|configured|confirmed|considered|controlled|converted|created|defined|deleted|deployed|described|designed|detected|determined|developed|disabled|discovered|done|enabled|established|evaluated|expected|extended|fixed|found|generated|given|handled|identified|implemented|improved|included|increased|installed|integrated|introduced|issued|kept|launched|made|managed|modified|moved|named|noted|obtained|opened|placed|planned|processed|produced|provided|published|raised|received|released|removed|replaced|reported|requested|required|resolved|reviewed|run|saved|scheduled|sent|set|shown|specified|started|stopped|stored|submitted|tested|triggered|updated|used|validated|verified|written)\b/gi,
    description: 'Passive voice (has/have been). Clarify who acted. e.g. "The bug has been fixed" → "The team fixed the bug".',
    category: "passive",
  },
  {
    name: "Passive voice — will be",
    regex: /\bwill\s+be\s+(?:\w+ly\s+)?(abused|accepted|added|affected|allowed|analysed|analyzed|approved|assigned|assumed|built|called|cancelled|canceled|changed|checked|closed|collected|completed|configured|confirmed|considered|controlled|converted|created|defined|deleted|deployed|described|designed|detected|determined|developed|disabled|discovered|done|enabled|established|evaluated|expected|extended|fixed|found|generated|given|handled|identified|implemented|improved|included|increased|installed|integrated|introduced|issued|kept|launched|made|managed|modified|moved|named|noted|obtained|opened|placed|planned|processed|produced|provided|published|raised|received|released|removed|replaced|reported|requested|required|resolved|reviewed|run|saved|scheduled|sent|set|shown|specified|started|stopped|stored|submitted|tested|triggered|updated|used|validated|verified|written)\b/gi,
    description: 'Future passive. Say who will do it. e.g. "The report will be sent" → "We will send the report".',
    category: "passive",
  },

  // WEAK VERBS & CONSTRUCTIONS
  { name: "Weak verb — utilize",       regex: /\butilize[sd]?\b/gi,                 description: '"Utilize" means "use". Replace it.',                                                            category: "weak" },
  { name: "Weak verb — utilization",   regex: /\butilization\b/gi,                  description: '"Utilization" is a nominalisation. Rewrite: "using X".',                                       category: "weak" },
  { name: "Weak verb — leverage",      regex: /\bleverag(?:e[sd]?|ing)\b/gi,        description: '"Leverage" as a verb is jargon. Use "apply", "use", or "build on".',                           category: "weak" },
  { name: "Weak verb — facilitate",    regex: /\bfacilitat(?:e[sd]?|ing|ion)\b/gi, description: '"Facilitate" is vague. Use "enable", "help", "allow", or "support".',                          category: "weak" },
  { name: "Weak verb — enable",        regex: /\benable[sd]?\b/gi,                  description: '"Enable" is often vague. What exactly does it let the user do?',                              category: "weak" },
  { name: "Weak verb — allow",         regex: /\ballow[s]?\b/gi,                    description: '"Allows" is weak. e.g. "allows users to export" → "users can export".',                       category: "weak" },
  { name: "Weak verb — provide",       regex: /\bprovid(?:e[sd]?|ing)\b/gi,         description: '"Provide" is filler. Use "give", "offer", "include", or "deliver".',                          category: "weak" },
  { name: "Weak verb — perform",       regex: /\bperform(?:s|ed|ing)?\b/gi,         description: '"Perform" is a placeholder. Use the specific action: "validates" not "performs validation".', category: "weak" },
  { name: "Weak verb — implement",     regex: /\bimplement(?:s|ed|ing|ation)?\b/gi, description: '"Implement" is overused. Try "add", "build", "create", "set up", or "configure".',           category: "weak" },
  { name: "Weak — in order to",        regex: /\bin\s+order\s+to\b/gi,              description: '"In order to" → "to". Always.',                                                                category: "weak" },
  { name: "Weak — the ability to",     regex: /\bthe\s+ability\s+to\b/gi,           description: '"The ability to" → "can".',                                                                    category: "weak" },
  { name: "Weak — is able to",         regex: /\bis\s+able\s+to\b/gi,               description: '"Is able to" → "can". Always.',                                                                category: "weak" },
  { name: "Weak — make use of",        regex: /\bmake\s+use\s+of\b/gi,              description: '"Make use of" → "use". Always.',                                                               category: "weak" },

  // LONG SENTENCES
  {
    name: "Long sentence (30+ words)",
    regex: /[^.!?\n]*(?:\S+\s+){29,}\S+[^.!?\n]*/g,
    description: "This sentence is 30+ words. Split it — aim for one idea per sentence, 25 words max.",
    category: "long",
  },

  // BANNED FILLERS
  { name: "Filler — simply",              regex: /\bsimply\b/gi,                   description: '"Simply" is condescending. Remove it.',                                             category: "banned" },
  { name: "Filler — just",               regex: /\bjust\b/gi,                      description: '"Just" weakens authority. Remove it.',                                              category: "banned" },
  { name: "Filler — obviously",          regex: /\bobviously\b/gi,                 description: '"Obviously" alienates readers. Remove it.',                                         category: "banned" },
  { name: "Filler — basically",          regex: /\bbasically\b/gi,                 description: '"Basically" is vague and informal. Remove it.',                                    category: "banned" },
  { name: "Filler — very",               regex: /\bvery\b/gi,                      description: '"Very" is a lazy intensifier. Use a stronger word. e.g. "very fast" → "rapid".', category: "banned" },
  { name: "Filler — really",             regex: /\breally\b/gi,                    description: '"Really" adds no meaning. Remove it.',                                             category: "banned" },
  { name: "Filler — quite",              regex: /\bquite\b/gi,                     description: '"Quite" is ambiguous and weakens the statement. Remove it.',                      category: "banned" },
  { name: "Filler — fairly",             regex: /\bfairly\b/gi,                    description: '"Fairly" hedges without clarifying. Remove it.',                                  category: "banned" },
  { name: "Filler — pretty",             regex: /\bpretty\s+(?=\w)/gi,             description: '"Pretty" as an intensifier is informal. Remove it.',                             category: "banned" },
  { name: "Filler — actually",           regex: /\bactually\b/gi,                  description: '"Actually" sounds defensive. Remove it unless contrasting a misconception.',      category: "banned" },
  { name: "Filler — in fact",            regex: /\bin\s+fact\b/gi,                 description: '"In fact" rarely adds weight. Remove it.',                                        category: "banned" },
  { name: "Filler — of course",          regex: /\bof\s+course\b/gi,               description: '"Of course" assumes shared knowledge. Remove it.',                               category: "banned" },
  { name: "Filler — note that",          regex: /\bnote\s+that\b/gi,               description: '"Note that" is throat-clearing. State the point directly.',                      category: "banned" },
  { name: "Filler — please note",        regex: /\bplease\s+note\b/gi,             description: '"Please note" is padding. Lead with the information.',                           category: "banned" },
  { name: "Filler — it is worth noting", regex: /\bit\s+is\s+worth\s+noting\b/gi, description: '"It is worth noting" is filler. State the information directly.',                category: "banned" },
];


// ── 2. CATEGORY META ──────────────────────────────────────────
const CATEGORY_META = {
  passive: { label: "Passive voice",          className: "violation-passive", statKey: "errors"      },
  weak:    { label: "Weak verb/construction", className: "violation-weak",    statKey: "warnings"    },
  long:    { label: "Long sentence",          className: "violation-long",    statKey: "warnings"    },
  banned:  { label: "Banned filler word",     className: "violation-banned",  statKey: "suggestions" },
};


// ── 3. ANALYSIS ENGINE ────────────────────────────────────────

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function findViolations(text) {
  const matches = [];
  for (const rule of STYLE_RULES) {
    const re = new RegExp(rule.regex.source, rule.regex.flags);
    let m;
    while ((m = re.exec(text)) !== null) {
      matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], rule });
      if (m[0].length === 0) re.lastIndex++;
    }
  }
  // Sort by start; longer match wins on ties
  matches.sort((a, b) => a.start - b.start || b.end - a.end);
  // Remove overlaps — first/longest match wins
  const filtered = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start >= cursor) {
      filtered.push(m);
      cursor = m.end;
    }
  }
  return filtered;
}

function buildHighlightedHTML(text, violations) {
  let html = '';
  let cursor = 0;
  for (const v of violations) {
    if (v.start > cursor) html += escapeHtml(text.slice(cursor, v.start));
    const cls     = CATEGORY_META[v.rule.category].className;
    const tooltip = escapeHtml(v.rule.description);
    html += `<span class="${cls}" title="${tooltip}">${escapeHtml(v.text)}</span>`;
    cursor = v.end;
  }
  if (cursor < text.length) html += escapeHtml(text.slice(cursor));
  return html;
}

function countStats(violations) {
  const counts = { errors: 0, warnings: 0, suggestions: 0 };
  for (const v of violations) counts[CATEGORY_META[v.rule.category].statKey]++;
  return counts;
}

function computeScore(violations, textLength) {
  if (textLength === 0) return null;
  const weights = { errors: 8, warnings: 4, suggestions: 2 };
  let penalty = 0;
  for (const v of violations) penalty += weights[CATEGORY_META[v.rule.category].statKey];
  return Math.max(0, Math.min(100, Math.round(100 - penalty)));
}


// ── 4. DOM WIRING ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  const textarea        = document.getElementById('doc-input');
  const analyzeBtn      = document.getElementById('analyze-btn');
  const clearBtn        = document.getElementById('clear-btn');
  const resultsPanel    = document.getElementById('results-panel');
  const charCountEl     = document.getElementById('char-count');
  const statErrors      = document.getElementById('stat-errors');
  const statWarnings    = document.getElementById('stat-warnings');
  const statSuggestions = document.getElementById('stat-suggestions');
  const statScore       = document.getElementById('stat-score');
  const inputPane       = document.querySelector('.pane--input');
  const themeToggle     = document.getElementById('theme-toggle');

  if (!textarea || !analyzeBtn) {
    console.warn('StyleGuard: required DOM elements not found.');
    return;
  }

  // ── Character counter ──────────────────────────────────────
  function updateCharCount() {
    if (charCountEl) charCountEl.textContent = textarea.value.length.toLocaleString();
  }
  textarea.addEventListener('input', updateCharCount);
  updateCharCount();

  // ── Stat updater ───────────────────────────────────────────
  function setStat(el, value) {
    if (!el) return;
    el.textContent = value === null ? '—' : value;
    el.classList.remove('updated');
    void el.offsetWidth;
    el.classList.add('updated');
  }

  function resetStats() {
    setStat(statErrors,      '—');
    setStat(statWarnings,    '—');
    setStat(statSuggestions, '—');
    setStat(statScore,       '—');
  }

  // ── Empty state helper ─────────────────────────────────────
  function showEmpty(message) {
    resultsPanel.innerHTML = `
      <div class="results-empty">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
             aria-hidden="true" class="results-empty-icon">
          <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.3"/>
          <circle cx="10" cy="10" r="3.5" stroke="currentColor" stroke-width="1.3"/>
        </svg>
        <p>${escapeHtml(message)}</p>
      </div>`;
  }

  // ── ANALYZE ────────────────────────────────────────────────
  function runAnalysis() {
    const text = textarea.value;
    if (!text.trim()) {
      showEmpty('Paste some documentation above, then click Analyze.');
      resetStats();
      return;
    }

    const violations = findViolations(text);

    if (violations.length === 0) {
      resultsPanel.innerHTML = `
        <div class="results-empty">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
               aria-hidden="true" class="results-empty-icon" style="opacity:0.7;color:var(--stat-score-fg)">
            <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.3"/>
            <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="currentColor"
                  stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p>No violations found — great writing!</p>
        </div>`;
    } else {
      resultsPanel.innerHTML = buildHighlightedHTML(text, violations);
    }

    const counts = countStats(violations);
    const score  = computeScore(violations, text.length);
    setStat(statErrors,      counts.errors);
    setStat(statWarnings,    counts.warnings);
    setStat(statSuggestions, counts.suggestions);
    setStat(statScore,       score);
  }

  analyzeBtn.addEventListener('click', runAnalysis);

  // ── CLEAR ──────────────────────────────────────────────────
  function clearAll() {
    textarea.value = '';
    updateCharCount();
    showEmpty('Run an analysis to see highlighted violations here.');
    resetStats();
    textarea.focus();
  }

  clearBtn.addEventListener('click', clearAll);

  // ── KEYBOARD SHORTCUT Cmd/Ctrl + Enter ────────────────────
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      runAnalysis();
    }
  });

  // ── DRAG AND DROP ─────────────────────────────────────────
  if (inputPane) {
    inputPane.addEventListener('dragover', (e) => {
      e.preventDefault();
      inputPane.classList.add('drag-over');
    });
    inputPane.addEventListener('dragleave', () => {
      inputPane.classList.remove('drag-over');
    });
    inputPane.addEventListener('drop', (e) => {
      e.preventDefault();
      inputPane.classList.remove('drag-over');
      const file = e.dataTransfer?.files?.[0];
      if (!file) return;
      const allowed = ['text/plain', 'text/markdown', 'text/x-markdown'];
      const isText  = allowed.includes(file.type) || /\.(txt|md|rst)$/i.test(file.name);
      if (!isText) { alert('StyleGuard accepts .txt, .md, and .rst files only.'); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        textarea.value = ev.target.result;
        updateCharCount();
        showEmpty('File loaded — click Analyze to check it.');
        resetStats();
      };
      reader.readAsText(file);
    });
  }

  // ── THEME TOGGLE ──────────────────────────────────────────
  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('sg-theme', theme); } catch (e) {}
    if (themeToggle) {
      themeToggle.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      // Update visible label text: show next action (what clicking will do)
      const labels = themeToggle.querySelectorAll('.theme-toggle-label');
      if (labels.length === 2) {
        // first label sits beside moon (dark mode label), second beside sun (light mode label)
        labels[0].textContent = 'Dark';
        labels[1].textContent = 'Light';
      }
    }
  }

  if (themeToggle) {
    // Set initial aria-label
    setTheme(getTheme());

    themeToggle.addEventListener('click', () => {
      const next = getTheme() === 'dark' ? 'light' : 'dark';
      setTheme(next);

      // Trigger icon spin animation
      themeToggle.classList.remove('toggling');
      void themeToggle.offsetWidth;
      themeToggle.classList.add('toggling');
      themeToggle.addEventListener('animationend', () => {
        themeToggle.classList.remove('toggling');
      }, { once: true });
    });
  }

  // ── Initial empty state ────────────────────────────────────
  showEmpty('Run an analysis to see highlighted violations here.');

});


// ── 5. CHANGELOG — GitHub Releases ───────────────────────────

const GITHUB_OWNER = 'lukepekala1-afk';
const GITHUB_REPO  = 'style-guard';
const RELEASES_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`;

/** Format ISO date → "28 Mar 2026" */
function formatReleaseDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return iso.slice(0, 10); }
}

/**
 * Parse a GitHub release body (Markdown bullet list) into plain strings,
 * stripping list markers and basic bold/italic syntax.
 */
function parseReleaseBody(body) {
  if (!body || !body.trim()) return [];
  return body
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .map(l => l.replace(/^[-*+]\s+/, '').replace(/^\d+\.\s+/, ''))
    .map(l => l.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1'))
    .filter(l => l.length > 0);
}

/** Render an array of GitHub release objects into #changelog-content */
function renderReleases(releases) {
  const content = document.getElementById('changelog-content');
  if (!content) return;

  if (!releases.length) {
    content.innerHTML = '<div class="changelog-empty">No releases published yet.</div>';
    return;
  }

  content.innerHTML = releases.map((release, index) => {
    const version  = escapeHtml(release.tag_name || release.name || 'Untitled');
    const date     = escapeHtml(formatReleaseDate(release.published_at || release.created_at));
    const items    = parseReleaseBody(release.body);
    const badge    = index === 0 ? '<span class="changelog-latest-badge">Latest</span>' : '';
    const itemsHtml = items.length
      ? `<ul class="changelog-items">${items.map(i => `<li class="changelog-item">${escapeHtml(i)}</li>`).join('')}</ul>`
      : '<ul class="changelog-items"><li class="changelog-item">See GitHub for full details.</li></ul>';

    return `<div class="changelog-release">
      <div class="changelog-release-header">
        <span class="changelog-version">${version}</span>
        <span class="changelog-date">${date}</span>
        ${badge}
      </div>
      ${itemsHtml}
    </div>`;
  }).join('');
}

/**
 * Fetch releases from the GitHub API.
 * Caches to sessionStorage so repeated opens don't re-request.
 */
async function fetchReleases() {
  const CACHE_KEY = 'sg-releases-cache';

  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) { renderReleases(JSON.parse(cached)); return; }
  } catch { /* ignore */ }

  try {
    const res = await fetch(RELEASES_URL, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const releases = await res.json();
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(releases)); } catch { /* ignore */ }
    renderReleases(releases);
  } catch (err) {
    const content = document.getElementById('changelog-content');
    if (content) {
      content.innerHTML = `<div class="changelog-error">
        Could not load releases —
        <a href="https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases"
           target="_blank" rel="noopener noreferrer"
           style="color:inherit;text-underline-offset:2px;">view on GitHub</a>.
      </div>`;
    }
    console.warn('StyleGuard changelog:', err.message);
  }
}

/** Wire up changelog — both the footer "What's new" button and the header version tag */
document.addEventListener('DOMContentLoaded', () => {
  const footerToggle  = document.getElementById('changelog-toggle');
  const versionTag    = document.getElementById('version-tag');
  const panel         = document.getElementById('changelog-panel');
  if (!panel) return;

  let loaded = false;

  function openPanel() {
    panel.removeAttribute('hidden');
    if (footerToggle) footerToggle.setAttribute('aria-expanded', 'true');
    if (versionTag)   versionTag.setAttribute('aria-expanded', 'true');
    // Scroll changelog into view smoothly
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (!loaded) { loaded = true; fetchReleases(); }
  }

  function closePanel() {
    panel.setAttribute('hidden', '');
    if (footerToggle) footerToggle.setAttribute('aria-expanded', 'false');
    if (versionTag)   versionTag.setAttribute('aria-expanded', 'false');
  }

  function togglePanel() {
    const isOpen = footerToggle
      ? footerToggle.getAttribute('aria-expanded') === 'true'
      : !panel.hasAttribute('hidden');
    isOpen ? closePanel() : openPanel();
  }

  if (footerToggle) footerToggle.addEventListener('click', togglePanel);
  if (versionTag)   versionTag.addEventListener('click', togglePanel);
});


// ── 6. MODULE EXPORT ──────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { STYLE_RULES, CATEGORY_META, findViolations, buildHighlightedHTML, countStats, computeScore };
}
