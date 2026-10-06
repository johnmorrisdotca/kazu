import { checkCrossSums, isCrossSumsBoard } from "./cross-sums-board.ts";
import { solveCrossSums } from "./cross-sums-solve.ts";
import type { CrossSumsBoard, CrossSumsGame } from "./cross-sums.types.ts";

export function newCrossSums(board: CrossSumsBoard): CrossSumsGame {
  if (!isCrossSumsBoard(board)) throw new RangeError("Invalid Cross Sums board");
  return { board: { width: board.width, height: board.height, cells: board.cells.map(cell => ({ ...cell })) },
    values: Array(board.cells.length).fill(0), notes: board.cells.map(() => []), history: [], helped: false };
}

export function enterCrossSums(game: CrossSumsGame, cell: number, digit: number, pencil = false): CrossSumsGame {
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

export function undoCrossSums(game: CrossSumsGame): CrossSumsGame {
  const previous = game.history.at(-1);
  return previous ? { ...game, ...previous, history: game.history.slice(0, -1) } : game;
}
export function restartCrossSums(game: CrossSumsGame): CrossSumsGame { return newCrossSums(game.board); }
export function finishedCrossSums(game: CrossSumsGame): boolean { return checkCrossSums(game.board, game.values).ok; }

export function hintCrossSums(game: CrossSumsGame): { cell: number; digit: number } | null {
  const proof = solveCrossSums(game.board, game.values, { limit: 2 });
  if (!proof.complete || proof.count !== 1 || !proof.solution) return null;
  const cell = game.board.cells.findIndex((tile, at) => tile.kind === "white" && game.values[at] === 0);
  return cell < 0 ? null : { cell, digit: proof.solution[cell]! };
}

export function encodeCrossSums(game: CrossSumsGame): string {
  return JSON.stringify({ version: 1, board: game.board, values: game.values, notes: game.notes, helped: game.helped });
}
export function decodeCrossSums(code: string): CrossSumsGame | null {
  try {
    if (code.length > 40000) return null;
    const value = JSON.parse(code);
    if (value.version !== 1 || !isCrossSumsBoard(value.board) || typeof value.helped !== "boolean"
      || !Array.isArray(value.values) || value.values.length !== value.board.cells.length
      || !Array.isArray(value.notes) || value.notes.length !== value.board.cells.length) return null;
    let game = newCrossSums(value.board);
    for (let cell = 0; cell < value.values.length; cell += 1) {
      const digit = value.values[cell];
      if (!Number.isInteger(digit) || digit < 0 || digit > 9 || value.board.cells[cell].kind === "black" && digit !== 0) return null;
      if (digit) game = enterCrossSums(game, cell, digit);
      const marks = value.notes[cell];
      if (!Array.isArray(marks) || marks.some(n => !Number.isInteger(n) || n < 1 || n > 9) || new Set(marks).size !== marks.length) return null;
      for (const mark of marks) game = enterCrossSums(game, cell, mark, true);
    }
    return { ...game, history: [], helped: value.helped };
  } catch { return null; }
}
function snapshot(game: CrossSumsGame) { return { values: [...game.values], notes: game.notes.map(mark => [...mark]) }; }
