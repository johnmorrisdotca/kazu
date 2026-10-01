import { describe, expect, it } from "vitest";

import { generateKazu } from "./generate.ts";
import { KAZU_KINDS, KAZU_SPECS } from "./kinds.ts";
import { countKazuSolutions, kazuGuessDepth, solveKazu } from "./solve.ts";

describe("solving", () => {
  it("counts a puzzle with the one answer as 1, and an emptied one as more than one", () => {
    for (const kind of KAZU_KINDS) {
      const size = KAZU_SPECS[kind].sizes[0]!;
      const puzzle = generateKazu(kind, size, "medium", 4);
      expect(countKazuSolutions(kind, size, puzzle.givens)).toBe(1);
    }
    // A Sudoku with nothing printed has many answers, and the count stops at the limit it was given.
    expect(countKazuSolutions("number-place", 4, ".".repeat(16))).toBe(2);
    expect(countKazuSolutions("number-place", 4, ".".repeat(16), 5)).toBe(5);
  });

  it("counts none for a grid that cannot be finished", () => {
    expect(countKazuSolutions("number-place", 4, "11" + ".".repeat(14))).toBe(0);
    expect(solveKazu("number-place", 4, "11" + ".".repeat(14))).toBeNull();
  });

  it("says null, never a number, for givens that are not a puzzle", () => {
    expect(countKazuSolutions("number-place", 9, "not a grid")).toBeNull();
    expect(countKazuSolutions("jigsaw", 7, ".".repeat(49))).toBeNull();
    expect(solveKazu("towers", 5, "")).toBeNull();
    expect(kazuGuessDepth("sum-cages", 6, "x")).toBeNull();
  });

  it("says null when the search runs past its budget, which is not the same as none", () => {
    expect(countKazuSolutions("number-place", 9, ".".repeat(81), 2, 3)).toBeNull();
    expect(solveKazu("number-place", 9, ".".repeat(81), 3)).toBeNull();
  });

  it("gives back no answer for a puzzle that has more than one", () => {
    expect(solveKazu("number-place", 4, ".".repeat(16))).toBeNull();
    expect(solveKazu("more-or-less", 4, ".".repeat(16) + ".".repeat(24))).toBeNull();
  });

  it("measures a hard puzzle as asking for at least a guess, and an easy one for none", () => {
    expect(kazuGuessDepth("number-place", 9, generateKazu("number-place", 9, "easy", 9).givens)).toBe(0);
    const hard = [1, 2, 3, 4, 5, 6].map((seed) => kazuGuessDepth("number-place", 9, generateKazu("number-place", 9, "hard", seed).givens)!);
    expect(Math.max(...hard)).toBeGreaterThanOrEqual(1);
  });
});
