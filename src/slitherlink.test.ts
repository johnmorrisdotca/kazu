import { describe, expect, it } from "vitest";
import {
  checkSlitherlink,
  progressSlitherlink,
} from "./slitherlinkBoard.ts";
import { solveSlitherlink } from "./slitherlinkSolve.ts";
import { generateSlitherlink } from "./slitherlinkGenerate.ts";
import {
  decodeSlitherlink,
  encodeSlitherlink,
  hintSlitherlink,
  newSlitherlink,
  toggleSlitherlink,
  undoSlitherlink,
} from "./slitherlinkGame.ts";
import { drawSlitherlink } from "./slitherlinkDraw.ts";

describe("Slitherlink loop rules", () => {
  it("checks loop closure, connectedness, vertex degree and numbered cell edges", () => {
    const board = { width: 2, height: 2, clues: [null, null, null, null] } as const;
    const oneCellLoop = [0, 2, 6, 7];
    expect(checkSlitherlink(board, oneCellLoop)).toMatchObject({ ok: true, loops: 1 });
    expect(checkSlitherlink(board, [0, 2, 6])).toMatchObject({ ok: false });
    expect(checkSlitherlink(board, [0])).toMatchObject({ ok: false, loops: 0 });

    const separated = { width: 3, height: 2, clues: Array(6).fill(null) };
    expect(checkSlitherlink(separated, [0, 3, 9, 10, 5, 8, 15, 16]))
      .toMatchObject({ ok: false, loops: 2 });
    const clue = { ...board, clues: [1, null, null, null] };
    expect(checkSlitherlink(clue, oneCellLoop)).toMatchObject({ ok: false, clues: [0] });
  });

  it("allows unfinished clues in progress checks but flags branches and overfilled numbers", () => {
    const board = { width: 2, height: 2, clues: [1, null, null, null] } as const;
    expect(progressSlitherlink(board, [0])).toMatchObject({ ok: true, clues: [] });
    expect(progressSlitherlink(board, [0, 1, 7]).ok).toBe(false);
    expect(progressSlitherlink(board, [0, 1, 6, 7]).clues).toEqual([0]);
  });

  it("counts completions honestly and stops when a node budget is reached", () => {
    const board = { width: 2, height: 2, clues: [2, 2, 2, 2] } as const;
    expect(solveSlitherlink(board, { limit: 100 })).toMatchObject({ count: 1, complete: true });
    const open = { width: 3, height: 3, clues: Array(9).fill(null) };
    expect(solveSlitherlink(open, { limit: 10_000 })).toMatchObject({ complete: true });
    expect(solveSlitherlink(open, { limit: 10_000, nodes: 3 })).toMatchObject({ complete: false });
    expect(() => solveSlitherlink(board, { limit: 0 })).toThrow(RangeError);
  });

  it("agrees with an independent exhaustive edge oracle on small clue sets", () => {
    const boards = [
      [null, null, null, null],
      [1, null, null, null],
      [2, 2, 2, 2],
      [0, 1, null, 2],
      [1, 3, 1, 3],
    ];
    for (const clues of boards) {
      const board = { width: 2, height: 2, clues };
      const answer = solveSlitherlink(board, { limit: 100, nodes: 100_000 });
      expect(answer.complete).toBe(true);
      expect(answer.count).toBe(bruteCount(board));
    }
  });

  it("keeps play immutable, supports undo, offers proved hints and validates public saves", () => {
    const puzzle = generateSlitherlink(5, 5, 7);
    const game = newSlitherlink(puzzle);
    const moved = toggleSlitherlink(game, 0);
    expect(game.edges).toEqual([]);
    expect(moved.edges).toEqual([0]);
    expect(undoSlitherlink(moved).edges).toEqual([]);
    expect(toggleSlitherlink(moved, 99)).toBe(moved);
    expect(decodeSlitherlink(encodeSlitherlink(moved))?.edges).toEqual([0]);
    expect(decodeSlitherlink(JSON.stringify({ version: 1, board: puzzle, edges: [0, 0], helped: false }))).toBeNull();
    expect(encodeSlitherlink(game)).not.toContain("solution");
    expect(hintSlitherlink(game)).not.toBeNull();
    expect(decodeSlitherlink("{")).toBeNull();
  });

  it("makes repeatable boards of any size from 2 to 10 and proves each has one answer", () => {
    for (const [width, height] of [[5, 5], [7, 7], [10, 6], [6, 10], [2, 2]]) {
      for (let seed = 1; seed <= 6; seed += 1) {
        const puzzle = generateSlitherlink(width, height, seed);
        expect(checkSlitherlink(puzzle, puzzle.solution).ok).toBe(true);
        expect(solveSlitherlink(puzzle)).toMatchObject({ count: 1, complete: true });
        expect(generateSlitherlink(width, height, seed)).toEqual(puzzle);
      }
    }
    expect(generateSlitherlink(5, 5, 1)).not.toEqual(generateSlitherlink(5, 5, 2));
    expect(() => generateSlitherlink(11, 5, 1)).toThrow(RangeError);
  });

  it("draws clues and selected loop edges in each board material", () => {
    const puzzle = generateSlitherlink(5, 5, 3);
    for (const material of ["ivory", "wood", "slate"] as const) {
      const svg = drawSlitherlink(puzzle, { edges: puzzle.solution, selected: puzzle.solution[0], material, language: "ja" });
      expect(svg).toContain("スリザーリンク");
      expect(svg).toContain("<line");
      expect(svg).toContain("<circle");
      expect(svg).not.toContain("solution");
    }
  });
});

