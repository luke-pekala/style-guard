/**
 * STYLE GUARD — app.js
 * Wires up: analyze-btn, clear-btn, doc-input, stats-bar, results-panel
 */

/* ═══════════════════════════════════════════
   RULE DEFINITIONS
═══════════════════════════════════════════ */
const RULES = {
  passive: {
    label: "Passive Voice",
    patterns: [
      /\b(is|are|was|were|be|been|being)\s+([\w]+ed)\b/gi,
      /\b(is|are|was|were)\s+being\s+([\w]+ed)\b/gi,
      /\b(has|have|had)\s+been\s+([\w]+ed)\b/gi,
    ],
  },
  complex: {
    label: "High Complexity",
    // Sentences with >30 words are flagged as high complexity
    sentenceWordThreshold: 30,
  },
  jargon: {
    label: "Jargon",
    terms: [
      "utilize",
      "utilization",
      "leverage",
      "synergy",
      "synergize",
      "paradigm shift",
      "boil the ocean",
      "circle back",
      "move the needle",
      "deep dive",
      "low-hanging fruit",
      "bandwidth",
      "scalable",
      "impactful",
      "actionable",
      "deliverable",
      "granular",
      "robust solution",
      "in order to",
      "touch base",
      "take offline",
      "end of day",
      "going forward",
    ],
  },
  casing: {
    label: "Casing",
    // Looks for all-caps words that aren't acronyms, and inconsistent title casing
    patterns: [
      /\b([A-Z]{4,})\b/g, // Long all-caps words (non-acronym)
      /\b(I[a-z])\b/g, // "Iwant", "Ican" etc — missing space
    ],
  },
};

/* ═══════════════════════════════════════════
   ELEMENT REFS
═══════════════════════════════════════════ */
const docInput = document.getElementById("doc-input");
const analyzeBtn = document.getElementById("analyze-btn");
const clearBtn = document.getElementById("clear-btn");
const statsBar = document.getElementById("stats-bar");
const resultsPanel = document.getElementById("results-panel");
const resultsOutput = document.getElementById("results-output");

const statTotal = document.getElementById("stat-total");
const statPassive = document.getElementById("stat-passive");
const statComplex = document.getElementById("stat-complex");
const statJargon = document.getElementById("stat-jargon");
const statCasing = document.getElementById("stat-casing");
const statScore = document.getElementById("stat-score");
const scoreBarFill = document.getElementById("score-bar-fill");
const charCountEl = document.querySelector(".char-count");
const downloadBtn = document.getElementById("download-btn");

/* ═══════════════════════════════════════════
   CHAR COUNT
═══════════════════════════════════════════ */
docInput.addEventListener("input", () => {
  const len = docInput.value.length;
  charCountEl.textContent = `${len.toLocaleString()} character${
    len !== 1 ? "s" : ""
  }`;
});

/* ═══════════════════════════════════════════
   KEYBOARD SHORTCUT  ⌘+Enter / Ctrl+Enter
═══════════════════════════════════════════ */
docInput.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.preventDefault();
    runAnalysis();
  }
});

/* ═══════════════════════════════════════════
   DOWNLOAD BUTTON
═══════════════════════════════════════════ */
downloadBtn.addEventListener("click", downloadReport);

/* ═══════════════════════════════════════════
   ANALYZE BUTTON
═══════════════════════════════════════════ */
analyzeBtn.addEventListener("click", runAnalysis);

/* ═══════════════════════════════════════════
   CLEAR BUTTON
═══════════════════════════════════════════ */
clearBtn.addEventListener("click", () => {
  docInput.value = "";
  charCountEl.textContent = "0 characters";
  resultsOutput.innerHTML = "";
  resetStats();
  downloadBtn.disabled = true;
  downloadBtn.classList.remove("downloaded");
  docInput.focus();
});

/* ═══════════════════════════════════════════
   ACTIVE RULE TOGGLES
═══════════════════════════════════════════ */
function getActiveRules() {
  const checks = document.querySelectorAll(
    '.rule-toggles input[type="checkbox"]'
  );
  return Array.from(checks)
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);
}

