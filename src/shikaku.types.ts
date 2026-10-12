/** A rectangle uses zero-based column and row coordinates.
 *
 * @example
 * ```ts
 * import type { ShikakuPuzzle, ShikakuRectangle } from "@johnmorrisdotca/kazu/shikaku";
 *
 * const shikakuSolution: ShikakuPuzzle["solution"] = [{"x":0,"y":0,"width":3,"height":1},{"x":3,"y":0,"width":2,"height":1},{"x":1,"y":1,"width":4,"height":1},{"x":4,"y":2,"width":1,"height":3},{"x":0,"y":1,"width":1,"height":4},{"x":1,"y":2,"width":1,"height":3},{"x":2,"y":2,"width":2,"height":3}];
 * const value: ShikakuRectangle = shikakuSolution[0];
 * console.log(value);
 * ```
 */
export type ShikakuRectangle = { x: number; y: number; width: number; height: number };
/** One area clue per rectangle; zero is an unnumbered cell.
 *
 * @example
 * ```ts
 * import type { ShikakuBoard } from "@johnmorrisdotca/kazu/shikaku";
 *
 * const shikakuBoard: ShikakuBoard = {"width":5,"height":5,"clues":[3,0,0,0,2,0,0,0,0,4,0,0,0,0,0,0,0,0,0,3,4,3,6,0,0]};
 * const value: ShikakuBoard = shikakuBoard;
 * console.log(value);
 * ```
 */
export type ShikakuBoard = { width: number; height: number; clues: readonly number[] };
/** A native difficulty tier for generated Shikaku puzzles.
 *
 * @example
 * ```ts
 * import type { ShikakuLevel } from "@johnmorrisdotca/kazu/shikaku";
 *
 * const value: ShikakuLevel = "easy";
 * console.log(value);
 * ```
 */
export type ShikakuLevel = "easy" | "medium" | "hard" | "extra-hard";
/** A seeded Shikaku board with its verified solution and native difficulty tier.
 *
 * @example
 * ```ts
 * import type { ShikakuPuzzle } from "@johnmorrisdotca/kazu/shikaku";
 *
 * const shikakuPuzzle: ShikakuPuzzle = {"width":5,"height":5,"clues":[3,0,0,0,2,0,0,0,0,4,0,0,0,0,0,0,0,0,0,3,4,3,6,0,0],"seed":42,"level":"easy","solution":[{"x":0,"y":0,"width":3,"height":1},{"x":3,"y":0,"width":2,"height":1},{"x":1,"y":1,"width":4,"height":1},{"x":4,"y":2,"width":1,"height":3},{"x":0,"y":1,"width":1,"height":4},{"x":1,"y":2,"width":1,"height":3},{"x":2,"y":2,"width":2,"height":3}]};
 * const value: ShikakuPuzzle = shikakuPuzzle;
 * console.log(value);
 * ```
 */
export type ShikakuPuzzle = ShikakuBoard & { seed: number; level: ShikakuLevel; solution: readonly ShikakuRectangle[] };
/** The Shikaku completion result and cells that violate its native rules.
 *
 * @example
 * ```ts
 * import type { ShikakuBoard, ShikakuCheck, ShikakuPuzzle } from "@johnmorrisdotca/kazu/shikaku";
 * import { checkShikaku } from "@johnmorrisdotca/kazu/shikaku";
 *
 * const shikakuBoard: ShikakuBoard = {"width":5,"height":5,"clues":[3,0,0,0,2,0,0,0,0,4,0,0,0,0,0,0,0,0,0,3,4,3,6,0,0]};
 * const shikakuSolution: ShikakuPuzzle["solution"] = [{"x":0,"y":0,"width":3,"height":1},{"x":3,"y":0,"width":2,"height":1},{"x":1,"y":1,"width":4,"height":1},{"x":4,"y":2,"width":1,"height":3},{"x":0,"y":1,"width":1,"height":4},{"x":1,"y":2,"width":1,"height":3},{"x":2,"y":2,"width":2,"height":3}];
 * const value: ShikakuCheck = checkShikaku(shikakuBoard,shikakuSolution);
 * console.log(value);
 * ```
 */
export type ShikakuCheck = { ok: boolean; covered: number; errors: readonly number[] };
/** A bounded Shikaku solve result: answer count, first solution, node work and whether the search completed.
 *
 * @example
 * ```ts
 * import type { ShikakuBoard, ShikakuSolve } from "@johnmorrisdotca/kazu/shikaku";
 * import { solveShikaku } from "@johnmorrisdotca/kazu/shikaku";
 *
 * const shikakuBoard: ShikakuBoard = {"width":5,"height":5,"clues":[3,0,0,0,2,0,0,0,0,4,0,0,0,0,0,0,0,0,0,3,4,3,6,0,0]};
 * const value: ShikakuSolve = solveShikaku(shikakuBoard,[],{limit:2,nodes:20000});
 * console.log(value);
 * ```
 */
export type ShikakuSolve = { count: number; solution: readonly ShikakuRectangle[] | null; complete: boolean; nodes: number };
/** The immutable Shikaku board, current entries or marks, undo history and assistance state.
 *
 * @example
 * ```ts
 * import type { ShikakuBoard, ShikakuGame } from "@johnmorrisdotca/kazu/shikaku";
 * import { newShikaku } from "@johnmorrisdotca/kazu/shikaku";
 *
 * const shikakuBoard: ShikakuBoard = {"width":5,"height":5,"clues":[3,0,0,0,2,0,0,0,0,4,0,0,0,0,0,0,0,0,0,3,4,3,6,0,0]};
 * const shikakuGame = newShikaku(shikakuBoard);
 * const value: ShikakuGame = shikakuGame;
 * console.log(value);
 * ```
 */
export type ShikakuGame = { board: ShikakuBoard; rectangles: readonly ShikakuRectangle[]; history: readonly (readonly ShikakuRectangle[])[]; helped: boolean };
/**
 * How hard a board is, measured by solving it. `depth` 0 means the rules solve it, 1 that somebody has to suppose a
 * rectangle and watch it break, 2 that more than that is needed. `rules` is how many of the three rules a depth-0
 * solve needed: 1 for a number with one fitting rectangle (a settled rectangle clears its squares), 2 adding that a
 * square only one rectangle can cover is covered by it, 3 adding that a square only one number can reach makes that
 * number's rectangle cover it. `probes` is the suppositions depth 1 needed.
 *
 * @example
 * ```ts
 * import type { ShikakuBoard, ShikakuRating } from "@johnmorrisdotca/kazu/shikaku";
 * import { rateShikaku } from "@johnmorrisdotca/kazu/shikaku";
 *
 * const shikakuBoard: ShikakuBoard = {"width":5,"height":5,"clues":[3,0,0,0,2,0,0,0,0,4,0,0,0,0,0,0,0,0,0,3,4,3,6,0,0]};
 * const value: ShikakuRating = rateShikaku(shikakuBoard);
 * console.log(value);
 * ```
 */
export type ShikakuRating = {
  depth: 0 | 1 | 2;
  rules: 1 | 2 | 3;
  probes: number;
  rectangles: number;
  meanArea: number;
  largest: number;
  /** Mean number of rectangles a number could be at the start. */
  ambiguity: number;
};
