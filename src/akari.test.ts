import { describe, expect, it } from "vitest";
import {
  akariNeighbours,
  akariVisible,
  checkAkari,
  isAkariBoard,
  progressAkari,
} from "./akariBoard.ts";
import { solveAkari } from "./akariSolve.ts";
import { generateAkari } from "./akariGenerate.ts";
import {
  akariFinished,
  decodeAkari,
  encodeAkari,
  hintAkari,
  newAkari,
  toggleAkari,
  undoAkari,
} from "./akariGame.ts";
import { drawAkari } from "./akariDraw.ts";

describe("Akari rules", () => {
  const board = {
    width: 3,
    height: 3,
    cells: [null, null, false, 1, null, null, null, null, null],
  } as const;
  it("illuminates straight rays only until a black cell or the edge", () => {
    expect(akariVisible(board, 0)).toEqual([0, 1]);
    expect(akariNeighbours(board, 4)).toContain(3);
    expect(akariVisible(board, 2)).toEqual([]);
  });
  it("checks illumination, numbered adjacency, conflicts, duplicates and bounds independently", () => {
    expect(checkAkari(board, [0, 1])).toMatchObject({ ok: false, conflicts: [0, 1] });
    expect(checkAkari(board, [0, 6])).toMatchObject({ ok: false, numbered: [3] });
    expect(checkAkari(board, [0, 0]).errors).toEqual([1]);
    expect(checkAkari(board, [99]).errors).toEqual([0]);
    expect(checkAkari(board, [0]).dark.length).toBeGreaterThan(0);
    expect(progressAkari(board, [0])).toMatchObject({ ok: true, numbered: [] });
    expect(progressAkari(board, [0, 6]).ok).toBe(false);
    expect(isAkariBoard({ ...board, cells: Array(9).fill(5) })).toBe(false);
  });
  it("counts solutions and reports a stopped search as incomplete", () => {
    const simple = { width: 2, height: 2, cells: [null, false, false, false] } as const;
    expect(solveAkari(simple)).toMatchObject({ count: 1, complete: true, solution: [0] });
    const bounded = { width: 2, height: 2, cells: [null, null, false, false] } as const;
    expect(solveAkari(bounded, { nodes: 1 })).toMatchObject({ count: 0, complete: false });
    expect(() => solveAkari(simple, { limit: 0 })).toThrow(RangeError);
  });
  it("keeps games immutable, undoable and saves only public puzzle data", () => {
    const game = newAkari(board);
    const moved = toggleAkari(game, 0);
    expect(game.bulbs).toEqual([]);
    expect(moved.bulbs).toEqual([0]);
    expect(undoAkari(moved).bulbs).toEqual([]);
    expect(toggleAkari(moved, 2)).toBe(moved);
    expect(decodeAkari(encodeAkari(moved))?.bulbs).toEqual([0]);
    expect(decodeAkari(JSON.stringify({ version: 1, board, bulbs: [0, 0], helped: false }))).toBeNull();
    const generated = newAkari(generateAkari(5, 5, 3));
    expect(encodeAkari(generated)).not.toContain("solution");
    expect(decodeAkari("{")).toBeNull();
    expect(hintAkari(generated)).not.toBeNull();
  });
  it("generates deterministic 5×5, 7×7 and rectangular boards with proved uniqueness", () => {
    for (const [width, height] of [[5, 5], [7, 7], [10, 6], [6, 10], [16, 9]]) {
      for (let seed = 1; seed <= 4; seed += 1) {
        const puzzle = generateAkari(width, height, seed);
        expect(checkAkari(puzzle, puzzle.solution).ok).toBe(true);
        expect(solveAkari(puzzle)).toMatchObject({ count: 1, complete: true });
        expect(generateAkari(width, height, seed)).toEqual(puzzle);
      }
    }
    expect(generateAkari(5, 5, 1)).not.toEqual(generateAkari(5, 5, 2));
    expect(() => generateAkari(17, 5, 1)).toThrow(RangeError);
  });
  it("draws public clues, bulbs and the selected material as SVG", () => {
    const svg = drawAkari(board, { bulbs: [0], selected: 1, material: "slate", pieces: "tiles", language: "ja" });
    expect(svg).toContain('viewBox="-2 -2 148 148"');
    expect(svg).toContain("美術館");
    expect(svg).toContain("<circle");
    expect(svg).not.toContain("solution");
    expect(akariFinished(newAkari(board))).toBe(false);
  });
});

it("matches a separate brute-force placement count on every tiny 2×2 board", () => {
  for (let code = 0; code < 81; code += 1) {
    let rest = code;
    const cells = Array.from({ length: 4 }, () => {
      const value = rest % 3;
      rest = Math.floor(rest / 3);
      return value === 0 ? null : value === 1 ? false : 0;
    });
    if (!cells.includes(null)) continue;
    const board = { width: 2, height: 2, cells };
    const whites = cells.flatMap((cell, index) => cell === null ? [index] : []);
    let brute = 0;
    for (let mask = 0; mask < 2 ** whites.length; mask += 1) {
      const bulbs = whites.filter((_, index) => mask & 1 << index);
      if (checkAkari(board, bulbs).ok) brute += 1;
    }
    const counted = solveAkari(board, { limit: 100, nodes: 100_000 });
    expect(counted.complete).toBe(true);
    expect(counted.count).toBe(brute);
  }
});
