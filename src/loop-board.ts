import { LOOP_MOST_SIDE } from "./loop.constants.ts";
import type { LoopBoard, LoopCheck, LoopProgress } from "./loop.types.ts";

/** Whether the value has valid native Loop dimensions, clues and data.
 *
 * @param value - A candidate board, digit, mark or encoded game specified by this signature.
 * @returns Whether the value has valid native Loop dimensions, clues and data.
 * @example
 * ```ts
 * import type { LoopBoard } from "@johnmorrisdotca/kazu/loop";
 * import { isLoopBoard } from "@johnmorrisdotca/kazu/loop";
 *
 * const loopBoard: LoopBoard = {"width":5,"height":5,"clues":[2,3,1,null,null,3,1,1,null,null,3,2,2,null,null,3,0,2,2,null,2,2,1,2,3]};
 * console.log(isLoopBoard(loopBoard));
 * ```
 */
export function isLoopBoard(value: unknown): value is LoopBoard {
  if (!value || typeof value !== "object") return false;
  const board = value as LoopBoard;
  return Number.isInteger(board.width) && board.width >= 2 && board.width <= LOOP_MOST_SIDE
    && Number.isInteger(board.height) && board.height >= 2 && board.height <= LOOP_MOST_SIDE
    && Array.isArray(board.clues) && board.clues.length === board.width * board.height
    && board.clues.every(clue => clue === null || Number.isInteger(clue) && clue >= 0 && clue <= 3);
}

/** Count horizontal edges in the Loop board’s native edge numbering.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @returns Count horizontal edges in the Loop board’s native edge numbering.
 * @example
 * ```ts
 * import type { LoopBoard } from "@johnmorrisdotca/kazu/loop";
 * import { loopHorizontalCount } from "@johnmorrisdotca/kazu/loop";
 *
 * const loopBoard: LoopBoard = {"width":5,"height":5,"clues":[2,3,1,null,null,3,1,1,null,null,3,2,2,null,null,3,0,2,2,null,2,2,1,2,3]};
 * console.log(loopHorizontalCount(loopBoard));
 * ```
 */
export function loopHorizontalCount(board: LoopBoard): number {
  return board.width * (board.height + 1);
}

/** An edge index is horizontal row-major first, then vertical row-major.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @returns An edge index is horizontal row-major first, then vertical row-major.
 * @example
 * ```ts
 * import type { LoopBoard } from "@johnmorrisdotca/kazu/loop";
 * import { loopEdgeCount } from "@johnmorrisdotca/kazu/loop";
 *
 * const loopBoard: LoopBoard = {"width":5,"height":5,"clues":[2,3,1,null,null,3,1,1,null,null,3,2,2,null,null,3,0,2,2,null,2,2,1,2,3]};
 * console.log(loopEdgeCount(loopBoard));
 * ```
 */
export function loopEdgeCount(board: LoopBoard): number {
  return loopHorizontalCount(board) + (board.width + 1) * board.height;
}

/** Read the four edges around a cell, or null for a cell outside the board.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @param cell - A zero-based row-major cell index.
 * @returns Read the four edges around a cell, or null for a cell outside the board.
 * @example
 * ```ts
 * import type { LoopBoard } from "@johnmorrisdotca/kazu/loop";
 * import { loopCellEdges } from "@johnmorrisdotca/kazu/loop";
 *
 * const loopBoard: LoopBoard = {"width":5,"height":5,"clues":[2,3,1,null,null,3,1,1,null,null,3,2,2,null,null,3,0,2,2,null,2,2,1,2,3]};
 * console.log(loopCellEdges(loopBoard,0));
 * ```
 */
