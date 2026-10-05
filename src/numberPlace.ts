import { encodeCells } from "./cells.ts";
import { countSolutions, guessDepth, provedByGuessing, type Grid } from "./groupSolve.ts";
import type { KazuLevel, KazuPuzzle } from "./kinds.ts";
import { boxedLayout, type Layout } from "./layout.ts";
import { seededRandom, shuffled, type Random } from "./random.ts";

/**
 * Making a Sudoku (Number Place) puzzle, and its Diagonal variant, from a seed.
 *
 * Two steps. Fill a whole grid by backtracking with the values tried in a seeded order, so the seed
 * decides the grid. Then take cells away in a seeded order, keeping each removal only while the
 * puzzle still has exactly one answer AND stays within the level: an easy puzzle must go on
 * yielding to singles, a medium one to a single guess, a hard one to whatever it takes. The
 * removal stops at the level's floor of givens, so a hard 9×9 does not run every one of its 81
 * cells past the solver for the sake of two more blanks.
 *
 * Everything here is deterministic in the seed. Change this file and every seed makes a different
 * puzzle, and a solve kept as (kind, size, level, seed) is a different one: `site.fixture.test.ts`
 * holds every puzzle itsutsu.com made from its seeds, byte for byte.
 */

/**
 * How deep a guess the level allows, and where its removal stops. The floor is a count of givens
 * left, by side. Below it the solver's answer rarely changes and the time does; above it a 9×9
 * hard puzzle would be a medium one with a different label.
 */
const LEVELS: Record<KazuLevel, { depth: number; floor: Record<number, number> }> = {
  easy: { depth: 0, floor: { 4: 9, 6: 20, 9: 40, 16: 150, 25: 366 } },
  medium: { depth: 1, floor: { 4: 7, 6: 15, 9: 31, 16: 125, 25: 305 } },
  hard: { depth: Infinity, floor: { 4: 5, 6: 11, 9: 24, 16: 116, 25: 283 } },
};

/** Past this side the exact count of answers and the exact depth are not asked, only a proof (see `LARGE_GUESSES`). */
const LARGEST_COUNTED = 16;

/**
 * The 25×25 is carved by proof, not by counting. Counting every answer of a sparse 625-cell grid can run for
 * minutes (a single removal took 20 s), and the exact guess depth of one is as bad. What a person does is
 * what is asked instead: singles, then at most this many guesses at the most constrained cell, each value
 * of it either finished by singles or shown wrong by them. A puzzle that passes has exactly one answer, and
 * the work for each removal is bounded however the grid looks. Hard allows two nested guesses and no more,
 * so a 25×25 hard puzzle is one a person can finish, and easy is singles alone, as it is at every size.
 */
const LARGE_GUESSES: Record<KazuLevel, number> = { easy: 0, medium: 1, hard: 2 };

/**
 * A whole grid, filled cell by cell in reading order with the values tried in a seeded order. The
 * groups come from the layout, so the diagonals are honoured the same way.
 */
function fillInOrder(layout: Layout, random: Random): Grid {
  const { size } = layout;
  const grid: Grid = new Array<number>(size * size).fill(0);
  const values = Array.from({ length: size }, (_, i) => i + 1);
  const taken = new Array<number>(layout.groups.length).fill(0);
  const fill = (index: number): boolean => {
    if (index === grid.length) return true;
    const groups = layout.groupsOf[index]!;
    let blocked = 0;
    for (const group of groups) blocked |= taken[group]!;
    for (const value of shuffled(values, random)) {
      const bit = 1 << value;
      if (blocked & bit) continue;
      grid[index] = value;
      for (const group of groups) taken[group]! |= bit;
      if (fill(index + 1)) return true;
      for (const group of groups) taken[group]! &= ~bit;
      grid[index] = 0;
    }
    return false;
  };
  fill(0);
  return grid;
}

/**
 * A FILLED 16×16 FROM A PATTERN, SHUFFLED BY THE SEED. Cell by cell with a random order can wander
 * into a dead end deep in a 256-cell grid and take seconds to climb out. A grid that is right by
 * construction (each row the one above it shifted a box's width, each band shifted by one), then
 * shuffled in every way that keeps it right (the numbers relabelled, rows within a band, the
 * bands, columns within a stack, the stacks), is as varied and costs nothing. Only 16×16 and 25×25 are made
 * this way, so every smaller grid comes out of its seed exactly as it always has.
 */
function fillByPattern(size: number, random: Random): Grid {
  const box = Math.sqrt(size);
  const labels = shuffled(Array.from({ length: size }, (_, i) => i + 1), random);
  const order = (): number[] => shuffled(Array.from({ length: box }, (_, b) => b), random).flatMap((band) => shuffled(Array.from({ length: box }, (_, r) => band * box + r), random));
  const rows = order();
  const cols = order();
  const base = (r: number, c: number) => (box * (r % box) + Math.floor(r / box) + c) % size;
  return Array.from({ length: size * size }, (_, index) => labels[base(rows[Math.floor(index / size)]!, cols[index % size]!)]!);
}

/**
 * The givens: the solution with cells taken away in a seeded order, each removal kept only while the
 * puzzle still has one answer and stays within the level, down to the level's floor. Shared by every
 * puzzle on a layout (Sudoku, Diagonal and Jigsaw).
 */
export function carve(solution: Grid, layout: Layout, level: KazuLevel, floor: number, random: Random): Grid {
  const { depth } = LEVELS[level];
  const givens = [...solution];
  let left = givens.length;
  for (const index of shuffled(givens.map((_, i) => i), random)) {
    if (left <= floor) break;
    const value = givens[index]!;
    givens[index] = 0;
    const stillOne = layout.size > LARGEST_COUNTED
      ? provedByGuessing(givens, layout, LARGE_GUESSES[level]) === 1
      : countSolutions(givens, layout, 2) === 1 && guessDepth(givens, layout) <= depth;
    if (stillOne) left -= 1;
    else givens[index] = value;
  }
  return givens;
}

/** A Sudoku (Number Place) of this side, level and seed: 4, 6, 9, 16 or 25. */
export function generateNumberPlace(size: number, level: KazuLevel, seed: number): KazuPuzzle {
  const random = seededRandom(seed);
  const layout = boxedLayout(size);
  const solution = size >= 16 ? fillByPattern(size, random) : fillInOrder(layout, random);
  const givens = carve(solution, layout, level, LEVELS[level].floor[size]!, random);
  return { kind: "number-place", size, level, seed, givens: encodeCells(givens), solution: encodeCells(solution) };
}

/** Where a Diagonal's removal stops, by level and side: a few below the classic floors, because the extra groups need fewer givens for one answer. */
const DIAGONAL_FLOOR: Record<KazuLevel, Record<number, number>> = {
  easy: { 6: 16, 9: 34 },
  medium: { 6: 12, 9: 27 },
  hard: { 6: 9, 9: 21 },
};

/** A Diagonal Sudoku (Sudoku X): Sudoku with the two long diagonals as groups too. 6 or 9. */
export function generateDiagonal(size: number, level: KazuLevel, seed: number): KazuPuzzle {
  const random = seededRandom(seed);
  const layout = boxedLayout(size, true);
  const solution = fillInOrder(layout, random);
  const givens = carve(solution, layout, level, DIAGONAL_FLOOR[level][size]!, random);
  return { kind: "diagonal", size, level, seed, givens: encodeCells(givens), solution: encodeCells(solution) };
}
