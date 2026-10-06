// The 25×25 Sudoku ("Colossus"): five-by-five boxes, symbols 1 to 9 and A to P, one answer, made in a browser's time.
import { describe, expect, it, vi } from "vitest";

import { decodeCells } from "./cells.ts";
import { checkKazu } from "./check.ts";
import { generateKazu } from "./generate.ts";
import { boxOf, KAZU_BOXES } from "./layout.ts";
import { KAZU_LEVELS, KAZU_SPECS } from "./kinds.ts";
import { countKazuSolutions, kazuGuessDepth, solveKazu } from "./solve.ts";

vi.setConfig({ testTimeout: 120_000 });

const given = (code: string): number => [...code].filter((c) => c !== ".").length;

describe("the 25×25 Sudoku", () => {
  it("is offered with five-by-five boxes and room for 625 characters", () => {
    expect(KAZU_SPECS["number-place"].sizes).toEqual([4, 6, 9, 16, 25]);
    expect(KAZU_SPECS["number-place"].mostCells).toBe(625);
    expect(KAZU_BOXES[25]).toEqual({ rows: 5, cols: 5 });
    expect(boxOf(25, 0)).toBe(0);
    expect(boxOf(25, 24)).toBe(4);
    expect(boxOf(25, 5 * 25)).toBe(5);
    expect(boxOf(25, 624)).toBe(24);
  });

  for (const level of KAZU_LEVELS) {
    it(`${level}: has exactly one answer, found by reasoning no deeper than the level, and uses A to P`, () => {
      for (const seed of [1, 2, 3, 4]) {
        const puzzle = generateKazu("number-place", 25, level, seed);
        expect(puzzle).toMatchObject({ kind: "number-place", size: 25, level, seed });
        expect(puzzle.givens).toHaveLength(625);
        expect(countKazuSolutions("number-place", 25, puzzle.givens)).toBe(1);
        expect(solveKazu("number-place", 25, puzzle.givens)).toBe(puzzle.solution);
        expect(checkKazu("number-place", 25, puzzle.givens, puzzle.solution)).toEqual({ ok: true });
        const solution = decodeCells(puzzle.solution, 25)!;
        expect(new Set(solution).size).toBe(25);
        expect(puzzle.solution).toMatch(/P/);
        expect(puzzle.solution).not.toContain(".");
        // Every printed number is the solution's.
        [...puzzle.givens].forEach((c, at) => c === "." || expect(c).toBe(puzzle.solution[at]));
        expect(kazuGuessDepth("number-place", 25, puzzle.givens)!).toBeLessThanOrEqual({ easy: 0, medium: 1, hard: 2 }[level]);
        expect(generateKazu("number-place", 25, level, seed)).toEqual(puzzle);
      }
    });
  }

  it("prints fewer numbers the harder the level, and a different puzzle for another seed", () => {
    const counts = KAZU_LEVELS.map((level) => given(generateKazu("number-place", 25, level, 5).givens));
    expect(counts[0]).toBeGreaterThan(counts[1]!);
    expect(counts[1]).toBeGreaterThan(counts[2]!);
    expect(generateKazu("number-place", 25, "medium", 5).solution).not.toBe(generateKazu("number-place", 25, "medium", 6).solution);
  });

  it("spots a wrong answer in the words the smaller sizes use", () => {
    const puzzle = generateKazu("number-place", 25, "easy", 2);
    const solution = decodeCells(puzzle.solution, 25)!;
    const twice = [...solution];
    twice[1] = twice[0]!;
    const verdict = checkKazu("number-place", 25, puzzle.givens, twice.map((v) => (v === 0 ? "." : v <= 9 ? String(v) : String.fromCharCode(55 + v))).join(""));
    expect(verdict.ok).toBe(false);
  });

  it("is made in a browser's time: every level of fifty seeds, the slowest well inside a few seconds", () => {
    for (const level of KAZU_LEVELS) {
      const times: number[] = [];
      for (let seed = 1; seed <= 50; seed += 1) {
        const started = performance.now();
        generateKazu("number-place", 25, level, seed);
        times.push(performance.now() - started);
      }
      times.sort((a, b) => a - b);
      // Measured on a quiet machine: easy about 15 ms, medium 90, hard 400 (the slowest 1.5 s). The bound is for a loaded runner.
      expect(times[25]!, `${level} median`).toBeLessThan(level === "hard" ? 6000 : 2000);
    }
  });
});
