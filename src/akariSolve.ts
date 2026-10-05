import { AKARI_MOST_NODES } from "./akari.constants.ts";
import { isAkariBoard } from "./akariBoard.ts";
import { akariModel } from "./akariLogic.ts";
import { openSlots, solveCsp } from "./csp.ts";
import type { AkariBoard, AkariSolve } from "./akari.types.ts";

/** Bounded constraint search over the rules in `akariLogic.ts`; a stopped proof is always marked incomplete. */
export function solveAkari(
  board: AkariBoard,
  options: { limit?: number; nodes?: number } = {},
): AkariSolve {
  if (!isAkariBoard(board)) throw new RangeError("Invalid Akari board");
  const limit = options.limit ?? 2;
  const budget = options.nodes ?? AKARI_MOST_NODES;
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(budget) || budget < 1) {
    throw new RangeError("Invalid search bounds");
  }
  const { csp, whites } = akariModel(board);
  const found = solveCsp(csp, openSlots(csp), limit, budget);
  const solution = found.solution ? whites.filter((_, i) => found.solution![2 * i + 1] === 1) : null;
  return { count: found.count, solution, complete: !found.exhausted && !found.stopped, nodes: found.nodes };
}
