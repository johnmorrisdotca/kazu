import { HITORI_LEAST_SIDE, HITORI_LEVELS, HITORI_MOST_ATTEMPTS, HITORI_MOST_SIDE } from "./hitori.constants.ts";
import { checkHitori } from "./hitori-board.ts";
import { candidateHitori, latinSquare } from "./hitori-build.ts";
import { hitoriModel } from "./hitori-logic.ts";
import { solveHitori } from "./hitori-solve.ts";
import { logicCsp, openSlots } from "./csp.ts";
import { isKazuSeed, seededRandom } from "./random.ts";
import type { HitoriBoard, HitoriLevel, HitoriPuzzle } from "./hitori.types.ts";

/**
 * Makes a seeded puzzle and proves its answer is the only one. The shaded squares are chosen first (never touching,
 * the rest in one piece), the white squares get numbers that repeat nowhere in their row or column, and every shaded
 * square takes a number that a white square in its row or column already has. Boards with more than one answer are
 * repaired by renumbering a shaded square so that the other answer repeats a number, and the result is rated:
 * easy by the plain rules, medium once the whites must stay in one piece, hard by supposing, and extra-hard the
 * most-supposing of several boards.
 */
export function generateHitori(size = 5, seed = 1, level: HitoriLevel = "medium"): HitoriPuzzle {
  if (!Number.isInteger(size) || size < HITORI_LEAST_SIDE || size > HITORI_MOST_SIDE || !isKazuSeed(seed) || !HITORI_LEVELS.includes(level)) {
    throw new RangeError("Invalid Hitori settings");
  }
  const random = seededRandom(seed);
  const base = latinSquare(size, random);
  if (!base) throw new Error("No Hitori found within the generation budget; try another seed");
  for (let aim = HITORI_LEVELS.indexOf(level); aim >= 0; aim -= 1) {
    const aimed = HITORI_LEVELS[aim]!;
    const wanted = aimed === "extra-hard" ? 4 : 1;
    let best: { board: HitoriBoard; shaded: readonly boolean[]; score: number } | null = null, found = 0;
    for (let attempt = 0; attempt < HITORI_MOST_ATTEMPTS && found < wanted; attempt += 1) {
      const built = candidateHitori(size, aimed, random, base);
      const made = built && rated(built.board, built.shaded, aimed);
      if (!made) continue;
      found += 1;
      if (!best || made.score > best.score) best = made;
    }
    if (best) {
      const proof = solveHitori(best.board);
      if (proof.complete && proof.count === 1 && proof.solution && checkHitori(best.board, proof.solution).ok) {
        return { ...best.board, seed, level, solution: proof.solution };
      }
    }
  }
  throw new Error("No uniquely solvable Hitori found within the generation budget; try another seed");
}


function rated(board: HitoriBoard, shaded: readonly boolean[], level: HitoriLevel): { board: HitoriBoard; shaded: readonly boolean[]; score: number } | null {
  const total = board.size * board.size;
  const solved = (strength: 0 | 2, depth: number) => {
    const { csp } = hitoriModel(board, strength);
    const run = logicCsp(csp, openSlots(csp), depth);
    return run.solved && checkHitori(board, Array.from({ length: total }, (_, cell) => run.alive[2 * cell + 1] === 1)).ok ? run : null;
  };
  if (level === "easy") return solved(0, 0) ? { board, shaded, score: 0 } : null;
  if (solved(0, 0)) return null;
  if (level === "medium") return solved(2, 0) ? { board, shaded, score: 0 } : null;
  if (solved(2, 0)) return null;
  const probing = solved(2, 1);
  if (!probing) return level === "extra-hard" ? { board, shaded, score: 1_000 } : null;
  return { board, shaded, score: probing.probes };
}
