import { describe, expect, it } from "vitest";

import { conflictsOf } from "./conflicts.ts";
import { readGivens } from "./givens.ts";
import { decodeCells } from "./cells.ts";
import { generateKazu } from "./generate.ts";
import { KAZU_KINDS, KAZU_SPECS } from "./kinds.ts";
import type { KazuKind } from "./kinds.ts";

function valuesOf(kind: KazuKind, size: number, seed: number) {
  const puzzle = generateKazu(kind, size, "medium", seed);
  return { puzzle, given: readGivens(kind, size, puzzle.givens)!, solution: decodeCells(puzzle.solution, size)! };
}

describe("conflicts", () => {
  it("finds none in a right grid, whole or half done, of any kind", () => {
    for (const kind of KAZU_KINDS) {
      const size = KAZU_SPECS[kind].sizes[1]!;
      const { given, solution } = valuesOf(kind, size, 3);
      expect(conflictsOf(given, solution), kind).toEqual([]);
      const half = solution.map((value, index) => (index % 2 === 0 ? value : given.cells[index]!));
      expect(conflictsOf(given, half), kind).toEqual([]);
      expect(conflictsOf(given, given.cells), kind).toEqual([]);
    }
  });

  it("marks both cells of a repeat in a row, a column or a box", () => {
    const { given } = valuesOf("number-place", 9, 2);
    const grid = new Array<number>(81).fill(0);
    grid[0] = 5;
    grid[8] = 5;
    expect(conflictsOf(given, grid)).toEqual([0, 8]);
    const column = new Array<number>(81).fill(0);
    column[0] = 5;
    column[72] = 5;
    expect(conflictsOf(given, column)).toEqual([0, 72]);
    const box = new Array<number>(81).fill(0);
    box[0] = 5;
    box[20] = 5;
    expect(conflictsOf(given, box)).toEqual([0, 20]);
  });

  it("marks a repeat on a diagonal of a Diagonal puzzle, and not on a plain one", () => {
    const grid = new Array<number>(81).fill(0);
    grid[0] = 7;
    grid[80] = 7;
    expect(conflictsOf(valuesOf("diagonal", 9, 1).given, grid)).toEqual([0, 80]);
    expect(conflictsOf(valuesOf("number-place", 9, 1).given, grid)).toEqual([]);
  });

  it("marks the cells of a Jigsaw region that repeats", () => {
    const { given } = valuesOf("jigsaw", 6, 4);
    const region = given.regions!;
    const cells = region.flatMap((value, index) => (value === 0 ? [index] : []));
    // Two cells of one region, in different rows and columns where the shape allows.
    const [a, b] = [cells[0]!, cells.find((c) => Math.floor(c / 6) !== Math.floor(cells[0]! / 6) && c % 6 !== cells[0]! % 6)!];
    const grid = new Array<number>(36).fill(0);
    grid[a] = 3;
    grid[b!] = 3;
    expect(conflictsOf(given, grid)).toEqual([a, b].sort((x, y) => x! - y!));
  });

  it("marks a cage that is full and does not add up, or already adds to more", () => {
    const { given } = valuesOf("sum-cages", 6, 5);
    const cage = given.cages!.find((each) => each.cells.length >= 2)!;
    const grid = new Array<number>(36).fill(0);
    const [a, b] = cage.cells;
    // One number alone cannot be wrong against a bigger sum, but one that is more than the whole sum is.
    grid[a!] = Math.min(6, cage.sum + 1) > cage.sum ? cage.sum + 1 : 6;
    if (cage.sum + 1 <= 6) expect(conflictsOf(given, grid)).toContain(a);
    // A full cage with the wrong total.
    const full = new Array<number>(36).fill(0);
    cage.cells.forEach((cell, i) => (full[cell] = (i % 6) + 1));
    const total = full.reduce((sum, value) => sum + value, 0);
    if (total !== cage.sum) for (const cell of cage.cells) expect(conflictsOf(given, full)).toContain(cell);
    expect(b).toBeDefined();
  });

  it("marks a more-than mark that is not true, once both of its cells are filled", () => {
    const { given } = valuesOf("more-or-less", 5, 6);
    const mark = given.marks[0]!;
    const wrong = new Array<number>(25).fill(0);
    wrong[mark.less] = 4;
    wrong[mark.more] = 2;
    expect(conflictsOf(given, wrong)).toEqual([mark.less, mark.more].sort((x, y) => x - y));
    const half = new Array<number>(25).fill(0);
    half[mark.less] = 5;
    expect(conflictsOf(given, half)).toEqual([]);
    const right = new Array<number>(25).fill(0);
    right[mark.less] = 2;
    right[mark.more] = 4;
    expect(conflictsOf(given, right)).toEqual([]);
  });

  it("marks the cells from a Towers clue that already show more towers than it says", () => {
    const { given } = valuesOf("towers", 5, 7);
    const at = given.clues!.left.findIndex((clue) => clue === 1 || clue === 2);
    if (at === -1) return;
    const clue = given.clues!.left[at]!;
    const grid = new Array<number>(25).fill(0);
    // Ascending from the left shows one more tower each step: clue + 1 steps is one too many.
    for (let k = 0; k <= clue; k += 1) grid[at * 5 + k] = k + 1;
    const found = conflictsOf(given, grid);
    for (let k = 0; k <= clue; k += 1) expect(found).toContain(at * 5 + k);
  });

  it("never marks an empty cell", () => {
    const { given } = valuesOf("number-place", 4, 1);
    expect(conflictsOf(given, new Array<number>(16).fill(0))).toEqual([]);
  });
});
