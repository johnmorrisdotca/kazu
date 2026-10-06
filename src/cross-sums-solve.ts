import { CROSS_SUMS_MAX_NODES } from "./cross-sums.constants.ts";
import { isCrossSumsBoard } from "./cross-sums-board.ts";
import { crossSumsModel } from "./cross-sums-logic.ts";
import { decide, openSlots, solveCsp } from "./csp.ts";
import type { CrossSumsBoard, CrossSumsSolve } from "./cross-sums.types.ts";

/** Bounded exact counter over across and down runs; an interrupted search never proves uniqueness. */
export function solveCrossSums(board: CrossSumsBoard, entries: readonly number[] = [], options: { limit?: number; nodes?: number } = {}): CrossSumsSolve {
  if (!isCrossSumsBoard(board)) throw new RangeError("Invalid Cross Sums board");
  const limit = options.limit ?? 2, budget = options.nodes ?? CROSS_SUMS_MAX_NODES;
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(budget) || budget < 1) throw new RangeError("Invalid search bounds");
  if (entries.length && entries.length !== board.cells.length) throw new RangeError("Invalid Cross Sums entries");
  const { csp, whites } = crossSumsModel(board);
  const start = openSlots(csp);
  for (let cell = 0; cell < entries.length; cell += 1) {
    const value = entries[cell]!;
    if (board.cells[cell]!.kind === "black" ? value !== 0 : !Number.isInteger(value) || value < 0 || value > 9) {
      return { count: 0, solution: null, complete: true, nodes: 0 };
    }
  }
  whites.forEach((cell, i) => { const value = entries[cell]; if (value) decide(csp, start, i, 9 * i + value - 1); });
  const found = solveCsp(csp, start, limit, budget);
  let solution: number[] | null = null;
  if (found.solution) {
    solution = Array(board.cells.length).fill(0);
    whites.forEach((cell, i) => { for (let d = 0; d < 9; d += 1) if (found.solution![9 * i + d]) solution![cell] = d + 1; });
  }
  return { count: found.count, solution, complete: !found.exhausted && !found.stopped, nodes: found.nodes };
}
