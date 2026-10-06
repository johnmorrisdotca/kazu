import { FILLOMINO_MOST_SIDE } from "./fillomino.constants.ts";
import type { FillominoBoard, FillominoCheck } from "./fillomino.types.ts";

export function isFillominoBoard(value: unknown): value is FillominoBoard {
  if (!value || typeof value !== "object") return false;
  const board = value as FillominoBoard;
  const cells = board.width * board.height;
  return Number.isInteger(board.width) && board.width >= 2 && board.width <= FILLOMINO_MOST_SIDE
    && Number.isInteger(board.height) && board.height >= 2 && board.height <= FILLOMINO_MOST_SIDE
    && Array.isArray(board.givens) && board.givens.length === cells
    && board.givens.every(value => Number.isInteger(value) && value >= 0 && value <= cells);
}

export function fillominoNeighbours(board: FillominoBoard, cell: number): number[] {
  const x = cell % board.width;
  const y = Math.floor(cell / board.width);
  const neighbours: number[] = [];
  if (x > 0) neighbours.push(cell - 1);
  if (x + 1 < board.width) neighbours.push(cell + 1);
  if (y > 0) neighbours.push(cell - board.width);
  if (y + 1 < board.height) neighbours.push(cell + board.width);
  return neighbours;
}

export function fillominoRegions(board: FillominoBoard, entries: readonly number[]): number[][] {
  const seen = new Set<number>();
  const regions: number[][] = [];
  for (let start = 0; start < entries.length; start += 1) {
    if (!entries[start] || seen.has(start)) continue;
    const value = entries[start]!;
    const region: number[] = [];
    const pending = [start];
    seen.add(start);
    while (pending.length) {
      const cell = pending.pop()!;
      region.push(cell);
      for (const next of fillominoNeighbours(board, cell)) {
        if (!seen.has(next) && entries[next] === value) {
          seen.add(next);
          pending.push(next);
        }
      }
    }
    regions.push(region);
  }
  return regions;
}

/** Checks region connectivity and area without consulting a generated answer. */
export function checkFillomino(
  board: FillominoBoard,
  entries: readonly number[],
): FillominoCheck {
  if (!isFillominoBoard(board)) throw new RangeError("Invalid Fillomino board");
  if (!Array.isArray(entries) || entries.length !== board.givens.length) throw new RangeError("Invalid Fillomino entries");
  const errors = new Set<number>();
  let filled = 0;
  entries.forEach((value, cell) => {
    if (!Number.isInteger(value) || value < 0 || value > entries.length) {
      errors.add(cell);
      return;
    }
    if (value > 0) filled += 1;
    if (board.givens[cell] && value !== board.givens[cell]) errors.add(cell);
  });
  const regions = fillominoRegions(board, entries);
  for (const region of regions) {
    const number = entries[region[0]!]!;
    if (region.length > number) region.forEach(cell => errors.add(cell));
  }
  const componentErrors = errors.size > 0;
  const complete = filled === entries.length;
  const validAreas = regions.every(region => region.length === entries[region[0]!]!);
  return {
    ok: complete && !componentErrors && validAreas,
    complete,
    filled,
    regions: regions.length,
    errors: [...errors].sort((a, b) => a - b),
  };
}
