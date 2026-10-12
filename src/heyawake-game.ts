import { checkHeyawake, isHeyawakeBoard } from "./heyawake-board.ts";
import { solveHeyawake } from "./heyawake-solve.ts";
import type { HeyawakeBoard, HeyawakeGame } from "./heyawake.types.ts";

/** Create the initial immutable Heyawake game from a valid board.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @returns Create the initial immutable Heyawake game from a valid board.
 * @example
 * ```ts
 * import type { HeyawakeBoard } from "@johnmorrisdotca/kazu/heyawake";
 * import { newHeyawake } from "@johnmorrisdotca/kazu/heyawake";
 *
 * const heyawakeBoard: HeyawakeBoard = {"width":5,"height":5,"rooms":[{"x":0,"y":0,"width":1,"height":1,"blacks":0},{"x":0,"y":1,"width":1,"height":2,"blacks":0},{"x":0,"y":3,"width":1,"height":2,"blacks":1},{"x":1,"y":0,"width":1,"height":4,"blacks":1},{"x":1,"y":4,"width":1,"height":1,"blacks":0},{"x":2,"y":0,"width":3,"height":5,"blacks":3}]};
 * console.log(newHeyawake(heyawakeBoard));
 * ```
 */
export function newHeyawake(board: HeyawakeBoard): HeyawakeGame {
  if (!isHeyawakeBoard(board)) throw new RangeError("Invalid Heyawake board");
  return { board: publicBoard(board), entries: Array(board.width * board.height).fill(null), history: [], helped: false };
}

/** Apply the requested native Heyawake entry or mark to a new immutable game; invalid or fixed targets stay unchanged.
 *
 * @param game - The current immutable game state.
 * @param cell - A zero-based row-major cell index.
 * @param value - A candidate board, digit, mark or encoded game specified by this signature.
 * @returns Apply the requested native Heyawake entry or mark to a new immutable game; invalid or fixed targets stay unchanged.
 * @example
 * ```ts
 * import type { HeyawakeBoard } from "@johnmorrisdotca/kazu/heyawake";
 * import { newHeyawake, setHeyawakeCell } from "@johnmorrisdotca/kazu/heyawake";
 *
 * const heyawakeBoard: HeyawakeBoard = {"width":5,"height":5,"rooms":[{"x":0,"y":0,"width":1,"height":1,"blacks":0},{"x":0,"y":1,"width":1,"height":2,"blacks":0},{"x":0,"y":3,"width":1,"height":2,"blacks":1},{"x":1,"y":0,"width":1,"height":4,"blacks":1},{"x":1,"y":4,"width":1,"height":1,"blacks":0},{"x":2,"y":0,"width":3,"height":5,"blacks":3}]};
 * const heyawakeGame = newHeyawake(heyawakeBoard);
 * console.log(setHeyawakeCell(heyawakeGame,0,true));
 * ```
 */
export function setHeyawakeCell(game: HeyawakeGame, cell: number, value: boolean | null): HeyawakeGame {
  if (value !== null && typeof value !== "boolean" || !Number.isInteger(cell) || cell < 0 || cell >= game.entries.length || game.entries[cell] === value) return game;
  const entries = [...game.entries];
  entries[cell] = value;
  return { ...game, entries, history: [...game.history, game.entries] };
}

/** Return the Heyawake game with its previous marks or entries restored, or unchanged when there is no undo history.
 *
 * @param game - The current immutable game state.
 * @returns Return the Heyawake game with its previous marks or entries restored, or unchanged when there is no undo history.
 * @example
 * ```ts
 * import type { HeyawakeBoard } from "@johnmorrisdotca/kazu/heyawake";
 * import { newHeyawake, undoHeyawake } from "@johnmorrisdotca/kazu/heyawake";
 *
 * const heyawakeBoard: HeyawakeBoard = {"width":5,"height":5,"rooms":[{"x":0,"y":0,"width":1,"height":1,"blacks":0},{"x":0,"y":1,"width":1,"height":2,"blacks":0},{"x":0,"y":3,"width":1,"height":2,"blacks":1},{"x":1,"y":0,"width":1,"height":4,"blacks":1},{"x":1,"y":4,"width":1,"height":1,"blacks":0},{"x":2,"y":0,"width":3,"height":5,"blacks":3}]};
 * const heyawakeGame = newHeyawake(heyawakeBoard);
 * console.log(undoHeyawake(heyawakeGame));
 * ```
 */
