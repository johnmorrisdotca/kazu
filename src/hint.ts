import { decodeCells } from "./cells.ts";
import { layoutOfGivens, readGivens, type KazuGivens } from "./givens.ts";
import { bitCount, candidatesAt, lowestBit, used } from "./groupSolve.ts";
import type { KazuKind } from "./kinds.ts";
import { solveKazu } from "./solve.ts";
import { cluedLines, narrowEdges } from "./towersSolve.ts";

/**
 * A HINT: the next cell a person could fill in by looking, and why.
 *
 * It reasons from what is right on the grid so far (the printed numbers and every entry that agrees
 * with the answer; a wrong entry is treated as empty, so a hint never builds on a mistake) the way a
 * person does, one step at a time:
 *
 *  1. a cell that only one number fits (`only-number`): every other number is already in its row,
 *     column, box, region, diagonal or cage, or a cage's sum, a Futoshiki mark or a Skyscrapers clue
 *     rules it out (`by` says which, when one did);
 *  2. a number that fits only one cell of a group (`only-place`): the row, column, box, region,
 *     diagonal or cage it must go in, and where.
 *
 * When neither is left (a hard puzzle asks for a guess here) it says so (`answer`): the tightest
 * cell, whose number is the answer's, with no reason a single step gives. Null when every cell is
 * already right.
 */
export type KazuHint = {
  cell: number;
  value: number;
  why: "only-number" | "only-place" | "answer";
  /** `only-place`: the group the number has one place in. */
  group?: { type: "row" | "column" | "box" | "region" | "diagonal"; index: number };
  /** `only-number`: what ruled the others out beyond the groups, if anything did. */
  by?: "cage" | "marks" | "clues";
  /** Whether the cell holds a wrong number now, which this one replaces. */
  replaces: boolean;
};

const ALL = (size: number) => (1 << (size + 1)) - 2;

/** The type and number of the group at a place in a layout's list of groups (`layout.ts`'s order): only the groups that hold every number, never a cage. */
function groupInfo(givens: KazuGivens, g: number): NonNullable<KazuHint["group"]> {
  const { size } = givens;
  if (g < size) return { type: "row", index: g };
  if (g < 2 * size) return { type: "column", index: g - size };
  if (givens.regions !== null && g < 3 * size) return { type: givens.kind === "jigsaw" ? "region" : "box", index: g - 2 * size };
  return { type: "diagonal", index: g - 3 * size };
}

/** Candidate masks for every cell of a grid, and which rule beyond the groups narrowed each. */
function candidatesFor(givens: KazuGivens, grid: number[]): { masks: number[]; by: (KazuHint["by"] | undefined)[]; groups: number[][] } | null {
  const { size } = givens;
  const layout = layoutOfGivens(givens);
  if (layout !== null) {
    const taken = used(grid, layout);
    const masks = grid.map((value, index) => (value !== 0 ? 0 : candidatesAt(layout, index, taken, grid)));
    const by = grid.map((value, index) => {
      if (value !== 0) return undefined;
      let blocked = 0;
      for (const group of layout.groupsOf[index]!) blocked |= taken[group]!;
      const open = ALL(size) & ~blocked;
      return bitCount(open) > 1 && bitCount(masks[index]!) === 1 && layout.cages !== undefined ? ("cage" as const) : undefined;
    });
    return { masks, by, groups: layout.groups };
  }
  const rows = Array.from({ length: size }, (_, r) => Array.from({ length: size }, (_, c) => r * size + c));
  const cols = Array.from({ length: size }, (_, c) => Array.from({ length: size }, (_, r) => r * size + c));
  const groups = [...rows, ...cols];
  const masks = grid.map((value, index) => {
    if (value !== 0) return 0;
    let mask = ALL(size);
    for (const other of rows[Math.floor(index / size)]!) if (grid[other] !== 0) mask &= ~(1 << grid[other]!);
    for (const other of cols[index % size]!) if (grid[other] !== 0) mask &= ~(1 << grid[other]!);
    return mask;
  });
  const plain = [...masks];
  // What the marks or the clues rule out is narrowed to a fixpoint, as a person works along a chain of them.
  if (givens.kind === "more-or-less") {
    const candidates = grid.map((value, index) => (value !== 0 ? 1 << value : masks[index]!));
    const highest = (mask: number) => 31 - Math.clz32(mask);
    for (let changed = true; changed; ) {
      changed = false;
      for (const mark of givens.marks) {
        const lessMask = candidates[mark.less]! & ((1 << highest(candidates[mark.more]!)) - 1);
        const moreMask = candidates[mark.more]! & (ALL(size) & ~((1 << (lowestBit(candidates[mark.less]!) + 1)) - 1));
        if (lessMask !== candidates[mark.less]) {
          candidates[mark.less] = lessMask;
          changed = true;
        }
        if (moreMask !== candidates[mark.more]) {
          candidates[mark.more] = moreMask;
          changed = true;
        }
      }
      if (candidates.some((mask) => mask === 0)) return null;
    }
    return { masks: grid.map((value, index) => (value !== 0 ? 0 : candidates[index]!)), by: grid.map((value, index) => (value === 0 && bitCount(plain[index]!) > 1 && bitCount(candidates[index]!) === 1 ? ("marks" as const) : undefined)), groups };
  }
  if (givens.clues !== null) {
    const candidates = grid.map((value, index) => (value !== 0 ? 1 << value : masks[index]!));
    const lines = cluedLines(size, givens.clues);
    for (let changed = true; changed; ) {
      changed = false;
      for (const line of lines) {
        const narrowed = narrowEdges(line, candidates, size);
        if (narrowed === null) return null;
        if (narrowed) changed = true;
      }
    }
    return { masks: grid.map((value, index) => (value !== 0 ? 0 : candidates[index]!)), by: grid.map((value, index) => (value === 0 && bitCount(plain[index]!) > 1 && bitCount(candidates[index]!) === 1 ? ("clues" as const) : undefined)), groups };
  }
  return { masks, by: grid.map(() => undefined), groups };
}

