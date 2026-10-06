import { decodeCells, encodeCells } from "./cells.ts";
import { countSolutionsWithin, fillLayout } from "./group-solve.ts";
import type { KazuLevel, KazuPuzzle } from "./kinds.ts";
import { boxedLayout, cagedLayout, neighbours } from "./layout.ts";
import { seededRandom, type Random } from "./random.ts";

/**
 * Making a Killer Sudoku (Sum Cages) puzzle from a seed: a filled Sudoku grid, cut into cages whose
 * sums are printed, and no numbers printed at all beyond the odd cage of one cell.
 *
 * THE CAGES ARE GROWN BY JOINING, NOT CUT. Every cell starts as a cage of its own (a grid of printed
 * numbers, which has one answer) and two neighbouring cages are joined only while the puzzle still
 * has exactly one answer, the joined cage holds no number twice, and it is no bigger than the level
 * allows. It stops at the level's count of cages. That is Sudoku's carving the other way up: there
 * a given is taken away while one answer remains; here two sums become one. The answer is checked
 * with a step budget, and a join whose check runs past it is not made: "I stopped looking" is not
 * "one answer".
 *
 * Deterministic in the seed.
 */

/** The letters that name a cage in a code: up to sixty-two cages. */
export const CAGE_LETTERS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** A cage: the cells in it and the sum of the numbers inside. */
export type Cage = { cells: number[]; sum: number };

/**
 * A Sum Cages puzzle's givens: the cells, then which cage each cell is in, then each cage's sum.
 *
 * `cells` is size² characters as every number puzzle writes them (all empty, usually; a cage of one
 * cell is its own given). `cages` is size² characters, one per cell, naming its cage from
 * `CAGE_LETTERS`. `sums` is two base-36 characters a cage, in cage order. The cages ride in the
 * givens because they are the puzzle.
 */
export function encodeKiller(cells: readonly number[], cages: readonly Cage[]): string {
  const cageOf = new Array<number>(cells.length).fill(0);
  cages.forEach((cage, c) => cage.cells.forEach((index) => (cageOf[index] = c)));
  if (cages.length > CAGE_LETTERS.length) throw new Error(`${cages.length} cages is more than a code can name.`);
  const letters = cageOf.map((c) => CAGE_LETTERS[c]).join("");
  const sums = cages.map((cage) => cage.sum.toString(36).padStart(2, "0")).join("");
  return encodeCells(cells) + letters + sums;
}

/**
 * The cells and cages a code says, or null for one that is not a whole, well-formed puzzle: every
 * cell named to a cage, every cage used, and a sum for each.
 */
export function decodeKiller(code: string, size: number): { cells: number[]; cages: Cage[] } | null {
  const area = size * size;
  if (typeof code !== "string" || code.length < 2 * area) return null;
  const cells = decodeCells(code.slice(0, area), size);
  if (cells === null) return null;
  const cageOf: number[] = [];
  for (const letter of code.slice(area, 2 * area)) {
    const c = CAGE_LETTERS.indexOf(letter);
    if (c === -1) return null;
    cageOf.push(c);
  }
  const count = Math.max(...cageOf) + 1;
  const sums = code.slice(2 * area);
  if (sums.length !== 2 * count) return null;
  const cages: Cage[] = [];
  for (let c = 0; c < count; c += 1) {
    const sum = Number.parseInt(sums.slice(2 * c, 2 * c + 2), 36);
    const members = cageOf.flatMap((value, index) => (value === c ? [index] : []));
    if (!Number.isInteger(sum) || sum <= 0 || members.length === 0) return null;
    cages.push({ cells: members, sum });
  }
  return { cells, cages };
}

/** A line segment in cell units: where one part of a cage's dashed outline runs. */
export type Segment = { x1: number; y1: number; x2: number; y2: number };

/**
 * THE DASHED OUTLINE OF EVERY CAGE, as line segments in cell units: each cage drawn a little inside
 * its own edge, the way a printed Killer Sudoku draws it, so a cage reads as a shape within the box
 * rules rather than as one of them.
 *
 * Each cell draws the sides where its neighbour is in another cage, `inset` inside the cell. Where
 * the cage goes on past a side's end, the line runs on to meet the next line of the outline: to the
 * cell's edge when the cage's edge carries on straight, and `inset` past it at an inside corner,
 * where the outline turns back into the cage. That is what makes the lines of one cage meet, with
 * no gap and no overshoot, whatever its shape.
 */
