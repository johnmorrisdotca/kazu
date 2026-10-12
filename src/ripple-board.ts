import { RIPPLE_MAX_SIDE, RIPPLE_MIN_SIDE } from "./ripple.constants.ts";
import type { RippleBoard, RippleCheck } from "./ripple.types.ts";

/** Whether the value has valid native Ripple dimensions, clues and data.
 *
 * @param value - A candidate board, digit, mark or encoded game specified by this signature.
 * @returns Whether the value has valid native Ripple dimensions, clues and data.
 * @example
 * ```ts
 * import type { RippleBoard } from "@johnmorrisdotca/kazu/ripple";
 * import { isRippleBoard } from "@johnmorrisdotca/kazu/ripple";
 *
 * const rippleBoard: RippleBoard = {"width":9,"height":9,"rooms":[0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8],"clues":[4,null,7,9,2,null,5,null,3,null,null,3,6,7,4,8,9,2,8,null,2,1,3,null,null,null,null,7,null,1,null,6,null,null,null,9,3,8,null,5,1,7,null,null,6,2,4,6,null,9,3,7,5,1,1,null,8,null,5,null,9,2,4,null,2,null,null,null,null,null,null,null,6,null,null,2,4,null,null,3,null]};
 * console.log(isRippleBoard(rippleBoard));
 * ```
 */
export function isRippleBoard(value: unknown): value is RippleBoard {
  if (!value || typeof value !== "object") return false;
  const board = value as RippleBoard;
  if (!Number.isInteger(board.width) || board.width < RIPPLE_MIN_SIDE || board.width > RIPPLE_MAX_SIDE
    || !Number.isInteger(board.height) || board.height < RIPPLE_MIN_SIDE || board.height > RIPPLE_MAX_SIDE
    || !Array.isArray(board.rooms) || !Array.isArray(board.clues)
    || board.rooms.length !== board.width * board.height || board.clues.length !== board.rooms.length
    || board.rooms.some(id => !Number.isInteger(id) || id < 0)) return false;
  const members = new Map<number, number[]>();
  board.rooms.forEach((id, cell) => members.set(id, [...(members.get(id) ?? []), cell]));
  const ids = [...members.keys()].sort((a, b) => a - b);
  if (ids.some((id, index) => id !== index)) return false;
  const sizes = new Map([...members].map(([id, cells]) => [id, cells.length]));
  if (board.clues.some((clue, cell) => clue !== null && (!Number.isInteger(clue) || clue < 1 || clue > sizes.get(board.rooms[cell]!)!))) return false;
  return [...members].every(([id, cells]) => connected(board, id, cells));
}

function connected(board: RippleBoard, room: number, cells: readonly number[]): boolean {
  const reached = new Set<number>([cells[0]!]);
  const queue = [cells[0]!];
  while (queue.length) {
    const cell = queue.pop()!;
    for (const next of [cell - board.width, cell + board.width, cell - 1, cell + 1]) {
      if (next < 0 || next >= board.rooms.length || (Math.abs(next - cell) === 1 && Math.floor(next / board.width) !== Math.floor(cell / board.width))) continue;
      if (board.rooms[next] === room && !reached.has(next)) { reached.add(next); queue.push(next); }
    }
  }
  return reached.size === cells.length;
}

/** Read the size of each room in a Ripple Effect board.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @returns Read the size of each room in a Ripple Effect board.
 * @example
 * ```ts
 * import type { RippleBoard } from "@johnmorrisdotca/kazu/ripple";
 * import { rippleRoomSizes } from "@johnmorrisdotca/kazu/ripple";
 *
 * const rippleBoard: RippleBoard = {"width":9,"height":9,"rooms":[0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8],"clues":[4,null,7,9,2,null,5,null,3,null,null,3,6,7,4,8,9,2,8,null,2,1,3,null,null,null,null,7,null,1,null,6,null,null,null,9,3,8,null,5,1,7,null,null,6,2,4,6,null,9,3,7,5,1,1,null,8,null,5,null,9,2,4,null,2,null,null,null,null,null,null,null,6,null,null,2,4,null,null,3,null]};
 * console.log(rippleRoomSizes(rippleBoard));
 * ```
 */
export function rippleRoomSizes(board: RippleBoard): number[] {
  const sizes: number[] = [];
  board.rooms.forEach(id => { sizes[id] = (sizes[id] ?? 0) + 1; });
  return sizes;
}