export function undoHeyawake(game: HeyawakeGame): HeyawakeGame {
  const previous = game.history.at(-1);
  return previous ? { ...game, entries: previous, history: game.history.slice(0, -1) } : game;
}

/** Return the Heyawake game reset to its initial entries or marks.
 *
 * @param game - The current immutable game state.
 * @returns Return the Heyawake game reset to its initial entries or marks.
 * @example
 * ```ts
 * import type { HeyawakeBoard } from "@johnmorrisdotca/kazu/heyawake";
 * import { newHeyawake, restartHeyawake } from "@johnmorrisdotca/kazu/heyawake";
 *
 * const heyawakeBoard: HeyawakeBoard = {"width":5,"height":5,"rooms":[{"x":0,"y":0,"width":1,"height":1,"blacks":0},{"x":0,"y":1,"width":1,"height":2,"blacks":0},{"x":0,"y":3,"width":1,"height":2,"blacks":1},{"x":1,"y":0,"width":1,"height":4,"blacks":1},{"x":1,"y":4,"width":1,"height":1,"blacks":0},{"x":2,"y":0,"width":3,"height":5,"blacks":3}]};
 * const heyawakeGame = newHeyawake(heyawakeBoard);
 * console.log(restartHeyawake(heyawakeGame));
 * ```
 */
export function restartHeyawake(game: HeyawakeGame): HeyawakeGame {
  return { ...game, entries: Array(game.entries.length).fill(null), history: [], helped: false };
}

/** Find a native Heyawake hint, or null when no actionable hint is available.
 *
 * @param game - The current immutable game state.
 * @returns Find a native Heyawake hint, or null when no actionable hint is available.
 * @example
 * ```ts
 * import type { HeyawakeBoard } from "@johnmorrisdotca/kazu/heyawake";
 * import { hintHeyawake, newHeyawake } from "@johnmorrisdotca/kazu/heyawake";
 *
 * const heyawakeBoard: HeyawakeBoard = {"width":5,"height":5,"rooms":[{"x":0,"y":0,"width":1,"height":1,"blacks":0},{"x":0,"y":1,"width":1,"height":2,"blacks":0},{"x":0,"y":3,"width":1,"height":2,"blacks":1},{"x":1,"y":0,"width":1,"height":4,"blacks":1},{"x":1,"y":4,"width":1,"height":1,"blacks":0},{"x":2,"y":0,"width":3,"height":5,"blacks":3}]};
 * const heyawakeGame = newHeyawake(heyawakeBoard);
 * console.log(hintHeyawake(heyawakeGame));
 * ```
 */
export function hintHeyawake(game: HeyawakeGame): { cell: number; value: boolean } | null {
  const result = solveHeyawake(game.board, game.entries);
  if (!result.complete || result.count !== 1 || !result.solution) return null;
  const cell = game.entries.findIndex(value => value === null);
  return cell < 0 ? null : { cell, value: result.solution[cell]! };
}

/** Whether this Heyawake game satisfies its complete native rules.
 *
 * @param game - The current immutable game state.
 * @returns Whether this Heyawake game satisfies its complete native rules.
 * @example
 * ```ts
 * import type { HeyawakeBoard } from "@johnmorrisdotca/kazu/heyawake";
 * import { heyawakeFinished, newHeyawake } from "@johnmorrisdotca/kazu/heyawake";
 *
 * const heyawakeBoard: HeyawakeBoard = {"width":5,"height":5,"rooms":[{"x":0,"y":0,"width":1,"height":1,"blacks":0},{"x":0,"y":1,"width":1,"height":2,"blacks":0},{"x":0,"y":3,"width":1,"height":2,"blacks":1},{"x":1,"y":0,"width":1,"height":4,"blacks":1},{"x":1,"y":4,"width":1,"height":1,"blacks":0},{"x":2,"y":0,"width":3,"height":5,"blacks":3}]};
 * const heyawakeGame = newHeyawake(heyawakeBoard);
 * console.log(heyawakeFinished(heyawakeGame));
 * ```
 */
