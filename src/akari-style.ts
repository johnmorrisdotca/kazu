export const AKARI_PLAY_STYLE = `
.ka-root{color:var(--ka-ink,#1f2320);font:16px/1.5 var(--font,system-ui,sans-serif);max-width:680px;margin:auto}
.ka-board{position:relative;width:100%;min-width:240px;touch-action:manipulation}.ka-cells{position:absolute;inset:0;display:grid;padding:2px}
.ka-cell{border:0;min-width:0;min-height:0;padding:0;cursor:pointer;touch-action:manipulation;font:inherit;color:inherit;background:transparent}
.ka-cell:focus-visible{outline:3px solid var(--accent,#b5452c);outline-offset:-4px;border-radius:4px}.ka-tools{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}
.ka-tools button,.ka-close{font:inherit;border:1px solid var(--ka-rule,#ddd6c6);border-radius:999px;min-height:44px;padding:0 14px;background:var(--ka-surface,#fbf8f1);color:var(--ka-ink,#1f2320);cursor:pointer}
.ka-tools button:disabled{opacity:.45;cursor:default}.ka-status{min-height:1.5em}.ka-help{font-size:14px;opacity:.8}
.ka-dialog{border:0;border-radius:14px;padding:24px;width:min(86vw,760px);max-height:90vh;overflow:auto;background:var(--surface,#fbf8f1);--ka-ink:var(--ink,#1f2320);--ka-surface:var(--surface,#fbf8f1);--ka-rule:var(--rule,#ddd6c6)}.ka-dialog::backdrop{background:#172c28bb}.ka-close{float:right;margin-bottom:10px}.ka-dialog .ka-root{clear:both}
`;
