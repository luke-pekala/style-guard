/* ═══════════════════════════════════════════════════════════════
   STYLEGUARD — app.js
   Includes: rule definitions · analysis engine · DOM wiring
   Features: Analyze, Clear, char counter, Cmd/Ctrl+Enter,
             drag-and-drop .txt/.md, stats bar, score, tooltips
═══════════════════════════════════════════════════════════════ */

'use strict';

// ── 1. STYLE RULES ────────────────────────────────────────────
const STYLE_RULES = [

  // PASSIVE VOICE
  {
    name: "Passive voice — was/were",
    regex: /\b(was|were)\s+(?:\w+ly\s+)?(abused|accepted|added|affected|allowed|analysed|analyzed|approved|assigned|assumed|built|called|cancelled|canceled|changed|checked|closed|collected|completed|configured|confirmed|considered|controlled|converted|created|defined|deleted|deployed|described|designed|detected|determined|developed|disabled|discovered|done|enabled|established|evaluated|expected|extended|fixed|found|generated|given|handled|identified|implemented|improved|included|increased|installed|integrated|introduced|issued|kept|launched|made|managed|modified|moved|named|noted|obtained|opened|placed|planned|processed|produced|provided|published|raised|received|released|removed|replaced|reported|requested|required|resolved|reviewed|run|saved|scheduled|sent|set|shown|specified|started|stopped|stored|submitted|tested|triggered|updated|used|validated|verified|written)\b/gi,
    description: 'Passive voice (was/were + past participle). Name the actor. e.g. "The file was created" → "The system created the file".',
    category: "passive",
  },
  {
    name: "Passive voice — is/are",
    regex: /\b(is|are)\s+(?:\w+ly\s+)?(abused|accepted|added|affected|allowed|analysed|analyzed|approved|assigned|assumed|built|called|cancelled|canceled|changed|checked|closed|collected|completed|configured|confirmed|considered|controlled|converted|created|defined|deleted|deployed|described|designed|detected|determined|developed|disabled|discovered|done|enabled|established|evaluated|expected|extended|fixed|found|generated|given|handled|identified|implemented|improved|included|increased|installed|integrated|introduced|issued|kept|launched|made|managed|modified|moved|named|noted|obtained|opened|placed|planned|processed|produced|provided|published|raised|received|released|removed|replaced|reported|requested|required|resolved|reviewed|run|saved|scheduled|sent|set|shown|specified|started|stopped|stored|submitted|tested|triggered|updated|used|validated|verified|written)\b/gi,
    description: 'Passive voice (is/are + past participle). State who does what. e.g. "The config is updated by the installer" → "The installer updates the config".',
    category: "passive",
  },
  {
    name: "Passive voice — has/have been",
    regex: /\b(has|have)\s+been\s+(?:\w+ly\s+)?(abused|accepted|added|affected|allowed|analysed|analyzed|approved|assigned|assumed|built|called|cancelled|canceled|changed|checked|closed|collected|completed|configured|confirmed|considered|controlled|converted|created|defined|deleted|deployed|described|designed|detected|determined|developed|disabled|discovered|done|enabled|established|evaluated|expected|extended|fixed|found|generated|given|handled|identified|implemented|improved|included|increased|installed|integrated|introduced|issued|kept|launched|made|managed|modified|moved|named|noted|obtained|opened|placed|planned|processed|produced|provided|published|raised|received|released|removed|replaced|reported|requested|required|resolved|reviewed|run|saved|scheduled|sent|set|shown|specified|started|stopped|stored|submitted|tested|triggered|updated|used|validated|verified|written)\b/gi,
    description: 'Passive voice (has/have been + past participle). Clarify who acted. e.g. "The bug has been fixed" → "The team fixed the bug".',
    category: "passive",
  },
  {
    name: "Passive voice — will be",
    regex: /\bwill\s+be\s+(?:\w+ly\s+)?(abused|accepted|added|affected|allowed|analysed|analyzed|approved|assigned|assumed|built|called|cancelled|canceled|changed|checked|closed|collected|completed|configured|confirmed|considered|controlled|converted|created|defined|deleted|deployed|described|designed|detected|determined|developed|disabled|discovered|done|enabled|established|evaluated|expected|extended|fixed|found|generated|given|handled|identified|implemented|improved|included|increased|installed|integrated|introduced|issued|kept|launched|made|managed|modified|moved|named|noted|obtained|opened|placed|planned|processed|produced|provided|published|raised|received|released|removed|replaced|reported|requested|required|resolved|reviewed|run|saved|scheduled|sent|set|shown|specified|started|stopped|stored|submitted|tested|triggered|updated|used|validated|verified|written)\b/gi,
    description: 'Future passive. Say who will do it. e.g. "The report will be sent" → "We will send the report".',
    category: "passive",
  },

  // WEAK VERBS
  { name: "Weak verb — utilize",       regex: /\butilize[sd]?\b/gi,                  description: '"Utilize" means "use". Replace it.',                                                               category: "weak" },
  { name: "Weak verb — utilization",   regex: /\butilization\b/gi,                   description: '"Utilization" is a nominalisation of "use". Rewrite with the verb: "using X".',                   category: "weak" },
  { name: "Weak verb — leverage",      regex: /\bleverag(?:e[sd]?|ing)\b/gi,         description: '"Leverage" as a verb is jargon. Use "apply", "use", or "build on".',                              category: "weak" },
  { name: "Weak verb — facilitate",    regex: /\bfacilitat(?:e[sd]?|ing|ion)\b/gi,  description: '"Facilitate" is vague. Use "enable", "help", "allow", or "support".',                             category: "weak" },
  { name: "Weak verb — enable",        regex: /\benable[sd]?\b/gi,                   description: '"Enable" is often vague. What exactly does it allow the user to do?',                             category: "weak" },
  { name: "Weak verb — allow",         regex: /\ballow[s]?\b/gi,                     description: '"Allows" is weak. e.g. "allows users to export" → "users can export".',                          category: "weak" },
  { name: "Weak verb — provide",       regex: /\bprovid(?:e[sd]?|ing)\b/gi,          description: '"Provide" is a filler verb. Use "give", "offer", "include", or "deliver".',                      category: "weak" },
  { name: "Weak verb — perform",       regex: /\bperform(?:s|ed|ing)?\b/gi,          description: '"Perform" is a placeholder. Use the specific action: "validates" not "performs validation".',    category: "weak" },
  { name: "Weak verb — implement",     regex: /\bimplement(?:s|ed|ing|ation)?\b/gi,  description: '"Implement" is overused. Try "add", "build", "create", "set up", or "configure".',              category: "weak" },
  { name: "Weak — in order to",        regex: /\bin\s+order\s+to\b/gi,               description: '"In order to" → "to". Always.',                                                                   category: "weak" },
  { name: "Weak — the ability to",     regex: /\bthe\s+ability\s+to\b/gi,            description: '"The ability to" → "can". e.g. "users have the ability to export" → "users can export".',       category: "weak" },
  { name: "Weak — is able to",         regex: /\bis\s+able\s+to\b/gi,                description: '"Is able to" → "can". Always.',                                                                   category: "weak" },
  { name: "Weak — make use of",        regex: /\bmake\s+use\s+of\b/gi,               description: '"Make use of" → "use". Always.',                                                                  category: "weak" },

  // LONG SENTENCES
  {
    name: "Long sentence (30+ words)",
    regex: /[^.!?\n]*(?:\S+\s+){29,}\S+[^.!?\n]*/g,
    description: "This sentence is 30+ words. Split it — aim for one idea per sentence, 25 words max.",
    category: "long",
  },

  // BANNED FILLERS
  { name: "Filler — simply",              regex: /\bsimply\b/gi,                      description: '"Simply" is condescending. Remove it.',                                            category: "banned" },
  { name: "Filler — just",               regex: /\bjust\b/gi,                         description: '"Just" weakens authority. Remove it.',                                             category: "banned" },
  { name: "Filler — obviously",          regex: /\bobviously\b/gi,                    description: '"Obviously" alienates readers who don\'t already know. Remove it.',               category: "banned" },
  { name: "Filler — basically",          regex: /\bbasically\b/gi,                    description: '"Basically" is vague and informal. Remove it.',                                   category: "banned" },
  { name: "Filler — very",               regex: /\bvery\b/gi,                         description: '"Very" is a lazy intensifier. Use a stronger adjective. e.g. "very fast" → "rapid".', category: "banned" },
  { name: "Filler — really",             regex: /\breally\b/gi,                       description: '"Really" adds no meaning. Remove it or use a precise word.',                      category: "banned" },
  { name: "Filler — quite",              regex: /\bquite\b/gi,                        description: '"Quite" is ambiguous and weakens the statement. Remove it.',                      category: "banned" },
  { name: "Filler — fairly",             regex: /\bfairly\b/gi,                       description: '"Fairly" hedges without clarifying. Remove it.',                                  category: "banned" },
  { name: "Filler — pretty",             regex: /\bpretty\s+(?=\w)/gi,               description: '"Pretty" as an intensifier is informal. Remove it.',                              category: "banned" },
  { name: "Filler — actually",           regex: /\bactually\b/gi,                     description: '"Actually" sounds defensive. Remove it unless genuinely contrasting a misconception.', category: "banned" },
  { name: "Filler — in fact",            regex: /\bin\s+fact\b/gi,                    description: '"In fact" rarely adds weight. Remove it.',                                        category: "banned" },
  { name: "Filler — of course",          regex: /\bof\s+course\b/gi,                  description: '"Of course" assumes shared knowledge. Remove it.',                               category: "banned" },
  { name: "Filler — note that",          regex: /\bnote\s+that\b/gi,                  description: '"Note that" is throat-clearing. State the point directly.',                      category: "banned" },
  { name: "Filler — please note",        regex: /\bplease\s+note\b/gi,                description: '"Please note" is padding. Lead with the important information.',                  category: "banned" },
  { name: "Filler — it is worth noting", regex: /\bit\s+is\s+worth\s+noting\b/gi,    description: '"It is worth noting" is filler. State the information directly.',                 category: "banned" },
];

