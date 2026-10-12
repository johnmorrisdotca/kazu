/** Masyu dimensions and printed clues in their native row-major representation.
 *
 * @example
 * ```ts
 * import type { MasyuBoard } from "@johnmorrisdotca/kazu/masyu";
 *
 * const masyuBoard: MasyuBoard = {"width":5,"height":5,"pearls":[2,1,0,1,2,1,0,0,0,1,2,1,0,1,2,0,0,0,0,0,0,0,0,0,0]};
 * const value: MasyuBoard = masyuBoard;
 * console.log(value);
 * ```
 */
export type MasyuBoard = { width: number; height: number; pearls: readonly number[] };
/** A seeded Masyu board with its verified solution.
 *
 * @example
 * ```ts
 * import type { MasyuPuzzle } from "@johnmorrisdotca/kazu/masyu";
 *
 * const masyuPuzzle: MasyuPuzzle = {"width":5,"height":5,"pearls":[2,1,0,1,2,1,0,0,0,1,2,1,0,1,2,0,0,0,0,0,0,0,0,0,0],"seed":42,"solution":[0,1,2,3,8,9,10,11,20,24,25,29]};
 * const value: MasyuPuzzle = masyuPuzzle;
 * console.log(value);
 * ```
 */
export type MasyuPuzzle = MasyuBoard & { seed: number; solution: readonly number[] };
/** The Masyu completion result and cells that violate its native rules.
 *
 * @example
 * ```ts
 * import type { MasyuBoard, MasyuCheck, MasyuPuzzle } from "@johnmorrisdotca/kazu/masyu";
 * import { checkMasyu } from "@johnmorrisdotca/kazu/masyu";
 *
 * const masyuBoard: MasyuBoard = {"width":5,"height":5,"pearls":[2,1,0,1,2,1,0,0,0,1,2,1,0,1,2,0,0,0,0,0,0,0,0,0,0]};
 * const masyuSolution: MasyuPuzzle["solution"] = [0,1,2,3,8,9,10,11,20,24,25,29];
 * const value: MasyuCheck = checkMasyu(masyuBoard,masyuSolution);
 * console.log(value);
 * ```
 */
export type MasyuCheck = { ok: boolean; errors: readonly number[] };
/** A bounded Masyu solve result: answer count, first solution, node work and whether the search completed.
 *
 * @example
 * ```ts
 * import type { MasyuBoard, MasyuSolve } from "@johnmorrisdotca/kazu/masyu";
 * import { solveMasyu } from "@johnmorrisdotca/kazu/masyu";
 *
 * const masyuBoard: MasyuBoard = {"width":5,"height":5,"pearls":[2,1,0,1,2,1,0,0,0,1,2,1,0,1,2,0,0,0,0,0,0,0,0,0,0]};
 * const value: MasyuSolve = solveMasyu(masyuBoard,{limit:2,nodes:20000});
 * console.log(value);
 * ```
 */
export type MasyuSolve = { count: number; solution: readonly number[] | null; complete: boolean; nodes: number };
/** The immutable Masyu board, current entries or marks, undo history and assistance state.
 *
 * @example
 * ```ts
 * import type { MasyuBoard, MasyuGame } from "@johnmorrisdotca/kazu/masyu";
 * import { newMasyu } from "@johnmorrisdotca/kazu/masyu";
 *
 * const masyuBoard: MasyuBoard = {"width":5,"height":5,"pearls":[2,1,0,1,2,1,0,0,0,1,2,1,0,1,2,0,0,0,0,0,0,0,0,0,0]};
 * const masyuGame = newMasyu(masyuBoard);
 * const value: MasyuGame = masyuGame;
 * console.log(value);
 * ```
 */
export type MasyuGame = { board: MasyuBoard; edges: readonly number[]; history: readonly (readonly number[])[]; helped: boolean };
/** Current Masyu marks or entries, selection, errors and native SVG appearance choices.
 *
 * @example
 * ```ts
 * import type { MasyuDrawOptions } from "@johnmorrisdotca/kazu/masyu";
 *
 * const value: MasyuDrawOptions = {language:"en"};
 * console.log(value);
 * ```
 */
export type MasyuDrawOptions = { edges?: readonly number[]; selected?: number; errors?: readonly number[]; material?: "ivory" | "wood" | "slate"; pieces?: "plain" | "tiles"; language?: "en" | "ja" };
/** The initial Masyu board, native progress, appearance and host event callbacks.
 *
 * @example
 * ```ts
 * import type { MasyuBoard, MasyuMountOptions } from "@johnmorrisdotca/kazu/masyu";
 *
 * const masyuBoard: MasyuBoard = {"width":5,"height":5,"pearls":[2,1,0,1,2,1,0,0,0,1,2,1,0,1,2,0,0,0,0,0,0,0,0,0,0]};
 * const value: MasyuMountOptions = {board:masyuBoard};
 * console.log(value);
 * ```
 */
export type MasyuMountOptions = MasyuDrawOptions & { board: MasyuBoard; progress?: string; onChange?: (game: MasyuGame) => void; onFinish?: (game: MasyuGame) => void };
/** The mounted Masyu game and progress, native controls and cleanup handle.
 *
 * @example
 * ```ts no-run
 * import type { MasyuBoard, MasyuMount } from "@johnmorrisdotca/kazu/masyu";
 * import { mountMasyu } from "@johnmorrisdotca/kazu/masyu/play";
 *
 * const masyuBoard: MasyuBoard = {"width":5,"height":5,"pearls":[2,1,0,1,2,1,0,0,0,1,2,1,0,1,2,0,0,0,0,0,0,0,0,0,0]};
 * const host = document.createElement("div");
 * document.body.append(host);
 * const player: MasyuMount = mountMasyu(host,{board:masyuBoard});
 * console.log(player.progress());
 * player.destroy();
 * ```
 */
export type MasyuMount = { game: () => MasyuGame; progress: () => string; set: (options: MasyuDrawOptions) => void; restart: () => void; destroy: () => void };
