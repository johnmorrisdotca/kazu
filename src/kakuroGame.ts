import { checkKakuro, isKakuroBoard } from "./kakuroBoard.ts";
import { solveKakuro } from "./kakuroSolve.ts";
import type { KakuroBoard, KakuroGame } from "./kakuro.types.ts";

export function newKakuro(board: KakuroBoard): KakuroGame {
  if (!isKakuroBoard(board)) throw new RangeError("Invalid Kakuro board");
  return { board: { width: board.width, height: board.height, cells: board.cells.map(cell => ({ ...cell })) },
    values: Array(board.cells.length).fill(0), notes: board.cells.map(() => []), history: [], helped: false };
}

export function enterKakuro(game: KakuroGame, cell: number, digit: number, pencil = false): KakuroGame {
  if (!Number.isInteger(cell) || cell < 0 || cell >= game.values.length || game.board.cells[cell]!.kind !== "white"
    || !Number.isInteger(digit) || digit < 0 || digit > 9) return game;
  const values = [...game.values], notes = game.notes.map(mark => [...mark]);
  if (pencil) {
    if (!digit) return game;
    const index = notes[cell]!.indexOf(digit);
    if (index < 0) notes[cell]!.push(digit);
    else notes[cell]!.splice(index, 1);
    notes[cell]!.sort((a, b) => a - b);
  } else { values[cell] = digit; notes[cell] = []; }
  return { ...game, values, notes, history: [...game.history, snapshot(game)] };
}

export function undoKakuro(game: KakuroGame): KakuroGame {
  const previous = game.history.at(-1);
  return previous ? { ...game, ...previous, history: game.history.slice(0, -1) } : game;
}
export function restartKakuro(game: KakuroGame): KakuroGame { return newKakuro(game.board); }
export function finishedKakuro(game: KakuroGame): boolean { return checkKakuro(game.board, game.values).ok; }

export function hintKakuro(game: KakuroGame): { cell: number; digit: number } | null {
  const proof = solveKakuro(game.board, game.values, { limit: 2 });
  if (!proof.complete || proof.count !== 1 || !proof.solution) return null;
  const cell = game.board.cells.findIndex((tile, at) => tile.kind === "white" && game.values[at] === 0);
  return cell < 0 ? null : { cell, digit: proof.solution[cell]! };
}

export function encodeKakuro(game: KakuroGame): string {
  return JSON.stringify({ version: 1, board: game.board, values: game.values, notes: game.notes, helped: game.helped });
}
export function decodeKakuro(code: string): KakuroGame | null {
  try {
    if (code.length > 40000) return null;
    const value = JSON.parse(code);
    if (value.version !== 1 || !isKakuroBoard(value.board) || typeof value.helped !== "boolean"
      || !Array.isArray(value.values) || value.values.length !== value.board.cells.length
      || !Array.isArray(value.notes) || value.notes.length !== value.board.cells.length) return null;
    let game = newKakuro(value.board);
    for (let cell = 0; cell < value.values.length; cell += 1) {
      const digit = value.values[cell];
      if (!Number.isInteger(digit) || digit < 0 || digit > 9 || value.board.cells[cell].kind === "black" && digit !== 0) return null;
      if (digit) game = enterKakuro(game, cell, digit);
      const marks = value.notes[cell];
      if (!Array.isArray(marks) || marks.some(n => !Number.isInteger(n) || n < 1 || n > 9) || new Set(marks).size !== marks.length) return null;
      for (const mark of marks) game = enterKakuro(game, cell, mark, true);
    }
    return { ...game, history: [], helped: value.helped };
  } catch { return null; }
}
function snapshot(game: KakuroGame) { return { values: [...game.values], notes: game.notes.map(mark => [...mark]) }; }
