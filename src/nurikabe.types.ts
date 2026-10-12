/** Nurikabe dimensions and printed clues in their native row-major representation.
 *
 * @example
 * ```ts
 * import type { NurikabeBoard } from "@johnmorrisdotca/kazu/nurikabe";
 *
 * const nurikabeBoard: NurikabeBoard = {"size":5,"clues":[1,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,2,0,0,3,0,0]};
 * const value: NurikabeBoard = nurikabeBoard;
 * console.log(value);
 * ```
 */
export type NurikabeBoard = {
  size: 5;
  clues: readonly number[];
};

/** A seeded Nurikabe board with its verified solution.
 *
 * @example
 * ```ts
 * import type { NurikabePuzzle } from "@johnmorrisdotca/kazu/nurikabe";
 *
 * const nurikabePuzzle: NurikabePuzzle = {"size":5,"clues":[1,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,2,0,0,3,0,0],"seed":42,"solution":[false,true,true,true,false,true,true,false,false,false,true,false,false,true,true,true,true,true,true,false,false,false,false,true,false]};
 * const value: NurikabePuzzle = nurikabePuzzle;
 * console.log(value);
 * ```
 */
export type NurikabePuzzle = NurikabeBoard & {
  seed: number;
  solution: readonly boolean[];
};

/** A bounded Nurikabe solve result: answer count, first solution, node work and whether the search completed.
 *
 * @example
 * ```ts
 * import type { NurikabeBoard, NurikabeSolve } from "@johnmorrisdotca/kazu/nurikabe";
 * import { solveNurikabe } from "@johnmorrisdotca/kazu/nurikabe";
 *
 * const nurikabeBoard: NurikabeBoard = {"size":5,"clues":[1,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,2,0,0,3,0,0]};
 * const value: NurikabeSolve = solveNurikabe(nurikabeBoard,{limit:2,nodes:20000});
 * console.log(value);
 * ```
 */
export type NurikabeSolve = {
  count: number;
  solution: readonly boolean[] | null;
  complete: boolean;
  nodes: number;
};

/** The immutable Nurikabe board, current entries or marks, undo history and assistance state.
 *
 * @example
 * ```ts
 * import type { NurikabeBoard, NurikabeGame } from "@johnmorrisdotca/kazu/nurikabe";
 * import { newNurikabe } from "@johnmorrisdotca/kazu/nurikabe";
 *
 * const nurikabeBoard: NurikabeBoard = {"size":5,"clues":[1,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,2,0,0,3,0,0]};
 * const nurikabeGame = newNurikabe(nurikabeBoard);
 * const value: NurikabeGame = nurikabeGame;
 * console.log(value);
 * ```
 */
export type NurikabeGame = {
  board: NurikabeBoard;
  sea: readonly boolean[];
  history: readonly (readonly boolean[])[];
  helped: boolean;
};
