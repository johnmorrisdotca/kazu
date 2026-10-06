export const YAJILIN_PLAY_STYLE = `
.kazu-yajilin { color:var(--kz-ink,#1f2320); font:16px/1.4 system-ui,sans-serif; }
.kazu-yajilin .ky-board { position:relative; max-width:440px; margin:auto; }
.kazu-yajilin svg { border:1px solid var(--kz-frame,#a98954); border-radius:4px; }
.kazu-yajilin .ky-cells { position:absolute; inset:6%; display:grid; }
.kazu-yajilin .ky-cell { border:0; background:transparent; color:transparent; cursor:pointer; }
.kazu-yajilin .ky-cell:focus-visible { outline:3px solid var(--kz-focus,#c57d2d); outline-offset:-5px; }
.kazu-yajilin .ky-tools { display:flex; flex-wrap:wrap; gap:.5rem; justify-content:center; margin:.8rem 0; }
.kazu-yajilin button { font:inherit; padding:.45rem .8rem; }
.kazu-yajilin .ky-status { min-height:1.5em; text-align:center; }
.kazu-yajilin .ky-modes [aria-pressed="true"] { outline:2px solid var(--kz-frame,#a98954); }
`;
