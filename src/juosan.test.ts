import { describe, expect, it } from "vitest";
import { checkJuosan, isJuosanBoard } from "./juosanBoard.ts";
import { generateJuosan } from "./juosanGenerate.ts";
import { decodeJuosan, encodeJuosan, newJuosan, setJuosanMark, undoJuosan } from "./juosanGame.ts";
import { solveJuosan } from "./juosanSolve.ts";
import type { JuosanBoard } from "./juosan.types.ts";

describe("Juosan rules", () => {
  it("checks region absolute differences and the direction-specific three-mark limits", () => {
    const board: JuosanBoard = { width: 3, height: 2, territories: [{ cells: [0, 1, 2, 3, 4, 5], difference: 6 }] };
    expect(isJuosanBoard(board)).toBe(true);
    expect(checkJuosan(board, [1, 1, 1, 1, 1, 1]).ok).toBe(true);
    expect(checkJuosan(board, [2, 2, 2, 2, 2, 2]).errors).toEqual([-2]);
    expect(checkJuosan(board, [1, 1, 2, 2, 1, 1]).ok).toBe(false);
  });
  it("counts the fixed-board labeled answer without complement assumptions", () => {
    const board: JuosanBoard = { width: 3, height: 2, territories: [{ cells: [0, 1, 2, 3, 4, 5], difference: 6 }] };
    expect(solveJuosan(board, 2)).toMatchObject({ count: 1, complete: true, solution: [1, 1, 1, 1, 1, 1] });
  });
  it("distinguishes a cutoff from exhaustion", () => {
    const board: JuosanBoard = { width: 3, height: 2, territories: [{ cells: [0, 1, 2, 3, 4, 5], difference: 0 }] };
    expect(solveJuosan(board, 2, 1).complete).toBe(false);
  });
  it("keeps immutable progress, undo, and assisted state in save data", () => {
    const board: JuosanBoard = { width: 2, height: 2, territories: [{ cells: [0, 1], difference: 0 }, { cells: [2, 3], difference: 0 }] };
    const started = newJuosan(board), changed = setJuosanMark(started, 0, 1);
    expect(started.marks[0]).toBe(0); expect(undoJuosan(changed).marks[0]).toBe(0);
    const saved = encodeJuosan({ ...changed, helped: true }); expect(decodeJuosan(saved)?.helped).toBe(true);
  });
  it("repeats exhaustively proved puzzles on supported wide and tall boards", () => {
    for (const [w, h, seed] of [[3, 2, 4], [2, 3, 31]]) {
      const a = generateJuosan(w, h, "easy", seed), b = generateJuosan(w, h, "easy", seed);
      expect(a).toEqual(b); expect(checkJuosan(a, a.solution).ok).toBe(true);
      expect(solveJuosan(a, 2).complete).toBe(true);
      expect(solveJuosan(a, 2).count).toBe(1);
    }
    expect(generateJuosan(3, 2, "easy", 4).territories).not.toEqual(generateJuosan(3, 2, "easy", 5).territories);
    expect(() => generateJuosan(4, 4, "medium", 2)).toThrow(RangeError);
  });
});
