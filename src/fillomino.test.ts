import { describe, expect, it } from "vitest";
import { checkFillomino, isFillominoBoard } from "./fillominoBoard.ts";
import { decodeFillomino, encodeFillomino, newFillomino, setFillominoCell, undoFillomino } from "./fillominoGame.ts";
import { generateFillomino } from "./fillominoGenerate.ts";
import { solveFillomino } from "./fillominoSolve.ts";

describe("Fillomino region rules", () => {
  it("accepts two separated area-two regions and a clue-free area-five region", () => {
    const solution = [2, 2, 5, 5, 5, 5, 2, 2, 5];
    const board = { width: 3, height: 3, givens: [2, 0, 0, 0, 0, 0, 0, 0, 0] };
    expect(checkFillomino(board, solution)).toMatchObject({ ok: true, complete: true, regions: 3 });
    expect(solveFillomino(board, solution)).toMatchObject({ count: 1, complete: true });
  });

  it("rejects a connected same-number group larger than its number", () => {
    const board = { width: 2, height: 2, givens: [2, 0, 0, 0] };
    const checked = checkFillomino(board, [2, 2, 2, 2]);
    expect(checked.ok).toBe(false);
    expect(checked.errors).toEqual([0, 1, 2, 3]);
  });

  it("keeps disconnected same-number regions separate and requires exact area at completion", () => {
    const board = { width: 3, height: 3, givens: Array(9).fill(0) };
    const almost = [2, 2, 5, 5, 5, 5, 2, 2, 0];
    expect(checkFillomino(board, almost)).toMatchObject({ ok: false, complete: false, regions: 3 });
    expect(checkFillomino(board, [2, 2, 5, 5, 5, 5, 2, 2, 5]).ok).toBe(true);
  });

  it("rejects malformed boards and distinguishes bounded search from a proof", () => {
    expect(isFillominoBoard({ width: 2, height: 2, givens: [2] })).toBe(false);
    const board = { width: 2, height: 2, givens: [0, 0, 0, 0] };
    const bounded = solveFillomino(board, board.givens, { nodes: 1 });
    expect(bounded).toMatchObject({ complete: false, count: 0, nodes: 1 });
  });
});

describe("Fillomino immutable play state", () => {
  it("keeps public clues fixed, supports undo, and restores only puzzle progress", () => {
    const board = { width: 3, height: 3, givens: [2, 0, 0, 0, 0, 0, 0, 0, 0] };
    const initial = newFillomino(board);
    const next = setFillominoCell(initial, 1, 2);
    expect(next.entries[0]).toBe(2);
    expect(setFillominoCell(next, 0, 5)).toBe(next);
    expect(undoFillomino(next).entries).toEqual(initial.entries);
    const saved = decodeFillomino(encodeFillomino({ ...next, helped: true }));
    expect(saved?.entries).toEqual(next.entries);
    expect(saved?.helped).toBe(true);
    expect(JSON.stringify(saved)).not.toContain("solution");
  });
});

describe("seeded original Fillomino generation", () => {
  it("repeats the same puzzle and proves its answer independently", () => {
    const first = generateFillomino(5, 5, "easy", 17);
    const second = generateFillomino(5, 5, "easy", 17);
    expect(first).toEqual(second);
    expect(first.givens.filter(Boolean).length).toBeLessThan(first.givens.length);
    expect(checkFillomino(first, first.solution).ok).toBe(true);
    expect(solveFillomino(first, first.givens)).toMatchObject({ count: 1, complete: true });
  });

  it("proves seeded wide and tall layouts as well", () => {
    for (const [width, height, seed] of [[6, 4, 2], [4, 6, 17]] as const) {
      const puzzle = generateFillomino(width, height, "easy", seed);
      expect(checkFillomino(puzzle, puzzle.solution).ok).toBe(true);
      expect(solveFillomino(puzzle, puzzle.givens)).toMatchObject({ count: 1, complete: true });
    }
  });

  it("keeps historically ambiguous clue profiles usable by retaining more clues as needed", () => {
    for (const level of ["easy", "medium", "hard"] as const) {
      const puzzle = generateFillomino(5, 5, level, 1);
      expect(checkFillomino(puzzle, puzzle.solution).ok).toBe(true);
      expect(solveFillomino(puzzle)).toMatchObject({ count: 1, complete: true });
      expect(puzzle.givens.filter(Boolean).length).toBeLessThan(puzzle.givens.length);
    }
  });

  it("rejects generator areas above its documented proof bound", () => {
    expect(() => generateFillomino(7, 7, "easy", 1)).toThrow(RangeError);
  });
});
