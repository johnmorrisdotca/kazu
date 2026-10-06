import { YAJILIN_NODE_BUDGET } from "./yajilin.constants.ts";
import { checkYajilin, isYajilinBoard, yajilinNeighbors, yajilinRay } from "./yajilin-board.ts";
import type { YajilinBoard, YajilinSolve, YajilinSolution } from "./yajilin.types.ts";

/** Counts public shade patterns whose remaining cells form the single required loop. */
export function solveYajilin(board: YajilinBoard, options: { limit?: number; nodes?: number } = {}): YajilinSolve {
  if (!isYajilinBoard(board)) throw new RangeError("Invalid Yajilin board");
  const limit = options.limit ?? 2, budget = options.nodes ?? YAJILIN_NODE_BUDGET;
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(budget) || budget < 1) throw new RangeError("Invalid search bounds");
  const total = board.width * board.height, state = Array(total).fill(-1) as number[], shadeable: number[] = [];
  const rays = board.clues.flatMap((clue, cell) => clue ? [{ cell, clue, cells: yajilinRay(board, cell, clue.direction) }] : []);
  board.clues.forEach((clue, cell) => { if (clue) state[cell] = 2; else shadeable.push(cell); });
  let count = 0, nodes = 0, complete = true, solution: YajilinSolution | null = null;
  const candidateEdges = (shaded: readonly boolean[]) => {
    const edges: number[] = [];
    for (let cell = 0; cell < total; cell += 1) {
      if (board.clues[cell] || shaded[cell]) continue;
      for (const next of yajilinNeighbors(board, cell)) if (cell < next.cell && !board.clues[next.cell] && !shaded[next.cell]) edges.push(next.edge);
    }
    return edges;
  };
  const raysPossible = () => rays.every(({ clue, cells }) => {
    const shaded = cells.filter(cell => state[cell] === 1).length;
    const unknown = cells.filter(cell => state[cell] === -1).length;
    return shaded <= clue.count && shaded + unknown >= clue.count;
  });
  const visit = (depth: number) => {
    if (++nodes > budget) { complete = false; return; }
    if (!raysPossible()) return;
    if (depth === shadeable.length) {
      const shaded = state.map(value => value === 1), edges = candidateEdges(shaded);
      if (!checkYajilin(board, shaded, edges).ok) return;
      count += 1;
      solution ??= { shaded, edges };
      if (count >= limit) complete = false;
      return;
    }
    let chosen = -1, bestScore = -1;
    for (const cell of shadeable) {
      if (state[cell] !== -1) continue;
      let score = 0;
      for (const clue of rays) if (clue.cells.includes(cell)) score += 1;
      if (score > bestScore) { chosen = cell; bestScore = score; }
    }
    if (chosen < 0) return;
    state[chosen] = 0; visit(depth + 1);
    if (!complete) { state[chosen] = -1; return; }
    const x = chosen % board.width, y = Math.floor(chosen / board.width);
    const touchesShade = (x > 0 && state[chosen - 1] === 1) || (x + 1 < board.width && state[chosen + 1] === 1)
      || (y > 0 && state[chosen - board.width] === 1) || (y + 1 < board.height && state[chosen + board.width] === 1);
    if (!touchesShade) { state[chosen] = 1; visit(depth + 1); }
    state[chosen] = -1;
  };
  visit(0);
  return { count, solution, complete, nodes };
}
