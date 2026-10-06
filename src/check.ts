import { decodeCells } from "./cells.ts";
import { readGivens } from "./givens.ts";
import { decodeJigsaw } from "./jigsaw.ts";
import { isKazuSize, type KazuCheck, type KazuKind } from "./kinds.ts";
import { boxedLayout, regionLayout, regionsAreSound, type Layout } from "./layout.ts";
import { decodeMoreOrLess } from "./more-or-less-code.ts";
import { decodeKiller } from "./sum-cages.ts";
import { decodeTowers, lineFrom, TOWER_SIDES } from "./towers-code.ts";

/**
 * Whether an answer solves a puzzle: O(cells), no search, nothing remembered between calls. A browser
 * runs it to say "done"; a server runs it before it believes a solve, so a grid that is right is
 * accepted and a grid that was merely posted is not. It refuses rather than repairs: a grid of the
 * wrong size, a value out of range or a given moved is a "no" with its reason, never a best guess at
 * what was meant.
 *
 * The rules of each puzzle are restated here rather than shared with the solver on purpose: the
 * solver is what MADE the puzzle, and a check that reads the solver's mind proves only that the
 * solver agrees with itself.
 */
export function checkKazu(kind: KazuKind, size: number, givens: string, answer: string): KazuCheck {
  if (!isKazuSize(kind, size)) return { ok: false, reason: `no ${kind} at ${size}` };
  switch (kind) {
    case "number-place":
      return checkOnLayout(boxedLayout(size), decodeCells(givens, size), answer);
    case "diagonal":
      return checkOnLayout(boxedLayout(size, true), decodeCells(givens, size), answer);
    case "jigsaw":
      return checkJigsaw(size, givens, answer);
    case "sum-cages":
      return checkSumCages(size, givens, answer);
    case "more-or-less":
      return checkMoreOrLess(size, givens, answer);
    case "towers":
      return checkTowers(size, givens, answer);
    default:
      return { ok: false, reason: `no check for ${String(kind)}` };
  }
}

/**
 * A Jigsaw is checked against the regions it was handed, in its givens. They must be sound (`size`
 * joined regions of `size` cells) or the grid is refused before it is read: regions of one cell each
 * would make any grid whose rows and columns are right look like an answer.
 */
function checkJigsaw(size: number, givens: string, answer: string): KazuCheck {
  const asked = decodeJigsaw(givens, size);
  if (asked === null) return { ok: false, reason: "the givens are not a grid with regions" };
  if (!regionsAreSound(size, asked.regions)) return { ok: false, reason: "the regions do not divide the grid" };
  return checkOnLayout(regionLayout(size, asked.regions), asked.cells, answer);
}

/**
 * Sum Cages: a Sudoku grid, and every cage it was handed holds no number twice and adds to its sum.
 * The cages come from the givens, as a Jigsaw's regions do; each cell is in exactly one, which the
 * code's shape already guarantees.
 */
function checkSumCages(size: number, givens: string, answer: string): KazuCheck {
  const asked = decodeKiller(givens, size);
  if (asked === null) return { ok: false, reason: "the givens are not a grid with cages" };
  const plain = checkOnLayout(boxedLayout(size), asked.cells, answer);
  if (!plain.ok) return plain;
  const filled = decodeCells(answer, size)!;
  for (const [at, cage] of asked.cages.entries()) {
    const values = cage.cells.map((index) => filled[index]!);
    if (new Set(values).size !== values.length) return { ok: false, reason: `cage ${at + 1} repeats a number` };
    if (values.reduce((total, value) => total + value, 0) !== cage.sum) return { ok: false, reason: `cage ${at + 1} does not add to ${cage.sum}` };
  }
  return { ok: true };
}

