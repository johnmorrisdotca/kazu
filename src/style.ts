/**
 * THE STYLE a Kazu drawing wears: the colours of its board as custom properties, and the one rule that
 * matters for a puzzle played with fingers: nothing in the drawing can be selected, dragged or
 * double-tapped.
 *
 * `drawKazu` only writes classes, data attributes and a few custom properties; this is what gives them
 * a look. Every colour is a custom property on `.kazu` (`--kz-paper`, `--kz-ink`, `--kz-given`,
 * `--kz-entry`, `--kz-note`, `--kz-grid`, `--kz-box`, `--kz-frame`, `--kz-cage`, `--kz-clue`,
 * `--kz-diagonal`, `--kz-peer`, `--kz-same`, `--kz-select`, `--kz-hint`, `--kz-conflict`, `--kz-wrong`,
 * `--kz-good`), so a page's own style needs to set only the ones it wants different. The paper follows
 * the page's light or dark. Nothing moves, so there is nothing for reduced motion to still.
 */
export const KAZU_STYLE = `
.kazu {
  --kz-paper: #fbf8f1; --kz-ink: #1f2320; --kz-given: #1f2320; --kz-entry: #1d5fa8; --kz-note: #5b6b7d;
  --kz-grid: #cfc6b2; --kz-box: #3a3d38; --kz-frame: #a98954; --kz-cage: #6a5a8e; --kz-clue: #7a4b14;
  --kz-diagonal: #e9dfc6; --kz-peer: #efe8d8; --kz-same: #dcd0f2; --kz-select: #ffe08a; --kz-hint: #b9e3c4;
  --kz-conflict: #f4b8ad; --kz-wrong: #f4b8ad; --kz-bad: #b5452c; --kz-good: #2f7a4f;
  --kz-font: system-ui, -apple-system, "Segoe UI", sans-serif;
  display: block; width: 100%; height: auto;
  user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; touch-action: manipulation; -webkit-tap-highlight-color: transparent;
  overflow: visible;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .kazu {
    --kz-paper: #262a27; --kz-ink: #ece8dc; --kz-given: #ece8dc; --kz-entry: #8fc1ff; --kz-note: #9fb0c2;
    --kz-grid: #454a44; --kz-box: #c9c5b8; --kz-frame: #6b5632; --kz-cage: #b8a5e6; --kz-clue: #e8c48f;
    --kz-diagonal: #34382f; --kz-peer: #2f332f; --kz-same: #433a5c; --kz-select: #6b5a1f; --kz-hint: #25503a;
    --kz-conflict: #6e2f26; --kz-wrong: #6e2f26; --kz-bad: #ff8a6b; --kz-good: #6fcf97;
  }
}
:root[data-theme="dark"] .kazu {
  --kz-paper: #262a27; --kz-ink: #ece8dc; --kz-given: #ece8dc; --kz-entry: #8fc1ff; --kz-note: #9fb0c2;
  --kz-grid: #454a44; --kz-box: #c9c5b8; --kz-frame: #6b5632; --kz-cage: #b8a5e6; --kz-clue: #e8c48f;
  --kz-diagonal: #34382f; --kz-peer: #2f332f; --kz-same: #433a5c; --kz-select: #6b5a1f; --kz-hint: #25503a;
  --kz-conflict: #6e2f26; --kz-wrong: #6e2f26; --kz-bad: #ff8a6b; --kz-good: #6fcf97;
}
.kazu * { user-select: none; -webkit-user-select: none; }
.kazu .kz-frame { fill: var(--kz-frame); }
.kazu .kz-paper { fill: var(--kz-paper); }
.kazu .kz-diagonal { fill: var(--kz-diagonal); }
.kazu .kz-peer { fill: var(--kz-peer); }
.kazu .kz-same { fill: var(--kz-same); }
.kazu .kz-select { fill: var(--kz-select); }
.kazu .kz-hint { fill: var(--kz-hint); }
.kazu .kz-conflict, .kazu .kz-wrong { fill: var(--kz-conflict); }
.kazu .kz-solved { fill: var(--kz-good); opacity: .14; pointer-events: none; }
.kazu .kz-grid { fill: none; stroke: var(--kz-grid); stroke-width: 1px; vector-effect: non-scaling-stroke; }
.kazu .kz-box { fill: none; stroke: var(--kz-box); stroke-width: 2.5px; stroke-linecap: square; vector-effect: non-scaling-stroke; }
.kazu .kz-cage { stroke: var(--kz-cage); stroke-width: 1.5px; stroke-dasharray: 4 3; vector-effect: non-scaling-stroke; }
.kazu .kz-digit { font-family: var(--kz-font); font-weight: 600; text-anchor: middle; dominant-baseline: central; font-variant-numeric: tabular-nums; pointer-events: none; }
.kazu .kz-given { fill: var(--kz-given); font-weight: 700; }
.kazu .kz-entry { fill: var(--kz-entry); }
.kazu .kz-digit.kz-bad { fill: var(--kz-bad); }
.kazu .kz-note { font-family: var(--kz-font); font-weight: 600; fill: var(--kz-note); text-anchor: middle; dominant-baseline: central; pointer-events: none; }
.kazu .kz-cage-sum { font-family: var(--kz-font); font-weight: 600; fill: var(--kz-cage); text-anchor: start; dominant-baseline: hanging; pointer-events: none; }
.kazu .kz-clue { font-family: var(--kz-font); font-weight: 700; fill: var(--kz-clue); text-anchor: middle; dominant-baseline: central; pointer-events: none; }
.kazu .kz-mark-bg { fill: var(--kz-paper); stroke: none; pointer-events: none; }
.kazu .kz-mark { fill: none; stroke: var(--kz-ink); stroke-width: 2px; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; pointer-events: none; }
.kazu .kz-hit { fill: transparent; cursor: pointer; }
`;
