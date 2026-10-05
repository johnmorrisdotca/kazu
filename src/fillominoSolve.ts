import { FILLOMINO_MOST_NODES } from "./fillomino.constants.ts";
import { fillominoNeighbours, isFillominoBoard } from "./fillominoBoard.ts";
import type { FillominoBoard, FillominoSolve } from "./fillomino.types.ts";

type SearchState = { nodes: number; stopped: boolean };

/** Counts completed partitions. `complete` is false when a bound, including the answer limit, stops search. */
export function solveFillomino(
  board: FillominoBoard,
  entries: readonly number[] = board.givens,
  options: { limit?: number; nodes?: number } = {},
): FillominoSolve {
  if (!isFillominoBoard(board)) throw new RangeError("Invalid Fillomino board");
  const limit = options.limit ?? 2;
  const budget = options.nodes ?? FILLOMINO_MOST_NODES;
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(budget) || budget < 1) {
    throw new RangeError("Invalid search bounds");
  }
  if (!Array.isArray(entries) || entries.length !== board.givens.length) {
    throw new RangeError("Invalid Fillomino entries");
  }
  const fixed = entries.map((value, cell) => {
    if (!Number.isInteger(value) || value < 0 || value > entries.length) return -1;
    if (board.givens[cell] && value !== board.givens[cell]) return -1;
    return value || board.givens[cell]!;
  });
  if (fixed.some(value => value < 0)) return { count: 0, solution: null, complete: true, nodes: 0 };

  const resolved = Array(entries.length).fill(0) as number[];
  const state: SearchState = { nodes: 0, stopped: false };
  let count = 0;
  let solution: number[] | null = null;

  const visit = () => {
    if (++state.nodes > budget) {
      state.stopped = true;
      return;
    }
    let anchor = -1;
    for (let cell = 0; cell < resolved.length; cell += 1) {
      if (resolved[cell] === 0) { anchor = cell; break; }
    }
    if (anchor < 0) {
      count += 1;
      solution ??= [...resolved];
      if (count >= limit) state.stopped = true;
      return;
    }

    const choices = fixed[anchor] ? [fixed[anchor]!] : Array.from({ length: entries.length }, (_, index) => index + 1);
    for (const value of choices) {
      const shapes = regionShapes(board, anchor, value, resolved, fixed, state, budget);
      if (state.stopped) return;
      for (const shape of shapes) {
        for (const cell of shape) resolved[cell] = value;
        visit();
        for (const cell of shape) resolved[cell] = 0;
        if (state.stopped) return;
      }
    }
  };

  visit();
  const complete = !state.stopped;
  return { count, solution, complete, nodes: Math.min(state.nodes, budget) };
}

function regionShapes(
  board: FillominoBoard,
  anchor: number,
  area: number,
  resolved: readonly number[],
  fixed: readonly number[],
  state: SearchState,
  budget: number,
): number[][] {
  if (fixed[anchor] !== 0 && fixed[anchor] !== area) return [];
  const shapes: number[][] = [];
  const seen = new Set<string>();
  const grow = (cells: readonly number[]) => {
    if (state.stopped) return;
    if (++state.nodes > budget) { state.stopped = true; return; }
    const key = [...cells].sort((a, b) => a - b).join(",");
    if (seen.has(key)) return;
    seen.add(key);
    if (cells.length === area) {
      const members = new Set(cells);
      for (const cell of cells) {
        for (const next of fillominoNeighbours(board, cell)) {
          if (members.has(next)) continue;
          if (resolved[next] === area || fixed[next] === area) return;
        }
      }
      shapes.push([...cells]);
      return;
    }

    const frontier = new Set<number>();
    for (const cell of cells) {
      for (const next of fillominoNeighbours(board, cell)) {
        if (cells.includes(next) || resolved[next] !== 0) continue;
        if (fixed[next] !== 0 && fixed[next] !== area) continue;
        frontier.add(next);
      }
    }
    for (const next of frontier) grow([...cells, next]);
  };
  grow([anchor]);
  return shapes;
}
