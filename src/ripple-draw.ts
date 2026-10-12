import { rippleRoomSizes } from "./ripple-board.ts";
import type { RippleBoard } from "./ripple.types.ts";
import type { RippleDrawOptions } from "./ripple-play.types.ts";

/** Render the Ripple board and supplied current state as native SVG text.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @param options - Solution/node limits or native SVG choices specified by the signature.
 * @returns Render the Ripple board and supplied current state as native SVG text.
 * @example
 * ```ts
 * import type { RippleBoard } from "@johnmorrisdotca/kazu/ripple";
 * import { drawRipple } from "@johnmorrisdotca/kazu/ripple";
 *
 * const rippleBoard: RippleBoard = {"width":9,"height":9,"rooms":[0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8],"clues":[4,null,7,9,2,null,5,null,3,null,null,3,6,7,4,8,9,2,8,null,2,1,3,null,null,null,null,7,null,1,null,6,null,null,null,9,3,8,null,5,1,7,null,null,6,2,4,6,null,9,3,7,5,1,1,null,8,null,5,null,9,2,4,null,2,null,null,null,null,null,null,null,6,null,null,2,4,null,null,3,null]};
 * console.log(drawRipple(rippleBoard).startsWith("<svg"));
 * ```
 */
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
