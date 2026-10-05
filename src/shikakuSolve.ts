import { SHIKAKU_MOST_NODES } from "./shikaku.constants.ts";
import { checkShikaku, isShikakuBoard } from "./shikakuBoard.ts";
import { shikakuModel } from "./shikakuLogic.ts";
import { decide, openSlots, solveCsp } from "./csp.ts";
import type { ShikakuBoard, ShikakuRectangle, ShikakuSolve } from "./shikaku.types.ts";

/** Exact cover over squares. A bounded search reports incompleteness instead of claiming uniqueness. */
export function solveShikaku(board: ShikakuBoard, placed: readonly ShikakuRectangle[] = [],
  options: { limit?: number; nodes?: number } = {}): ShikakuSolve {
  if (!isShikakuBoard(board)) throw new RangeError("Invalid Shikaku board");
  const limit = options.limit ?? 2, budget = options.nodes ?? SHIKAKU_MOST_NODES;
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(budget) || budget < 1) throw new RangeError("Invalid search bounds");
  if (checkShikaku(board, placed).errors.length) return { count: 0, solution: null, complete: true, nodes: 0 };
  const { csp, rectangles, clues } = shikakuModel(board);
  const start = openSlots(csp);
  for (const r of placed) {
    const slot = rectangles.findIndex(c => c.x === r.x && c.y === r.y && c.width === r.width && c.height === r.height);
    if (slot < 0) return { count: 0, solution: null, complete: true, nodes: 0 };
    decide(csp, start, clues.indexOf(clueOf(board, r)), slot);
  }
  const found = solveCsp(csp, start, limit, budget);
  const solution = found.solution ? [...placed.map(r => ({ ...r })), ...rectangles.filter((_, slot) => found.solution![slot] === 1 && !placed.some(r => sameRectangle(r, rectangles[slot]!)))] : null;
  return { count: found.count, solution, complete: !found.exhausted && !found.stopped, nodes: found.nodes };
}

const sameRectangle = (a: ShikakuRectangle, b: ShikakuRectangle) => a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
const clueOf = (board: ShikakuBoard, r: ShikakuRectangle): number => {
  for (let y = r.y; y < r.y + r.height; y += 1) for (let x = r.x; x < r.x + r.width; x += 1) if (board.clues[y * board.width + x]) return y * board.width + x;
  return -1;
};
