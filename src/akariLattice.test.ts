// Kazu 1.3.0 fell back, without saying so, to the fixed lattice of its first generator whenever a level found no random
// board within its attempts: about half of the 14×14 easy seeds (74% black, five full black rows) and most of 16×16 easy.
// A seed must make a random board at every size and level.
import { describe, expect, it, vi } from "vitest";

import { AKARI_LEVELS } from "./akari.constants.ts";
import { checkAkari } from "./akariBoard.ts";
import { generateAkari } from "./akariGenerate.ts";
import { solveAkari } from "./akariSolve.ts";
import { templateAkari } from "./akariTemplate.ts";

// These generate a lot; a slow runner must not fail them for taking its time.
vi.setConfig({ testTimeout: 180_000 });

const blackShare = (cells: readonly (number | null | false)[]): number => cells.filter((cell) => cell !== null).length / cells.length;

/** Black squares that make up a full row or column: the lattice has five of them at 14×14, a random board almost never one. */
const fullLines = (cells: readonly (number | null | false)[], width: number, height: number): number => {
  let lines = 0;
  for (let y = 0; y < height; y += 1) if (Array.from({ length: width }, (_, x) => cells[y * width + x]).every((cell) => cell !== null)) lines += 1;
  for (let x = 0; x < width; x += 1) if (Array.from({ length: height }, (_, y) => cells[y * width + x]).every((cell) => cell !== null)) lines += 1;
  return lines;
};

describe("Akari never hands back its fixed lattice", () => {
  it("makes a random board for every seed at the sizes that used to fall back, at the levels that did", () => {
    for (const size of [12, 14, 16]) for (const level of ["easy", "medium", "hard"] as const) {
      const seeds = Array.from({ length: 40 }, (_, i) => i + 1);
      const boards = seeds.map((seed) => generateAkari(size, size, seed, level));
      const shares = boards.map((board) => blackShare(board.cells));
      boards.forEach((board, at) => {
        const seed = seeds[at]!;
        expect(board.cells.join(), `${size}×${size} ${level} seed ${seed} is the lattice`).not.toBe(templateAkari(size, size, seed).cells.join());
        expect(shares[at]!, `${size}×${size} ${level} seed ${seed} is mostly black`).toBeLessThan(0.6);
        expect(fullLines(board.cells, size, size), `${size}×${size} ${level} seed ${seed} has full black rows`).toBeLessThanOrEqual(1);
        expect(board.level).toBe(level);
        expect(checkAkari(board, board.solution).ok).toBe(true);
        expect(solveAkari(board)).toMatchObject({ count: 1, complete: true });
      });
      // Variety: different seeds make different boards, and not all of one black share.
      expect(new Set(boards.map((board) => board.cells.join())).size, `${size}×${size} ${level} repeats a board`).toBe(seeds.length);
      expect(new Set(boards.map((board) => board.cells.filter((cell) => cell !== null).length)).size, `${size}×${size} ${level} has one black count`).toBeGreaterThan(8);
      expect(Math.max(...shares) - Math.min(...shares), `${size}×${size} ${level} shares barely differ`).toBeGreaterThan(0.04);
    }
  });

  it("does the same at every other size and at extra-hard", () => {
    for (const size of [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15]) for (const level of AKARI_LEVELS) for (let seed = 1; seed <= (level === "extra-hard" ? 4 : 12); seed += 1) {
      const board = generateAkari(size, size, seed, level);
      expect(board.cells.join(), `${size}×${size} ${level} seed ${seed} is the lattice`).not.toBe(templateAkari(size, size, seed).cells.join());
    }
    for (const seed of [1, 2, 3, 4]) {
      const board = generateAkari(14, 14, seed, "extra-hard");
      expect(blackShare(board.cells)).toBeLessThan(0.6);
      expect(solveAkari(board)).toMatchObject({ count: 1, complete: true });
    }
  });

  it("makes a board that is not square from the same rules", () => {
    for (const [width, height] of [[16, 8], [8, 14], [14, 5]] as const) for (const level of ["easy", "medium"] as const) for (let seed = 1; seed <= 6; seed += 1) {
      const board = generateAkari(width, height, seed, level);
      expect(board.cells.join()).not.toBe(templateAkari(width, height, seed).cells.join());
      expect(solveAkari(board)).toMatchObject({ count: 1, complete: true });
    }
  });
});
