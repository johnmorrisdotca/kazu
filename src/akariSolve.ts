import { AKARI_MOST_NODES } from "./akari.constants.ts";
import { akariNeighbours, akariVisible, checkAkari, isAkariBoard } from "./akariBoard.ts";
import type { AkariBoard, AkariSolve } from "./akari.types.ts";

/** Bounded binary constraint search; a stopped proof is always marked incomplete. */
export function solveAkari(
  board: AkariBoard,
  options: { limit?: number; nodes?: number } = {},
): AkariSolve {
  if (!isAkariBoard(board)) throw new RangeError("Invalid Akari board");
  const limit = options.limit ?? 2;
  const budget = options.nodes ?? AKARI_MOST_NODES;
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(budget) || budget < 1) {
    throw new RangeError("Invalid search bounds");
  }

  const whites = board.cells.flatMap((value, cell) => value === null ? [cell] : []);
  const visible = whites.map(cell => akariVisible(board, cell));
  let nodes = 0;
  let count = 0;
  let complete = true;
  let solution: number[] | null = null;

  const search = (start: Int8Array) => {
    if (!complete) return;
    nodes += 1;
    if (nodes > budget) {
      complete = false;
      return;
    }

    const assigned = start.slice();
    let changed = true;
    while (changed) {
      changed = false;

      // A placed bulb rules out every other white square in its four rays.
      for (let i = 0; i < whites.length; i += 1) {
        if (assigned[i] !== 1) continue;
        for (const cell of visible[i]!) {
          if (cell === whites[i]) continue;
          const other = whites.indexOf(cell);
          if (assigned[other] === 1) return;
          if (assigned[other] < 0) {
            assigned[other] = 0;
            changed = true;
          }
        }
      }

      // Numbered black squares provide lower and upper bounds on adjacent bulbs.
      for (let cell = 0; cell < board.cells.length; cell += 1) {
        const clue = board.cells[cell];
        if (typeof clue !== "number") continue;
        const nearby = akariNeighbours(board, cell)
          .map(neighbour => whites.indexOf(neighbour))
          .filter(index => index >= 0);
        const on = nearby.filter(index => assigned[index] === 1).length;
        const unknown = nearby.filter(index => assigned[index] < 0);
        if (on > clue || on + unknown.length < clue) return;
        if (on === clue) {
          for (const index of unknown) {
            assigned[index] = 0;
            changed = true;
          }
        }
        if (on + unknown.length === clue) {
          for (const index of unknown) {
            assigned[index] = 1;
            changed = true;
          }
        }
      }

      // Every white cell still needs a possible source of light.
      for (let i = 0; i < whites.length; i += 1) {
        const ray = visible[i]!.map(cell => whites.indexOf(cell));
        if (ray.some(index => assigned[index] === 1)) continue;
        const unknown = ray.filter(index => assigned[index] < 0);
        if (!unknown.length) return;
        if (unknown.length === 1) {
          assigned[unknown[0]!] = 1;
          changed = true;
        }
      }
    }

    const branch = assigned.findIndex(value => value < 0);
    if (branch < 0) {
      const bulbs = whites.filter((_, index) => assigned[index] === 1);
      if (!checkAkari(board, bulbs).ok) return;
      count += 1;
      solution ??= bulbs;
      if (count >= limit) complete = false;
      return;
    }

    for (const value of [1, 0]) {
      const next = assigned.slice();
      next[branch] = value;
      search(next);
      if (!complete) return;
    }
  };

  search(new Int8Array(whites.length).fill(-1));
  return { count, solution, complete, nodes };
}
