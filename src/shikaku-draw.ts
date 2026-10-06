import { isShikakuBoard, shikakuCells } from "./shikaku-board.ts";
import type { ShikakuBoard } from "./shikaku.types.ts";
import type { ShikakuDrawOptions } from "./shikaku-play.types.ts";
import { shikakuWords } from "./shikaku-strings.ts";

/** SVG text with only the public clues and the player's rectangles. */
export function drawShikaku(board: ShikakuBoard, options: ShikakuDrawOptions = {}): string {
  if (!isShikakuBoard(board)) throw new RangeError("Invalid Shikaku board");
  const words = shikakuWords(options.language), size = 48;
  const palettes = { ivory: ["var(--kz-paper,#fbf8f1)", "var(--kz-ink,#1f2320)", "var(--kz-grid,#cfc6b2)"], wood: ["#e5cda6", "#493e2f", "#bca582"], slate: ["#262a27", "#ece8dc", "#454a44"] };
  const [paper, ink, grid] = palettes[options.material ?? "ivory"];
  const marks: string[] = [];
  for (const [index, r] of (options.rectangles ?? []).entries()) {
    if (!shikakuCells(board, r)) continue;
    const colour = options.errors?.includes(index) ? "var(--kz-bad,#b5452c)" : ink;
    marks.push(`<rect x="${r.x * size + 3}" y="${r.y * size + 3}" width="${r.width * size - 6}" height="${r.height * size - 6}" rx="3" fill="${colour}" fill-opacity=".10" stroke="${colour}" stroke-width="2.5"/>`);
  }
  const cells = board.clues.map((n, c) => {
    const x = c % board.width * size, y = Math.floor(c / board.width) * size;
    const active = c === options.selected || c === options.anchor;
    return `<g data-shikaku-cell="${c}"><rect x="${x}" y="${y}" width="48" height="48" fill="${active ? ink : "transparent"}" fill-opacity="${active ? ".15" : "1"}" stroke="${grid}" stroke-width="1"/>${n ? `${options.pieces === "tiles" ? `<rect x="${x + 10}" y="${y + 10}" width="28" height="28" rx="6" fill="${paper}" stroke="${grid}"/>` : ""}<text x="${x + 24}" y="${y + 25}" dominant-baseline="middle" text-anchor="middle" fill="${ink}" font-size="21" font-weight="700" font-family="system-ui,sans-serif">${n}</text>` : ""}</g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${board.width * size + 4} ${board.height * size + 4}" role="img" aria-label="${words.title}" style="display:block;width:100%;height:auto;background:${paper}">${cells}${marks.join("")}<rect width="${board.width * size}" height="${board.height * size}" fill="none" stroke="var(--kz-frame,#a98954)" stroke-width="2"/></svg>`;
}