export function cageOutline(size: number, cageOf: (index: number) => number | undefined, inset = 0.12): Segment[] {
  const at = (row: number, col: number) => (row < 0 || col < 0 || row >= size || col >= size ? undefined : cageOf(row * size + col));
  const out: Segment[] = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const mine = at(row, col);
      if (mine === undefined) continue;
      const same = (r: number, c: number) => at(r, c) === mine;
      const edge = { top: !same(row - 1, col), bottom: !same(row + 1, col), left: !same(row, col - 1), right: !same(row, col + 1) };
      /*
       * How far a side's line runs past the cell toward one end: stops `inset` short when the cage
       * ends there, runs to the edge when the neighbour carries the same side on, and `inset` past
       * it at an inside corner.
       */
      const reach = (ends: boolean, neighbourHasSide: boolean) => (ends ? -inset : neighbourHasSide ? 0 : inset);
      if (edge.top) {
        const y = row + inset;
        out.push({ x1: col - reach(edge.left, !same(row - 1, col - 1) && same(row, col - 1)), y1: y, x2: col + 1 + reach(edge.right, !same(row - 1, col + 1) && same(row, col + 1)), y2: y });
      }
      if (edge.bottom) {
        const y = row + 1 - inset;
        out.push({ x1: col - reach(edge.left, !same(row + 1, col - 1) && same(row, col - 1)), y1: y, x2: col + 1 + reach(edge.right, !same(row + 1, col + 1) && same(row, col + 1)), y2: y });
      }
      if (edge.left) {
        const x = col + inset;
        out.push({ x1: x, y1: row - reach(edge.top, !same(row - 1, col - 1) && same(row - 1, col)), x2: x, y2: row + 1 + reach(edge.bottom, !same(row + 1, col - 1) && same(row + 1, col)) });
      }
      if (edge.right) {
        const x = col + 1 - inset;
        out.push({ x1: x, y1: row - reach(edge.top, !same(row - 1, col + 1) && same(row - 1, col)), x2: x, y2: row + 1 + reach(edge.bottom, !same(row + 1, col + 1) && same(row + 1, col)) });
      }
    }
  }
  return out;
}

/** The biggest cage, and how many cages to stop at, by level and side. */
const SHAPE: Record<KazuLevel, { biggest: number; cages: Record<number, number> }> = {
  easy: { biggest: 3, cages: { 6: 17, 9: 38 } },
  medium: { biggest: 4, cages: { 6: 14, 9: 31 } },
  hard: { biggest: 5, cages: { 6: 12, 9: 27 } },
};

/** Steps the answer check may take for one join before the join is passed over. */
const CHECK_BUDGET = 4_000;

/** Joins tried, per cell, before the cages are taken as they stand. */
const JOINS_PER_CELL = 12;

/**
 * Joins refused in a row, per side, after which the cages are taken as they stand. Near the level's
 * count most joins would leave two answers, and each refusal is a full search: a run of them is the
 * grid saying it is done.
 */
const REFUSED_IN_A_ROW_PER_SIDE = 3;

/** A Killer Sudoku (Sum Cages) of this side, level and seed: 6 or 9. */
export function generateSumCages(size: number, level: KazuLevel, seed: number): KazuPuzzle {
  const random = seededRandom(seed);
  for (;;) {
    const solution = fillLayout(boxedLayout(size), random);
    if (solution === null) continue;
    const cages = joinCages(size, solution, level, random);
    // A cage of one cell is printed as its number too, as it would be in a newspaper's.
    const single = new Set(cages.flatMap((cage) => (cage.cells.length === 1 ? cage.cells : [])));
    const cells = solution.map((value, index) => (single.has(index) ? value : 0));
    return { kind: "sum-cages", size, level, seed, givens: encodeKiller(cells, cages), solution: encodeCells(solution) };
  }
}

function joinCages(size: number, solution: readonly number[], level: KazuLevel, random: Random): Cage[] {
  const { biggest, cages: target } = SHAPE[level];
  const want = target[size] ?? Math.round(size * size * 0.4);
  let cages: Cage[] = solution.map((value, index) => ({ cells: [index], sum: value }));
  const blank = new Array<number>(size * size).fill(0);
  let refused = 0;
  for (let tried = 0; tried < JOINS_PER_CELL * size * size && cages.length > want && refused < REFUSED_IN_A_ROW_PER_SIDE * size; tried += 1) {
    const cageOf = new Array<number>(size * size);
    cages.forEach((cage, c) => cage.cells.forEach((index) => (cageOf[index] = c)));
    /*
     * The smallest cages first, most of the time: a cage of one cell is a printed number, and a Sum
     * Cages puzzle is the one with next to none of those. The rest of the time any cage, so the
     * shapes are not all grown from the same few.
     */
    const smallest = Math.min(...cages.map((cage) => cage.cells.length));
    const pool = random() < 0.8 ? cages.flatMap((cage, c) => (cage.cells.length === smallest ? [c] : [])) : cages.map((_, c) => c);
    const a = pool[Math.floor(random() * pool.length)]!;
    const touching = [...new Set(cages[a]!.cells.flatMap((index) => neighbours(size, index)).map((index) => cageOf[index]!))].filter((c) => c !== a);
    if (touching.length === 0) continue;
    const b = touching[Math.floor(random() * touching.length)]!;
    const cells = [...cages[a]!.cells, ...cages[b]!.cells];
    if (cells.length > biggest) continue;
    const values = cells.map((index) => solution[index]!);
    if (new Set(values).size !== values.length) continue;
    const joined: Cage = { cells: cells.sort((x, y) => x - y), sum: values.reduce((total, value) => total + value, 0) };
    const next = cages.filter((_, c) => c !== a && c !== b).concat(joined);
    // A cage of one cell is a printed number: the check sees it as a given, as the solver would.
    const givens = blank.map((_, index) => (next[cageIndex(next, index)]!.cells.length === 1 ? solution[index]! : 0));
    if (countSolutionsWithin(givens, cagedLayout(size, next), 2, CHECK_BUDGET) === 1) {
      cages = next;
      refused = 0;
    } else refused += 1;
  }
  // In reading order of each cage's first cell, so the code and the sums read top to bottom.
  return cages.sort((x, y) => x.cells[0]! - y.cells[0]!);
}

function cageIndex(cages: readonly Cage[], index: number): number {
  return cages.findIndex((cage) => cage.cells.includes(index));
}
