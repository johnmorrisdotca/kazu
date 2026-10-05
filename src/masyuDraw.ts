import { isMasyuBoard, masyuNeighbors } from "./masyuBoard.ts";
import type { MasyuBoard, MasyuDrawOptions } from "./masyu.types.ts";
import { MASYU_STRINGS } from "./masyuStrings.ts";

export function drawMasyu(board: MasyuBoard, options: MasyuDrawOptions = {}): string {
  if (!isMasyuBoard(board)) throw new RangeError("Invalid Masyu board");
  const words = MASYU_STRINGS[options.language ?? "en"], step = 52, pad = 14;
  const palette = { ivory: ["var(--kz-paper,#fbf8f1)", "var(--kz-ink,#1f2320)", "var(--kz-grid,#cfc6b2)"], wood: ["#e5cda6", "#493e2f", "#bca582"], slate: ["#262a27", "#ece8dc", "#454a44"] };
  const [paper, ink, grid] = palette[options.material ?? "ivory"];
  const edges = new Set(options.edges ?? []), parts: string[] = [];
  for (let cell = 0; cell < board.pearls.length; cell += 1) {
    const x = pad + (cell % board.width) * step, y = pad + Math.floor(cell / board.width) * step;
    const active = options.selected === cell;
    parts.push(`<rect x="${x - step / 2}" y="${y - step / 2}" width="${step}" height="${step}" fill="${active ? ink : "transparent"}" fill-opacity="${active ? ".08" : "1"}"/>`);
    for (const next of masyuNeighbors(board, cell)) if (cell < next.cell && edges.has(next.edge)) {
      const nx = pad + (next.cell % board.width) * step, ny = pad + Math.floor(next.cell / board.width) * step;
      parts.push(`<line x1="${x}" y1="${y}" x2="${nx}" y2="${ny}" stroke="${options.errors?.includes(cell) ? "var(--kz-bad,#b5452c)" : ink}" stroke-width="5" stroke-linecap="round"/>`);
    }
  }
  for (let cell = 0; cell < board.pearls.length; cell += 1) {
    const pearl = board.pearls[cell]; if (!pearl) continue;
    const x = pad + (cell % board.width) * step, y = pad + Math.floor(cell / board.width) * step;
    const radius = options.pieces === "tiles" ? 12 : 10;
    parts.push(`<circle cx="${x}" cy="${y}" r="${radius}" fill="${pearl === 1 ? paper : ink}" stroke="${ink}" stroke-width="3" aria-label="${words.pearl[pearl]}"/>`);
  }
  for (let y = 0; y < board.height; y += 1) for (let x = 0; x < board.width; x += 1) {
    parts.push(`<circle cx="${pad + x * step}" cy="${pad + y * step}" r="2" fill="${grid}"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${pad * 2 + (board.width - 1) * step} ${pad * 2 + (board.height - 1) * step}" role="img" aria-label="${words.title}" style="display:block;width:100%;height:auto;background:${paper}">${parts.join("")}</svg>`;
}
