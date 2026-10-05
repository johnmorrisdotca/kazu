import { describe, expect, it } from "vitest";
import { checkRipple, isRippleBoard, progressRipple } from "./rippleBoard.ts";
import { solveRipple } from "./rippleSolve.ts";
import { generateRipple } from "./rippleGenerate.ts";
import { decodeRipple, encodeRipple, hintRipple, newRipple, rippleFinished, setRippleValue, toggleRippleNote, undoRipple } from "./rippleGame.ts";
import { drawRipple } from "./rippleDraw.ts";

describe("Ripple Effect rooms and spacing", () => {
  it("requires room values 1 through room size exactly once", () => {
    const puzzle = generateRipple(9, 9, 7);
    expect(checkRipple(puzzle, puzzle.solution).ok).toBe(true);
    const values = [...puzzle.solution];
    const room = puzzle.rooms[0]!;
    const cells = puzzle.rooms.flatMap((id, cell) => id === room ? [cell] : []);
    [values[cells[0]!], values[cells[1]!]] = [values[cells[1]!]!, values[cells[0]!]!];
    expect(checkRipple(puzzle, values).ok).toBe(false);
    expect(isRippleBoard({ ...puzzle, rooms: Array(81).fill(0) })).toBe(true);
    expect(isRippleBoard({ ...puzzle, rooms: [1, ...Array(80).fill(1)] })).toBe(false);
  });

  it("uses at least N intervening cells for a repeated N, including the off-by-one boundary", () => {
    const rooms = Array.from({ length: 81 }, (_, cell) => Math.floor(Math.floor(cell / 9) / 3) * 3 + Math.floor(cell % 9 / 3));
    const board = { width: 9, height: 9, rooms, clues: Array(81).fill(null) };
    const values = Array(81).fill(0);
    values[2] = 1; values[3] = 1;
    expect(progressRipple(board, values).errors).toEqual([2, 3]);
    values.fill(0); values[1] = 1; values[3] = 1;
    expect(progressRipple(board, values).errors).toEqual([]);
    expect(progressRipple(board, values).ok).toBe(true);
    values.fill(0); values[0] = 3; values[3] = 3;
    expect(progressRipple(board, values).errors).toEqual([0, 3]);
    values.fill(0); values[0] = 3; values[4] = 3;
    expect(progressRipple(board, values).errors).toEqual([]);
  });

  it("distinguishes one solution, multiple solutions, and a stopped search", () => {
    const values = Array.from({ length: 81 }, (_, cell) => cell + 1);
    const single = { width: 9, height: 9, rooms: Array(81).fill(0), clues: values.map(value => value === 81 ? null : value) };
    expect(solveRipple(single)).toMatchObject({ count: 1, complete: true });
    const pair = { ...single, clues: values.map(value => value > 79 ? null : value) };
    expect(solveRipple(pair)).toMatchObject({ count: 2, complete: false });
    expect(solveRipple(single, { nodes: 1 })).toMatchObject({ count: 0, complete: false });
    expect(() => solveRipple(single, { limit: 0 })).toThrow(RangeError);
  });

  it("makes deterministic unique puzzles with a substantial solving field", () => {
    for (const seed of [1, 7, 42]) {
      const puzzle = generateRipple(9, 9, seed);
      expect(puzzle).toEqual(generateRipple(9, 9, seed));
      if (seed === 42) {
        expect(puzzle.clues.length).toBe(81);
        expect(puzzle.clues.slice(0, 18)).toEqual([4, null, 7, 9, 2, null, 5, null, 3, null, null, 3, 6, 7, 4, 8, 9, 2]);
        expect(puzzle.clues.filter(clue => clue !== null)).toHaveLength(46);
      }
      expect(puzzle.clues.filter(clue => clue !== null).length).toBeLessThan(59);
      expect(puzzle.clues.filter(clue => clue === null).length).toBeGreaterThan(20);
      expect(checkRipple(puzzle, puzzle.solution).ok).toBe(true);
      expect(solveRipple(puzzle)).toMatchObject({ count: 1, complete: true });
    }
    expect(() => generateRipple(7, 7, 1)).toThrow(RangeError);
  });

  it("keeps play immutable, pencil entries reversible and saves public state only", () => {
    const puzzle = generateRipple(9, 9, 5), game = newRipple(puzzle), hint = hintRipple(game);
    expect(hint).not.toBeNull();
    const noted = toggleRippleNote(game, hint!.cell, hint!.value);
    expect(game.notes[hint!.cell]).toEqual([]);
    expect(noted.notes[hint!.cell]).toContain(hint!.value);
    expect(undoRipple(noted).notes[hint!.cell]).toEqual([]);
    const filled = setRippleValue(game, hint!.cell, hint!.value);
    expect(filled.values[hint!.cell]).toBe(hint!.value);
    expect(decodeRipple(encodeRipple(filled))?.values).toEqual(filled.values);
    expect(encodeRipple(filled)).not.toContain("solution");
    expect(decodeRipple(JSON.stringify({ version: 1, board: puzzle, values: [], notes: [], helped: false }))).toBeNull();
    expect(rippleFinished(newRipple({ ...puzzle, clues: puzzle.solution }))).toBe(true);
  });

  it("draws room walls, entries and pencil marks with each palette", () => {
    const puzzle = generateRipple(9, 9, 3);
    for (const material of ["ivory", "wood", "slate"] as const) {
      const svg = drawRipple(puzzle, { material, pieces: "tiles", language: "ja", values: puzzle.solution });
      expect(svg).toContain("Ripple Effect");
      expect(svg).toContain("<path");
      expect(svg).toContain("<text");
    }
  });
});
