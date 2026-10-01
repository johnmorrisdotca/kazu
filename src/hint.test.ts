import { describe, expect, it } from "vitest";

import { decodeCells } from "./cells.ts";
import { generateKazu } from "./generate.ts";
import { hintKazu } from "./hint.ts";
import { KAZU_KINDS, KAZU_SPECS } from "./kinds.ts";
import { readGivens } from "./givens.ts";
import { kazuGuessDepth } from "./solve.ts";

describe("a hint", () => {
  for (const kind of KAZU_KINDS) {
    it(`solves an easy ${kind} by hints alone, each one a single step with its reason, each number the right one`, () => {
      let tried = 0;
      for (const seed of [1, 2, 3, 4, 5, 6]) {
        const size = KAZU_SPECS[kind].sizes[kind === "sum-cages" ? 0 : 1]!;
        const puzzle = generateKazu(kind, size, "easy", seed);
        // An easy Sum Cages is easy by the size of its cages, not by what reasoning finds, so only the ones singles finish are asked.
        if (kazuGuessDepth(kind, size, puzzle.givens) !== 0) continue;
        tried += 1;
        const solution = decodeCells(puzzle.solution, size)!;
        const printed = readGivens(kind, size, puzzle.givens)!.cells;
        const entries = new Array<number>(size * size).fill(0);
        const steps: string[] = [];
        for (let guard = 0; guard < size * size; guard += 1) {
          const hint = hintKazu(kind, size, puzzle.givens, entries, puzzle.solution);
          if (hint === null) break;
          expect(printed[hint.cell], "never a printed cell").toBe(0);
          expect(hint.value, `${kind} ${seed} cell ${hint.cell}`).toBe(solution[hint.cell]);
          expect(hint.why, `${kind} ${seed} step ${guard}`).not.toBe("answer");
          if (hint.why === "only-place") expect(hint.group).toBeDefined();
          steps.push(hint.why);
          entries[hint.cell] = hint.value;
        }
        expect(entries.every((value, index) => printed[index] !== 0 || value === solution[index])).toBe(true);
        expect(steps.length).toBe(printed.filter((value) => value === 0).length);
      }
      expect(tried).toBeGreaterThanOrEqual(2);
    });
  }

  it("names the group a number has one place in, and the rule that left a cell one number", () => {
    const seen = new Set<string>();
    for (const kind of KAZU_KINDS) {
      for (const [seed, level] of [[1, "easy"], [2, "easy"], [3, "medium"], [4, "medium"], [5, "hard"], [6, "hard"], [7, "medium"], [8, "easy"]] as const) {
        const size = KAZU_SPECS[kind].sizes.at(-2)!;
        const puzzle = generateKazu(kind, size, level, seed);
        const entries = new Array<number>(size * size).fill(0);
        for (let guard = 0; guard < size * size; guard += 1) {
          const hint = hintKazu(kind, size, puzzle.givens, entries, puzzle.solution);
          if (hint === null) break;
          seen.add(`${kind}:${hint.why}:${hint.group?.type ?? hint.by ?? ""}`);
          entries[hint.cell] = hint.value;
        }
      }
    }
    expect(seen.has("number-place:only-number:")).toBe(true);
    expect([...seen].some((each) => each.startsWith("number-place:only-place:"))).toBe(true);
    expect([...seen].some((each) => each.startsWith("jigsaw:only-place:region"))).toBe(true);
    expect([...seen].some((each) => each.startsWith("more-or-less:only-number:marks"))).toBe(true);
    expect([...seen].some((each) => each.startsWith("towers:only-number:clues"))).toBe(true);
    expect([...seen].some((each) => each.startsWith("sum-cages:only-number:cage"))).toBe(true);
  });

  it("never builds on a wrong number: it is treated as empty, and a hint that lands on it says it replaces it", () => {
    const size = 6;
    const puzzle = generateKazu("number-place", size, "easy", 4);
    const solution = decodeCells(puzzle.solution, size)!;
    const printed = readGivens("number-place", size, puzzle.givens)!.cells;
    const entries = new Array<number>(36).fill(0);
    const cell = printed.findIndex((value) => value === 0);
    entries[cell] = solution[cell] === 1 ? 2 : 1;
    let landed = false;
    for (let guard = 0; guard < 40; guard += 1) {
      const hint = hintKazu("number-place", size, puzzle.givens, entries, puzzle.solution);
      if (hint === null) break;
      expect(hint.value).toBe(solution[hint.cell]);
      if (hint.cell === cell) {
        expect(hint.replaces).toBe(true);
        landed = true;
      } else expect(hint.replaces).toBe(false);
      entries[hint.cell] = hint.value;
    }
    expect(landed).toBe(true);
    expect(entries[cell]).toBe(solution[cell]);
  });

  it("falls back to the answer for a cell, saying so, when a hard puzzle asks for a guess, and still finishes it", () => {
    let fell = false;
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const puzzle = generateKazu("number-place", 9, "hard", seed);
      const solution = decodeCells(puzzle.solution, 9)!;
      const entries = new Array<number>(81).fill(0);
      for (let guard = 0; guard < 81; guard += 1) {
        const hint = hintKazu("number-place", 9, puzzle.givens, entries);
        if (hint === null) break;
        expect(hint.value).toBe(solution[hint.cell]);
        if (hint.why === "answer") fell = true;
        entries[hint.cell] = hint.value;
      }
      expect(entries.filter((value) => value === 0).length).toBe(readGivens("number-place", 9, puzzle.givens)!.cells.filter((value) => value !== 0).length);
    }
    expect(fell).toBe(true);
  });

  it("is null when every cell is right, and when the givens are not a puzzle with one answer", () => {
    const puzzle = generateKazu("number-place", 4, "easy", 1);
    expect(hintKazu("number-place", 4, puzzle.givens, decodeCells(puzzle.solution, 4)!)).toBeNull();
    expect(hintKazu("number-place", 4, "nonsense", [])).toBeNull();
    expect(hintKazu("number-place", 4, ".".repeat(16), new Array<number>(16).fill(0))).toBeNull();
  });
});
