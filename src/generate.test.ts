import { describe, expect, it } from "vitest";

import { checkKazu } from "./check.ts";
import { decodeCells } from "./cells.ts";
import { generateKazu } from "./generate.ts";
import { KAZU_KINDS, KAZU_LEVELS, KAZU_SPECS, type KazuKind } from "./kinds.ts";
import { countKazuSolutions, kazuGuessDepth, solveKazu } from "./solve.ts";
import { readGivens } from "./givens.ts";

/**
 * A puzzle is a puzzle: one answer, reachable by the level's reasoning, made the same way from the same
 * seed every time. Asked of every puzzle at every size and every level it offers.
 */
describe("generating", () => {
  for (const kind of KAZU_KINDS) {
    for (const size of KAZU_SPECS[kind].sizes) {
      for (const level of KAZU_LEVELS) {
        it(`${kind} ${size}×${size} ${level} has exactly one answer, which is the solution, and the answer solves it`, () => {
          for (const seed of [1, 2, 3, 4, 5]) {
            const puzzle = generateKazu(kind, size, level, seed);
            expect(puzzle).toMatchObject({ kind, size, level, seed });
            expect(countKazuSolutions(kind, size, puzzle.givens)).toBe(1);
            expect(solveKazu(kind, size, puzzle.givens)).toBe(puzzle.solution);
            expect(checkKazu(kind, size, puzzle.givens, puzzle.solution)).toEqual({ ok: true });
            expect(decodeCells(puzzle.solution, size)).not.toBeNull();
            expect(puzzle.solution).not.toContain(".");
            expect(readGivens(kind, size, puzzle.givens)).not.toBeNull();
            // The level is what the solver needed: easy yields to singles alone, medium to one guess, and hard to whatever it
            // takes (so it is not measured). Sum Cages' levels are how big its cages are, so it is only asked to be finite.
            if (level === "hard") continue;
            const depth = kazuGuessDepth(kind, size, puzzle.givens)!;
            expect(depth).toBeLessThanOrEqual(kind === "sum-cages" ? Number.MAX_SAFE_INTEGER : level === "easy" ? 0 : 1);
          }
        }, 120_000);
      }
    }
  }

  it("makes the same puzzle from the same seed, and another from another", () => {
    for (const kind of KAZU_KINDS) {
      const size = KAZU_SPECS[kind].defaultSize;
      const a = generateKazu(kind, size, "medium", 11);
      expect(generateKazu(kind, size, "medium", 11)).toEqual(a);
      expect(generateKazu(kind, size, "medium", 12).solution).not.toBe(a.solution);
    }
  });

  it("gives a hard Sudoku fewer givens than an easy one", () => {
    const count = (code: string) => [...code].filter((c) => c !== ".").length;
    for (const size of KAZU_SPECS["number-place"].sizes) {
      expect(count(generateKazu("number-place", size, "hard", 7).givens)).toBeLessThan(count(generateKazu("number-place", size, "easy", 7).givens));
    }
  });

  it("makes a 6×6 Sudoku with boxes two rows tall and three wide", () => {
    const puzzle = generateKazu("number-place", 6, "easy", 3);
    const solution = decodeCells(puzzle.solution, 6)!;
    for (const box of [0, 1, 2, 3, 4, 5]) {
      const cells = solution.filter((_, index) => Math.floor(Math.floor(index / 6) / 2) * 2 + Math.floor((index % 6) / 3) === box);
      expect(new Set(cells).size).toBe(6);
    }
  });

  it("keeps the diagonals of a Diagonal Sudoku, which a plain grid does not", () => {
    for (const seed of [1, 2, 3]) {
      const solution = decodeCells(generateKazu("diagonal", 9, "medium", seed).solution, 9)!;
      expect(new Set(Array.from({ length: 9 }, (_, i) => solution[i * 9 + i])).size).toBe(9);
      expect(new Set(Array.from({ length: 9 }, (_, i) => solution[i * 9 + 8 - i])).size).toBe(9);
    }
  });

  it("prints next to nothing for Sum Cages, whose cages add to what they say", () => {
    const puzzle = generateKazu("sum-cages", 9, "medium", 5);
    const read = readGivens("sum-cages", 9, puzzle.givens)!;
    const solution = decodeCells(puzzle.solution, 9)!;
    for (const cage of read.cages!) expect(cage.cells.reduce((total, index) => total + solution[index]!, 0)).toBe(cage.sum);
    expect(read.cells.filter((value) => value !== 0).length).toBeLessThan(10);
    expect(read.cages!.reduce((count, cage) => count + cage.cells.length, 0)).toBe(81);
  });

  it("draws a Jigsaw's regions as joined shapes of the side's own size, none a row or a column", () => {
    for (const size of KAZU_SPECS.jigsaw.sizes) {
      const regions = readGivens("jigsaw", size, generateKazu("jigsaw", size, "easy", 2).givens)!.regions!;
      for (let region = 0; region < size; region += 1) {
        const cells = regions.flatMap((value, index) => (value === region ? [index] : []));
        expect(cells).toHaveLength(size);
        expect(new Set(cells.map((index) => Math.floor(index / size))).size).toBeGreaterThan(1);
        expect(new Set(cells.map((index) => index % size)).size).toBeGreaterThan(1);
      }
    }
  });

  it("refuses a kind, size, level or seed it does not make, rather than making something else", () => {
    expect(() => generateKazu("sudoku" as KazuKind, 9, "easy", 1)).toThrow(RangeError);
    expect(() => generateKazu("number-place", 8, "easy", 1)).toThrow(/8×8/);
    expect(() => generateKazu("number-place", 9, "extreme" as "easy", 1)).toThrow(RangeError);
    for (const seed of [0, -1, 1.5, 2 ** 31, Number.NaN, "7" as unknown as number]) expect(() => generateKazu("number-place", 9, "easy", seed)).toThrow(RangeError);
  });
});
