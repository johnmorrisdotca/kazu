import { KAZU_STYLE } from "./style.ts";

/**
 * THE STYLE a playable Kazu board wears (`mountKazu`, `<kazu-board>`): the drawing's own (`KAZU_STYLE`)
 * and the board's box, its number pad, its buttons and its lines of words. Colours are custom properties
 * on `.kazu-play` (`--kzp-ink`, `--kzp-muted`, `--kzp-rule`, `--kzp-surface`, `--kzp-accent`,
 * `--kzp-good`) so a page sets only what it wants different.
 *
 * Nothing moves when something is chosen: the board is one square box, the lines of words keep the room
 * their longest wording takes, and the buttons are one size. Nothing the player touches can be
 * selected, and no tap on it zooms the page.
 */
export const KAZU_PLAY_STYLE = `${KAZU_STYLE}
.kazu-play {
  --kzp-ink: #1f2320; --kzp-muted: #6b6f68; --kzp-rule: #ddd6c6; --kzp-surface: #fbf8f1; --kzp-accent: #b5452c; --kzp-good: #2f7a4f;
  display: block; max-width: 100%; box-sizing: border-box; color: var(--kzp-ink); font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .kazu-play { --kzp-ink: #ece8dc; --kzp-muted: #a09d93; --kzp-rule: #3a3d38; --kzp-surface: #1d201e; --kzp-accent: #ff8a6b; --kzp-good: #6fcf97; }
}
:root[data-theme="dark"] .kazu-play { --kzp-ink: #ece8dc; --kzp-muted: #a09d93; --kzp-rule: #3a3d38; --kzp-surface: #1d201e; --kzp-accent: #ff8a6b; --kzp-good: #6fcf97; }
.kazu-play *, .kazu-play *::before, .kazu-play *::after { box-sizing: border-box; }
.kazu-play .kzp-bar { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin: 0 0 8px; min-height: 1.5em; font-variant-numeric: tabular-nums; }
.kazu-play .kzp-clock { font-weight: 700; font-size: 1.05rem; min-width: 4.5ch; }
.kazu-play .kzp-progress { color: var(--kzp-muted); font-size: .85rem; }
.kazu-play .kzp-box { position: relative; width: 100%; aspect-ratio: 1; overflow: hidden; touch-action: manipulation; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; cursor: pointer; border-radius: 8px; }
.kazu-play .kzp-box:focus-visible { outline: 3px solid var(--kzp-accent); outline-offset: 2px; }
.kazu-play .kzp-box[data-over="true"] { cursor: default; }
.kazu-play .kzp-inner { position: absolute; inset: 0; }
.kazu-play .kzp-inner .kazu { position: absolute; inset: 0; width: 100%; height: 100%; }
.kazu-play .kzp-pad { display: grid; grid-template-columns: repeat(var(--kzp-columns, 5), minmax(0, 1fr)); gap: 6px; margin-top: 10px; }
.kazu-play .kzp-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 10px; }
.kazu-play [hidden] { display: none !important; }
.kazu-play button { font: inherit; color: inherit; user-select: none; -webkit-user-select: none; touch-action: manipulation; }
.kazu-play .kzp-key, .kazu-play .kzp-button { border: 1px solid var(--kzp-rule); background: var(--kzp-surface); color: var(--kzp-ink); border-radius: 12px; min-height: 44px; min-width: 44px; padding: 0 12px; font-size: 1.05rem; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; }
.kazu-play .kzp-button { border-radius: 999px; font-size: .85rem; font-weight: 600; }
.kazu-play .kzp-key:hover:not(:disabled), .kazu-play .kzp-button:hover:not(:disabled) { border-color: var(--kzp-ink); }
.kazu-play .kzp-key:disabled, .kazu-play .kzp-button:disabled { opacity: .32; cursor: default; }
.kazu-play .kzp-key[data-done="true"] { opacity: .4; }
.kazu-play .kzp-key[data-erase="true"] { color: var(--kzp-muted); }
.kazu-play .kzp-button[aria-pressed="true"] { background: var(--kzp-ink); color: var(--kzp-surface); border-color: var(--kzp-ink); }
.kazu-play .kzp-key:focus-visible, .kazu-play .kzp-button:focus-visible { outline: 3px solid var(--kzp-accent); outline-offset: 2px; }
.kazu-play .kzp-says { margin: 10px 0 0; min-height: 3.9em; font-size: .85rem; line-height: 1.4; color: var(--kzp-muted); }
.kazu-play .kzp-says[data-warn="true"] { color: var(--kzp-accent); font-weight: 600; }
.kazu-play[data-solved="true"] .kzp-says, .kazu-play[data-solved="true"] .kzp-clock { color: var(--kzp-good); font-weight: 600; }
.kazu-play .kzp-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
`;
