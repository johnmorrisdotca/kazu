import { checkMasyu, isMasyuBoard, masyuEdgeCount } from "./masyu-board.ts";
import { solveMasyu } from "./masyu-solve.ts";
import type { MasyuBoard, MasyuGame } from "./masyu.types.ts";

/** Create the initial immutable Masyu game from a valid board.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @returns Create the initial immutable Masyu game from a valid board.
 * @example
 * ```ts
 * import type { MasyuBoard } from "@johnmorrisdotca/kazu/masyu";
 * import { newMasyu } from "@johnmorrisdotca/kazu/masyu";
 *
 * const masyuBoard: MasyuBoard = {"width":5,"height":5,"pearls":[2,1,0,1,2,1,0,0,0,1,2,1,0,1,2,0,0,0,0,0,0,0,0,0,0]};
 * console.log(newMasyu(masyuBoard));
 * ```
 */
export function newMasyu(board: MasyuBoard): MasyuGame {
  if (!isMasyuBoard(board)) throw new RangeError("Invalid Masyu board");
  return { board: { width: board.width, height: board.height, pearls: [...board.pearls] }, edges: [], history: [], helped: false };
}
/** Apply the requested native Masyu entry or mark to a new immutable game; invalid or fixed targets stay unchanged.
 *
 * @param game - The current immutable game state.
 * @param edge - A zero-based native edge index.
 * @returns Apply the requested native Masyu entry or mark to a new immutable game; invalid or fixed targets stay unchanged.
 * @example
 * ```ts
 * import type { MasyuBoard } from "@johnmorrisdotca/kazu/masyu";
 * import { newMasyu, toggleMasyuEdge } from "@johnmorrisdotca/kazu/masyu";
 *
 * const masyuBoard: MasyuBoard = {"width":5,"height":5,"pearls":[2,1,0,1,2,1,0,0,0,1,2,1,0,1,2,0,0,0,0,0,0,0,0,0,0]};
 * const masyuGame = newMasyu(masyuBoard);
 * console.log(toggleMasyuEdge(masyuGame,0));
 * ```
 */
export function toggleMasyuEdge(game: MasyuGame, edge: number): MasyuGame {
  if (!Number.isInteger(edge) || edge < 0 || edge >= masyuEdgeCount(game.board)) return game;
  const edges = game.edges.includes(edge) ? game.edges.filter(value => value !== edge) : [...game.edges, edge].sort((a, b) => a - b);
  return { ...game, edges, history: [...game.history, [...game.edges]] };
}
/** Return the Masyu game with its previous marks or entries restored, or unchanged when there is no undo history.
 *
 * @param game - The current immutable game state.
 * @returns Return the Masyu game with its previous marks or entries restored, or unchanged when there is no undo history.
 * @example
 * ```ts
 * import type { MasyuBoard } from "@johnmorrisdotca/kazu/masyu";
 * import { newMasyu, undoMasyu } from "@johnmorrisdotca/kazu/masyu";
 *
 * const masyuBoard: MasyuBoard = {"width":5,"height":5,"pearls":[2,1,0,1,2,1,0,0,0,1,2,1,0,1,2,0,0,0,0,0,0,0,0,0,0]};
 * const masyuGame = newMasyu(masyuBoard);
 * console.log(undoMasyu(masyuGame));
 * ```
 */
export function undoMasyu(game: MasyuGame): MasyuGame {
  const previous = game.history.at(-1);
  return previous ? { ...game, edges: [...previous], history: game.history.slice(0, -1) } : game;
}
/** Return the Masyu game reset to its initial entries or marks.
 *
 * @param game - The current immutable game state.
 * @returns Return the Masyu game reset to its initial entries or marks.
 * @example
 * ```ts
 * import type { MasyuBoard } from "@johnmorrisdotca/kazu/masyu";
 * import { newMasyu, restartMasyu } from "@johnmorrisdotca/kazu/masyu";
 *
 * const masyuBoard: MasyuBoard = {"width":5,"height":5,"pearls":[2,1,0,1,2,1,0,0,0,1,2,1,0,1,2,0,0,0,0,0,0,0,0,0,0]};
 * const masyuGame = newMasyu(masyuBoard);
 * console.log(restartMasyu(masyuGame));
 * ```
 */
