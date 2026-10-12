/** A white digit cell or a black clue cell with optional across/down totals.
 *
 * @example
 * ```ts
 * import type { CrossSumsCell } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * const value: CrossSumsCell = {kind:"white"};
 * console.log(value);
 * ```
 */
export type CrossSumsCell = { kind: "white" } | { kind: "black"; across: number | null; down: number | null };
/** CrossSums dimensions and printed clues in their native row-major representation.
 *
 * @example
 * ```ts
 * import type { CrossSumsBoard } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * const crossSumsBoard: CrossSumsBoard = {"width":5,"height":5,"cells":[{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":10},{"kind":"black","across":null,"down":7},{"kind":"black","across":null,"down":12},{"kind":"black","across":null,"down":null},{"kind":"black","across":6,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":23,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null}]};
 * const value: CrossSumsBoard = crossSumsBoard;
 * console.log(value);
 * ```
 */
export type CrossSumsBoard = { width: number; height: number; cells: readonly CrossSumsCell[] };
/** One across or down digit run, its clue cell, constituent cells and target sum.
 *
 * @example
 * ```ts
 * import type { CrossSumsBoard, CrossSumsRun } from "@johnmorrisdotca/kazu/cross-sums";
 * import { crossSumsRuns } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * const crossSumsBoard: CrossSumsBoard = {"width":5,"height":5,"cells":[{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":10},{"kind":"black","across":null,"down":7},{"kind":"black","across":null,"down":12},{"kind":"black","across":null,"down":null},{"kind":"black","across":6,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":23,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null}]};
 * const value: CrossSumsRun = crossSumsRuns(crossSumsBoard)[0];
 * console.log(value);
 * ```
 */
export type CrossSumsRun = { direction: "across" | "down"; clueCell: number; cells: readonly number[]; sum: number };
/** A native difficulty tier for generated CrossSums puzzles.
 *
 * @example
 * ```ts
 * import type { CrossSumsLevel } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * const value: CrossSumsLevel = "easy";
 * console.log(value);
 * ```
 */
export type CrossSumsLevel = "easy" | "medium" | "hard" | "extra-hard";
/** A seeded CrossSums board with its verified solution and native difficulty tier.
 *
 * @example
 * ```ts
 * import type { CrossSumsPuzzle } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * const crossSumsPuzzle: CrossSumsPuzzle = {"width":5,"height":5,"cells":[{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":10},{"kind":"black","across":null,"down":7},{"kind":"black","across":null,"down":12},{"kind":"black","across":null,"down":null},{"kind":"black","across":6,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":23,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null}],"seed":42,"level":"easy","solution":[0,0,0,0,0,0,0,2,1,3,0,0,8,6,9,0,0,0,0,0,0,0,0,0,0]};
 * const value: CrossSumsPuzzle = crossSumsPuzzle;
 * console.log(value);
 * ```
 */
export type CrossSumsPuzzle = CrossSumsBoard & { seed: number; level: CrossSumsLevel; solution: readonly number[] };
/**
 * How hard a board is, measured by solving it. `depth` 0 means the rules solve it, 1 that somebody has to suppose a
 * digit and watch it break, 2 that more than that is needed; `plain` says the single-run rules were enough (no
 * digit that must appear had to be traced). `probes` is how many suppositions depth 1 needed. The rest describes the runs.
 *
 * @example
 * ```ts
 * import type { CrossSumsBoard, CrossSumsRating } from "@johnmorrisdotca/kazu/cross-sums";
 * import { rateCrossSums } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * const crossSumsBoard: CrossSumsBoard = {"width":5,"height":5,"cells":[{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":10},{"kind":"black","across":null,"down":7},{"kind":"black","across":null,"down":12},{"kind":"black","across":null,"down":null},{"kind":"black","across":6,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":23,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null}]};
 * const value: CrossSumsRating = rateCrossSums(crossSumsBoard);
 * console.log(value);
 * ```
 */
