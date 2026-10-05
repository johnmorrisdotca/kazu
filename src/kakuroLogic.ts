import type { Csp } from "./csp.ts";
import { kakuroRuns } from "./kakuroBoard.ts";
import type { KakuroBoard } from "./kakuro.types.ts";

/** Every way to choose `length` different digits that add to `sum`, as 9-bit masks (bit d - 1 for digit d), by length then sum. */
const COMBINATIONS: number[][][] = (() => {
  const table: number[][][] = Array.from({ length: 10 }, () => Array.from({ length: 46 }, () => [] as number[]));
  for (let mask = 1; mask < 512; mask += 1) {
    let length = 0, sum = 0;
    for (let d = 1; d <= 9; d += 1) if (mask & 1 << d - 1) { length += 1; sum += d; }
    table[length]![sum]!.push(mask);
  }
  return table;
})();

/**
 * Kakuro as variables: one per white square, nine slots for the digits 1 to 9. A run's pruning keeps only the digit
 * sets that add up to its total and fit what its squares can still be, so a square keeps only digits some such
 * set uses; a digit that every such set uses must appear somewhere (`strength` 1), and a digit that only one square
 * can take is that square's.
 */
export function kakuroModel(board: KakuroBoard, strength: 0 | 1 = 1, random?: () => number): { csp: Csp; whites: readonly number[]; index: Int32Array } {
  const whites = board.cells.flatMap((tile, cell) => tile.kind === "white" ? [cell] : []);
  const index = new Int32Array(board.cells.length).fill(-1);
  whites.forEach((cell, i) => { index[cell] = i; });
  const runs = kakuroRuns(board).map(run => ({ cells: Int32Array.from(run.cells.map(cell => index[cell]!)), sum: run.sum, combos: COMBINATIONS[run.cells.length]![run.sum]! }));
  const runsOf = whites.map(() => [] as number[]);
  runs.forEach((run, r) => run.cells.forEach(cell => runsOf[cell]!.push(r)));
  const starts = Int32Array.from({ length: whites.length + 1 }, (_, i) => i * 9);
  const domain = new Int16Array(whites.length), loaded = new Int32Array(whites.length), touched = new Int32Array(whites.length), changedCells = new Int32Array(whites.length);
  const queue = new Int32Array(runs.length * 4 + 4), queued = new Uint8Array(runs.length);
  let stamp = 0;

  const propagate = (alive: Uint8Array, decided?: number): boolean => {
    stamp += 1;
    let changes = 0;
    // A square's digits are read from `alive` the first time a run asks, so a call after one decision touches only what that reaches.
    const read = (i: number): number => {
      if (loaded[i] !== stamp) {
        let mask = 0;
        for (let d = 0; d < 9; d += 1) if (alive[9 * i + d]) mask |= 1 << d;
        domain[i] = mask; loaded[i] = stamp;
      }
      return domain[i]!;
    };
    let head = 0, tail = 0;
    const push = (r: number) => { if (!queued[r]) { queued[r] = 1; queue[tail++ % queue.length] = r; } };
    if (decided === undefined) for (let r = 0; r < runs.length; r += 1) push(r); else for (const r of runsOf[decided]!) push(r);
    while (head < tail) {
      const r = queue[head++ % queue.length]!, run = runs[r]!, cells = run.cells;
      queued[r] = 0;
      let known = 0, union = 0;
      for (let k = 0; k < cells.length; k += 1) {
        const mask = read(cells[k]!);
        if (!mask) return fail();
        union |= mask;
        if (!(mask & mask - 1)) {
          if (known & mask) return fail();
          known |= mask;
        }
      }
      let usable = 0, always = 511, viable = 0;
      for (let c = 0; c < run.combos.length; c += 1) {
        const combo = run.combos[c]!;
        if (combo & ~union || known & ~combo) continue;
        let fits = true;
        for (let k = 0; k < cells.length && fits; k += 1) if (!(domain[cells[k]!]! & combo)) fits = false;
        if (!fits) continue;
        viable += 1; usable |= combo; always &= combo;
      }
      if (!viable) return fail();
      for (let k = 0; k < cells.length; k += 1) {
        const cell = cells[k]!, was = domain[cell]!;
        let mask = was & usable;
        // Squares not yet decided cannot take the digits the decided ones of the run hold.
        if (was & was - 1) mask &= ~known;
        if (strength > 0 && always && mask & mask - 1) {
          // A digit every viable set uses must go somewhere: if only this square can hold it, it does.
          for (let d = 0; d < 9; d += 1) {
            if (!(always & 1 << d) || !(mask & 1 << d)) continue;
            let holders = 0;
            for (let j = 0; j < cells.length; j += 1) if (domain[cells[j]!]! & 1 << d) holders += 1;
            if (holders === 1) { mask = 1 << d; break; }
          }
        }
        if (!mask) return fail();
        if (mask !== was) {
          if (touched[cell] !== stamp) { touched[cell] = stamp; changedCells[changes++] = cell; }
          domain[cell] = mask;
          for (const other of runsOf[cell]!) push(other);
        }
      }
    }
    for (let c = 0; c < changes; c += 1) {
      const i = changedCells[c]!;
      for (let d = 0; d < 9; d += 1) alive[9 * i + d] = domain[i]! & 1 << d ? 1 : 0;
    }
    return true;
  };
  const fail = (): false => { queued.fill(0); return false; };
  // A search that picks at random among the squares with fewest digits left can be restarted when it gets lost.
  const choose = random ? (alive: Uint8Array): number => {
    let best = 10, count = 0, pick = -1;
    for (let i = 0; i < whites.length; i += 1) {
      let left = 0;
      for (let d = 0; d < 9; d += 1) left += alive[9 * i + d]!;
      if (left < 2 || left > best) continue;
      if (left < best) { best = left; count = 0; }
      count += 1;
      if (random() * count < 1) pick = i;
    }
    return pick;
  } : undefined;
  return { csp: { starts, propagate, choose }, whites, index };
}
