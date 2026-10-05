import { RIPPLE_MAX_NODES } from "./ripple.constants.ts";
import { isRippleBoard, rippleRoomSizes } from "./rippleBoard.ts";
import type { RippleBoard, RippleSolve } from "./ripple.types.ts";

/** Counts rule-valid fillings within an explicit node budget. */
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
