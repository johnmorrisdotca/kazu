import { checkAkari, isAkariBoard } from "./akari-board.ts";
import { solveAkari } from "./akari-solve.ts";
import type { AkariBoard, AkariGame } from "./akari.types.ts";

/** Starts a game with only its public board data.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @returns Starts a game with only its public board data.
 * @example
 * ```ts
 * import type { AkariBoard } from "@johnmorrisdotca/kazu/akari";
 * import { newAkari } from "@johnmorrisdotca/kazu/akari";
 *
 * const akariBoard: AkariBoard = {"width":5,"height":5,"cells":[1,null,null,null,null,0,null,null,null,0,1,0,null,null,null,null,false,null,null,null,null,false,null,null,2]};
 * console.log(newAkari(akariBoard));
 * ```
 */
export function newAkari(board: AkariBoard): AkariGame {
  if (!isAkariBoard(board)) throw new RangeError("Invalid Akari board");
  return {
    board: { width: board.width, height: board.height, cells: [...board.cells] },
    bulbs: [],
    history: [],
    helped: false,
  };
}

/** Toggles a bulb on a white square and keeps one prior turn for undo.
 *
 * @param game - The current immutable game state.
 * @param cell - A zero-based row-major cell index.
 * @returns Toggles a bulb on a white square and keeps one prior turn for undo.
 * @example
 * ```ts
 * import type { AkariBoard } from "@johnmorrisdotca/kazu/akari";
 * import { newAkari, toggleAkari } from "@johnmorrisdotca/kazu/akari";
 *
 * const akariBoard: AkariBoard = {"width":5,"height":5,"cells":[1,null,null,null,null,0,null,null,null,0,1,0,null,null,null,null,false,null,null,null,null,false,null,null,2]};
 * const akariGame = newAkari(akariBoard);
 * console.log(toggleAkari(akariGame,0));
 * ```
 */
export function toggleAkari(game: AkariGame, cell: number): AkariGame {
  if (!Number.isInteger(cell) || cell < 0 || cell >= game.board.cells.length || game.board.cells[cell] !== null) {
    return game;
  }
  const bulbs = game.bulbs.includes(cell)
    ? game.bulbs.filter(placed => placed !== cell)
    : [...game.bulbs, cell];
  return { ...game, bulbs, history: [...game.history, [...game.bulbs]] };
}

/** Restores the last bulb placement.
 *
 * @param game - The current immutable game state.
 * @returns Restores the last bulb placement.
 * @example
 * ```ts
 * import type { AkariBoard } from "@johnmorrisdotca/kazu/akari";
 * import { newAkari, undoAkari } from "@johnmorrisdotca/kazu/akari";
 *
 * const akariBoard: AkariBoard = {"width":5,"height":5,"cells":[1,null,null,null,null,0,null,null,null,0,1,0,null,null,null,null,false,null,null,null,null,false,null,null,2]};
 * const akariGame = newAkari(akariBoard);
 * console.log(undoAkari(akariGame));
 * ```
 */
export function undoAkari(game: AkariGame): AkariGame {
  const previous = game.history.at(-1);
  return previous
    ? { ...game, bulbs: [...previous], history: game.history.slice(0, -1) }
    : game;
}

/** A game is finished only when its bulbs satisfy every rule and light every white square.
 *
 * @param game - The current immutable game state.
 * @returns A game is finished only when its bulbs satisfy every rule and light every white square.
 * @example
 * ```ts
 * import type { AkariBoard } from "@johnmorrisdotca/kazu/akari";
 * import { akariFinished, newAkari } from "@johnmorrisdotca/kazu/akari";
 *
 * const akariBoard: AkariBoard = {"width":5,"height":5,"cells":[1,null,null,null,null,0,null,null,null,0,1,0,null,null,null,null,false,null,null,null,null,false,null,null,2]};
 * const akariGame = newAkari(akariBoard);
 * console.log(akariFinished(akariGame));
 * ```
 */
export function akariFinished(game: AkariGame): boolean {
  return checkAkari(game.board, game.bulbs).ok;
}

/** Returns a missing bulb, or an extra bulb to remove, only after uniqueness is proved.
 *
 * @param game - The current immutable game state.
 * @returns Find a native Akari hint, or null when no actionable hint is available.
 * @example
 * ```ts
 * import type { AkariBoard } from "@johnmorrisdotca/kazu/akari";
 * import { hintAkari, newAkari } from "@johnmorrisdotca/kazu/akari";
 *
 * const akariBoard: AkariBoard = {"width":5,"height":5,"cells":[1,null,null,null,null,0,null,null,null,0,1,0,null,null,null,null,false,null,null,null,null,false,null,null,2]};
 * const akariGame = newAkari(akariBoard);
 * console.log(hintAkari(akariGame));
 * ```
 */
export function hintAkari(game: AkariGame): number | null {
  const solved = solveAkari(game.board);
  if (!solved.complete || solved.count !== 1 || !solved.solution) return null;
  return solved.solution.find(cell => !game.bulbs.includes(cell))
    ?? game.bulbs.find(cell => !solved.solution!.includes(cell))
    ?? null;
}

/** Encodes only public clues and player placements.
 *
 * @param game - The current immutable game state.
 * @returns Encodes only public clues and player placements.
 * @example
 * ```ts
 * import type { AkariBoard } from "@johnmorrisdotca/kazu/akari";
 * import { encodeAkari, newAkari } from "@johnmorrisdotca/kazu/akari";
 *
 * const akariBoard: AkariBoard = {"width":5,"height":5,"cells":[1,null,null,null,null,0,null,null,null,0,1,0,null,null,null,null,false,null,null,null,null,false,null,null,2]};
 * const akariGame = newAkari(akariBoard);
 * console.log(encodeAkari(akariGame));
 * ```
 */
export function encodeAkari(game: AkariGame): string {
  return JSON.stringify({ version: 1, board: game.board, bulbs: game.bulbs, helped: game.helped });
}

/** Decodes a bounded save after validating the board and each placement.
 *
 * @param code - Native saved board and progress text.
 * @returns Read a native saved Akari game, or null for invalid board data or progress.
 * @example
 * ```ts
 * import { decodeAkari } from "@johnmorrisdotca/kazu/akari";
 *
 * console.log(decodeAkari("{\"version\":1,\"board\":{\"width\":5,\"height\":5,\"cells\":[1,null,null,null,null,0,null,null,null,0,1,0,null,null,null,null,false,null,null,null,null,false,null,null,2]},\"bulbs\":[],\"helped\":false}"));
 * ```
 */
export function decodeAkari(code: string): AkariGame | null {
  try {
    if (code.length > 40_000) return null;
    const value = JSON.parse(code);
    if (value.version !== 1 || !isAkariBoard(value.board) || !Array.isArray(value.bulbs)
      || value.bulbs.length > value.board.cells.length || typeof value.helped !== "boolean") return null;
    if (new Set(value.bulbs).size !== value.bulbs.length) return null;

    let game = newAkari(value.board);
    for (const cell of value.bulbs) {
      const next = toggleAkari(game, cell);
      if (next === game) return null;
      game = next;
    }
    return { ...game, history: [], helped: value.helped };
  } catch {
    return null;
  }
}
