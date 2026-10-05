import { describe, expect, it } from "vitest";
import { checkNurikabe, isNurikabeBoard } from "./nurikabeBoard.ts";
import { solveNurikabe } from "./nurikabeSolve.ts";
import { generateNurikabe } from "./nurikabeGenerate.ts";
import { decodeNurikabe, encodeNurikabe, hintNurikabe, markNurikabeSea, newNurikabe, undoNurikabe } from "./nurikabeGame.ts";
import { drawNurikabe } from "./nurikabeDraw.ts";

describe("Nurikabe island and sea rules", () => {
  it("checks numbered island areas, connected sea, and the 2×2 sea ban", () => {
    const puzzle = generateNurikabe(2), sea = [...puzzle.solution];
    expect(checkNurikabe(puzzle, sea).ok).toBe(true);
    const split = Array(25).fill(false); split[sea.findIndex(Boolean)] = true;
    expect(checkNurikabe(puzzle, split).ok).toBe(false);
    const square = Array(25).fill(false); for (const cell of [0, 1, 5, 6]) square[cell] = true;
    expect(checkNurikabe(puzzle, square).ok).toBe(false);
    const islandCell = puzzle.solution.findIndex((value, cell) => !value && !puzzle.clues[cell]);
    const wrongArea = [...sea]; wrongArea[islandCell] = true;
    expect(checkNurikabe(puzzle, wrongArea).ok).toBe(false);
  });
  it("rejects malformed boards and distinguishes uniqueness proof from exhaustion", () => {
    expect(isNurikabeBoard({ size: 7, clues: Array(49).fill(0) } as never)).toBe(false);
    const puzzle = generateNurikabe(2);
    expect(solveNurikabe(puzzle, { nodes: 1 }).complete).toBe(false);
    expect(solveNurikabe(puzzle)).toMatchObject({ count: 1, complete: true });
  });
  it("generates stable verified seeded variants", () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 40; seed += 1) {
      const puzzle = generateNurikabe(seed);
      expect(generateNurikabe(seed)).toEqual(puzzle);
      expect(checkNurikabe(puzzle, puzzle.solution).ok).toBe(true);
      expect(solveNurikabe(puzzle)).toMatchObject({ count: 1, complete: true });
      seen.add(puzzle.clues.join(","));
    }
    expect(seen.size).toBeGreaterThan(10);
  });
  it("keeps saved game data public and immutable", () => {
    const puzzle = generateNurikabe(2), game = newNurikabe(puzzle), next = markNurikabeSea(game, 1);
    expect(game.sea[1]).toBe(false); expect(next.sea[1]).toBe(true); expect(undoNurikabe(next).sea[1]).toBe(false);
    expect(encodeNurikabe(next)).not.toContain("solution"); expect(decodeNurikabe(encodeNurikabe(next))?.sea).toEqual(next.sea);
    expect(decodeNurikabe("{")).toBeNull(); expect(hintNurikabe(game)).not.toBeNull();
  });
  it("draws clues and player's sea marks", () => {
    const puzzle = generateNurikabe(3), svg = drawNurikabe(puzzle, { sea: puzzle.solution, pieces: "tiles", language: "ja" });
    expect(svg).toContain("Nurikabe"); expect(svg).not.toContain("solution");
  });
});
