import { AKARI_MOST_SIDE } from "./akari.constants.ts";
import { checkAkari, isAkariBoard } from "./akariBoard.ts";
import { solveAkari } from "./akariSolve.ts";
import { isKazuSeed, seededRandom } from "./random.ts";
import type { AkariPuzzle } from "./akari.types.ts";

/**
 * Makes a seeded board from two original room-grid families: horizontal or vertical paired
 * corridors, with isolated singleton rooms at the edges. Seeded bulb direction and reflections
 * vary each layout. Generation returns only after the independent counter proves uniqueness.
 */
export function generateAkari(width = 7, height = width, seed = 1): AkariPuzzle {
  if (![width, height].every(n => Number.isInteger(n) && n >= 2 && n <= AKARI_MOST_SIDE)
    || !isKazuSeed(seed)) throw new RangeError("Invalid Akari settings");

  const random = seededRandom(seed);
  const cells: (number | null | false)[] = Array(width * height).fill(false);
  const bulbs: number[] = [];
  const horizontal = random() < .5;

  if (horizontal) {
    const firstRow = height > 2 ? 1 : 0;
    for (let y = firstRow; y < height; y += 3) {
      const clueY = y > 0 ? y - 1 : y + 1;
      for (let x = 0; x < width; x += 3) {
        const room = y * width + x;
        if (x + 1 < width) {
          const bulbX = random() < .5 ? x : x + 1;
          cells[room] = null;
          cells[room + 1] = null;
          cells[clueY * width + bulbX] = 1;
          bulbs.push(y * width + bulbX);
        } else {
          cells[room] = null;
          cells[clueY * width + x] = 1;
          bulbs.push(room);
        }
      }
    }
  } else {
    const firstColumn = width > 2 ? 1 : 0;
    for (let x = firstColumn; x < width; x += 3) {
      const clueX = x > 0 ? x - 1 : x + 1;
      for (let y = 0; y < height; y += 3) {
        const room = y * width + x;
        if (y + 1 < height) {
          const bulbY = random() < .5 ? y : y + 1;
          cells[room] = null;
          cells[room + width] = null;
          cells[bulbY * width + clueX] = 1;
          bulbs.push(bulbY * width + x);
        } else {
          cells[room] = null;
          cells[y * width + clueX] = 1;
          bulbs.push(room);
        }
      }
    }
  }

  // Reflections are applied to the board and the construction answer together.
  const reflectX = random() < .5, reflectY = random() < .5;
  const original = [...cells];
  const map = (cell: number) => {
    const x = cell % width, y = Math.floor(cell / width);
    return (reflectY ? height - 1 - y : y) * width + (reflectX ? width - 1 - x : x);
  };
  for (let cell = 0; cell < original.length; cell += 1) cells[map(cell)] = original[cell]!;
  const answer = bulbs.map(map);
  const board = { width, height, cells };
  if (!isAkariBoard(board) || !checkAkari(board, answer).ok) throw new Error("Unable to construct Akari puzzle");

  const proof = solveAkari(board, { limit: 2 });
  if (!proof.complete || proof.count !== 1 || !proof.solution) {
    throw new Error("No uniquely solvable Akari found within the generation budget");
  }
  return { ...board, seed, solution: proof.solution };
}
