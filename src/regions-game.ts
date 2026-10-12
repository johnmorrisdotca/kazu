import { checkRegions, isRegionsBoard } from "./regions-board.ts";
import { solveRegions } from "./regions-solve.ts";
import type { RegionsBoard, RegionsGame } from "./regions.types.ts";

/** Create the initial immutable Regions game from a valid board.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @returns Create the initial immutable Regions game from a valid board.
 * @example
 * ```ts
 * import type { RegionsBoard } from "@johnmorrisdotca/kazu/regions";
 * import { newRegions } from "@johnmorrisdotca/kazu/regions";
 *
 * const regionsBoard: RegionsBoard = {"width":5,"height":5,"givens":[0,0,2,0,3,2,0,3,0,0,0,3,0,0,1,3,1,0,1,2,3,3,4,0,0]};
 * console.log(newRegions(regionsBoard));
 * ```
 */
export function newRegions(board: RegionsBoard): RegionsGame {
  if (!isRegionsBoard(board)) throw new RangeError("Invalid Regions board");
  return {
    board: { width: board.width, height: board.height, givens: [...board.givens] },
    entries: [...board.givens],
    history: [],
    helped: false,
  };
}

/** Apply the requested native Regions entry or mark to a new immutable game; invalid or fixed targets stay unchanged.
 *
 * @param game - The current immutable game state.
 * @param cell - A zero-based row-major cell index.
 * @param value - A candidate board, digit, mark or encoded game specified by this signature.
 * @returns Apply the requested native Regions entry or mark to a new immutable game; invalid or fixed targets stay unchanged.
 * @example
 * ```ts
 * import type { RegionsBoard } from "@johnmorrisdotca/kazu/regions";
 * import { newRegions, setRegionsCell } from "@johnmorrisdotca/kazu/regions";
 *
 * const regionsBoard: RegionsBoard = {"width":5,"height":5,"givens":[0,0,2,0,3,2,0,3,0,0,0,3,0,0,1,3,1,0,1,2,3,3,4,0,0]};
 * const regionsGame = newRegions(regionsBoard);
 * console.log(setRegionsCell(regionsGame,0,1));
 * ```
 */
export function setRegionsCell(game: RegionsGame, cell: number, value: number): RegionsGame {
  if (!Number.isInteger(cell) || cell < 0 || cell >= game.entries.length
    || !Number.isInteger(value) || value < 0 || value > game.entries.length
    || game.board.givens[cell]) return game;
  if (game.entries[cell] === value) return game;
  const entries = [...game.entries];
  entries[cell] = value;
  return { ...game, entries, history: [...game.history, [...game.entries]] };
}

/** Return the Regions game with its previous marks or entries restored, or unchanged when there is no undo history.
 *
 * @param game - The current immutable game state.
 * @returns Return the Regions game with its previous marks or entries restored, or unchanged when there is no undo history.
 * @example
 * ```ts
 * import type { RegionsBoard } from "@johnmorrisdotca/kazu/regions";
 * import { newRegions, undoRegions } from "@johnmorrisdotca/kazu/regions";
 *
 * const regionsBoard: RegionsBoard = {"width":5,"height":5,"givens":[0,0,2,0,3,2,0,3,0,0,0,3,0,0,1,3,1,0,1,2,3,3,4,0,0]};
 * const regionsGame = newRegions(regionsBoard);
 * console.log(undoRegions(regionsGame));
 * ```
 */
export function undoRegions(game: RegionsGame): RegionsGame {
  const previous = game.history.at(-1);
  return previous
    ? { ...game, entries: [...previous], history: game.history.slice(0, -1) }
    : game;
}

/** Find a native Regions hint, or null when no actionable hint is available.
 *
 * @param game - The current immutable game state.
 * @returns Find a native Regions hint, or null when no actionable hint is available.
 * @example
 * ```ts
 * import type { RegionsBoard } from "@johnmorrisdotca/kazu/regions";
 * import { hintRegions, newRegions } from "@johnmorrisdotca/kazu/regions";
 *
 * const regionsBoard: RegionsBoard = {"width":5,"height":5,"givens":[0,0,2,0,3,2,0,3,0,0,0,3,0,0,1,3,1,0,1,2,3,3,4,0,0]};
 * const regionsGame = newRegions(regionsBoard);
 * console.log(hintRegions(regionsGame));
 * ```
 */
