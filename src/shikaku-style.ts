export const SHIKAKU_PLAY_STYLE = `
.ks-root{color:var(--ks-ink,#1f2320);font:16px/1.5 var(--font,system-ui,sans-serif);max-width:680px;margin:auto}
.ks-board{position:relative;width:100%;min-width:240px;touch-action:manipulation}
.ks-cells{position:absolute;inset:0;display:grid;padding:2px}
.ks-cell{background:transparent;border:0;min-width:0;min-height:0;padding:0;cursor:crosshair;touch-action:manipulation}
.ks-cell:focus-visible{outline:3px solid var(--accent,#b5452c);outline-offset:-4px;border-radius:4px}
.ks-tools{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}
.ks-tools button,.ks-close{font:inherit;border:1px solid var(--ks-rule,#ddd6c6);border-radius:999px;min-height:44px;padding:0 14px;background:var(--ks-surface,#fbf8f1);color:var(--ks-ink,#1f2320);cursor:pointer}
.ks-tools button:disabled{opacity:.45;cursor:default}.ks-status{min-height:1.5em}.ks-help{font-size:14px;opacity:.8}
.ks-dialog{border:0;border-radius:14px;padding:24px;width:min(86vw,760px);max-height:90vh;overflow:auto;background:var(--surface,#fbf8f1);--ks-ink:var(--ink,#1f2320);--ks-surface:var(--surface,#fbf8f1);--ks-rule:var(--rule,#ddd6c6)}.ks-dialog::backdrop{background:#172c28bb}
.ks-close{float:right;margin-bottom:10px}.ks-dialog .ks-root{clear:both}
`;
