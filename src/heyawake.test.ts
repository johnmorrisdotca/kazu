import { describe, expect, it } from "vitest";
import { checkHeyawake, isHeyawakeBoard } from "./heyawakeBoard.ts";
import { decodeHeyawake, encodeHeyawake, newHeyawake, setHeyawakeCell, undoHeyawake } from "./heyawakeGame.ts";
import { generateHeyawake } from "./heyawakeGenerate.ts";
import { solveHeyawake } from "./heyawakeSolve.ts";

describe("Heyawake rules", () => {
  it("counts room clues and permits unnumbered rooms", () => {
    const board = { width: 4, height: 2, rooms: [
      { x: 0, y: 0, width: 2, height: 2, blacks: 1 },
      { x: 2, y: 0, width: 2, height: 2, blacks: null },
    ] };
    expect(checkHeyawake(board, [true, false, false, false, false, false, false, false])).toMatchObject({ ok: true, complete: true });
    expect(checkHeyawake(board, [false, false, false, false, false, false, false, false]).errors).toContain(0);
  });

  it("rejects orthogonally adjacent black cells", () => {
    const board = { width: 2, height: 2, rooms: [{ x: 0, y: 0, width: 2, height: 2, blacks: null }] };
    const check = checkHeyawake(board, [true, true, false, false]);
    expect(check.ok).toBe(false);
    expect(check.errors).toEqual([0, 1]);
  });

  it("checks white connectivity separately from black adjacency", () => {
    const board = { width: 2, height: 2, rooms: [{ x: 0, y: 0, width: 2, height: 2, blacks: null }] };
    const check = checkHeyawake(board, [false, true, true, false]);
    expect(check.errors).toContain(3);
  });

  it("rejects a straight white run through three rooms", () => {
    const board = { width: 3, height: 2, rooms: [0, 1, 2].map(x => ({ x, y: 0, width: 1, height: 2, blacks: null })) };
    const check = checkHeyawake(board, [false, false, false, true, false, true]);
    expect(check.ok).toBe(false);
    expect(check.errors).toEqual([0, 1, 2]);
  });

  it("validates rectangle room coverage and distinguishes bounded search", () => {
    expect(isHeyawakeBoard({ width: 2, height: 2, rooms: [{ x: 0, y: 0, width: 1, height: 2, blacks: null }] })).toBe(false);
    const board = { width: 2, height: 2, rooms: [{ x: 0, y: 0, width: 2, height: 2, blacks: null }] };
    expect(solveHeyawake(board, Array(4).fill(null), { nodes: 1 })).toMatchObject({ count: 0, complete: false, nodes: 1 });
  });
});

describe("Heyawake immutable play state", () => {
  it("allows marks in numbered rooms, undoes them, and saves no generated answer", () => {
    const board = { width: 2, height: 2, rooms: [{ x: 0, y: 0, width: 2, height: 2, blacks: 1 }] };
    const initial = newHeyawake(board), next = setHeyawakeCell(initial, 0, true);
    expect(next.entries[0]).toBe(true);
    expect(undoHeyawake(next).entries).toEqual(initial.entries);
    const code = encodeHeyawake({ ...next, helped: true, board: { ...next.board, solution: [true, false, false, false] } as never });
    expect(code).not.toContain("solution");
    const restored = decodeHeyawake(code);
    expect(restored?.entries).toEqual(next.entries);
    expect(restored?.helped).toBe(true);
    expect(JSON.stringify(restored)).not.toContain("solution");
  });
});

describe("seeded original Heyawake generation", () => {
  it("reproduces a puzzle whose answer is independently checked and uniquely counted", () => {
    const first = generateHeyawake(5, 4, "easy", 17), again = generateHeyawake(5, 4, "easy", 17);
    expect(first).toEqual(again);
    expect(checkHeyawake(first, first.solution)).toMatchObject({ ok: true, complete: true });
    expect(solveHeyawake(first)).toMatchObject({ count: 1, complete: true });
  });

  it("recovers old failing seeds by increasing room detail and retaining clue counts", () => {
    for (const [width, height, level, seed] of [[4, 4, "easy", 1], [5, 4, "hard", 10]] as const) {
      const puzzle = generateHeyawake(width, height, level, seed);
      expect(checkHeyawake(puzzle, puzzle.solution).ok).toBe(true);
      expect(solveHeyawake(puzzle)).toMatchObject({ count: 1, complete: true });
    }
  });

  it("rejects boards above the documented generation area bound", () => {
    expect(() => generateHeyawake(6, 6, "easy", 1)).toThrow(RangeError);
  });
});
