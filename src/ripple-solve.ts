import { RIPPLE_MAX_NODES } from "./ripple.constants.ts";
import { isRippleBoard, rippleRoomSizes } from "./ripple-board.ts";
import type { RippleBoard, RippleSolve } from "./ripple.types.ts";

/** Counts rule-valid fillings within an explicit node budget.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @param options - Solution/node limits or native SVG choices specified by the signature.
 * @returns Counts rule-valid fillings within an explicit node budget.
 * @example
 * ```ts
 * import type { RippleBoard } from "@johnmorrisdotca/kazu/ripple";
 * import { solveRipple } from "@johnmorrisdotca/kazu/ripple";
 *
 * const rippleBoard: RippleBoard = {"width":9,"height":9,"rooms":[0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8],"clues":[4,null,7,9,2,null,5,null,3,null,null,3,6,7,4,8,9,2,8,null,2,1,3,null,null,null,null,7,null,1,null,6,null,null,null,9,3,8,null,5,1,7,null,null,6,2,4,6,null,9,3,7,5,1,1,null,8,null,5,null,9,2,4,null,2,null,null,null,null,null,null,null,6,null,null,2,4,null,null,3,null]};
 * console.log(solveRipple(rippleBoard,{limit:2,nodes:20000}));
 * ```
 */
export function solveRipple(board: RippleBoard, options: { limit?: number; nodes?: number } = {}): RippleSolve {
  if (!isRippleBoard(board)) throw new RangeError("Invalid Ripple Effect board");
  const limit = options.limit ?? 2, budget = options.nodes ?? RIPPLE_MAX_NODES;
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(budget) || budget < 1) throw new RangeError("Invalid search bounds");
  const sizes = rippleRoomSizes(board);
  const values = board.clues.map(clue => clue ?? 0);
  const roomUsed = sizes.map(() => new Set<number>());
  let count = 0, nodes = 0, complete = true, solution: number[] | null = null;
  for (let cell = 0; cell < values.length; cell += 1) {
    const value = values[cell]!;
    if (!value) continue;
    const room = board.rooms[cell]!;
    if (roomUsed[room]!.has(value) || conflicts(cell, value, values, board)) {
      return { count: 0, solution: null, complete: true, nodes: 0 };
    }
    roomUsed[room]!.add(value);
  }

  const visit = (): void => {
    if (count >= limit || !complete) { complete = false; return; }
    if (++nodes > budget) { complete = false; return; }
    let bestCell = -1, bestValues: number[] = [];
    for (let cell = 0; cell < values.length; cell += 1) {
      if (values[cell]) continue;
      const room = board.rooms[cell]!;
      const candidates: number[] = [];
      for (let value = 1; value <= sizes[room]!; value += 1) {
        if (!roomUsed[room]!.has(value) && !conflicts(cell, value, values, board)) candidates.push(value);
      }
      if (!candidates.length) return;
      if (bestCell < 0 || candidates.length < bestValues.length) {
        bestCell = cell;
        bestValues = candidates;
        if (candidates.length === 1) break;
      }
    }
    if (bestCell < 0) {
      count += 1;
      solution ??= [...values];
      return;
    }
    const room = board.rooms[bestCell]!;
    for (const value of bestValues) {
      values[bestCell] = value;
      roomUsed[room]!.add(value);
      visit();
      roomUsed[room]!.delete(value);
      values[bestCell] = 0;
      if (!complete || count >= limit) { complete = false; return; }
    }
  };
  visit();
  return { count, solution, complete, nodes };
}

function conflicts(cell: number, value: number, values: readonly number[], board: RippleBoard): boolean {
  const x = cell % board.width, y = Math.floor(cell / board.width);
  for (let other = 0; other < values.length; other += 1) {
    if (values[other] !== value || other === cell) continue;
    const ox = other % board.width, oy = Math.floor(other / board.width);
    if ((oy === y && Math.abs(ox - x) <= value) || (ox === x && Math.abs(oy - y) <= value)) return true;
  }
  return false;
}
