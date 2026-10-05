export const NURIKABE_PLAY_STYLE = `
.kn-root{font:16px/1.5 var(--font,system-ui,sans-serif);max-width:680px;margin:auto;color:var(--ks-ink,#1f2320)}
.kn-board{position:relative;width:100%;touch-action:manipulation}
.kn-cells{position:absolute;inset:0;display:grid;padding:2px}
.kn-cell{border:0;background:transparent;min-width:0;min-height:0;padding:0;cursor:pointer;touch-action:manipulation}
.kn-cell:focus-visible{outline:3px solid var(--accent,#b5452c);outline-offset:-4px}
.kn-tools{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}
.kn-tools button{font:inherit;border:1px solid var(--ks-rule,#ddd6c6);border-radius:999px;min-height:44px;padding:0 14px;background:var(--ks-surface,#fbf8f1);color:inherit;cursor:pointer}
.kn-tools button:disabled{opacity:.45}.kn-status{min-height:1.5em}.kn-help{font-size:14px;opacity:.8}`;
