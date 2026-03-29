/* ═══════════════════════════════════════════════════════════════
   STYLEGUARD — app.js  v0.1.0
   Group 1 additions:
     · Inline fix suggestions popover on violation click
     · Copy clean text button
     · Violation count badges on legend
     · Example text pre-loaded on first visit
═══════════════════════════════════════════════════════════════ */

'use strict';

// ── 1. EXAMPLE TEXT ───────────────────────────────────────────
// Shown on first load so users immediately see the tool in action.
const EXAMPLE_TEXT =
`# Getting Started

The configuration file is updated by the system when the installer runs. Users should simply click the button to utilize the settings panel in order to enable the required features.

It was designed to facilitate a very smooth onboarding experience. The dashboard was built to provide users with the ability to monitor their usage in real time. Obviously, this is a very important feature for teams who are basically unfamiliar with the interface.

Please note that all settings will be saved automatically. It is worth noting that the process can take a few seconds to complete. Users just need to wait for the confirmation message before proceeding.`;


// ── 2. STYLE RULES ────────────────────────────────────────────
// Each rule now has an optional `fix` string — a concrete rewrite
// suggestion shown in the popover. Use {word} as a placeholder for
// the matched text where helpful.
const STYLE_RULES = [

  // PASSIVE VOICE
  {
    name: "Passive voice — was/were",
    regex: /\b(was|were)\s+(?:\w+ly\s+)?(abused|accepted|added|affected|allowed|analysed|analyzed|approved|assigned|assumed|built|called|cancelled|canceled|changed|checked|closed|collected|completed|configured|confirmed|considered|controlled|converted|created|defined|deleted|deployed|described|designed|detected|determined|developed|disabled|discovered|done|enabled|established|evaluated|expected|extended|fixed|found|generated|given|handled|identified|implemented|improved|included|increased|installed|integrated|introduced|issued|kept|launched|made|managed|modified|moved|named|noted|obtained|opened|placed|planned|processed|produced|provided|published|raised|received|released|removed|replaced|reported|requested|required|resolved|reviewed|run|saved|scheduled|sent|set|shown|specified|started|stopped|stored|submitted|tested|triggered|updated|used|validated|verified|written)\b/gi,
    description: 'Passive voice makes sentences weak and hides who did what.',
    fix: 'Name the actor. e.g. "The file was created by the team" → "The team created the file".',
    category: "passive",
  },
  {
    name: "Passive voice — is/are",
    regex: /\b(is|are)\s+(?:\w+ly\s+)?(abused|accepted|added|affected|allowed|analysed|analyzed|approved|assigned|assumed|built|called|cancelled|canceled|changed|checked|closed|collected|completed|configured|confirmed|considered|controlled|converted|created|defined|deleted|deployed|described|designed|detected|determined|developed|disabled|discovered|done|enabled|established|evaluated|expected|extended|fixed|found|generated|given|handled|identified|implemented|improved|included|increased|installed|integrated|introduced|issued|kept|launched|made|managed|modified|moved|named|noted|obtained|opened|placed|planned|processed|produced|provided|published|raised|received|released|removed|replaced|reported|requested|required|resolved|reviewed|run|saved|scheduled|sent|set|shown|specified|started|stopped|stored|submitted|tested|triggered|updated|used|validated|verified|written)\b/gi,
    description: 'Passive voice hides the actor and weakens clarity.',
    fix: 'State who does what. e.g. "The config is updated by the installer" → "The installer updates the config".',
    category: "passive",
  },
  {
    name: "Passive voice — has/have been",
    regex: /\b(has|have)\s+been\s+(?:\w+ly\s+)?(abused|accepted|added|affected|allowed|analysed|analyzed|approved|assigned|assumed|built|called|cancelled|canceled|changed|checked|closed|collected|completed|configured|confirmed|considered|controlled|converted|created|defined|deleted|deployed|described|designed|detected|determined|developed|disabled|discovered|done|enabled|established|evaluated|expected|extended|fixed|found|generated|given|handled|identified|implemented|improved|included|increased|installed|integrated|introduced|issued|kept|launched|made|managed|modified|moved|named|noted|obtained|opened|placed|planned|processed|produced|provided|published|raised|received|released|removed|replaced|reported|requested|required|resolved|reviewed|run|saved|scheduled|sent|set|shown|specified|started|stopped|stored|submitted|tested|triggered|updated|used|validated|verified|written)\b/gi,
    description: 'Passive voice — the actor is hidden.',
    fix: 'Rewrite to name who performed the action. e.g. "The bug has been fixed" → "The team fixed the bug".',
    category: "passive",
  },
  {
    name: "Passive voice — will be",
    regex: /\bwill\s+be\s+(?:\w+ly\s+)?(abused|accepted|added|affected|allowed|analysed|analyzed|approved|assigned|assumed|built|called|cancelled|canceled|changed|checked|closed|collected|completed|configured|confirmed|considered|controlled|converted|created|defined|deleted|deployed|described|designed|detected|determined|developed|disabled|discovered|done|enabled|established|evaluated|expected|extended|fixed|found|generated|given|handled|identified|implemented|improved|included|increased|installed|integrated|introduced|issued|kept|launched|made|managed|modified|moved|named|noted|obtained|opened|placed|planned|processed|produced|provided|published|raised|received|released|removed|replaced|reported|requested|required|resolved|reviewed|run|saved|scheduled|sent|set|shown|specified|started|stopped|stored|submitted|tested|triggered|updated|used|validated|verified|written)\b/gi,
    description: 'Future passive — who will do it is unclear.',
    fix: 'Name who will act. e.g. "The report will be sent" → "We will send the report".',
    category: "passive",
  },

  // WEAK VERBS & CONSTRUCTIONS
  {
    name: "Weak verb — utilize",
    regex: /\butilize[sd]?\b/gi,
    description: '"Utilize" is a bloated synonym for "use".',
    fix: 'Replace with "use". Every time.',
    category: "weak",
  },
  {
    name: "Weak verb — utilization",
    regex: /\butilization\b/gi,
    description: '"Utilization" nominalises the simple verb "use".',
    fix: 'Rewrite using the verb: "using X" instead of "utilization of X".',
    category: "weak",
  },
  {
    name: "Weak verb — leverage",
    regex: /\bleverag(?:e[sd]?|ing)\b/gi,
    description: '"Leverage" as a verb is overused business jargon.',
    fix: 'Replace with "use", "apply", "build on", or "take advantage of".',
    category: "weak",
  },
  {
    name: "Weak verb — facilitate",
    regex: /\bfacilitat(?:e[sd]?|ing|ion)\b/gi,
    description: '"Facilitate" is vague — it says nothing specific.',
    fix: 'Use "enable", "help", "allow", "support", or "make possible".',
    category: "weak",
  },
  {
    name: "Weak verb — enable",
    regex: /\benable[sd]?\b/gi,
    description: '"Enable" is often vague in technical writing.',
    fix: 'Be specific — what exactly does it let the user do? Name it.',
    category: "weak",
  },
  {
    name: "Weak verb — allow",
    regex: /\ballow[s]?\b/gi,
    description: '"Allows" distances the subject from the action.',
    fix: 'e.g. "allows users to export" → "users can export".',
    category: "weak",
  },
  {
    name: "Weak verb — provide",
    regex: /\bprovid(?:e[sd]?|ing)\b/gi,
    description: '"Provide" is a filler verb that delays the real action.',
    fix: 'Replace with "give", "offer", "include", or "deliver".',
    category: "weak",
  },
  {
    name: "Weak verb — perform",
    regex: /\bperform(?:s|ed|ing)?\b/gi,
    description: '"Perform" is a placeholder for a more specific verb.',
    fix: 'Use the action directly: "validates" not "performs validation".',
    category: "weak",
  },
  {
    name: "Weak verb — implement",
    regex: /\bimplement(?:s|ed|ing|ation)?\b/gi,
    description: '"Implement" is overused and rarely precise.',
    fix: 'Try "add", "build", "create", "set up", or "configure".',
    category: "weak",
  },
  {
    name: "Weak — in order to",
    regex: /\bin\s+order\s+to\b/gi,
    description: '"In order to" is always two words too many.',
    fix: 'Replace with "to". Always.',
    category: "weak",
  },
  {
    name: "Weak — the ability to",
    regex: /\bthe\s+ability\s+to\b/gi,
    description: '"The ability to" is a wordy way to say "can".',
    fix: 'e.g. "users have the ability to export" → "users can export".',
    category: "weak",
  },
  {
    name: "Weak — is able to",
    regex: /\bis\s+able\s+to\b/gi,
    description: '"Is able to" means "can". Use it.',
    fix: 'Replace with "can". Always.',
    category: "weak",
  },
  {
    name: "Weak — make use of",
    regex: /\bmake\s+use\s+of\b/gi,
    description: '"Make use of" is a roundabout way to say "use".',
    fix: 'Replace with "use". Always.',
    category: "weak",
  },

  // LONG SENTENCES — detected by findLongSentenceViolations(), not this regex.
  // The no-op regex (?!) ensures this rule never fires via the regex loop.
  {
    name: "Long sentence (30+ words)",
    regex: /(?!x)x/,
    description: 'This sentence is 30+ words — too long for easy reading.',
    fix: 'Split it into two or three shorter sentences. One idea per sentence. Aim for 25 words max.',
    category: "long",
  },

  // BANNED FILLERS
  {
    name: "Filler — simply",
    regex: /\bsimply\b/gi,
    description: '"Simply" is condescending — it implies the reader should find this obvious.',
    fix: 'Remove it. If something is simple, the prose will show it.',
    category: "banned",
  },
  {
    name: "Filler — just",
    regex: /\bjust\b/gi,
    description: '"Just" minimises and weakens authority.',
    fix: 'Remove it. e.g. "just click the button" → "click the button".',
    category: "banned",
  },
  {
    name: "Filler — obviously",
    regex: /\bobviously\b/gi,
    description: '"Obviously" alienates readers who don\'t already know.',
    fix: 'Remove it entirely.',
    category: "banned",
  },
  {
    name: "Filler — basically",
    regex: /\bbasically\b/gi,
    description: '"Basically" is vague and informal.',
    fix: 'Remove it or rewrite the sentence to be specific.',
    category: "banned",
  },
  {
    name: "Filler — very",
    regex: /\bvery\b/gi,
    description: '"Very" is a lazy intensifier that weakens the word it modifies.',
    fix: 'Use a stronger word. e.g. "very fast" → "rapid", "very important" → "critical".',
    category: "banned",
  },
  {
    name: "Filler — really",
    regex: /\breally\b/gi,
    description: '"Really" adds emphasis but no meaning.',
    fix: 'Remove it or use a precise word. e.g. "really useful" → "invaluable".',
    category: "banned",
  },
  {
    name: "Filler — quite",
    regex: /\bquite\b/gi,
    description: '"Quite" is ambiguous — it can mean "somewhat" or "completely".',
    fix: 'Remove it or use a qualifier with a specific meaning.',
    category: "banned",
  },
  {
    name: "Filler — fairly",
    regex: /\bfairly\b/gi,
    description: '"Fairly" hedges without clarifying.',
    fix: 'Remove it or use a specific qualifier.',
    category: "banned",
  },
  {
    name: "Filler — pretty",
    regex: /\bpretty\s+(?=\w)/gi,
    description: '"Pretty" as an intensifier is informal and weak.',
    fix: 'Remove it or choose a precise adjective.',
    category: "banned",
  },
  {
    name: "Filler — actually",
    regex: /\bactually\b/gi,
    description: '"Actually" sounds defensive or surprised.',
    fix: 'Remove it unless genuinely contrasting a misconception.',
    category: "banned",
  },
  {
    name: "Filler — in fact",
    regex: /\bin\s+fact\b/gi,
    description: '"In fact" rarely adds factual weight.',
    fix: 'Remove it or restructure the sentence.',
    category: "banned",
  },
  {
    name: "Filler — of course",
    regex: /\bof\s+course\b/gi,
    description: '"Of course" assumes shared knowledge and alienates readers who don\'t have it.',
    fix: 'Remove it.',
    category: "banned",
  },
  {
    name: "Filler — note that",
    regex: /\bnote\s+that\b/gi,
    description: '"Note that" is throat-clearing before the real point.',
    fix: 'Remove it and state the point directly.',
    category: "banned",
  },
  {
    name: "Filler — please note",
    regex: /\bplease\s+note\b/gi,
    description: '"Please note" is padding.',
    fix: 'Remove it and lead with the important information.',
    category: "banned",
  },
  {
    name: "Filler — it is worth noting",
    regex: /\bit\s+is\s+worth\s+noting\b/gi,
    description: '"It is worth noting" delays the point by a full clause.',
    fix: 'Remove it and state the information directly.',
    category: "banned",
  },
];


