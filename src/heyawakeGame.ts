import { checkHeyawake, isHeyawakeBoard } from "./heyawakeBoard.ts";
import { solveHeyawake } from "./heyawakeSolve.ts";
import type { HeyawakeBoard, HeyawakeGame } from "./heyawake.types.ts";

export function newHeyawake(board: HeyawakeBoard): HeyawakeGame {
  if (!isHeyawakeBoard(board)) throw new RangeError("Invalid Heyawake board");
  return { board: publicBoard(board), entries: Array(board.width * board.height).fill(null), history: [], helped: false };
}

export function setHeyawakeCell(game: HeyawakeGame, cell: number, value: boolean | null): HeyawakeGame {
  if (value !== null && typeof value !== "boolean" || !Number.isInteger(cell) || cell < 0 || cell >= game.entries.length || game.entries[cell] === value) return game;
  const entries = [...game.entries];
  entries[cell] = value;
  return { ...game, entries, history: [...game.history, game.entries] };
}

export function undoHeyawake(game: HeyawakeGame): HeyawakeGame {
  const previous = game.history.at(-1);
  return previous ? { ...game, entries: previous, history: game.history.slice(0, -1) } : game;
}

export function restartHeyawake(game: HeyawakeGame): HeyawakeGame {
  return { ...game, entries: Array(game.entries.length).fill(null), history: [], helped: false };
}

export function hintHeyawake(game: HeyawakeGame): { cell: number; value: boolean } | null {
  const result = solveHeyawake(game.board, game.entries);
  if (!result.complete || result.count !== 1 || !result.solution) return null;
  const cell = game.entries.findIndex(value => value === null);
  return cell < 0 ? null : { cell, value: result.solution[cell]! };
}

export function heyawakeFinished(game: HeyawakeGame): boolean {
  return checkHeyawake(game.board, game.entries).ok;
}

export function encodeHeyawake(game: HeyawakeGame): string {
  return JSON.stringify({ version: 1, board: publicBoard(game.board), entries: game.entries.map(value => value === null ? "?" : value ? "#" : ".").join(""), helped: game.helped });
}

export function decodeHeyawake(code: string): HeyawakeGame | null {
  try {
    const data = JSON.parse(code);
    if (data.version !== 1 || !isHeyawakeBoard(data.board) || typeof data.helped !== "boolean" || typeof data.entries !== "string") return null;
    const entries = [...data.entries].map((value: string) => value === "?" ? null : value === "#" ? true : value === "." ? false : undefined);
    if (entries.length !== data.board.width * data.board.height || entries.some((value: unknown) => value === undefined)) return null;
    return { board: publicBoard(data.board), entries: entries as (boolean | null)[], history: [], helped: data.helped };
  } catch {
    return null;
  }
}

function publicBoard(board: HeyawakeBoard): HeyawakeBoard {
  return { width: board.width, height: board.height, rooms: board.rooms.map(room => ({ x: room.x, y: room.y, width: room.width, height: room.height, blacks: room.blacks })) };
}