/* ═══════════════════════════════════════════
   MAIN ANALYSIS
═══════════════════════════════════════════ */
function runAnalysis() {
  const text = docInput.value.trim();
  if (!text) {
    shakeElement(docInput);
    docInput.focus();
    return;
  }

  // Loading state
  analyzeBtn.classList.add("loading");
  analyzeBtn.disabled = true;

  // Small defer to allow repaint
  setTimeout(() => {
    try {
      const activeRules = getActiveRules();
      const violations = collectViolations(text, activeRules);
      const highlighted = buildHighlightedHTML(text, violations);

      renderResults(highlighted, violations);
    } catch (err) {
      console.error("StyleGuard analysis error:", err);
    } finally {
      analyzeBtn.classList.remove("loading");
      analyzeBtn.disabled = false;
    }
  }, 60);
}

/* ═══════════════════════════════════════════
   COLLECT VIOLATIONS
   Returns array of { start, end, type }
═══════════════════════════════════════════ */
function collectViolations(text, activeRules) {
  const violations = [];

  // ── Passive Voice ──
  if (activeRules.includes("passive")) {
    for (const pattern of RULES.passive.patterns) {
      pattern.lastIndex = 0;
      let m;
      while ((m = pattern.exec(text)) !== null) {
        violations.push({
          start: m.index,
          end: m.index + m[0].length,
          type: "passive",
          match: m[0],
        });
      }
    }
  }

  // ── Jargon ──
  if (activeRules.includes("jargon")) {
    for (const term of RULES.jargon.terms) {
      const re = new RegExp(`\\b${escapeRegex(term)}\\b`, "gi");
      let m;
      while ((m = re.exec(text)) !== null) {
        violations.push({
          start: m.index,
          end: m.index + m[0].length,
          type: "jargon",
          match: m[0],
        });
      }
    }
  }

  // ── Casing ──
  if (activeRules.includes("casing")) {
    for (const pattern of RULES.casing.patterns) {
      pattern.lastIndex = 0;
      let m;
      while ((m = pattern.exec(text)) !== null) {
        // Ignore known common acronyms
        const knownAcronyms =
          /^(API|URL|HTML|CSS|JS|JSON|HTTP|HTTPS|ID|SDK|CLI|GUI|FAQ|SQL|XML|PDF|PNG|SVG|RGB|CSS|UI|UX|QA|CI|CD)$/i;
        if (!knownAcronyms.test(m[0])) {
          violations.push({
            start: m.index,
            end: m.index + m[0].length,
            type: "casing",
            match: m[0],
          });
        }
      }
    }
  }

  // ── Complexity (sentence-level) ──
  if (activeRules.includes("complex")) {
    const sentenceRe = /[^.!?]+[.!?]+/g;
    let m;
    while ((m = sentenceRe.exec(text)) !== null) {
      const wordCount = m[0].trim().split(/\s+/).length;
      if (wordCount > RULES.complex.sentenceWordThreshold) {
        violations.push({
          start: m.index,
          end: m.index + m[0].length,
          type: "complex",
          match: m[0],
        });
      }
    }
  }

  // De-overlap: remove duplicates & overlapping ranges
  return deoverlap(violations);
}

/* ═══════════════════════════════════════════
   DE-OVERLAP VIOLATIONS
═══════════════════════════════════════════ */
function deoverlap(violations) {
  // Sort by start, then length descending (prefer longer spans)
  const sorted = [...violations].sort(
    (a, b) => a.start - b.start || b.end - b.start - (a.end - a.start)
  );
  const result = [];
  let cursor = 0;
  for (const v of sorted) {
    if (v.start >= cursor) {
      result.push(v);
      cursor = v.end;
    }
  }
  return result;
}

/* ═══════════════════════════════════════════
   BUILD HIGHLIGHTED HTML
═══════════════════════════════════════════ */
function buildHighlightedHTML(text, violations) {
  let html = "";
  let cursor = 0;

  for (const v of violations) {
    // Safe text before this violation
    if (v.start > cursor) {
      html += escapeHTML(text.slice(cursor, v.start));
    }
    const span = escapeHTML(text.slice(v.start, v.end));
    const title = RULES[v.type].label;
    html += `<mark data-type="${v.type}" title="${title}: ${escapeAttr(
      span
    )}">${span}</mark>`;
    cursor = v.end;
  }

  // Remaining text
  if (cursor < text.length) {
    html += escapeHTML(text.slice(cursor));
  }

  return html;
}