export function hintRegions(game: RegionsGame): { cell: number; value: number; why: string } | null {
  const result = solveRegions(game.board, game.entries);
  if (!result.complete || result.count !== 1 || !result.solution) return null;
  const cell = result.solution.findIndex((value, index) => !game.entries[index] && value > 0);
  return cell < 0 ? null : { cell, value: result.solution[cell]!, why: "unique-completion" };
}

/** Whether this Regions game satisfies its complete native rules.
 *
 * @param game - The current immutable game state.
 * @returns Whether this Regions game satisfies its complete native rules.
 * @example
 * ```ts
 * import type { RegionsBoard } from "@johnmorrisdotca/kazu/regions";
 * import { newRegions, regionsFinished } from "@johnmorrisdotca/kazu/regions";
 *
 * const regionsBoard: RegionsBoard = {"width":5,"height":5,"givens":[0,0,2,0,3,2,0,3,0,0,0,3,0,0,1,3,1,0,1,2,3,3,4,0,0]};
 * const regionsGame = newRegions(regionsBoard);
 * console.log(regionsFinished(regionsGame));
 * ```
 */
export function regionsFinished(game: RegionsGame): boolean {
  return checkRegions(game.board, game.entries).ok;
}

/** Return the Regions game reset to its initial entries or marks.
 *
 * @param game - The current immutable game state.
 * @returns Return the Regions game reset to its initial entries or marks.
 * @example
 * ```ts
 * import type { RegionsBoard } from "@johnmorrisdotca/kazu/regions";
 * import { newRegions, restartRegions } from "@johnmorrisdotca/kazu/regions";
 *
 * const regionsBoard: RegionsBoard = {"width":5,"height":5,"givens":[0,0,2,0,3,2,0,3,0,0,0,3,0,0,1,3,1,0,1,2,3,3,4,0,0]};
 * const regionsGame = newRegions(regionsBoard);
 * console.log(restartRegions(regionsGame));
 * ```
 */
export function restartRegions(game: RegionsGame): RegionsGame {
  return { ...newRegions(game.board), helped: game.helped };
}

/** Encode the Regions board and current game as native resumable text.
 *
 * @param game - The current immutable game state.
 * @returns Encode the Regions board and current game as native resumable text.
 * @example
 * ```ts
 * import type { RegionsBoard } from "@johnmorrisdotca/kazu/regions";
 * import { encodeRegionsGame, newRegions } from "@johnmorrisdotca/kazu/regions";
 *
 * const regionsBoard: RegionsBoard = {"width":5,"height":5,"givens":[0,0,2,0,3,2,0,3,0,0,0,3,0,0,1,3,1,0,1,2,3,3,4,0,0]};
 * const regionsGame = newRegions(regionsBoard);
 * console.log(encodeRegionsGame(regionsGame));
 * ```
 */
export function encodeRegionsGame(game: RegionsGame): string {
  return JSON.stringify({ version: 1, board: game.board, entries: game.entries, helped: game.helped });
}

/** Read a native saved Regions game, or null for invalid board data or progress.
 *
 * @param value - A candidate board, digit, mark or encoded game specified by this signature.
 * @returns Read a native saved Regions game, or null for invalid board data or progress.
 * @example
 * ```ts
 * import { decodeRegionsGame } from "@johnmorrisdotca/kazu/regions";
 *
 * console.log(decodeRegionsGame("{\"version\":1,\"board\":{\"width\":5,\"height\":5,\"givens\":[0,0,2,0,3,2,0,3,0,0,0,3,0,0,1,3,1,0,1,2,3,3,4,0,0]},\"entries\":[0,0,2,0,3,2,0,3,0,0,0,3,0,0,1,3,1,0,1,2,3,3,4,0,0],\"helped\":false}"));
 * ```
 */
export function decodeRegionsGame(value: string): RegionsGame | null {
  try {
    if (value.length > 40_000) return null;
    const parsed = JSON.parse(value) as { version?: unknown; board?: unknown; entries?: unknown; helped?: unknown };
    if (parsed.version !== 1 || !isRegionsBoard(parsed.board) || !Array.isArray(parsed.entries)
      || typeof parsed.helped !== "boolean" || parsed.entries.length !== parsed.board.givens.length) {
      return null;
    }
    const entries = parsed.entries as unknown[];
    if (entries.some(entry => !Number.isInteger(entry) || Number(entry) < 0 || Number(entry) > entries.length)) return null;
    if (parsed.board.givens.some((given, cell) => given > 0 && entries[cell] !== given)) return null;
    return { ...newRegions(parsed.board), entries: [...entries] as number[], helped: parsed.helped };
  } catch {
    return null;
  }
}
