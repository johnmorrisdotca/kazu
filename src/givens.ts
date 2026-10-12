import { decodeCells } from "./cells.ts";
import { decodeJigsaw } from "./jigsaw.ts";
import type { KazuKind } from "./kinds.ts";
import { boxedLayout, cagedLayout, KAZU_BOXES, regionLayout, type Layout } from "./layout.ts";
import { decodeMoreOrLess, type Mark } from "./more-or-less-code.ts";
import { decodeKiller, type Cage } from "./sum-cages.ts";
import { decodeTowers, type TowerClues } from "./towers-code.ts";

/**
 * WHAT A PUZZLE WAS PRINTED WITH, read from its givens code: the printed cells, and for a Jigsaw its
 * regions, for Sum Cages its cages, for More or Less its marks, for Towers its clues. Each kind
 * writes them after the cells. The drawing, the play and the hint all read a puzzle through this.
 *
 * @example
 * ```ts
 * import type { KazuGivens, KazuPuzzle } from "@johnmorrisdotca/kazu";
 * import { readGivens } from "@johnmorrisdotca/kazu";
 *
 * const puzzle: KazuPuzzle = {"kind":"number-place","size":4,"level":"easy","seed":42,"givens":"14..2..1412.3..4","solution":"1432234141233214"};
 * const kind = puzzle.kind;
 * const size = puzzle.size;
 * const givens = puzzle.givens;
 * const printed = readGivens(kind,size,givens)!;
 * const value: KazuGivens = printed;
 * console.log(value);
 * ```
 */
export type KazuGivens = {
  kind: KazuKind;
  size: number;
  /** The printed numbers, row-major; 0 where nothing is printed. */
  cells: number[];
  /** The region each cell is drawn in (a box, or a Jigsaw's own region), which the heavy rules go round; null for More or Less and Towers. */
  regions: number[] | null;
  /** Whether the two long diagonals are groups too (Diagonal). */
  diagonals: boolean;
  /** Sum Cages: the cages and their sums. */
  cages: Cage[] | null;
  /** More or Less: which of two neighbouring cells is bigger. */
  marks: Mark[];
  /** Towers: the clues round the edge. */
  clues: TowerClues | null;
};

/** The givens of a puzzle, or null for a code that is not one of that kind and side. Null rather than a puzzle with holes.
 *
 * @param kind - The native number-grid puzzle key.
 * @param size - The supported square grid side length.
 * @param code - The native encoded clues, entries or notes specified by the signature.
 * @returns The givens of a puzzle, or null for a code that is not one of that kind and side. null rather than a puzzle with holes.
 * @example
 * ```ts
 * import type { KazuPuzzle } from "@johnmorrisdotca/kazu";
 * import { readGivens } from "@johnmorrisdotca/kazu";
 *
 * const puzzle: KazuPuzzle = {"kind":"number-place","size":4,"level":"easy","seed":42,"givens":"14..2..1412.3..4","solution":"1432234141233214"};
 * const kind = puzzle.kind;
 * const size = puzzle.size;
 * const givens = puzzle.givens;
 * console.log(readGivens(kind,size,givens)?.size);
 * ```
 */
export function readGivens(kind: KazuKind, size: number, code: string): KazuGivens | null {
  const plain = { kind, size, regions: null, diagonals: false, cages: null, marks: [], clues: null };
  const boxed = KAZU_BOXES[size] === undefined ? null : boxedLayout(size).region;
  if (kind === "number-place" || kind === "diagonal") {
    const cells = decodeCells(code, size);
    return cells === null || boxed === null ? null : { ...plain, cells, regions: boxed, diagonals: kind === "diagonal" };
  }
  if (kind === "jigsaw") {
    const read = decodeJigsaw(code, size);
    return read === null ? null : { ...plain, cells: read.cells, regions: read.regions };
  }
  if (kind === "sum-cages") {
    const read = decodeKiller(code, size);
    return read === null || boxed === null ? null : { ...plain, cells: read.cells, regions: boxed, cages: read.cages };
  }
  if (kind === "more-or-less") {
    const read = decodeMoreOrLess(code, size);
    return read === null ? null : { ...plain, cells: read.cells, marks: read.marks };
  }
  if (kind === "towers") {
    const read = decodeTowers(code, size);
    return read === null ? null : { ...plain, cells: read.cells, clues: read.clues };
  }
  return null;
}

/** The groups that must each hold every number once, for the four kinds made of groups; null for More or Less and Towers, which only have rows and columns.
 *
 * @param givens - The original native printed-clue code.
 * @returns The group layout, or null for a kind whose rules use separate marks or visibility clues.
 * @example
 * ```ts
 * import type { KazuPuzzle } from "@johnmorrisdotca/kazu";
 * import { layoutOfGivens, readGivens } from "@johnmorrisdotca/kazu";
 *
 * const puzzle: KazuPuzzle = {"kind":"number-place","size":4,"level":"easy","seed":42,"givens":"14..2..1412.3..4","solution":"1432234141233214"};
 * const kind = puzzle.kind;
 * const size = puzzle.size;
 * const givens = puzzle.givens;
 * const printed = readGivens(kind,size,givens)!;
 * console.log(layoutOfGivens(printed)?.groups.length);
 * ```
 */
export function layoutOfGivens(givens: KazuGivens): Layout | null {
  const { kind, size } = givens;
  if (kind === "number-place" || kind === "diagonal") return boxedLayout(size, kind === "diagonal");
  if (kind === "jigsaw") return givens.regions === null ? null : regionLayout(size, givens.regions);
  if (kind === "sum-cages") return givens.cages === null ? null : cagedLayout(size, givens.cages);
  return null;
}
