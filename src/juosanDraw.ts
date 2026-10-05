import { isJuosanBoard } from "./juosanBoard.ts";
import type { JuosanBoard } from "./juosan.types.ts";
import type { JuosanDrawOptions } from "./juosanPlay.types.ts";
import { juosanWords } from "./juosanStrings.ts";

/** Draws a public Juosan board as an SVG string. */
export function drawJuosan(board: JuosanBoard, options: JuosanDrawOptions = {}): string {
  if (!isJuosanBoard(board)) throw new RangeError("Invalid Juosan board");

  const cellSize = 48;
  const words = juosanWords(options.language);
  const palettes = {
    ivory: ["var(--kz-paper,#fbf8f1)", "var(--kz-ink,#1f2320)", "var(--kz-grid,#cfc6b2)"],
    wood: ["#e5cda6", "#493e2f", "#bca582"],
    slate: ["#262a27", "#ece8dc", "#454a44"],
  };
  const [paper, ink, grid] = palettes[options.material ?? "ivory"];
  const territoryByCell = Array(board.width * board.height).fill(-1);
  board.territories.forEach((territory, index) => {
    territory.cells.forEach(cell => {
      territoryByCell[cell] = index;
    });
  });

  const cells = territoryByCell.map((territoryIndex, cell) => {
    const x = (cell % board.width) * cellSize;
    const y = Math.floor(cell / board.width) * cellSize;
    const territory = board.territories[territoryIndex];
    const mark = options.marks?.[cell] ?? 0;
    const selected = options.selected === cell;
    const tile = options.pieces === "tiles"
      ? `<rect x="${x + 10}" y="${y + 10}" width="28" height="28" rx="6" fill="${paper}" stroke="${grid}"/>`
      : "";
    const glyph = mark === 1 ? "—" : mark === 2 ? "|" : "";
    const clue = territory.cells[0] === cell && territory.difference !== null
      ? `<text x="${x + 5}" y="${y + 13}" fill="${ink}" font-size="10" font-weight="700" font-family="system-ui,sans-serif">${territory.difference}</text>`
      : "";
    const right = cell % board.width + 1 < board.width
      ? territoryByCell[cell + 1]
      : -1;
    const below = cell + board.width < territoryByCell.length
      ? territoryByCell[cell + board.width]
      : -1;
    const rightEdge = right !== territoryIndex
      ? `<path d="M${x + cellSize} ${y}v${cellSize}" stroke="${ink}" stroke-width="3"/>`
      : "";
    const bottomEdge = below !== territoryIndex
      ? `<path d="M${x} ${y + cellSize}h${cellSize}" stroke="${ink}" stroke-width="3"/>`
      : "";

    return `<g data-juosan-cell="${cell}"><rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${selected ? ink : "transparent"}" fill-opacity="${selected ? ".12" : "1"}" stroke="${grid}" stroke-width="1"/>${tile}${clue}<text x="${x + 24}" y="${y + 27}" dominant-baseline="middle" text-anchor="middle" fill="${ink}" font-size="29" font-weight="700" font-family="system-ui,sans-serif">${glyph}</text>${rightEdge}${bottomEdge}</g>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${board.width * cellSize + 4} ${board.height * cellSize + 4}" role="img" aria-label="${words.title}" style="display:block;width:100%;height:auto;background:${paper}">${cells}<rect width="${board.width * cellSize}" height="${board.height * cellSize}" fill="none" stroke="var(--kz-frame,#a98954)" stroke-width="2"/></svg>`;
}
