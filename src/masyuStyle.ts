export const MASYU_PLAY_STYLE = `
.kazu-masyu { color:var(--kz-ink,#1f2320); font:16px/1.4 system-ui,sans-serif; }
.kazu-masyu .km-board { position:relative; max-width:440px; margin:auto; }
.kazu-masyu svg { border:1px solid var(--kz-frame,#a98954); border-radius:4px; }
.kazu-masyu .km-cells { position:absolute; inset:6%; display:grid; }
.kazu-masyu .km-cell { border:0; background:transparent; border-radius:50%; color:transparent; cursor:pointer; }
.kazu-masyu .km-cell:focus-visible { outline:3px solid var(--kz-focus,#c57d2d); outline-offset:-5px; }
.kazu-masyu .km-tools { display:flex; flex-wrap:wrap; gap:.5rem; justify-content:center; margin:.8rem 0; }
.kazu-masyu button { font:inherit; padding:.45rem .8rem; }
.kazu-masyu .km-status { min-height:1.5em; text-align:center; }
`;
