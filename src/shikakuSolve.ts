import { SHIKAKU_MOST_NODES } from "./shikaku.constants.ts";
import { checkShikaku, isShikakuBoard, shikakuCandidates, shikakuCells } from "./shikakuBoard.ts";
import type { ShikakuBoard, ShikakuRectangle, ShikakuSolve } from "./shikaku.types.ts";

/** Exact cover over cells. A bounded search reports incompleteness instead of claiming uniqueness. */
export function solveShikaku(board: ShikakuBoard, placed: readonly ShikakuRectangle[] = [],
  options: { limit?: number; nodes?: number } = {}): ShikakuSolve {
  if (!isShikakuBoard(board)) throw new RangeError("Invalid Shikaku board");
  const limit = options.limit ?? 2, budget = options.nodes ?? SHIKAKU_MOST_NODES;
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(budget) || budget < 1) throw new RangeError("Invalid search bounds");
  const maskOf = (r: ShikakuRectangle) => shikakuCells(board, r)!.reduce((m, c) => m | 1n << BigInt(c), 0n);
  if (checkShikaku(board, placed).errors.length) return { count: 0, solution: null, complete: true, nodes: 0 };
  const all = (1n << BigInt(board.clues.length)) - 1n;
  let occupied = 0n;
  for (const r of placed) occupied |= maskOf(r);
  const candidates = board.clues.flatMap((n, c) => n ? shikakuCandidates(board, c).map(r => ({ r, mask: maskOf(r) })) : []);
  const byCell = board.clues.map((_, c) => candidates.filter(r => (r.mask & 1n << BigInt(c)) !== 0n));
  let count = 0, nodes = 0, complete = true, solution: ShikakuRectangle[] | null = null;
  const visit = (mask: bigint, rectangles: readonly ShikakuRectangle[]) => {
    if (++nodes > budget) { complete = false; return; }
    if (mask === all) { count += 1; solution ??= rectangles.map(r => ({ ...r })); return; }
    let choices: typeof candidates | null = null;
    for (let c = 0; c < board.clues.length; c += 1) {
      if ((mask & 1n << BigInt(c)) !== 0n) continue;
      const available = byCell[c].filter(r => (mask & r.mask) === 0n);
      if (!available.length) return;
      if (!choices || available.length < choices.length) choices = available;
      if (choices.length === 1) break;
    }
    for (const next of choices ?? []) {
      visit(mask | next.mask, [...rectangles, next.r]);
      if (!complete) return;
      if (count >= limit) { complete = false; return; }
    }
  };
  visit(occupied, placed);
  return { count, solution, complete, nodes };
}