/** Checks room permutations and the at-least-N-cell gap between equal N clues in a line.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @param values - The current row-major cell values.
 * @returns Checks room permutations and the at-least-N-cell gap between equal N clues in a line.
 * @example
 * ```ts
 * import type { RippleBoard, RipplePuzzle } from "@johnmorrisdotca/kazu/ripple";
 * import { checkRipple } from "@johnmorrisdotca/kazu/ripple";
 *
 * const rippleBoard: RippleBoard = {"width":9,"height":9,"rooms":[0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8],"clues":[4,null,7,9,2,null,5,null,3,null,null,3,6,7,4,8,9,2,8,null,2,1,3,null,null,null,null,7,null,1,null,6,null,null,null,9,3,8,null,5,1,7,null,null,6,2,4,6,null,9,3,7,5,1,1,null,8,null,5,null,9,2,4,null,2,null,null,null,null,null,null,null,6,null,null,2,4,null,null,3,null]};
 * const rippleSolution: RipplePuzzle["solution"] = [4,6,7,9,2,8,5,1,3,5,1,3,6,7,4,8,9,2,8,9,2,1,3,5,4,6,7,7,5,1,4,6,2,3,8,9,3,8,9,5,1,7,2,4,6,2,4,6,8,9,3,7,5,1,1,3,8,7,5,6,9,2,4,9,2,4,3,8,1,6,7,5,6,7,5,2,4,9,1,3,8];
 * console.log(checkRipple(rippleBoard,rippleSolution));
 * ```
 */
export function checkRipple(board: RippleBoard, values: readonly number[]): RippleCheck {
  if (!isRippleBoard(board)) throw new RangeError("Invalid Ripple Effect board");
  if (values.length !== board.rooms.length) throw new RangeError("Invalid Ripple Effect values");
  const errors = new Set<number>();
  const sizes = rippleRoomSizes(board);
  const seen = new Map<number, number[]>();
  values.forEach((value, cell) => {
    const clue = board.clues[cell];
    if (!Number.isInteger(value) || value < 0 || value > sizes[board.rooms[cell]!]!
      || clue !== null && value !== clue) { errors.add(cell); return; }
    if (value > 0) seen.set(board.rooms[cell]!, [...(seen.get(board.rooms[cell]!) ?? []), value]);
  });
  for (const room of seen.keys()) {
    const cells = values.flatMap((value, cell) => board.rooms[cell] === room && value > 0 ? [value] : []);
    const duplicates = new Set(cells.filter((value, index) => cells.indexOf(value) !== index));
    if (duplicates.size) values.forEach((value, cell) => { if (board.rooms[cell] === room && duplicates.has(value)) errors.add(cell); });
  }
  const lines = [...Array.from({ length: board.height }, (_, y) => Array.from({ length: board.width }, (_, x) => y * board.width + x)),
    ...Array.from({ length: board.width }, (_, x) => Array.from({ length: board.height }, (_, y) => y * board.width + x))];
  for (const line of lines) for (let a = 0; a < line.length; a += 1) {
    const cell = line[a]!, value = values[cell]!;
    if (!value) continue;
    for (let b = a + 1; b < line.length; b += 1) {
      const other = line[b]!;
      if (values[other] === value && b - a <= value) { errors.add(cell); errors.add(other); }
    }
  }
  const complete = values.every(value => value > 0);
  if (complete) {
    for (let room = 0; room < sizes.length; room += 1) {
      const list = values.flatMap((value, cell) => board.rooms[cell] === room ? [value] : []).sort((a, b) => a - b);
      if (list.some((value, index) => value !== index + 1)) board.rooms.forEach((id, cell) => { if (id === room) errors.add(cell); });
    }
  }
  return { ok: errors.size === 0 && complete, errors: [...errors].sort((a, b) => a - b), complete };
}

/** Partial progress check; missing entries are allowed, but impossible room/ripple pairs are flagged.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @param values - The current row-major cell values.
 * @returns Partial progress check; missing entries are allowed, but impossible room/ripple pairs are flagged.
 * @example
 * ```ts
 * import type { RippleBoard, RipplePuzzle } from "@johnmorrisdotca/kazu/ripple";
 * import { progressRipple } from "@johnmorrisdotca/kazu/ripple";
 *
 * const rippleBoard: RippleBoard = {"width":9,"height":9,"rooms":[0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8],"clues":[4,null,7,9,2,null,5,null,3,null,null,3,6,7,4,8,9,2,8,null,2,1,3,null,null,null,null,7,null,1,null,6,null,null,null,9,3,8,null,5,1,7,null,null,6,2,4,6,null,9,3,7,5,1,1,null,8,null,5,null,9,2,4,null,2,null,null,null,null,null,null,null,6,null,null,2,4,null,null,3,null]};
 * const rippleSolution: RipplePuzzle["solution"] = [4,6,7,9,2,8,5,1,3,5,1,3,6,7,4,8,9,2,8,9,2,1,3,5,4,6,7,7,5,1,4,6,2,3,8,9,3,8,9,5,1,7,2,4,6,2,4,6,8,9,3,7,5,1,1,3,8,7,5,6,9,2,4,9,2,4,3,8,1,6,7,5,6,7,5,2,4,9,1,3,8];
 * console.log(progressRipple(rippleBoard,rippleSolution));
 * ```
 */
export function progressRipple(board: RippleBoard, values: readonly number[]): RippleCheck {
  const result = checkRipple(board, values);
  return { ...result, ok: result.errors.length === 0 };
}
