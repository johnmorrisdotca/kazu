import { AKARI_MOST_NODES } from "./akari.constants.ts";
import { isAkariBoard } from "./akari-board.ts";
import { akariModel } from "./akari-logic.ts";
import { openSlots, solveCsp } from "./csp.ts";
import type { AkariBoard, AkariSolve } from "./akari.types.ts";

/** Bounded constraint search over the rules in `akariLogic.ts`; a stopped proof is always marked incomplete.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @param options - Solution/node limits or native SVG choices specified by the signature.
 * @returns Bounded constraint search over the rules in `akariLogic.ts`; a stopped proof is always marked incomplete.
 * @example
 * ```ts
 * import type { AkariBoard } from "@johnmorrisdotca/kazu/akari";
 * import { solveAkari } from "@johnmorrisdotca/kazu/akari";
 *
 * const akariBoard: AkariBoard = {"width":5,"height":5,"cells":[1,null,null,null,null,0,null,null,null,0,1,0,null,null,null,null,false,null,null,null,null,false,null,null,2]};
 * console.log(solveAkari(akariBoard,{limit:2,nodes:20000}));
 * ```
 */
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
