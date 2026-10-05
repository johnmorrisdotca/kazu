import { isFillominoBoard } from "./fillominoBoard.ts";
import type { FillominoBoard } from "./fillomino.types.ts";
import type { FillominoDrawOptions } from "./fillominoPlay.types.ts";
import { fillominoWords } from "./fillominoStrings.ts";

export function drawFillomino(board: FillominoBoard, options: FillominoDrawOptions = {}): string {
  if (!isFillominoBoard(board)) throw new RangeError("Invalid Fillomino board");
  const words = fillominoWords(options.language);
  const size = 48;
  const [paper, ink, grid] = {
    ivory: ["var(--kz-paper,#fbf8f1)", "var(--kz-ink,#1f2320)", "var(--kz-grid,#cfc6b2)"],
    wood: ["#e5cda6", "#493e2f", "#bca582"],
    slate: ["#262a27", "#ece8dc", "#454a44"],
  }[options.material ?? "ivory"];
  const entries = options.entries ?? board.givens;
  const markedErrors = new Set(options.errors ?? []);
  const cells = board.givens.map((given, cell) => {
    const x = cell % board.width * size;
    const y = Math.floor(cell / board.width) * size;
    const value = entries[cell] ?? 0;
    const active = options.selected === cell;
    const error = markedErrors.has(cell);
    const fill = error ? "var(--kz-bad,#b5452c)" : active ? "var(--kz-focus,#d8bd68)" : "transparent";
    const tile = value && options.pieces === "tiles"
      ? `<rect x="${x + 10}" y="${y + 10}" width="28" height="28" rx="6" fill="${paper}" stroke="${grid}"/>`
      : "";
    const text = value
      ? `<text x="${x + 24}" y="${y + 25}" dominant-baseline="middle" text-anchor="middle" fill="${ink}" font-size="21" font-weight="${given ? 750 : 500}" font-family="system-ui,sans-serif">${value}</text>`
      : "";
    return `<g data-fillomino-cell="${cell}"><rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${fill}" fill-opacity="${active || error ? ".28" : "1"}" stroke="${grid}"/>${tile}${text}</g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${board.width * size + 4} ${board.height * size + 4}" role="img" aria-label="${words.title}" style="display:block;width:100%;height:auto;background:${paper}">${cells}<rect width="${board.width * size}" height="${board.height * size}" fill="none" stroke="var(--kz-frame,#a98954)" stroke-width="2"/></svg>`;
}
