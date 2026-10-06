import { checkMasyu, isMasyuBoard, masyuEdgeCount } from "./masyu-board.ts";
import { solveMasyu } from "./masyu-solve.ts";
import type { MasyuBoard, MasyuGame } from "./masyu.types.ts";

export function newMasyu(board: MasyuBoard): MasyuGame {
  if (!isMasyuBoard(board)) throw new RangeError("Invalid Masyu board");
  return { board: { width: board.width, height: board.height, pearls: [...board.pearls] }, edges: [], history: [], helped: false };
}
export function toggleMasyuEdge(game: MasyuGame, edge: number): MasyuGame {
  if (!Number.isInteger(edge) || edge < 0 || edge >= masyuEdgeCount(game.board)) return game;
  const edges = game.edges.includes(edge) ? game.edges.filter(value => value !== edge) : [...game.edges, edge].sort((a, b) => a - b);
  return { ...game, edges, history: [...game.history, [...game.edges]] };
}
export function undoMasyu(game: MasyuGame): MasyuGame {
  const previous = game.history.at(-1);
  return previous ? { ...game, edges: [...previous], history: game.history.slice(0, -1) } : game;
}
export function restartMasyu(game: MasyuGame): MasyuGame { return { ...newMasyu(game.board), helped: false }; }
export function hintMasyu(game: MasyuGame): number | null {
  const result = solveMasyu(game.board);
  if (!result.complete || result.count !== 1) return null;
  return result.solution!.find(edge => !game.edges.includes(edge)) ?? null;
}
export function masyuFinished(game: MasyuGame): boolean { return checkMasyu(game.board, game.edges).ok; }
export function encodeMasyu(game: MasyuGame): string {
  return JSON.stringify({ version: 1, board: game.board, edges: game.edges, helped: game.helped });
}
export function decodeMasyu(code: string): MasyuGame | null {
  try {
    if (code.length > 40_000) return null;
    const value = JSON.parse(code);
    if (value.version !== 1 || !isMasyuBoard(value.board) || !Array.isArray(value.edges)
      || typeof value.helped !== "boolean" || !value.edges.every((edge: unknown) => Number.isInteger(edge))) return null;
    const rawEdges = value.edges as number[];
    const edges = [...new Set(rawEdges)].sort((a, b) => a - b);
    if (edges.length !== rawEdges.length || edges.some(edge => edge < 0 || edge >= masyuEdgeCount(value.board))) return null;
    return { ...newMasyu(value.board), edges, helped: value.helped };
  } catch { return null; }
}
