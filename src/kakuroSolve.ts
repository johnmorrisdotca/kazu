import { KAKURO_MAX_NODES } from "./kakuro.constants.ts";
import { isKakuroBoard } from "./kakuroBoard.ts";
import { kakuroModel } from "./kakuroLogic.ts";
import { decide, openSlots, solveCsp } from "./csp.ts";
import type { KakuroBoard, KakuroSolve } from "./kakuro.types.ts";

/** Bounded exact counter over across and down runs; an interrupted search never proves uniqueness. */
export function solveKakuro(board: KakuroBoard, entries: readonly number[] = [], options: { limit?: number; nodes?: number } = {}): KakuroSolve {
  if (!isKakuroBoard(board)) throw new RangeError("Invalid Kakuro board");
  const limit = options.limit ?? 2, budget = options.nodes ?? KAKURO_MAX_NODES;
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(budget) || budget < 1) throw new RangeError("Invalid search bounds");
  if (entries.length && entries.length !== board.cells.length) throw new RangeError("Invalid Kakuro entries");
  const { csp, whites } = kakuroModel(board);
  const start = openSlots(csp);
  for (let cell = 0; cell < entries.length; cell += 1) {
    const value = entries[cell]!;
    if (board.cells[cell]!.kind === "black" ? value !== 0 : !Number.isInteger(value) || value < 0 || value > 9) {
      return { count: 0, solution: null, complete: true, nodes: 0 };
    }
  }
  whites.forEach((cell, i) => { const value = entries[cell]; if (value) decide(csp, start, i, 9 * i + value - 1); });
  const found = solveCsp(csp, start, limit, budget);
  let solution: number[] | null = null;
  if (found.solution) {
    solution = Array(board.cells.length).fill(0);
    whites.forEach((cell, i) => { for (let d = 0; d < 9; d += 1) if (found.solution![9 * i + d]) solution![cell] = d + 1; });
  }
  return { count: found.count, solution, complete: !found.exhausted && !found.stopped, nodes: found.nodes };
}