export type CrossSumsRating = {
  depth: 0 | 1 | 2;
  plain: boolean;
  probes: number;
  whites: number;
  runs: number;
  longest: number;
  /** Mean number of squares in a run. */
  meanRun: number;
  /** Runs whose total can be made in only one way, as a share of the runs. */
  fixedShare: number;
};
/** The CrossSums completion result and cells that violate its native rules.
 *
 * @example
 * ```ts
 * import type { CrossSumsBoard, CrossSumsCheck, CrossSumsPuzzle } from "@johnmorrisdotca/kazu/cross-sums";
 * import { checkCrossSums } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * const crossSumsBoard: CrossSumsBoard = {"width":5,"height":5,"cells":[{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":10},{"kind":"black","across":null,"down":7},{"kind":"black","across":null,"down":12},{"kind":"black","across":null,"down":null},{"kind":"black","across":6,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":23,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null}]};
 * const crossSumsSolution: CrossSumsPuzzle["solution"] = [0,0,0,0,0,0,0,2,1,3,0,0,8,6,9,0,0,0,0,0,0,0,0,0,0];
 * const value: CrossSumsCheck = checkCrossSums(crossSumsBoard,crossSumsSolution);
 * console.log(value);
 * ```
 */
export type CrossSumsCheck = { ok: boolean; complete: boolean; errors: readonly number[] };
/** A bounded CrossSums solve result: answer count, first solution, node work and whether the search completed.
 *
 * @example
 * ```ts
 * import type { CrossSumsBoard, CrossSumsSolve } from "@johnmorrisdotca/kazu/cross-sums";
 * import { solveCrossSums } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * const crossSumsBoard: CrossSumsBoard = {"width":5,"height":5,"cells":[{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":10},{"kind":"black","across":null,"down":7},{"kind":"black","across":null,"down":12},{"kind":"black","across":null,"down":null},{"kind":"black","across":6,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":23,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null}]};
 * const value: CrossSumsSolve = solveCrossSums(crossSumsBoard,undefined,{limit:2,nodes:20000});
 * console.log(value);
 * ```
 */
export type CrossSumsSolve = { count: number; solution: readonly number[] | null; complete: boolean; nodes: number };
/** The immutable CrossSums board, current entries or marks, undo history and assistance state.
 *
 * @example
 * ```ts
 * import type { CrossSumsBoard, CrossSumsGame } from "@johnmorrisdotca/kazu/cross-sums";
 * import { newCrossSums } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * const crossSumsBoard: CrossSumsBoard = {"width":5,"height":5,"cells":[{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":10},{"kind":"black","across":null,"down":7},{"kind":"black","across":null,"down":12},{"kind":"black","across":null,"down":null},{"kind":"black","across":6,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":23,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null}]};
 * const crossSumsGame = newCrossSums(crossSumsBoard);
 * const value: CrossSumsGame = crossSumsGame;
 * console.log(value);
 * ```
 */
export type CrossSumsGame = { board: CrossSumsBoard; values: readonly number[]; notes: readonly (readonly number[])[]; history: readonly { values: readonly number[]; notes: readonly (readonly number[])[] }[]; helped: boolean };
/** The native English or Japanese display language for CrossSums.
 *
 * @example
 * ```ts
 * import type { CrossSumsLanguage } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * const value: CrossSumsLanguage = "en";
 * console.log(value);
 * ```
 */
export type CrossSumsLanguage = "en" | "ja";
/** A supported material of the native CrossSums board.
 *
 * @example
 * ```ts
 * import type { CrossSumsMaterial } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * const value: CrossSumsMaterial = "ivory";
 * console.log(value);
 * ```
 */
export type CrossSumsMaterial = "ivory" | "wood" | "slate";
/** A supported native CrossSums mark or piece appearance.
 *
 * @example
 * ```ts
 * import type { CrossSumsPieces } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * const value: CrossSumsPieces = "ink";
 * console.log(value);
 * ```
 */
export type CrossSumsPieces = "ink" | "tiles";
