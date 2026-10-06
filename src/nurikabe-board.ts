import type { NurikabeBoard } from "./nurikabe.types.ts";

export function isNurikabeBoard(board: NurikabeBoard): boolean {
  return !!board && board.size === 5 && Array.isArray(board.clues)
    && board.clues.length === board.size * board.size
    && board.clues.every(value => Number.isInteger(value) && value >= 0 && value <= board.size ** 2)
    && board.clues.some(value => value > 0)
    && board.clues.reduce((sum, value) => sum + value, 0) < board.size * board.size;
}

export function nurikabeNeighbors(size: number, cell: number): number[] {
  const x = cell % size, y = Math.floor(cell / size), neighbors: number[] = [];
  if (x > 0) neighbors.push(cell - 1);
  if (x < size - 1) neighbors.push(cell + 1);
  if (y > 0) neighbors.push(cell - size);
  if (y < size - 1) neighbors.push(cell + size);
  return neighbors;
}

/** Checks island areas and separation, the connected sea, and the ban on 2×2 sea blocks. */
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
