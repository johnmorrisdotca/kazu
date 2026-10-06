import { checkSlitherlink, isSlitherlinkBoard } from "./slitherlink-board.ts";
import { solveSlitherlink } from "./slitherlink-solve.ts";
import type { SlitherlinkBoard, SlitherlinkGame } from "./slitherlink.types.ts";

export function newSlitherlink(board: SlitherlinkBoard): SlitherlinkGame {
  if (!isSlitherlinkBoard(board)) throw new RangeError("Invalid Slitherlink board");
  return {
    board: { width: board.width, height: board.height, clues: [...board.clues] },
    edges: [],
    history: [],
    helped: false,
  };
}

export function toggleSlitherlink(game: SlitherlinkGame, edge: number): SlitherlinkGame {
  const maximum = (game.board.height + 1) * game.board.width + game.board.height * (game.board.width + 1);
  if (!Number.isInteger(edge) || edge < 0 || edge >= maximum) return game;
  const edges = game.edges.includes(edge)
    ? game.edges.filter(selected => selected !== edge)
    : [...game.edges, edge];
  return { ...game, edges, history: [...game.history, [...game.edges]] };
}

export function undoSlitherlink(game: SlitherlinkGame): SlitherlinkGame {
  const previous = game.history.at(-1);
  return previous
    ? { ...game, edges: [...previous], history: game.history.slice(0, -1) }
    : game;
}

export function slitherlinkFinished(game: SlitherlinkGame): boolean {
  return checkSlitherlink(game.board, game.edges).ok;
}

export function hintSlitherlink(game: SlitherlinkGame): number | null {
  const solved = solveSlitherlink(game.board);
  if (!solved.complete || solved.count !== 1 || !solved.solution) return null;
  return solved.solution.find(edge => !game.edges.includes(edge))
    ?? game.edges.find(edge => !solved.solution!.includes(edge))
    ?? null;
}

export function encodeSlitherlink(game: SlitherlinkGame): string {
  return JSON.stringify({ version: 1, board: game.board, edges: game.edges, helped: game.helped });
}

export function decodeSlitherlink(code: string): SlitherlinkGame | null {
  try {
    if (code.length > 40_000) return null;
    const value = JSON.parse(code);
    if (value.version !== 1 || !isSlitherlinkBoard(value.board) || !Array.isArray(value.edges)
      || value.edges.length > (value.board.width + 1) * (value.board.height + 1) * 2
      || typeof value.helped !== "boolean" || new Set(value.edges).size !== value.edges.length) return null;
    let game = newSlitherlink(value.board);
    for (const edge of value.edges) {
      const next = toggleSlitherlink(game, edge);
      if (next === game) return null;
      game = next;
    }
    return { ...game, history: [], helped: value.helped };
  } catch {
    return null;
  }
}
