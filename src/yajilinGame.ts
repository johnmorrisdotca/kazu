import { isYajilinBoard, yajilinEdgeCount } from "./yajilinBoard.ts";
import { solveYajilin } from "./yajilinSolve.ts";
import type { YajilinBoard, YajilinGame } from "./yajilin.types.ts";

export function newYajilin(board: YajilinBoard): YajilinGame {
  if (!isYajilinBoard(board)) throw new RangeError("Invalid Yajilin board");
  return { board: { width: board.width, height: board.height, clues: board.clues.map(clue => clue ? { ...clue } : null) }, shaded: Array(board.width * board.height).fill(false), edges: [], history: [], helped: false };
}
function snapshot(game: YajilinGame) { return { shaded: [...game.shaded], edges: [...game.edges] }; }
export function toggleYajilinShade(game: YajilinGame, cell: number): YajilinGame {
  if (!Number.isInteger(cell) || cell < 0 || cell >= game.shaded.length || game.board.clues[cell]) return game;
  const shaded = [...game.shaded]; shaded[cell] = !shaded[cell];
  return { ...game, shaded, history: [...game.history, snapshot(game)] };
}
export function toggleYajilinEdge(game: YajilinGame, edge: number): YajilinGame {
  if (!Number.isInteger(edge) || edge < 0 || edge >= yajilinEdgeCount(game.board)) return game;
  const edges = game.edges.includes(edge) ? game.edges.filter(value => value !== edge) : [...game.edges, edge].sort((a, b) => a - b);
  return { ...game, edges, history: [...game.history, snapshot(game)] };
}
export function undoYajilin(game: YajilinGame): YajilinGame {
  const previous = game.history.at(-1);
  return previous ? { ...game, shaded: [...previous.shaded], edges: [...previous.edges], history: game.history.slice(0, -1) } : game;
}
export function restartYajilin(game: YajilinGame): YajilinGame { return { ...newYajilin(game.board), helped: false }; }
export function hintYajilin(game: YajilinGame): { type: "shade"; cell: number } | { type: "edge"; edge: number } | null {
  const result = solveYajilin(game.board);
  if (!result.complete || result.count !== 1) return null;
  const cell = result.solution!.shaded.findIndex((value, index) => value !== game.shaded[index]);
  if (cell >= 0) return { type: "shade", cell };
  const edge = result.solution!.edges.find(value => !game.edges.includes(value));
  return edge === undefined ? null : { type: "edge", edge };
}
export function encodeYajilin(game: YajilinGame): string {
  return JSON.stringify({ version: 1, board: game.board, shaded: game.shaded, edges: game.edges, helped: game.helped });
}
export function decodeYajilin(code: string): YajilinGame | null {
  try {
    if (code.length > 40_000) return null;
    const value = JSON.parse(code);
    if (value.version !== 1 || !isYajilinBoard(value.board) || !Array.isArray(value.shaded)
      || value.shaded.length !== value.board.width * value.board.height || !value.shaded.every((cell: unknown) => typeof cell === "boolean")
      || !Array.isArray(value.edges) || !value.edges.every((edge: unknown) => Number.isInteger(edge))
      || typeof value.helped !== "boolean") return null;
    const edges = [...new Set(value.edges as number[])].sort((a, b) => a - b);
    if (edges.length !== value.edges.length || edges.some(edge => edge < 0 || edge >= yajilinEdgeCount(value.board))) return null;
    return { ...newYajilin(value.board), shaded: [...value.shaded], edges, helped: value.helped };
  } catch { return null; }
}