// ── 3. CATEGORY META ──────────────────────────────────────────
const CATEGORY_META = {
  passive: { label: "Passive voice",          className: "violation-passive", statKey: "errors"      },
  weak:    { label: "Weak verb/construction", className: "violation-weak",    statKey: "warnings"    },
  long:    { label: "Long sentence",          className: "violation-long",    statKey: "warnings"    },
  banned:  { label: "Banned filler word",     className: "violation-banned",  statKey: "suggestions" },
};


// ── 4. ANALYSIS ENGINE ────────────────────────────────────────

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

// Long sentence rule object — looked up once for reuse
const LONG_SENTENCE_RULE = STYLE_RULES.find(r => r.name === 'Long sentence (30+ words)');

/**
 * Find long sentences (30+ words) by splitting on sentence boundaries
 * and measuring word count. Returns violation objects with start/end offsets.
 */
function findLongSentenceViolations(text) {
  const results = [];
  if (!LONG_SENTENCE_RULE) return results;

  // Split on sentence-ending punctuation OR newlines, preserving offsets.
  // Match a run of characters that are NOT sentence terminators or newlines,
  // followed by an optional terminator — this keeps each sentence separate.
  const re = /[^.!?\n]+[.!?]?/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const sentence  = m[0];
    const trimmed   = sentence.trim();
    if (!trimmed) continue;
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    if (wordCount >= 30) {
      results.push({
        start: m.index,
        end:   m.index + m[0].length,
        text:  sentence,
        rule:  LONG_SENTENCE_RULE,
      });
    }
  }
  return results;
}

