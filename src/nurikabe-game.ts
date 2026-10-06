import { isNurikabeBoard } from "./nurikabe-board.ts";
import { solveNurikabe } from "./nurikabe-solve.ts";
import type { NurikabeBoard, NurikabeGame } from "./nurikabe.types.ts";
export function newNurikabe(board: NurikabeBoard): NurikabeGame {
  if (!isNurikabeBoard(board)) throw new RangeError("Invalid Nurikabe board");
  return { board: { size: board.size, clues: [...board.clues] }, sea: Array(board.size ** 2).fill(false), history: [], helped: false };
}
export function markNurikabeSea(game: NurikabeGame, cell: number): NurikabeGame {
  if (!Number.isInteger(cell) || cell < 0 || cell >= game.sea.length || game.board.clues[cell]) return game;
  const sea = [...game.sea]; sea[cell] = !sea[cell];
  return { ...game, sea, history: [...game.history, [...game.sea]] };
}
export function undoNurikabe(game: NurikabeGame): NurikabeGame {
  const prior = game.history.at(-1);
  return prior ? { ...game, sea: [...prior], history: game.history.slice(0, -1) } : game;
}
export function restartNurikabe(game: NurikabeGame): NurikabeGame { return { ...game, sea: Array(game.sea.length).fill(false), history: [], helped: false }; }
export function hintNurikabe(game: NurikabeGame): number | null {
  const solved = solveNurikabe(game.board);
  if (!solved.complete || solved.count !== 1 || !solved.solution) return null;
  const cell = solved.solution.findIndex((value, i) => value !== game.sea[i]);
  return cell < 0 ? null : cell;
}
export function encodeNurikabe(game: NurikabeGame): string { return JSON.stringify({ version: 1, board: game.board, sea: game.sea, helped: game.helped }); }
export function decodeNurikabe(code: string): NurikabeGame | null {
  try {
    if (code.length > 10000) return null;
    const value = JSON.parse(code);
    if (value.version !== 1 || !isNurikabeBoard(value.board) || !Array.isArray(value.sea) || value.sea.length !== value.board.size ** 2 || !value.sea.every((item: unknown) => typeof item === "boolean") || typeof value.helped !== "boolean") return null;
    return { ...newNurikabe(value.board), sea: [...value.sea], helped: value.helped };
  } catch { return null; }
}
