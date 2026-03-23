/**
 * StyleGuard — app.js
 * Documentation style checker
 * All analysis runs client-side; no data leaves the browser.
 */

"use strict";

/* ─────────────────────────────────────────
   Style Rules
───────────────────────────────────────── */
const STYLE_RULES = {
  passive: {
    type: "passive",
    label: "Passive voice",
    // Matches "be/been/being/is/are/was/were/will be + past participle"
    pattern:
      /\b(is|are|was|were|be|been|being|will\s+be|has\s+been|have\s+been|had\s+been)\s+(\w+ed|built|done|found|given|gone|known|made|put|seen|set|shown|taken|told|used|written)\b/gi,
    tip: "Consider rewriting in active voice for clarity.",
  },
  weak: {
    type: "weak",
    label: "Weak verb",
    pattern:
      /\b(utilize|utilizes|utilized|leverage|leverages|leveraged|facilitate|facilitates|facilitated|endeavour|endeavor|commence|commences|commenced|implement|implements|implemented|perform|performs|performed|conduct|conducts|conducted|achieve|achieves|achieved|enable|enables|enabled)\b/gi,
    tip: "Replace with a simpler, more direct verb.",
  },
  abbr: {
    type: "abbr",
    label: "Undefined abbreviation",
    // Capital letter sequences 2–5 chars that are not common words
    pattern: /\b([A-Z]{2,5})\b/g,
    tip: 'Define this abbreviation on first use, e.g. "API (Application Programming Interface)".',
    filter: (match) => {
      const common = new Set([
        "I",
        "OK",
        "US",
        "EU",
        "UK",
        "UN",
        "HTML",
        "CSS",
        "JSON",
        "XML",
        "URL",
        "SQL",
        "API",
        "SDK",
        "CLI",
        "HTTP",
        "HTTPS",
        "REST",
        "AI",
        "ML",
        "ID",
        "PDF",
        "UI",
        "UX",
      ]);
      return !common.has(match[1]);
    },
  },
  term: {
    type: "term",
    label: "Inconsistent terminology",
    // Check for mixed use of synonymous pairs
    terms: [
      ["login", "log in", "log-in"],
      ["setup", "set up", "set-up"],
      ["email", "e-mail"],
      ["dropdown", "drop-down", "drop down"],
      ["username", "user name", "user-name"],
      ["filename", "file name", "file-name"],
      ["backend", "back-end", "back end"],
      ["frontend", "front-end", "front end"],
    ],
  },
};

const LONG_SENTENCE_WORDS = 30;

/* ─────────────────────────────────────────
   DOM References
───────────────────────────────────────── */
const docInput = document.getElementById("doc-input");
const analyzeBtn = document.getElementById("analyze-btn");
const clearBtn = document.getElementById("clear-btn");
const statsBar = document.getElementById("stats-bar");
const resultsPanel = document.getElementById("results-panel");
const charCounter = document.getElementById("char-counter");
const copyResultsBtn = document.getElementById("copy-results-btn");

// Stats chips
const statPassive = document.getElementById("stat-passive");
const statWeak = document.getElementById("stat-weak");
const statLong = document.getElementById("stat-long");
const statAbbr = document.getElementById("stat-abbr");
const statTerms = document.getElementById("stat-terms");
const statTotal = document.getElementById("stat-total");

// Stats bar states
const statsEmpty = statsBar.querySelector(".stats-empty-state");
const statsItems = statsBar.querySelector(".stats-items");

// Results panel states
const resultsIdle = document.getElementById("results-idle");
const resultsLoading = document.getElementById("results-loading");
const resultsOutput = document.getElementById("results-output");
const resultsLegend = document.getElementById("results-legend");

/* ─────────────────────────────────────────
   State
───────────────────────────────────────── */
let lastAnalysisText = "";

/* ─────────────────────────────────────────
   Character counter
───────────────────────────────────────── */
docInput.addEventListener("input", () => {
  const len = docInput.value.length;
  charCounter.textContent =
    len.toLocaleString() + " char" + (len === 1 ? "" : "s");
});

/* ─────────────────────────────────────────
   Analyze
───────────────────────────────────────── */
analyzeBtn.addEventListener("click", runAnalysis);
docInput.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") runAnalysis();
});

function runAnalysis() {
  const text = docInput.value.trim();
  if (!text) {
    flashTextarea();
    return;
  }

  lastAnalysisText = text;

  // Show loading
  showState("loading");

  // Simulate brief async work for UX feedback (all work is sync)
  setTimeout(() => {
    const result = analyze(text);
    renderStats(result.counts);
    renderOutput(result.html);
    showState("results");
    copyResultsBtn.disabled = false;
  }, 320);
}