function findViolations(text) {
  const matches = [];

  // Run all regex-based rules (long sentence rule has a no-op regex, skipped naturally)
  for (const rule of STYLE_RULES) {
    const re = new RegExp(rule.regex.source, rule.regex.flags);
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m[0].length === 0) { re.lastIndex++; continue; }
      matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], rule });
    }
  }

  // Add long sentence violations from the dedicated detector
  matches.push(...findLongSentenceViolations(text));

  // Sort by start position; longer match wins on ties
  matches.sort((a, b) => a.start - b.start || b.end - a.end);

  // Remove overlaps — first/longest match wins
  // Exception: long sentence spans can overlap with word-level violations.
  // We allow word-level violations INSIDE long sentences by processing them
  // separately and merging in buildHighlightedHTML.
  const wordLevel = matches.filter(m => m.rule.category !== 'long');
  const longLevel = matches.filter(m => m.rule.category === 'long');

  // De-overlap word-level violations among themselves
  const filteredWord = [];
  let cursor = 0;
  for (const m of wordLevel) {
    if (m.start >= cursor) { filteredWord.push(m); cursor = m.end; }
  }

  // Combine: long sentence markers + word-level violations
  // Sort again so they interleave correctly for rendering
  const all = [...filteredWord, ...longLevel];
  all.sort((a, b) => a.start - b.start || b.end - a.end);

  return all;
}

