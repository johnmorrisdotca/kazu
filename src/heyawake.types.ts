/** A rectangular room and its optional required black-cell count.
 *
 * @example
 * ```ts
 * import type { HeyawakeBoard, HeyawakeRoom } from "@johnmorrisdotca/kazu/heyawake";
 *
 * const heyawakeBoard: HeyawakeBoard = {"width":5,"height":5,"rooms":[{"x":0,"y":0,"width":1,"height":1,"blacks":0},{"x":0,"y":1,"width":1,"height":2,"blacks":0},{"x":0,"y":3,"width":1,"height":2,"blacks":1},{"x":1,"y":0,"width":1,"height":4,"blacks":1},{"x":1,"y":4,"width":1,"height":1,"blacks":0},{"x":2,"y":0,"width":3,"height":5,"blacks":3}]};
 * const value: HeyawakeRoom = heyawakeBoard.rooms[0];
 * console.log(value);
 * ```
 */
export type HeyawakeRoom = { x: number; y: number; width: number; height: number; blacks: number | null };
/** Heyawake dimensions and printed clues in their native row-major representation.
 *
 * @example
 * ```ts
 * import type { HeyawakeBoard } from "@johnmorrisdotca/kazu/heyawake";
 *
 * const heyawakeBoard: HeyawakeBoard = {"width":5,"height":5,"rooms":[{"x":0,"y":0,"width":1,"height":1,"blacks":0},{"x":0,"y":1,"width":1,"height":2,"blacks":0},{"x":0,"y":3,"width":1,"height":2,"blacks":1},{"x":1,"y":0,"width":1,"height":4,"blacks":1},{"x":1,"y":4,"width":1,"height":1,"blacks":0},{"x":2,"y":0,"width":3,"height":5,"blacks":3}]};
 * const value: HeyawakeBoard = heyawakeBoard;
 * console.log(value);
 * ```
 */
export type HeyawakeBoard = { width: number; height: number; rooms: readonly HeyawakeRoom[] };
/** A native difficulty tier for generated Heyawake puzzles.
 *
 * @example
 * ```ts
 * import type { HeyawakeLevel } from "@johnmorrisdotca/kazu/heyawake";
 *
 * const value: HeyawakeLevel = "easy";
 * console.log(value);
 * ```
 */
export type HeyawakeLevel = "easy" | "medium" | "hard";
/** A seeded Heyawake board with its verified solution and native difficulty tier.
 *
 * @example
 * ```ts
 * import type { HeyawakePuzzle } from "@johnmorrisdotca/kazu/heyawake";
 *
 * const heyawakePuzzle: HeyawakePuzzle = {"width":5,"height":5,"rooms":[{"x":0,"y":0,"width":1,"height":1,"blacks":0},{"x":0,"y":1,"width":1,"height":2,"blacks":0},{"x":0,"y":3,"width":1,"height":2,"blacks":1},{"x":1,"y":0,"width":1,"height":4,"blacks":1},{"x":1,"y":4,"width":1,"height":1,"blacks":0},{"x":2,"y":0,"width":3,"height":5,"blacks":3}],"seed":42,"level":"easy","solution":[false,false,true,false,false,false,true,false,false,false,false,false,true,false,false,true,false,false,false,false,false,false,true,false,false]};
 * const value: HeyawakePuzzle = heyawakePuzzle;
 * console.log(value);
 * ```
 */
export type HeyawakePuzzle = HeyawakeBoard & { seed: number; level: HeyawakeLevel; solution: readonly boolean[] };
/** The Heyawake completion result and cells that violate its native rules.
 *
 * @example
 * ```ts
 * import type { HeyawakeBoard, HeyawakeCheck, HeyawakePuzzle } from "@johnmorrisdotca/kazu/heyawake";
 * import { checkHeyawake } from "@johnmorrisdotca/kazu/heyawake";
 *
 * const heyawakeBoard: HeyawakeBoard = {"width":5,"height":5,"rooms":[{"x":0,"y":0,"width":1,"height":1,"blacks":0},{"x":0,"y":1,"width":1,"height":2,"blacks":0},{"x":0,"y":3,"width":1,"height":2,"blacks":1},{"x":1,"y":0,"width":1,"height":4,"blacks":1},{"x":1,"y":4,"width":1,"height":1,"blacks":0},{"x":2,"y":0,"width":3,"height":5,"blacks":3}]};
 * const heyawakeSolution: HeyawakePuzzle["solution"] = [false,false,true,false,false,false,true,false,false,false,false,false,true,false,false,true,false,false,false,false,false,false,true,false,false];
 * const value: HeyawakeCheck = checkHeyawake(heyawakeBoard,heyawakeSolution);
 * console.log(value);
 * ```
 */
export type HeyawakeCheck = { ok: boolean; complete: boolean; errors: readonly number[] };
/** A bounded Heyawake solve result: answer count, first solution, node work and whether the search completed.
 *
 * @example
 * ```ts
 * import type { HeyawakeBoard, HeyawakeSolve } from "@johnmorrisdotca/kazu/heyawake";
 * import { solveHeyawake } from "@johnmorrisdotca/kazu/heyawake";
 *
 * const heyawakeBoard: HeyawakeBoard = {"width":5,"height":5,"rooms":[{"x":0,"y":0,"width":1,"height":1,"blacks":0},{"x":0,"y":1,"width":1,"height":2,"blacks":0},{"x":0,"y":3,"width":1,"height":2,"blacks":1},{"x":1,"y":0,"width":1,"height":4,"blacks":1},{"x":1,"y":4,"width":1,"height":1,"blacks":0},{"x":2,"y":0,"width":3,"height":5,"blacks":3}]};
 * const value: HeyawakeSolve = solveHeyawake(heyawakeBoard,undefined,{limit:2,nodes:20000});
 * console.log(value);
 * ```
 */
export type HeyawakeSolve = { count: number; solution: readonly boolean[] | null; complete: boolean; nodes: number };
/** The immutable Heyawake board, current entries or marks, undo history and assistance state.
 *
 * @example
 * ```ts
 * import type { HeyawakeBoard, HeyawakeGame } from "@johnmorrisdotca/kazu/heyawake";
 * import { newHeyawake } from "@johnmorrisdotca/kazu/heyawake";
 *
 * const heyawakeBoard: HeyawakeBoard = {"width":5,"height":5,"rooms":[{"x":0,"y":0,"width":1,"height":1,"blacks":0},{"x":0,"y":1,"width":1,"height":2,"blacks":0},{"x":0,"y":3,"width":1,"height":2,"blacks":1},{"x":1,"y":0,"width":1,"height":4,"blacks":1},{"x":1,"y":4,"width":1,"height":1,"blacks":0},{"x":2,"y":0,"width":3,"height":5,"blacks":3}]};
 * const heyawakeGame = newHeyawake(heyawakeBoard);
 * const value: HeyawakeGame = heyawakeGame;
 * console.log(value);
 * ```
 */
export type HeyawakeGame = { board: HeyawakeBoard; entries: readonly (boolean | null)[]; history: readonly (readonly (boolean | null)[])[]; helped: boolean };
