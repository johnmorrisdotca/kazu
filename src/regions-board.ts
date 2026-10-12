import { REGIONS_MOST_SIDE } from "./regions.constants.ts";
import type { RegionsBoard, RegionsCheck } from "./regions.types.ts";

/** Whether the value has valid native Regions dimensions, clues and data.
 *
 * @param value - A candidate board, digit, mark or encoded game specified by this signature.
 * @returns Whether the value has valid native Regions dimensions, clues and data.
 * @example
 * ```ts
 * import type { RegionsBoard } from "@johnmorrisdotca/kazu/regions";
 * import { isRegionsBoard } from "@johnmorrisdotca/kazu/regions";
 *
 * const regionsBoard: RegionsBoard = {"width":5,"height":5,"givens":[0,0,2,0,3,2,0,3,0,0,0,3,0,0,1,3,1,0,1,2,3,3,4,0,0]};
 * console.log(isRegionsBoard(regionsBoard));
 * ```
 */
export function isRegionsBoard(value: unknown): value is RegionsBoard {
  if (!value || typeof value !== "object") return false;
  const board = value as RegionsBoard;
  const cells = board.width * board.height;
  return Number.isInteger(board.width) && board.width >= 2 && board.width <= REGIONS_MOST_SIDE
    && Number.isInteger(board.height) && board.height >= 2 && board.height <= REGIONS_MOST_SIDE
    && Array.isArray(board.givens) && board.givens.length === cells
    && board.givens.every(value => Number.isInteger(value) && value >= 0 && value <= cells);
}

/** Read orthogonally adjacent Regions cells.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @param cell - A zero-based row-major cell index.
 * @returns Read orthogonally adjacent Regions cells.
 * @example
 * ```ts
 * import type { RegionsBoard } from "@johnmorrisdotca/kazu/regions";
 * import { regionsNeighbours } from "@johnmorrisdotca/kazu/regions";
 *
 * const regionsBoard: RegionsBoard = {"width":5,"height":5,"givens":[0,0,2,0,3,2,0,3,0,0,0,3,0,0,1,3,1,0,1,2,3,3,4,0,0]};
 * console.log(regionsNeighbours(regionsBoard,0));
 * ```
 */
export function regionsNeighbours(board: RegionsBoard, cell: number): number[] {
  const x = cell % board.width;
  const y = Math.floor(cell / board.width);
  const neighbours: number[] = [];
  if (x > 0) neighbours.push(cell - 1);
  if (x + 1 < board.width) neighbours.push(cell + 1);
  if (y > 0) neighbours.push(cell - board.width);
  if (y + 1 < board.height) neighbours.push(cell + board.width);
  return neighbours;
}

/** Group connected cells carrying the same entry into candidate regions.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @param entries - Current row-major entries; omit to search from printed clues.
 * @returns Group connected cells carrying the same entry into candidate regions.
 * @example
 * ```ts
 * import type { RegionsBoard, RegionsPuzzle } from "@johnmorrisdotca/kazu/regions";
 * import { entryRegions } from "@johnmorrisdotca/kazu/regions";
 *
 * const regionsBoard: RegionsBoard = {"width":5,"height":5,"givens":[0,0,2,0,3,2,0,3,0,0,0,3,0,0,1,3,1,0,1,2,3,3,4,0,0]};
 * const regionsSolution: RegionsPuzzle["solution"] = [1,2,2,3,3,2,3,3,2,3,2,3,4,2,1,3,1,4,1,2,3,3,4,4,2];
 * console.log(entryRegions(regionsBoard,regionsSolution));
 * ```
 */
export function entryRegions(board: RegionsBoard, entries: readonly number[]): number[][] {
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
      for (const next of regionsNeighbours(board, cell)) {
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

/** Checks region connectivity and area without consulting a generated answer.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @param entries - Current row-major entries; omit to search from printed clues.
 * @returns Checks region connectivity and area without consulting a generated answer.
 * @example
 * ```ts
 * import type { RegionsBoard, RegionsPuzzle } from "@johnmorrisdotca/kazu/regions";
 * import { checkRegions } from "@johnmorrisdotca/kazu/regions";
 *
 * const regionsBoard: RegionsBoard = {"width":5,"height":5,"givens":[0,0,2,0,3,2,0,3,0,0,0,3,0,0,1,3,1,0,1,2,3,3,4,0,0]};
 * const regionsSolution: RegionsPuzzle["solution"] = [1,2,2,3,3,2,3,3,2,3,2,3,4,2,1,3,1,4,1,2,3,3,4,4,2];
 * console.log(checkRegions(regionsBoard,regionsSolution));
 * ```
 */
export function checkRegions(
  board: RegionsBoard,
  entries: readonly number[],
): RegionsCheck {
  if (!isRegionsBoard(board)) throw new RangeError("Invalid Regions board");
  if (!Array.isArray(entries) || entries.length !== board.givens.length) throw new RangeError("Invalid Regions entries");
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
  const regions = entryRegions(board, entries);
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
