import { isKazuSeed, seededRandom } from "./random.ts";
import { checkYajilin, isYajilinBoard, yajilinNeighbors } from "./yajilinBoard.ts";
import { solveYajilin } from "./yajilinSolve.ts";
import type { YajilinBoard, YajilinDirection, YajilinPuzzle } from "./yajilin.types.ts";

type Layout = { loop: readonly number[]; shaded: readonly number[]; clues: readonly (readonly [number, YajilinDirection, number])[] };
const layouts: readonly Layout[] = [
  {
    loop: [6, 7, 8, 13, 18, 17, 16, 11],
    shaded: [1, 22, 5, 9, 24, 12, 20],
    clues: [
      [0, "left", 0],
      [2, "up", 0],
      [3, "up", 0],
      [4, "down", 2],
      [10, "up", 1],
      [14, "down", 1],
      [15, "left", 0],
      [19, "up", 1],
      [21, "down", 0],
      [23, "up", 0],
    ],
  },
  {
    loop: [6, 7, 8, 13, 18, 17, 16, 11],
    shaded: [0, 21, 15, 2, 14, 4, 12],
    clues: [
      [1, "right", 2],
      [3, "left", 2],
      [5, "down", 1],
      [9, "right", 0],
      [10, "down", 1],
      [19, "up", 2],
      [20, "left", 0],
      [22, "up", 2],
      [23, "right", 0],
      [24, "down", 0],
    ],
  },
  {
    loop: [6, 7, 8, 13, 18, 17, 16, 11],
    shaded: [24, 12, 22, 4, 15, 0, 2],
    clues: [
      [1, "right", 2],
      [3, "down", 0],
      [5, "down", 1],
      [9, "right", 0],
      [10, "left", 0],
      [14, "up", 1],
      [19, "left", 1],
      [20, "left", 0],
      [21, "down", 0],
      [23, "right", 1],
    ],
  },
  {
    loop: [6, 7, 8, 13, 18, 17, 16, 11],
    shaded: [12, 9, 2, 21, 0, 19, 10],
    clues: [
      [1, "right", 1],
      [3, "up", 0],
      [4, "down", 2],
      [5, "up", 1],
      [14, "left", 2],
      [15, "right", 1],
      [20, "down", 0],
      [22, "up", 2],
      [23, "up", 0],
      [24, "up", 2],
    ],
  },
  {
    loop: [6, 7, 8, 13, 18, 17, 16, 11],
    shaded: [20, 3, 22, 14, 1, 12, 24],
    clues: [
      [0, "left", 0],
      [2, "down", 2],
      [4, "up", 0],
      [5, "right", 0],
      [9, "down", 2],
      [10, "up", 0],
      [15, "right", 0],
      [19, "up", 1],
      [21, "right", 2],
      [23, "up", 1],
    ],
  },
  {
    loop: [6, 7, 8, 13, 18, 17, 16, 11],
    shaded: [14, 3, 21, 15, 24, 0, 12],
    clues: [
      [1, "up", 0],
      [2, "right", 1],
      [4, "left", 2],
      [5, "right", 0],
      [9, "left", 0],
      [10, "down", 1],
      [19, "left", 1],
      [20, "right", 2],
      [22, "right", 1],
      [23, "left", 1],
    ],
  },
  {
    loop: [6, 7, 8, 13, 18, 17, 16, 11],
    shaded: [15, 24, 9, 21, 5, 3, 1],
    clues: [
      [0, "left", 0],
      [2, "right", 1],
      [4, "right", 0],
      [10, "up", 1],
      [12, "down", 0],
      [14, "right", 0],
      [19, "left", 1],
      [20, "down", 0],
      [22, "up", 0],
      [23, "down", 0],
    ],
  },
  {
    loop: [6, 7, 8, 13, 18, 17, 16, 11],
    shaded: [4, 2, 0, 10, 23, 21, 19],
    clues: [
      [1, "right", 2],
      [3, "left", 2],
      [5, "up", 1],
      [9, "down", 1],
      [12, "down", 0],
      [14, "up", 1],
      [15, "right", 1],
      [20, "right", 2],
      [22, "right", 1],
      [24, "up", 2],
    ],
  },
  {
    loop: [6, 7, 8, 13, 18, 23, 22, 21, 16, 11],
    shaded: [10, 4, 2, 17, 0, 24],
    clues: [
      [1, "right", 2],
      [3, "up", 0],
      [5, "down", 1],
      [9, "down", 1],
      [12, "down", 1],
      [14, "up", 1],
      [15, "right", 1],
      [19, "left", 1],
      [20, "down", 0],
    ],
  },
  {
    loop: [6, 7, 8, 13, 18, 23, 22, 21, 16, 11],
    shaded: [3, 15, 19, 17, 1, 5],
    clues: [
      [0, "left", 0],
      [2, "right", 1],
      [4, "down", 1],
      [9, "down", 1],
      [10, "down", 1],
      [12, "right", 0],
      [14, "down", 1],
      [20, "left", 0],
      [24, "up", 1],
    ],
  },
  {
    loop: [6, 7, 8, 13, 18, 23, 22, 21, 16, 11],
    shaded: [2, 17, 4, 0, 20, 10],
    clues: [
      [1, "left", 1],
      [3, "right", 1],
      [5, "up", 1],
      [9, "left", 0],
      [12, "up", 1],
      [14, "down", 0],
      [15, "up", 2],
      [19, "right", 0],
      [24, "down", 0],
    ],
  },
];