/**
 * Render text with violations highlighted as <span> elements.
 * Long sentence spans wrap their content, which may itself contain
 * word-level violation spans — so we render them nested.
 */
function buildHighlightedHTML(text, violations) {
  // Separate long-sentence markers from word-level violations
  const longViolations = violations.filter(v => v.rule.category === 'long');
  const wordViolations = violations.filter(v => v.rule.category !== 'long');

  /**
   * Render a slice of text [from, to) with word-level violations
   * that fall within that range.
   */
  function renderSlice(from, to, wordViols) {
    let html = '';
    let cursor = from;
    for (const v of wordViols) {
      if (v.start >= to) break;
      if (v.start >= cursor) {
        html += escapeHtml(text.slice(cursor, v.start));
        const cls = CATEGORY_META[v.rule.category].className;
        const idx = STYLE_RULES.indexOf(v.rule);
        html += `<span class="${cls} violation" data-rule="${idx}" tabindex="0">${escapeHtml(v.text)}</span>`;
        cursor = v.end;
      }
    }
    if (cursor < to) html += escapeHtml(text.slice(cursor, to));
    return html;
  }

  let html   = '';
  let cursor = 0;

  for (const lv of longViolations) {
    // Text before this long sentence
    if (lv.start > cursor) {
      const wordsBefore = wordViolations.filter(v => v.start >= cursor && v.end <= lv.start);
      html += renderSlice(cursor, lv.start, wordsBefore);
    }

    // The long sentence itself — wrap and render word violations inside it
    const cls     = CATEGORY_META[lv.rule.category].className;
    const idx     = STYLE_RULES.indexOf(lv.rule);
    const wordsIn = wordViolations.filter(v => v.start >= lv.start && v.end <= lv.end);
    html += `<span class="${cls} violation" data-rule="${idx}" tabindex="0">${renderSlice(lv.start, lv.end, wordsIn)}</span>`;
    cursor = lv.end;
  }

  // Remaining text after last long sentence
  if (cursor < text.length) {
    const wordsAfter = wordViolations.filter(v => v.start >= cursor);
    html += renderSlice(cursor, text.length, wordsAfter);
  }

  // If no long sentences at all, just render word violations normally
  if (longViolations.length === 0) {
    html = renderSlice(0, text.length, wordViolations);
  }

  return html;
}

