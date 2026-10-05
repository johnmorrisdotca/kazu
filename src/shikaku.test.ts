import { describe, expect, it } from "vitest";
import { checkShikaku, isShikakuBoard, shikakuCandidates } from "./shikakuBoard.ts";
import { solveShikaku } from "./shikakuSolve.ts";
import { generateShikaku } from "./shikakuGenerate.ts";
import { decodeShikaku, encodeShikaku, hintShikaku, newShikaku, placeShikaku, removeShikaku, undoShikaku } from "./shikakuGame.ts";
import { drawShikaku } from "./shikakuDraw.ts";

const board = { width: 3, height: 2, clues: [3, 0, 0, 0, 0, 3] };
describe("Shikaku rectangle rules", () => {
  it("counts an ambiguous board without claiming uniqueness", () => {
    const solved = solveShikaku(board, [], { limit: 10 });
    expect(solved).toMatchObject({ count: 1, complete: true });
    const ambiguous = { width: 2, height: 2, clues: [2, 0, 0, 2] };
    expect(solveShikaku(ambiguous, [], { limit: 10 })).toMatchObject({ count: 2, complete: true });
    expect(solveShikaku(ambiguous)).toMatchObject({ count: 2, complete: false });
  });
  it("never calls a bounded search a proved answer", () => {
    expect(solveShikaku(board, [], { nodes: 1 })).toMatchObject({ count: 0, complete: false });
  });
  it("checks coverage, clue area, overlap, empty rectangles and bounds independently", () => {
    const top = { x: 0, y: 0, width: 3, height: 1 }, bottom = { ...top, y: 1 };
    expect(checkShikaku(board, [top, bottom]).ok).toBe(true);
    expect(checkShikaku(board, [top]).ok).toBe(false);
    expect(checkShikaku(board, [top, top, bottom]).errors).toContain(1);
    expect(checkShikaku(board, [{ ...top, width: 2 }]).errors).toEqual([0]);
    expect(checkShikaku(board, [{ ...top, x: -1 }]).errors).toEqual([0]);
    expect(checkShikaku(board, [{ x: 1, y: 0, width: 1, height: 1 }]).errors).toEqual([0]);
    expect(isShikakuBoard({ ...board, clues: [0, 0, 0, 0, 0, 0] })).toBe(false);
  });
  it("candidate rectangles obey exactly one area clue", () => {
    for (const c of shikakuCandidates(board, 0)) expect(checkShikaku(board, [c]).errors).toEqual([]);
  });
  it("leaves games untouched, replaces touching rectangles and restores undo", () => {
    const game = newShikaku(board), top = { x: 0, y: 0, width: 3, height: 1 };
    const first = placeShikaku(game, top), replacement = placeShikaku(first, { ...top, width: 1 });
    expect(game.rectangles).toEqual([]); expect(first.rectangles).toEqual([top]);
    expect(replacement.rectangles).toHaveLength(1); expect(undoShikaku(replacement).rectangles).toEqual([top]);
    expect(removeShikaku(first, 0).rectangles).toEqual([]);
    expect(hintShikaku(game)).not.toBeNull();
    expect(hintShikaku(newShikaku({ width: 2, height: 2, clues: [2, 0, 0, 2] }))).toBeNull();
  });
  it("saves public data without an answer and rejects malformed or overlapping placement data", () => {
    const game = placeShikaku(newShikaku(board), { x: 0, y: 0, width: 3, height: 1 });
    expect(decodeShikaku(encodeShikaku(game))?.rectangles).toEqual(game.rectangles);
    expect(encodeShikaku(newShikaku(generateShikaku(5, 5, "easy", 2)))).not.toContain("solution");
    expect(decodeShikaku('{')).toBeNull();
    expect(decodeShikaku(JSON.stringify({ version: 1, board, rectangles: [game.rectangles[0], game.rectangles[0]], helped: false }))).toBeNull();
  });
  it("generates reproducible, unique, valid puzzles at each level and rectangular size", () => {
    for (const level of ["easy", "medium", "hard"] as const) {
      for (const [w, h] of [[5, 5], [7, 7], [9, 6]]) {
        for (let seed = 1; seed <= 8; seed += 1) {
          const puzzle = generateShikaku(w, h, level, seed);
          expect(checkShikaku(puzzle, puzzle.solution).ok).toBe(true);
          expect(solveShikaku(puzzle)).toMatchObject({ count: 1, complete: true });
          expect(generateShikaku(w, h, level, seed)).toEqual(puzzle);
        }
      }
    }
  });
  it("SVG shows only clues and placements and supports every material", () => {
    for (const material of ["ivory", "wood", "slate"] as const) {
      const svg = drawShikaku(board, { material, pieces: "tiles", language: "ja" });
      expect(svg).toContain('viewBox="-2 -2 148 100"'); expect(svg).toContain("四角に切れ");
      expect(svg).not.toContain("solution");
    }
  });
});

/** Independent tiny-board oracle: enumerate geometric tilings from the first uncovered cell. */
function bruteCount(clues: readonly number[], occupied = 0): number {
  if (occupied === 15) return 1;
  const first = [0, 1, 2, 3].find(c => !(occupied & 1 << c))!;
  const x = first % 2, y = Math.floor(first / 2);
  let total = 0;
  for (let w = 1; x + w <= 2; w += 1) for (let h = 1; y + h <= 2; h += 1) {
    const cells = [];
    for (let dy = 0; dy < h; dy += 1) for (let dx = 0; dx < w; dx += 1) cells.push((y + dy) * 2 + x + dx);
    if (cells.some(c => occupied & 1 << c)) continue;
    const numbered = cells.filter(c => clues[c] > 0);
    if (numbered.length !== 1 || clues[numbered[0]] !== cells.length) continue;
    total += bruteCount(clues, occupied | cells.reduce((mask, c) => mask | 1 << c, 0));
  }
  return total;
}
it("agrees with a separate geometric oracle for every possible 2×2 clue board", () => {
  for (let code = 0; code < 625; code += 1) {
    const clues = [0, 1, 2, 3].map(c => Math.floor(code / 5 ** c) % 5);
    if (clues.reduce((a, b) => a + b, 0) !== 4) continue;
    const answer = solveShikaku({ width: 2, height: 2, clues }, [], { limit: 100 });
    expect(answer.complete).toBe(true); expect(answer.count).toBe(bruteCount(clues));
  }
});

describe("Shikaku challenge packs", () => {
  it("offers square, wide and tall routes with independently proved puzzles", async () => {
    const { SHIKAKU_CHALLENGE_PACKS, generateShikakuChallenge } = await import("./shikakuPacks.ts");
    for (const key of ["square", "wide", "tall"] as const) {
      const pack = SHIKAKU_CHALLENGE_PACKS[key];
      expect(pack.challenges).toHaveLength(3);
      for (let index = 1; index <= pack.challenges.length; index += 1) {
        const result = generateShikakuChallenge(key, index);
        expect(result.puzzle).toMatchObject({ width: pack.width, height: pack.height, level: pack.challenges[index - 1]!.level, seed: pack.challenges[index - 1]!.seed });
        expect(solveShikaku(result.puzzle)).toMatchObject({ count: 1, complete: true });
        expect(generateShikakuChallenge(key, index)).toEqual(result);
      }
    }
    expect(() => generateShikakuChallenge("square", 0)).toThrow(RangeError);
  });
});
