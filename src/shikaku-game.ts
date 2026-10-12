import { checkShikaku, isShikakuBoard, shikakuCells } from "./shikaku-board.ts";
import { solveShikaku } from "./shikaku-solve.ts";
import type { ShikakuBoard, ShikakuGame, ShikakuRectangle } from "./shikaku.types.ts";

/** Begin with a copy of just the public clues; a generated answer is never kept in play.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @returns Begin with a copy of just the public clues; a generated answer is never kept in play.
 * @example
 * ```ts
 * import type { ShikakuBoard } from "@johnmorrisdotca/kazu/shikaku";
 * import { newShikaku } from "@johnmorrisdotca/kazu/shikaku";
 *
 * const shikakuBoard: ShikakuBoard = {"width":5,"height":5,"clues":[3,0,0,0,2,0,0,0,0,4,0,0,0,0,0,0,0,0,0,3,4,3,6,0,0]};
 * console.log(newShikaku(shikakuBoard));
 * ```
 */
export function newShikaku(board: ShikakuBoard): ShikakuGame {
  if (!isShikakuBoard(board)) throw new RangeError("Invalid Shikaku board");
  return { board: { width: board.width, height: board.height, clues: [...board.clues] }, rectangles: [], history: [], helped: false };
}
/** Place a rectangle, replacing any it touches. Local rule errors are allowed for the player to check.
 *
 * @param game - The current immutable game state.
 * @param rectangle - The rectangle to place.
 * @returns Place a rectangle, replacing any it touches. Local rule errors are allowed for the player to check.
 * @example
 * ```ts
 * import type { ShikakuBoard, ShikakuPuzzle } from "@johnmorrisdotca/kazu/shikaku";
 * import { newShikaku, placeShikaku } from "@johnmorrisdotca/kazu/shikaku";
 *
 * const shikakuBoard: ShikakuBoard = {"width":5,"height":5,"clues":[3,0,0,0,2,0,0,0,0,4,0,0,0,0,0,0,0,0,0,3,4,3,6,0,0]};
 * const shikakuSolution: ShikakuPuzzle["solution"] = [{"x":0,"y":0,"width":3,"height":1},{"x":3,"y":0,"width":2,"height":1},{"x":1,"y":1,"width":4,"height":1},{"x":4,"y":2,"width":1,"height":3},{"x":0,"y":1,"width":1,"height":4},{"x":1,"y":2,"width":1,"height":3},{"x":2,"y":2,"width":2,"height":3}];
 * const shikakuGame = newShikaku(shikakuBoard);
 * console.log(placeShikaku(shikakuGame,shikakuSolution[0]));
 * ```
 */
export function placeShikaku(game: ShikakuGame, rectangle: ShikakuRectangle): ShikakuGame {
  const cells = shikakuCells(game.board, rectangle);
  if (!cells) return game;
  const covered = new Set(cells);
  return { ...game, rectangles: [...game.rectangles.filter(r => !shikakuCells(game.board, r)!.some(c => covered.has(c))), { ...rectangle }],
    history: [...game.history, game.rectangles.map(r => ({ ...r }))] };
}
/** Remove the rectangle containing a cell.
 *
 * @param game - The current immutable game state.
 * @param cell - A zero-based row-major cell index.
 * @returns Remove the rectangle containing a cell.
 * @example
 * ```ts
 * import type { ShikakuBoard, ShikakuPuzzle } from "@johnmorrisdotca/kazu/shikaku";
 * import { newShikaku, placeShikaku, removeShikaku } from "@johnmorrisdotca/kazu/shikaku";
 *
 * const shikakuBoard: ShikakuBoard = {"width":5,"height":5,"clues":[3,0,0,0,2,0,0,0,0,4,0,0,0,0,0,0,0,0,0,3,4,3,6,0,0]};
 * const shikakuSolution: ShikakuPuzzle["solution"] = [{"x":0,"y":0,"width":3,"height":1},{"x":3,"y":0,"width":2,"height":1},{"x":1,"y":1,"width":4,"height":1},{"x":4,"y":2,"width":1,"height":3},{"x":0,"y":1,"width":1,"height":4},{"x":1,"y":2,"width":1,"height":3},{"x":2,"y":2,"width":2,"height":3}];
 * const shikakuGame = newShikaku(shikakuBoard);
 * console.log(removeShikaku(placeShikaku(shikakuGame,shikakuSolution[0]),0));
 * ```
 */
export function removeShikaku(game: ShikakuGame, cell: number): ShikakuGame {
  const rectangles = game.rectangles.filter(r => !shikakuCells(game.board, r)!.includes(cell));
  return rectangles.length === game.rectangles.length ? game : { ...game, rectangles, history: [...game.history, game.rectangles] };
}
/** Return the Shikaku game with its previous marks or entries restored, or unchanged when there is no undo history.
 *
 * @param game - The current immutable game state.
 * @returns Return the Shikaku game with its previous marks or entries restored, or unchanged when there is no undo history.
 * @example
 * ```ts
 * import type { ShikakuBoard } from "@johnmorrisdotca/kazu/shikaku";
 * import { newShikaku, undoShikaku } from "@johnmorrisdotca/kazu/shikaku";
 *
 * const shikakuBoard: ShikakuBoard = {"width":5,"height":5,"clues":[3,0,0,0,2,0,0,0,0,4,0,0,0,0,0,0,0,0,0,3,4,3,6,0,0]};
 * const shikakuGame = newShikaku(shikakuBoard);
 * console.log(undoShikaku(shikakuGame));
 * ```
 */
