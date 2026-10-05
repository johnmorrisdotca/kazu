import { SLITHERLINK_MOST_NODES } from "./slitherlink.constants.ts";
import {
  checkSlitherlink,
  edgeVertices,
  isSlitherlinkBoard,
  slitherlinkCellEdges,
  slitherlinkEdgeCount,
  slitherlinkVertexEdges,
} from "./slitherlinkBoard.ts";
import type { SlitherlinkBoard, SlitherlinkSolve } from "./slitherlink.types.ts";

/** Counts loop solutions with clue and vertex propagation under explicit work bounds. */
export function solveSlitherlink(
  board: SlitherlinkBoard,
  options: { limit?: number; nodes?: number } = {},
): SlitherlinkSolve {
  if (!isSlitherlinkBoard(board)) throw new RangeError("Invalid Slitherlink board");
  const limit = options.limit ?? 2;
  const budget = options.nodes ?? SLITHERLINK_MOST_NODES;
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(budget) || budget < 1) {
    throw new RangeError("Invalid search bounds");
  }

  const edgeCount = slitherlinkEdgeCount(board);
  const vertices = Array.from({ length: (board.width + 1) * (board.height + 1) }, (_, vertex) =>
    slitherlinkVertexEdges(board, vertex));
  const cells = board.clues.flatMap((clue, cell) => clue === null ? [] : [slitherlinkCellEdges(board, cell)!]);
  let count = 0;
  let nodes = 0;
  let complete = true;
  let solution: number[] | null = null;

  const search = (start: Int8Array) => {
    if (!complete) return;
    nodes += 1;
    if (nodes > budget) {
      complete = false;
      return;
    }

    const state = start.slice();
    let changed = true;
    while (changed) {
      changed = false;

      for (const group of vertices) {
        const on = group.filter(edge => state[edge] === 1).length;
        const unknown = group.filter(edge => state[edge] < 0);
        if (on > 2 || on === 1 && !unknown.length) return;
        if (on === 2) {
          for (const edge of unknown) {
            state[edge] = 0;
            changed = true;
          }
        } else if (on === 1 && unknown.length === 1) {
          state[unknown[0]!] = 1;
          changed = true;
        } else if (on === 0 && unknown.length === 1) {
          state[unknown[0]!] = 0;
          changed = true;
        }
      }

      let clueIndex = 0;
      for (const clue of board.clues) {
        if (clue === null) continue;
        const group = cells[clueIndex++]!;
        const on = group.filter(edge => state[edge] === 1).length;
        const unknown = group.filter(edge => state[edge] < 0);
        if (on > clue || on + unknown.length < clue) return;
        if (on === clue) {
          for (const edge of unknown) {
            state[edge] = 0;
            changed = true;
          }
        } else if (on + unknown.length === clue) {
          for (const edge of unknown) {
            state[edge] = 1;
            changed = true;
          }
        }
      }
    }

    const selected = Array.from(state).flatMap((value, edge) => value === 1 ? [edge] : []);
    const closed = closedComponents(board, selected);
    if (closed.length > 1) return;
    if (closed.length === 1 && closed[0]!.length !== selected.length) return;

    const branch = state.findIndex(value => value < 0);
    if (branch < 0) {
      if (!checkSlitherlink(board, selected).ok) return;
      count += 1;
      solution ??= selected;
      if (count >= limit) complete = false;
      return;
    }

    for (const value of [1, 0]) {
      const next = state.slice();
      next[branch] = value;
      search(next);
      if (!complete) return;
    }
  };

  search(new Int8Array(edgeCount).fill(-1));
  return { count, solution, complete, nodes };
}

function closedComponents(board: SlitherlinkBoard, selected: readonly number[]): number[][] {
  const unseen = new Set(selected);
  const components: number[][] = [];
  while (unseen.size) {
    const first = unseen.values().next().value as number;
    const component = [first];
    const queue = [first];
    unseen.delete(first);
    while (queue.length) {
      const edge = queue.pop()!;
      for (const vertex of edgeVertices(board, edge)) {
        for (const adjacent of slitherlinkVertexEdges(board, vertex)) {
          if (!unseen.has(adjacent)) continue;
          unseen.delete(adjacent);
          component.push(adjacent);
          queue.push(adjacent);
        }
      }
    }
    const vertices = new Set(component.flatMap(edge => edgeVertices(board, edge)));
    if ([...vertices].every(vertex => slitherlinkVertexEdges(board, vertex)
      .filter(edge => component.includes(edge)).length === 2)) components.push(component);
  }
  return components;
}
