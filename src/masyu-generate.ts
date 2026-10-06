import { isKazuSeed, seededRandom } from "./random.ts";
import { checkMasyu, isMasyuBoard, masyuNeighbors } from "./masyu-board.ts";
import { solveMasyu } from "./masyu-solve.ts";
import type { MasyuBoard, MasyuPuzzle } from "./masyu.types.ts";

const loops = [
  [12, 17, 18, 19, 14, 9, 8, 7],
  [14, 9, 4, 3, 2, 1, 6, 11, 12, 13],
  [21, 20, 15, 10, 5, 0, 1, 2, 7, 12, 17, 22],
  [19, 24, 23, 22, 17, 12, 7, 8, 9, 14],
] as const;

function turnAt(path: readonly number[], index: number): boolean {
  const before = path[(index + path.length - 1) % path.length]!;
  const cell = path[index]!;
  const after = path[(index + 1) % path.length]!;
  return Math.abs(cell - before) !== Math.abs(after - cell);
}

function makePearls(path: readonly number[]): number[] {
  const pearls = Array(25).fill(0) as number[];
  for (let index = 0; index < path.length; index += 1) {
    if (turnAt(path, index)) pearls[path[index]!] = 2;
    else if (turnAt(path, (index + path.length - 1) % path.length)
      || turnAt(path, (index + 1) % path.length)) pearls[path[index]!] = 1;
  }
  return pearls;
}

function makeEdges(board: MasyuBoard, path: readonly number[]): number[] | null {
  const edges = path.map((cell, index) => {
    const nextCell = path[(index + 1) % path.length]!;
    return masyuNeighbors(board, cell).find(next => next.cell === nextCell)?.edge;
  });
  return edges.every((edge): edge is number => edge !== undefined) ? edges.sort((a, b) => a - b) : null;
}

/** Seeded original loop layouts; every output is accepted only after a completed uniqueness proof. */
export function generateMasyu(size: 5 = 5, seed = 1): MasyuPuzzle {
  if (size !== 5 || !isKazuSeed(seed)) throw new RangeError("Invalid Masyu settings");
  const random = seededRandom(seed), base = loops[Math.floor(random() * loops.length)]!;
  const turns = Math.floor(random() * 4), reflect = random() < 0.5;
  const path = base.map(cell => {
    let x = cell % 5, y = Math.floor(cell / 5);
    if (reflect) x = 4 - x;
    for (let turn = 0; turn < turns; turn += 1) [x, y] = [4 - y, x];
    return y * 5 + x;
  });
  const board = { width: 5, height: 5, pearls: makePearls(path) };
  const expected = makeEdges(board, path);
  if (!expected || !isMasyuBoard(board) || !checkMasyu(board, expected).ok) throw new Error("Invalid Masyu layout");
  const proof = solveMasyu(board);
  if (!proof.complete || proof.count !== 1) throw new Error("No uniquely proved Masyu found within the generation budget; try another seed");
  return { ...board, seed, solution: proof.solution! };
}
