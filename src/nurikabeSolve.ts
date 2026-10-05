import { NURIKABE_MAX_NODES } from "./nurikabe.constants.ts";
import { checkNurikabe, isNurikabeBoard, nurikabeNeighbors } from "./nurikabeBoard.ts";
import type { NurikabeBoard, NurikabeSolve } from "./nurikabe.types.ts";

type Clue = { cell: number; size: number };

function islandShapes(board: NurikabeBoard, clue: Clue): number[][] {
  let shapes = new Map<string, Set<number>>([[String(clue.cell), new Set([clue.cell])]]);
  for (let area = 1; area < clue.size; area += 1) {
    const next = new Map<string, Set<number>>();
    for (const shape of shapes.values()) {
      const fringe = new Set<number>();
      for (const cell of shape) for (const neighbor of nurikabeNeighbors(board.size, cell)) {
        if ((!board.clues[neighbor] || neighbor === clue.cell) && !shape.has(neighbor)) fringe.add(neighbor);
      }
      for (const cell of fringe) {
        const grown = new Set(shape); grown.add(cell);
        const key = [...grown].sort((a, b) => a - b).join(",");
        next.set(key, grown);
      }
    }
    shapes = next;
  }
  return [...shapes.values()].map(shape => [...shape]);
}

/** Counts valid island placements and checks the remaining cells as the sea under a finite budget. */
export function solveNurikabe(board: NurikabeBoard, options: { limit?: number; nodes?: number } = {}): NurikabeSolve {
  if (!isNurikabeBoard(board)) throw new RangeError("Invalid Nurikabe board");
  const total = board.size ** 2, limit = Math.max(1, Math.floor(options.limit ?? 2)), budget = Math.max(1, Math.floor(options.nodes ?? NURIKABE_MAX_NODES));
  const clues = board.clues.map((size, cell) => size ? { cell, size } : null).filter((clue): clue is Clue => !!clue);
  const choices = clues.map(clue => islandShapes(board, clue));
  const placed: number[][] = [];
  let nodes = 0, count = 0, solution: boolean[] | null = null, stopped = false;

  const visit = (depth: number) => {
    if (count >= limit || stopped) return;
    nodes += 1;
    if (nodes > budget) { stopped = true; return; }
    if (depth === clues.length) {
      const sea = Array(total).fill(true) as boolean[];
      for (const island of placed) for (const cell of island) sea[cell] = false;
      if (checkNurikabe(board, sea).ok) { count += 1; solution ??= sea; }
      return;
    }

    let selected = -1, candidates: number[][] | null = null;
    for (let clue = 0; clue < clues.length; clue += 1) if (!placed[clue]) {
      const available = choices[clue]!.filter(shape => placed.every(other => !other
        || !shape.some(cell => other.some(neighbor => cell === neighbor || nurikabeNeighbors(board.size, cell).includes(neighbor)))));
      if (!candidates || available.length < candidates.length) { selected = clue; candidates = available; }
    }
    if (selected < 0 || !candidates?.length) return;
    for (const shape of candidates) {
      placed[selected] = shape; visit(depth + 1); delete placed[selected];
      if (count >= limit || stopped) return;
    }
  };
  visit(0);
  return { count, solution, complete: !stopped && count < limit, nodes: Math.min(nodes, budget) };
}
