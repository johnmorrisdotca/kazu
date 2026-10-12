import { isRegionsBoard } from "./regions-board.ts";
import type { RegionsBoard } from "./regions.types.ts";
import type { RegionsDrawOptions } from "./regions-play.types.ts";
import { regionsWords } from "./regions-strings.ts";

/** Render the Regions board and supplied current state as native SVG text.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @param options - Solution/node limits or native SVG choices specified by the signature.
 * @returns Render the Regions board and supplied current state as native SVG text.
 * @example
 * ```ts
 * import type { RegionsBoard } from "@johnmorrisdotca/kazu/regions";
 * import { drawRegions } from "@johnmorrisdotca/kazu/regions";
 *
 * const regionsBoard: RegionsBoard = {"width":5,"height":5,"givens":[0,0,2,0,3,2,0,3,0,0,0,3,0,0,1,3,1,0,1,2,3,3,4,0,0]};
 * console.log(drawRegions(regionsBoard).startsWith("<svg"));
 * ```
 */
export function drawRegions(board: RegionsBoard, options: RegionsDrawOptions = {}): string {
  if (!isRegionsBoard(board)) throw new RangeError("Invalid Regions board");
  const words = regionsWords(options.language);
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
    return `<g data-regions-cell="${cell}"><rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${fill}" fill-opacity="${active || error ? ".28" : "1"}" stroke="${grid}"/>${tile}${text}</g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${board.width * size + 4} ${board.height * size + 4}" role="img" aria-label="${words.title}" style="display:block;width:100%;height:auto;background:${paper}">${cells}<rect width="${board.width * size}" height="${board.height * size}" fill="none" stroke="var(--kz-frame,#a98954)" stroke-width="2"/></svg>`;
}
