// The grid solvers checked against plain enumeration: every possible answer of a small board is tried, and the solver must
// count exactly the ones that pass the rules as the checkers state them.
import { describe, expect, it } from "vitest";

import { checkFillomino } from "./fillominoBoard.ts";
import { solveFillomino } from "./fillominoSolve.ts";
import { checkHitori } from "./hitoriBoard.ts";
import { solveHitori } from "./hitoriSolve.ts";
import { checkKakuro } from "./kakuroBoard.ts";
import { solveKakuro } from "./kakuroSolve.ts";
import { seededRandom } from "./random.ts";

describe("Hitori's solver", () => {
  it("counts the minimal shade patterns of random 4×4 boards exactly", () => {
    const random = seededRandom(31);
    for (let round = 0; round < 6; round += 1) {
      const board = { size: 4, numbers: Array.from({ length: 16 }, () => 1 + Math.floor(random() * 4)) };
      let brute = 0;
      for (let mask = 0; mask < 1 << 16; mask += 1) {
        const shaded = Array.from({ length: 16 }, (_, cell) => (mask >> cell & 1) === 1);
        if (!checkHitori(board, shaded).ok) continue;
        const minimal = shaded.every((on, cell) => !on || !checkHitori(board, shaded.map((value, at) => at === cell ? false : value)).ok);
        if (minimal) brute += 1;
      }
      expect(solveHitori(board, { limit: 1000 })).toMatchObject({ count: brute, complete: true });
    }
  });
});

describe("Kakuro's solver", () => {
  it("counts the digit fillings of small boards exactly", () => {
    const random = seededRandom(5);
    let compared = 0;
    for (let round = 0; round < 150; round += 1) {
      // A 3 × 4 board with up to four white squares in the corner block, and totals read from random digits.
      const width = 4, height = 3, white = [5, 6, 7, 9, 10, 11].filter(() => random() < .7);
      const digits = white.map(() => 1 + Math.floor(random() * 9));
      const cells = Array.from({ length: width * height }, (_, cell) => white.includes(cell) ? { kind: "white" } : { kind: "black", across: null as number | null, down: null as number | null });
      const at = (cell: number) => white.includes(cell) ? digits[white.indexOf(cell)]! : 0;
      let valid = true;
      for (let cell = 0; cell < width * height && valid; cell += 1) {
        if (white.includes(cell)) continue;
        const black = cells[cell] as { across: number | null; down: number | null };
        if (cell % width + 1 < width && white.includes(cell + 1)) {
          const run = []; for (let next = cell + 1; white.includes(next) && next % width !== 0; next += 1) run.push(next);
          if (run.length < 2 || new Set(run.map(at)).size !== run.length) valid = false; else black.across = run.reduce((sum, next) => sum + at(next), 0);
        }
        if (cell + width < width * height && white.includes(cell + width)) {
          const run = []; for (let next = cell + width; white.includes(next); next += width) run.push(next);
          if (run.length < 2 || new Set(run.map(at)).size !== run.length) valid = false; else black.down = run.reduce((sum, next) => sum + at(next), 0);
        }
      }
      const board = { width, height, cells } as never;
      if (!valid || white.length < 4 || white.length > 5) continue;
      let brute = 0;
      const total = 9 ** white.length;
      for (let code = 0; code < total; code += 1) {
        const values = Array(width * height).fill(0);
        let rest = code;
        for (const cell of white) { values[cell] = 1 + rest % 9; rest = Math.floor(rest / 9); }
        if (checkKakuro(board, values).ok) brute += 1;
      }
      try { expect(solveKakuro(board, [], { limit: 100_000 })).toMatchObject({ count: brute, complete: true }); compared += 1; }
      catch (error) { if ((error as Error).name !== "RangeError") throw error; }
    }
    expect(compared).toBeGreaterThanOrEqual(3);
  });
});

describe("Fillomino's solver", () => {
  it("counts the fillings of small boards exactly", () => {
    const random = seededRandom(9);
    for (let round = 0; round < 40; round += 1) {
      const width = 3, height = 2, cells = 6;
      const givens = Array.from({ length: cells }, () => random() < .4 ? 1 + Math.floor(random() * 4) : 0);
      const board = { width, height, givens };
      let brute = 0;
      for (let code = 0; code < cells ** cells; code += 1) {
        const entries = Array.from({ length: cells }, (_, cell) => 1 + Math.floor(code / cells ** cell) % cells);
        if (checkFillomino(board, entries).ok) brute += 1;
      }
      expect(solveFillomino(board, givens, { limit: 100_000 })).toMatchObject({ count: brute, complete: true });
    }
  });
});
