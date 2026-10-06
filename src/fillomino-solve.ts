import { FILLOMINO_MOST_NODES } from "./fillomino.constants.ts";
import { isFillominoBoard } from "./fillomino-board.ts";
import { fillominoModel } from "./fillomino-logic.ts";
import { decide, openSlots, solveCsp } from "./csp.ts";
import type { FillominoBoard, FillominoSolve } from "./fillomino.types.ts";

/** Counts completed partitions. `complete` is false when a bound, including the answer limit, stops search. */
export function solveFillomino(
  board: FillominoBoard,
  entries: readonly number[] = board.givens,
  options: { limit?: number; nodes?: number } = {},
): FillominoSolve {
  if (!isFillominoBoard(board)) throw new RangeError("Invalid Fillomino board");
  const limit = options.limit ?? 2;
  const budget = options.nodes ?? FILLOMINO_MOST_NODES;
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(budget) || budget < 1) {
    throw new RangeError("Invalid search bounds");
  }
  if (!Array.isArray(entries) || entries.length !== board.givens.length) {
    throw new RangeError("Invalid Fillomino entries");
  }
  const fixed = entries.map((value, cell) => {
    if (!Number.isInteger(value) || value < 0 || value > entries.length) return -1;
    if (board.givens[cell] && value !== board.givens[cell]) return -1;
    return value || board.givens[cell]!;
  });
  if (fixed.some(value => value < 0)) return { count: 0, solution: null, complete: true, nodes: 0 };
  const { csp, most } = fillominoModel(board, fixed);
  const start = openSlots(csp);
  fixed.forEach((value, cell) => { if (value) decide(csp, start, cell, cell * most + value - 1); });
  const found = solveCsp(csp, start, limit, budget);
  const solution = found.solution ? Array.from({ length: fixed.length }, (_, cell) => {
    for (let v = 0; v < most; v += 1) if (found.solution![cell * most + v]) return v + 1;
    return 0;
  }) : null;
  return { count: found.count, solution, complete: !found.exhausted && !found.stopped, nodes: found.nodes };
}
