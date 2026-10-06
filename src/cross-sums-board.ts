import { CROSS_SUMS_MAX_SIDE, CROSS_SUMS_MIN_SIDE } from "./cross-sums.constants.ts";
import type { CrossSumsBoard, CrossSumsCheck, CrossSumsCell, CrossSumsRun } from "./cross-sums.types.ts";

export function isCrossSumsBoard(value: unknown): value is CrossSumsBoard {
  if (!value || typeof value !== "object") return false;
  const board = value as CrossSumsBoard;
  if (!Number.isInteger(board.width) || board.width < CROSS_SUMS_MIN_SIDE || board.width > CROSS_SUMS_MAX_SIDE
    || !Number.isInteger(board.height) || board.height < CROSS_SUMS_MIN_SIDE || board.height > CROSS_SUMS_MAX_SIDE
    || !Array.isArray(board.cells) || board.cells.length !== board.width * board.height
    || board.cells.some(cell => !validCell(cell))) return false;
  const runs = collectRuns(board);
  if (!runs) return false;
  return runs.length > 0 && runs.every(run => {
    const length = run.cells.length;
    const min = length * (length + 1) / 2;
    const max = length * (19 - length) / 2;
    return length >= 2 && length <= 9 && run.sum >= min && run.sum <= max;
  });
}

function validCell(cell: CrossSumsCell): boolean {
  if (!cell || typeof cell !== "object") return false;
  if (cell.kind === "white") return true;
  return cell.kind === "black" && [cell.across, cell.down].every(value => value === null
    || Number.isInteger(value) && value >= 3 && value <= 45);
}

export function crossSumsRuns(board: CrossSumsBoard): CrossSumsRun[] {
  if (!isCrossSumsBoard(board)) throw new RangeError("Invalid Cross Sums board");
  return collectRuns(board)!;
}

function collectRuns(board: CrossSumsBoard): CrossSumsRun[] | null {
  const runs: CrossSumsRun[] = [];
  const acrossCount = Array(board.cells.length).fill(0), downCount = Array(board.cells.length).fill(0);
  for (let cell = 0; cell < board.cells.length; cell += 1) {
    const x = cell % board.width, y = Math.floor(cell / board.width), tile = board.cells[cell]!;
    if (tile.kind === "white") continue;
    const rightWhite = x + 1 < board.width && board.cells[cell + 1]?.kind === "white";
    const downWhite = y + 1 < board.height && board.cells[cell + board.width]?.kind === "white";
    if ((tile.across !== null) !== rightWhite || (tile.down !== null) !== downWhite) return null;
    if (rightWhite) {
      const cells: number[] = [];
      for (let at = cell + 1; at < (y + 1) * board.width && board.cells[at]?.kind === "white"; at += 1) cells.push(at);
      if (cells.length < 2 || cells.length > 9) return null;
      cells.forEach(at => { acrossCount[at] += 1; });
      runs.push({ direction: "across", clueCell: cell, cells, sum: tile.across! });
    }
    if (downWhite) {
      const cells: number[] = [];
      for (let at = cell + board.width; at < board.cells.length && board.cells[at]?.kind === "white"; at += board.width) cells.push(at);
      if (cells.length < 2 || cells.length > 9) return null;
      cells.forEach(at => { downCount[at] += 1; });
      runs.push({ direction: "down", clueCell: cell, cells, sum: tile.down! });
    }
  }
  for (let cell = 0; cell < board.cells.length; cell += 1) {
    if (board.cells[cell]!.kind === "white" && (acrossCount[cell] !== 1 || downCount[cell] !== 1)) return null;
  }
  return runs;
}

/** Checks exact run sums and distinct digits independently of a stored answer. */
export function checkCrossSums(board: CrossSumsBoard, values: readonly number[]): CrossSumsCheck {
  if (!isCrossSumsBoard(board)) throw new RangeError("Invalid Cross Sums board");
  if (values.length !== board.cells.length) throw new RangeError("Invalid Cross Sums values");
  const errors = new Set<number>(), runs = crossSumsRuns(board);
  values.forEach((value, cell) => {
    if (board.cells[cell]!.kind === "black" ? value !== 0 : !Number.isInteger(value) || value < 0 || value > 9) errors.add(cell);
  });
  for (const run of runs) {
    const filled = run.cells.map(cell => values[cell]!).filter(value => value > 0);
    const duplicate = new Set(filled.filter((value, index) => filled.indexOf(value) !== index));
    const sum = filled.reduce((total, value) => total + value, 0);
    const missing = run.cells.length - filled.length;
    if (duplicate.size || sum > run.sum || !canReach(run.sum - sum, missing, filled)) run.cells.forEach(cell => errors.add(cell));
    if (missing === 0 && sum !== run.sum) run.cells.forEach(cell => errors.add(cell));
  }
  const complete = board.cells.every((cell, index) => cell.kind === "black" || values[index]! > 0);
  return { ok: complete && errors.size === 0, complete, errors: [...errors].sort((a, b) => a - b) };
}

/** Allows unfinished runs while flagging duplicate digits and impossible remaining totals. */
export function progressCrossSums(board: CrossSumsBoard, values: readonly number[]): CrossSumsCheck {
  const result = checkCrossSums(board, values);
  return { ...result, ok: result.errors.length === 0 };
}

export function canReach(target: number, slots: number, used: readonly number[]): boolean {
  if (slots === 0) return target === 0;
  if (target < 1 || slots > 9) return false;
  const mask = used.reduce((bits, value) => bits | (1 << value), 0);
  const visit = (next: number, remaining: number, count: number): boolean => {
    if (count === 0) return remaining === 0;
    for (let digit = next; digit <= 9; digit += 1) {
      if (mask & (1 << digit)) continue;
      if (visit(digit + 1, remaining - digit, count - 1)) return true;
    }
    return false;
  };
  return visit(1, target, slots);
}
