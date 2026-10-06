import { akariVisible, isAkariBoard } from "./akari-board.ts";
import type { AkariBoard } from "./akari.types.ts";
import type { AkariDrawOptions } from "./akari-play.types.ts";
import { akariWords } from "./akari-strings.ts";

/** Draws the public clues and current bulbs as SVG. */
export function drawAkari(board: AkariBoard, options: AkariDrawOptions = {}): string {
  if (!isAkariBoard(board)) throw new RangeError("Invalid Akari board");

  const words = akariWords(options.language);
  const size = 48;
  const palettes = {
    ivory: ["var(--kz-paper,#fbf8f1)", "var(--kz-ink,#1f2320)", "var(--kz-grid,#cfc6b2)", "#252923"],
    wood: ["#e5cda6", "#493e2f", "#bca582", "#493e2f"],
    slate: ["#262a27", "#ece8dc", "#454a44", "#111412"],
  };
  const [paper, ink, grid, black] = palettes[options.material ?? "ivory"];
  const bulbs = new Set(options.bulbs ?? []);
  const lit = new Set<number>();
  bulbs.forEach(cell => akariVisible(board, cell).forEach(illuminated => lit.add(illuminated)));

  const cells = board.cells.map((clue, cell) => {
    const x = cell % board.width * size;
    const y = Math.floor(cell / board.width) * size;
    const active = cell === options.selected;
    const bad = options.errors?.includes(cell);
    const bulb = bulbs.has(cell)
      ? `${options.pieces === "tiles" ? `<rect x="${x + 10}" y="${y + 10}" width="28" height="28" rx="6" fill="${paper}" stroke="${grid}"/>` : ""}
          <circle cx="${x + 24}" cy="${y + 24}" r="11" fill="${ink}"/>
          <path d="M${x + 18} ${y + 31}h12m-10 4h8" stroke="${ink}" stroke-width="2"/>`
      : "";
    const body = clue === null
      ? `<rect x="${x}" y="${y}" width="48" height="48" fill="${lit.has(cell) ? paper : "var(--kz-grid,#cfc6b2)"}" fill-opacity=".95"/>${bulb}`
      : `<rect x="${x}" y="${y}" width="48" height="48" fill="${black}"/>${typeof clue === "number"
        ? `<text x="${x + 24}" y="${y + 25}" dominant-baseline="middle" text-anchor="middle" fill="${paper}" font-size="21" font-weight="700" font-family="system-ui,sans-serif">${clue}</text>`
        : ""}`;
    const stroke = bad ? "var(--kz-bad,#b5452c)" : grid;
    const strokeWidth = bad ? 3 : 1;
    return `<g data-akari-cell="${cell}">${body}<rect x="${x}" y="${y}" width="48" height="48" fill="${active ? ink : "transparent"}" fill-opacity="${active ? ".16" : "1"}" stroke="${stroke}" stroke-width="${strokeWidth}"/></g>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${board.width * size + 4} ${board.height * size + 4}" role="img" aria-label="${words.title}" style="display:block;width:100%;height:auto;background:${paper}">${cells}<rect width="${board.width * size}" height="${board.height * size}" fill="none" stroke="var(--kz-frame,#a98954)" stroke-width="2"/></svg>`;
}
