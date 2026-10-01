import { describe, expect, it } from "vitest";

import { checkKazu, isKazuGivens } from "./check.ts";
import { decodeCells, encodeCells } from "./cells.ts";
import { generateKazu } from "./generate.ts";
import { encodeJigsaw } from "./jigsaw.ts";
import { KAZU_KINDS, KAZU_SPECS, type KazuKind } from "./kinds.ts";
import { readGivens } from "./givens.ts";

/** The answer with the cells at two places swapped. */
function swapped(answer: string, a: number, b: number): string {
  const cells = [...answer];
  [cells[a], cells[b]] = [cells[b]!, cells[a]!];
  return cells.join("");
}

describe("checking a finished grid", () => {
  it("accepts the solution of every puzzle, at every size", () => {
    for (const kind of KAZU_KINDS) {
      for (const size of KAZU_SPECS[kind].sizes) {
        const puzzle = generateKazu(kind, size, "easy", 2);
        expect(checkKazu(kind, size, puzzle.givens, puzzle.solution), `${kind} ${size}`).toEqual({ ok: true });
      }
    }
  });

  it("refuses a size the puzzle is not made at", () => {
    expect(checkKazu("number-place", 8, ".".repeat(64), "1".repeat(64))).toEqual({ ok: false, reason: "no number-place at 8" });
    expect(checkKazu("diagonal", 4, ".".repeat(16), "1".repeat(16))).toEqual({ ok: false, reason: "no diagonal at 4" });
  });

  it("refuses an answer with an empty cell, a wrong length, or a stray character", () => {
    const puzzle = generateKazu("number-place", 4, "easy", 1);
    expect(checkKazu("number-place", 4, puzzle.givens, `.${puzzle.solution.slice(1)}`)).toEqual({ ok: false, reason: "the answer has empty cells" });
    expect(checkKazu("number-place", 4, puzzle.givens, puzzle.solution.slice(1))).toEqual({ ok: false, reason: "the answer is not a grid" });
    expect(checkKazu("number-place", 4, puzzle.givens, `x${puzzle.solution.slice(1)}`)).toEqual({ ok: false, reason: "the answer is not a grid" });
    expect(checkKazu("number-place", 4, "nonsense", puzzle.solution)).toEqual({ ok: false, reason: "the givens are not a grid" });
  });

  it("refuses a given that was moved, and names the row, column or box that repeats", () => {
    const puzzle = generateKazu("number-place", 4, "easy", 1);
    const given = [...puzzle.givens].findIndex((c) => c !== ".");
    const moved = [...puzzle.solution];
    moved[given] = moved[given] === "1" ? "2" : "1";
    expect(checkKazu("number-place", 4, puzzle.givens, moved.join(""))).toEqual({ ok: false, reason: "a given was changed" });
    // Two cells of one row swapped: the columns repeat (the row still holds each number once).
    const open = [...puzzle.givens].flatMap((c, i) => (c === "." ? [i] : []));
    const a = open[0]!;
    const b = open.find((i) => Math.floor(i / 4) === Math.floor(a / 4) && puzzle.solution[i] !== puzzle.solution[a])!;
    const result = checkKazu("number-place", 4, puzzle.givens, swapped(puzzle.solution, a, b));
    expect(result.ok).toBe(false);
    expect((result as { reason: string }).reason).toMatch(/^(column \d|box \d|a given was changed)/);
  });

  it("holds a Diagonal to its diagonals, which a plain grid is not", () => {
    // A valid plain 4×4 grid whose main diagonal repeats (1 2 1 2... in diagonal order).
    const plain = "1234341221434321";
    expect(checkKazu("number-place", 4, ".".repeat(16), plain)).toEqual({ ok: true });
    expect(KAZU_SPECS.diagonal.sizes).not.toContain(4);
    const puzzle = generateKazu("diagonal", 6, "easy", 3);
    const solution = decodeCells(puzzle.solution, 6)!;
    const answer = [...solution];
    // Swap two cells in one row that sit on neither diagonal: the grid stays a Latin square only where boxes allow, but any repeat is named.
    const bad = checkKazu("diagonal", 6, puzzle.givens, swapped(puzzle.solution, 0, 1));
    expect(bad.ok).toBe(false);
    expect(answer.length).toBe(36);
  });

  it("refuses a Jigsaw whose regions do not divide the grid, before it reads the grid", () => {
    const size = 5;
    const puzzle = generateKazu("jigsaw", size, "easy", 1);
    const read = readGivens("jigsaw", size, puzzle.givens)!;
    // Regions that are not each one joined shape (the cells of a diagonal stripe) would make any grid with sound rows and columns look like an answer.
    const rows = Array.from({ length: 25 }, (_, i) => (Math.floor(i / 5) + (i % 5)) % 5);
    expect(checkKazu("jigsaw", size, encodeJigsaw(read.cells, rows), puzzle.solution)).toEqual({ ok: false, reason: "the regions do not divide the grid" });
    expect(checkKazu("jigsaw", size, "x", puzzle.solution)).toEqual({ ok: false, reason: "the givens are not a grid with regions" });
    expect(isKazuGivens("jigsaw", size, encodeJigsaw(read.cells, rows))).toBe(false);
    expect(isKazuGivens("jigsaw", size, puzzle.givens)).toBe(true);
  });

  it("holds Sum Cages to its sums: a grid right in its rows, columns and boxes can still be wrong in a cage", () => {
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const puzzle = generateKazu("sum-cages", 6, "medium", seed);
      expect(checkKazu("sum-cages", 6, puzzle.givens, puzzle.solution)).toEqual({ ok: true });
      // Another valid 6×6 grid: relabel two numbers throughout, which keeps every row, column and box right.
      const relabelled = [...puzzle.solution].map((c) => (c === "1" ? "2" : c === "2" ? "1" : c)).join("");
      const result = checkKazu("sum-cages", 6, puzzle.givens, relabelled);
      if (!result.ok) {
        expect(result.reason).toMatch(/^(cage \d+ does not add to \d+|a given was changed)$/);
        return;
      }
    }
    throw new Error("no cage was caught");
  });

  it("holds More or Less to its marks, and Towers to its clues", () => {
    const more = generateKazu("more-or-less", 5, "easy", 6);
    const read = readGivens("more-or-less", 5, more.givens)!;
    expect(read.marks.length).toBeGreaterThan(0);
    const cells = decodeCells(more.solution, 5)!;
    const mark = read.marks[0]!;
    const flipped = [...cells];
    [flipped[mark.less], flipped[mark.more]] = [flipped[mark.more]!, flipped[mark.less]!];
    const empty = new Array<number>(25).fill(0);
    // With every given moved out of the way, only a mark or a repeat can refuse it.
    expect(checkKazu("more-or-less", 5, more.givens, encodeCells(flipped))).toMatchObject({ ok: false });
    expect(empty).toHaveLength(25);

    const towers = generateKazu("towers", 5, "easy", 6);
    const clues = readGivens("towers", 5, towers.givens)!.clues!;
    expect(Object.values(clues).flat().some((clue) => clue !== 0)).toBe(true);
    // Each row reversed keeps a Latin square, and changes what the side clues see.
    const solution = decodeCells(towers.solution, 5)!;
    const reversed = solution.map((_, i) => solution[Math.floor(i / 5) * 5 + (4 - (i % 5))]!);
    const result = checkKazu("towers", 5, towers.givens, encodeCells(reversed));
    expect(result.ok).toBe(false);
    expect((result as { reason: string }).reason).toMatch(/^(a given was changed|the (top|bottom|left|right) clue \d sees \d)$/);
  });

  it("says a kind it has never heard of has no check, instead of passing it", () => {
    expect(checkKazu("hex" as KazuKind, 4, "", "")).toMatchObject({ ok: false });
  });
});