export function loopCellEdges(board: LoopBoard, cell: number): [number, number, number, number] | null {
  if (!Number.isInteger(cell) || cell < 0 || cell >= board.width * board.height) return null;
  const x = cell % board.width;
  const y = Math.floor(cell / board.width);
  const horizontal = loopHorizontalCount(board);
  const top = y * board.width + x;
  const bottom = (y + 1) * board.width + x;
  const left = horizontal + y * (board.width + 1) + x;
  const right = left + 1;
  return [top, right, bottom, left];
}

/** Read edges meeting a native Loop vertex.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @param vertex - A zero-based native vertex index.
 * @returns Read edges meeting a native Loop vertex.
 * @example
 * ```ts
 * import type { LoopBoard } from "@johnmorrisdotca/kazu/loop";
 * import { loopVertexEdges } from "@johnmorrisdotca/kazu/loop";
 *
 * const loopBoard: LoopBoard = {"width":5,"height":5,"clues":[2,3,1,null,null,3,1,1,null,null,3,2,2,null,null,3,0,2,2,null,2,2,1,2,3]};
 * console.log(loopVertexEdges(loopBoard,0));
 * ```
 */
export function loopVertexEdges(board: LoopBoard, vertex: number): number[] {
  const vertexWidth = board.width + 1;
  if (!Number.isInteger(vertex) || vertex < 0 || vertex >= vertexWidth * (board.height + 1)) return [];
  const x = vertex % vertexWidth;
  const y = Math.floor(vertex / vertexWidth);
  const horizontal = loopHorizontalCount(board);
  const edges: number[] = [];
  if (x > 0) edges.push(y * board.width + x - 1);
  if (x < board.width) edges.push(y * board.width + x);
  if (y > 0) edges.push(horizontal + (y - 1) * vertexWidth + x);
  if (y < board.height) edges.push(horizontal + y * vertexWidth + x);
  return edges;
}

function evaluate(board: LoopBoard, selected: readonly number[], complete: boolean): LoopCheck {
  if (!isLoopBoard(board)) throw new RangeError("Invalid Loop board");
  const edgeCount = loopEdgeCount(board);
  const errors = selected.filter((edge, index) => !Number.isInteger(edge)
    || edge < 0 || edge >= edgeCount || selected.indexOf(edge) !== index);
  const edges = [...new Set(selected.filter(edge => Number.isInteger(edge) && edge >= 0 && edge < edgeCount))];
  const edgeSet = new Set(edges);
  const vertexDegrees = Array.from({ length: (board.width + 1) * (board.height + 1) }, (_, vertex) =>
    loopVertexEdges(board, vertex).filter(edge => edgeSet.has(edge)).length);
  const vertices = vertexDegrees.flatMap((degree, vertex) => degree > 2 || complete && degree === 1 ? [vertex] : []);
  const clues = board.clues.flatMap((clue, cell) => {
    if (clue === null) return [];
    const count = loopCellEdges(board, cell)!.filter(edge => edgeSet.has(edge)).length;
    return complete ? count !== clue ? [cell] : [] : count > clue ? [cell] : [];
  });
  const closed = closedComponents(board, edgeSet);
  const loops = closed.count;
  const detachedClosedLoop = loops > 0 && closed.edges !== edges.length;
  const loopError = complete
    ? edges.length === 0 || loops !== 1
    : loops > 1 || detachedClosedLoop;
  return {
    ok: !errors.length && !vertices.length && !clues.length && !loopError,
    errors,
    clues,
    vertices,
    loops,
  };
}

/** Checks all numbered cells, degree-two vertices, and one connected closed loop.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @param edges - The native edge states in canonical horizontal/vertical order.
 * @returns Checks all numbered cells, degree-two vertices, and one connected closed loop.
 * @example
 * ```ts
 * import type { LoopBoard, LoopPuzzle } from "@johnmorrisdotca/kazu/loop";
 * import { checkLoop } from "@johnmorrisdotca/kazu/loop";
 *
 * const loopBoard: LoopBoard = {"width":5,"height":5,"clues":[2,3,1,null,null,3,1,1,null,null,3,2,2,null,null,3,0,2,2,null,2,2,1,2,3]};
 * const loopSolution: LoopPuzzle["solution"] = [1,5,10,15,17,20,23,24,26,27,28,29,31,32,36,38,43,44,48,51,55,59];
 * console.log(checkLoop(loopBoard,loopSolution));
 * ```
 */
