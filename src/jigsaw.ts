import { decodeCells, encodeCells } from "./cells.ts";
import { fillLayout } from "./group-solve.ts";
import type { KazuLevel, KazuPuzzle } from "./kinds.ts";
import { KAZU_BOXES, neighbours, regionLayout, regionsAreSound } from "./layout.ts";
import { carve } from "./number-place.ts";
import { seededRandom, type Random } from "./random.ts";

/**
 * Making a Jigsaw Sudoku from a seed: Sudoku with the boxes traded for irregular regions of the
 * same size.
 *
 * The regions come first. They start as a regular partition (the boxes where the side has boxes,
 * the rows where it does not) and are shaken by exchanges: a cell passes to a neighbouring region
 * and a cell of that region touching the first passes back, kept only while both regions stay
 * joined edge to edge, so the sizes never change. A shaken layout with a region that is still a
 * whole row or column is drawn again, because that region would ask nothing the row does not.
 *
 * Then a full grid for those regions, by the solver's own search with a step budget: some layouts
 * fill slowly, and one that runs past the budget is swapped for another rather than waited on.
 * Then the givens, carved exactly as Sudoku's are (`carve`). Deterministic in the seed.
 */

const REGION_FIRST = "a".charCodeAt(0);

/** The region of every cell as a letter, `a` for the first region and so on: one character a cell.
 *
 * @param regions - The row-major region index of every cell.
 * @returns The region of every cell as a letter, `a` for the first region and so on: one character a cell.
 * @example
 * ```ts
 * import { decodeJigsaw, encodeRegions } from "@johnmorrisdotca/kazu";
 *
 * const jigsaw = decodeJigsaw(".1.34....33..12...45423..bbaaacbaaecbeeecbddeccddd",5)!;
 * console.log(encodeRegions(jigsaw.regions));
 * ```
 */
export function encodeRegions(regions: readonly number[]): string {
  return regions.map((region) => String.fromCharCode(REGION_FIRST + region)).join("");
}

/** Regions row-major, one letter each, or null for a string that is not that.
 *
 * @param code - The native encoded clues, entries or notes specified by the signature.
 * @param size - The supported square grid side length.
 * @returns Regions row-major, one letter each, or null for a string that is not that.
 * @example
 * ```ts
 * import { decodeJigsaw, decodeRegions, encodeRegions } from "@johnmorrisdotca/kazu";
 *
 * const jigsaw = decodeJigsaw(".1.34....33..12...45423..bbaaacbaaecbeeecbddeccddd",5)!;
 * console.log(decodeRegions(encodeRegions(jigsaw.regions),5)?.length);
 * ```
 */
export function decodeRegions(code: string, size: number): number[] | null {
  if (typeof code !== "string" || code.length !== size * size) return null;
  const regions: number[] = [];
  for (const letter of code) {
    const region = letter.charCodeAt(0) - REGION_FIRST;
    if (letter.length !== 1 || region < 0 || region >= size) return null;
    regions.push(region);
  }
  return regions;
}

/**
 * A Jigsaw's givens: the cells, then the regions, one letter a cell. The regions ride in the givens
 * because they are the puzzle: a check reads a finished grid against the regions it was handed, in
 * one pass, and never has to make them again.
 *
 * @param cells - Row-major numeric cells, or expected cell count for step logs as specified by the signature.
 * @param regions - The row-major region index of every cell.
 * @returns A Jigsaw's givens: the cells, then the regions, one letter a cell. The regions ride in the givens because they are the puzzle: a check reads a finished grid against the regions it was handed, in one pass, and never has to make them again.
 * @example
 * ```ts
 * import type { KazuPuzzle } from "@johnmorrisdotca/kazu";
 * import { decodeJigsaw, encodeJigsaw, readGivens } from "@johnmorrisdotca/kazu";
 *
 * const puzzle: KazuPuzzle = {"kind":"number-place","size":4,"level":"easy","seed":42,"givens":"14..2..1412.3..4","solution":"1432234141233214"};
 * const kind = puzzle.kind;
 * const size = puzzle.size;
 * const givens = puzzle.givens;
 * const printed = readGivens(kind,size,givens)!;
 * const cells = printed.cells;
 * const jigsaw = decodeJigsaw(".1.34....33..12...45423..bbaaacbaaecbeeecbddeccddd",5)!;
 * console.log(encodeJigsaw(jigsaw.cells,jigsaw.regions));
 * ```
 */
export function encodeJigsaw(cells: readonly number[], regions: readonly number[]): string {
  return encodeCells(cells) + encodeRegions(regions);
}

/** The cells and regions a Jigsaw's givens say, or null for a string that is not a Jigsaw of this side.
 *
 * @param code - The native encoded clues, entries or notes specified by the signature.
 * @param size - The supported square grid side length.
 * @returns The cells and regions a Jigsaw's givens say, or null for a string that is not a Jigsaw of this side.
 * @example
 * ```ts
 * import type { KazuPuzzle } from "@johnmorrisdotca/kazu";
 * import { decodeJigsaw, readGivens } from "@johnmorrisdotca/kazu";
 *
 * const puzzle: KazuPuzzle = {"kind":"number-place","size":4,"level":"easy","seed":42,"givens":"14..2..1412.3..4","solution":"1432234141233214"};
 * const kind = puzzle.kind;
 * const size = puzzle.size;
 * const givens = puzzle.givens;
 * const printed = readGivens(kind,size,givens)!;
 * const cells = printed.cells;
 * console.log(decodeJigsaw(".1.34....33..12...45423..bbaaacbaaecbeeecbddeccddd",5)?.cells.length);
 * ```
 */
