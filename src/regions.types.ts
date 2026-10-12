/** Regions dimensions and printed clues in their native row-major representation.
 *
 * @example
 * ```ts
 * import type { RegionsBoard } from "@johnmorrisdotca/kazu/regions";
 *
 * const regionsBoard: RegionsBoard = {"width":5,"height":5,"givens":[0,0,2,0,3,2,0,3,0,0,0,3,0,0,1,3,1,0,1,2,3,3,4,0,0]};
 * const value: RegionsBoard = regionsBoard;
 * console.log(value);
 * ```
 */
export type RegionsBoard = {
  width: number;
  height: number;
  givens: readonly number[];
};

/** A seeded Regions board with its verified solution and native difficulty tier.
 *
 * @example
 * ```ts
 * import type { RegionsPuzzle } from "@johnmorrisdotca/kazu/regions";
 *
 * const regionsPuzzle: RegionsPuzzle = {"width":5,"height":5,"givens":[0,0,2,0,3,2,0,3,0,0,0,3,0,0,1,3,1,0,1,2,3,3,4,0,0],"seed":42,"level":"easy","solution":[1,2,2,3,3,2,3,3,2,3,2,3,4,2,1,3,1,4,1,2,3,3,4,4,2]};
 * const value: RegionsPuzzle = regionsPuzzle;
 * console.log(value);
 * ```
 */
export type RegionsPuzzle = RegionsBoard & {
  seed: number;
  level: RegionsLevel;
  solution: readonly number[];
};

/** A native difficulty tier for generated Regions puzzles.
 *
 * @example
 * ```ts
 * import type { RegionsLevel } from "@johnmorrisdotca/kazu/regions";
 *
 * const value: RegionsLevel = "easy";
 * console.log(value);
 * ```
 */
export type RegionsLevel = "easy" | "medium" | "hard" | "extra-hard";
/** The Regions completion result and cells that violate its native rules.
 *
 * @example
 * ```ts
 * import type { RegionsBoard, RegionsCheck, RegionsPuzzle } from "@johnmorrisdotca/kazu/regions";
 * import { checkRegions } from "@johnmorrisdotca/kazu/regions";
 *
 * const regionsBoard: RegionsBoard = {"width":5,"height":5,"givens":[0,0,2,0,3,2,0,3,0,0,0,3,0,0,1,3,1,0,1,2,3,3,4,0,0]};
 * const regionsSolution: RegionsPuzzle["solution"] = [1,2,2,3,3,2,3,3,2,3,2,3,4,2,1,3,1,4,1,2,3,3,4,4,2];
 * const value: RegionsCheck = checkRegions(regionsBoard,regionsSolution);
 * console.log(value);
 * ```
 */
export type RegionsCheck = {
  ok: boolean;
  complete: boolean;
  filled: number;
  regions: number;
  errors: readonly number[];
};
/** A bounded Regions solve result: answer count, first solution, node work and whether the search completed.
 *
 * @example
 * ```ts
 * import type { RegionsBoard, RegionsSolve } from "@johnmorrisdotca/kazu/regions";
 * import { solveRegions } from "@johnmorrisdotca/kazu/regions";
 *
 * const regionsBoard: RegionsBoard = {"width":5,"height":5,"givens":[0,0,2,0,3,2,0,3,0,0,0,3,0,0,1,3,1,0,1,2,3,3,4,0,0]};
 * const value: RegionsSolve = solveRegions(regionsBoard,undefined,{limit:2,nodes:20000});
 * console.log(value);
 * ```
 */
export type RegionsSolve = {
  count: number;
  solution: readonly number[] | null;
  complete: boolean;
  nodes: number;
};
/** The immutable Regions board, current entries or marks, undo history and assistance state.
 *
 * @example
 * ```ts
 * import type { RegionsBoard, RegionsGame } from "@johnmorrisdotca/kazu/regions";
 * import { newRegions } from "@johnmorrisdotca/kazu/regions";
 *
 * const regionsBoard: RegionsBoard = {"width":5,"height":5,"givens":[0,0,2,0,3,2,0,3,0,0,0,3,0,0,1,3,1,0,1,2,3,3,4,0,0]};
 * const regionsGame = newRegions(regionsBoard);
 * const value: RegionsGame = regionsGame;
 * console.log(value);
 * ```
 */
export type RegionsGame = {
  board: RegionsBoard;
  entries: readonly number[];
  history: readonly (readonly number[])[];
  helped: boolean;
};
/**
 * How hard a board is, measured by solving it. `depth` 0 means the rules solve it, 1 that somebody has to suppose a
 * number in a square and watch it break, 2 that more than that is needed; `probes` is how many suppositions depth 1
 * needed. The rest describes the board.
 *
 * @example
 * ```ts
 * import type { RegionsBoard, RegionsRating } from "@johnmorrisdotca/kazu/regions";
 * import { rateRegions } from "@johnmorrisdotca/kazu/regions";
 *
 * const regionsBoard: RegionsBoard = {"width":5,"height":5,"givens":[0,0,2,0,3,2,0,3,0,0,0,3,0,0,1,3,1,0,1,2,3,3,4,0,0]};
 * const value: RegionsRating = rateRegions(regionsBoard);
 * console.log(value);
 * ```
 */
export type RegionsRating = {
  depth: 0 | 1 | 2;
  probes: number;
  givens: number;
  /** Squares that are given, as a share of the board. */
  givenShare: number;
  regions: number;
  /** Regions with no given in them: they are found only by what is round them. */
  unnamed: number;
  largest: number;
  meanRegion: number;
};