export function checkLoop(board: LoopBoard, edges: readonly number[]): LoopCheck {
  return evaluate(board, edges, true);
}

/** Reports overfilled clues and branched vertices during play without requiring a finished loop.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @param edges - The native edge states in canonical horizontal/vertical order.
 * @returns Reports overfilled clues and branched vertices during play without requiring a finished loop.
 * @example
 * ```ts
 * import type { LoopBoard, LoopPuzzle } from "@johnmorrisdotca/kazu/loop";
 * import { progressLoop } from "@johnmorrisdotca/kazu/loop";
 *
 * const loopBoard: LoopBoard = {"width":5,"height":5,"clues":[2,3,1,null,null,3,1,1,null,null,3,2,2,null,null,3,0,2,2,null,2,2,1,2,3]};
 * const loopSolution: LoopPuzzle["solution"] = [1,5,10,15,17,20,23,24,26,27,28,29,31,32,36,38,43,44,48,51,55,59];
 * console.log(progressLoop(loopBoard,loopSolution));
 * ```
 */
export function progressLoop(board: LoopBoard, edges: readonly number[]): LoopProgress {
  const result = evaluate(board, edges, false);
  return { ok: result.ok, clues: result.clues, vertices: result.vertices, loops: result.loops };
}

function closedComponents(board: LoopBoard, edges: ReadonlySet<number>): { count: number; edges: number } {
  if (!edges.size) return { count: 0, edges: 0 };
  const unseen = new Set(edges);
  let count = 0;
  let closedEdges = 0;
  while (unseen.size) {
    const first = unseen.values().next().value as number;
    const component = new Set<number>([first]);
    const queue = [first];
    unseen.delete(first);
    while (queue.length) {
      const edge = queue.pop()!;
      for (const vertex of edgeVertices(board, edge)) {
        for (const neighbour of loopVertexEdges(board, vertex)) {
          if (!unseen.has(neighbour)) continue;
          unseen.delete(neighbour);
          component.add(neighbour);
          queue.push(neighbour);
        }
      }
    }
    const degreeTwo = [...component].every(edge => edgeVertices(board, edge)
      .every(vertex => loopVertexEdges(board, vertex).filter(adjacent => component.has(adjacent)).length === 2));
    if (degreeTwo) {
      count += 1;
      closedEdges += component.size;
    }
  }
  return { count, edges: closedEdges };
}

/** Read the two vertex indices at the ends of a native Loop edge.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @param edge - A zero-based native edge index.
 * @returns Read the two vertex indices at the ends of a native Loop edge.
 * @example
 * ```ts
 * import type { LoopBoard } from "@johnmorrisdotca/kazu/loop";
 * import { edgeVertices } from "@johnmorrisdotca/kazu/loop";
 *
 * const loopBoard: LoopBoard = {"width":5,"height":5,"clues":[2,3,1,null,null,3,1,1,null,null,3,2,2,null,null,3,0,2,2,null,2,2,1,2,3]};
 * console.log(edgeVertices(loopBoard,0));
 * ```
 */
export function edgeVertices(board: LoopBoard, edge: number): [number, number] {
  const horizontal = loopHorizontalCount(board);
  if (edge < horizontal) {
    const x = edge % board.width;
    const y = Math.floor(edge / board.width);
    const left = y * (board.width + 1) + x;
    return [left, left + 1];
  }
  const local = edge - horizontal;
  const x = local % (board.width + 1);
  const y = Math.floor(local / (board.width + 1));
  const top = y * (board.width + 1) + x;
  return [top, top + board.width + 1];
}