/** Every group of the layout holds every number once, and no given was changed. One pass over the cells. */
function checkOnLayout(layout: Layout, asked: number[] | null, answer: string): KazuCheck {
  const { size } = layout;
  const filled = decodeCells(answer, size);
  if (asked === null) return { ok: false, reason: "the givens are not a grid" };
  if (filled === null) return { ok: false, reason: "the answer is not a grid" };
  if (filled.some((value) => value === 0)) return { ok: false, reason: "the answer has empty cells" };
  for (let index = 0; index < asked.length; index += 1) {
    if (asked[index] !== 0 && asked[index] !== filled[index]) return { ok: false, reason: "a given was changed" };
  }
  const seen = new Array<number>(layout.groups.length).fill(0);
  for (let index = 0; index < filled.length; index += 1) {
    const bit = 1 << filled[index]!;
    for (const group of layout.groupsOf[index]!) {
      if (seen[group]! & bit) return { ok: false, reason: `${groupName(layout, group)} repeats a number` };
      seen[group]! |= bit;
    }
  }
  return { ok: true };
}

/** "row 3", "column 5", "box 2", "region 4", "a diagonal": the groups in `layout.ts`'s order. */
function groupName(layout: Layout, group: number): string {
  const { size } = layout;
  if (group < size) return `row ${group + 1}`;
  if (group < 2 * size) return `column ${group - size + 1}`;
  if (group < 3 * size) return `${layout.regionWord} ${group - 2 * size + 1}`;
  return "a diagonal";
}

function checkMoreOrLess(size: number, givens: string, answer: string): KazuCheck {
  const asked = decodeMoreOrLess(givens, size);
  if (asked === null) return { ok: false, reason: "the givens are not a grid with marks" };
  const square = checkLatinSquare(size, asked.cells, answer);
  if (!square.ok) return square;
  const filled = decodeCells(answer, size)!;
  for (const mark of asked.marks) {
    if (!(filled[mark.less]! < filled[mark.more]!)) return { ok: false, reason: "a mark is not true" };
  }
  return { ok: true };
}

/** Every row and column a permutation of 1..size, nothing empty, and every given where it was: More or Less and Towers alike. */
function checkLatinSquare(size: number, asked: readonly number[], answer: string): KazuCheck {
  const filled = decodeCells(answer, size);
  if (filled === null) return { ok: false, reason: "the answer is not a grid" };
  if (filled.some((value) => value === 0)) return { ok: false, reason: "the answer has empty cells" };
  for (let index = 0; index < asked.length; index += 1) {
    if (asked[index] !== 0 && asked[index] !== filled[index]) return { ok: false, reason: "a given was changed" };
  }
  const rows = Array.from({ length: size }, () => 0);
  const cols = Array.from({ length: size }, () => 0);
  for (let index = 0; index < filled.length; index += 1) {
    const bit = 1 << filled[index]!;
    const row = Math.floor(index / size);
    const col = index % size;
    if (rows[row]! & bit) return { ok: false, reason: `row ${row + 1} repeats a number` };
    if (cols[col]! & bit) return { ok: false, reason: `column ${col + 1} repeats a number` };
    rows[row]! |= bit;
    cols[col]! |= bit;
  }
  return { ok: true };
}

/**
 * Towers: a Latin square that keeps its givens, and from every clue exactly that many towers show.
 * The counting is written out here rather than taken from `towersSeen`, which the solver that made
 * the puzzle uses; only where each clue looks from is shared, because that is the spelling.
 */
function checkTowers(size: number, givens: string, answer: string): KazuCheck {
  const asked = decodeTowers(givens, size);
  if (asked === null) return { ok: false, reason: "the givens are not a square with clues" };
  const square = checkLatinSquare(size, asked.cells, answer);
  if (!square.ok) return square;
  const filled = decodeCells(answer, size)!;
  for (const side of TOWER_SIDES) {
    for (let at = 0; at < size; at += 1) {
      const clue = asked.clues[side][at]!;
      if (clue === 0) continue;
      let tallest = 0;
      let seen = 0;
      for (const index of lineFrom(side, at, size)) {
        if (filled[index]! > tallest) {
          tallest = filled[index]!;
          seen += 1;
        }
      }
      if (seen !== clue) return { ok: false, reason: `the ${side} clue ${clue} sees ${seen}` };
    }
  }
  return { ok: true };
}

/** Whether a puzzle's givens are a well-formed puzzle of that kind and side at all (a Jigsaw's regions sound, every code readable). */
export function isKazuGivens(kind: KazuKind, size: number, givens: string): boolean {
  const read = readGivens(kind, size, givens);
  if (read === null) return false;
  return kind !== "jigsaw" || (read.regions !== null && regionsAreSound(size, read.regions));
}
