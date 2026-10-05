import type { Csp } from "./csp.ts";
import { fillominoNeighbours } from "./fillominoBoard.ts";
import type { FillominoBoard } from "./fillomino.types.ts";

/** The most any square can be: a region holding a given or an entry is that number, and one with none lies among the squares with neither. */
export function fillominoMostValue(board: FillominoBoard, fixed: readonly number[]): number {
  let most = 1;
  for (const value of fixed) if (value > most) most = value;
  const seen = new Uint8Array(fixed.length);
  for (let start = 0; start < fixed.length; start += 1) {
    if (fixed[start] || seen[start]) continue;
    let size = 0;
    const stack = [start];
    seen[start] = 1;
    while (stack.length) {
      const cell = stack.pop()!;
      size += 1;
      for (const next of fillominoNeighbours(board, cell)) if (!fixed[next] && !seen[next]) { seen[next] = 1; stack.push(next); }
    }
    if (size > most) most = size;
  }
  return most;
}

/**
 * Fillomino as variables: one per square, a slot for each number it can be (1 up to `most`). A finished group of
 * equal numbers keeps its neighbours off that number; a group still short must be able to grow, to squares that can
 * still be that number, until it is the right size, and settles on them when there is exactly room; and a square
 * can only be a number if the squares that can still be it, joined up, make a group big enough.
 */
export function fillominoModel(board: FillominoBoard, fixed: readonly number[], most = fillominoMostValue(board, fixed)): { csp: Csp; most: number } {
  const cells = board.width * board.height, values = most;
  const nb = new Int32Array(cells * 4).fill(-1);
  for (let cell = 0; cell < cells; cell += 1) fillominoNeighbours(board, cell).forEach((next, k) => { nb[cell * 4 + k] = next; });
  const starts = Int32Array.from({ length: cells + 1 }, (_, i) => i * values);
  const only = new Int32Array(cells), label = new Int32Array(cells), size = new Int32Array(cells + 1), stack = new Int32Array(cells + 1), members = new Int32Array(cells), seen = new Int32Array(cells);
  const dirty = new Uint8Array(values + 1);
  let stamp = 0;

  const propagate = (alive: Uint8Array): boolean => {
    let changed = true;
    dirty.fill(1);
    while (changed) {
      changed = false;
      for (let cell = 0; cell < cells; cell += 1) {
        let left = 0, last = 0;
        const base = cell * values;
        for (let v = 0; v < values; v += 1) if (alive[base + v]) { left += 1; last = v + 1; }
        if (!left) return false;
        only[cell] = left === 1 ? last : 0;
      }
      // Groups of squares already settled on the same number.
      label.fill(0);
      for (let start = 0; start < cells; start += 1) {
        const v = only[start]!;
        if (!v || label[start]) continue;
        let count = 0, top = 0;
        stack[top++] = start; label[start] = 1;
        while (top) {
          const cell = stack[--top]!;
          members[count++] = cell;
          for (let k = 0; k < 4; k += 1) {
            const next = nb[cell * 4 + k]!;
            if (next >= 0 && only[next] === v && !label[next]) { label[next] = 1; stack[top++] = next; }
          }
        }
        if (count > v) return false;
        if (count === v) {
          for (let m = 0; m < count; m += 1) for (let k = 0; k < 4; k += 1) {
            const next = nb[members[m]! * 4 + k]!;
            if (next >= 0 && only[next] !== v && alive[next * values + v - 1]) { alive[next * values + v - 1] = 0; dirty[v] = 1; changed = true; }
          }
          continue;
        }
        // Short of its size: grow through squares that can still be v.
        stamp += 1;
        let reached = count, frontier = 0, lastFrontier = -1;
        for (let m = 0; m < count; m += 1) seen[members[m]!] = stamp;
        for (let at = 0; at < reached; at += 1) {
          const cell = members[at]!;
          for (let k = 0; k < 4; k += 1) {
            const next = nb[cell * 4 + k]!;
            if (next < 0 || seen[next] === stamp || !alive[next * values + v - 1]) continue;
            seen[next] = stamp;
            members[reached++] = next;
            if (at < count) { frontier += 1; lastFrontier = next; }
          }
        }
        if (reached < v) return false;
        if (reached === v) {
          for (let m = 0; m < reached; m += 1) {
            const base = members[m]! * values;
            for (let other = 0; other < values; other += 1) if (other !== v - 1 && alive[base + other]) { alive[base + other] = 0; dirty[other + 1] = 1; changed = true; }
          }
        } else if (frontier === 1 && !only[lastFrontier]) {
          const base = lastFrontier * values;
          for (let other = 0; other < values; other += 1) if (other !== v - 1 && alive[base + other]) { alive[base + other] = 0; dirty[other + 1] = 1; changed = true; }
        }
      }
      // A number needs room: the squares that can be it, joined up, must make a group at least that big.
      for (let v = 2; v <= values; v += 1) {
        if (!dirty[v]) continue;
        dirty[v] = 0;
        label.fill(0);
        let components = 0;
        const slot = v - 1;
        for (let start = 0; start < cells; start += 1) {
          if (label[start] || !alive[start * values + slot]) continue;
          components += 1;
          let count = 0, top = 0;
          stack[top++] = start; label[start] = components;
          while (top) {
            const cell = stack[--top]!;
            count += 1;
            for (let k = 0; k < 4; k += 1) {
              const next = nb[cell * 4 + k]!;
              if (next >= 0 && !label[next] && alive[next * values + slot]) { label[next] = components; stack[top++] = next; }
            }
          }
          size[components] = count;
        }
        for (let cell = 0; cell < cells; cell += 1) {
          if (label[cell] && size[label[cell]!]! < v) { alive[cell * values + slot] = 0; dirty[v] = 1; changed = true; }
        }
      }
    }
    return true;
  };
  return { csp: { starts, propagate }, most: values };
}
