import { HITORI_MAX_NODES } from "./hitori.constants.ts";
import { isHitoriBoard } from "./hitori-board.ts";
import { hitoriModel } from "./hitori-logic.ts";
import { openSlots, solveCsp } from "./csp.ts";
import type { HitoriBoard, HitoriSolve } from "./hitori.types.ts";

/**
 * Counts distinct minimal shade patterns: an answer shades only squares that settle a duplicate, so extra shades
 * are never a second answer. A non-complete result never asserts uniqueness.
 */
export function solveHitori(board: HitoriBoard, options: { limit?: number; nodes?: number } = {}): HitoriSolve {
  if (!isHitoriBoard(board)) throw new RangeError("Invalid Hitori board");
  const limit = Math.max(1, Math.floor(options.limit ?? 2));
  const budget = Math.max(1, Math.floor(options.nodes ?? HITORI_MAX_NODES));
  const { csp } = hitoriModel(board);
  const found = solveCsp(csp, openSlots(csp), limit, budget);
  const solution = found.solution ? Array.from({ length: board.size ** 2 }, (_, cell) => found.solution![2 * cell + 1] === 1) : null;
  return { count: found.count, solution, complete: !found.exhausted && !found.stopped, nodes: found.nodes };
}
