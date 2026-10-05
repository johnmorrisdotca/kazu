import { FILLOMINO_GENERATOR_MOST_CELLS, FILLOMINO_LEVELS, FILLOMINO_MOST_ATTEMPTS } from "./fillomino.constants.ts";
import { checkFillomino, fillominoNeighbours } from "./fillominoBoard.ts";
import { solveFillomino } from "./fillominoSolve.ts";
import { isKazuSeed, seededRandom, shuffled } from "./random.ts";
import type { FillominoBoard, FillominoLevel, FillominoPuzzle } from "./fillomino.types.ts";

/** Makes an original connected-region partition, then keeps only independently proved unique clues. */
export function generateFillomino(
  width = 5,
  height = width,
  level: FillominoLevel = "medium",
  seed = 1,
): FillominoPuzzle {
  if (![width, height].every(value => Number.isInteger(value) && value >= 4 && value <= 8) || width * height > FILLOMINO_GENERATOR_MOST_CELLS
    || !FILLOMINO_LEVELS.includes(level) || !isKazuSeed(seed)) {
    throw new RangeError("Fillomino generation supports 4–8 cells per side and a valid level and seed");
  }
  const random = seededRandom(seed);
  for (let attempt = 0; attempt < FILLOMINO_MOST_ATTEMPTS; attempt += 1) {
    const solution = partitionBoard(width, height, level, random);
    if (!solution) continue;
    const regions = regionCells(width, height, solution);
    if (regions.length >= width * height * 0.34) continue;
    const givens = Array(width * height).fill(0) as number[];
    const extraClues: number[] = [];
    for (const region of regions) {
      const choices = shuffled(region, random);
      const count = level === "easy" && region.length > 1 ? 2 : level === "hard" && random() < 0.2 ? 0 : 1;
      for (const cell of choices.slice(0, count)) givens[cell] = solution[cell]!;
      extraClues.push(...choices.slice(count));
    }
    const clueOrder = shuffled(extraClues, random);
    const board: FillominoBoard = { width, height, givens };
    const maximumGivens = Math.floor(width * height * ({ easy: 0.9, medium: 0.72, hard: 0.62 }[level]));
    for (let added = 0; ; added += 1) {
      const proof = solveFillomino(board, givens);
      if (proof.complete && proof.count === 1 && proof.solution && checkFillomino(board, proof.solution).ok) {
        return { ...board, seed, level, solution: proof.solution };
      }
      if (added >= clueOrder.length || givens.filter(Boolean).length >= maximumGivens) break;
      const cell = clueOrder[added]!;
      givens[cell] = solution[cell]!;
    }
  }
  throw new Error("No unique Fillomino found within the generation budget; try another seed or smaller board");
}

function partitionBoard(
  width: number,
  height: number,
  level: FillominoLevel,
  random: () => number,
): number[] | null {
  const board = { width, height, givens: Array(width * height).fill(0) as number[] };
  const entries = Array(width * height).fill(0) as number[];
  const maxArea = { easy: 4, medium: 6, hard: 8 }[level];
  let trials = 0;

  const visit = (): boolean => {
    if (++trials > 12_000) return false;
    const anchor = entries.findIndex(value => value === 0);
    if (anchor < 0) return true;
    const remaining = entries.filter(value => value === 0).length;
    const preferred = Array.from({ length: Math.min(maxArea, remaining) }, (_, index) => index + 1);
    const sizes = shuffled(preferred, random).sort((left, right) => right - left);
    for (const area of sizes) {
      for (let proposal = 0; proposal < 5; proposal += 1) {
        if (fillominoNeighbours(board, anchor).some(cell => entries[cell] === area)) continue;
        const shape = growShape(board, anchor, area, entries, random);
        if (!shape) continue;
        for (const cell of shape) entries[cell] = area;
        if (visit()) return true;
        for (const cell of shape) entries[cell] = 0;
      }
    }
    return false;
  };

  const result = visit() ? [...entries] : null;
  return result && checkFillomino(board, result).ok ? result : null;
}

function growShape(
  board: FillominoBoard,
  anchor: number,
  area: number,
  entries: readonly number[],
  random: () => number,
): number[] | null {
  const cells = [anchor];
  const members = new Set(cells);
  while (cells.length < area) {
    const frontier = new Set<number>();
    for (const cell of cells) {
      for (const next of fillominoNeighbours(board, cell)) {
        if (entries[next] !== 0 || members.has(next)) continue;
        if (fillominoNeighbours(board, next).some(adjacent => entries[adjacent] === area)) continue;
        frontier.add(next);
      }
    }
    const choices = [...frontier];
    if (!choices.length) return null;
    const next = choices[Math.floor(random() * choices.length)]!;
    cells.push(next);
    members.add(next);
  }
  return cells;
}

function regionCells(width: number, height: number, entries: readonly number[]): number[][] {
  const board: FillominoBoard = { width, height, givens: Array(width * height).fill(0) };
  const visited = new Set<number>();
  const regions: number[][] = [];
  for (let start = 0; start < entries.length; start += 1) {
    if (visited.has(start)) continue;
    const value = entries[start]!;
    const region: number[] = [];
    const pending = [start];
    visited.add(start);
    while (pending.length) {
      const cell = pending.pop()!;
      region.push(cell);
      for (const next of fillominoNeighbours(board, cell)) {
        if (!visited.has(next) && entries[next] === value) {
          visited.add(next);
          pending.push(next);
        }
      }
    }
    regions.push(region);
  }
  return regions;
}
