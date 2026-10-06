import { MASYU_SIZES } from "./masyu.constants.ts";
import type { MasyuBoard, MasyuCheck } from "./masyu.types.ts";

export const masyuCellCount = (board: MasyuBoard) => board.width * board.height;
export const masyuEdgeCount = (board: MasyuBoard) => board.height * (board.width - 1) + board.width * (board.height - 1);

export function isMasyuBoard(value: unknown): value is MasyuBoard {
  if (!value || typeof value !== "object") return false;
  const board = value as MasyuBoard;
  return MASYU_SIZES.includes(board.width as 5 | 7) && board.width === board.height
    && Array.isArray(board.pearls) && board.pearls.length === masyuCellCount(board)
    && board.pearls.every(pearl => pearl === 0 || pearl === 1 || pearl === 2)
    && board.pearls.some(Boolean);
}

export function masyuNeighbors(board: MasyuBoard, cell: number): { cell: number; edge: number; direction: number }[] {
  const x = cell % board.width, y = Math.floor(cell / board.width), horizontal = board.height * (board.width - 1);
  const result = [];
  if (y > 0) result.push({ cell: cell - board.width, edge: horizontal + (y - 1) * board.width + x, direction: 0 });
  if (x < board.width - 1) result.push({ cell: cell + 1, edge: y * (board.width - 1) + x, direction: 1 });
  if (y < board.height - 1) result.push({ cell: cell + board.width, edge: horizontal + y * board.width + x, direction: 2 });
  if (x > 0) result.push({ cell: cell - 1, edge: y * (board.width - 1) + x - 1, direction: 3 });
  return result;
}

function pearlRule(board: MasyuBoard, edges: ReadonlySet<number>, cell: number): boolean {
  const directions = masyuNeighbors(board, cell).filter(next => edges.has(next.edge)).map(next => next.direction);
  if (directions.length !== 2) return false;
  const pearl = board.pearls[cell];
  if (pearl === 1) {
    if ((directions[0]! + 2) % 4 !== directions[1]) return false;
    return directions.some(direction => {
      const next = masyuNeighbors(board, cell).find(item => item.direction === direction)!;
      const nextDirections = masyuNeighbors(board, next.cell).filter(item => edges.has(item.edge)).map(item => item.direction);
      return nextDirections.length === 2 && (nextDirections[0]! + 2) % 4 !== nextDirections[1];
    });
  }
  if (pearl === 2) {
    if ((directions[0]! + 2) % 4 === directions[1]) return false;
    return directions.every(direction => {
      const next = masyuNeighbors(board, cell).find(item => item.direction === direction)!;
      const nextDirections = masyuNeighbors(board, next.cell).filter(item => edges.has(item.edge)).map(item => item.direction);
      return nextDirections.length === 2 && (nextDirections[0]! + 2) % 4 === nextDirections[1];
    });
  }
  return true;
}

export function checkMasyu(board: MasyuBoard, lines: readonly number[]): MasyuCheck {
  if (!isMasyuBoard(board)) throw new RangeError("Invalid Masyu board");
  const edgeCount = masyuEdgeCount(board), edges = new Set(lines), errors = new Set<number>();
  if (edges.size !== lines.length || lines.some(edge => !Number.isInteger(edge) || edge < 0 || edge >= edgeCount)) {
    return { ok: false, errors: [] };
  }
  const degrees = board.pearls.map((_, cell) => masyuNeighbors(board, cell).filter(next => edges.has(next.edge)).length);
  for (let cell = 0; cell < degrees.length; cell += 1) {
    if (degrees[cell] !== 0 && degrees[cell] !== 2 || (board.pearls[cell] > 0 && degrees[cell] !== 2)) errors.add(cell);
  }
  if (edges.size) {
    const start = degrees.findIndex(degree => degree === 2), reached = new Set([start]), stack = [start];
    while (stack.length) {
      const cell = stack.pop()!;
      for (const next of masyuNeighbors(board, cell)) if (edges.has(next.edge) && !reached.has(next.cell)) {
        reached.add(next.cell); stack.push(next.cell);
      }
    }
    for (let cell = 0; cell < degrees.length; cell += 1) if (degrees[cell] === 2 && !reached.has(cell)) errors.add(cell);
    if (reached.size !== edges.size) for (const cell of reached) errors.add(cell);
  }
  for (let cell = 0; cell < degrees.length; cell += 1) {
    if (degrees[cell] === 2 && !pearlRule(board, edges, cell)) errors.add(cell);
  }
  const complete = edges.size > 0 && degrees.every(degree => degree === 0 || degree === 2)
    && degrees.every((degree, cell) => board.pearls[cell] === 0 || degree === 2)
    && degrees.filter(degree => degree === 2).length === edges.size;
  return { ok: complete && errors.size === 0, errors: [...errors] };
}