export function undoShikaku(game: ShikakuGame): ShikakuGame {
  const previous = game.history.at(-1);
  return previous ? { ...game, rectangles: previous.map(r => ({ ...r })), history: game.history.slice(0, -1) } : game;
}
/** A rectangle is offered only when the remaining partition has one proved answer.
 *
 * @param game - The current immutable game state.
 * @returns Find a native Shikaku hint, or null when no actionable hint is available.
 * @example
 * ```ts
 * import type { ShikakuBoard } from "@johnmorrisdotca/kazu/shikaku";
 * import { hintShikaku, newShikaku } from "@johnmorrisdotca/kazu/shikaku";
 *
 * const shikakuBoard: ShikakuBoard = {"width":5,"height":5,"clues":[3,0,0,0,2,0,0,0,0,4,0,0,0,0,0,0,0,0,0,3,4,3,6,0,0]};
 * const shikakuGame = newShikaku(shikakuBoard);
 * console.log(hintShikaku(shikakuGame));
 * ```
 */
export function hintShikaku(game: ShikakuGame): ShikakuRectangle | null {
  const solved = solveShikaku(game.board, game.rectangles);
  if (!solved.complete || solved.count !== 1) return null;
  return solved.solution!.find(r => !game.rectangles.some(p => p.x === r.x && p.y === r.y && p.width === r.width && p.height === r.height)) ?? null;
}
/** Whether this Shikaku game satisfies its complete native rules.
 *
 * @param game - The current immutable game state.
 * @returns Whether this Shikaku game satisfies its complete native rules.
 * @example
 * ```ts
 * import type { ShikakuBoard } from "@johnmorrisdotca/kazu/shikaku";
 * import { newShikaku, shikakuFinished } from "@johnmorrisdotca/kazu/shikaku";
 *
 * const shikakuBoard: ShikakuBoard = {"width":5,"height":5,"clues":[3,0,0,0,2,0,0,0,0,4,0,0,0,0,0,0,0,0,0,3,4,3,6,0,0]};
 * const shikakuGame = newShikaku(shikakuBoard);
 * console.log(shikakuFinished(shikakuGame));
 * ```
 */
export function shikakuFinished(game: ShikakuGame): boolean { return checkShikaku(game.board, game.rectangles).ok; }
/** Versioned public puzzle and placement data, with no hidden answer.
 *
 * @param game - The current immutable game state.
 * @returns Versioned public puzzle and placement data, with no hidden answer.
 * @example
 * ```ts
 * import type { ShikakuBoard } from "@johnmorrisdotca/kazu/shikaku";
 * import { encodeShikaku, newShikaku } from "@johnmorrisdotca/kazu/shikaku";
 *
 * const shikakuBoard: ShikakuBoard = {"width":5,"height":5,"clues":[3,0,0,0,2,0,0,0,0,4,0,0,0,0,0,0,0,0,0,3,4,3,6,0,0]};
 * const shikakuGame = newShikaku(shikakuBoard);
 * console.log(encodeShikaku(shikakuGame));
 * ```
 */
export function encodeShikaku(game: ShikakuGame): string {
  return JSON.stringify({ version: 1, board: game.board, rectangles: game.rectangles, helped: game.helped });
}
/** Read a native saved Shikaku game, or null for invalid board data or progress.
 *
 * @param code - Native saved board and progress text.
 * @returns Read a native saved Shikaku game, or null for invalid board data or progress.
 * @example
 * ```ts
 * import { decodeShikaku } from "@johnmorrisdotca/kazu/shikaku";
 *
 * console.log(decodeShikaku("{\"version\":1,\"board\":{\"width\":5,\"height\":5,\"clues\":[3,0,0,0,2,0,0,0,0,4,0,0,0,0,0,0,0,0,0,3,4,3,6,0,0]},\"rectangles\":[],\"helped\":false}"));
 * ```
 */
export function decodeShikaku(code: string): ShikakuGame | null {
  try {
    if (code.length > 40_000) return null;
    const value = JSON.parse(code);
    if (value.version !== 1 || !isShikakuBoard(value.board) || !Array.isArray(value.rectangles)
      || value.rectangles.length > value.board.clues.length || typeof value.helped !== "boolean") return null;
    let game = newShikaku(value.board);
    for (const r of value.rectangles) {
      if (!shikakuCells(game.board, r)) return null;
      const next = placeShikaku(game, r);
      if (next.rectangles.length !== game.rectangles.length + 1) return null;
      game = next;
    }
    return { ...game, history: [], helped: value.helped };
  } catch { return null; }
}
