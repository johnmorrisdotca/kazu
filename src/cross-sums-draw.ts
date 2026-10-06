import { isCrossSumsBoard } from "./cross-sums-board.ts";
import type { CrossSumsBoard, CrossSumsMaterial, CrossSumsPieces } from "./cross-sums.types.ts";

export type CrossSumsDrawOptions = { values?: readonly number[]; notes?: readonly (readonly number[])[]; selected?: number; material?: CrossSumsMaterial; pieces?: CrossSumsPieces; errors?: readonly number[] };
export function drawCrossSums(board: CrossSumsBoard, options: CrossSumsDrawOptions = {}): string {
  if (!isCrossSumsBoard(board)) throw new RangeError("Invalid Cross Sums board");
  const size = 56, paper = options.material === "slate" ? "#262a27" : options.material === "wood" ? "#e5cda6" : "var(--kz-paper,#fbf8f1)";
  const ink = options.material === "slate" ? "#ece8dc" : options.material === "wood" ? "#493e2f" : "var(--kz-ink,#1f2320)";
  const grid = options.material === "slate" ? "#454a44" : "var(--kz-grid,#cfc6b2)";
  const cells = board.cells.map((tile, cell) => {
    const x = cell % board.width * size, y = Math.floor(cell / board.width) * size;
    const white = tile.kind === "white", value = options.values?.[cell] ?? 0;
    const mark = options.errors?.includes(cell) ? "var(--kz-bad,#b5452c)" : ink;
    const bg = white ? options.selected === cell ? "var(--kz-selected,#e9dfca)" : paper : "#333630";
    const clue = white ? "" : `<path d="M${x},${y + size} L${x + size},${y} M${x + 6},${y + size - 6} L${x + size - 6},${y + 6}" stroke="#858174"/><text x="${x + size - 7}" y="${y + 16}" text-anchor="end" fill="#fff" font-size="15" aria-label="Across ${tile.across ?? ""}">${tile.across ?? ""}</text><text x="${x + 7}" y="${y + size - 7}" fill="#fff" font-size="15" aria-label="Down ${tile.down ?? ""}">${tile.down ?? ""}</text>`;
    const notes = !white || value ? "" : (options.notes?.[cell] ?? []).map((n, index) => `<text x="${x + 8 + index % 3 * 15}" y="${y + 17 + Math.floor(index / 3) * 14}" fill="${ink}" font-size="10">${n}</text>`).join("");
    const piece = value && options.pieces === "tiles"
      ? `<rect x="${x + 10}" y="${y + 8}" width="36" height="40" rx="8" fill="${paper}" stroke="${grid}"/>`
      : "";
    return `<g data-cross-sums-cell="${cell}"><rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${bg}" stroke="${grid}"/><title>${white ? `Cell ${Math.floor(cell / board.width) + 1}, ${cell % board.width + 1}` : `Across ${tile.across ?? "—"}; down ${tile.down ?? "—"}`}</title>${clue}${piece}${value ? `<text x="${x + size / 2}" y="${y + size / 2 + 7}" text-anchor="middle" fill="${mark}" font-size="27" font-weight="700">${value}</text>` : notes}</g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${board.width * size} ${board.height * size}" role="img" aria-label="Cross Sums crossword sum grid" style="display:block;width:100%;height:auto;background:${paper}">${cells}<rect width="${board.width * size}" height="${board.height * size}" fill="none" stroke="var(--kz-frame,#a98954)" stroke-width="3"/></svg>`;
}
