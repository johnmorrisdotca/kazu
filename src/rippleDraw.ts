import { rippleRoomSizes } from "./rippleBoard.ts";
import type { RippleBoard } from "./ripple.types.ts";
import type { RippleDrawOptions } from "./ripplePlay.types.ts";

export function drawRipple(board: RippleBoard, options: RippleDrawOptions = {}): string {
  const size = 56, margin = 8, width = board.width * size, height = board.height * size;
  const ink = options.material === "slate" ? "#f1eee5" : options.material === "wood" ? "#382d20" : "#252824";
  const line = options.material === "slate" ? "#899697" : options.material === "wood" ? "#80613c" : "#8b8578";
  const surface = options.material === "slate" ? "#354247" : options.material === "wood" ? "#dfc18f" : "#faf7ef";
  const values = options.values ?? board.clues.map(clue => clue ?? 0);
  const notes = options.notes ?? board.rooms.map(() => []);
  const sizes = rippleRoomSizes(board);
  const cells = Array.from({ length: board.rooms.length }, (_, cell) => {
    const x = cell % board.width * size, y = Math.floor(cell / board.width) * size;
    const room = board.rooms[cell]!;
    const clue = board.clues[cell];
    const value = values[cell] ?? 0;
    const text = clue !== null ? `<text class="rp-clue" x="${x + size / 2}" y="${y + size * .64}">${clue}</text>`
      : value ? `<text class="rp-value" x="${x + size / 2}" y="${y + size * .64}">${value}</text>`
      : (notes[cell] ?? []).map((note, i) => `<text class="rp-note" x="${x + 14 + i % 3 * 14}" y="${y + 18 + Math.floor(i / 3) * 14}">${note}</text>`).join("");
    const selected = options.selected === cell;
    const piece = options.pieces === "tiles" ? `<rect class="rp-piece" x="${x + 9}" y="${y + 9}" width="${size - 18}" height="${size - 18}" rx="6"/>` : "";
    const error = options.errors?.includes(cell) ?? false;
    return `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${selected ? "#dce9c9" : surface}" stroke="${error ? "#c34b3e" : line}" stroke-width="1"/>${piece}${text}<title>${Math.floor(cell / board.width) + 1}, ${cell % board.width + 1}: ${clue !== null ? `clue ${clue}` : value ? `entry ${value}` : `room of ${sizes[room]}`}</title>`;
  }).join("");
  const walls = board.rooms.flatMap((room, cell) => {
    const x = cell % board.width, y = Math.floor(cell / board.width), edges: string[] = [];
    if (x + 1 < board.width && board.rooms[cell + 1] !== room) edges.push(`<path d="M${(x + 1) * size} ${y * size}v${size}"/>`);
    if (y + 1 < board.height && board.rooms[cell + board.width] !== room) edges.push(`<path d="M${x * size} ${(y + 1) * size}h${size}"/>`);
    return edges;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ripple Effect ${board.width} by ${board.height}" viewBox="-${margin} -${margin} ${width + margin * 2} ${height + margin * 2}" style="color:${ink}"><style>.rp-clue,.rp-value{font:500 27px system-ui;text-anchor:middle;fill:${ink}}.rp-clue{font-weight:700}.rp-note{font:12px system-ui;text-anchor:middle;fill:${ink}}.rp-piece{fill:none;stroke:${line};stroke-width:2}</style>${cells}<g fill="none" stroke="${ink}" stroke-width="3">${walls}</g></svg>`;
}