function bruteCount(board: { width: number; height: number; clues: readonly (number | null)[] }): number {
  const horizontal = (board.height + 1) * board.width;
  const edgeCount = horizontal + board.height * (board.width + 1);
  let count = 0;
  for (let mask = 0; mask < 2 ** edgeCount; mask += 1) {
    const edges = Array.from({ length: edgeCount }, (_, edge) => edge).filter(edge => mask & 1 << edge);
    if (!edges.length) continue;
    const selected = new Set(edges);
    const vertexEdges = Array.from({ length: (board.width + 1) * (board.height + 1) }, (_, vertex) => {
      const x = vertex % (board.width + 1);
      const y = Math.floor(vertex / (board.width + 1));
      const adjacent: number[] = [];
      if (x > 0) adjacent.push(y * board.width + x - 1);
      if (x < board.width) adjacent.push(y * board.width + x);
      if (y > 0) adjacent.push(horizontal + (y - 1) * (board.width + 1) + x);
      if (y < board.height) adjacent.push(horizontal + y * (board.width + 1) + x);
      return adjacent.filter(edge => selected.has(edge));
    });
    if (vertexEdges.some(incident => incident.length !== 0 && incident.length !== 2)) continue;
    const clueMatches = board.clues.every((clue, cell) => {
      if (clue === null) return true;
      const x = cell % board.width;
      const y = Math.floor(cell / board.width);
      const surrounding = [y * board.width + x,
        horizontal + y * (board.width + 1) + x + 1,
        (y + 1) * board.width + x,
        horizontal + y * (board.width + 1) + x];
      return surrounding.filter(edge => selected.has(edge)).length === clue;
    });
    if (!clueMatches) continue;
    const ends = (edge: number) => edge < horizontal
      ? [Math.floor(edge / board.width) * (board.width + 1) + edge % board.width,
        Math.floor(edge / board.width) * (board.width + 1) + edge % board.width + 1]
      : [Math.floor((edge - horizontal) / (board.width + 1)) * (board.width + 1) + (edge - horizontal) % (board.width + 1),
        (Math.floor((edge - horizontal) / (board.width + 1)) + 1) * (board.width + 1) + (edge - horizontal) % (board.width + 1)];
    const reached = new Set([edges[0]]);
    const queue = [edges[0]!];
    while (queue.length) {
      const edge = queue.pop()!;
      for (const vertex of ends(edge)) {
        for (const neighbour of edges) {
          if (reached.has(neighbour) || !ends(neighbour).includes(vertex)) continue;
          reached.add(neighbour);
          queue.push(neighbour);
        }
      }
    }
    if (reached.size === edges.length) count += 1;
  }
  return count;
}
