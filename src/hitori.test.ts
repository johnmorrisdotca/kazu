import { describe, expect, it } from "vitest";
import { checkHitori, isHitoriBoard } from "./hitoriBoard.ts";
import { solveHitori } from "./hitoriSolve.ts";
import { generateHitori } from "./hitoriGenerate.ts";
import { decodeHitori, encodeHitori, hintHitori, newHitori, shadeHitori, undoHitori } from "./hitoriGame.ts";
import { drawHitori } from "./hitoriDraw.ts";

describe("Hitori rules", () => {
  it("checks row and column duplicates, adjacent shades, and connected white cells", () => {
    const numbers = Array.from({ length: 25 }, (_, cell) => cell % 5 + 1);
    const board = { size: 5 as const, numbers };
    const duplicate = [...numbers]; duplicate[1] = duplicate[0]!;
    expect(checkHitori({ ...board, numbers: duplicate }, Array(25).fill(false)).ok).toBe(false);
    const adjacent = Array(25).fill(false); adjacent[0] = adjacent[1] = true;
    expect(checkHitori(board, adjacent).errors).toContain(0);
    const barrier = Array(25).fill(false); for (let x = 0; x < 5; x += 1) barrier[10 + x] = true;
    expect(checkHitori(board, barrier).ok).toBe(false);
  });

  it("rejects malformed boards and reports bounded searches as incomplete", () => {
    expect(isHitoriBoard({ size: 6, numbers: [] } as never)).toBe(false);
    expect(isHitoriBoard({ size: 3, numbers: Array(9).fill(1) } as never)).toBe(false);
    expect(isHitoriBoard({ size: 13, numbers: Array(169).fill(1) } as never)).toBe(false);
    const board = { size: 5 as const, numbers: Array.from({ length: 25 }, (_, cell) => cell % 5 + 1) };
    expect(solveHitori(board, { limit: 2 }).complete).toBe(true);
    // Two answers that no rule can tell apart: a search of one node cannot reach either.
    const twin = { size: 4, numbers: [3, 1, 1, 4, 2, 2, 1, 3, 1, 4, 3, 2, 3, 3, 2, 4] };
    expect(solveHitori(twin, { limit: 10 })).toMatchObject({ count: 2, complete: true });
    expect(solveHitori(twin, { nodes: 1 })).toMatchObject({ count: 0, complete: false });
  });

  it("generates reproducible unique puzzles with varied original layouts at both sizes", () => {
    for (const size of [5, 7] as const) {
      const variants = new Set<string>();
      for (let seed = 1; seed <= 120; seed += 1) {
        const puzzle = generateHitori(size, seed);
        expect(generateHitori(size, seed)).toEqual(puzzle);
        expect(puzzle.solution.some(Boolean)).toBe(true);
        expect(checkHitori(puzzle, puzzle.solution).ok).toBe(true);
        expect(solveHitori(puzzle)).toMatchObject({ count: 1, complete: true });
        variants.add(`${puzzle.numbers.join("")}:${puzzle.solution.map(value => Number(value)).join("")}`);
      }
      expect(variants.size).toBeGreaterThan(60);
    }
  });

  it("does not count unnecessary additional shades as a separate answer", () => {
    const puzzle = generateHitori(5, 3), extra = [...puzzle.solution];
    const cell = extra.findIndex(value => !value); extra[cell] = true;
    expect(checkHitori(puzzle, extra).ok).toBe(true);
    expect(solveHitori(puzzle)).toMatchObject({ count: 1, complete: true });
  });

  it("keeps game state immutable and progress free of the generated answer", () => {
    const puzzle = generateHitori(5, 42), game = newHitori(puzzle), next = shadeHitori(game, 1);
    expect(game.shaded[1]).toBe(false); expect(next.shaded[1]).toBe(true);
    expect(undoHitori(next).shaded[1]).toBe(false);
    expect(encodeHitori(newHitori(puzzle))).not.toContain("solution");
    expect(decodeHitori(encodeHitori(next))?.shaded).toEqual(next.shaded);
    expect(decodeHitori("{")).toBeNull(); expect(hintHitori(game)).not.toBeNull();
  });

  it("draws public clues and localized player marks", () => {
    const puzzle = generateHitori(5, 2);
    const svg = drawHitori(puzzle, { shaded: puzzle.solution, pieces: "tiles", language: "ja" });
    expect(svg).toContain("Hitori"); expect(svg).not.toContain("solution");
  });
});
