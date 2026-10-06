import { heyawakeCells, isHeyawakeBoard } from "./heyawake-board.ts";
import type { HeyawakeBoard } from "./heyawake.types.ts";
import type { HeyawakeDrawOptions } from "./heyawake-play.types.ts";
import { heyawakeWords } from "./heyawake-strings.ts";

export function drawHeyawake(board: HeyawakeBoard, options: HeyawakeDrawOptions = {}): string {
  if (!isHeyawakeBoard(board)) throw new RangeError("Invalid Heyawake board");
  const words = heyawakeWords(options.language), size = 48;
  const palettes = { ivory: ["var(--kz-paper,#fbf8f1)", "var(--kz-ink,#1f2320)", "var(--kz-grid,#cfc6b2)"], wood: ["#e5cda6", "#493e2f", "#bca582"], slate: ["#262a27", "#ece8dc", "#454a44"] };
  const [paper, ink, grid] = palettes[options.material ?? "ivory"];
  const roomAt = Array(board.width * board.height).fill(-1) as number[];
  board.rooms.forEach((room, index) => heyawakeCells(board, room)!.forEach(cell => { roomAt[cell] = index; }));
  const cells = Array.from({ length: board.width * board.height }, (_, cell) => {
    const x = cell % board.width * size, y = Math.floor(cell / board.width) * size;
    const entry = options.entries?.[cell], room = board.rooms[roomAt[cell]!]!;
    const selected = cell === options.selected, error = options.errors?.includes(cell);
    const color = error ? "var(--kz-bad,#b5452c)" : ink;
    const top = Math.floor(cell / board.width) === room.y ? 3 : 1;
    const left = cell % board.width === room.x ? 3 : 1;
    const right = cell % board.width === room.x + room.width - 1 ? 3 : 1;
    const bottom = Math.floor(cell / board.width) === room.y + room.height - 1 ? 3 : 1;
    const clue = cell === room.y * board.width + room.x && room.blacks !== null
      ? `<text x="${x + 5}" y="${y + 13}" fill="${ink}" font-size="11" font-weight="700">${room.blacks}</text>` : "";
    const mark = entry === true ? `<rect x="${x + 1}" y="${y + 1}" width="46" height="46" fill="${color}"/>` : entry === false ? `<circle cx="${x + 24}" cy="${y + 24}" r="5" fill="${color}"/>` : "";
    return `<g data-heyawake-cell="${cell}"><rect x="${x}" y="${y}" width="48" height="48" fill="${selected ? ink : paper}" fill-opacity="${selected ? ".12" : "1"}" stroke="${grid}" stroke-width="${Math.min(top, right, bottom, left)}"/>${clue}${mark}</g>`;
  }).join("");
  const roomLines = board.rooms.map(room => `<rect x="${room.x * size + 1.5}" y="${room.y * size + 1.5}" width="${room.width * size - 3}" height="${room.height * size - 3}" fill="none" stroke="${ink}" stroke-width="3" pointer-events="none"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${board.width * size} ${board.height * size}" role="img" aria-label="${words.title}" style="display:block;width:100%;height:auto;background:${paper}">${cells}${roomLines}</svg>`;
}
