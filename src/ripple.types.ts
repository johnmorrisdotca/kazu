/** Ripple dimensions and printed clues in their native row-major representation.
 *
 * @example
 * ```ts
 * import type { RippleBoard } from "@johnmorrisdotca/kazu/ripple";
 *
 * const rippleBoard: RippleBoard = {"width":9,"height":9,"rooms":[0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8],"clues":[4,null,7,9,2,null,5,null,3,null,null,3,6,7,4,8,9,2,8,null,2,1,3,null,null,null,null,7,null,1,null,6,null,null,null,9,3,8,null,5,1,7,null,null,6,2,4,6,null,9,3,7,5,1,1,null,8,null,5,null,9,2,4,null,2,null,null,null,null,null,null,null,6,null,null,2,4,null,null,3,null]};
 * const value: RippleBoard = rippleBoard;
 * console.log(value);
 * ```
 */
export type RippleBoard = {
  width: number;
  height: number;
  rooms: readonly number[];
  clues: readonly (number | null)[];
};
/** A seeded Ripple board with its verified solution.
 *
 * @example
 * ```ts
 * import type { RipplePuzzle } from "@johnmorrisdotca/kazu/ripple";
 *
 * const ripplePuzzle: RipplePuzzle = {"width":9,"height":9,"rooms":[0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8],"clues":[4,null,7,9,2,null,5,null,3,null,null,3,6,7,4,8,9,2,8,null,2,1,3,null,null,null,null,7,null,1,null,6,null,null,null,9,3,8,null,5,1,7,null,null,6,2,4,6,null,9,3,7,5,1,1,null,8,null,5,null,9,2,4,null,2,null,null,null,null,null,null,null,6,null,null,2,4,null,null,3,null],"seed":42,"solution":[4,6,7,9,2,8,5,1,3,5,1,3,6,7,4,8,9,2,8,9,2,1,3,5,4,6,7,7,5,1,4,6,2,3,8,9,3,8,9,5,1,7,2,4,6,2,4,6,8,9,3,7,5,1,1,3,8,7,5,6,9,2,4,9,2,4,3,8,1,6,7,5,6,7,5,2,4,9,1,3,8]};
 * const value: RipplePuzzle = ripplePuzzle;
 * console.log(value);
 * ```
 */
export type RipplePuzzle = RippleBoard & { seed: number; solution: readonly number[] };
/** The Ripple completion result and cells that violate its native rules.
 *
 * @example
 * ```ts
 * import type { RippleBoard, RippleCheck, RipplePuzzle } from "@johnmorrisdotca/kazu/ripple";
 * import { checkRipple } from "@johnmorrisdotca/kazu/ripple";
 *
 * const rippleBoard: RippleBoard = {"width":9,"height":9,"rooms":[0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8],"clues":[4,null,7,9,2,null,5,null,3,null,null,3,6,7,4,8,9,2,8,null,2,1,3,null,null,null,null,7,null,1,null,6,null,null,null,9,3,8,null,5,1,7,null,null,6,2,4,6,null,9,3,7,5,1,1,null,8,null,5,null,9,2,4,null,2,null,null,null,null,null,null,null,6,null,null,2,4,null,null,3,null]};
 * const rippleSolution: RipplePuzzle["solution"] = [4,6,7,9,2,8,5,1,3,5,1,3,6,7,4,8,9,2,8,9,2,1,3,5,4,6,7,7,5,1,4,6,2,3,8,9,3,8,9,5,1,7,2,4,6,2,4,6,8,9,3,7,5,1,1,3,8,7,5,6,9,2,4,9,2,4,3,8,1,6,7,5,6,7,5,2,4,9,1,3,8];
 * const value: RippleCheck = checkRipple(rippleBoard,rippleSolution);
 * console.log(value);
 * ```
 */
export type RippleCheck = { ok: boolean; errors: readonly number[]; complete: boolean };
/** A bounded Ripple solve result: answer count, first solution, node work and whether the search completed.
 *
 * @example
 * ```ts
 * import type { RippleBoard, RippleSolve } from "@johnmorrisdotca/kazu/ripple";
 * import { solveRipple } from "@johnmorrisdotca/kazu/ripple";
 *
 * const rippleBoard: RippleBoard = {"width":9,"height":9,"rooms":[0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8],"clues":[4,null,7,9,2,null,5,null,3,null,null,3,6,7,4,8,9,2,8,null,2,1,3,null,null,null,null,7,null,1,null,6,null,null,null,9,3,8,null,5,1,7,null,null,6,2,4,6,null,9,3,7,5,1,1,null,8,null,5,null,9,2,4,null,2,null,null,null,null,null,null,null,6,null,null,2,4,null,null,3,null]};
 * const value: RippleSolve = solveRipple(rippleBoard,{limit:2,nodes:20000});
 * console.log(value);
 * ```
 */
export type RippleSolve = { count: number; solution: readonly number[] | null; complete: boolean; nodes: number };
/** The immutable Ripple board, current entries or marks, undo history and assistance state.
 *
 * @example
 * ```ts
 * import type { RippleBoard, RippleGame } from "@johnmorrisdotca/kazu/ripple";
 * import { newRipple } from "@johnmorrisdotca/kazu/ripple";
 *
 * const rippleBoard: RippleBoard = {"width":9,"height":9,"rooms":[0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8],"clues":[4,null,7,9,2,null,5,null,3,null,null,3,6,7,4,8,9,2,8,null,2,1,3,null,null,null,null,7,null,1,null,6,null,null,null,9,3,8,null,5,1,7,null,null,6,2,4,6,null,9,3,7,5,1,1,null,8,null,5,null,9,2,4,null,2,null,null,null,null,null,null,null,6,null,null,2,4,null,null,3,null]};
 * const rippleGame = newRipple(rippleBoard);
 * const value: RippleGame = rippleGame;
 * console.log(value);
 * ```
 */
export type RippleGame = { board: RippleBoard; values: readonly number[]; notes: readonly (readonly number[])[]; history: readonly { values: readonly number[]; notes: readonly (readonly number[])[] }[]; helped: boolean };
/** The native English or Japanese display language for Ripple.
 *
 * @example
 * ```ts
 * import type { RippleLanguage } from "@johnmorrisdotca/kazu/ripple";
 *
 * const value: RippleLanguage = "en";
 * console.log(value);
 * ```
 */
export type RippleLanguage = "en" | "ja";
/** A supported material of the native Ripple board.
 *
 * @example
 * ```ts
 * import type { RippleMaterial } from "@johnmorrisdotca/kazu/ripple";
 *
 * const value: RippleMaterial = "ivory";
 * console.log(value);
 * ```
 */
export type RippleMaterial = "ivory" | "wood" | "slate";
/** A supported native Ripple mark or piece appearance.
 *
 * @example
 * ```ts
 * import type { RipplePieces } from "@johnmorrisdotca/kazu/ripple";
 *
 * const value: RipplePieces = "ink";
 * console.log(value);
 * ```
 */
export type RipplePieces = "ink" | "tiles";
