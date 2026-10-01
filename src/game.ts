import { encodeCells } from "./cells.ts";
import { checkKazu } from "./check.ts";
import { conflictsOf } from "./conflicts.ts";
import { layoutOfGivens, readGivens, type KazuGivens } from "./givens.ts";
import type { KazuKind } from "./kinds.ts";

/**
 * A PUZZLE IN PLAY, as pure functions: what has been written, the pencil marks, and how to take a
 * step back. Every function returns a new game and leaves the one it was given as it was, so a page
 * can keep them as its history, and a server can replay a solve with no page at all. `mountKazu`
 * is these functions with a drawing and a finger on them.
 */
export type KazuGame = {
  kind: KazuKind;
  size: number;
  /** The puzzle's givens code, as made. */
  givens: string;
  /** What the puzzle was printed with. */
  printed: KazuGivens;
  /** What the player has written, row-major, 0 where nothing; always 0 on a printed cell. */
  entries: readonly number[];
  /** Pencil marks, a bit mask a cell: bit `v` is the note `v`. Always 0 on a printed cell or a cell with a number in it. */
  notes: readonly number[];
  /** The grids before this one, newest last, for Undo. */
  past: readonly { entries: readonly number[]; notes: readonly number[] }[];
};

export type KazuGameOptions = {
  /** Entries to start from: a run kept half done (`decodeRun`). Printed cells are ignored. */
  entries?: readonly number[];
  /** Pencil marks to start from (`decodeNotes`). */
  notes?: readonly number[];
};

/** The most steps Undo goes back. */
const UNDO_MOST = 1000;

/** A game of a puzzle, or null for givens that are not a puzzle of that kind and side. */
export function newKazuGame(kind: KazuKind, size: number, givens: string, options: KazuGameOptions = {}): KazuGame | null {
  const printed = readGivens(kind, size, givens);
  if (printed === null) return null;
  const area = size * size;
  const entries = Array.from({ length: area }, (_, i) => (printed.cells[i] !== 0 ? 0 : (options.entries?.[i] ?? 0)));
  const notes = Array.from({ length: area }, (_, i) => (printed.cells[i] !== 0 || entries[i] !== 0 ? 0 : (options.notes?.[i] ?? 0)));
  return { kind, size, givens, printed, entries, notes, past: [] };
}

/** The whole grid as it stands: the printed numbers, and the player's where nothing is printed. */
export function valuesOf(game: KazuGame): number[] {
  return game.printed.cells.map((printed, index) => (printed !== 0 ? printed : game.entries[index]!));
}

/** Whether a cell was printed with its number: it never changes. */
export function isPrinted(game: KazuGame, cell: number): boolean {
  return game.printed.cells[cell] !== 0;
}

function remembered(game: KazuGame, entries: readonly number[], notes: readonly number[]): KazuGame {
  const past = [...game.past, { entries: game.entries, notes: game.notes }].slice(-UNDO_MOST);
  return { ...game, entries, notes, past };
}

/** The cells a cell shares a row, column, box, region, diagonal or cage with: where a number written in it takes that number out of the notes. */
function peersOf(game: KazuGame, cell: number): Set<number> {
  const { size } = game;
  const layout = layoutOfGivens(game.printed);
  const peers = new Set<number>();
  if (layout !== null) for (const group of layout.groupsOf[cell]!) for (const index of layout.groups[group]!) peers.add(index);
  else {
    const row = Math.floor(cell / size);
    const col = cell % size;
    for (let k = 0; k < size; k += 1) {
      peers.add(row * size + k);
      peers.add(k * size + col);
    }
  }
  peers.delete(cell);
  return peers;
}

/**
 * Write a number into a cell (0 empties it). Its own pencil marks go, and with `tidy` (the default)
 * the number comes out of the pencil marks of every cell that shares a group with it, as a person
 * with a pencil would rub it out. Nothing happens to a printed cell, or when the cell already holds
 * that number.
 */
export function enterNumber(game: KazuGame, cell: number, value: number, tidy = true): KazuGame {
  if (cell < 0 || cell >= game.size * game.size || isPrinted(game, cell) || !Number.isInteger(value) || value < 0 || value > game.size) return game;
  if (game.entries[cell] === value && (value !== 0 || game.notes[cell] === 0)) return game;
  const entries = [...game.entries];
  entries[cell] = value;
  const notes = [...game.notes];
  notes[cell] = 0;
  if (tidy && value !== 0) for (const peer of peersOf(game, cell)) notes[peer]! &= ~(1 << value);
  return remembered(game, entries, notes);
}

/** Turn the pencil mark `value` on or off in a cell. Nothing happens to a printed cell or a cell that holds a number. */
export function toggleNote(game: KazuGame, cell: number, value: number): KazuGame {
  if (cell < 0 || cell >= game.size * game.size || isPrinted(game, cell) || game.entries[cell] !== 0 || !Number.isInteger(value) || value < 1 || value > game.size) return game;
  const notes = [...game.notes];
  notes[cell]! ^= 1 << value;
  return remembered(game, game.entries, notes);
}

/** Empty a cell of its number and its pencil marks. */
export function clearCell(game: KazuGame, cell: number): KazuGame {
  if (cell < 0 || cell >= game.size * game.size || isPrinted(game, cell) || (game.entries[cell] === 0 && game.notes[cell] === 0)) return game;
  const entries = [...game.entries];
  const notes = [...game.notes];
  entries[cell] = 0;
  notes[cell] = 0;
  return remembered(game, entries, notes);
}

/** Take back the last change. The same game when there is nothing to take back. */
export function undoKazu(game: KazuGame): KazuGame {
  const last = game.past.at(-1);
  return last === undefined ? game : { ...game, entries: last.entries, notes: last.notes, past: game.past.slice(0, -1) };
}

/** Start again: every entry and pencil mark gone, and nothing to undo. */
export function restartKazu(game: KazuGame): KazuGame {
  return { ...game, entries: game.entries.map(() => 0), notes: game.notes.map(() => 0), past: [] };
}

/** How far along it is: cells with a number (printed or written) out of all of them. */
export function kazuProgress(game: KazuGame): { filled: number; total: number } {
  const values = valuesOf(game);
  return { filled: values.filter((value) => value !== 0).length, total: values.length };
}

/** The whole grid as a cells code: what `checkKazu` takes as an answer. */
export function answerOf(game: KazuGame): string {
  return encodeCells(valuesOf(game));
}

/** Whether the grid is full and right, by the rules alone (`checkKazu`): every puzzle has exactly one answer, so a grid that keeps every rule IS that answer. */
export function isSolved(game: KazuGame): boolean {
  return kazuProgress(game).filled === game.size * game.size && checkKazu(game.kind, game.size, game.givens, answerOf(game)).ok;
}

/** The cells that break a rule now (`conflictsOf`). */
export function gameConflicts(game: KazuGame): number[] {
  return conflictsOf(game.printed, valuesOf(game));
}

/** The numbers 1 up to the side, each with how many of it are on the grid: a pad greys a number that is all placed. */
export function numberCounts(game: KazuGame): number[] {
  const counts = new Array<number>(game.size + 1).fill(0);
  for (const value of valuesOf(game)) if (value !== 0) counts[value]! += 1;
  return counts;
}
