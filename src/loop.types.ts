/** Loop dimensions and printed clues in their native row-major representation.
 *
 * @example
 * ```ts
 * import type { LoopBoard } from "@johnmorrisdotca/kazu/loop";
 *
 * const loopBoard: LoopBoard = {"width":5,"height":5,"clues":[2,3,1,null,null,3,1,1,null,null,3,2,2,null,null,3,0,2,2,null,2,2,1,2,3]};
 * const value: LoopBoard = loopBoard;
 * console.log(value);
 * ```
 */
export type LoopBoard = { width: number; height: number; clues: readonly (number | null)[] };
/** A native difficulty tier for generated Loop puzzles.
 *
 * @example
 * ```ts
 * import type { LoopLevel } from "@johnmorrisdotca/kazu/loop";
 *
 * const value: LoopLevel = "easy";
 * console.log(value);
 * ```
 */
export type LoopLevel = "easy" | "medium" | "hard" | "extra-hard";
/** A seeded Loop board with its verified solution and native difficulty tier.
 *
 * @example
 * ```ts
 * import type { LoopPuzzle } from "@johnmorrisdotca/kazu/loop";
 *
 * const loopPuzzle: LoopPuzzle = {"width":5,"height":5,"clues":[2,3,1,null,null,3,1,1,null,null,3,2,2,null,null,3,0,2,2,null,2,2,1,2,3],"seed":42,"level":"easy","solution":[1,5,10,15,17,20,23,24,26,27,28,29,31,32,36,38,43,44,48,51,55,59]};
 * const value: LoopPuzzle = loopPuzzle;
 * console.log(value);
 * ```
 */
export type LoopPuzzle = LoopBoard & { seed: number; level: LoopLevel; solution: readonly number[] };
/**
 * How hard a board is, measured by solving it. `depth` 0 means the plain rules solve it, 1 that somebody has to
 * suppose an edge drawn or crossed and watch it break, 2 that more than that is needed; `probes` is how many
 * suppositions depth 1 needed. The rest describes the board.
 *
 * @example
 * ```ts
 * import type { LoopBoard, LoopRating } from "@johnmorrisdotca/kazu/loop";
 * import { rateLoop } from "@johnmorrisdotca/kazu/loop";
 *
 * const loopBoard: LoopBoard = {"width":5,"height":5,"clues":[2,3,1,null,null,3,1,1,null,null,3,2,2,null,null,3,0,2,2,null,2,2,1,2,3]};
 * const value: LoopRating = rateLoop(loopBoard);
 * console.log(value);
 * ```
 */
export type LoopRating = {
  depth: 0 | 1 | 2;
  probes: number;
  clues: number;
  /** Numbered squares as a share of all squares. */
  clueShare: number;
  /** Squares numbered 0 as a share of the numbered ones. */
  zeroShare: number;
  /** Edges in the loop. */
  loop: number;
};
/** The Loop completion result and cells that violate its native rules.
 *
 * @example
 * ```ts
 * import type { LoopBoard, LoopCheck, LoopPuzzle } from "@johnmorrisdotca/kazu/loop";
 * import { checkLoop } from "@johnmorrisdotca/kazu/loop";
 *
 * const loopBoard: LoopBoard = {"width":5,"height":5,"clues":[2,3,1,null,null,3,1,1,null,null,3,2,2,null,null,3,0,2,2,null,2,2,1,2,3]};
 * const loopSolution: LoopPuzzle["solution"] = [1,5,10,15,17,20,23,24,26,27,28,29,31,32,36,38,43,44,48,51,55,59];
 * const value: LoopCheck = checkLoop(loopBoard,loopSolution);
 * console.log(value);
 * ```
 */
export type LoopCheck = { ok: boolean; errors: readonly number[]; clues: readonly number[]; vertices: readonly number[]; loops: number };
/** The Loop constraint status of a partial board.
 *
 * @example
 * ```ts
 * import type { LoopBoard, LoopProgress, LoopPuzzle } from "@johnmorrisdotca/kazu/loop";
 * import { progressLoop } from "@johnmorrisdotca/kazu/loop";
 *
 * const loopBoard: LoopBoard = {"width":5,"height":5,"clues":[2,3,1,null,null,3,1,1,null,null,3,2,2,null,null,3,0,2,2,null,2,2,1,2,3]};
 * const loopSolution: LoopPuzzle["solution"] = [1,5,10,15,17,20,23,24,26,27,28,29,31,32,36,38,43,44,48,51,55,59];
 * const value: LoopProgress = progressLoop(loopBoard,loopSolution);
 * console.log(value);
 * ```
 */
export type LoopProgress = { ok: boolean; clues: readonly number[]; vertices: readonly number[]; loops: number };
/** A bounded Loop solve result: answer count, first solution, node work and whether the search completed.
 *
 * @example
 * ```ts
 * import type { LoopBoard, LoopSolve } from "@johnmorrisdotca/kazu/loop";
 * import { solveLoop } from "@johnmorrisdotca/kazu/loop";
 *
 * const loopBoard: LoopBoard = {"width":5,"height":5,"clues":[2,3,1,null,null,3,1,1,null,null,3,2,2,null,null,3,0,2,2,null,2,2,1,2,3]};
 * const value: LoopSolve = solveLoop(loopBoard,{limit:2,nodes:20000});
 * console.log(value);
 * ```
 */
export type LoopSolve = { count: number; solution: readonly number[] | null; complete: boolean; nodes: number };
/** The immutable Loop board, current entries or marks, undo history and assistance state.
 *
 * @example
 * ```ts
 * import type { LoopBoard, LoopGame } from "@johnmorrisdotca/kazu/loop";
 * import { newLoop } from "@johnmorrisdotca/kazu/loop";
 *
 * const loopBoard: LoopBoard = {"width":5,"height":5,"clues":[2,3,1,null,null,3,1,1,null,null,3,2,2,null,null,3,0,2,2,null,2,2,1,2,3]};
 * const loopGame = newLoop(loopBoard);
 * const value: LoopGame = loopGame;
 * console.log(value);
 * ```
 */
export type LoopGame = { board: LoopBoard; edges: readonly number[]; history: readonly (readonly number[])[]; helped: boolean };
