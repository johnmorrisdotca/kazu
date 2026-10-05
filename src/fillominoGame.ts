import { checkFillomino, isFillominoBoard } from "./fillominoBoard.ts";
import { solveFillomino } from "./fillominoSolve.ts";
import type { FillominoBoard, FillominoGame } from "./fillomino.types.ts";

export function newFillomino(board: FillominoBoard): FillominoGame {
  if (!isFillominoBoard(board)) throw new RangeError("Invalid Fillomino board");
  return {
    board: { width: board.width, height: board.height, givens: [...board.givens] },
    entries: [...board.givens],
    history: [],
    helped: false,
  };
}

export function setFillominoCell(game: FillominoGame, cell: number, value: number): FillominoGame {
  if (!Number.isInteger(cell) || cell < 0 || cell >= game.entries.length
    || !Number.isInteger(value) || value < 0 || value > game.entries.length
    || game.board.givens[cell]) return game;
  if (game.entries[cell] === value) return game;
  const entries = [...game.entries];
  entries[cell] = value;
  return { ...game, entries, history: [...game.history, [...game.entries]] };
}

export function undoFillomino(game: FillominoGame): FillominoGame {
  const previous = game.history.at(-1);
  return previous
    ? { ...game, entries: [...previous], history: game.history.slice(0, -1) }
    : game;
}

export function hintFillomino(game: FillominoGame): { cell: number; value: number; why: string } | null {
  const result = solveFillomino(game.board, game.entries);
  if (!result.complete || result.count !== 1 || !result.solution) return null;
  const cell = result.solution.findIndex((value, index) => !game.entries[index] && value > 0);
  return cell < 0 ? null : { cell, value: result.solution[cell]!, why: "unique-completion" };
}

export function fillominoFinished(game: FillominoGame): boolean {
  return checkFillomino(game.board, game.entries).ok;
}

export function restartFillomino(game: FillominoGame): FillominoGame {
  return { ...newFillomino(game.board), helped: game.helped };
}

export function encodeFillomino(game: FillominoGame): string {
  return JSON.stringify({ version: 1, board: game.board, entries: game.entries, helped: game.helped });
}

export function decodeFillomino(value: string): FillominoGame | null {
  try {
    if (value.length > 40_000) return null;
    const parsed = JSON.parse(value) as { version?: unknown; board?: unknown; entries?: unknown; helped?: unknown };
    if (parsed.version !== 1 || !isFillominoBoard(parsed.board) || !Array.isArray(parsed.entries)
      || typeof parsed.helped !== "boolean" || parsed.entries.length !== parsed.board.givens.length) {
      return null;
    }
    const entries = parsed.entries as unknown[];
    if (entries.some(entry => !Number.isInteger(entry) || Number(entry) < 0 || Number(entry) > entries.length)) return null;
    if (parsed.board.givens.some((given, cell) => given > 0 && entries[cell] !== given)) return null;
    return { ...newFillomino(parsed.board), entries: [...entries] as number[], helped: parsed.helped };
  } catch {
    return null;
  }
}
