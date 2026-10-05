import { checkShikaku, isShikakuBoard, shikakuCells } from "./shikakuBoard.ts";
import { solveShikaku } from "./shikakuSolve.ts";
import type { ShikakuBoard, ShikakuGame, ShikakuRectangle } from "./shikaku.types.ts";

/** Begin with a copy of just the public clues; a generated answer is never kept in play. */
export function newShikaku(board: ShikakuBoard): ShikakuGame {
  if (!isShikakuBoard(board)) throw new RangeError("Invalid Shikaku board");
  return { board: { width: board.width, height: board.height, clues: [...board.clues] }, rectangles: [], history: [], helped: false };
}
/** Place a rectangle, replacing any it touches. Local rule errors are allowed for the player to check. */
export function placeShikaku(game: ShikakuGame, rectangle: ShikakuRectangle): ShikakuGame {
  const cells = shikakuCells(game.board, rectangle);
  if (!cells) return game;
  const covered = new Set(cells);
  return { ...game, rectangles: [...game.rectangles.filter(r => !shikakuCells(game.board, r)!.some(c => covered.has(c))), { ...rectangle }],
    history: [...game.history, game.rectangles.map(r => ({ ...r }))] };
}
/** Remove the rectangle containing a cell. */
export function removeShikaku(game: ShikakuGame, cell: number): ShikakuGame {
  const rectangles = game.rectangles.filter(r => !shikakuCells(game.board, r)!.includes(cell));
  return rectangles.length === game.rectangles.length ? game : { ...game, rectangles, history: [...game.history, game.rectangles] };
}
export function undoShikaku(game: ShikakuGame): ShikakuGame {
  const previous = game.history.at(-1);
  return previous ? { ...game, rectangles: previous.map(r => ({ ...r })), history: game.history.slice(0, -1) } : game;
}
/** A rectangle is offered only when the remaining partition has one proved answer. */
export function hintShikaku(game: ShikakuGame): ShikakuRectangle | null {
  const solved = solveShikaku(game.board, game.rectangles);
  if (!solved.complete || solved.count !== 1) return null;
  return solved.solution!.find(r => !game.rectangles.some(p => p.x === r.x && p.y === r.y && p.width === r.width && p.height === r.height)) ?? null;
}
export function shikakuFinished(game: ShikakuGame): boolean { return checkShikaku(game.board, game.rectangles).ok; }
/** Versioned public puzzle and placement data, with no hidden answer. */
export function encodeShikaku(game: ShikakuGame): string {
  return JSON.stringify({ version: 1, board: game.board, rectangles: game.rectangles, helped: game.helped });
}
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
