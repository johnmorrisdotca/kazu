import { MASYU_NODE_BUDGET } from "./masyu.constants.ts";
import { checkMasyu, isMasyuBoard, masyuEdgeCount, masyuNeighbors } from "./masyuBoard.ts";
import type { MasyuBoard, MasyuSolve } from "./masyu.types.ts";

/** Counts distinct single loops with local pearl rules; budget stops never claim a proof. */
export function solveMasyu(board: MasyuBoard, options: { limit?: number; nodes?: number } = {}): MasyuSolve {
  if (!isMasyuBoard(board)) throw new RangeError("Invalid Masyu board");
  const limit = options.limit ?? 2, budget = options.nodes ?? MASYU_NODE_BUDGET;
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(budget) || budget < 1) throw new RangeError("Invalid search bounds");
  const edgeState = Array(masyuEdgeCount(board)).fill(-1) as number[];
  const configs = board.pearls.map((pearl, cell) => {
    const validDirections = masyuNeighbors(board, cell).map(next => next.direction);
    const choices = [];
    for (let mask = 0; mask < 16; mask += 1) {
      const bits = [0, 1, 2, 3].filter(direction => mask & (1 << direction));
      if (bits.length !== 0 && bits.length !== 2) continue;
      if (bits.some(direction => !validDirections.includes(direction))) continue;
      if (pearl && bits.length !== 2) continue;
      const straight = bits.length === 2 && (bits[0]! + 2) % 4 === bits[1];
      if (pearl === 1 && !straight || pearl === 2 && straight) continue;
      choices.push(mask);
    }
    return choices;
  });
  let count = 0, nodes = 0, complete = true, answer: number[] | null = null;
  const assigned = Array(board.pearls.length).fill(false) as boolean[];
  const visit = (depth: number) => {
    if (++nodes > budget) { complete = false; return; }
    if (depth === board.pearls.length) {
      const edges = edgeState.flatMap((value, edge) => value === 1 ? [edge] : []);
      if (!checkMasyu(board, edges).ok) return;
      count += 1;
      answer ??= edges;
      if (count >= limit) complete = false;
      return;
    }
    let chosen = -1, available: number[] | null = null;
    for (let cell = 0; cell < board.pearls.length; cell += 1) {
      if (assigned[cell]) continue;
      const neighbors = masyuNeighbors(board, cell);
      const candidates = configs[cell]!.filter(mask => neighbors.every(next =>
        edgeState[next.edge] < 0 || edgeState[next.edge] === (mask & (1 << next.direction) ? 1 : 0)));
      if (!candidates.length) return;
      if (!available || candidates.length < available.length) {
        chosen = cell;
        available = candidates;
        if (candidates.length === 1) break;
      }
    }
    const neighbors = masyuNeighbors(board, chosen);
    assigned[chosen] = true;
    for (const mask of available ?? []) {
      const changes: number[] = [];
      let valid = true;
      for (const next of neighbors) {
        const value = mask & (1 << next.direction) ? 1 : 0;
        if (edgeState[next.edge] >= 0 && edgeState[next.edge] !== value) { valid = false; break; }
        if (edgeState[next.edge] < 0) { edgeState[next.edge] = value; changes.push(next.edge); }
      }
      if (valid) visit(depth + 1);
      for (const edge of changes) edgeState[edge] = -1;
      if (!complete) return;
    }
    assigned[chosen] = false;
  };
  visit(0);
  return { count, solution: answer, complete, nodes };
}
