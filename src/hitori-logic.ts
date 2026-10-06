import type { Csp } from "./csp.ts";
import { hitoriNeighbors } from "./hitori-board.ts";
import type { HitoriBoard } from "./hitori.types.ts";

/**
 * Hitori as variables: one per square, slot 0 for left white and slot 1 for shaded.
 * `strength` is how much of the rules the pruning uses: 0 has the duplicates, the ban on touching shades, the
 * pair and the sandwich; 1 adds that every white square must stay in reach of the others; 2 adds that a square
 * whose shading would cut the whites in two must stay white. A finished answer must be one piece, which the
 * search checks whatever the strength.
 */
export function hitoriModel(board: HitoriBoard, strength: 0 | 1 | 2 = 2): { csp: Csp } {
  const size = board.size, total = size * size;
  const neighbours = Array.from({ length: total }, (_, cell) => Int32Array.from(hitoriNeighbors(size, cell)));
  const partners = Array.from({ length: total }, (_, cell) => {
    const x = cell % size, y = Math.floor(cell / size), found: number[] = [];
    for (let k = 0; k < size; k += 1) {
      if (k !== x && board.numbers[y * size + k] === board.numbers[cell]) found.push(y * size + k);
      if (k !== y && board.numbers[k * size + x] === board.numbers[cell]) found.push(k * size + x);
    }
    return Int32Array.from(found);
  });
  // A pair of equal numbers side by side shades every other equal number of that line; a number on both sides of a square keeps it white.
  const pairs: { a: number; b: number; others: Int32Array }[] = [];
  const sandwiches: number[] = [];
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const cell = y * size + x;
    for (const [dx, dy] of [[1, 0], [0, 1]] as const) {
      const nx = x + dx, ny = y + dy;
      if (nx >= size || ny >= size) continue;
      const next = ny * size + nx;
      if (board.numbers[cell] === board.numbers[next]) {
        const others = partners[cell]!.filter(other => other !== next && (dx ? Math.floor(other / size) === y : other % size === x));
        if (others.length) pairs.push({ a: cell, b: next, others });
      }
      const fx = x + 2 * dx, fy = y + 2 * dy;
      if (fx < size && fy < size && board.numbers[cell] === board.numbers[fy * size + fx]) sandwiches.push(next);
    }
  }
  const starts = Int32Array.from({ length: total + 1 }, (_, i) => i * 2);
  const disc = new Int32Array(total), low = new Int32Array(total), whitesBelow = new Int32Array(total);

  const propagate = (alive: Uint8Array): boolean => {
    let changed = true;
    while (changed) {
      changed = false;
      for (let c = 0; c < total; c += 1) {
        const white = alive[2 * c]!, shaded = alive[2 * c + 1]!;
        if (!white && !shaded) return false;
        if (shaded && !white) {
          const around = neighbours[c]!;
          for (let k = 0; k < around.length; k += 1) {
            const n = around[k]!;
            if (alive[2 * n + 1]) { alive[2 * n + 1] = 0; changed = true; if (!alive[2 * n]) return false; }
          }
        }
        if (white && !shaded) {
          const same = partners[c]!;
          for (let k = 0; k < same.length; k += 1) {
            const p = same[k]!;
            if (alive[2 * p]) { alive[2 * p] = 0; changed = true; if (!alive[2 * p + 1]) return false; }
          }
        }
        if (shaded) {
          // A square is shaded only to settle a duplicate, so some equal number in its row or column must stay white.
          const same = partners[c]!;
          let free = 0, last = -1;
          for (let k = 0; k < same.length; k += 1) if (alive[2 * same[k]!]) { free += 1; last = same[k]!; }
          if (free === 0) {
            if (!white) return false;
            alive[2 * c + 1] = 0; changed = true;
          } else if (free === 1 && !white && alive[2 * last + 1]) { alive[2 * last + 1] = 0; changed = true; }
        }
      }
      for (const { a, b, others } of pairs) {
        if (!alive[2 * a]! && !alive[2 * b]!) continue;
        for (let k = 0; k < others.length; k += 1) {
          const o = others[k]!;
          if (alive[2 * o]) { alive[2 * o] = 0; changed = true; if (!alive[2 * o + 1]) return false; }
        }
      }
      for (let k = 0; k < sandwiches.length; k += 1) {
        const m = sandwiches[k]!;
        if (alive[2 * m + 1]) { alive[2 * m + 1] = 0; changed = true; if (!alive[2 * m]) return false; }
      }
      if (strength > 0) {
        const verdict = reach(alive);
        if (verdict < 0) return false;
        if (verdict > 0) changed = true;
      }
    }
    return true;
  };

  const cutList = new Int32Array(total);
  let clock = 0, cutCount = 0, whiteTotal = 0, current: Uint8Array = new Uint8Array(0), power = 0;
  const visit = (u: number, parent: number): void => {
    disc[u] = low[u] = ++clock;
    let below = current[2 * u + 1] ? 0 : 1, cutWhites = 0, cutParts = 0;
    const around = neighbours[u]!;
    for (let k = 0; k < around.length; k += 1) {
      const n = around[k]!;
      if (!current[2 * n] || n === parent) continue;
      if (disc[n]) { if (disc[n]! < low[u]!) low[u] = disc[n]!; continue; }
      visit(n, u);
      if (low[n]! < low[u]!) low[u] = low[n]!;
      below += whitesBelow[n]!;
      if (low[n]! >= disc[u]! && whitesBelow[n]! > 0) { cutParts += 1; cutWhites += whitesBelow[n]!; }
    }
    whitesBelow[u] = below;
    if (power > 1 && current[2 * u] && current[2 * u + 1] && cutParts + (whiteTotal - cutWhites > 0 ? 1 : 0) >= 2) cutList[cutCount++] = u;
  };
  /** -1 when the white squares cannot be one piece, 1 when a square was forced white, 0 when nothing moved. */
  const reach = (alive: Uint8Array): number => {
    let root = -1;
    whiteTotal = 0;
    for (let c = 0; c < total; c += 1) if (!alive[2 * c + 1]) { whiteTotal += 1; if (root < 0) root = c; }
    if (root < 0) return 0;
    if (!alive[2 * root]) return -1;
    disc.fill(0);
    clock = 0; cutCount = 0; current = alive; power = strength;
    visit(root, -1);
    let seenWhites = 0;
    for (let c = 0; c < total; c += 1) if (!alive[2 * c + 1] && disc[c]) seenWhites += 1;
    if (seenWhites !== whiteTotal) return -1;
    for (let k = 0; k < cutCount; k += 1) alive[2 * cutList[k]! + 1] = 0;
    return cutCount ? 1 : 0;
  };
  return { csp: { starts, propagate } };
}
