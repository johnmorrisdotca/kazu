import { isHitoriBoard } from "./hitoriBoard.ts";
import { solveHitori } from "./hitoriSolve.ts";
import type { HitoriBoard, HitoriGame } from "./hitori.types.ts";

export function newHitori(board: HitoriBoard): HitoriGame {
  if (!isHitoriBoard(board)) throw new RangeError("Invalid Hitori board");
  return { board: { size: board.size, numbers: [...board.numbers] }, shaded: Array(board.size ** 2).fill(false), history: [], helped: false };
}

export function shadeHitori(game: HitoriGame, cell: number): HitoriGame {
  if (!Number.isInteger(cell) || cell < 0 || cell >= game.shaded.length) return game;
  const shaded = [...game.shaded]; shaded[cell] = !shaded[cell];
  return { ...game, shaded, history: [...game.history, [...game.shaded]] };
}

export function undoHitori(game: HitoriGame): HitoriGame {
  const prior = game.history.at(-1);
  return prior ? { ...game, shaded: [...prior], history: game.history.slice(0, -1) } : game;
}

export function restartHitori(game: HitoriGame): HitoriGame {
  return { ...game, shaded: Array(game.shaded.length).fill(false), history: [], helped: false };
}

/** Gives one next shade in the unique minimal solution, if uniqueness was proved. */
export function hintHitori(game: HitoriGame): number | null {
  const result = solveHitori(game.board);
  if (!result.complete || result.count !== 1 || !result.solution) return null;
  const cell = result.solution.findIndex((isShaded, index) => isShaded !== game.shaded[index]);
  return cell < 0 ? null : cell;
}

/** Versioned public clue and mark data; the generated answer is not saved. */
export function encodeHitori(game: HitoriGame): string {
  return JSON.stringify({ version: 1, board: game.board, shaded: game.shaded, helped: game.helped });
}

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
