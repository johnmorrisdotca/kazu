export const HITORI_PLAY_STYLE = `
.kh-root{color:var(--ks-ink,#1f2320);font:16px/1.5 var(--font,system-ui,sans-serif);max-width:680px;margin:auto}
.kh-board{position:relative;width:100%;min-width:240px;touch-action:manipulation}
.kh-cells{position:absolute;inset:0;display:grid;padding:2px}
.kh-cell{background:transparent;border:0;min-width:0;min-height:0;padding:0;cursor:pointer;touch-action:manipulation}
.kh-cell:focus-visible{outline:3px solid var(--accent,#b5452c);outline-offset:-4px;border-radius:4px}
.kh-tools{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}
.kh-tools button{font:inherit;border:1px solid var(--ks-rule,#ddd6c6);border-radius:999px;min-height:44px;padding:0 14px;background:var(--ks-surface,#fbf8f1);color:var(--ks-ink,#1f2320);cursor:pointer}
.kh-tools button:disabled{opacity:.45;cursor:default}.kh-status{min-height:1.5em}.kh-help{font-size:14px;opacity:.8}`;
