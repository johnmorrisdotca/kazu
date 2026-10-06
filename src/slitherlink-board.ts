import { SLITHERLINK_MOST_SIDE } from "./slitherlink.constants.ts";
import type { SlitherlinkBoard, SlitherlinkCheck, SlitherlinkProgress } from "./slitherlink.types.ts";

export function isSlitherlinkBoard(value: unknown): value is SlitherlinkBoard {
  if (!value || typeof value !== "object") return false;
  const board = value as SlitherlinkBoard;
  return Number.isInteger(board.width) && board.width >= 2 && board.width <= SLITHERLINK_MOST_SIDE
    && Number.isInteger(board.height) && board.height >= 2 && board.height <= SLITHERLINK_MOST_SIDE
    && Array.isArray(board.clues) && board.clues.length === board.width * board.height
    && board.clues.every(clue => clue === null || Number.isInteger(clue) && clue >= 0 && clue <= 3);
}

export function slitherlinkHorizontalCount(board: SlitherlinkBoard): number {
  return board.width * (board.height + 1);
}

/** An edge index is horizontal row-major first, then vertical row-major. */
export function slitherlinkEdgeCount(board: SlitherlinkBoard): number {
  return slitherlinkHorizontalCount(board) + (board.width + 1) * board.height;
}

export function slitherlinkCellEdges(board: SlitherlinkBoard, cell: number): [number, number, number, number] | null {
  if (!Number.isInteger(cell) || cell < 0 || cell >= board.width * board.height) return null;
  const x = cell % board.width;
  const y = Math.floor(cell / board.width);
  const horizontal = slitherlinkHorizontalCount(board);
  const top = y * board.width + x;
  const bottom = (y + 1) * board.width + x;
  const left = horizontal + y * (board.width + 1) + x;
  const right = left + 1;
  return [top, right, bottom, left];
}

export function slitherlinkVertexEdges(board: SlitherlinkBoard, vertex: number): number[] {
  const vertexWidth = board.width + 1;
  if (!Number.isInteger(vertex) || vertex < 0 || vertex >= vertexWidth * (board.height + 1)) return [];
  const x = vertex % vertexWidth;
  const y = Math.floor(vertex / vertexWidth);
  const horizontal = slitherlinkHorizontalCount(board);
  const edges: number[] = [];
  if (x > 0) edges.push(y * board.width + x - 1);
  if (x < board.width) edges.push(y * board.width + x);
  if (y > 0) edges.push(horizontal + (y - 1) * vertexWidth + x);
  if (y < board.height) edges.push(horizontal + y * vertexWidth + x);
  return edges;
}

function evaluate(board: SlitherlinkBoard, selected: readonly number[], complete: boolean): SlitherlinkCheck {
  if (!isSlitherlinkBoard(board)) throw new RangeError("Invalid Slitherlink board");
  const edgeCount = slitherlinkEdgeCount(board);
  const errors = selected.filter((edge, index) => !Number.isInteger(edge)
    || edge < 0 || edge >= edgeCount || selected.indexOf(edge) !== index);
  const edges = [...new Set(selected.filter(edge => Number.isInteger(edge) && edge >= 0 && edge < edgeCount))];
  const edgeSet = new Set(edges);
  const vertexDegrees = Array.from({ length: (board.width + 1) * (board.height + 1) }, (_, vertex) =>
    slitherlinkVertexEdges(board, vertex).filter(edge => edgeSet.has(edge)).length);
  const vertices = vertexDegrees.flatMap((degree, vertex) => degree > 2 || complete && degree === 1 ? [vertex] : []);
  const clues = board.clues.flatMap((clue, cell) => {
    if (clue === null) return [];
    const count = slitherlinkCellEdges(board, cell)!.filter(edge => edgeSet.has(edge)).length;
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

/** Checks all numbered cells, degree-two vertices, and one connected closed loop. */
export function checkSlitherlink(board: SlitherlinkBoard, edges: readonly number[]): SlitherlinkCheck {
  return evaluate(board, edges, true);
}

/** Reports overfilled clues and branched vertices during play without requiring a finished loop. */
export function progressSlitherlink(board: SlitherlinkBoard, edges: readonly number[]): SlitherlinkProgress {
  const result = evaluate(board, edges, false);
  return { ok: result.ok, clues: result.clues, vertices: result.vertices, loops: result.loops };
}

function closedComponents(board: SlitherlinkBoard, edges: ReadonlySet<number>): { count: number; edges: number } {
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
        for (const neighbour of slitherlinkVertexEdges(board, vertex)) {
          if (!unseen.has(neighbour)) continue;
          unseen.delete(neighbour);
          component.add(neighbour);
          queue.push(neighbour);
        }
      }
    }
    const degreeTwo = [...component].every(edge => edgeVertices(board, edge)
      .every(vertex => slitherlinkVertexEdges(board, vertex).filter(adjacent => component.has(adjacent)).length === 2));
    if (degreeTwo) {
      count += 1;
      closedEdges += component.size;
    }
  }
  return { count, edges: closedEdges };
}

export function edgeVertices(board: SlitherlinkBoard, edge: number): [number, number] {
  const horizontal = slitherlinkHorizontalCount(board);
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
