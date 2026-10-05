import { describe, expect, it } from "vitest";

import { checkYajilin, isYajilinBoard, yajilinEdgeCount, yajilinNeighbors } from "./yajilinBoard.ts";
import { generateYajilin } from "./yajilinGenerate.ts";
import { decodeYajilin, encodeYajilin, hintYajilin, newYajilin, toggleYajilinEdge, toggleYajilinShade, undoYajilin } from "./yajilinGame.ts";
import { solveYajilin } from "./yajilinSolve.ts";

describe("Yajilin rules", () => {
  it("checks a generated loop, all arrow counts, shade adjacency and edge boundaries", () => {
    const puzzle = generateYajilin(5, 1);
    expect(checkYajilin(puzzle, puzzle.solution.shaded, puzzle.solution.edges).ok).toBe(true);
    expect(yajilinNeighbors(puzzle, 4).some(next => next.cell === 5)).toBe(false);
    expect(yajilinNeighbors(puzzle, 5).some(next => next.cell === 4)).toBe(false);
    expect(yajilinEdgeCount(puzzle)).toBe(40);

    const adjacent = [...puzzle.solution.shaded];
    const pair = puzzle.clues.findIndex((clue, cell) => !clue && !adjacent[cell] && cell % 5 < 4 && !puzzle.clues[cell + 1]);
    adjacent[pair] = true; adjacent[pair + 1] = true;
    expect(checkYajilin(puzzle, adjacent, []).errors).toContain(pair);
  });

  it("requires one connected loop through every open cell and rejects extra edges", () => {
    const puzzle = generateYajilin(5, 2), solution = [...puzzle.solution.edges];
    expect(checkYajilin(puzzle, puzzle.solution.shaded, [...solution, solution[0]!]).ok).toBe(false);
    const clues = Array(25).fill(null); clues[12] = { direction: "up", count: 0 };
    const emptyBoard = { width: 5, height: 5, clues };
    const outer = [0, 1, 2, 3, 24, 29, 34, 39, 19, 18, 17, 16, 35, 30, 25, 20];
    const ring = [6, 7, 8, 13, 18, 17, 16, 11].map((cell, index) => yajilinNeighbors(emptyBoard, cell)
      .find(next => next.cell === [6, 7, 8, 13, 18, 17, 16, 11][(index + 1) % 8])!.edge);
    expect(checkYajilin(emptyBoard, Array(25).fill(false), [...outer, ...ring]).ok).toBe(false);
  });

  it("checks arrow totals independently and reports bounded searches honestly", () => {
    const puzzle = generateYajilin(5, 3), clueCell = puzzle.clues.findIndex(Boolean);
    const clues = [...puzzle.clues]; clues[clueCell] = { ...clues[clueCell]!, count: clues[clueCell]!.count + 1 };
    expect(checkYajilin({ ...puzzle, clues }, puzzle.solution.shaded, puzzle.solution.edges).errors).toContain(clueCell);
    expect(solveYajilin(puzzle)).toMatchObject({ count: 1, complete: true });
    expect(solveYajilin(puzzle, { nodes: 1 })).toMatchObject({ complete: false });
    expect(isYajilinBoard({ width: 5, height: 5, clues: Array(24).fill(null) })).toBe(false);
  });

  it("makes reproducible varied layouts and proves each answer", () => {
    const patterns = new Set<string>(), loopLengths = new Set<number>();
    for (let seed = 1; seed <= 30; seed += 1) {
      const puzzle = generateYajilin(5, seed);
      expect(puzzle).toEqual(generateYajilin(5, seed));
      expect(checkYajilin(puzzle, puzzle.solution.shaded, puzzle.solution.edges).ok).toBe(true);
      expect(solveYajilin(puzzle)).toMatchObject({ count: 1, complete: true });
      patterns.add(JSON.stringify(puzzle.clues)); loopLengths.add(puzzle.solution.edges.length);
    }
    expect(patterns.size).toBeGreaterThan(10);
    expect(loopLengths).toEqual(new Set([8, 10]));
    expect(() => (generateYajilin as (size: number, seed: number) => unknown)(7, 1)).toThrow();
  });

  it("keeps play immutable and saves only the public board and progress", () => {
    const puzzle = generateYajilin(), game = newYajilin(puzzle);
    const cell = puzzle.solution.shaded.findIndex(Boolean), shaded = toggleYajilinShade(game, cell);
    expect(game.shaded[cell]).toBe(false); expect(shaded.shaded[cell]).toBe(true);
    const line = toggleYajilinEdge(shaded, puzzle.solution.edges[0]!);
    expect(undoYajilin(line).edges).toEqual([]);
    expect(hintYajilin(game)).not.toBeNull();
    const encoded = encodeYajilin(line);
    expect(encoded).not.toContain("solution");
    expect(decodeYajilin(encoded)?.shaded).toEqual(line.shaded);
    expect(decodeYajilin("{")).toBeNull();
  });
});