function countStats(violations) {
  const counts = { errors: 0, warnings: 0, suggestions: 0 };
  for (const v of violations) counts[CATEGORY_META[v.rule.category].statKey]++;
  return counts;
}

function countByCategory(violations) {
  const counts = { passive: 0, weak: 0, long: 0, banned: 0 };
  for (const v of violations) counts[v.rule.category]++;
  return counts;
}

function computeScore(violations, textLength) {
  if (textLength === 0) return null;
  const weights = { errors: 8, warnings: 4, suggestions: 2 };
  let penalty = 0;
  for (const v of violations) penalty += weights[CATEGORY_META[v.rule.category].statKey];
  return Math.max(0, Math.min(100, Math.round(100 - penalty)));
}

/** Strip all violation spans and return plain text */
function buildCleanText(text, violations) {
  // violations are already sorted by start position
  let clean = '';
  let cursor = 0;
  for (const v of violations) {
    if (v.start > cursor) clean += text.slice(cursor, v.start);
    // For fillers/weak words: keep the word but strip it? No — "clean" means
    // we keep the original words (the user rewrites them). We output the
    // plain text so the user can paste it and edit freely.
    clean += v.text;
    cursor = v.end;
  }
  if (cursor < text.length) clean += text.slice(cursor);
  return clean;
}


