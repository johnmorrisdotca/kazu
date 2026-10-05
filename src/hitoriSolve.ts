import { HITORI_MAX_NODES } from "./hitori.constants.ts";
import { checkHitori, hitoriNeighbors, isHitoriBoard } from "./hitoriBoard.ts";
import type { HitoriBoard, HitoriSolve } from "./hitori.types.ts";

function firstUnshadedDuplicate(board: HitoriBoard, shaded: readonly boolean[]): [number, number] | null {
  const size = board.size;
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const cell = y * size + x;
    if (shaded[cell]) continue;
    for (let otherX = x + 1; otherX < size; otherX += 1) {
      const other = y * size + otherX;
      if (!shaded[other] && board.numbers[cell] === board.numbers[other]) return [cell, other];
    }
    for (let otherY = y + 1; otherY < size; otherY += 1) {
      const other = otherY * size + x;
      if (!shaded[other] && board.numbers[cell] === board.numbers[other]) return [cell, other];
    }
  }
  return null;
}

/** A valid answer cannot contain an unnecessary shade; this avoids treating extra black cells as separate puzzle solutions. */
function isMinimalSolution(board: HitoriBoard, shaded: readonly boolean[]): boolean {
  if (!checkHitori(board, shaded).ok) return false;
  for (let cell = 0; cell < shaded.length; cell += 1) if (shaded[cell]) {
    const smaller = [...shaded]; smaller[cell] = false;
    if (checkHitori(board, smaller).ok) return false;
  }
  return true;
}

/** Counts distinct minimal shade patterns. A non-complete result never asserts uniqueness. */
export function solveHitori(board: HitoriBoard, options: { limit?: number; nodes?: number } = {}): HitoriSolve {
  if (!isHitoriBoard(board)) throw new RangeError("Invalid Hitori board");
  const limit = Math.max(1, Math.floor(options.limit ?? 2));
  const budget = Math.max(1, Math.floor(options.nodes ?? HITORI_MAX_NODES));
  let nodes = 0, count = 0, solution: boolean[] | null = null, exhausted = false;

  const search = (shaded: boolean[]) => {
    if (count >= limit || exhausted) return;
    nodes += 1;
    if (nodes > budget) { exhausted = true; return; }
    const duplicate = firstUnshadedDuplicate(board, shaded);
    if (!duplicate) {
      if (isMinimalSolution(board, shaded)) { count += 1; solution ??= [...shaded]; }
      return;
    }
    for (const cell of duplicate) {
      if (hitoriNeighbors(board.size, cell).some(neighbor => shaded[neighbor])) continue;
      shaded[cell] = true;
      search(shaded);
      shaded[cell] = false;
    }
  };

  search(Array(board.size * board.size).fill(false));
  return { count, solution, complete: !exhausted && count < limit, nodes: Math.min(nodes, budget) };
}
