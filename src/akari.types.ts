/** A board is row-major. null is white, false is a plain black square, and 0–4 are numbered black squares.
 *
 * @example
 * ```ts
 * import type { AkariBoard } from "@johnmorrisdotca/kazu/akari";
 *
 * const akariBoard: AkariBoard = {"width":5,"height":5,"cells":[1,null,null,null,null,0,null,null,null,0,1,0,null,null,null,null,false,null,null,null,null,false,null,null,2]};
 * const value: AkariBoard = akariBoard;
 * console.log(value);
 * ```
 */
export type AkariBoard = { width: number; height: number; cells: readonly (number | null | false)[] };
/** A native difficulty tier for generated Akari puzzles.
 *
 * @example
 * ```ts
 * import type { AkariLevel } from "@johnmorrisdotca/kazu/akari";
 *
 * const value: AkariLevel = "easy";
 * console.log(value);
 * ```
 */
export type AkariLevel = "easy" | "medium" | "hard" | "extra-hard";
/** A seeded Akari board with its verified solution and native difficulty tier.
 *
 * @example
 * ```ts
 * import type { AkariPuzzle } from "@johnmorrisdotca/kazu/akari";
 *
 * const akariPuzzle: AkariPuzzle = {"width":5,"height":5,"cells":[1,null,null,null,null,0,null,null,null,0,1,0,null,null,null,null,false,null,null,null,null,false,null,null,2],"seed":42,"level":"easy","solution":[1,7,15,19,23]};
 * const value: AkariPuzzle = akariPuzzle;
 * console.log(value);
 * ```
 */
export type AkariPuzzle = AkariBoard & { seed: number; level: AkariLevel; solution: readonly number[] };
/**
 * How hard a board is, measured by solving it. `depth` 0 means the plain rules solve it, 1 means somebody has to
 * suppose a bulb or an empty square and see it break, 2 means more than that. `probes` is how many suppositions
 * the depth-1 reasoning needed. The rest describes the board.
 *
 * @example
 * ```ts
 * import type { AkariBoard, AkariRating } from "@johnmorrisdotca/kazu/akari";
 * import { rateAkari } from "@johnmorrisdotca/kazu/akari";
 *
 * const akariBoard: AkariBoard = {"width":5,"height":5,"cells":[1,null,null,null,null,0,null,null,null,0,1,0,null,null,null,null,false,null,null,null,null,false,null,null,2]};
 * const value: AkariRating = rateAkari(akariBoard);
 * console.log(value);
 * ```
 */
export type AkariRating = {
  depth: 0 | 1 | 2;
  probes: number;
  whites: number;
  blacks: number;
  clues: number;
  bulbs: number;
  /** Numbered squares as a share of the black squares that touch a white one. */
  clueShare: number;
  /** White squares as a share of the board. */
  openShare: number;
};
/** The Akari completion result and cells that violate its native rules.
 *
 * @example
 * ```ts
 * import type { AkariBoard, AkariCheck, AkariPuzzle } from "@johnmorrisdotca/kazu/akari";
 * import { checkAkari } from "@johnmorrisdotca/kazu/akari";
 *
 * const akariBoard: AkariBoard = {"width":5,"height":5,"cells":[1,null,null,null,null,0,null,null,null,0,1,0,null,null,null,null,false,null,null,null,null,false,null,null,2]};
 * const akariSolution: AkariPuzzle["solution"] = [1,7,15,19,23];
 * const value: AkariCheck = checkAkari(akariBoard,akariSolution);
 * console.log(value);
 * ```
 */
export type AkariCheck = { ok: boolean; illuminated: number; errors: readonly number[]; dark: readonly number[]; numbered: readonly number[]; conflicts: readonly number[] };
/** The Akari constraint status of a partial board.
 *
 * @example
 * ```ts
 * import type { AkariBoard, AkariProgress, AkariPuzzle } from "@johnmorrisdotca/kazu/akari";
 * import { progressAkari } from "@johnmorrisdotca/kazu/akari";
 *
 * const akariBoard: AkariBoard = {"width":5,"height":5,"cells":[1,null,null,null,null,0,null,null,null,0,1,0,null,null,null,null,false,null,null,null,null,false,null,null,2]};
 * const akariSolution: AkariPuzzle["solution"] = [1,7,15,19,23];
 * const value: AkariProgress = progressAkari(akariBoard,akariSolution);
 * console.log(value);
 * ```
 */
export type AkariProgress = Omit<AkariCheck, "ok"> & { ok: boolean };
/** A bounded Akari solve result: answer count, first solution, node work and whether the search completed.
 *
 * @example
 * ```ts
 * import type { AkariBoard, AkariSolve } from "@johnmorrisdotca/kazu/akari";
 * import { solveAkari } from "@johnmorrisdotca/kazu/akari";
 *
 * const akariBoard: AkariBoard = {"width":5,"height":5,"cells":[1,null,null,null,null,0,null,null,null,0,1,0,null,null,null,null,false,null,null,null,null,false,null,null,2]};
 * const value: AkariSolve = solveAkari(akariBoard,{limit:2,nodes:20000});
 * console.log(value);
 * ```
 */
export type AkariSolve = { count: number; solution: readonly number[] | null; complete: boolean; nodes: number };
/** The immutable Akari board, current entries or marks, undo history and assistance state.
 *
 * @example
 * ```ts
 * import type { AkariBoard, AkariGame } from "@johnmorrisdotca/kazu/akari";
 * import { newAkari } from "@johnmorrisdotca/kazu/akari";
 *
 * const akariBoard: AkariBoard = {"width":5,"height":5,"cells":[1,null,null,null,null,0,null,null,null,0,1,0,null,null,null,null,false,null,null,null,null,false,null,null,2]};
 * const akariGame = newAkari(akariBoard);
 * const value: AkariGame = akariGame;
 * console.log(value);
 * ```
 */
export type AkariGame = { board: AkariBoard; bulbs: readonly number[]; history: readonly (readonly number[])[]; helped: boolean };
