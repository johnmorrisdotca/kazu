import { SHIKAKU_LEVELS, SHIKAKU_MOST_ATTEMPTS, SHIKAKU_MOST_SIDE } from "./shikaku.constants.ts";
import { checkShikaku } from "./shikaku-board.ts";
import { candidateShikaku } from "./shikaku-build.ts";
import { shikakuModel } from "./shikaku-logic.ts";
import { solveShikaku } from "./shikaku-solve.ts";
import { templateShikaku } from "./shikaku-template.ts";
import { logicCsp, openSlots } from "./csp.ts";
import { isKazuSeed, seededRandom } from "./random.ts";
import type { ShikakuBoard, ShikakuLevel, ShikakuPuzzle } from "./shikaku.types.ts";

/**
 * Seeded rectangles packed into the board, one number each, with an independently counted, unique answer. The board
 * is rated by solving it: easy by the first two rules (a number with one fitting rectangle, a square one rectangle can
 * cover), medium once the third rule is needed too, hard by supposing, extra-hard the most-supposing of several boards. If no board of the level is found within the attempts
 * the next level down is tried, and the first generator is the last resort.
 */
export function generateShikaku(width = 7, height = width, level: ShikakuLevel = "medium", seed = 1): ShikakuPuzzle {
  if (![width, height].every(n => Number.isInteger(n) && n >= 2 && n <= SHIKAKU_MOST_SIDE)
    || !isKazuSeed(seed) || !SHIKAKU_LEVELS.includes(level)) throw new RangeError("Invalid Shikaku settings");
  const random = seededRandom(seed);
  for (let aim = SHIKAKU_LEVELS.indexOf(level); aim >= 0; aim -= 1) {
    const aimed = SHIKAKU_LEVELS[aim]!;
    const wanted = aimed === "extra-hard" ? 3 : 1;
    let best: { board: ShikakuBoard; score: number } | null = null, found = 0;
    for (let attempt = 0; attempt < SHIKAKU_MOST_ATTEMPTS && found < wanted; attempt += 1) {
      const built = candidateShikaku(width, height, aimed, random);
      if (!built) continue;
      const score = scored(built.board, aimed);
      if (score === null) continue;
      found += 1;
      if (!best || score > best.score) best = { board: built.board, score };
    }
    if (best) {
      const proof = solveShikaku(best.board);
      if (proof.complete && proof.count === 1 && proof.solution && checkShikaku(best.board, proof.solution).ok) {
        return { ...best.board, seed, level, solution: proof.solution };
      }
    }
  }
  return { ...templateShikaku(width, height, level === "extra-hard" ? "hard" : level, seed), level };
}

/** Whether a board suits a level, and how well: higher is harder. */
function scored(board: ShikakuBoard, level: ShikakuLevel): number | null {
  const models = [shikakuModel(board, 1), shikakuModel(board, 2)] as const;
  const solves = (index: 0 | 1, depth: number) => logicCsp(models[index].csp, openSlots(models[index].csp), depth);
  if (solves(0, 0).solved) return level === "easy" ? 0 : null;
  if (level === "easy") return null;
  if (solves(1, 0).solved) return level === "medium" ? 0 : null;
  if (level === "medium") return null;
  const probing = solves(1, 1);
  return probing.solved ? probing.probes : level === "extra-hard" ? 1_000 : null;
}
