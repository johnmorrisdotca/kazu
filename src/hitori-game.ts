import { isHitoriBoard } from "./hitori-board.ts";
import { solveHitori } from "./hitori-solve.ts";
import type { HitoriBoard, HitoriGame } from "./hitori.types.ts";

/** Create the initial immutable Hitori game from a valid board.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @returns Create the initial immutable Hitori game from a valid board.
 * @example
 * ```ts
 * import type { HitoriBoard } from "@johnmorrisdotca/kazu/hitori";
 * import { newHitori } from "@johnmorrisdotca/kazu/hitori";
 *
 * const hitoriBoard: HitoriBoard = {"size":5,"numbers":[4,5,5,1,2,5,2,3,2,1,2,5,4,2,2,3,1,2,5,4,2,3,1,3,4]};
 * console.log(newHitori(hitoriBoard));
 * ```
 */
export function newHitori(board: HitoriBoard): HitoriGame {
  if (!isHitoriBoard(board)) throw new RangeError("Invalid Hitori board");
  return { board: { size: board.size, numbers: [...board.numbers] }, shaded: Array(board.size ** 2).fill(false), history: [], helped: false };
}

/** Apply the requested native Hitori entry or mark to a new immutable game; invalid or fixed targets stay unchanged.
 *
 * @param game - The current immutable game state.
 * @param cell - A zero-based row-major cell index.
 * @returns Apply the requested native Hitori entry or mark to a new immutable game; invalid or fixed targets stay unchanged.
 * @example
 * ```ts
 * import type { HitoriBoard } from "@johnmorrisdotca/kazu/hitori";
 * import { newHitori, shadeHitori } from "@johnmorrisdotca/kazu/hitori";
 *
 * const hitoriBoard: HitoriBoard = {"size":5,"numbers":[4,5,5,1,2,5,2,3,2,1,2,5,4,2,2,3,1,2,5,4,2,3,1,3,4]};
 * const hitoriGame = newHitori(hitoriBoard);
 * console.log(shadeHitori(hitoriGame,0));
 * ```
 */
export function shadeHitori(game: HitoriGame, cell: number): HitoriGame {
  if (!Number.isInteger(cell) || cell < 0 || cell >= game.shaded.length) return game;
  const shaded = [...game.shaded]; shaded[cell] = !shaded[cell];
  return { ...game, shaded, history: [...game.history, [...game.shaded]] };
}

/** Return the Hitori game with its previous marks or entries restored, or unchanged when there is no undo history.
 *
 * @param game - The current immutable game state.
 * @returns Return the Hitori game with its previous marks or entries restored, or unchanged when there is no undo history.
 * @example
 * ```ts
 * import type { HitoriBoard } from "@johnmorrisdotca/kazu/hitori";
 * import { newHitori, undoHitori } from "@johnmorrisdotca/kazu/hitori";
 *
 * const hitoriBoard: HitoriBoard = {"size":5,"numbers":[4,5,5,1,2,5,2,3,2,1,2,5,4,2,2,3,1,2,5,4,2,3,1,3,4]};
 * const hitoriGame = newHitori(hitoriBoard);
 * console.log(undoHitori(hitoriGame));
 * ```
 */
export function undoHitori(game: HitoriGame): HitoriGame {
  const prior = game.history.at(-1);
  return prior ? { ...game, shaded: [...prior], history: game.history.slice(0, -1) } : game;
}

/** Return the Hitori game reset to its initial entries or marks.
 *
 * @param game - The current immutable game state.
 * @returns Return the Hitori game reset to its initial entries or marks.
 * @example
 * ```ts
 * import type { HitoriBoard } from "@johnmorrisdotca/kazu/hitori";
 * import { newHitori, restartHitori } from "@johnmorrisdotca/kazu/hitori";
 *
 * const hitoriBoard: HitoriBoard = {"size":5,"numbers":[4,5,5,1,2,5,2,3,2,1,2,5,4,2,2,3,1,2,5,4,2,3,1,3,4]};
 * const hitoriGame = newHitori(hitoriBoard);
 * console.log(restartHitori(hitoriGame));
 * ```
 */
export function restartHitori(game: HitoriGame): HitoriGame {
  return { ...game, shaded: Array(game.shaded.length).fill(false), history: [], helped: false };
}

/** Gives one next shade in the unique minimal solution, if uniqueness was proved.
 *
 * @param game - The current immutable game state.
 * @returns Find a native Hitori hint, or null when no actionable hint is available.
 * @example
 * ```ts
 * import type { HitoriBoard } from "@johnmorrisdotca/kazu/hitori";
 * import { hintHitori, newHitori } from "@johnmorrisdotca/kazu/hitori";
 *
 * const hitoriBoard: HitoriBoard = {"size":5,"numbers":[4,5,5,1,2,5,2,3,2,1,2,5,4,2,2,3,1,2,5,4,2,3,1,3,4]};
 * const hitoriGame = newHitori(hitoriBoard);
 * console.log(hintHitori(hitoriGame));
 * ```
 */
export function hintHitori(game: HitoriGame): number | null {
  const result = solveHitori(game.board);
  if (!result.complete || result.count !== 1 || !result.solution) return null;
  const cell = result.solution.findIndex((isShaded, index) => isShaded !== game.shaded[index]);
  return cell < 0 ? null : cell;
}

/** Versioned public clue and mark data; the generated answer is not saved.
 *
 * @param game - The current immutable game state.
 * @returns Versioned public clue and mark data; the generated answer is not saved.
 * @example
 * ```ts
 * import type { HitoriBoard } from "@johnmorrisdotca/kazu/hitori";
 * import { encodeHitori, newHitori } from "@johnmorrisdotca/kazu/hitori";
 *
 * const hitoriBoard: HitoriBoard = {"size":5,"numbers":[4,5,5,1,2,5,2,3,2,1,2,5,4,2,2,3,1,2,5,4,2,3,1,3,4]};
 * const hitoriGame = newHitori(hitoriBoard);
 * console.log(encodeHitori(hitoriGame));
 * ```
 */
export function encodeHitori(game: HitoriGame): string {
  return JSON.stringify({ version: 1, board: game.board, shaded: game.shaded, helped: game.helped });
}

/** Read a native saved Hitori game, or null for invalid board data or progress.
 *
 * @param code - Native saved board and progress text.
 * @returns Read a native saved Hitori game, or null for invalid board data or progress.
 * @example
 * ```ts
 * import { decodeHitori } from "@johnmorrisdotca/kazu/hitori";
 *
 * console.log(decodeHitori("{\"version\":1,\"board\":{\"size\":5,\"numbers\":[4,5,5,1,2,5,2,3,2,1,2,5,4,2,2,3,1,2,5,4,2,3,1,3,4]},\"shaded\":[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],\"helped\":false}"));
 * ```
 */
export function decodeHitori(code: string): HitoriGame | null {
  try {
    if (code.length > 10000) return null;
    const value = JSON.parse(code);
    if (value.version !== 1 || !isHitoriBoard(value.board) || !Array.isArray(value.shaded)
      || value.shaded.length !== value.board.size ** 2 || !value.shaded.every((cell: unknown) => typeof cell === "boolean")
      || typeof value.helped !== "boolean") return null;
    return { ...newHitori(value.board), shaded: [...value.shaded], helped: value.helped };
  } catch { return null; }
}
