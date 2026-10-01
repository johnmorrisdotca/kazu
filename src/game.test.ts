import { describe, expect, it } from "vitest";

import { decodeCells } from "./cells.ts";
import { answerOf, clearCell, enterNumber, gameConflicts, isPrinted, isSolved, kazuProgress, newKazuGame, numberCounts, restartKazu, toggleNote, undoKazu, valuesOf } from "./game.ts";
import { notesOf } from "./progress.ts";
import { generateKazu } from "./generate.ts";

const puzzle = generateKazu("number-place", 9, "easy", 3);
const solution = decodeCells(puzzle.solution, 9)!;
const fresh = () => newKazuGame("number-place", 9, puzzle.givens)!;
const empty = (game: ReturnType<typeof fresh>) => game.entries.findIndex((_, index) => !isPrinted(game, index));

describe("a game in play", () => {
  it("starts with nothing written, and says null for givens that are not a puzzle", () => {
    const game = fresh();
    expect(game.entries.every((value) => value === 0)).toBe(true);
    expect(kazuProgress(game).filled).toBe(game.printed.cells.filter((value) => value !== 0).length);
    expect(newKazuGame("number-place", 9, "nonsense")).toBeNull();
  });

  it("writes a number, leaves the game it was given as it was, and never touches a printed cell", () => {
    const game = fresh();
    const cell = empty(game);
    const next = enterNumber(game, cell, solution[cell]!);
    expect(next.entries[cell]).toBe(solution[cell]);
    expect(game.entries[cell]).toBe(0);
    const printed = game.printed.cells.findIndex((value) => value !== 0);
    expect(enterNumber(game, printed, 1)).toBe(game);
    expect(valuesOf(next)[printed]).toBe(game.printed.cells[printed]);
    expect(enterNumber(game, cell, 10)).toBe(game);
    expect(enterNumber(game, cell, -1)).toBe(game);
    expect(enterNumber(game, cell, 1.5)).toBe(game);
    expect(enterNumber(next, cell, solution[cell]!)).toBe(next);
  });

  it("takes a written number out of the pencil marks of the cells that share a group with it, and clears its own", () => {
    let game = fresh();
    const cell = empty(game);
    const row = Math.floor(cell / 9);
    const peer = game.printed.cells.findIndex((value, index) => value === 0 && index !== cell && Math.floor(index / 9) === row);
    const elsewhere = game.printed.cells.findIndex((value, index) => value === 0 && Math.floor(index / 9) !== row && index % 9 !== cell % 9 && Math.floor(index / 27) !== Math.floor(cell / 27));
    game = toggleNote(toggleNote(toggleNote(game, cell, 4), peer, 4), elsewhere, 4);
    game = toggleNote(game, peer, 5);
    expect(notesOf(game.notes[peer]!)).toEqual([4, 5]);
    const next = enterNumber(game, cell, 4);
    expect(next.notes[cell]).toBe(0);
    expect(notesOf(next.notes[peer]!)).toEqual([5]);
    expect(notesOf(next.notes[elsewhere]!)).toEqual([4]);
    expect(notesOf(enterNumber(game, cell, 4, false).notes[peer]!)).toEqual([4, 5]);
  });

  it("toggles a pencil mark on and off, and refuses one on a printed cell or a cell with a number in it", () => {
    let game = fresh();
    const cell = empty(game);
    game = toggleNote(game, cell, 7);
    expect(notesOf(game.notes[cell]!)).toEqual([7]);
    game = toggleNote(game, cell, 2);
    expect(notesOf(game.notes[cell]!)).toEqual([2, 7]);
    game = toggleNote(game, cell, 7);
    expect(notesOf(game.notes[cell]!)).toEqual([2]);
    const printed = game.printed.cells.findIndex((value) => value !== 0);
    expect(toggleNote(game, printed, 1)).toBe(game);
    expect(toggleNote(game, cell, 0)).toBe(game);
    expect(toggleNote(game, cell, 10)).toBe(game);
    expect(toggleNote(enterNumber(game, cell, 5), cell, 3).notes[cell]).toBe(0);
  });

  it("undoes step by step back to the start, and restarts from nothing", () => {
    let game = fresh();
    const cell = empty(game);
    const a = enterNumber(game, cell, 3);
    const b = toggleNote(a, cell + 1 === cell ? cell : game.entries.findIndex((_, i) => i > cell && !isPrinted(game, i)), 5);
    const c = clearCell(b, cell);
    expect(undoKazu(c).entries).toEqual(b.entries);
    expect(undoKazu(undoKazu(c)).entries).toEqual(a.entries);
    expect(undoKazu(undoKazu(undoKazu(c))).entries).toEqual(game.entries);
    expect(undoKazu(game)).toBe(game);
    expect(restartKazu(c).entries.every((value) => value === 0)).toBe(true);
    expect(restartKazu(c).past).toEqual([]);
    game = c;
    expect(game.past).toHaveLength(3);
  });

  it("is solved when the grid is full and right, by the rules alone, and not before", () => {
    let game = fresh();
    for (let cell = 0; cell < 81; cell += 1) {
      // Not solved while any cell that was not printed is still to write.
      expect(isSolved(game)).toBe(game.entries.every((value, index) => isPrinted(game, index) || value !== 0));
      game = enterNumber(game, cell, solution[cell]!);
    }
    expect(isSolved(game)).toBe(true);
    expect(isSolved(fresh())).toBe(false);
    expect(answerOf(game)).toBe(puzzle.solution);
    expect(kazuProgress(game)).toEqual({ filled: 81, total: 81 });
    const wrong = enterNumber(game, empty(game), solution[empty(game)] === 1 ? 2 : 1);
    expect(isSolved(wrong)).toBe(false);
    expect(gameConflicts(wrong).length).toBeGreaterThan(0);
  });

  it("counts how many of each number are on the grid, so a pad can grey the ones all placed", () => {
    let game = fresh();
    for (let cell = 0; cell < 81; cell += 1) game = enterNumber(game, cell, solution[cell]!);
    expect(numberCounts(game).slice(1)).toEqual(new Array(9).fill(9));
  });

  it("starts from a run kept half done, ignoring what it says on a printed cell", () => {
    const printed = fresh().printed.cells;
    const entries = solution.map((value) => value);
    const game = newKazuGame("number-place", 9, puzzle.givens, { entries })!;
    expect(isSolved(game)).toBe(true);
    expect(game.entries.every((value, index) => (printed[index] !== 0 ? value === 0 : value === solution[index]))).toBe(true);
  });
});
