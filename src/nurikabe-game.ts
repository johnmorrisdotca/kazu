import { isNurikabeBoard } from "./nurikabe-board.ts";
import { solveNurikabe } from "./nurikabe-solve.ts";
import type { NurikabeBoard, NurikabeGame } from "./nurikabe.types.ts";
/** Create the initial immutable Nurikabe game from a valid board.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @returns Create the initial immutable Nurikabe game from a valid board.
 * @example
 * ```ts
 * import type { NurikabeBoard } from "@johnmorrisdotca/kazu/nurikabe";
 * import { newNurikabe } from "@johnmorrisdotca/kazu/nurikabe";
 *
 * const nurikabeBoard: NurikabeBoard = {"size":5,"clues":[1,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,2,0,0,3,0,0]};
 * console.log(newNurikabe(nurikabeBoard));
 * ```
 */
export function newNurikabe(board: NurikabeBoard): NurikabeGame {
  if (!isNurikabeBoard(board)) throw new RangeError("Invalid Nurikabe board");
  return { board: { size: board.size, clues: [...board.clues] }, sea: Array(board.size ** 2).fill(false), history: [], helped: false };
}
/** Apply the requested native Nurikabe entry or mark to a new immutable game; invalid or fixed targets stay unchanged.
 *
 * @param game - The current immutable game state.
 * @param cell - A zero-based row-major cell index.
 * @returns Apply the requested native Nurikabe entry or mark to a new immutable game; invalid or fixed targets stay unchanged.
 * @example
 * ```ts
 * import type { NurikabeBoard } from "@johnmorrisdotca/kazu/nurikabe";
 * import { markNurikabeSea, newNurikabe } from "@johnmorrisdotca/kazu/nurikabe";
 *
 * const nurikabeBoard: NurikabeBoard = {"size":5,"clues":[1,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,2,0,0,3,0,0]};
 * const nurikabeGame = newNurikabe(nurikabeBoard);
 * console.log(markNurikabeSea(nurikabeGame,0));
 * ```
 */
export function markNurikabeSea(game: NurikabeGame, cell: number): NurikabeGame {
  if (!Number.isInteger(cell) || cell < 0 || cell >= game.sea.length || game.board.clues[cell]) return game;
  const sea = [...game.sea]; sea[cell] = !sea[cell];
  return { ...game, sea, history: [...game.history, [...game.sea]] };
}
/** Return the Nurikabe game with its previous marks or entries restored, or unchanged when there is no undo history.
 *
 * @param game - The current immutable game state.
 * @returns Return the Nurikabe game with its previous marks or entries restored, or unchanged when there is no undo history.
 * @example
 * ```ts
 * import type { NurikabeBoard } from "@johnmorrisdotca/kazu/nurikabe";
 * import { newNurikabe, undoNurikabe } from "@johnmorrisdotca/kazu/nurikabe";
 *
 * const nurikabeBoard: NurikabeBoard = {"size":5,"clues":[1,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,2,0,0,3,0,0]};
 * const nurikabeGame = newNurikabe(nurikabeBoard);
 * console.log(undoNurikabe(nurikabeGame));
 * ```
 */
export function undoNurikabe(game: NurikabeGame): NurikabeGame {
  const prior = game.history.at(-1);
  return prior ? { ...game, sea: [...prior], history: game.history.slice(0, -1) } : game;
}
/** Return the Nurikabe game reset to its initial entries or marks.
 *
 * @param game - The current immutable game state.
 * @returns Return the Nurikabe game reset to its initial entries or marks.
 * @example
 * ```ts
 * import type { NurikabeBoard } from "@johnmorrisdotca/kazu/nurikabe";
 * import { newNurikabe, restartNurikabe } from "@johnmorrisdotca/kazu/nurikabe";
 *
 * const nurikabeBoard: NurikabeBoard = {"size":5,"clues":[1,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,2,0,0,3,0,0]};
 * const nurikabeGame = newNurikabe(nurikabeBoard);
 * console.log(restartNurikabe(nurikabeGame));
 * ```
 */
export function restartNurikabe(game: NurikabeGame): NurikabeGame { return { ...game, sea: Array(game.sea.length).fill(false), history: [], helped: false }; }
/** Find a native Nurikabe hint, or null when no actionable hint is available.
 *
 * @param game - The current immutable game state.
 * @returns Find a native Nurikabe hint, or null when no actionable hint is available.
 * @example
 * ```ts
 * import type { NurikabeBoard } from "@johnmorrisdotca/kazu/nurikabe";
 * import { hintNurikabe, newNurikabe } from "@johnmorrisdotca/kazu/nurikabe";
 *
 * const nurikabeBoard: NurikabeBoard = {"size":5,"clues":[1,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,2,0,0,3,0,0]};
 * const nurikabeGame = newNurikabe(nurikabeBoard);
 * console.log(hintNurikabe(nurikabeGame));
 * ```
 */
export function hintNurikabe(game: NurikabeGame): number | null {
  const solved = solveNurikabe(game.board);
  if (!solved.complete || solved.count !== 1 || !solved.solution) return null;
  const cell = solved.solution.findIndex((value, i) => value !== game.sea[i]);
  return cell < 0 ? null : cell;
}
/** Encode the Nurikabe board and current game as native resumable text.
 *
 * @param game - The current immutable game state.
 * @returns Encode the Nurikabe board and current game as native resumable text.
 * @example
 * ```ts
 * import type { NurikabeBoard } from "@johnmorrisdotca/kazu/nurikabe";
 * import { encodeNurikabe, newNurikabe } from "@johnmorrisdotca/kazu/nurikabe";
 *
 * const nurikabeBoard: NurikabeBoard = {"size":5,"clues":[1,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,2,0,0,3,0,0]};
 * const nurikabeGame = newNurikabe(nurikabeBoard);
 * console.log(encodeNurikabe(nurikabeGame));
 * ```
 */
export function encodeNurikabe(game: NurikabeGame): string { return JSON.stringify({ version: 1, board: game.board, sea: game.sea, helped: game.helped }); }
/** Read a native saved Nurikabe game, or null for invalid board data or progress.
 *
 * @param code - Native saved board and progress text.
 * @returns Read a native saved Nurikabe game, or null for invalid board data or progress.
 * @example
 * ```ts
 * import { decodeNurikabe } from "@johnmorrisdotca/kazu/nurikabe";
 *
 * console.log(decodeNurikabe("{\"version\":1,\"board\":{\"size\":5,\"clues\":[1,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,2,0,0,3,0,0]},\"sea\":[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],\"helped\":false}"));
 * ```
 */
export function decodeNurikabe(code: string): NurikabeGame | null {
  try {
    if (code.length > 10000) return null;
    const value = JSON.parse(code);
    if (value.version !== 1 || !isNurikabeBoard(value.board) || !Array.isArray(value.sea) || value.sea.length !== value.board.size ** 2 || !value.sea.every((item: unknown) => typeof item === "boolean") || typeof value.helped !== "boolean") return null;
    return { ...newNurikabe(value.board), sea: [...value.sea], helped: value.helped };
  } catch { return null; }
}
