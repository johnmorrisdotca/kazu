import { AKARI_MOST_SIDE } from "./akari.constants.ts";
import type { AkariBoard, AkariCheck, AkariProgress } from "./akari.types.ts";

/** Validates dimensions and the three public square kinds. */
export function isAkariBoard(value: unknown): value is AkariBoard {
  if (!value || typeof value !== "object") return false;
  const board = value as AkariBoard;
  return Number.isInteger(board.width) && board.width >= 2 && board.width <= AKARI_MOST_SIDE
    && Number.isInteger(board.height) && board.height >= 2 && board.height <= AKARI_MOST_SIDE
    && Array.isArray(board.cells) && board.cells.length === board.width * board.height
    && board.cells.every(cell => cell === null || cell === false
      || Number.isInteger(cell) && cell >= 0 && cell <= 4)
    && board.cells.some(cell => cell === null);
}

/** Returns the orthogonally adjacent cells to a board position. */
export function akariNeighbours(board: AkariBoard, cell: number): number[] {
  if (!Number.isInteger(cell) || cell < 0 || cell >= board.cells.length) return [];
  const x = cell % board.width;
  const y = Math.floor(cell / board.width);
  const coordinates = [[x, y - 1], [x + 1, y], [x, y + 1], [x - 1, y]];
  return coordinates
    .filter(([cx, cy]) => cx! >= 0 && cx! < board.width && cy! >= 0 && cy! < board.height)
    .map(([cx, cy]) => cy! * board.width + cx!);
}

/** White squares visible from a cell, including itself, stopping at black squares and edges. */
export function akariVisible(board: AkariBoard, cell: number): number[] {
  if (!Number.isInteger(cell) || cell < 0 || cell >= board.cells.length || board.cells[cell] !== null) return [];
  const x = cell % board.width;
  const y = Math.floor(cell / board.width);
  const visible = [cell];

  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    let cx = x + dx!;
    let cy = y + dy!;
    while (cx >= 0 && cx < board.width && cy >= 0 && cy < board.height) {
      const next = cy * board.width + cx;
      if (board.cells[next] !== null) break;
      visible.push(next);
      cx += dx!;
      cy += dy!;
    }
  }
  return visible;
}

function evaluate(board: AkariBoard, bulbs: readonly number[], complete: boolean): AkariCheck {
  if (!isAkariBoard(board)) throw new RangeError("Invalid Akari board");
  const errors: number[] = [];
  const conflicts: number[] = [];
  const numbered: number[] = [];
  const dark: number[] = [];
  const unique = new Set<number>();

  bulbs.forEach((cell, index) => {
    if (!Number.isInteger(cell) || cell < 0 || cell >= board.cells.length
      || board.cells[cell] !== null || unique.has(cell)) {
      errors.push(index);
    } else {
      unique.add(cell);
    }
  });

  const lit = new Set<number>();
  for (const bulb of unique) {
    const ray = akariVisible(board, bulb);
    ray.forEach(cell => lit.add(cell));
    if (ray.some(cell => cell !== bulb && unique.has(cell))) conflicts.push(bulb);
  }

  for (let cell = 0; cell < board.cells.length; cell += 1) {
    if (board.cells[cell] === null && !lit.has(cell)) dark.push(cell);
    const clue = board.cells[cell];
    if (typeof clue !== "number") continue;
    const adjacent = akariNeighbours(board, cell).filter(neighbour => unique.has(neighbour)).length;
    if (complete ? adjacent !== clue : adjacent > clue) numbered.push(cell);
  }

  return {
    ok: !errors.length && !conflicts.length && !numbered.length && (!complete || !dark.length),
    illuminated: lit.size,
    errors,
    dark,
    numbered,
    conflicts,
  };
}

/** Checks a complete placement from the public rules, without consulting a stored answer. */
export function checkAkari(board: AkariBoard, bulbs: readonly number[]): AkariCheck {
  return evaluate(board, bulbs, true);
}

/** Reports immediate contradictions while allowing required clues to remain unsatisfied during play. */
export function progressAkari(board: AkariBoard, bulbs: readonly number[]): AkariProgress {
  return evaluate(board, bulbs, false);
}
