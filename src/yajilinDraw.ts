import { isYajilinBoard, yajilinNeighbors } from "./yajilinBoard.ts";
import type { YajilinBoard, YajilinDrawOptions } from "./yajilin.types.ts";
import { YAJILIN_STRINGS } from "./yajilinStrings.ts";

const arrows = { up: "↑", right: "→", down: "↓", left: "←" } as const;
export function drawYajilin(board: YajilinBoard, options: YajilinDrawOptions = {}): string {
  if (!isYajilinBoard(board)) throw new RangeError("Invalid Yajilin board");
  const words = YAJILIN_STRINGS[options.language ?? "en"], size = 52, pad = 14;
  const palette = { ivory: ["var(--kz-paper,#fbf8f1)", "var(--kz-ink,#1f2320)", "var(--kz-grid,#cfc6b2)"], wood: ["#e5cda6", "#493e2f", "#bca582"], slate: ["#262a27", "#ece8dc", "#454a44"] };
  const [paper, ink, grid] = palette[options.material ?? "ivory"], edges = new Set(options.edges ?? []), parts: string[] = [];
  for (let cell = 0; cell < board.clues.length; cell += 1) {
    const x = pad + cell % board.width * size, y = pad + Math.floor(cell / board.width) * size, clue = board.clues[cell];
    const bad = options.errors?.includes(cell), active = options.selected === cell;
    parts.push(`<rect x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" fill="${active ? ink : "transparent"}" fill-opacity="${active ? ".08" : "1"}" stroke="${grid}" stroke-width="1"/>`);
    if (options.shaded?.[cell]) parts.push(`<rect x="${x - 17}" y="${y - 17}" width="34" height="34" rx="2" fill="${bad ? "var(--kz-bad,#b5452c)" : ink}"/>`);
    if (clue) {
      if (options.pieces === "tiles") parts.push(`<rect x="${x - 19}" y="${y - 19}" width="38" height="38" rx="5" fill="${paper}" stroke="${grid}"/>`);
      parts.push(`<text x="${x - 2}" y="${y + 1}" text-anchor="middle" dominant-baseline="middle" fill="${bad ? "var(--kz-bad,#b5452c)" : ink}" font-size="20" font-weight="700" font-family="system-ui,sans-serif">${arrows[clue.direction]}</text>`);
      parts.push(`<text x="${x + 11}" y="${y + 14}" text-anchor="middle" dominant-baseline="middle" fill="${ink}" font-size="12" font-weight="700" font-family="system-ui,sans-serif">${clue.count}</text>`);
    }
    for (const next of yajilinNeighbors(board, cell)) if (cell < next.cell && edges.has(next.edge)) {
      const nx = pad + next.cell % board.width * size, ny = pad + Math.floor(next.cell / board.width) * size;
      parts.push(`<line x1="${x}" y1="${y}" x2="${nx}" y2="${ny}" stroke="${bad ? "var(--kz-bad,#b5452c)" : ink}" stroke-width="5" stroke-linecap="round"/>`);
    }
  }
  for (let y = 0; y < board.height; y += 1) for (let x = 0; x < board.width; x += 1) {
    parts.push(`<circle cx="${pad + x * size}" cy="${pad + y * size}" r="2" fill="${grid}"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${pad * 2 + (board.width - 1) * size} ${pad * 2 + (board.height - 1) * size}" role="img" aria-label="${words.title}" style="display:block;width:100%;height:auto;background:${paper}">${parts.join("")}</svg>`;
}