/* ═══════════════════════════════════════════
   RENDER RESULTS INTO DOM
═══════════════════════════════════════════ */
function renderResults(html, violations) {
  // Counts per type
  const counts = { passive: 0, complex: 0, jargon: 0, casing: 0 };
  for (const v of violations) counts[v.type]++;
  const total = violations.length;

  // Score: 100 minus 5 per violation, floor 0
  const score = Math.max(0, Math.min(100, 100 - total * 5));

  // Reveal stats bar FIRST — elements are display:none until state=loaded
  statsBar.dataset.state = "loaded";

  // Now write values (elements are visible)
  statTotal.textContent = total;
  statPassive.textContent = counts.passive;
  statComplex.textContent = counts.complex;
  statJargon.textContent = counts.jargon;
  statCasing.textContent = counts.casing;
  statScore.textContent = score;

  // Trigger score bar fill in next frame so CSS transition fires
  requestAnimationFrame(() => {
    scoreBarFill.style.width = `${score}%`;
  });

  // Score color
  statScore.style.color =
    score >= 80
      ? "var(--clr-casing)"
      : score >= 50
      ? "var(--accent)"
      : "var(--clr-complex)";

  // Enable download button
  downloadBtn.disabled = false;
  downloadBtn.classList.remove("downloaded");

  // Update results panel
  resultsOutput.innerHTML = html;
  resultsOutput.style.animation = "none";
  void resultsOutput.offsetWidth; // force reflow
  resultsOutput.style.animation = "";

  // Scroll results into view on mobile
  if (window.innerWidth < 900) {
    resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Announce to screen readers
  const msg =
    total === 0
      ? "Analysis complete. No violations found."
      : `Analysis complete. ${total} violation${total !== 1 ? "s" : ""} found.`;
  announceToSR(msg);
}

/* ═══════════════════════════════════════════
   RESET STATS
═══════════════════════════════════════════ */
function resetStats() {
  statsBar.dataset.state = "empty";
  [
    statTotal,
    statPassive,
    statComplex,
    statJargon,
    statCasing,
    statScore,
  ].forEach((el) => {
    el.textContent = "—";
  });
  scoreBarFill.style.width = "0%";
  statScore.style.color = "";
}

/* ═══════════════════════════════════════════
   DOWNLOAD REPORT
═══════════════════════════════════════════ */
function downloadReport() {
  const text = docInput.value.trim();
  const outputHTML = resultsOutput.innerHTML;
  if (!outputHTML) return;

  const total = statTotal.textContent;
  const passive = statPassive.textContent;
  const complex = statComplex.textContent;
  const jargon = statJargon.textContent;
  const casing = statCasing.textContent;
  const score = statScore.textContent;
  const date = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const scoreNum = parseInt(score, 10);
  const scoreColor =
    scoreNum >= 80 ? "#52d9b0" : scoreNum >= 50 ? "#f0c040" : "#ff8c5a";

  const reportHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>StyleGuard Report — ${date}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=IBM+Plex+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0c0c0e; --surface: #141418; --surface-2: #1c1c22;
      --border: #2a2a36; --text: #e8e8f0; --text-muted: #7a7a92; --text-dim: #4a4a62;
      --accent: #f0c040;
      --clr-passive: #7b9cff; --clr-complex: #ff8c5a; --clr-jargon: #b87bff; --clr-casing: #52d9b0;
      --clr-passive-bg: rgba(123,156,255,0.12); --clr-complex-bg: rgba(255,140,90,0.12);
      --clr-jargon-bg: rgba(184,123,255,0.12);  --clr-casing-bg: rgba(82,217,176,0.12);
    }
    body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif;
           font-size: 15px; line-height: 1.65; padding: 0; -webkit-font-smoothing: antialiased; }

    /* ── Page shell ── */
    .page { max-width: 900px; margin: 0 auto; padding: 48px 32px 80px; }

    /* ── Report header ── */
    .report-header { border-bottom: 1px solid var(--border); padding-bottom: 28px; margin-bottom: 36px; }
    .report-brand { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
    .report-shield {
      width: 44px; height: 44px; background: var(--accent); border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      color: #0c0c0e; flex-shrink: 0;
      box-shadow: 0 0 20px rgba(240,192,64,0.3);
    }
    .report-title { font-family: 'Syne', sans-serif; font-size: 1.75rem; font-weight: 800;
                    letter-spacing: -0.02em; color: var(--text); }
    .report-title span { color: var(--accent); }
    .report-subtitle { font-family: 'IBM Plex Mono', monospace; font-size: 0.75rem;
                       color: var(--text-muted); letter-spacing: 0.02em; margin-top: 3px; }
    .report-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
    .report-meta-item { font-family: 'IBM Plex Mono', monospace; font-size: 0.75rem; color: var(--text-dim); }
    .report-meta-item strong { color: var(--text-muted); }

    /* ── Score card ── */
    .score-card {
      background: var(--surface); border: 1px solid var(--border); border-radius: 14px;
      padding: 24px 28px; margin-bottom: 28px;
      display: flex; align-items: center; gap: 32px; flex-wrap: wrap;
    }
    .score-main { display: flex; flex-direction: column; align-items: center; min-width: 80px; }
    .score-num { font-family: 'Syne', sans-serif; font-size: 3rem; font-weight: 800;
                 line-height: 1; color: ${scoreColor}; }
    .score-lbl { font-family: 'IBM Plex Mono', monospace; font-size: 0.6875rem;
                 text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-dim); margin-top: 4px; }
    .score-bar-wrap { flex: 1; min-width: 140px; }
    .score-bar-track { height: 6px; background: var(--surface-2); border-radius: 3px; overflow: hidden; margin-top: 8px; }
    .score-bar-fill { height: 100%; border-radius: 3px; background: ${scoreColor};
                      width: ${Math.max(0, Math.min(100, scoreNum))}%;
                      box-shadow: 0 0 8px ${scoreColor}; }
    .stats-row { display: flex; gap: 20px; flex-wrap: wrap; }
    .stat-pill {
      display: flex; flex-direction: column; padding: 10px 16px;
      background: var(--surface-2); border-radius: 8px; min-width: 90px;
    }
    .stat-pill__label { font-family: 'IBM Plex Mono', monospace; font-size: 0.6rem;
                        text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-dim);
                        display: flex; align-items: center; gap: 5px; white-space: nowrap; }
    .stat-pill__dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; }
    .stat-pill__value { font-family: 'Syne', sans-serif; font-size: 1.25rem; font-weight: 700;
                        margin-top: 2px; color: var(--text); }
    .dot-passive { background: var(--clr-passive); }
    .dot-complex { background: var(--clr-complex); }
    .dot-jargon  { background: var(--clr-jargon); }
    .dot-casing  { background: var(--clr-casing); }

    /* ── Section headings ── */
    .section-heading {
      font-family: 'Syne', sans-serif; font-size: 0.75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-dim);
      margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
    }
    .section-heading::after { content: ''; flex: 1; height: 1px; background: var(--border); }

    /* ── Annotated doc ── */
    .annotated-doc {
      background: var(--surface); border: 1px solid var(--border); border-radius: 14px;
      padding: 28px 32px; font-family: 'IBM Plex Mono', monospace; font-size: 0.8125rem;
      line-height: 1.9; color: var(--text); white-space: pre-wrap; word-break: break-word;
      margin-bottom: 32px;
    }
    mark { border-radius: 3px; padding: 1px 3px; font-style: normal; border-bottom: 2px solid transparent; }
    mark[data-type="passive"] { background: var(--clr-passive-bg); border-bottom-color: var(--clr-passive); color: #adc2ff; }
    mark[data-type="complex"] { background: var(--clr-complex-bg); border-bottom-color: var(--clr-complex); color: #ffb08a; }
    mark[data-type="jargon"]  { background: var(--clr-jargon-bg);  border-bottom-color: var(--clr-jargon);  color: #d0aaff; }
    mark[data-type="casing"]  { background: var(--clr-casing-bg);  border-bottom-color: var(--clr-casing);  color: #80e8c8; }

    /* ── Violation list ── */
    .violation-list { list-style: none; display: flex; flex-direction: column; gap: 8px; margin-bottom: 32px; }
    .violation-item {
      display: flex; align-items: flex-start; gap: 12px;
      background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px;
    }
    .vi-badge {
      font-family: 'IBM Plex Mono', monospace; font-size: 0.6rem; text-transform: uppercase;
      letter-spacing: 0.06em; padding: 2px 7px; border-radius: 20px; white-space: nowrap;
      margin-top: 2px; flex-shrink: 0;
    }
    .vi-badge--passive { background: var(--clr-passive-bg); color: var(--clr-passive); }
    .vi-badge--complex { background: var(--clr-complex-bg); color: var(--clr-complex); }
    .vi-badge--jargon  { background: var(--clr-jargon-bg);  color: var(--clr-jargon);  }
    .vi-badge--casing  { background: var(--clr-casing-bg);  color: var(--clr-casing);  }
    .vi-text { font-family: 'IBM Plex Mono', monospace; font-size: 0.8125rem; color: var(--text-muted); }
    .vi-text strong { color: var(--text); }

    /* ── Legend ── */
    .legend { display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
              padding: 16px 0; border-top: 1px solid var(--border); }
    .legend-title { font-family: 'IBM Plex Mono', monospace; font-size: 0.6875rem;
                    text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-dim); }
    .legend-list { display: flex; flex-wrap: wrap; gap: 12px; list-style: none; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 0.75rem;
                   color: var(--text-muted); font-family: 'IBM Plex Mono', monospace; }
    .legend-swatch { display: inline-block; width: 20px; height: 6px; border-radius: 3px; }

    /* ── Footer ── */
    .report-footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid var(--border);
                     font-family: 'IBM Plex Mono', monospace; font-size: 0.6875rem; color: var(--text-dim); }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <header class="report-header">
    <div class="report-brand">
      <div class="report-shield">
        <svg width="22" height="26" viewBox="0 0 28 32" fill="none">
          <path d="M14 0L28 5.6V16C28 24.32 22.008 31.36 14 32C5.992 31.36 0 24.32 0 16V5.6L14 0Z" fill="currentColor"/>
          <path d="M8 16l4 4 8-8" stroke="#0c0c0e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div>
        <div class="report-title">Style<span>Guard</span> Report</div>
        <div class="report-subtitle">Documentation Style Analysis</div>
      </div>
    </div>
    <div class="report-meta">
      <span class="report-meta-item"><strong>Generated:</strong> ${date}</span>
      <span class="report-meta-item"><strong>Characters:</strong> ${text.length.toLocaleString()}</span>
      <span class="report-meta-item"><strong>Words:</strong> ${text
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length.toLocaleString()}</span>
    </div>
  </header>

  <!-- Score card -->
  <div class="score-card">
    <div class="score-main">
      <div class="score-num">${score}</div>
      <div class="score-lbl">Style Score</div>
      <div class="score-bar-wrap" style="width:80px;margin-top:8px;">
        <div class="score-bar-track"><div class="score-bar-fill"></div></div>
      </div>
    </div>
    <div class="stats-row">
      <div class="stat-pill">
        <span class="stat-pill__label">Total</span>
        <span class="stat-pill__value">${total}</span>
      </div>
      <div class="stat-pill">
        <span class="stat-pill__label"><span class="stat-pill__dot dot-passive"></span>Passive</span>
        <span class="stat-pill__value">${passive}</span>
      </div>
      <div class="stat-pill">
        <span class="stat-pill__label"><span class="stat-pill__dot dot-complex"></span>Complex</span>
        <span class="stat-pill__value">${complex}</span>
      </div>
      <div class="stat-pill">
        <span class="stat-pill__label"><span class="stat-pill__dot dot-jargon"></span>Jargon</span>
        <span class="stat-pill__value">${jargon}</span>
      </div>
      <div class="stat-pill">
        <span class="stat-pill__label"><span class="stat-pill__dot dot-casing"></span>Casing</span>
        <span class="stat-pill__value">${casing}</span>
      </div>
    </div>
  </div>

  <!-- Annotated document -->
  <div class="section-heading">Annotated Document</div>
  <div class="annotated-doc">${outputHTML}</div>

  <!-- Violation list -->
  <div class="section-heading">Violations Breakdown</div>
  <ul class="violation-list">
    ${buildViolationListHTML()}
  </ul>

  <!-- Legend -->
  <div class="legend">
    <span class="legend-title">Legend</span>
    <ul class="legend-list">
      <li class="legend-item"><span class="legend-swatch" style="background:var(--clr-passive)"></span>Passive voice</li>
      <li class="legend-item"><span class="legend-swatch" style="background:var(--clr-complex)"></span>High complexity</li>
      <li class="legend-item"><span class="legend-swatch" style="background:var(--clr-jargon)"></span>Jargon</li>
      <li class="legend-item"><span class="legend-swatch" style="background:var(--clr-casing)"></span>Casing issue</li>
    </ul>
  </div>

  <footer class="report-footer">
    StyleGuard &copy; 2026 &nbsp;·&nbsp; Generated automatically &nbsp;·&nbsp; Review all suggestions before applying
  </footer>
</div>
</body>
</html>`;

  const blob = new Blob([reportHTML], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const filename = `styleguard-report-${new Date()
    .toISOString()
    .slice(0, 10)}.html`;
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Brief "downloaded" feedback
  const origLabel = downloadBtn.querySelector(".btn__label").textContent;
  downloadBtn.querySelector(".btn__label").textContent = "Downloaded!";
  downloadBtn.classList.add("downloaded");
  setTimeout(() => {
    downloadBtn.querySelector(".btn__label").textContent = origLabel;
    downloadBtn.classList.remove("downloaded");
  }, 2200);
}

/* ═══════════════════════════════════════════
   BUILD VIOLATION LIST HTML (for report)
═══════════════════════════════════════════ */
function buildViolationListHTML() {
  const marks = resultsOutput.querySelectorAll("mark[data-type]");
  if (!marks.length) {
    return "<li style=\"color:var(--text-dim);font-family:'IBM Plex Mono',monospace;font-size:0.8125rem;padding:8px 0;\">No violations detected — document looks clean!</li>";
  }
  const typeLabels = {
    passive: "Passive Voice",
    complex: "High Complexity",
    jargon: "Jargon",
    casing: "Casing",
  };
  return Array.from(marks)
    .map((m) => {
      const type = m.dataset.type;
      const label = typeLabels[type] || type;
      const text =
        m.textContent.length > 80
          ? m.textContent.slice(0, 77) + "…"
          : m.textContent;
      return `<li class="violation-item">
      <span class="vi-badge vi-badge--${type}">${label}</span>
      <span class="vi-text"><strong>"${escapeHTML(text)}"</strong></span>
    </li>`;
    })
    .join("\n");
}

/* ═══════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════ */
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(str) {
  return str.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function shakeElement(el) {
  el.style.animation = "none";
  el.style.transition = "border-color 80ms";
  el.style.borderColor = "var(--clr-complex)";
  el.style.boxShadow = "0 0 0 3px rgba(255,140,90,0.2)";
  setTimeout(() => {
    el.style.borderColor = "";
    el.style.boxShadow = "";
  }, 600);
}

function announceToSR(message) {
  let liveEl = document.getElementById("sr-announce");
  if (!liveEl) {
    liveEl = document.createElement("div");
    liveEl.id = "sr-announce";
    liveEl.setAttribute("aria-live", "polite");
    liveEl.setAttribute("aria-atomic", "true");
    liveEl.className = "sr-only";
    document.body.appendChild(liveEl);
  }
  liveEl.textContent = "";
  setTimeout(() => {
    liveEl.textContent = message;
  }, 100);
}
