import { isRippleBoard, checkRipple, rippleRoomSizes } from "./rippleBoard.ts";
import { solveRipple } from "./rippleSolve.ts";
import type { RippleBoard, RippleGame } from "./ripple.types.ts";

export function newRipple(board: RippleBoard): RippleGame {
  if (!isRippleBoard(board)) throw new RangeError("Invalid Ripple Effect board");
  return { board: { width: board.width, height: board.height, rooms: [...board.rooms], clues: [...board.clues] },
    values: board.clues.map(clue => clue ?? 0), notes: board.rooms.map(() => []), history: [], helped: false };
}

export function setRippleValue(game: RippleGame, cell: number, value: number): RippleGame {
  if (!Number.isInteger(cell) || cell < 0 || cell >= game.values.length || game.board.clues[cell] !== null
    || !Number.isInteger(value) || value < 0 || value > rippleRoomSizes(game.board)[game.board.rooms[cell]!]!) return game;
  if (game.values[cell] === value) return game;
  const values = [...game.values]; values[cell] = value;
  const notes = game.notes.map((list, index) => index === cell ? [] : [...list]);
  return { ...game, values, notes, history: [...game.history, snapshot(game)] };
}

export function toggleRippleNote(game: RippleGame, cell: number, value: number): RippleGame {
  if (!Number.isInteger(cell) || cell < 0 || cell >= game.values.length || game.board.clues[cell] !== null || game.values[cell] !== 0
    || !Number.isInteger(value) || value < 1 || value > rippleRoomSizes(game.board)[game.board.rooms[cell]!]!) return game;
  const notes = game.notes.map(list => [...list]);
  const current = new Set(notes[cell]);
  if (current.has(value)) current.delete(value);
  else current.add(value);
  notes[cell] = [...current].sort((a, b) => a - b);
  return { ...game, notes, history: [...game.history, snapshot(game)] };
}

export function undoRipple(game: RippleGame): RippleGame {
  const previous = game.history.at(-1);
  return previous ? { ...game, values: [...previous.values], notes: previous.notes.map(list => [...list]), history: game.history.slice(0, -1) } : game;
}

export function rippleFinished(game: RippleGame): boolean { return checkRipple(game.board, game.values).ok; }

/** Offers a cell only when the current public entries leave one proved completion. */
export function hintRipple(game: RippleGame): { cell: number; value: number } | null {
  const clues = game.values.map((value, cell) => game.board.clues[cell] ?? (value || null));
  const solved = solveRipple({ ...game.board, clues });
  if (!solved.complete || solved.count !== 1 || !solved.solution) return null;
  const cell = solved.solution.findIndex((value, index) => game.values[index] === 0 && value > 0);
  return cell < 0 ? null : { cell, value: solved.solution[cell]! };
}

export function encodeRipple(game: RippleGame): string {
  return JSON.stringify({ version: 1, board: game.board, values: game.values, notes: game.notes, helped: game.helped });
}

export function decodeRipple(code: string): RippleGame | null {
  try {
    if (code.length > 40_000) return null;
    const data = JSON.parse(code);
    if (data.version !== 1 || !isRippleBoard(data.board) || !Array.isArray(data.values)
      || data.values.length !== data.board.rooms.length || !Array.isArray(data.notes)
      || data.notes.length !== data.board.rooms.length || typeof data.helped !== "boolean") return null;
    let game = newRipple(data.board);
    for (let cell = 0; cell < data.values.length; cell += 1) {
      const value = data.values[cell];
      if (game.board.clues[cell] !== null && value !== game.board.clues[cell]) return null;
      if (game.board.clues[cell] === null && value) {
        const next = setRippleValue(game, cell, value);
        if (next === game) return null;
        game = next;
      }
      const list = data.notes[cell];
      if (!Array.isArray(list) || new Set(list).size !== list.length
        || list.some(note => !Number.isInteger(note) || note < 1 || note > rippleRoomSizes(game.board)[game.board.rooms[cell]!]!)) return null;
      for (const note of list) game = toggleRippleNote(game, cell, note);
    }
    return { ...game, history: [], helped: data.helped };
  } catch { return null; }
}

function snapshot(game: RippleGame) {
  return { values: [...game.values], notes: game.notes.map(list => [...list]) };
}