export function restartMasyu(game: MasyuGame): MasyuGame { return { ...newMasyu(game.board), helped: false }; }
/** Find a native Masyu hint, or null when no actionable hint is available.
 *
 * @param game - The current immutable game state.
 * @returns Find a native Masyu hint, or null when no actionable hint is available.
 * @example
 * ```ts
 * import type { MasyuBoard } from "@johnmorrisdotca/kazu/masyu";
 * import { hintMasyu, newMasyu } from "@johnmorrisdotca/kazu/masyu";
 *
 * const masyuBoard: MasyuBoard = {"width":5,"height":5,"pearls":[2,1,0,1,2,1,0,0,0,1,2,1,0,1,2,0,0,0,0,0,0,0,0,0,0]};
 * const masyuGame = newMasyu(masyuBoard);
 * console.log(hintMasyu(masyuGame));
 * ```
 */
export function hintMasyu(game: MasyuGame): number | null {
  const result = solveMasyu(game.board);
  if (!result.complete || result.count !== 1) return null;
  return result.solution!.find(edge => !game.edges.includes(edge)) ?? null;
}
/** Whether this Masyu game satisfies its complete native rules.
 *
 * @param game - The current immutable game state.
 * @returns Whether this Masyu game satisfies its complete native rules.
 * @example
 * ```ts
 * import type { MasyuBoard } from "@johnmorrisdotca/kazu/masyu";
 * import { masyuFinished, newMasyu } from "@johnmorrisdotca/kazu/masyu";
 *
 * const masyuBoard: MasyuBoard = {"width":5,"height":5,"pearls":[2,1,0,1,2,1,0,0,0,1,2,1,0,1,2,0,0,0,0,0,0,0,0,0,0]};
 * const masyuGame = newMasyu(masyuBoard);
 * console.log(masyuFinished(masyuGame));
 * ```
 */
export function masyuFinished(game: MasyuGame): boolean { return checkMasyu(game.board, game.edges).ok; }
/** Encode the Masyu board and current game as native resumable text.
 *
 * @param game - The current immutable game state.
 * @returns Encode the Masyu board and current game as native resumable text.
 * @example
 * ```ts
 * import type { MasyuBoard } from "@johnmorrisdotca/kazu/masyu";
 * import { encodeMasyu, newMasyu } from "@johnmorrisdotca/kazu/masyu";
 *
 * const masyuBoard: MasyuBoard = {"width":5,"height":5,"pearls":[2,1,0,1,2,1,0,0,0,1,2,1,0,1,2,0,0,0,0,0,0,0,0,0,0]};
 * const masyuGame = newMasyu(masyuBoard);
 * console.log(encodeMasyu(masyuGame));
 * ```
 */
export function encodeMasyu(game: MasyuGame): string {
  return JSON.stringify({ version: 1, board: game.board, edges: game.edges, helped: game.helped });
}
/** Read a native saved Masyu game, or null for invalid board data or progress.
 *
 * @param code - Native saved board and progress text.
 * @returns Read a native saved Masyu game, or null for invalid board data or progress.
 * @example
 * ```ts
 * import { decodeMasyu } from "@johnmorrisdotca/kazu/masyu";
 *
 * console.log(decodeMasyu("{\"version\":1,\"board\":{\"width\":5,\"height\":5,\"pearls\":[2,1,0,1,2,1,0,0,0,1,2,1,0,1,2,0,0,0,0,0,0,0,0,0,0]},\"edges\":[],\"helped\":false}"));
 * ```
 */
export function decodeMasyu(code: string): MasyuGame | null {
  try {
    if (code.length > 40_000) return null;
    const value = JSON.parse(code);
    if (value.version !== 1 || !isMasyuBoard(value.board) || !Array.isArray(value.edges)
      || typeof value.helped !== "boolean" || !value.edges.every((edge: unknown) => Number.isInteger(edge))) return null;
    const rawEdges = value.edges as number[];
    const edges = [...new Set(rawEdges)].sort((a, b) => a - b);
    if (edges.length !== rawEdges.length || edges.some(edge => edge < 0 || edge >= masyuEdgeCount(value.board))) return null;
    return { ...newMasyu(value.board), edges, helped: value.helped };
  } catch { return null; }
}