/**
 * The next cell a person could fill in, and why (see `KazuHint`). `entries` is what the player has
 * written, row-major (0 for empty; printed cells are ignored). `answer` is the puzzle's solution as a
 * cells code; left out, it is worked out from the givens. Null when every cell is right, or when
 * the givens are not a puzzle with exactly one answer: there is nothing true to say.
 */
export function hintKazu(kind: KazuKind, size: number, givens: string, entries: readonly number[], answer?: string): KazuHint | null {
  const read = readGivens(kind, size, givens);
  if (read === null) return null;
  const solved = decodeCells(answer ?? solveKazu(kind, size, givens) ?? "", size);
  if (solved === null) return null;
  const right = read.cells.map((printed, index) => (printed !== 0 ? printed : entries[index] === solved[index] ? solved[index]! : 0));
  if (right.every((value) => value !== 0)) return null;
  const replaces = (cell: number) => (entries[cell] ?? 0) !== 0 && read.cells[cell] === 0;
  const found = candidatesFor(read, right);
  if (found !== null) {
    const empty = right.flatMap((value, index) => (value === 0 ? [index] : []));
    // A cell that is empty is a gentler hint than one that holds a wrong number, so those come first.
    const ordered = [...empty.filter((cell) => !replaces(cell)), ...empty.filter(replaces)];
    for (const cell of ordered) {
      if (bitCount(found.masks[cell]!) === 1) return { cell, value: lowestBit(found.masks[cell]!), why: "only-number", by: found.by[cell], replaces: replaces(cell) };
    }
    for (const rank of [false, true]) {
      for (const [g, group] of found.groups.entries()) {
        // A cage holds some of the numbers, not all, so a number with one place left in it is no reason to put it there.
        if (group.length !== size) continue;
        let present = 0;
        for (const index of group) if (right[index] !== 0) present |= 1 << right[index]!;
        for (let value = 1; value <= size; value += 1) {
          if (present & (1 << value)) continue;
          const places = group.filter((index) => right[index] === 0 && (found.masks[index]! & (1 << value)) !== 0);
          if (places.length === 1 && replaces(places[0]!) === rank) return { cell: places[0]!, value, why: "only-place", group: groupInfo(read, g), replaces: rank };
        }
      }
    }
  }
  // Nothing follows by a single step: the tightest cell, where the most of its row and column are right already.
  let best = -1;
  let bestPeers = -1;
  for (let index = 0; index < size * size; index += 1) {
    if (right[index] !== 0) continue;
    const row = Math.floor(index / size);
    const col = index % size;
    let peers = 0;
    for (let k = 0; k < size; k += 1) {
      if (k !== col && right[row * size + k] !== 0) peers += 1;
      if (k !== row && right[k * size + col] !== 0) peers += 1;
    }
    if (peers > bestPeers) {
      best = index;
      bestPeers = peers;
    }
  }
  return best === -1 ? null : { cell: best, value: solved[best]!, why: "answer", replaces: replaces(best) };
}
