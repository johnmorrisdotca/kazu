import { describe, expect, it } from "vitest";

import { checkMasyu, isMasyuBoard, masyuEdgeCount, masyuNeighbors } from "./masyuBoard.ts";
import { generateMasyu } from "./masyuGenerate.ts";
import { decodeMasyu, encodeMasyu, hintMasyu, newMasyu, toggleMasyuEdge, undoMasyu } from "./masyuGame.ts";
import { solveMasyu } from "./masyuSolve.ts";

describe("Masyu rules", () => {
  it("checks pearl-neighbor turns, straight runs, connectedness and boundaries", () => {
    const puzzle = generateMasyu(), solution = [...puzzle.solution];
    expect(checkMasyu(puzzle, solution).ok).toBe(true);
    const broken = solution.filter(edge => edge !== solution[0]);
    expect(checkMasyu(puzzle, broken).ok).toBe(false);
    expect(masyuNeighbors(puzzle, 4).some(next => next.cell === 5)).toBe(false);
    expect(masyuNeighbors(puzzle, 5).some(next => next.cell === 4)).toBe(false);
  });

  it("rejects branches, repeated edges, and disjoint loops", () => {
    const puzzle = generateMasyu(), loop = [...puzzle.solution];
    expect(checkMasyu(puzzle, [...loop, loop[0]!]).ok).toBe(false);
    const outer = loop;
    const innerCells = [6, 7, 8, 13, 18, 17, 16, 11];
    const inner = innerCells.map((cell, index) => masyuNeighbors(puzzle, cell)
      .find(next => next.cell === innerCells[(index + 1) % innerCells.length])!.edge);
    expect(checkMasyu(puzzle, [...outer, ...inner]).ok).toBe(false);
    expect(masyuEdgeCount(puzzle)).toBe(40);
  });

  it("distinguishes a proven unique board from a bounded search", () => {
    const puzzle = generateMasyu();
    expect(solveMasyu(puzzle)).toMatchObject({ count: 1, complete: true });
    expect(solveMasyu(puzzle, { nodes: 1 })).toMatchObject({ complete: false });
    expect(isMasyuBoard({ width: 7, height: 7, pearls: Array(49).fill(0) })).toBe(false);
  });

  it("makes reproducible, clue-varied layouts whose loop remains unique", () => {
    const variants = new Set<string>();
    const loopLengths = new Set<number>();
    for (let seed = 1; seed <= 6; seed += 1) {
      const puzzle = generateMasyu(5, seed);
      expect(puzzle).toEqual(generateMasyu(5, seed));
      expect(checkMasyu(puzzle, puzzle.solution).ok).toBe(true);
      expect(solveMasyu(puzzle)).toMatchObject({ count: 1, complete: true });
      variants.add(puzzle.pearls.join(""));
      loopLengths.add(puzzle.solution.length);
    }
    expect(variants.size).toBeGreaterThan(4);
    expect(loopLengths.size).toBeGreaterThan(1);
    expect(() => (generateMasyu as (size: number, seed: number) => unknown)(7, 1)).toThrow();
  });

  it("keeps play immutable and progress public", () => {
    const puzzle = generateMasyu(), game = newMasyu(puzzle);
    const moved = toggleMasyuEdge(game, puzzle.solution[0]!);
    expect(game.edges).toEqual([]);
    expect(undoMasyu(moved).edges).toEqual([]);
    expect(hintMasyu(game)).not.toBeNull();
    const encoded = encodeMasyu(moved);
    expect(encoded).not.toContain("solution");
    expect(decodeMasyu(encoded)?.edges).toEqual(moved.edges);
    expect(decodeMasyu("{")).toBeNull();
  });
});
