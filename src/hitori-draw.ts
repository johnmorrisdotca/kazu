import { isHitoriBoard } from "./hitori-board.ts";
import type { HitoriBoard } from "./hitori.types.ts";
import type { HitoriDrawOptions } from "./hitori-play.types.ts";

/** SVG text contains only the public numbers and the player's marks. */
export function drawHitori(board: HitoriBoard, options: HitoriDrawOptions = {}): string {
  if (!isHitoriBoard(board)) throw new RangeError("Invalid Hitori board");
  const size = board.size, cellSize = 52;
  const palettes = {
    ivory: ["var(--kz-paper,#fbf8f1)", "var(--kz-ink,#1f2320)", "var(--kz-grid,#cfc6b2)"],
    wood: ["#e5cda6", "#493e2f", "#bca582"],
    slate: ["#333a42", "#f1eee7", "#707984"],
  } as const;
  const [paper, ink, grid] = palettes[options.material ?? "ivory"], shaded = options.shaded ?? [];
  const cells = board.numbers.map((number, cell) => {
    const x = cell % size * cellSize, y = Math.floor(cell / size) * cellSize;
    const black = shaded[cell], selected = options.selected === cell, error = options.errors?.includes(cell);
    const tile = options.pieces === "tiles" && !black
      ? `<rect x="${x + 10}" y="${y + 10}" width="32" height="32" rx="6" fill="${paper}" stroke="${grid}"/>`
      : "";
    const background = black ? ink : selected ? `${ink}22` : paper;
    const foreground = black ? paper : error ? "#b5452c" : ink;
    return `<g><rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${background}" stroke="${grid}" stroke-width="1"/>${tile}<text x="${x + cellSize / 2}" y="${y + cellSize / 2}" text-anchor="middle" dominant-baseline="middle" fill="${foreground}" font-size="22" font-weight="${selected ? 700 : 500}" font-family="system-ui,sans-serif">${number}</text></g>`;
  }).join("");
  const width = size * cellSize;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${width + 4} ${width + 4}" role="img" aria-label="Hitori" style="display:block;width:100%;height:auto;background:${paper}">${cells}<rect width="${width}" height="${width}" fill="none" stroke="var(--kz-frame,#a98954)" stroke-width="2"/></svg>`;
}
