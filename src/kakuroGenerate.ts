import { KAKURO_GENERATION_ATTEMPTS, KAKURO_GENERATION_NODES, KAKURO_MAX_ATTEMPTS, KAKURO_MAX_NODES } from "./kakuro.constants.ts";
import { isKakuroBoard } from "./kakuroBoard.ts";
import { solveKakuro } from "./kakuroSolve.ts";
import { isKazuSeed, seededRandom } from "./random.ts";
import type { KakuroBoard, KakuroCell, KakuroPuzzle } from "./kakuro.types.ts";

/** Makes a seeded 10×10 family of crossing runs and returns only a uniquely proved puzzle. */
export function generateKakuro(seed = 1): KakuroPuzzle {
  if (!isKazuSeed(seed)) throw new RangeError("Invalid Kakuro seed.");
  const random = seededRandom(seed);
  const budget = { attempts: KAKURO_GENERATION_ATTEMPTS, nodes: KAKURO_GENERATION_NODES };
  for (let attempt = 0; attempt < KAKURO_MAX_ATTEMPTS && budget.attempts > 0 && budget.nodes > 0; attempt += 1) {
    budget.attempts -= 1;
    const rowGroups = random() < .5 ? [2, 2, 2] : random() < .5 ? [2, 3] : [3, 2];
    const columnGroups = rowGroups.length === 3 ? [2, 2, 2] : [2, 3];
    if (random() < .5) columnGroups.reverse();
    const rowStarts = groupStarts(rowGroups, random);
    const columnStarts = groupStarts(columnGroups, random);
    const cells: KakuroCell[] = Array.from({ length: 100 }, () => ({ kind: "black", across: null, down: null }));
    const solution = Array(100).fill(0);
    const board: KakuroBoard = { width: 10, height: 10, cells };
    let failed = false;
    for (const [rowIndex, rowStart] of rowStarts.entries()) {
      for (const [columnIndex, columnStart] of columnStarts.entries()) {
        const shape = { height: rowGroups[rowIndex]!, width: columnGroups[columnIndex]! };
        const local = chooseUniqueTile(shape.width, shape.height, random, budget);
        if (!local) { failed = true; break; }
        placeTile(board, solution, rowStart, columnStart, local);
      }
      if (failed) break;
    }
    if (failed) continue;
    if (!isKakuroBoard(board)) throw new Error(JSON.stringify(board));
    const proof = solveKakuro(board, [], { limit: 2, nodes: Math.min(KAKURO_MAX_NODES, budget.nodes) });
    budget.nodes -= Math.min(budget.nodes, proof.nodes);
    if (proof.complete && proof.count === 1 && proof.solution) {
      return { ...board, seed, solution: proof.solution };
    }
  }
  throw new Error("No uniquely solvable Kakuro board was proved within the generation budget.");
}

function groupStarts(groups: readonly number[], random: () => number): number[] {
  const used = groups.reduce((sum, size) => sum + size, 0) + groups.length - 1;
  let at = 1 + (8 - used > 0 && random() < .5 ? 8 - used : 0);
  return groups.map(size => { const start = at; at += size + 1; return start; });
}

function chooseUniqueTile(width: number, height: number, random: () => number, budget: { attempts: number; nodes: number }): number[][] | null {
  for (let attempt = 0; attempt < KAKURO_MAX_ATTEMPTS && budget.attempts > 0 && budget.nodes > 0; attempt += 1) {
    budget.attempts -= 1;
    const candidate = randomRectangle(width, height, random);
    if (!candidate) continue;
    const board = tileBoard(candidate);
    const proof = solveKakuro(board, [], { limit: 2, nodes: Math.min(25_000, budget.nodes) });
    budget.nodes -= Math.min(budget.nodes, proof.nodes);
    if (!budget.nodes) return null;
    if (proof.complete && proof.count === 1) return proof.solution ? splitSolution(proof.solution, width, height) : candidate;
  }
  return null;
}

function randomRectangle(width: number, height: number, random: () => number): number[][] | null {
  const rows: number[][] = [];
  for (let y = 0; y < height; y += 1) {
    let row: number[] | null = null;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const available = shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9], random);
      const candidate = available.slice(0, width);
      if (candidate.every((digit, x) => rows.every(previous => previous[x] !== digit))) {
        row = candidate;
        break;
      }
    }
    if (!row) return null;
    rows.push(row);
  }
  return rows;
}

function tileBoard(solution: readonly (readonly number[])[]): KakuroBoard {
  const height = solution.length + 1, width = solution[0]!.length + 1;
  const cells: KakuroCell[] = Array.from({ length: width * height }, () => ({ kind: "black", across: null, down: null }));
  for (let y = 0; y < solution.length; y += 1) for (let x = 0; x < solution[y]!.length; x += 1) cells[(y + 1) * width + x + 1] = { kind: "white" };
  for (let y = 0; y < solution.length; y += 1) (cells[(y + 1) * width] as Extract<KakuroCell, { kind: "black" }>).across = solution[y]!.reduce((sum, value) => sum + value, 0);
  for (let x = 0; x < solution[0]!.length; x += 1) (cells[x + 1] as Extract<KakuroCell, { kind: "black" }>).down = solution.reduce((sum, row) => sum + row[x]!, 0);
  return { width, height, cells };
}

function placeTile(board: KakuroBoard, full: number[], top: number, left: number, solution: readonly (readonly number[])[]): void {
  const width = board.width;
  const cells = board.cells as KakuroCell[];
  for (let y = 0; y < solution.length; y += 1) for (let x = 0; x < solution[y]!.length; x += 1) full[(top + y) * width + left + x] = solution[y]![x]!;
  for (let y = 0; y < solution.length; y += 1) {
    const clue = (top + y) * width + left - 1;
    (cells[clue] as Extract<KakuroCell, { kind: "black" }>).across = solution[y]!.reduce((sum, value) => sum + value, 0);
  }
  for (let x = 0; x < solution[0]!.length; x += 1) {
    const clue = (top - 1) * width + left + x;
    (cells[clue] as Extract<KakuroCell, { kind: "black" }>).down = solution.reduce((sum, row) => sum + row[x]!, 0);
  }
  for (let y = 0; y < solution.length; y += 1) for (let x = 0; x < solution[y]!.length; x += 1) cells[(top + y) * width + left + x] = { kind: "white" };
}

function splitSolution(values: readonly number[], width: number, height: number): number[][] {
  const result: number[][] = [];
  for (let y = 1; y <= height; y += 1) result.push(values.slice(y * (width + 1) + 1, y * (width + 1) + width + 1));
  return result;
}

function shuffled<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}