// ── 2. CATEGORY META ──────────────────────────────────────────
const CATEGORY_META = {
  passive: { label: "Passive voice",          className: "violation-passive", statKey: "errors"      },
  weak:    { label: "Weak verb/construction", className: "violation-weak",    statKey: "warnings"    },
  long:    { label: "Long sentence",          className: "violation-long",    statKey: "warnings"    },
  banned:  { label: "Banned filler word",     className: "violation-banned",  statKey: "suggestions" },
};

// ── 3. ANALYSIS ENGINE ────────────────────────────────────────

/**
 * Escape a plain string for safe HTML insertion.
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Run all STYLE_RULES against `text`.
 * Returns an array of match objects:
 *   { start, end, text, rule }
 * sorted by start position, with overlaps removed (first match wins).
 */
function findViolations(text) {
  const matches = [];

  for (const rule of STYLE_RULES) {
    // Clone the regex so lastIndex resets each call
    const re = new RegExp(rule.regex.source, rule.regex.flags);
    let m;
    while ((m = re.exec(text)) !== null) {
      matches.push({
        start: m.index,
        end:   m.index + m[0].length,
        text:  m[0],
        rule,
      });
      // Prevent infinite loops on zero-length matches
      if (m[0].length === 0) re.lastIndex++;
    }
  }

  // Sort by start position, then by length (longer match first)
  matches.sort((a, b) => a.start - b.start || b.end - a.end);

  // Remove overlapping matches — first/longest match wins
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

/**
 * Build HTML from plain text + violation matches.
 * Violations become <span> elements with tooltip title attributes.
 */
function buildHighlightedHTML(text, violations) {
  let html = "";
  let cursor = 0;

  for (const v of violations) {
    // Plain text before this violation
    if (v.start > cursor) {
      html += escapeHtml(text.slice(cursor, v.start));
    }
    const meta    = CATEGORY_META[v.rule.category];
    const cls     = meta.className;
    const tooltip = escapeHtml(v.rule.description);
    html += `<span class="${cls}" title="${tooltip}">${escapeHtml(v.text)}</span>`;
    cursor = v.end;
  }

  // Remaining plain text
  if (cursor < text.length) {
    html += escapeHtml(text.slice(cursor));
  }

  return html;
}

/**
 * Count violations per statKey category.
 */
function countStats(violations) {
  const counts = { errors: 0, warnings: 0, suggestions: 0 };
  for (const v of violations) {
    const key = CATEGORY_META[v.rule.category].statKey;
    counts[key]++;
  }
  return counts;
}

/**
 * Compute a readability score 0–100.
 * Starts at 100, deducts weighted penalties per violation.
 */
function computeScore(violations, textLength) {
  if (textLength === 0) return null;
  const weights = { errors: 8, warnings: 4, suggestions: 2 };
  let penalty = 0;
  for (const v of violations) {
    const key = CATEGORY_META[v.rule.category].statKey;
    penalty += weights[key];
  }
  return Math.max(0, Math.min(100, Math.round(100 - penalty)));
}

// ── 4. DOM WIRING ─────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {

  const textarea     = document.getElementById("doc-input");
  const analyzeBtn   = document.getElementById("analyze-btn");
  const clearBtn     = document.getElementById("clear-btn");
  const resultsPanel = document.getElementById("results-panel");
  const charCount    = document.getElementById("char-count");
  const statErrors   = document.getElementById("stat-errors");
  const statWarnings = document.getElementById("stat-warnings");
  const statSuggestions = document.getElementById("stat-suggestions");
  const statScore    = document.getElementById("stat-score");
  const inputPane    = document.querySelector(".pane--input");

  if (!textarea || !analyzeBtn) {
    console.warn("StyleGuard: required DOM elements not found.");
    return;
  }

  // ── Character counter ──────────────────────────────────────
  function updateCharCount() {
    const len = textarea.value.length;
    if (charCount) charCount.textContent = len.toLocaleString();
  }

  textarea.addEventListener("input", updateCharCount);
  updateCharCount();

  // ── Stat updater ───────────────────────────────────────────
  function setStat(el, value) {
    if (!el) return;
    el.textContent = value === null ? "—" : value;
    el.classList.remove("updated");
    // Trigger reflow so the animation replays
    void el.offsetWidth;
    el.classList.add("updated");
  }

  function resetStats() {
    setStat(statErrors,      "—");
    setStat(statWarnings,    "—");
    setStat(statSuggestions, "—");
    setStat(statScore,       "—");
  }

  // ── Empty state ────────────────────────────────────────────
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
      showEmpty("Paste some documentation above, then click Analyze.");
      resetStats();
      return;
    }

    const violations = findViolations(text);

    // Render highlighted output
    if (violations.length === 0) {
      resultsPanel.innerHTML = `
        <div class="results-empty">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
               aria-hidden="true" class="results-empty-icon" style="color:#6ee7b7;opacity:0.7">
            <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.3"/>
            <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="currentColor"
                  stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p>No violations found. Great writing!</p>
        </div>`;
    } else {
      resultsPanel.innerHTML = buildHighlightedHTML(text, violations);
    }

    // Update stats
    const counts = countStats(violations);
    const score  = computeScore(violations, text.length);

    setStat(statErrors,      counts.errors);
    setStat(statWarnings,    counts.warnings);
    setStat(statSuggestions, counts.suggestions);
    setStat(statScore,       score);
  }

  analyzeBtn.addEventListener("click", runAnalysis);

  // ── CLEAR ──────────────────────────────────────────────────
  function clearAll() {
    textarea.value = "";
    updateCharCount();
    showEmpty("Run an analysis to see highlighted violations here.");
    resetStats();
    textarea.focus();
  }

  clearBtn.addEventListener("click", clearAll);

  // ── KEYBOARD SHORTCUT: Cmd/Ctrl + Enter ───────────────────
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      runAnalysis();
    }
  });

  // ── DRAG AND DROP (.txt / .md files) ──────────────────────
  if (inputPane) {
    inputPane.addEventListener("dragover", (e) => {
      e.preventDefault();
      inputPane.classList.add("drag-over");
    });

    inputPane.addEventListener("dragleave", () => {
      inputPane.classList.remove("drag-over");
    });

    inputPane.addEventListener("drop", (e) => {
      e.preventDefault();
      inputPane.classList.remove("drag-over");

      const file = e.dataTransfer?.files?.[0];
      if (!file) return;

      const allowed = ["text/plain", "text/markdown", "text/x-markdown"];
      const isText  = allowed.includes(file.type) ||
                      /\.(txt|md|rst)$/i.test(file.name);

      if (!isText) {
        alert("StyleGuard accepts .txt, .md, and .rst files only.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        textarea.value = ev.target.result;
        updateCharCount();
        showEmpty("File loaded. Click Analyze to check it.");
        resetStats();
      };
      reader.readAsText(file);
    });
  }

  // ── Initial empty state ────────────────────────────────────
  showEmpty("Run an analysis to see highlighted violations here.");

});

// ── 5. MODULE EXPORT (Node / bundler environments) ────────────
if (typeof module !== "undefined" && module.exports) {
  module.exports = { STYLE_RULES, CATEGORY_META, findViolations, buildHighlightedHTML, countStats, computeScore };
}
