import { YAJILIN_SIZES } from "./yajilin.constants.ts";
import type { YajilinBoard, YajilinCheck, YajilinDirection } from "./yajilin.types.ts";

const directionDelta: Record<YajilinDirection, [number, number]> = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };
/** Count native Yajilin edges.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @returns Count native Yajilin edges.
 * @example
 * ```ts
 * import type { YajilinBoard } from "@johnmorrisdotca/kazu/yajilin";
 * import { yajilinEdgeCount } from "@johnmorrisdotca/kazu/yajilin";
 *
 * const yajilinBoard: YajilinBoard = {"width":5,"height":5,"clues":[{"direction":"left","count":0},null,{"direction":"right","count":1},null,{"direction":"up","count":0},null,null,null,null,null,{"direction":"right","count":0},null,{"direction":"left","count":0},null,{"direction":"down","count":1},{"direction":"left","count":0},null,null,null,null,null,{"direction":"up","count":1},{"direction":"down","count":0},null,{"direction":"down","count":0}]};
 * console.log(yajilinEdgeCount(yajilinBoard));
 * ```
 */
export const yajilinEdgeCount = (board: YajilinBoard) => board.height * (board.width - 1) + board.width * (board.height - 1);

/** Whether the value has valid native Yajilin dimensions, clues and data.
 *
 * @param value - A candidate board, digit, mark or encoded game specified by this signature.
 * @returns Whether the value has valid native Yajilin dimensions, clues and data.
 * @example
 * ```ts
 * import type { YajilinBoard } from "@johnmorrisdotca/kazu/yajilin";
 * import { isYajilinBoard } from "@johnmorrisdotca/kazu/yajilin";
 *
 * const yajilinBoard: YajilinBoard = {"width":5,"height":5,"clues":[{"direction":"left","count":0},null,{"direction":"right","count":1},null,{"direction":"up","count":0},null,null,null,null,null,{"direction":"right","count":0},null,{"direction":"left","count":0},null,{"direction":"down","count":1},{"direction":"left","count":0},null,null,null,null,null,{"direction":"up","count":1},{"direction":"down","count":0},null,{"direction":"down","count":0}]};
 * console.log(isYajilinBoard(yajilinBoard));
 * ```
 */
export function isYajilinBoard(value: unknown): value is YajilinBoard {
  if (!value || typeof value !== "object") return false;
  const board = value as YajilinBoard;
  if (!YAJILIN_SIZES.includes(board.width as 5 | 7) || board.width !== board.height
    || !Array.isArray(board.clues) || board.clues.length !== board.width * board.height) return false;
  return board.clues.every(clue => clue === null || (!!clue && typeof clue === "object"
    && Object.hasOwn(directionDelta, clue.direction) && Number.isInteger(clue.count) && clue.count >= 0 && clue.count < board.width));
}

/** Read adjacent Yajilin cells and the joining edge.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @param cell - A zero-based row-major cell index.
 * @returns Read adjacent Yajilin cells and the joining edge.
 * @example
 * ```ts
 * import type { YajilinBoard } from "@johnmorrisdotca/kazu/yajilin";
 * import { yajilinNeighbors } from "@johnmorrisdotca/kazu/yajilin";
 *
 * const yajilinBoard: YajilinBoard = {"width":5,"height":5,"clues":[{"direction":"left","count":0},null,{"direction":"right","count":1},null,{"direction":"up","count":0},null,null,null,null,null,{"direction":"right","count":0},null,{"direction":"left","count":0},null,{"direction":"down","count":1},{"direction":"left","count":0},null,null,null,null,null,{"direction":"up","count":1},{"direction":"down","count":0},null,{"direction":"down","count":0}]};
 * console.log(yajilinNeighbors(yajilinBoard,0));
 * ```
 */
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

/** Validate a Yajilin answer against the printed clues and complete native rules.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @param shaded - The current shaded-cell flags in row-major order.
 * @param lines - The current native loop-edge states.
 * @returns Validate a Yajilin answer against the printed clues and complete native rules.
 * @example
 * ```ts
 * import type { YajilinBoard, YajilinPuzzle } from "@johnmorrisdotca/kazu/yajilin";
 * import { checkYajilin } from "@johnmorrisdotca/kazu/yajilin";
 *
 * const yajilinBoard: YajilinBoard = {"width":5,"height":5,"clues":[{"direction":"left","count":0},null,{"direction":"right","count":1},null,{"direction":"up","count":0},null,null,null,null,null,{"direction":"right","count":0},null,{"direction":"left","count":0},null,{"direction":"down","count":1},{"direction":"left","count":0},null,null,null,null,null,{"direction":"up","count":1},{"direction":"down","count":0},null,{"direction":"down","count":0}]};
 * const yajilinSolution: YajilinPuzzle["solution"] = {"shaded":[false,true,false,true,false,true,false,false,false,true,false,false,false,false,false,false,false,false,false,true,true,false,false,true,false],"edges":[5,26,6,28,31,33,13,14]};
 * console.log(checkYajilin(yajilinBoard,yajilinSolution.shaded,yajilinSolution.edges));
 * ```
 */
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

/** Read cells in the arrow’s indicated direction, excluding its own clue cell.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @param cell - A zero-based row-major cell index.
 * @param direction - The arrow’s up, right, down or left direction.
 * @returns Read cells in the arrow’s indicated direction, excluding its own clue cell.
 * @example
 * ```ts
 * import type { YajilinBoard } from "@johnmorrisdotca/kazu/yajilin";
 * import { yajilinRay } from "@johnmorrisdotca/kazu/yajilin";
 *
 * const yajilinBoard: YajilinBoard = {"width":5,"height":5,"clues":[{"direction":"left","count":0},null,{"direction":"right","count":1},null,{"direction":"up","count":0},null,null,null,null,null,{"direction":"right","count":0},null,{"direction":"left","count":0},null,{"direction":"down","count":1},{"direction":"left","count":0},null,null,null,null,null,{"direction":"up","count":1},{"direction":"down","count":0},null,{"direction":"down","count":0}]};
 * console.log(yajilinRay(yajilinBoard,0,"right"));
 * ```
 */
export function yajilinRay(board: YajilinBoard, cell: number, direction: YajilinDirection): number[] {
  return ray(board, cell, direction);
}
