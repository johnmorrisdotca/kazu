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

/** The givens of a puzzle, or null for a code that is not one of that kind and side. Null rather than a puzzle with holes. */
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

/** The groups that must each hold every number once, for the four kinds made of groups; null for More or Less and Towers, which only have rows and columns. */
export function layoutOfGivens(givens: KazuGivens): Layout | null {
  const { kind, size } = givens;
  if (kind === "number-place" || kind === "diagonal") return boxedLayout(size, kind === "diagonal");
  if (kind === "jigsaw") return givens.regions === null ? null : regionLayout(size, givens.regions);
  if (kind === "sum-cages") return givens.cages === null ? null : cagedLayout(size, givens.cages);
  return null;
}
