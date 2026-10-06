import { describe, expect, it } from "vitest";
import { canReach, checkCrossSums, isCrossSumsBoard, crossSumsRuns, progressCrossSums } from "./cross-sums-board.ts";
import type { CrossSumsCell } from "./cross-sums.types.ts";
import { generateCrossSums } from "./cross-sums-generate.ts";
import { decodeCrossSums, encodeCrossSums, enterCrossSums, hintCrossSums, newCrossSums, undoCrossSums } from "./cross-sums-game.ts";
import { solveCrossSums } from "./cross-sums-solve.ts";

const board = { width: 3, height: 3, cells: [
  { kind: "black", across: null, down: null }, { kind: "black", across: null, down: 3 }, { kind: "black", across: null, down: 4 },
  { kind: "black", across: 3, down: null }, { kind: "white" }, { kind: "white" },
  { kind: "black", across: 4, down: null }, { kind: "white" }, { kind: "white" }
] as const };

describe("Cross Sums rules", () => {
  it("requires every white cell to cross one across and one down run, with no singletons", () => {
    expect(isCrossSumsBoard(board)).toBe(true);
    expect(crossSumsRuns(board)).toHaveLength(4);
    const singleton = { width: 3, height: 3, cells: [...board.cells] as CrossSumsCell[] };
    singleton.cells[3] = { kind: "black", across: 1, down: null };
    expect(isCrossSumsBoard(singleton)).toBe(false);
  });
  it("checks exact totals, distinct values and feasible unfinished totals", () => {
    const answer = [0, 0, 0, 0, 2, 1, 0, 1, 3];
    expect(checkCrossSums(board, answer).ok).toBe(true);
    expect(progressCrossSums(board, [0, 0, 0, 0, 1, 1, 0, 2, 1]).errors).toContain(4);
    expect(progressCrossSums(board, [0, 0, 0, 0, 9, 0, 0, 0, 0]).errors).toContain(4);
    expect(canReach(4, 2, [])).toBe(true);
    expect(canReach(2, 2, [])).toBe(false);
  });
  it("counts the cross-run solution and reports interrupted searches honestly", () => {
    expect(solveCrossSums(board)).toMatchObject({ count: 1, complete: true, solution: [0, 0, 0, 0, 2, 1, 0, 1, 3] });
    // A two-by-two block whose rows and columns all add to 3 has two answers, and a one-node search reaches neither.
    const twin = { width: 3, height: 3, cells: [
      { kind: "black", across: null, down: null }, { kind: "black", across: null, down: 3 }, { kind: "black", across: null, down: 3 },
      { kind: "black", across: 3, down: null }, { kind: "white" }, { kind: "white" },
      { kind: "black", across: 3, down: null }, { kind: "white" }, { kind: "white" },
    ] } as const;
    expect(solveCrossSums(twin, [], { limit: 5 })).toMatchObject({ count: 2, complete: true });
    expect(solveCrossSums(twin, [], { nodes: 1 })).toMatchObject({ count: 0, complete: false });
  });
});

describe("Cross Sums play and generation", () => {
  it("generates the same proved board for the same seed", () => {
    const first = generateCrossSums(21), second = generateCrossSums(21);
    expect(first).toEqual(second);
    expect(solveCrossSums(first)).toMatchObject({ count: 1, complete: true });
    expect(checkCrossSums(first, first.solution).ok).toBe(true);
    expect(first.solution.filter(Boolean).length).toBeGreaterThan(20);
  });
  it("keeps moves immutable and round trips public progress without an answer", () => {
    const puzzle = generateCrossSums(5), game = newCrossSums(puzzle), cell = puzzle.cells.findIndex(tile => tile.kind === "white");
    const next = enterCrossSums(game, cell, 3, true);
    expect(game.notes[cell]).toEqual([]);
    expect(next.notes[cell]).toEqual([3]);
    expect(undoCrossSums(next).notes[cell]).toEqual([]);
    expect(hintCrossSums(game)).not.toBeNull();
    expect(decodeCrossSums(encodeCrossSums(game))?.values).toEqual(game.values);
    expect(encodeCrossSums(game)).not.toContain("solution");
  });
});
