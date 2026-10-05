// The four levels of the six grid kinds: every one is made, has exactly one answer, is the same on every run, and steps up
// in what a person must do to solve it. Sizes here are small so the suite stays quick; scripts/measure-levels.mjs
// measures every size and times the generators.
import { describe, expect, it } from "vitest";

import { AKARI_LEVELS, AKARI_SIZES } from "./akari.constants.ts";
import { checkAkari } from "./akariBoard.ts";
import { generateAkari } from "./akariGenerate.ts";
import { rateAkari } from "./akariRate.ts";
import { solveAkari } from "./akariSolve.ts";
import { FILLOMINO_LEVELS, FILLOMINO_SIZES } from "./fillomino.constants.ts";
import { checkFillomino } from "./fillominoBoard.ts";
import { generateFillomino } from "./fillominoGenerate.ts";
import { rateFillomino } from "./fillominoRate.ts";
import { solveFillomino } from "./fillominoSolve.ts";
import { HITORI_LEVELS, HITORI_SIZES } from "./hitori.constants.ts";
import { checkHitori } from "./hitoriBoard.ts";
import { generateHitori } from "./hitoriGenerate.ts";
import { rateHitori } from "./hitoriRate.ts";
import { solveHitori } from "./hitoriSolve.ts";
import { KAKURO_LEVELS, KAKURO_SIZES } from "./kakuro.constants.ts";
import { checkKakuro } from "./kakuroBoard.ts";
import { generateKakuro } from "./kakuroGenerate.ts";
import { rateKakuro } from "./kakuroRate.ts";
import { solveKakuro } from "./kakuroSolve.ts";
import { SHIKAKU_LEVELS, SHIKAKU_SIZES } from "./shikaku.constants.ts";
import { checkShikaku } from "./shikakuBoard.ts";
import { generateShikaku } from "./shikakuGenerate.ts";
import { rateShikaku } from "./shikakuRate.ts";
import { solveShikaku } from "./shikakuSolve.ts";
import { SLITHERLINK_LEVELS, SLITHERLINK_SIZES } from "./slitherlink.constants.ts";
import { checkSlitherlink } from "./slitherlinkBoard.ts";
import { generateSlitherlink } from "./slitherlinkGenerate.ts";
import { rateSlitherlink } from "./slitherlinkRate.ts";
import { solveSlitherlink } from "./slitherlinkSolve.ts";

const LEVELS = ["easy", "medium", "hard", "extra-hard"] as const;
const SEEDS = [1, 2, 3, 4, 5, 6];

describe("the four levels", () => {
  it("are the same four words for every kind, and every kind offers at least three sizes", () => {
    for (const levels of [AKARI_LEVELS, FILLOMINO_LEVELS, HITORI_LEVELS, KAKURO_LEVELS, SHIKAKU_LEVELS, SLITHERLINK_LEVELS]) expect([...levels]).toEqual([...LEVELS]);
    for (const sizes of [AKARI_SIZES, FILLOMINO_SIZES, HITORI_SIZES, KAKURO_SIZES, SHIKAKU_SIZES, SLITHERLINK_SIZES]) expect(sizes.length).toBeGreaterThanOrEqual(3);
    expect([...KAKURO_SIZES]).toEqual([6, 8, 10, 12]);
  });

  it("are refused by name when a generator is not given one of them", () => {
    expect(() => generateAkari(5, 5, 1, "impossible" as never)).toThrow(RangeError);
    expect(() => generateHitori(5, 1, "impossible" as never)).toThrow(RangeError);
    expect(() => generateSlitherlink(5, 5, 1, "impossible" as never)).toThrow(RangeError);
    expect(() => generateKakuro(1, "impossible" as never)).toThrow(RangeError);
    expect(() => generateShikaku(5, 5, "impossible" as never, 1)).toThrow(RangeError);
    expect(() => generateFillomino(6, 6, "impossible" as never, 1)).toThrow(RangeError);
  });
});

