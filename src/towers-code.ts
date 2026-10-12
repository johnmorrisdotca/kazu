import { decodeCells, EMPTY_CELL, encodeCells } from "./cells.ts";

/**
 * Towers (Skyscrapers) as a string: the cells, then the clues around the edge.
 *
 * The cells come first, row-major, as every number grid is written (`.` for
 * empty; most puzzles print none). Then one character for every place a clue
 * can stand outside the square, four sides of `size`: along the top left to
 * right, along the bottom left to right, down the left top to bottom, down the
 * right top to bottom. A digit is how many towers can be seen from there; `.`
 * is no clue. A 7×7 is 49 + 28 characters.
 *
 * @example
 * ```ts
 * import { TOWER_SIDES } from "@johnmorrisdotca/kazu";
 * console.log(TOWER_SIDES);
 * ```
 */

export const TOWER_SIDES = ["top", "bottom", "left", "right"] as const;

/** The top, bottom, left or right side of Skyscrapers visibility clues.
 *
 * @example
 * ```ts
 * import type { TowerSide } from "@johnmorrisdotca/kazu";
 *
 * const value: TowerSide = "top";
 * console.log(value);
 * ```
 */
export type TowerSide = (typeof TOWER_SIDES)[number];

/** Each side's clues, in reading order along it; 0 where there is none.
 *
 * @example
 * ```ts
 * import type { TowerClues } from "@johnmorrisdotca/kazu";
 * import { noClues } from "@johnmorrisdotca/kazu";
 *
 * const value: TowerClues = noClues(4);
 * console.log(value);
 * ```
 */
export type TowerClues = Record<TowerSide, number[]>;

/** Create empty visibility clues on all four sides of a square grid.
 *
 * @param size - The supported square grid side length.
 * @returns Create empty visibility clues on all four sides of a square grid.
 * @example
 * ```ts
 * import { noClues } from "@johnmorrisdotca/kazu";
 *
 * console.log(noClues(4));
 * ```
 */
export function noClues(size: number): TowerClues {
  return { top: new Array<number>(size).fill(0), bottom: new Array<number>(size).fill(0), left: new Array<number>(size).fill(0), right: new Array<number>(size).fill(0) };
}

/**
 * The cells a clue looks along, nearest first: the clue at `at` on the top
 * looks down column `at`, on the bottom up it, on the left along row `at`
 * to the right, on the right along it to the left.
 *
 * @param side - The top, bottom, left or right clue side.
 * @param at - The zero-based clue index along the named side.
 * @param size - The supported square grid side length.
 * @returns The cells a clue looks along, nearest first: the clue at `at` on the top looks down column `at`, on the bottom up it, on the left along row `at` to the right, on the right along it to the left.
 * @example
 * ```ts
 * import { lineFrom } from "@johnmorrisdotca/kazu";
 *
 * console.log(lineFrom("top",0,4));
 * ```
 */
export function lineFrom(side: TowerSide, at: number, size: number): number[] {
  return Array.from({ length: size }, (_, step) => {
    const far = size - 1 - step;
    if (side === "top") return step * size + at;
    if (side === "bottom") return far * size + at;
    if (side === "left") return at * size + step;
    return at * size + far;
  });
}

/** How many towers show looking along `heights` from its first end: each one taller than every one before it.
 *
 * @param heights - Tower heights in viewing order, nearest first.
 * @returns How many towers show looking along `heights` from its first end: each one taller than every one before it.
 * @example
 * ```ts
 * import { towersSeen } from "@johnmorrisdotca/kazu";
 *
 * console.log(towersSeen([1,3,2,4]));
 * ```
 */
export function towersSeen(heights: readonly number[]): number {
  let tallest = 0;
  let seen = 0;
  for (const height of heights) {
    if (height > tallest) {
      tallest = height;
      seen += 1;
    }
  }
  return seen;
}

/** Every clue a finished square makes true: what each side of it sees.
 *
 * @param solution - The completed row-major numeric grid.
 * @param size - The supported square grid side length.
 * @returns Every clue a finished square makes true: what each side of it sees.
 * @example
 * ```ts
 * import { cluesOf, decodeCells } from "@johnmorrisdotca/kazu";
 *
 * console.log(cluesOf(decodeCells("1432214343213214",4)!,4));
 * ```
 */
export function cluesOf(solution: readonly number[], size: number): TowerClues {
  const clues = noClues(size);
  for (const side of TOWER_SIDES) {
    for (let at = 0; at < size; at += 1) clues[side][at] = towersSeen(lineFrom(side, at, size).map((index) => solution[index]!));
  }
  return clues;
}

/** Encode grid numbers and four sides of visibility clues as native Skyscrapers givens.
 *
 * @param cells - Row-major numeric cells, or expected cell count for step logs as specified by the signature.
 * @param clues - Visibility clues on all four sides.
 * @returns Encode grid numbers and four sides of visibility clues as native Skyscrapers givens.
 * @example
 * ```ts
 * import type { KazuPuzzle } from "@johnmorrisdotca/kazu";
 * import { decodeTowers, encodeTowers, readGivens } from "@johnmorrisdotca/kazu";
 *
 * const puzzle: KazuPuzzle = {"kind":"number-place","size":4,"level":"easy","seed":42,"givens":"14..2..1412.3..4","solution":"1432234141233214"};
 * const kind = puzzle.kind;
 * const size = puzzle.size;
 * const givens = puzzle.givens;
 * const printed = readGivens(kind,size,givens)!;
 * const cells = printed.cells;
 * const towers = decodeTowers("......................3.2.....4.",4)!;
 * console.log(encodeTowers(towers.cells,towers.clues));
 * ```
 */
export function encodeTowers(cells: readonly number[], clues: TowerClues): string {
  const ring = TOWER_SIDES.flatMap((side) => clues[side].map((clue) => (clue === 0 ? EMPTY_CELL : String(clue))));
  return `${encodeCells(cells)}${ring.join("")}`;
}

/** The cells and clues a code says, or null for a string that is not a Towers puzzle of this size.
 *
 * @param code - The native encoded clues, entries or notes specified by the signature.
 * @param size - The supported square grid side length.
 * @returns The cells and clues a code says, or null for a string that is not a Towers puzzle of this size.
 * @example
 * ```ts
 * import type { KazuPuzzle } from "@johnmorrisdotca/kazu";
 * import { decodeTowers, readGivens } from "@johnmorrisdotca/kazu";
 *
 * const puzzle: KazuPuzzle = {"kind":"number-place","size":4,"level":"easy","seed":42,"givens":"14..2..1412.3..4","solution":"1432234141233214"};
 * const kind = puzzle.kind;
 * const size = puzzle.size;
 * const givens = puzzle.givens;
 * const printed = readGivens(kind,size,givens)!;
 * const cells = printed.cells;
 * console.log(decodeTowers("......................3.2.....4.",4)?.cells.length);
 * ```
 */
export function decodeTowers(code: string, size: number): { cells: number[]; clues: TowerClues } | null {
  if (typeof code !== "string" || code.length !== size * size + 4 * size) return null;
  const cells = decodeCells(code.slice(0, size * size), size);
  if (cells === null) return null;
  const clues = noClues(size);
  const ring = code.slice(size * size);
  for (const [s, side] of TOWER_SIDES.entries()) {
    for (let at = 0; at < size; at += 1) {
      const character = ring[s * size + at]!;
      if (character === EMPTY_CELL) continue;
      const clue = Number(character);
      if (!Number.isInteger(clue) || clue < 1 || clue > size) return null;
      clues[side][at] = clue;
    }
  }
  return { cells, clues };
}
