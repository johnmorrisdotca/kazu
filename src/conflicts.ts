import type { KazuGivens } from "./givens.ts";
import { layoutOfGivens } from "./givens.ts";
import { lineFrom, TOWER_SIDES } from "./towers-code.ts";

/**
 * THE CELLS THAT BREAK A RULE RIGHT NOW, read from the rules alone: no answer is needed, so it works
 * on any puzzle, and it names a mistake the moment it is made rather than when it is checked.
 *
 * `values` is the whole grid as it stands: the printed numbers and what has been written, row-major,
 * 0 for empty. A cell is in conflict when it shares a row, a column, a box, a region, a diagonal or a
 * cage with a cell holding the same number; when a cage is full and does not add to its sum, or already
 * adds to more; when a more-than mark between two filled cells is not true; or when the cells from a
 * Towers clue show more towers than the clue says (or, once the line is full, any other number).
 * An empty cell is never in conflict, and a grid with no conflict is not thereby right: it may
 * simply not be finished.
 */
export function conflictsOf(givens: KazuGivens, values: readonly number[]): number[] {
  const { size } = givens;
  const bad = new Set<number>();
  const layout = layoutOfGivens(givens);
  const groups =
    layout !== null
      ? layout.groups
      : [...Array.from({ length: size }, (_, r) => Array.from({ length: size }, (_, c) => r * size + c)), ...Array.from({ length: size }, (_, c) => Array.from({ length: size }, (_, r) => r * size + c))];
  for (const group of groups) {
    const first = new Map<number, number>();
    for (const index of group) {
      const value = values[index]!;
      if (value === 0) continue;
      const was = first.get(value);
      if (was === undefined) first.set(value, index);
      else {
        bad.add(was);
        bad.add(index);
      }
    }
  }
  for (const cage of givens.cages ?? []) {
    const filled = cage.cells.filter((index) => values[index]! !== 0);
    const total = filled.reduce((sum, index) => sum + values[index]!, 0);
    if (total > cage.sum || (filled.length === cage.cells.length && total !== cage.sum)) for (const index of filled) bad.add(index);
  }
  for (const mark of givens.marks) {
    const less = values[mark.less]!;
    const more = values[mark.more]!;
    if (less !== 0 && more !== 0 && !(less < more)) {
      bad.add(mark.less);
      bad.add(mark.more);
    }
  }
  if (givens.clues !== null) {
    for (const side of TOWER_SIDES) {
      for (let at = 0; at < size; at += 1) {
        const clue = givens.clues[side][at]!;
        if (clue === 0) continue;
        const line = lineFrom(side, at, size);
        let tallest = 0;
        let seen = 0;
        let reached = 0;
        for (const index of line) {
          const value = values[index]!;
          if (value === 0) break;
          reached += 1;
          if (value > tallest) {
            tallest = value;
            seen += 1;
          }
        }
        if (seen > clue || (reached === size && seen !== clue)) for (const index of line.slice(0, reached)) bad.add(index);
      }
    }
  }
  return [...bad].sort((a, b) => a - b);
}