describe("Akari", () => {
  it("has one answer at every level and size, repeats itself, and steps up in supposing", () => {
    for (const size of [5, 7, 10]) for (const level of LEVELS) for (const seed of SEEDS.slice(0, 3)) {
      const puzzle = generateAkari(size, size, seed, level);
      expect(puzzle.level).toBe(level);
      expect(checkAkari(puzzle, puzzle.solution).ok).toBe(true);
      expect(solveAkari(puzzle)).toMatchObject({ count: 1, complete: true });
      expect(generateAkari(size, size, seed, level)).toEqual(puzzle);
      const rating = rateAkari(puzzle);
      if (level === "easy" || level === "medium") expect(rating.depth).toBe(0);
      else expect(rating.depth).toBeGreaterThanOrEqual(1);
    }
  });

  it("gives easy boards more numbers than medium ones, and extra-hard ones more supposing than hard ones", () => {
    const mean = (level: (typeof LEVELS)[number], pick: (rating: ReturnType<typeof rateAkari>) => number) =>
      SEEDS.reduce((sum, seed) => sum + pick(rateAkari(generateAkari(10, 10, seed, level))), 0) / SEEDS.length;
    expect(mean("easy", rating => rating.clues)).toBeGreaterThan(mean("medium", rating => rating.clues));
    expect(mean("extra-hard", rating => rating.probes)).toBeGreaterThan(mean("hard", rating => rating.probes));
  });

  it("does not make the same board for every seed, and has a spread of white squares", () => {
    const whites = new Set(SEEDS.map(seed => generateAkari(7, 7, seed, "medium").cells.filter(cell => cell === null).length));
    expect(whites.size).toBeGreaterThan(2);
    expect(new Set(SEEDS.map(seed => generateAkari(7, 7, seed).cells.join())).size).toBe(SEEDS.length);
  });

  it("rates only a board with one answer", () => {
    expect(() => rateAkari({ width: 3, height: 3, cells: Array(9).fill(null) })).toThrow(RangeError);
  });
});

describe("Slitherlink", () => {
  it("has one answer at every level and size, repeats itself, and steps up in supposing", () => {
    for (const size of [5, 7]) for (const level of LEVELS) for (const seed of SEEDS.slice(0, 3)) {
      const puzzle = generateSlitherlink(size, size, seed, level);
      expect(puzzle.level).toBe(level);
      expect(checkSlitherlink(puzzle, puzzle.solution).ok).toBe(true);
      expect(solveSlitherlink(puzzle)).toMatchObject({ count: 1, complete: true });
      expect(generateSlitherlink(size, size, seed, level)).toEqual(puzzle);
      const rating = rateSlitherlink(puzzle);
      if (level === "easy" || level === "medium") expect(rating.depth).toBe(0);
      else expect(rating.depth).toBeGreaterThanOrEqual(1);
    }
  });

  it("numbers few squares with 0, gives easy boards more numbers than medium ones, and makes long loops", () => {
    for (const level of LEVELS) {
      const ratings = SEEDS.map(seed => rateSlitherlink(generateSlitherlink(7, 7, seed, level)));
      expect(ratings.reduce((sum, rating) => sum + rating.zeroShare, 0) / ratings.length).toBeLessThan(.25);
      expect(Math.min(...ratings.map(rating => rating.loop))).toBeGreaterThan(14);
    }
    const clues = (level: (typeof LEVELS)[number]) => SEEDS.reduce((sum, seed) => sum + rateSlitherlink(generateSlitherlink(7, 7, seed, level)).clues, 0);
    expect(clues("easy")).toBeGreaterThan(clues("medium"));
    expect(clues("medium")).toBeGreaterThan(clues("hard"));
  });
});

describe("Hitori", () => {
  it("has one answer at every level and size, repeats itself, and steps up in what it needs", () => {
    for (const size of [5, 7, 9]) for (const level of LEVELS) for (const seed of SEEDS.slice(0, 3)) {
      const puzzle = generateHitori(size, seed, level);
      expect(puzzle.level).toBe(level);
      expect(checkHitori(puzzle, puzzle.solution).ok).toBe(true);
      expect(solveHitori(puzzle)).toMatchObject({ count: 1, complete: true });
      expect(generateHitori(size, seed, level)).toEqual(puzzle);
      const rating = rateHitori(puzzle);
      if (level === "easy") expect(rating).toMatchObject({ depth: 0, reach: false });
      if (level === "medium") expect(rating).toMatchObject({ depth: 0, reach: true });
      if (level === "hard" || level === "extra-hard") expect(rating.depth).toBeGreaterThanOrEqual(1);
    }
  });

  it("shades a quarter or more of the squares, not three or four", () => {
    for (const level of LEVELS) for (const size of [7, 9]) {
      const puzzle = generateHitori(size, 3, level);
      expect(puzzle.solution.filter(Boolean).length / (size * size)).toBeGreaterThan(.2);
    }
  });

  it("offers every size from 4 to 12 and refuses others", () => {
    for (const size of [4, 6, 8, 10, 12]) expect(solveHitori(generateHitori(size, 2, "easy"))).toMatchObject({ count: 1, complete: true });
    expect(() => generateHitori(3, 1)).toThrow(RangeError);
    expect(() => generateHitori(13, 1)).toThrow(RangeError);
  });
});