export function decodeJigsaw(code: string, size: number): { cells: number[]; regions: number[] } | null {
  if (typeof code !== "string" || code.length !== 2 * size * size) return null;
  const cells = decodeCells(code.slice(0, size * size), size);
  const regions = decodeRegions(code.slice(size * size), size);
  return cells === null || regions === null ? null : { cells, regions };
}

/** Where the removal stops, by level and side: the same proportions as Sudoku's floors. */
const FLOOR: Record<KazuLevel, Record<number, number>> = {
  easy: { 5: 12, 6: 18, 7: 25, 9: 38 },
  medium: { 5: 9, 6: 14, 7: 20, 9: 30 },
  hard: { 5: 7, 6: 11, 7: 16, 9: 24 },
};

/** Exchanges tried per cell when shaking the regions. */
const SHAKES_PER_CELL = 40;

/** Layouts tried before giving up; a layout that cannot be filled inside the budget is replaced. */
const LAYOUTS_TRIED = 40;

function startingRegions(size: number): number[] {
  const boxes = KAZU_BOXES[size];
  return Array.from({ length: size * size }, (_, index) => {
    const row = Math.floor(index / size);
    const col = index % size;
    return boxes === undefined ? row : Math.floor(row / boxes.rows) * (size / boxes.cols) + Math.floor(col / boxes.cols);
  });
}

function joined(size: number, region: readonly number[], group: number): boolean {
  const start = region.indexOf(group);
  const seen = new Set<number>([start]);
  const stack = [start];
  while (stack.length > 0) {
    const index = stack.pop()!;
    for (const next of neighbours(size, index)) {
      if (!seen.has(next) && region[next] === group) {
        seen.add(next);
        stack.push(next);
      }
    }
  }
  return seen.size === size;
}

/** Whether some region is exactly one row or one column. */
function hasStraightRegion(size: number, region: readonly number[]): boolean {
  for (let group = 0; group < size; group += 1) {
    const cells = region.flatMap((value, index) => (value === group ? [index] : []));
    const rows = new Set(cells.map((index) => Math.floor(index / size)));
    const cols = new Set(cells.map((index) => index % size));
    if (rows.size === 1 || cols.size === 1) return true;
  }
  return false;
}

/** Irregular regions for a grid of this side, shaken from the boxes (or the rows) by exchanges, in a seeded order. Every region is joined and none is a straight line. */
export function shakeRegions(size: number, random: Random): number[] {
  for (;;) {
    const region = startingRegions(size);
    for (let shake = 0; shake < SHAKES_PER_CELL * size * size; shake += 1) {
      /*
       * One cell passes from its region A to a neighbouring region B, and then any cell of B that
       * touches A passes back, so both keep their size. A straight swap of two neighbours almost
       * always cuts one region in two, and starting from rows it never can succeed at all.
       */
      const a = Math.floor(random() * size * size);
      const ra = region[a]!;
      const across = neighbours(size, a).filter((next) => region[next] !== ra);
      if (across.length === 0) continue;
      const rb = region[across[Math.floor(random() * across.length)]!]!;
      region[a] = rb;
      const back = region.flatMap((value, index) =>
        value === rb && index !== a && neighbours(size, index).some((next) => region[next] === ra) ? [index] : [],
      );
      if (back.length === 0) {
        region[a] = ra;
        continue;
      }
      const b = back[Math.floor(random() * back.length)]!;
      region[b] = ra;
      if (!joined(size, region, ra) || !joined(size, region, rb)) {
        region[a] = ra;
        region[b] = rb;
      }
    }
    if (!hasStraightRegion(size, region) && regionsAreSound(size, region)) return region;
  }
}

/** A Jigsaw Sudoku of this side, level and seed: 5, 6, 7 or 9.
 *
 * @param size - The supported square grid side length.
 * @param level - The native easy, medium or hard generation tier.
 * @param seed - A reproducible integer seed from 1 to KAZU_SEED_MOST.
 * @returns A Jigsaw Sudoku of this side, level and seed: 5, 6, 7 or 9.
 * @example
 * ```ts no-run
 * import type { KazuPuzzle } from "@johnmorrisdotca/kazu";
 * import { generateJigsaw } from "@johnmorrisdotca/kazu";
 *
 * const puzzle: KazuPuzzle = {"kind":"number-place","size":4,"level":"easy","seed":42,"givens":"14..2..1412.3..4","solution":"1432234141233214"};
 * const givens = puzzle.givens;
 * console.log(generateJigsaw(5,"easy",42).givens);
 * ```
 */
export function generateJigsaw(size: number, level: KazuLevel, seed: number): KazuPuzzle {
  const random = seededRandom(seed);
  for (let tried = 0; tried < LAYOUTS_TRIED; tried += 1) {
    const regions = shakeRegions(size, random);
    const layout = regionLayout(size, regions);
    const solution = fillLayout(layout, random);
    if (solution === null) continue;
    const givens = carve(solution, layout, level, FLOOR[level][size]!, random);
    return { kind: "jigsaw", size, level, seed, givens: encodeJigsaw(givens, regions), solution: encodeCells(solution) };
  }
  throw new Error(`No jigsaw could be filled from seed ${seed} at ${size}×${size}.`);
}
