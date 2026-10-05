/**
 * WHICH CELLS MUST HOLD EVERY NUMBER ONCE: the one thing that differs between Sudoku and the
 * puzzles built on it.
 *
 * Classic Sudoku asks it of every row, column and box. Diagonal adds the two long diagonals.
 * Jigsaw keeps the rows and columns and trades the boxes for irregular regions. Sum Cages adds
 * cages, each also a group. The solver, the generator and the check read a layout rather than
 * knowing which puzzle they are in, so a variant is a new list of groups and never a new solver.
 *
 * `region` is what the grid draws heavier rules between: the boxes, or the jigsaw's regions.
 * `diagonal` says the diagonals are groups too, so the grid can shade them.
 */

/** Where the boxes are on a Sudoku grid: how many rows and columns of cells each box holds. */
export type Boxes = { rows: number; cols: number };

/**
 * A 9×9 has 3×3 boxes and a 4×4 has 2×2; a 6×6 has boxes two rows tall and three columns wide,
 * which is the one people get wrong and the reason this is a table rather than a square root.
 */
export const KAZU_BOXES: Record<number, Boxes> = {
  4: { rows: 2, cols: 2 },
  6: { rows: 2, cols: 3 },
  9: { rows: 3, cols: 3 },
  16: { rows: 4, cols: 4 },
  25: { rows: 5, cols: 5 },
};

/** The box a cell is in, numbered row-major from 0. */
export function boxOf(size: number, index: number): number {
  const boxes = KAZU_BOXES[size]!;
  const row = Math.floor(index / size);
  const col = index % size;
  return Math.floor(row / boxes.rows) * (size / boxes.cols) + Math.floor(col / boxes.cols);
}

export type Layout = {
  size: number;
  /** Every group of cells that holds 1..size once each. */
  groups: number[][];
  /** For each cell, the groups it is in. */
  groupsOf: number[][];
  /** For each cell, the region it is drawn in: a box, or a jigsaw region. */
  region: number[];
  /** What a region is called when a check says which group repeats: a box, or a jigsaw's region. */
  regionWord: "box" | "region";
  diagonal: boolean;
  /**
   * Sum Cages' cages: cells that hold different numbers adding to `sum`. Each is also one of
   * `groups`, so "different" is the solver's ordinary rule; the sum is the one thing the solver
   * reads from here. Absent for every other puzzle, which is what keeps their search as it was.
   */
  cages?: { cells: number[]; sum: number }[];
  /** For each cell, the index of its cage in `cages`. */
  cageOf?: number[];
};

function build(size: number, region: number[], regionWord: Layout["regionWord"], diagonal: boolean): Layout {
  const groups: number[][] = [];
  const add = (cells: number[]) => groups.push(cells);
  for (let r = 0; r < size; r += 1) add(Array.from({ length: size }, (_, c) => r * size + c));
  for (let c = 0; c < size; c += 1) add(Array.from({ length: size }, (_, r) => r * size + c));
  for (let g = 0; g < size; g += 1) add(region.flatMap((value, index) => (value === g ? [index] : [])));
  if (diagonal) {
    add(Array.from({ length: size }, (_, i) => i * size + i));
    add(Array.from({ length: size }, (_, i) => i * size + (size - 1 - i)));
  }
  const groupsOf: number[][] = Array.from({ length: size * size }, () => []);
  groups.forEach((cells, g) => cells.forEach((index) => groupsOf[index]!.push(g)));
  return { size, groups, groupsOf, region, regionWord, diagonal };
}

const CLASSIC = new Map<string, Layout>();

/** Rows, columns and boxes; with `diagonal`, the two long diagonals as well. */
export function boxedLayout(size: number, diagonal = false): Layout {
  const key = `${size}:${diagonal}`;
  const known = CLASSIC.get(key);
  if (known !== undefined) return known;
  const layout = build(size, Array.from({ length: size * size }, (_, index) => boxOf(size, index)), "box", diagonal);
  CLASSIC.set(key, layout);
  return layout;
}

/** Rows, columns and the given regions, numbered 0..size-1, each `size` cells. */
export function regionLayout(size: number, region: readonly number[]): Layout {
  return build(size, [...region], "region", false);
}

/** Rows, columns and boxes, and the cages over them, each cage a group of its own as well. */
export function cagedLayout(size: number, cages: readonly { cells: readonly number[]; sum: number }[]): Layout {
  const boxed = boxedLayout(size);
  const groups = [...boxed.groups, ...cages.map((cage) => [...cage.cells])];
  const groupsOf: number[][] = Array.from({ length: size * size }, () => []);
  groups.forEach((cells, g) => cells.forEach((index) => groupsOf[index]!.push(g)));
  const cageOf = new Array<number>(size * size).fill(-1);
  cages.forEach((cage, c) => cage.cells.forEach((index) => (cageOf[index] = c)));
  return {
    ...boxed,
    groups,
    groupsOf,
    cages: cages.map((cage) => ({ cells: [...cage.cells], sum: cage.sum })),
    cageOf,
  };
}

/** The cells sharing an edge with `index`. */
export function neighbours(size: number, index: number): number[] {
  const row = Math.floor(index / size);
  const col = index % size;
  const out: number[] = [];
  if (row > 0) out.push(index - size);
  if (row < size - 1) out.push(index + size);
  if (col > 0) out.push(index - 1);
  if (col < size - 1) out.push(index + 1);
  return out;
}

/**
 * Whether `region` divides a size×size grid into `size` regions of `size` cells each, every one of
 * them joined edge to edge. O(cells): a check of a Jigsaw asks it of whatever regions it was sent.
 */
export function regionsAreSound(size: number, region: readonly number[]): boolean {
  if (region.length !== size * size) return false;
  const counts = new Array<number>(size).fill(0);
  for (const value of region) {
    if (!Number.isInteger(value) || value < 0 || value >= size) return false;
    counts[value]! += 1;
  }
  if (counts.some((count) => count !== size)) return false;
  const seen = new Array<boolean>(size * size).fill(false);
  for (let g = 0; g < size; g += 1) {
    const start = region.indexOf(g);
    const stack = [start];
    seen[start] = true;
    let reached = 0;
    while (stack.length > 0) {
      const index = stack.pop()!;
      reached += 1;
      for (const next of neighbours(size, index)) {
        if (!seen[next] && region[next] === g) {
          seen[next] = true;
          stack.push(next);
        }
      }
    }
    if (reached !== size) return false;
  }
  return true;
}
