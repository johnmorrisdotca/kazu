import { RIPPLE_MAX_ATTEMPTS } from "./ripple.constants.ts";
import { checkRipple } from "./ripple-board.ts";
import { solveRipple } from "./ripple-solve.ts";
import { isKazuSeed, seededRandom } from "./random.ts";
import type { RipplePuzzle } from "./ripple.types.ts";

/** Builds a seeded block-room family and accepts it only after a bounded uniqueness proof. */
export function generateRipple(width = 9, height = width, seed = 1): RipplePuzzle {
  if (width !== 9 || height !== 9 || !isKazuSeed(seed)) {
    throw new RangeError("Ripple Effect currently supports original 9×9 boards and valid integer seeds.");
  }
  const random = seededRandom(seed);
  for (let attempt = 0; attempt < RIPPLE_MAX_ATTEMPTS; attempt += 1) {
    const rooms = Array.from({ length: 81 }, (_, cell) => Math.floor(Math.floor(cell / 9) / 3) * 3 + Math.floor(cell % 9 / 3));
    const solution = blockSolution(random);
    const clues: (number | null)[] = [...solution];
    const order = Array.from({ length: clues.length }, (_, cell) => cell);
    order.splice(0, order.length, ...shuffled(order, random));
    const target = 42 + Math.floor(random() * 7);
    let clueCount = clues.length;
    for (const cell of order) {
      if (clueCount <= target) break;
      const previous = clues[cell]!;
      clues[cell] = null;
      const board = { width, height, rooms, clues };
      const proof = solveRipple(board, { limit: 2 });
      if (!proof.complete || proof.count !== 1) { clues[cell] = previous; continue; }
      clueCount -= 1;
    }
    if (clueCount > 58 || clueCount >= clues.length) continue;
    const board = { width, height, rooms, clues };
    const proof = solveRipple(board, { limit: 2 });
    if (proof.complete && proof.count === 1 && proof.solution && checkRipple(board, proof.solution).ok) {
      return { ...board, seed, solution: proof.solution };
    }
  }
  throw new Error("No uniquely solvable Ripple Effect board was proved within the generation budget.");
}

function blockSolution(random: () => number): number[] {
  const bands = shuffled([0, 1, 2], random);
  const stacks = shuffled([0, 1, 2], random);
  const rows = bands.flatMap(band => shuffled([0, 1, 2], random).map(row => band * 3 + row));
  const columns = stacks.flatMap(stack => shuffled([0, 1, 2], random).map(column => stack * 3 + column));
  const digits = shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9], random);
  return rows.flatMap(row => columns.map(column => digits[(row * 3 + Math.floor(row / 3) + column) % 9]!));
}

function shuffled<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}
