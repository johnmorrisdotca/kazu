/** A territory is a list of zero-based cell indexes and an absolute orientation difference.
 *
 * @example
 * ```ts
 * import type { JuosanBoard, JuosanTerritory } from "@johnmorrisdotca/kazu/juosan";
 *
 * const juosanBoard: JuosanBoard = {"width":3,"height":2,"territories":[{"cells":[0,1,2],"difference":3},{"cells":[3,4,5],"difference":3}]};
 * const value: JuosanTerritory = juosanBoard.territories[0];
 * console.log(value);
 * ```
 */
export type JuosanTerritory = { cells: readonly number[]; difference: number | null };
/** Juosan dimensions and printed clues in their native row-major representation.
 *
 * @example
 * ```ts
 * import type { JuosanBoard } from "@johnmorrisdotca/kazu/juosan";
 *
 * const juosanBoard: JuosanBoard = {"width":3,"height":2,"territories":[{"cells":[0,1,2],"difference":3},{"cells":[3,4,5],"difference":3}]};
 * const value: JuosanBoard = juosanBoard;
 * console.log(value);
 * ```
 */
export type JuosanBoard = { width: number; height: number; territories: readonly JuosanTerritory[] };
/** A blank, horizontal or vertical mark in a Juosan cell.
 *
 * @example
 * ```ts
 * import type { JuosanMark } from "@johnmorrisdotca/kazu/juosan";
 *
 * const value: JuosanMark = 1;
 * console.log(value);
 * ```
 */
export type JuosanMark = 0 | 1 | 2;
/** A native difficulty tier for generated Juosan puzzles.
 *
 * @example
 * ```ts
 * import type { JuosanLevel } from "@johnmorrisdotca/kazu/juosan";
 *
 * const value: JuosanLevel = "easy";
 * console.log(value);
 * ```
 */
export type JuosanLevel = "easy" | "medium" | "hard";
/** A seeded Juosan board with its verified solution and native difficulty tier.
 *
 * @example
 * ```ts
 * import type { JuosanPuzzle } from "@johnmorrisdotca/kazu/juosan";
 *
 * const juosanPuzzle: JuosanPuzzle = {"width":3,"height":2,"territories":[{"cells":[0,1,2],"difference":3},{"cells":[3,4,5],"difference":3}],"seed":42,"level":"easy","solution":[1,1,1,1,1,1]};
 * const value: JuosanPuzzle = juosanPuzzle;
 * console.log(value);
 * ```
 */
export type JuosanPuzzle = JuosanBoard & { seed: number; level: JuosanLevel; solution: readonly JuosanMark[] };
/** The Juosan completion result and cells that violate its native rules.
 *
 * @example
 * ```ts
 * import type { JuosanBoard, JuosanCheck, JuosanPuzzle } from "@johnmorrisdotca/kazu/juosan";
 * import { checkJuosan } from "@johnmorrisdotca/kazu/juosan";
 *
 * const juosanBoard: JuosanBoard = {"width":3,"height":2,"territories":[{"cells":[0,1,2],"difference":3},{"cells":[3,4,5],"difference":3}]};
 * const juosanSolution: JuosanPuzzle["solution"] = [1,1,1,1,1,1];
 * const value: JuosanCheck = checkJuosan(juosanBoard,juosanSolution);
 * console.log(value);
 * ```
 */
export type JuosanCheck = { ok: boolean; errors: readonly number[] };
/** A bounded Juosan solve result: answer count, first solution, node work and whether the search completed.
 *
 * @example
 * ```ts
 * import type { JuosanBoard, JuosanSolve } from "@johnmorrisdotca/kazu/juosan";
 * import { solveJuosan } from "@johnmorrisdotca/kazu/juosan";
 *
 * const juosanBoard: JuosanBoard = {"width":3,"height":2,"territories":[{"cells":[0,1,2],"difference":3},{"cells":[3,4,5],"difference":3}]};
 * const value: JuosanSolve = solveJuosan(juosanBoard,2,20000);
 * console.log(value);
 * ```
 */
export type JuosanSolve = { count: number; solution: readonly JuosanMark[] | null; complete: boolean; nodes: number };
/** The immutable Juosan board, current entries or marks, undo history and assistance state.
 *
 * @example
 * ```ts
 * import type { JuosanBoard, JuosanGame } from "@johnmorrisdotca/kazu/juosan";
 * import { newJuosan } from "@johnmorrisdotca/kazu/juosan";
 *
 * const juosanBoard: JuosanBoard = {"width":3,"height":2,"territories":[{"cells":[0,1,2],"difference":3},{"cells":[3,4,5],"difference":3}]};
 * const juosanGame = newJuosan(juosanBoard);
 * const value: JuosanGame = juosanGame;
 * console.log(value);
 * ```
 */
export type JuosanGame = { board: JuosanBoard; marks: readonly JuosanMark[]; history: readonly (readonly JuosanMark[])[]; helped: boolean };