describe("Kakuro", () => {
  it("has one answer at every level and size, repeats itself, and steps up in what it needs", () => {
    for (const size of [6, 8, 10]) for (const level of LEVELS) for (const seed of SEEDS.slice(0, 2)) {
      const puzzle = generateKakuro(seed, level, size);
      expect(puzzle).toMatchObject({ level, width: size, height: size });
      expect(checkKakuro(puzzle, puzzle.solution).ok).toBe(true);
      expect(solveKakuro(puzzle)).toMatchObject({ count: 1, complete: true });
      expect(generateKakuro(seed, level, size)).toEqual(puzzle);
      const rating = rateKakuro(puzzle);
      if (level === "easy") expect(rating).toMatchObject({ depth: 0, plain: true });
      if (level === "medium") expect(rating).toMatchObject({ depth: 0, plain: false });
      if (level === "hard" || level === "extra-hard") expect(rating.depth).toBeGreaterThanOrEqual(1);
    }
  });

  it("makes every seed, including 97, which the first generator could not", () => {
    for (const level of LEVELS) for (const size of KAKURO_SIZES) expect(solveKakuro(generateKakuro(97, level, size))).toMatchObject({ count: 1, complete: true });
    for (let seed = 90; seed <= 110; seed += 1) expect(solveKakuro(generateKakuro(seed))).toMatchObject({ count: 1, complete: true });
  });

  it("has longer runs and fewer fixed totals as it gets harder", () => {
    const mean = (level: (typeof LEVELS)[number], pick: (rating: ReturnType<typeof rateKakuro>) => number) =>
      SEEDS.reduce((sum, seed) => sum + pick(rateKakuro(generateKakuro(seed, level, 10))), 0) / SEEDS.length;
    expect(mean("hard", rating => rating.longest)).toBeGreaterThan(mean("easy", rating => rating.longest));
    expect(mean("easy", rating => rating.fixedShare)).toBeGreaterThan(mean("hard", rating => rating.fixedShare));
  });

  it("refuses sizes it cannot make", () => {
    expect(() => generateKakuro(1, "easy", 4)).toThrow(RangeError);
    expect(() => generateKakuro(1, "easy", 13)).toThrow(RangeError);
  });
});

describe("Shikaku", () => {
  it("has one answer at every level and size, repeats itself, and steps up in what it needs", () => {
    for (const size of [5, 7, 10]) for (const level of LEVELS) for (const seed of SEEDS.slice(0, 3)) {
      const puzzle = generateShikaku(size, size, level, seed);
      expect(puzzle.level).toBe(level);
      expect(checkShikaku(puzzle, puzzle.solution).ok).toBe(true);
      expect(solveShikaku(puzzle)).toMatchObject({ count: 1, complete: true });
      expect(generateShikaku(size, size, level, seed)).toEqual(puzzle);
      const rating = rateShikaku(puzzle);
      if (level === "easy") expect(rating).toMatchObject({ depth: 0 });
      if (level === "easy") expect(rating.rules).toBeLessThanOrEqual(2);
      if (level === "medium") expect(rating).toMatchObject({ depth: 0, rules: 3 });
      if (level === "hard" || level === "extra-hard") expect(rating.depth).toBe(1);
    }
  });

  it("cuts the board into interlocking rectangles, not only straight cuts", () => {
    let interlocked = 0;
    for (const seed of SEEDS) {
      const { solution } = generateShikaku(10, 10, "medium", seed);
      // A pinwheel: no straight line from edge to edge separates the rectangles into two groups.
      const cuts = (axis: "x" | "y") => { for (let at = 1; at < 10; at += 1) if (solution.every(r => axis === "x" ? r.x + r.width <= at || r.x >= at : r.y + r.height <= at || r.y >= at)) return true; return false; };
      if (!cuts("x") && !cuts("y")) interlocked += 1;
    }
    expect(interlocked).toBeGreaterThan(0);
  });
});

describe("Fillomino", () => {
  it("has one answer at every level and size, repeats itself, and steps up in what it needs", () => {
    for (const size of [6, 8]) for (const level of LEVELS) for (const seed of SEEDS.slice(0, 2)) {
      const puzzle = generateFillomino(size, size, level, seed);
      expect(puzzle.level).toBe(level);
      expect(checkFillomino(puzzle, puzzle.solution).ok).toBe(true);
      expect(solveFillomino(puzzle)).toMatchObject({ count: 1, complete: true });
      expect(generateFillomino(size, size, level, seed)).toEqual(puzzle);
      const rating = rateFillomino(puzzle);
      if (level === "easy" || level === "medium") expect(rating.depth).toBe(0);
      else expect(rating.depth).toBeGreaterThanOrEqual(1);
    }
  });

  it("gives fewer clues as it gets harder", () => {
    const share = (level: (typeof LEVELS)[number]) => SEEDS.reduce((sum, seed) => sum + rateFillomino(generateFillomino(8, 8, level, seed)).givenShare, 0) / SEEDS.length;
    expect(share("easy")).toBeGreaterThan(share("medium"));
    expect(share("medium")).toBeGreaterThan(share("extra-hard"));
  });

  it("makes boards up to 12 on a side, quickly enough to ask for in a page", () => {
    const started = performance.now();
    const puzzle = generateFillomino(12, 12, "medium", 5);
    expect(solveFillomino(puzzle)).toMatchObject({ count: 1, complete: true });
    expect(performance.now() - started).toBeLessThan(10_000);
  });
});
