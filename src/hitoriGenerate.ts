import { HITORI_MAX_NODES, HITORI_SIZES } from "./hitori.constants.ts";
import { checkHitori } from "./hitoriBoard.ts";
import { solveHitori } from "./hitoriSolve.ts";
import { isKazuSeed, seededRandom, shuffled } from "./random.ts";
import type { HitoriPuzzle } from "./hitori.types.ts";

type OriginalLayout = { numbers: readonly number[]; shade: readonly boolean[] };
const layouts: Record<5 | 7, readonly OriginalLayout[]> = {
  5: [
    {
      numbers: [
        1, 3, 3, 1, 5, 2, 3,
        4, 5, 1, 3, 4, 5, 1,
        2, 4, 5, 1, 2, 3, 5,
        1, 2, 3, 4,
      ],
      shade: [
        false, true, false, true, false, ...Array(20).fill(false),
      ],
    },
    {
      numbers: [
        1, 2, 3, 4, 5, 2, 3,
        4, 1, 1, 3, 4, 5, 1,
        2, 3, 5, 1, 4, 3, 5,
        1, 2, 3, 4,
      ],
      shade: [
        false, false, false, false, false, false, false,
        false, true, false, false, false, false, false,
        false, true, false, false, true, false, false,
        false, false, false, false,
      ],
    },
    {
      numbers: [
        1, 4, 3, 4, 1, 2, 3,
        4, 5, 1, 3, 4, 5, 1,
        2, 4, 5, 1, 2, 3, 5,
        1, 2, 3, 4,
      ],
      shade: [
        false, true, false, false, true, false, false,
        false, false, false, false, false, false, false,
        false, false, false, false, false, false, false,
        false, false, false, false,
      ],
    },
    {
      numbers: [
        1, 4, 3, 4, 5, 2, 3,
        2, 5, 1, 2, 4, 5, 1,
        2, 4, 5, 1, 2, 3, 5,
        5, 2, 3, 4,
      ],
      shade: [
        false, true, false, false, false, false, false,
        true, false, false, true, false, false, false,
        false, false, false, false, false, false, false,
        true, false, false, false,
      ],
    },
  ],
  7: [
    {
      numbers: [
        1, 2, 3, 4, 2, 6, 7,
        2, 6, 4, 5, 6, 7, 1,
        3, 4, 5, 6, 1, 1, 1,
        4, 5, 6, 7, 1, 2, 3,
        5, 6, 7, 1, 2, 3, 4,
        6, 7, 1, 2, 3, 4, 5,
        7, 1, 2, 3, 4, 5, 6,
      ],
      shade: [
        false, false, false, false, true, false, false,
        false, true, false, false, false, false, false,
        false, false, false, false, true, false, true,
        ...Array(28).fill(false),
      ],
    },
    {
      numbers: [
        1, 2, 4, 4, 5, 7, 7,
        2, 3, 4, 5, 5, 7, 1,
        3, 4, 5, 6, 7, 1, 2,
        4, 5, 6, 7, 1, 2, 7,
        5, 6, 7, 1, 2, 3, 4,
        6, 2, 1, 2, 3, 4, 5,
        7, 1, 2, 3, 7, 5, 6,
      ],
      shade: [
        false, false, true, false, false, true, false,
        false, false, false, false, true, false, false,
        false, false, false, false, false, false, false,
        false, false, false, false, false, false, true,
        false, false, false, false, false, false, false,
        false, true, false, false, false, false, false,
        false, false, false, false, true, false, false,
      ],
    },
    {
      numbers: [
        1, 2, 3, 4, 5, 6, 7,
        2, 3, 4, 5, 6, 7, 1,
        3, 4, 5, 6, 1, 1, 6,
        4, 6, 6, 6, 1, 2, 3,
        5, 6, 7, 1, 2, 3, 4,
        6, 7, 1, 2, 3, 4, 5,
        7, 1, 2, 3, 4, 5, 6,
      ],
      shade: [
        false, false, false, false, false, false, false,
        false, false, false, false, false, false, false,
        false, false, false, false, true, false, true,
        false, true, false, true, false, false, false,
        false, false, false, false, false, false, false,
        false, ...Array(13).fill(false),
      ],
    },
    {
      numbers: [
        1, 2, 3, 4, 6, 6, 7,
        2, 2, 4, 5, 6, 2, 1,
        3, 4, 5, 6, 7, 1, 2,
        4, 5, 6, 7, 1, 2, 3,
        5, 6, 7, 1, 2, 3, 4,
        6, 7, 1, 2, 3, 4, 5,
        7, 1, 2, 3, 6, 5, 6,
      ],
      shade: [
        false, false, false, false, true, false, false,
        false, true, false, false, false, true, false,
        false, false, false, false, false, false, false,
        false, false, false, false, false, false, false,
        false, false, false, false, false, false, false,
        false, false, false, false, false, false, false,
        false, false, false, false, true, false, false,
      ],
    },
  ],
};

/** Seeded number relabelings and board symmetries of original layouts, accepted only after a uniqueness proof. */
export function generateHitori(size: 5 | 7 = 5, seed = 1): HitoriPuzzle {
  if (!HITORI_SIZES.includes(size) || !isKazuSeed(seed)) throw new RangeError("Invalid Hitori settings");
  const random = seededRandom(seed), templates = layouts[size];
  const template = templates[Math.floor(random() * templates.length)]!;
  const labels = shuffled(Array.from({ length: size }, (_, index) => index + 1), random);
  const turns = Math.floor(random() * 4), reflected = random() < 0.5;
  const numbers = Array(size * size), solution = Array(size * size);

  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    let tx = reflected ? size - 1 - x : x, ty = y;
    for (let turn = 0; turn < turns; turn += 1) [tx, ty] = [size - 1 - ty, tx];
    const source = y * size + x, destination = ty * size + tx;
    numbers[destination] = labels[template.numbers[source]! - 1]!;
    solution[destination] = template.shade[source]!;
  }

  const board = { size, numbers }, proof = solveHitori(board, { nodes: HITORI_MAX_NODES });
  if (!checkHitori(board, solution).ok || !proof.complete || proof.count !== 1 || !proof.solution) {
    throw new Error("No uniquely solvable Hitori found within the generation budget; try another seed");
  }
  return { ...board, seed, solution: proof.solution };
}