/* ─────────────────────────────────────────
   Clear
───────────────────────────────────────── */
clearBtn.addEventListener("click", () => {
  docInput.value = "";
  charCounter.textContent = "0 chars";
  lastAnalysisText = "";
  copyResultsBtn.disabled = true;
  showState("idle");
  resetStats();
  docInput.focus();
});

/* ─────────────────────────────────────────
   Copy results
───────────────────────────────────────── */
copyResultsBtn.addEventListener("click", async () => {
  const plain = resultsOutput.textContent || "";
  try {
    await navigator.clipboard.writeText(plain);
    copyResultsBtn.textContent = "Copied!";
    setTimeout(() => {
      copyResultsBtn.textContent = "Copy report";
    }, 1800);
  } catch {
    copyResultsBtn.textContent = "Failed";
    setTimeout(() => {
      copyResultsBtn.textContent = "Copy report";
    }, 1800);
  }
});

/* ─────────────────────────────────────────
   Core Analyzer
───────────────────────────────────────── */
function analyze(text) {
  const counts = { passive: 0, weak: 0, long: 0, abbr: 0, terms: 0 };

  // ── Detect inconsistent terminology ──
  // Find which terms from each synonym group appear in the text
  const termMatches = new Map(); // group index → Set of variants found
  STYLE_RULES.term.terms.forEach((group, i) => {
    const found = new Set();
    group.forEach((variant) => {
      const re = new RegExp(`\\b${escapeRegex(variant)}\\b`, "gi");
      if (re.test(text)) found.add(variant);
    });
    if (found.size > 1) {
      termMatches.set(i, found);
    }
  });

  // Build a map of positions to highlight for terminology
  const termPositions = []; // { start, end, group }
  termMatches.forEach((variants, groupIdx) => {
    variants.forEach((variant) => {
      const re = new RegExp(`\\b${escapeRegex(variant)}\\b`, "gi");
      let m;
      while ((m = re.exec(text)) !== null) {
        termPositions.push({
          start: m.index,
          end: m.index + m[0].length,
          word: m[0],
          groupIdx,
        });
      }
    });
    counts.terms += variants.size;
  });

  // ── Build highlights map (offset → highlight info) ──
  // We'll collect all ranges with type, then sort and apply
  const ranges = [];

  // Passive voice
  {
    const re = new RegExp(
      STYLE_RULES.passive.pattern.source,
      STYLE_RULES.passive.pattern.flags
    );
    let m;
    while ((m = re.exec(text)) !== null) {
      counts.passive++;
      ranges.push({
        start: m.index,
        end: m.index + m[0].length,
        type: "passive",
        tip: STYLE_RULES.passive.tip,
      });
    }
  }

  // Weak verbs
  {
    const re = new RegExp(
      STYLE_RULES.weak.pattern.source,
      STYLE_RULES.weak.pattern.flags
    );
    let m;
    while ((m = re.exec(text)) !== null) {
      counts.weak++;
      ranges.push({
        start: m.index,
        end: m.index + m[0].length,
        type: "weak",
        tip: STYLE_RULES.weak.tip,
      });
    }
  }

  // Abbreviations
  {
    const re = new RegExp(
      STYLE_RULES.abbr.pattern.source,
      STYLE_RULES.abbr.pattern.flags
    );
    let m;
    const seen = new Set();
    while ((m = re.exec(text)) !== null) {
      if (STYLE_RULES.abbr.filter(m) && !seen.has(m[1].toLowerCase())) {
        // Only flag first occurrence
        seen.add(m[1].toLowerCase());
        counts.abbr++;
        ranges.push({
          start: m.index,
          end: m.index + m[0].length,
          type: "abbr",
          tip: STYLE_RULES.abbr.tip,
        });
      }
    }
  }

  // Terminology
  termPositions.forEach(({ start, end, word, groupIdx }) => {
    const group = STYLE_RULES.term.terms[groupIdx];
    const others = group
      .filter((v) => v.toLowerCase() !== word.toLowerCase())
      .join(", ");
    ranges.push({
      start,
      end,
      type: "term",
      tip: `Inconsistent with: "${others}". Pick one form and use it throughout.`,
    });
  });

  // Long sentences
  const sentences = splitSentences(text);
  sentences.forEach(({ value, start }) => {
    const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount >= LONG_SENTENCE_WORDS) {
      counts.long++;
      ranges.push({
        start,
        end: start + value.length,
        type: "long",
        tip: `This sentence is ${wordCount} words. Consider splitting it at ${LONG_SENTENCE_WORDS}+ words.`,
      });
    }
  });

  // ── Build annotated HTML ──
  const html = buildHighlightedHTML(text, ranges);

  return { counts, html };
}