// ── 5. DOM WIRING ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  const textarea        = document.getElementById('doc-input');
  const analyzeBtn      = document.getElementById('analyze-btn');
  const clearBtn        = document.getElementById('clear-btn');
  const copyBtn         = document.getElementById('copy-btn');
  const copyBtnLabel    = document.getElementById('copy-btn-label');
  const resultsPanel    = document.getElementById('results-panel');
  const charCountEl     = document.getElementById('char-count');
  const statErrors      = document.getElementById('stat-errors');
  const statWarnings    = document.getElementById('stat-warnings');
  const statSuggestions = document.getElementById('stat-suggestions');
  const statScore       = document.getElementById('stat-score');
  const inputPane       = document.querySelector('.pane--input');
  const themeToggle     = document.getElementById('theme-toggle');
  const fixPopover      = document.getElementById('fix-popover');
  const fixPopoverRule  = document.getElementById('fix-popover-rule');
  const fixPopoverBody  = document.getElementById('fix-popover-body');
  const fixPopoverSugg  = document.getElementById('fix-popover-suggestion');

  // Legend badge elements
  const badges = {
    passive: document.getElementById('badge-passive'),
    weak:    document.getElementById('badge-weak'),
    long:    document.getElementById('badge-long'),
    banned:  document.getElementById('badge-banned'),
  };

  // Keep a reference to the last set of violations for copy-clean
  let lastViolations = [];
  let lastText       = '';

  if (!textarea || !analyzeBtn) {
    console.warn('StyleGuard: required DOM elements not found.');
    return;
  }

  // ── Pre-load example text whenever textarea is empty ───────
  // Always show example text on load if the user hasn't typed anything.
  // This ensures new and returning users always have something to work with.
  if (!textarea.value.trim()) {
    textarea.value = EXAMPLE_TEXT;
  }

  // ── Character counter ─────────────────────────────────────
  function updateCharCount() {
    if (charCountEl) charCountEl.textContent = textarea.value.length.toLocaleString();
  }
  textarea.addEventListener('input', updateCharCount);
  updateCharCount();

  // ── Stat updater ──────────────────────────────────────────
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

  // ── Legend badge updater ──────────────────────────────────
  function updateLegendBadges(categoryCounts) {
    for (const [cat, el] of Object.entries(badges)) {
      if (!el) continue;
      const count = categoryCounts[cat] || 0;
      if (count > 0) {
        el.textContent = count;
        el.removeAttribute('hidden');
      } else {
        el.setAttribute('hidden', '');
      }
    }
  }

  function resetLegendBadges() {
    for (const el of Object.values(badges)) {
      if (el) el.setAttribute('hidden', '');
    }
  }

  // ── Empty state ───────────────────────────────────────────
  function showEmpty(message) {
    resultsPanel.classList.remove('has-results');
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

  // ── FIX POPOVER ───────────────────────────────────────────
  function showPopover(targetEl, rule) {
    fixPopoverRule.textContent = rule.name;
    fixPopoverBody.textContent = rule.description;
    fixPopoverSugg.textContent = rule.fix || '';
    fixPopoverSugg.hidden = !rule.fix;
    fixPopover.removeAttribute('hidden');

    // Position below the clicked element
    const rect    = targetEl.getBoundingClientRect();
    const panelRect = resultsPanel.getBoundingClientRect();
    const scrollTop = resultsPanel.scrollTop;

    let top  = rect.bottom - panelRect.top + scrollTop + 6;
    let left = rect.left   - panelRect.left;

    // Keep within panel bounds
    const popoverWidth = 280;
    if (left + popoverWidth > panelRect.width - 8) {
      left = panelRect.width - popoverWidth - 8;
    }
    if (left < 8) left = 8;

    fixPopover.style.top  = `${top}px`;
    fixPopover.style.left = `${left}px`;
  }

  function hidePopover() {
    fixPopover.setAttribute('hidden', '');
  }

  // Delegate click on violations in results panel
  resultsPanel.addEventListener('click', (e) => {
    const span = e.target.closest('.violation');
    if (!span) { hidePopover(); return; }

    // If already showing for this element, toggle off
    if (!fixPopover.hidden && fixPopover._anchor === span) {
      hidePopover();
      fixPopover._anchor = null;
      return;
    }

    const ruleIdx = parseInt(span.dataset.rule, 10);
    const rule    = STYLE_RULES[ruleIdx];
    if (!rule) return;

    fixPopover._anchor = span;
    showPopover(span, rule);
    e.stopPropagation();
  });

  // Keyboard: Enter/Space on focused violation
  resultsPanel.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const span = e.target.closest('.violation');
    if (!span) return;
    e.preventDefault();
    span.click();
  });

  // Close popover on outside click or scroll
  document.addEventListener('click', (e) => {
    if (!fixPopover.hidden && !fixPopover.contains(e.target)) {
      hidePopover();
      fixPopover._anchor = null;
    }
  });

  resultsPanel.addEventListener('scroll', hidePopover);

  // ── ANALYZE ───────────────────────────────────────────────
  function runAnalysis() {
    const text = textarea.value;
    hidePopover();

    if (!text.trim()) {
      showEmpty('Paste some documentation above, then click Analyze.');
      resetStats();
      resetLegendBadges();
      lastViolations = [];
      lastText = '';
      if (copyBtn) copyBtn.setAttribute('hidden', '');
      return;
    }

    const violations = findViolations(text);
    lastViolations   = violations;
    lastText         = text;

    if (violations.length === 0) {
      resultsPanel.classList.remove('has-results');
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
      resetLegendBadges();
      if (copyBtn) copyBtn.setAttribute('hidden', '');
    } else {
      resultsPanel.classList.add('has-results');
      resultsPanel.innerHTML = buildHighlightedHTML(text, violations);
      updateLegendBadges(countByCategory(violations));
      if (copyBtn) copyBtn.removeAttribute('hidden');
      if (copyBtnLabel) copyBtnLabel.textContent = 'Copy clean';
    }

    const counts = countStats(violations);
    const score  = computeScore(violations, text.length);
    setStat(statErrors,      counts.errors);
    setStat(statWarnings,    counts.warnings);
    setStat(statSuggestions, counts.suggestions);
    setStat(statScore,       score);
  }

  analyzeBtn.addEventListener('click', runAnalysis);

  // ── COPY CLEAN TEXT ───────────────────────────────────────
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      if (!lastText) return;
      const clean = buildCleanText(lastText, lastViolations);
      try {
        await navigator.clipboard.writeText(clean);
        if (copyBtnLabel) {
          copyBtnLabel.textContent = 'Copied!';
          setTimeout(() => {
            if (copyBtnLabel) copyBtnLabel.textContent = 'Copy clean';
          }, 2000);
        }
      } catch {
        // Fallback for browsers without clipboard API
        const ta = document.createElement('textarea');
        ta.value = clean;
        ta.style.position = 'fixed';
        ta.style.opacity  = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        if (copyBtnLabel) {
          copyBtnLabel.textContent = 'Copied!';
          setTimeout(() => {
            if (copyBtnLabel) copyBtnLabel.textContent = 'Copy clean';
          }, 2000);
        }
      }
    });
  }

  // ── CLEAR ─────────────────────────────────────────────────
  function clearAll() {
    textarea.value = '';
    updateCharCount();
    showEmpty('Run an analysis to see highlighted violations here.');
    resetStats();
    resetLegendBadges();
    hidePopover();
    lastViolations = [];
    lastText = '';
    if (copyBtn) copyBtn.setAttribute('hidden', '');
    textarea.focus();
  }

  clearBtn.addEventListener('click', clearAll);

  // ── KEYBOARD SHORTCUT Cmd/Ctrl + Enter ────────────────────
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      runAnalysis();
    }
    if (e.key === 'Escape') hidePopover();
  });

  // ── DRAG AND DROP ─────────────────────────────────────────
  if (inputPane) {
    inputPane.addEventListener('dragover', (e) => {
      e.preventDefault();
      inputPane.classList.add('drag-over');
    });
    inputPane.addEventListener('dragleave', () => inputPane.classList.remove('drag-over'));
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
        resetLegendBadges();
        if (copyBtn) copyBtn.setAttribute('hidden', '');
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
    try { localStorage.setItem('sg-theme', theme); } catch { /* ignore */ }
    if (themeToggle) {
      themeToggle.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  if (themeToggle) {
    setTheme(getTheme());
    themeToggle.addEventListener('click', () => {
      const next = getTheme() === 'dark' ? 'light' : 'dark';
      setTheme(next);
      themeToggle.classList.remove('toggling');
      void themeToggle.offsetWidth;
      themeToggle.classList.add('toggling');
      themeToggle.addEventListener('animationend',
        () => themeToggle.classList.remove('toggling'), { once: true });
    });
  }

  // ── Initial state ─────────────────────────────────────────
  showEmpty('Run an analysis to see highlighted violations here.');
  updateCharCount();

});


// ── 6. CHANGELOG — GitHub Releases ───────────────────────────

const GITHUB_OWNER = 'lukepekala1-afk';
const GITHUB_REPO  = 'style-guard';
const RELEASES_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`;

function formatReleaseDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return iso.slice(0, 10); }
}

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

async function fetchReleases() {
  const CACHE_KEY = 'sg-releases-cache';
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) { renderReleases(JSON.parse(cached)); return; }
  } catch { /* ignore */ }
  try {
    const res = await fetch(RELEASES_URL, { headers: { Accept: 'application/vnd.github+json' } });
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

document.addEventListener('DOMContentLoaded', () => {
  const footerToggle = document.getElementById('changelog-toggle');
  const versionTag   = document.getElementById('version-tag');
  const panel        = document.getElementById('changelog-panel');
  if (!panel) return;

  let loaded = false;

  function openPanel() {
    panel.removeAttribute('hidden');
    if (footerToggle) footerToggle.setAttribute('aria-expanded', 'true');
    if (versionTag)   versionTag.setAttribute('aria-expanded', 'true');
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


// ── 7. MODULE EXPORT ──────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { STYLE_RULES, CATEGORY_META, findViolations, buildHighlightedHTML, countStats, computeScore };
}
