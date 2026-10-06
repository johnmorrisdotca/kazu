import { YAJILIN_SIZES } from "./yajilin.constants.ts";
import type { YajilinBoard, YajilinCheck, YajilinDirection } from "./yajilin.types.ts";

const directionDelta: Record<YajilinDirection, [number, number]> = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };
export const yajilinEdgeCount = (board: YajilinBoard) => board.height * (board.width - 1) + board.width * (board.height - 1);

export function isYajilinBoard(value: unknown): value is YajilinBoard {
  if (!value || typeof value !== "object") return false;
  const board = value as YajilinBoard;
  if (!YAJILIN_SIZES.includes(board.width as 5 | 7) || board.width !== board.height
    || !Array.isArray(board.clues) || board.clues.length !== board.width * board.height) return false;
  return board.clues.every(clue => clue === null || (!!clue && typeof clue === "object"
    && Object.hasOwn(directionDelta, clue.direction) && Number.isInteger(clue.count) && clue.count >= 0 && clue.count < board.width));
}

export function yajilinNeighbors(board: YajilinBoard, cell: number): { cell: number; edge: number }[] {
  const x = cell % board.width, y = Math.floor(cell / board.width), horizontal = board.height * (board.width - 1), result = [];
  if (y > 0) result.push({ cell: cell - board.width, edge: horizontal + (y - 1) * board.width + x });
  if (x < board.width - 1) result.push({ cell: cell + 1, edge: y * (board.width - 1) + x });
  if (y < board.height - 1) result.push({ cell: cell + board.width, edge: horizontal + y * board.width + x });
  if (x > 0) result.push({ cell: cell - 1, edge: y * (board.width - 1) + x - 1 });
  return result;
}

function ray(board: YajilinBoard, cell: number, direction: YajilinDirection): number[] {
  const [dx, dy] = directionDelta[direction], cells = [];
  let x = cell % board.width + dx, y = Math.floor(cell / board.width) + dy;
  while (x >= 0 && x < board.width && y >= 0 && y < board.height) { cells.push(y * board.width + x); x += dx; y += dy; }
  return cells;
}

export function checkYajilin(board: YajilinBoard, shaded: readonly boolean[], lines: readonly number[]): YajilinCheck {
  if (!isYajilinBoard(board)) throw new RangeError("Invalid Yajilin board");
  const size = board.width, total = size * size, edges = new Set(lines), errors = new Set<number>();
  if (shaded.length !== total || !shaded.every(value => typeof value === "boolean")) return { ok: false, errors: [] };
  if (edges.size !== lines.length || lines.some(edge => !Number.isInteger(edge) || edge < 0 || edge >= yajilinEdgeCount(board))) return { ok: false, errors: [] };
  for (let cell = 0; cell < total; cell += 1) {
    const clue = board.clues[cell]!;
    if (clue && shaded[cell]) errors.add(cell);
    if (shaded[cell]) {
      if (cell % size < size - 1 && shaded[cell + 1]) { errors.add(cell); errors.add(cell + 1); }
      if (cell + size < total && shaded[cell + size]) { errors.add(cell); errors.add(cell + size); }
    }
    if (clue && ray(board, cell, clue.direction).filter(next => shaded[next]).length !== clue.count) errors.add(cell);
  }
  const degrees = board.clues.map((clue, cell) => {
    const degree = yajilinNeighbors(board, cell).filter(next => edges.has(next.edge)).length;
    if ((clue || shaded[cell]) && degree > 0) errors.add(cell);
    if (!clue && !shaded[cell] && degree !== 2) errors.add(cell);
    return degree;
  });
  if (edges.size) {
    const first = degrees.findIndex(degree => degree > 0), reached = new Set([first]), stack = [first];
    while (stack.length) {
      const cell = stack.pop()!;
      for (const next of yajilinNeighbors(board, cell)) if (edges.has(next.edge) && !reached.has(next.cell)) { reached.add(next.cell); stack.push(next.cell); }
    }
    const loopCells = degrees.filter(degree => degree > 0).length;
    if (reached.size !== loopCells || edges.size !== loopCells) for (const cell of reached) errors.add(cell);
  }
  const playable = board.clues.filter((clue, cell) => !clue && !shaded[cell]).length;
  const ok = playable >= 4 && edges.size === playable && errors.size === 0
    && degrees.every((degree, cell) => board.clues[cell] || shaded[cell] ? degree === 0 : degree === 2);
  return { ok, errors: [...errors] };
}

export function yajilinRay(board: YajilinBoard, cell: number, direction: YajilinDirection): number[] {
  return ray(board, cell, direction);
}
