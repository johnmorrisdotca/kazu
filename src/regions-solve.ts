import { REGIONS_MOST_NODES } from "./regions.constants.ts";
import { isRegionsBoard } from "./regions-board.ts";
import { regionsModel } from "./regions-logic.ts";
import { decide, openSlots, solveCsp } from "./csp.ts";
import type { RegionsBoard, RegionsSolve } from "./regions.types.ts";

/** Counts completed partitions. `complete` is false when a bound, including the answer limit, stops search. */
export function solveRegions(
  board: RegionsBoard,
  entries: readonly number[] = board.givens,
  options: { limit?: number; nodes?: number } = {},
): RegionsSolve {
  if (!isRegionsBoard(board)) throw new RangeError("Invalid Regions board");
  const limit = options.limit ?? 2;
  const budget = options.nodes ?? REGIONS_MOST_NODES;
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(budget) || budget < 1) {
    throw new RangeError("Invalid search bounds");
  }
  if (!Array.isArray(entries) || entries.length !== board.givens.length) {
    throw new RangeError("Invalid Regions entries");
  }
  const fixed = entries.map((value, cell) => {
    if (!Number.isInteger(value) || value < 0 || value > entries.length) return -1;
    if (board.givens[cell] && value !== board.givens[cell]) return -1;
    return value || board.givens[cell]!;
  });
  if (fixed.some(value => value < 0)) return { count: 0, solution: null, complete: true, nodes: 0 };
  const { csp, most } = regionsModel(board, fixed);
  const start = openSlots(csp);
  fixed.forEach((value, cell) => { if (value) decide(csp, start, cell, cell * most + value - 1); });
  const found = solveCsp(csp, start, limit, budget);
  const solution = found.solution ? Array.from({ length: fixed.length }, (_, cell) => {
    for (let v = 0; v < most; v += 1) if (found.solution![cell * most + v]) return v + 1;
    return 0;
  }) : null;
  return { count: found.count, solution, complete: !found.exhausted && !found.stopped, nodes: found.nodes };
}
