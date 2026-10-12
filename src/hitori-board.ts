import { HITORI_LEAST_SIDE, HITORI_MOST_SIDE } from "./hitori.constants.ts";
import type { HitoriBoard } from "./hitori.types.ts";

/** Whether the value has valid native Hitori dimensions, clues and data.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @returns Whether the value has valid native Hitori dimensions, clues and data.
 * @example
 * ```ts
 * import type { HitoriBoard } from "@johnmorrisdotca/kazu/hitori";
 * import { isHitoriBoard } from "@johnmorrisdotca/kazu/hitori";
 *
 * const hitoriBoard: HitoriBoard = {"size":5,"numbers":[4,5,5,1,2,5,2,3,2,1,2,5,4,2,2,3,1,2,5,4,2,3,1,3,4]};
 * console.log(isHitoriBoard(hitoriBoard));
 * ```
 */
export function isHitoriBoard(board: HitoriBoard): boolean {
  return !!board && Number.isInteger(board.size) && board.size >= HITORI_LEAST_SIDE && board.size <= HITORI_MOST_SIDE
    && Array.isArray(board.numbers)
    && board.numbers.length === board.size * board.size
    && board.numbers.every(value => Number.isInteger(value) && value >= 1 && value <= board.size);
}

/** Read orthogonally adjacent cells on a square Hitori board.
 *
 * @param size - The supported square board side length.
 * @param cell - A zero-based row-major cell index.
 * @returns Read orthogonally adjacent cells on a square Hitori board.
 * @example
 * ```ts
 * import type { HitoriBoard } from "@johnmorrisdotca/kazu/hitori";
 * import { hitoriNeighbors } from "@johnmorrisdotca/kazu/hitori";
 *
 * const hitoriBoard: HitoriBoard = {"size":5,"numbers":[4,5,5,1,2,5,2,3,2,1,2,5,4,2,2,3,1,2,5,4,2,3,1,3,4]};
 * console.log(hitoriNeighbors(hitoriBoard.size,0));
 * ```
 */
export function hitoriNeighbors(size: number, cell: number): number[] {
  const x = cell % size, y = Math.floor(cell / size), neighbors: number[] = [];
  if (x > 0) neighbors.push(cell - 1);
  if (x < size - 1) neighbors.push(cell + 1);
  if (y > 0) neighbors.push(cell - size);
  if (y < size - 1) neighbors.push(cell + size);
  return neighbors;
}

/** Checks unshaded row and column duplicates, adjacent shades, and white connectivity.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @param shaded - The current shaded-cell flags in row-major order.
 * @returns Checks unshaded row and column duplicates, adjacent shades, and white connectivity.
 * @example
 * ```ts
 * import type { HitoriBoard, HitoriPuzzle } from "@johnmorrisdotca/kazu/hitori";
 * import { checkHitori } from "@johnmorrisdotca/kazu/hitori";
 *
 * const hitoriBoard: HitoriBoard = {"size":5,"numbers":[4,5,5,1,2,5,2,3,2,1,2,5,4,2,2,3,1,2,5,4,2,3,1,3,4]};
 * const hitoriSolution: HitoriPuzzle["solution"] = [false,true,false,false,false,false,false,false,true,false,true,false,false,false,true,false,false,false,false,false,false,true,false,false,true];
 * console.log(checkHitori(hitoriBoard,hitoriSolution));
 * ```
 */
export function checkHitori(board: HitoriBoard, shaded: readonly boolean[]): { ok: boolean; errors: readonly number[] } {
  if (!isHitoriBoard(board)) return { ok: false, errors: [] };
  const size = board.size, total = size * size;
  if (shaded.length !== total || !shaded.every(value => typeof value === "boolean")) return { ok: false, errors: [] };
  const errors = new Set<number>();
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const cell = y * size + x;
    if (shaded[cell]) continue;
    for (let otherX = x + 1; otherX < size; otherX += 1) {
      const other = y * size + otherX;
      if (!shaded[other] && board.numbers[cell] === board.numbers[other]) { errors.add(cell); errors.add(other); }
    }
    for (let otherY = y + 1; otherY < size; otherY += 1) {
      const other = otherY * size + x;
      if (!shaded[other] && board.numbers[cell] === board.numbers[other]) { errors.add(cell); errors.add(other); }
    }
  }
  for (let cell = 0; cell < total; cell += 1) if (shaded[cell]) {
    for (const neighbor of hitoriNeighbors(size, cell)) if (shaded[neighbor]) { errors.add(cell); errors.add(neighbor); }
  }

  const white = shaded.map((isShaded, cell) => isShaded ? -1 : cell).filter(cell => cell >= 0), reached = new Set<number>();
  if (white.length) {
    const stack = [white[0]!]; reached.add(white[0]!);
    while (stack.length) for (const neighbor of hitoriNeighbors(size, stack.pop()!)) {
      if (!shaded[neighbor] && !reached.has(neighbor)) { reached.add(neighbor); stack.push(neighbor); }
    }
  }
  if (reached.size !== white.length) for (const cell of white) if (!reached.has(cell)) errors.add(cell);
  return { ok: errors.size === 0, errors: [...errors].sort((a, b) => a - b) };
}
