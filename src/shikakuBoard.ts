import { SHIKAKU_MOST_SIDE } from "./shikaku.constants.ts";
import type { ShikakuBoard, ShikakuCheck, ShikakuRectangle } from "./shikaku.types.ts";

/** Whether dimensions and area clues describe a possible partition. */
export function isShikakuBoard(value: unknown): value is ShikakuBoard {
  if (!value || typeof value !== "object") return false;
  const b = value as ShikakuBoard;
  return Number.isInteger(b.width) && b.width >= 2 && b.width <= SHIKAKU_MOST_SIDE
    && Number.isInteger(b.height) && b.height >= 2 && b.height <= SHIKAKU_MOST_SIDE
    && Array.isArray(b.clues) && b.clues.length === b.width * b.height
    && b.clues.every(n => Number.isInteger(n) && n >= 0 && n <= b.clues.length)
    && b.clues.reduce((a, n) => a + n, 0) === b.clues.length;
}
/** Cells of a bounded rectangle, or null for invalid coordinates. */
export function shikakuCells(board: ShikakuBoard, r: ShikakuRectangle): number[] | null {
  if (!r || ![r.x, r.y, r.width, r.height].every(Number.isInteger)
    || r.x < 0 || r.y < 0 || r.width < 1 || r.height < 1
    || r.x + r.width > board.width || r.y + r.height > board.height) return null;
  return Array.from({ length: r.width * r.height }, (_, i) =>
    (r.y + Math.floor(i / r.width)) * board.width + r.x + i % r.width);
}
/** A finished partition is checked against the rules, never against a stored answer. */
export function checkShikaku(board: ShikakuBoard, rectangles: readonly ShikakuRectangle[]): ShikakuCheck {
  if (!isShikakuBoard(board)) throw new RangeError("Invalid Shikaku board");
  const occupied = new Set<number>(), errors: number[] = [];
  rectangles.forEach((r, index) => {
    const cells = shikakuCells(board, r);
    const clues = cells?.filter(c => board.clues[c] > 0) ?? [];
    if (!cells || clues.length !== 1 || board.clues[clues[0]] !== cells.length
      || cells.some(c => occupied.has(c))) errors.push(index);
    cells?.forEach(c => occupied.add(c));
  });
  return { ok: errors.length === 0 && occupied.size === board.clues.length, covered: occupied.size, errors };
}
/** All legal rectangles for a numbered cell, in a stable order. */
export function shikakuCandidates(board: ShikakuBoard, cell: number): ShikakuRectangle[] {
  if (!isShikakuBoard(board)) throw new RangeError("Invalid Shikaku board");
  const area = board.clues[cell], out: ShikakuRectangle[] = [];
  if (!area) return out;
  const cx = cell % board.width, cy = Math.floor(cell / board.width);
  for (let w = 1; w <= board.width; w += 1) {
    if (area % w) continue;
    const h = area / w;
    if (h > board.height) continue;
    for (let y = Math.max(0, cy - h + 1); y <= Math.min(cy, board.height - h); y += 1) {
      for (let x = Math.max(0, cx - w + 1); x <= Math.min(cx, board.width - w); x += 1) {
        const r = { x, y, width: w, height: h };
        if (shikakuCells(board, r)!.every(c => c === cell || board.clues[c] === 0)) out.push(r);
      }
    }
  }
  return out;
}
