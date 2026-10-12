import type { NurikabeBoard } from "./nurikabe.types.ts";

/** Whether the value has valid native Nurikabe dimensions, clues and data.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @returns Whether the value has valid native Nurikabe dimensions, clues and data.
 * @example
 * ```ts
 * import type { NurikabeBoard } from "@johnmorrisdotca/kazu/nurikabe";
 * import { isNurikabeBoard } from "@johnmorrisdotca/kazu/nurikabe";
 *
 * const nurikabeBoard: NurikabeBoard = {"size":5,"clues":[1,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,2,0,0,3,0,0]};
 * console.log(isNurikabeBoard(nurikabeBoard));
 * ```
 */
export function isNurikabeBoard(board: NurikabeBoard): boolean {
  return !!board && board.size === 5 && Array.isArray(board.clues)
    && board.clues.length === board.size * board.size
    && board.clues.every(value => Number.isInteger(value) && value >= 0 && value <= board.size ** 2)
    && board.clues.some(value => value > 0)
    && board.clues.reduce((sum, value) => sum + value, 0) < board.size * board.size;
}

/** Read orthogonally adjacent cells on a square Nurikabe board.
 *
 * @param size - The supported square board side length.
 * @param cell - A zero-based row-major cell index.
 * @returns Read orthogonally adjacent cells on a square Nurikabe board.
 * @example
 * ```ts
 * import type { NurikabeBoard } from "@johnmorrisdotca/kazu/nurikabe";
 * import { nurikabeNeighbors } from "@johnmorrisdotca/kazu/nurikabe";
 *
 * const nurikabeBoard: NurikabeBoard = {"size":5,"clues":[1,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,2,0,0,3,0,0]};
 * console.log(nurikabeNeighbors(nurikabeBoard.size,0));
 * ```
 */
export function nurikabeNeighbors(size: number, cell: number): number[] {
  const x = cell % size, y = Math.floor(cell / size), neighbors: number[] = [];
  if (x > 0) neighbors.push(cell - 1);
  if (x < size - 1) neighbors.push(cell + 1);
  if (y > 0) neighbors.push(cell - size);
  if (y < size - 1) neighbors.push(cell + size);
  return neighbors;
}

/** Checks island areas and separation, the connected sea, and the ban on 2×2 sea blocks.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @param sea - The current sea-cell flags in row-major order.
 * @returns Checks island areas and separation, the connected sea, and the ban on 2×2 sea blocks.
 * @example
 * ```ts
 * import type { NurikabeBoard, NurikabePuzzle } from "@johnmorrisdotca/kazu/nurikabe";
 * import { checkNurikabe } from "@johnmorrisdotca/kazu/nurikabe";
 *
 * const nurikabeBoard: NurikabeBoard = {"size":5,"clues":[1,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,2,0,0,3,0,0]};
 * const nurikabeSolution: NurikabePuzzle["solution"] = [false,true,true,true,false,true,true,false,false,false,true,false,false,true,true,true,true,true,true,false,false,false,false,true,false];
 * console.log(checkNurikabe(nurikabeBoard,nurikabeSolution));
 * ```
 */
export function checkNurikabe(board: NurikabeBoard, sea: readonly boolean[]): { ok: boolean; errors: readonly number[] } {
  if (!isNurikabeBoard(board) || sea.length !== board.size * board.size || !sea.every(value => typeof value === "boolean")) return { ok: false, errors: [] };
  const size = board.size, total = size * size, errors = new Set<number>();
  for (let cell = 0; cell < total; cell += 1) if (board.clues[cell] && sea[cell]) errors.add(cell);
  for (let y = 0; y < size - 1; y += 1) for (let x = 0; x < size - 1; x += 1) {
    const square = [y * size + x, y * size + x + 1, (y + 1) * size + x, (y + 1) * size + x + 1];
    if (square.every(cell => sea[cell])) square.forEach(cell => errors.add(cell));
  }

  const visited = new Set<number>(), islands: { cells: number[]; clues: number[] }[] = [];
  for (let start = 0; start < total; start += 1) if (!sea[start] && !visited.has(start)) {
    const stack = [start], cells: number[] = [], clues: number[] = [];
    visited.add(start);
    while (stack.length) {
      const cell = stack.pop()!;
      cells.push(cell);
      if (board.clues[cell]) clues.push(cell);
      for (const next of nurikabeNeighbors(size, cell)) if (!sea[next] && !visited.has(next)) { visited.add(next); stack.push(next); }
    }
    islands.push({ cells, clues });
    if (clues.length !== 1 || board.clues[clues[0]!] !== cells.length) cells.forEach(cell => errors.add(cell));
  }
  for (let cell = 0; cell < total; cell += 1) if (board.clues[cell] && !islands.some(island => island.clues[0] === cell)) errors.add(cell);

  const black = sea.map((value, cell) => value ? cell : -1).filter(cell => cell >= 0), connected = new Set<number>();
  if (black.length) {
    const stack = [black[0]!]; connected.add(black[0]!);
    while (stack.length) for (const next of nurikabeNeighbors(size, stack.pop()!)) if (sea[next] && !connected.has(next)) { connected.add(next); stack.push(next); }
  }
  for (const cell of black) if (!connected.has(cell)) errors.add(cell);
  return { ok: errors.size === 0, errors: [...errors].sort((a, b) => a - b) };
}
