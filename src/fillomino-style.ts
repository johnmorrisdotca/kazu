export const FILLOMINO_PLAY_STYLE = `
.fillomino-play{font:1rem/1.45 system-ui,sans-serif;color:var(--kz-ink,#202521);max-width:58rem;margin:auto}
.fillomino-status{min-height:1.5em;text-align:center;font-weight:600}
.fillomino-board{width:min(100%,42rem);margin:1rem auto}
.fillomino-drawing{position:relative}
.fillomino-cells{position:absolute;inset:0;display:grid;grid-template-columns:repeat(var(--fillomino-width),1fr);grid-template-rows:repeat(var(--fillomino-height),1fr)}
.fillomino-cell{min-width:0;min-height:0;border:0;background:transparent;color:transparent;cursor:pointer}
.fillomino-cell:focus-visible{outline:3px solid #b5963d;outline-offset:-3px}
.fillomino-controls{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:.5rem;margin:1rem auto}
.fillomino-controls button,.fillomino-controls select{font:inherit;min-height:2.75rem;padding:.45rem .8rem;border:1px solid var(--kz-grid,#cfc6b2);border-radius:.55rem;background:var(--kz-paper,#fbf8f1);color:inherit}
.fillomino-number-label{display:flex;align-items:center;gap:.45rem}
@media(max-width:700px){.fillomino-controls{gap:.35rem}.fillomino-controls button{flex:1 1 28%}}
`;