/* ─────────────────────────────────────────
   Build highlighted HTML
───────────────────────────────────────── */
function buildHighlightedHTML(text, ranges) {
  if (!ranges.length) {
    return `<p class="no-violations">✓ No style violations found. Great work!</p>${escapeHtml(
      text
    ).replace(/\n/g, "<br>")}`;
  }

  // Sort ranges by start; for overlaps prefer narrower range
  ranges.sort((a, b) => a.start - b.start || b.end - a.end);

  // Remove fully overlapping ranges (keep the first/narrower one)
  const clean = [];
  let cursor = 0;
  for (const r of ranges) {
    if (r.start >= cursor) {
      clean.push(r);
      cursor = r.end;
    }
  }

  let html = "";
  let pos = 0;
  for (const r of clean) {
    if (r.start > pos) {
      html += escapeHtml(text.slice(pos, r.start)).replace(/\n/g, "<br>");
    }
    const word = escapeHtml(text.slice(r.start, r.end));
    const tip = escapeAttr(r.tip);
    html += `<mark data-type="${
      r.type
    }" title="${tip}" aria-label="${escapeAttr(
      r.type
    )} issue: ${tip}">${word}</mark>`;
    pos = r.end;
  }
  if (pos < text.length) {
    html += escapeHtml(text.slice(pos)).replace(/\n/g, "<br>");
  }

  return html;
}

/* ─────────────────────────────────────────
   Split text into sentences with offsets
───────────────────────────────────────── */
function splitSentences(text) {
  const results = [];
  // Split on sentence-ending punctuation followed by whitespace or EOL
  const re = /[^.!?]*[.!?]+[\s]*/g;
  let m;
  let lastEnd = 0;
  while ((m = re.exec(text)) !== null) {
    results.push({ value: m[0], start: m.index });
    lastEnd = m.index + m[0].length;
  }
  // Capture any remaining text without trailing punctuation
  if (lastEnd < text.length) {
    results.push({ value: text.slice(lastEnd), start: lastEnd });
  }
  return results;
}

/* ─────────────────────────────────────────
   Render Stats
───────────────────────────────────────── */
function renderStats(counts) {
  statPassive.textContent = counts.passive;
  statWeak.textContent = counts.weak;
  statLong.textContent = counts.long;
  statAbbr.textContent = counts.abbr;
  statTerms.textContent = counts.terms;
  const total =
    counts.passive + counts.weak + counts.long + counts.abbr + counts.terms;
  statTotal.textContent = total;

  statsEmpty.setAttribute("aria-hidden", "true");
  statsEmpty.hidden = true;
  statsItems.setAttribute("aria-hidden", "false");
  statsItems.hidden = false;
}

function resetStats() {
  statsEmpty.removeAttribute("aria-hidden");
  statsEmpty.hidden = false;
  statsItems.setAttribute("aria-hidden", "true");
  statsItems.hidden = true;
}

/* ─────────────────────────────────────────
   Render Output
───────────────────────────────────────── */
function renderOutput(html) {
  resultsOutput.innerHTML = html;
}

/* ─────────────────────────────────────────
   UI State Machine
───────────────────────────────────────── */
function showState(state) {
  // All hidden first
  resultsIdle.hidden = true;
  resultsLoading.hidden = true;
  resultsOutput.hidden = true;
  resultsLegend.hidden = true;

  if (state === "idle") {
    resultsIdle.hidden = false;
  } else if (state === "loading") {
    resultsLoading.hidden = false;
  } else if (state === "results") {
    resultsOutput.hidden = false;
    resultsLegend.hidden = false;
  }
}

/* ─────────────────────────────────────────
   Textarea flash on empty submit
───────────────────────────────────────── */
function flashTextarea() {
  const wrapper = docInput.closest(".textarea-wrapper");
  wrapper.style.transition = "none";
  wrapper.style.borderColor = "var(--critical-text)";
  wrapper.style.boxShadow = "0 0 0 3px var(--critical-bg)";
  docInput.focus();
  setTimeout(() => {
    wrapper.style.transition = "";
    wrapper.style.borderColor = "";
    wrapper.style.boxShadow = "";
  }, 600);
}

/* ─────────────────────────────────────────
   Utilities
───────────────────────────────────────── */
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
