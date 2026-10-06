import { checkLoop, isLoopBoard } from "./loop-board.ts";
import { solveLoop } from "./loop-solve.ts";
import type { LoopBoard, LoopGame } from "./loop.types.ts";

export function newLoop(board: LoopBoard): LoopGame {
  if (!isLoopBoard(board)) throw new RangeError("Invalid Loop board");
  return {
    board: { width: board.width, height: board.height, clues: [...board.clues] },
    edges: [],
    history: [],
    helped: false,
  };
}

export function toggleLoop(game: LoopGame, edge: number): LoopGame {
  const maximum = (game.board.height + 1) * game.board.width + game.board.height * (game.board.width + 1);
  if (!Number.isInteger(edge) || edge < 0 || edge >= maximum) return game;
  const edges = game.edges.includes(edge)
    ? game.edges.filter(selected => selected !== edge)
    : [...game.edges, edge];
  return { ...game, edges, history: [...game.history, [...game.edges]] };
}

export function undoLoop(game: LoopGame): LoopGame {
  const previous = game.history.at(-1);
  return previous
    ? { ...game, edges: [...previous], history: game.history.slice(0, -1) }
    : game;
}

export function loopFinished(game: LoopGame): boolean {
  return checkLoop(game.board, game.edges).ok;
}

export function hintLoop(game: LoopGame): number | null {
  const solved = solveLoop(game.board);
  if (!solved.complete || solved.count !== 1 || !solved.solution) return null;
  return solved.solution.find(edge => !game.edges.includes(edge))
    ?? game.edges.find(edge => !solved.solution!.includes(edge))
    ?? null;
}

export function encodeLoop(game: LoopGame): string {
  return JSON.stringify({ version: 1, board: game.board, edges: game.edges, helped: game.helped });
}

export function decodeLoop(code: string): LoopGame | null {
  try {
    if (code.length > 40_000) return null;
    const value = JSON.parse(code);
    if (value.version !== 1 || !isLoopBoard(value.board) || !Array.isArray(value.edges)
      || value.edges.length > (value.board.width + 1) * (value.board.height + 1) * 2
      || typeof value.helped !== "boolean" || new Set(value.edges).size !== value.edges.length) return null;
    let game = newLoop(value.board);
    for (const edge of value.edges) {
      const next = toggleLoop(game, edge);
      if (next === game) return null;
      game = next;
    }
    return { ...game, history: [], helped: value.helped };
  } catch {
    return null;
  }
}
