import type { Csp } from "./csp.ts";
import { shikakuCandidates, shikakuCells } from "./shikakuBoard.ts";
import type { ShikakuBoard, ShikakuRectangle } from "./shikaku.types.ts";

/**
 * Shikaku as variables: one per numbered square, its slots the rectangles it could be the one number of. A rectangle
 * that is settled keeps every other rectangle off its squares. With `strength` 1 a square only one rectangle can
 * still cover is covered by it, and with 2 a square only one number can still reach forces that number's rectangle to cover it.
 */
export function shikakuModel(board: ShikakuBoard, strength: 0 | 1 | 2 = 2): { csp: Csp; clues: readonly number[]; rectangles: readonly ShikakuRectangle[]; owner: Int32Array } {
  const clues = board.clues.flatMap((n, cell) => n ? [cell] : []);
  const rectangles: ShikakuRectangle[] = [], owner: number[] = [], covers: Int32Array[] = [], starts: number[] = [0];
  clues.forEach((cell, variable) => {
    for (const rectangle of shikakuCandidates(board, cell)) { rectangles.push(rectangle); owner.push(variable); covers.push(Int32Array.from(shikakuCells(board, rectangle)!)); }
    starts.push(rectangles.length);
  });
  const through: number[][] = Array.from({ length: board.clues.length }, () => []);
  covers.forEach((cells, slot) => cells.forEach(cell => through[cell]!.push(slot)));

  const propagate = (alive: Uint8Array): boolean => {
    let changed = true;
    while (changed) {
      changed = false;
      for (let v = 0; v < clues.length; v += 1) {
        let left = 0, only = -1;
        for (let s = starts[v]!; s < starts[v + 1]!; s += 1) if (alive[s]) { left += 1; only = s; }
        if (!left) return false;
        if (left !== 1) continue;
        const cells = covers[only]!;
        for (let k = 0; k < cells.length; k += 1) {
          const others = through[cells[k]!]!;
          for (let j = 0; j < others.length; j += 1) {
            const t = others[j]!;
            if (t !== only && alive[t] && owner[t] !== v) { alive[t] = 0; changed = true; }
          }
        }
      }
      if (strength < 1) continue;
      for (let cell = 0; cell < through.length; cell += 1) {
        const slots = through[cell]!;
        let count = 0, only = -1, single = true, first = -1;
        for (let k = 0; k < slots.length; k += 1) {
          const s = slots[k]!;
          if (!alive[s]) continue;
          count += 1; only = s;
          if (first < 0) first = owner[s]!; else if (owner[s] !== first) single = false;
        }
        if (!count) return false;
        if (count === 1) {
          for (let s = starts[owner[only]!]!; s < starts[owner[only]! + 1]!; s += 1) if (s !== only && alive[s]) { alive[s] = 0; changed = true; }
        } else if (single && strength > 1) {
          for (let s = starts[first]!; s < starts[first + 1]!; s += 1) if (alive[s] && !covers[s]!.includes(cell)) { alive[s] = 0; changed = true; }
        }
      }
    }
    return true;
  };
  return { csp: { starts: Int32Array.from(starts), propagate }, clues, rectangles, owner: Int32Array.from(owner) };
}
