import { describe, expect, it } from "vitest";
import { canReach, checkKakuro, isKakuroBoard, kakuroRuns, progressKakuro } from "./kakuroBoard.ts";
import type { KakuroCell } from "./kakuro.types.ts";
import { generateKakuro } from "./kakuroGenerate.ts";
import { decodeKakuro, encodeKakuro, enterKakuro, hintKakuro, newKakuro, undoKakuro } from "./kakuroGame.ts";
import { solveKakuro } from "./kakuroSolve.ts";

const board = { width: 3, height: 3, cells: [
  { kind: "black", across: null, down: null }, { kind: "black", across: null, down: 3 }, { kind: "black", across: null, down: 4 },
  { kind: "black", across: 3, down: null }, { kind: "white" }, { kind: "white" },
  { kind: "black", across: 4, down: null }, { kind: "white" }, { kind: "white" }
] as const };

describe("Kakuro rules", () => {
  it("requires every white cell to cross one across and one down run, with no singletons", () => {
    expect(isKakuroBoard(board)).toBe(true);
    expect(kakuroRuns(board)).toHaveLength(4);
    const singleton = { width: 3, height: 3, cells: [...board.cells] as KakuroCell[] };
    singleton.cells[3] = { kind: "black", across: 1, down: null };
    expect(isKakuroBoard(singleton)).toBe(false);
  });
  it("checks exact totals, distinct values and feasible unfinished totals", () => {
    const answer = [0, 0, 0, 0, 2, 1, 0, 1, 3];
    expect(checkKakuro(board, answer).ok).toBe(true);
    expect(progressKakuro(board, [0, 0, 0, 0, 1, 1, 0, 2, 1]).errors).toContain(4);
    expect(progressKakuro(board, [0, 0, 0, 0, 9, 0, 0, 0, 0]).errors).toContain(4);
    expect(canReach(4, 2, [])).toBe(true);
    expect(canReach(2, 2, [])).toBe(false);
  });
  it("counts the cross-run solution and reports interrupted searches honestly", () => {
    expect(solveKakuro(board)).toMatchObject({ count: 1, complete: true, solution: [0, 0, 0, 0, 2, 1, 0, 1, 3] });
    expect(solveKakuro(board, [], { nodes: 1 })).toMatchObject({ count: 0, complete: false });
  });
});

describe("Kakuro play and generation", () => {
  it("generates the same proved board for the same seed", () => {
    const first = generateKakuro(21), second = generateKakuro(21);
    expect(first).toEqual(second);
    expect(solveKakuro(first)).toMatchObject({ count: 1, complete: true });
    expect(checkKakuro(first, first.solution).ok).toBe(true);
    expect(first.solution.filter(Boolean).length).toBeGreaterThan(20);
  });
  it("keeps moves immutable and round trips public progress without an answer", () => {
    const puzzle = generateKakuro(5), game = newKakuro(puzzle), cell = puzzle.cells.findIndex(tile => tile.kind === "white");
    const next = enterKakuro(game, cell, 3, true);
    expect(game.notes[cell]).toEqual([]);
    expect(next.notes[cell]).toEqual([3]);
    expect(undoKakuro(next).notes[cell]).toEqual([]);
    expect(hintKakuro(game)).not.toBeNull();
    expect(decodeKakuro(encodeKakuro(game))?.values).toEqual(game.values);
    expect(encodeKakuro(game)).not.toContain("solution");
  });
});
