export const LOOP_PLAY_STYLE = `
.sl-root{color:var(--sl-ink,#1f2320);font:16px/1.5 var(--font,system-ui,sans-serif);max-width:760px;margin:auto}
.sl-board{display:grid;position:relative;gap:0;width:100%;min-width:240px;touch-action:manipulation;user-select:none}
.sl-cell{position:relative;grid-column:span 2;grid-row:span 2;display:grid;place-items:center;min-width:0;min-height:0;border:0;background:transparent;padding:0;color:var(--sl-ink,#1f2320);font:700 clamp(14px,2vw,22px)/1 system-ui,sans-serif}
.sl-dot{z-index:2;grid-column:span 1;grid-row:span 1;justify-self:center;align-self:center;width:8px;height:8px;border-radius:50%;background:var(--sl-ink,#1f2320);pointer-events:none}
.sl-edge{position:relative;z-index:1;grid-column:span 2;grid-row:span 1;min-width:0;min-height:0;border:0;padding:0;background:transparent;cursor:pointer;touch-action:manipulation}
.sl-edge.vertical{grid-column:span 1;grid-row:span 2}
.sl-edge::after{content:"";position:absolute;background:var(--kz-grid,#cfc6b2);transition:background .12s ease}
.sl-edge.horizontal::after{left:0;right:0;top:50%;height:5px;transform:translateY(-50%)}
.sl-edge.vertical::after{top:0;bottom:0;left:50%;width:5px;transform:translateX(-50%)}
.sl-edge.on::after{background:var(--sl-ink,#1f2320)}
.sl-edge.error::after{background:var(--kz-bad,#b5452c)}
.sl-edge:focus-visible{outline:3px solid var(--accent,#b5452c);outline-offset:-2px;border-radius:4px}
.sl-tools{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}
.sl-tools button,.sl-close{font:inherit;border:1px solid var(--sl-rule,#ddd6c6);border-radius:999px;min-height:44px;padding:0 14px;background:var(--sl-surface,#fbf8f1);color:var(--sl-ink,#1f2320);cursor:pointer}
.sl-tools button:disabled{opacity:.45;cursor:default}.sl-status{min-height:1.5em}.sl-help{font-size:14px;opacity:.8}
.sl-dialog{border:0;border-radius:14px;padding:24px;width:min(86vw,820px);max-height:90vh;overflow:auto;background:var(--surface,#fbf8f1);--sl-ink:var(--ink,#1f2320);--sl-surface:var(--surface,#fbf8f1);--sl-rule:var(--rule,#ddd6c6)}.sl-dialog::backdrop{background:#172c28bb}.sl-close{float:right;margin-bottom:10px}.sl-dialog .sl-root{clear:both}
`;
