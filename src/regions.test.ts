import { describe, expect, it } from "vitest";
import { checkRegions, isRegionsBoard } from "./regions-board.ts";
import { decodeRegionsGame, encodeRegionsGame, newRegions, setRegionsCell, undoRegions } from "./regions-game.ts";
import { generateRegions } from "./regions-generate.ts";
import { solveRegions } from "./regions-solve.ts";

describe("Regions region rules", () => {
  it("accepts two separated area-two regions and a clue-free area-five region", () => {
    const solution = [2, 2, 5, 5, 5, 5, 2, 2, 5];
    const board = { width: 3, height: 3, givens: [2, 0, 0, 0, 0, 0, 0, 0, 0] };
    expect(checkRegions(board, solution)).toMatchObject({ ok: true, complete: true, regions: 3 });
    expect(solveRegions(board, solution)).toMatchObject({ count: 1, complete: true });
  });

  it("rejects a connected same-number group larger than its number", () => {
    const board = { width: 2, height: 2, givens: [2, 0, 0, 0] };
    const checked = checkRegions(board, [2, 2, 2, 2]);
    expect(checked.ok).toBe(false);
    expect(checked.errors).toEqual([0, 1, 2, 3]);
  });

  it("keeps disconnected same-number regions separate and requires exact area at completion", () => {
    const board = { width: 3, height: 3, givens: Array(9).fill(0) };
    const almost = [2, 2, 5, 5, 5, 5, 2, 2, 0];
    expect(checkRegions(board, almost)).toMatchObject({ ok: false, complete: false, regions: 3 });
    expect(checkRegions(board, [2, 2, 5, 5, 5, 5, 2, 2, 5]).ok).toBe(true);
  });

  it("rejects malformed boards and distinguishes bounded search from a proof", () => {
    expect(isRegionsBoard({ width: 2, height: 2, givens: [2] })).toBe(false);
    const board = { width: 2, height: 2, givens: [0, 0, 0, 0] };
    const bounded = solveRegions(board, board.givens, { nodes: 1 });
    expect(bounded).toMatchObject({ complete: false, count: 0, nodes: 1 });
  });
});

describe("Regions immutable play state", () => {
  it("keeps public clues fixed, supports undo, and restores only puzzle progress", () => {
    const board = { width: 3, height: 3, givens: [2, 0, 0, 0, 0, 0, 0, 0, 0] };
    const initial = newRegions(board);
    const next = setRegionsCell(initial, 1, 2);
    expect(next.entries[0]).toBe(2);
    expect(setRegionsCell(next, 0, 5)).toBe(next);
    expect(undoRegions(next).entries).toEqual(initial.entries);
    const saved = decodeRegionsGame(encodeRegionsGame({ ...next, helped: true }));
    expect(saved?.entries).toEqual(next.entries);
    expect(saved?.helped).toBe(true);
    expect(JSON.stringify(saved)).not.toContain("solution");
  });
});

describe("seeded original Regions generation", () => {
  it("repeats the same puzzle and proves its answer independently", () => {
    const first = generateRegions(5, 5, "easy", 17);
    const second = generateRegions(5, 5, "easy", 17);
    expect(first).toEqual(second);
    expect(first.givens.filter(Boolean).length).toBeLessThan(first.givens.length);
    expect(checkRegions(first, first.solution).ok).toBe(true);
    expect(solveRegions(first, first.givens)).toMatchObject({ count: 1, complete: true });
  });

  it("proves seeded wide and tall layouts as well", () => {
    for (const [width, height, seed] of [[6, 4, 2], [4, 6, 17]] as const) {
      const puzzle = generateRegions(width, height, "easy", seed);
      expect(checkRegions(puzzle, puzzle.solution).ok).toBe(true);
      expect(solveRegions(puzzle, puzzle.givens)).toMatchObject({ count: 1, complete: true });
    }
  });

  it("keeps historically ambiguous clue profiles usable by retaining more clues as needed", () => {
    for (const level of ["easy", "medium", "hard"] as const) {
      const puzzle = generateRegions(5, 5, level, 1);
      expect(checkRegions(puzzle, puzzle.solution).ok).toBe(true);
      expect(solveRegions(puzzle)).toMatchObject({ count: 1, complete: true });
      expect(puzzle.givens.filter(Boolean).length).toBeLessThan(puzzle.givens.length);
    }
  });

  it("rejects boards smaller or larger than the generator is built for, and unknown levels", () => {
    expect(() => generateRegions(3, 5, "easy", 1)).toThrow(RangeError);
    expect(() => generateRegions(13, 5, "easy", 1)).toThrow(RangeError);
    expect(() => generateRegions(6, 6, "impossible" as never, 1)).toThrow(RangeError);
  });
});
