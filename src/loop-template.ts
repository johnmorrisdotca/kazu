import { LOOP_MOST_SIDE } from "./loop.constants.ts";
import {
  checkLoop,
  isLoopBoard,
  loopCellEdges,
} from "./loop-board.ts";
import { solveLoop } from "./loop-solve.ts";
import { isKazuSeed, seededRandom } from "./random.ts";
import type { LoopBoard, LoopPuzzle } from "./loop.types.ts";

/** The first generator, kept as the fallback that cannot fail: a proved puzzle from a seeded rectangle or L-shaped tile-region loop. */
export function templateLoop(width = 5, height = width, seed = 1): Omit<LoopPuzzle, "level"> {
  if (![width, height].every(side => Number.isInteger(side) && side >= 2 && side <= LOOP_MOST_SIDE)
    || !isKazuSeed(seed)) throw new RangeError("Invalid Loop settings");

  const random = seededRandom(seed);
  const useL = width >= 3 && height >= 3 && random() < .5;
  const region: number[] = [];
  let x0: number;
  let y0: number;
  let blockWidth: number;
  let blockHeight: number;

  if (useL) {
    blockWidth = 2 + Math.floor(random() * (width - 1));
    blockHeight = 2 + Math.floor(random() * (height - 1));
    x0 = Math.floor(random() * (width - blockWidth + 1));
    y0 = Math.floor(random() * (height - blockHeight + 1));
    for (let y = 0; y < blockHeight; y += 1) {
      for (let x = 0; x < blockWidth; x += 1) {
        if (x === 0 || y === 0) region.push((y0 + y) * width + x0 + x);
      }
    }
  } else {
    blockWidth = 1 + Math.floor(random() * width);
    blockHeight = 1 + Math.floor(random() * height);
    if (blockWidth === 1 && blockHeight === 1) blockWidth = 2;
    x0 = Math.floor(random() * (width - blockWidth + 1));
    y0 = Math.floor(random() * (height - blockHeight + 1));
    for (let y = 0; y < blockHeight; y += 1) {
      for (let x = 0; x < blockWidth; x += 1) region.push((y0 + y) * width + x0 + x);
    }
  }

  const blank: LoopBoard = { width, height, clues: Array(width * height).fill(null) };
  const regionSet = new Set(region);
  const edges = new Set<number>();
  for (const cell of region) {
    const [top, right, bottom, left] = loopCellEdges(blank, cell)!;
    const x = cell % width;
    if (!regionSet.has(cell - width)) edges.add(top);
    if (x === width - 1 || !regionSet.has(cell + 1)) edges.add(right);
    if (!regionSet.has(cell + width)) edges.add(bottom);
    if (x === 0 || !regionSet.has(cell - 1)) edges.add(left);
  }

  let board: LoopBoard = {
    width,
    height,
    clues: Array.from({ length: width * height }, (_, cell) =>
      loopCellEdges(blank, cell)!.filter(edge => edges.has(edge)).length),
  };
  let answer = [...edges];

  // Seeded axis reflections give each selected shape more than one orientation.
  const reflectX = random() < .5;
  const reflectY = random() < .5;
  if (reflectX || reflectY) {
    const horizontalCount = width * (height + 1);
    const mapEdge = (edge: number) => {
      if (edge < horizontalCount) {
        const x = edge % width;
        const y = Math.floor(edge / width);
        const nextX = reflectX ? width - 1 - x : x;
        const nextY = reflectY ? height - y : y;
        return nextY * width + nextX;
      }
      const local = edge - horizontalCount;
      const x = local % (width + 1);
      const y = Math.floor(local / (width + 1));
      const nextX = reflectX ? width - x : x;
      const nextY = reflectY ? height - 1 - y : y;
      return horizontalCount + nextY * (width + 1) + nextX;
    };
    const reflected = Array<number | null>(width * height).fill(null);
    board.clues.forEach((clue, cell) => {
      const x = cell % width;
      const y = Math.floor(cell / width);
      const nextX = reflectX ? width - 1 - x : x;
      const nextY = reflectY ? height - 1 - y : y;
      reflected[nextY * width + nextX] = clue;
    });
    board = { width, height, clues: reflected };
    answer = answer.map(mapEdge);
  }

  if (!isLoopBoard(board) || !checkLoop(board, answer).ok) {
    throw new Error("Unable to construct Loop loop");
  }
  const proof = solveLoop(board, { limit: 2 });
  if (!proof.complete || proof.count !== 1 || !proof.solution) {
    throw new Error("No uniquely solvable Loop found within the generation budget");
  }
  return { ...board, seed, solution: proof.solution };
}
