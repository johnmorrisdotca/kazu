import { NURIKABE_MAX_NODES } from "./nurikabe.constants.ts";
import { checkNurikabe } from "./nurikabe-board.ts";
import { solveNurikabe } from "./nurikabe-solve.ts";
import { isKazuSeed, seededRandom } from "./random.ts";
import type { NurikabePuzzle } from "./nurikabe.types.ts";
const originals = [
  { clues: [1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,7,0,0], solution: [false,true,true,false,true,true,false,true,true,true,true,true,true,false,true,false,true,false,false,false,true,true,false,false,false] },
  { clues: [0,0,0,0,0,0,2,0,0,1,2,0,0,0,0,0,0,1,0,0,0,0,0,0,3], solution: [true,true,true,true,true,true,false,false,true,false,false,true,true,true,true,false,true,false,true,false,true,true,true,false,false] },
  { clues: [1,0,0,0,0,0,0,0,0,2,0,0,0,0,0,4,0,3,0,0,0,0,0,0,1], solution: [false,true,true,true,true,true,true,false,true,false,false,true,false,true,false,false,true,false,true,true,false,false,true,true,false] },
  { clues: [0,0,0,0,1,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,2,0,6,0], solution: [false,true,true,true,false,false,true,false,true,true,false,true,false,false,true,true,true,true,false,true,false,false,true,false,false] },
  { clues: [0,0,0,1,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,5,0,1,0,0,0], solution: [true,true,true,false,true,true,false,false,true,true,true,false,true,true,false,true,true,true,false,false,true,false,true,false,false] },
];
/** Seeded symmetries of original 5×5 layouts are returned only after the solver proves uniqueness. */
export function generateNurikabe(seed = 1): NurikabePuzzle {
  if (!isKazuSeed(seed)) throw new RangeError("Invalid Nurikabe seed");
  const random = seededRandom(seed), sample = originals[Math.floor(random() * originals.length)]!, rotation = Math.floor(random() * 4), reflect = random() < 0.5;
  const size = 5, clues = Array(size * size).fill(0) as number[], solution = Array(size * size).fill(false) as boolean[];
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    let sx = reflect ? size - 1 - x : x, sy = y;
    for (let turn = 0; turn < rotation; turn += 1) [sx, sy] = [size - 1 - sy, sx];
    const from = sy * size + sx, to = y * size + x; clues[to] = sample.clues[from]!; solution[to] = sample.solution[from]!;
  }
  const board = { size: 5 as const, clues }, proof = solveNurikabe(board, { nodes: NURIKABE_MAX_NODES });
  if (!checkNurikabe(board, solution).ok || !proof.complete || proof.count !== 1 || !proof.solution) throw new Error("No uniquely solvable Nurikabe found within the generation budget; try another seed");
  return { ...board, seed, solution: proof.solution };
}
