import { SLITHERLINK_MOST_NODES } from "./slitherlink.constants.ts";
import { isSlitherlinkBoard, slitherlinkEdgeCount } from "./slitherlink-board.ts";
import { slitherlinkModel } from "./slitherlink-logic.ts";
import { openSlots, solveCsp } from "./csp.ts";
import type { SlitherlinkBoard, SlitherlinkSolve } from "./slitherlink.types.ts";

/** Counts loop solutions with the pruning in `slitherlinkLogic.ts` under explicit work bounds. */
export function solveSlitherlink(
  board: SlitherlinkBoard,
  options: { limit?: number; nodes?: number } = {},
): SlitherlinkSolve {
  if (!isSlitherlinkBoard(board)) throw new RangeError("Invalid Slitherlink board");
  const limit = options.limit ?? 2;
  const budget = options.nodes ?? SLITHERLINK_MOST_NODES;
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(budget) || budget < 1) {
    throw new RangeError("Invalid search bounds");
  }
  const { csp } = slitherlinkModel(board);
  const found = solveCsp(csp, openSlots(csp), limit, budget);
  const edges = slitherlinkEdgeCount(board);
  const solution = found.solution ? Array.from({ length: edges }, (_, edge) => edge).filter(edge => found.solution![2 * edge + 1] === 1) : null;
  return { count: found.count, solution, complete: !found.exhausted && !found.stopped, nodes: found.nodes };
}