export function heyawakeFinished(game: HeyawakeGame): boolean {
  return checkHeyawake(game.board, game.entries).ok;
}

/** Encode the Heyawake board and current game as native resumable text.
 *
 * @param game - The current immutable game state.
 * @returns Encode the Heyawake board and current game as native resumable text.
 * @example
 * ```ts
 * import type { HeyawakeBoard } from "@johnmorrisdotca/kazu/heyawake";
 * import { encodeHeyawake, newHeyawake } from "@johnmorrisdotca/kazu/heyawake";
 *
 * const heyawakeBoard: HeyawakeBoard = {"width":5,"height":5,"rooms":[{"x":0,"y":0,"width":1,"height":1,"blacks":0},{"x":0,"y":1,"width":1,"height":2,"blacks":0},{"x":0,"y":3,"width":1,"height":2,"blacks":1},{"x":1,"y":0,"width":1,"height":4,"blacks":1},{"x":1,"y":4,"width":1,"height":1,"blacks":0},{"x":2,"y":0,"width":3,"height":5,"blacks":3}]};
 * const heyawakeGame = newHeyawake(heyawakeBoard);
 * console.log(encodeHeyawake(heyawakeGame));
 * ```
 */
export function encodeHeyawake(game: HeyawakeGame): string {
  return JSON.stringify({ version: 1, board: publicBoard(game.board), entries: game.entries.map(value => value === null ? "?" : value ? "#" : ".").join(""), helped: game.helped });
}

/** Read a native saved Heyawake game, or null for invalid board data or progress.
 *
 * @param code - Native saved board and progress text.
 * @returns Read a native saved Heyawake game, or null for invalid board data or progress.
 * @example
 * ```ts
 * import { decodeHeyawake } from "@johnmorrisdotca/kazu/heyawake";
 *
 * console.log(decodeHeyawake("{\"version\":1,\"board\":{\"width\":5,\"height\":5,\"rooms\":[{\"x\":0,\"y\":0,\"width\":1,\"height\":1,\"blacks\":0},{\"x\":0,\"y\":1,\"width\":1,\"height\":2,\"blacks\":0},{\"x\":0,\"y\":3,\"width\":1,\"height\":2,\"blacks\":1},{\"x\":1,\"y\":0,\"width\":1,\"height\":4,\"blacks\":1},{\"x\":1,\"y\":4,\"width\":1,\"height\":1,\"blacks\":0},{\"x\":2,\"y\":0,\"width\":3,\"height\":5,\"blacks\":3}]},\"entries\":\"?????????????????????????\",\"helped\":false}"));
 * ```
 */
export function decodeHeyawake(code: string): HeyawakeGame | null {
  try {
    const data = JSON.parse(code);
    if (data.version !== 1 || !isHeyawakeBoard(data.board) || typeof data.helped !== "boolean" || typeof data.entries !== "string") return null;
    const entries = [...data.entries].map((value: string) => value === "?" ? null : value === "#" ? true : value === "." ? false : undefined);
    if (entries.length !== data.board.width * data.board.height || entries.some((value: unknown) => value === undefined)) return null;
    return { board: publicBoard(data.board), entries: entries as (boolean | null)[], history: [], helped: data.helped };
  } catch {
    return null;
  }
}

function publicBoard(board: HeyawakeBoard): HeyawakeBoard {
  return { width: board.width, height: board.height, rooms: board.rooms.map(room => ({ x: room.x, y: room.y, width: room.width, height: room.height, blacks: room.blacks })) };
}