function transformCell(cell: number, turns: number, reflect: boolean): number {
  let x = cell % 5, y = Math.floor(cell / 5);
  if (reflect) x = 4 - x;
  for (let turn = 0; turn < turns; turn += 1) [x, y] = [4 - y, x];
  return y * 5 + x;
}
function transformDirection(direction: YajilinDirection, turns: number, reflect: boolean): YajilinDirection {
  const vector: Record<YajilinDirection, [number, number]> = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };
  let [x, y] = vector[direction];
  if (reflect) x = -x;
  for (let turn = 0; turn < turns; turn += 1) [x, y] = [-y, x];
  return (Object.entries(vector).find(([, value]) => value[0] === x && value[1] === y)?.[0] ?? "up") as YajilinDirection;
}
function edgesFromLoop(board: YajilinBoard, loop: readonly number[]): number[] {
  return loop.map((cell, index) => {
    const next = loop[(index + 1) % loop.length]!;
    return yajilinNeighbors(board, cell).find(item => item.cell === next)!.edge;
  }).sort((a, b) => a - b);
}

/** Seeded original 5×5 families, accepted only after a completed uniqueness proof. */
export function generateYajilin(size: 5 = 5, seed = 1): YajilinPuzzle {
  if (size !== 5 || !isKazuSeed(seed)) throw new RangeError("Invalid Yajilin settings");
  const random = seededRandom(seed), layout = layouts[Math.floor(random() * layouts.length)]!;
  const turns = Math.floor(random() * 4), reflect = random() < 0.5;
  const clues: (YajilinBoard["clues"][number])[] = Array(25).fill(null);
  for (const [cell, direction, count] of layout.clues) {
    const transformed = transformCell(cell, turns, reflect);
    clues[transformed] = { direction: transformDirection(direction, turns, reflect), count };
  }
  const board: YajilinBoard = { width: 5, height: 5, clues };
  const shaded = Array(25).fill(false) as boolean[];
  for (const cell of layout.shaded) shaded[transformCell(cell, turns, reflect)] = true;
  const expectedEdges = edgesFromLoop(board, layout.loop.map(cell => transformCell(cell, turns, reflect)));
  if (!isYajilinBoard(board) || !checkYajilin(board, shaded, expectedEdges).ok) throw new Error("Invalid Yajilin layout");
  const proof = solveYajilin(board);
  if (!proof.complete || proof.count !== 1 || !proof.solution) throw new Error("No uniquely proved Yajilin found within the generation budget; try another seed");
  return { ...board, seed, solution: proof.solution };
}
