import { LOOP_MOST_NODES } from "./loop.constants.ts";
import { isLoopBoard, loopEdgeCount } from "./loop-board.ts";
import { loopModel } from "./loop-logic.ts";
import { openSlots, solveCsp } from "./csp.ts";
import type { LoopBoard, LoopSolve } from "./loop.types.ts";

/** Counts loop solutions with the pruning in `loopLogic.ts` under explicit work bounds. */
export function solveLoop(
  board: LoopBoard,
  options: { limit?: number; nodes?: number } = {},
): LoopSolve {
  if (!isLoopBoard(board)) throw new RangeError("Invalid Loop board");
  const limit = options.limit ?? 2;
  const budget = options.nodes ?? LOOP_MOST_NODES;
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(budget) || budget < 1) {
    throw new RangeError("Invalid search bounds");
  }
  const { csp } = loopModel(board);
  const found = solveCsp(csp, openSlots(csp), limit, budget);
  const edges = loopEdgeCount(board);
  const solution = found.solution ? Array.from({ length: edges }, (_, edge) => edge).filter(edge => found.solution![2 * edge + 1] === 1) : null;
  return { count: found.count, solution, complete: !found.exhausted && !found.stopped, nodes: found.nodes };
}
