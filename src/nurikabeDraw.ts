import { isNurikabeBoard } from "./nurikabeBoard.ts";
import type { NurikabeBoard } from "./nurikabe.types.ts";
import type { NurikabeDrawOptions } from "./nurikabePlay.types.ts";
/** SVG text contains the numbered clues and the player's sea marks only. */
export function drawNurikabe(board: NurikabeBoard, options: NurikabeDrawOptions = {}): string {
  if (!isNurikabeBoard(board)) throw new RangeError("Invalid Nurikabe board");
  const n = board.size, cell = 52;
  const palettes = { ivory: ["var(--kz-paper,#fbf8f1)", "var(--kz-ink,#1f2320)", "var(--kz-grid,#cfc6b2)"], wood: ["#e5cda6", "#493e2f", "#bca582"], slate: ["#333a42", "#f1eee7", "#707984"] } as const;
  const [paper, ink, grid] = palettes[options.material ?? "ivory"], sea = options.sea ?? [];
  const cells = board.clues.map((clue, c) => {
    const x = c % n * cell, y = Math.floor(c / n) * cell, black = sea[c], selected = options.selected === c, error = options.errors?.includes(c);
    const tile = options.pieces === "tiles" && clue && !black ? `<rect x="${x + 10}" y="${y + 10}" width="32" height="32" rx="6" fill="${paper}" stroke="${grid}"/>` : "";
    return `<g><rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="${black ? ink : selected ? `${ink}22` : paper}" stroke="${grid}" stroke-width="1"/>${tile}${clue ? `<text x="${x + cell / 2}" y="${y + cell / 2}" text-anchor="middle" dominant-baseline="middle" fill="${black ? paper : error ? "#b5452c" : ink}" font-size="22" font-weight="700" font-family="system-ui,sans-serif">${clue}</text>` : ""}</g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${n * cell + 4} ${n * cell + 4}" role="img" aria-label="Nurikabe" style="display:block;width:100%;height:auto;background:${paper}">${cells}<rect width="${n * cell}" height="${n * cell}" fill="none" stroke="var(--kz-frame,#a98954)" stroke-width="2"/></svg>`;
}
