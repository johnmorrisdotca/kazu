import { KAKURO_MAX_NODES } from "./kakuro.constants.ts";
import { canReach, isKakuroBoard, kakuroRuns } from "./kakuroBoard.ts";
import type { KakuroBoard, KakuroSolve } from "./kakuro.types.ts";

/** Bounded exact counter over across and down runs; an interrupted search never proves uniqueness. */
export function solveKakuro(board: KakuroBoard, entries: readonly number[] = [], options: { limit?: number; nodes?: number } = {}): KakuroSolve {
  if (!isKakuroBoard(board)) throw new RangeError("Invalid Kakuro board");
  const limit = options.limit ?? 2, budget = options.nodes ?? KAKURO_MAX_NODES;
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(budget) || budget < 1) throw new RangeError("Invalid search bounds");
  if (entries.length && entries.length !== board.cells.length) throw new RangeError("Invalid Kakuro entries");
  const runs = kakuroRuns(board), values = entries.length ? [...entries] : Array(board.cells.length).fill(0);
  const memberships = board.cells.map(() => [] as number[]);
  runs.forEach((run, index) => run.cells.forEach(cell => memberships[cell]!.push(index)));
  for (let cell = 0; cell < values.length; cell += 1) {
    const value = values[cell]!;
    if (board.cells[cell]!.kind === "black" ? value !== 0 : !Number.isInteger(value) || value < 0 || value > 9) {
      return { count: 0, solution: null, complete: true, nodes: 0 };
    }
  }
  let count = 0, nodes = 0, complete = true, solution: number[] | null = null;
  const domains = (cell: number): number[] => {
    const possible: number[] = [];
    for (let digit = 1; digit <= 9; digit += 1) {
      if (memberships[cell]!.every(index => runAllows(runs[index]!, values, cell, digit))) possible.push(digit);
    }
    return possible;
  };
  const visit = (): void => {
    if (++nodes > budget) { complete = false; return; }
    let chosen = -1, optionsForCell: number[] = [];
    for (let cell = 0; cell < values.length; cell += 1) {
      if (board.cells[cell]!.kind === "black" || values[cell]) continue;
      const possible = domains(cell);
      if (!possible.length) return;
      if (chosen < 0 || possible.length < optionsForCell.length) {
        chosen = cell; optionsForCell = possible;
        if (possible.length === 1) break;
      }
    }
    if (chosen < 0) {
      count += 1; solution ??= [...values];
      return;
    }
    for (const digit of optionsForCell) {
      values[chosen] = digit; visit(); values[chosen] = 0;
      if (!complete || count >= limit) { complete = false; return; }
    }
  };
  // Reject contradictory entries before branching.
  for (const run of runs) if (!runAllows(run, values, -1, 0)) return { count: 0, solution: null, complete: true, nodes: 0 };
  visit();
  return { count, solution, complete, nodes };
}

function runAllows(run: ReturnType<typeof kakuroRuns>[number], values: readonly number[], targetCell: number, candidate: number): boolean {
  let sum = 0; const used = new Set<number>();
  for (const cell of run.cells) {
    const value = cell === targetCell ? candidate : values[cell]!;
    if (!value) continue;
    if (used.has(value)) return false;
    used.add(value); sum += value;
  }
  const slots = run.cells.filter(cell => !values[cell] && cell !== targetCell).length;
  return sum <= run.sum && canReach(run.sum - sum, slots, [...used]);
}
