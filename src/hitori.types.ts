/** Hitori dimensions and printed clues in their native row-major representation.
 *
 * @example
 * ```ts
 * import type { HitoriBoard } from "@johnmorrisdotca/kazu/hitori";
 *
 * const hitoriBoard: HitoriBoard = {"size":5,"numbers":[4,5,5,1,2,5,2,3,2,1,2,5,4,2,2,3,1,2,5,4,2,3,1,3,4]};
 * const value: HitoriBoard = hitoriBoard;
 * console.log(value);
 * ```
 */
export type HitoriBoard = {
  size: number;
  numbers: readonly number[];
};

/** A native difficulty tier for generated Hitori puzzles.
 *
 * @example
 * ```ts
 * import type { HitoriLevel } from "@johnmorrisdotca/kazu/hitori";
 *
 * const value: HitoriLevel = "easy";
 * console.log(value);
 * ```
 */
export type HitoriLevel = "easy" | "medium" | "hard" | "extra-hard";

/** A seeded Hitori board with its verified solution and native difficulty tier.
 *
 * @example
 * ```ts
 * import type { HitoriPuzzle } from "@johnmorrisdotca/kazu/hitori";
 *
 * const hitoriPuzzle: HitoriPuzzle = {"size":5,"numbers":[4,5,5,1,2,5,2,3,2,1,2,5,4,2,2,3,1,2,5,4,2,3,1,3,4],"seed":42,"level":"easy","solution":[false,true,false,false,false,false,false,false,true,false,true,false,false,false,true,false,false,false,false,false,false,true,false,false,true]};
 * const value: HitoriPuzzle = hitoriPuzzle;
 * console.log(value);
 * ```
 */
export type HitoriPuzzle = HitoriBoard & {
  seed: number;
  level: HitoriLevel;
  solution: readonly boolean[];
};

/**
 * How hard a board is, measured by solving it. `depth` 0 means the rules solve it, 1 that somebody has to suppose a
 * square shaded or white and watch it break, 2 that more than that is needed. `reach` says the rule that the white
 * squares stay in one piece was needed at depth 0. `probes` is the suppositions depth 1 needed.
 *
 * @example
 * ```ts
 * import type { HitoriBoard, HitoriRating } from "@johnmorrisdotca/kazu/hitori";
 * import { rateHitori } from "@johnmorrisdotca/kazu/hitori";
 *
 * const hitoriBoard: HitoriBoard = {"size":5,"numbers":[4,5,5,1,2,5,2,3,2,1,2,5,4,2,2,3,1,2,5,4,2,3,1,3,4]};
 * const value: HitoriRating = rateHitori(hitoriBoard);
 * console.log(value);
 * ```
 */
export type HitoriRating = {
  depth: 0 | 1 | 2;
  reach: boolean;
  probes: number;
  shaded: number;
  /** Shaded squares as a share of the board. */
  shadedShare: number;
  /** Squares whose number repeats in their row or column, as a share of the board. */
  repeatShare: number;
};

/** A bounded Hitori solve result: answer count, first solution, node work and whether the search completed.
 *
 * @example
 * ```ts
 * import type { HitoriBoard, HitoriSolve } from "@johnmorrisdotca/kazu/hitori";
 * import { solveHitori } from "@johnmorrisdotca/kazu/hitori";
 *
 * const hitoriBoard: HitoriBoard = {"size":5,"numbers":[4,5,5,1,2,5,2,3,2,1,2,5,4,2,2,3,1,2,5,4,2,3,1,3,4]};
 * const value: HitoriSolve = solveHitori(hitoriBoard,{limit:2,nodes:20000});
 * console.log(value);
 * ```
 */
export type HitoriSolve = {
  count: number;
  solution: readonly boolean[] | null;
  complete: boolean;
  nodes: number;
};

/** The immutable Hitori board, current entries or marks, undo history and assistance state.
 *
 * @example
 * ```ts
 * import type { HitoriBoard, HitoriGame } from "@johnmorrisdotca/kazu/hitori";
 * import { newHitori } from "@johnmorrisdotca/kazu/hitori";
 *
 * const hitoriBoard: HitoriBoard = {"size":5,"numbers":[4,5,5,1,2,5,2,3,2,1,2,5,4,2,2,3,1,2,5,4,2,3,1,3,4]};
 * const hitoriGame = newHitori(hitoriBoard);
 * const value: HitoriGame = hitoriGame;
 * console.log(value);
 * ```
 */
export type HitoriGame = {
  board: HitoriBoard;
  shaded: readonly boolean[];
  history: readonly (readonly boolean[])[];
  helped: boolean;
};
