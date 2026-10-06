import { checkRegions, isRegionsBoard } from "./regions-board.ts";
import { solveRegions } from "./regions-solve.ts";
import type { RegionsBoard, RegionsGame } from "./regions.types.ts";

export function newRegions(board: RegionsBoard): RegionsGame {
  if (!isRegionsBoard(board)) throw new RangeError("Invalid Regions board");
  return {
    board: { width: board.width, height: board.height, givens: [...board.givens] },
    entries: [...board.givens],
    history: [],
    helped: false,
  };
}

export function setRegionsCell(game: RegionsGame, cell: number, value: number): RegionsGame {
  if (!Number.isInteger(cell) || cell < 0 || cell >= game.entries.length
    || !Number.isInteger(value) || value < 0 || value > game.entries.length
    || game.board.givens[cell]) return game;
  if (game.entries[cell] === value) return game;
  const entries = [...game.entries];
  entries[cell] = value;
  return { ...game, entries, history: [...game.history, [...game.entries]] };
}

export function undoRegions(game: RegionsGame): RegionsGame {
  const previous = game.history.at(-1);
  return previous
    ? { ...game, entries: [...previous], history: game.history.slice(0, -1) }
    : game;
}

export function hintRegions(game: RegionsGame): { cell: number; value: number; why: string } | null {
  const result = solveRegions(game.board, game.entries);
  if (!result.complete || result.count !== 1 || !result.solution) return null;
  const cell = result.solution.findIndex((value, index) => !game.entries[index] && value > 0);
  return cell < 0 ? null : { cell, value: result.solution[cell]!, why: "unique-completion" };
}

export function regionsFinished(game: RegionsGame): boolean {
  return checkRegions(game.board, game.entries).ok;
}

export function restartRegions(game: RegionsGame): RegionsGame {
  return { ...newRegions(game.board), helped: game.helped };
}

export function encodeRegionsGame(game: RegionsGame): string {
  return JSON.stringify({ version: 1, board: game.board, entries: game.entries, helped: game.helped });
}

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
