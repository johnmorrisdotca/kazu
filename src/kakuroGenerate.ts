import { KAKURO_LEAST_GENERATED_SIDE, KAKURO_LEVELS, KAKURO_MAX_SIDE } from "./kakuro.constants.ts";
import { checkKakuro } from "./kakuroBoard.ts";
import { candidateKakuro } from "./kakuroBuild.ts";
import { kakuroModel } from "./kakuroLogic.ts";
import { solveKakuro } from "./kakuroSolve.ts";
import { templateKakuro } from "./kakuroTemplate.ts";
import { logicCsp, openSlots } from "./csp.ts";
import { isKazuSeed, seededRandom } from "./random.ts";
import type { KakuroBoard, KakuroLevel, KakuroPuzzle } from "./kakuro.types.ts";

const MOST_ATTEMPTS = 400;

/**
 * Makes a seeded board of `size` squares a side (counting the row and column of totals) and proves it has one
 * answer. A random pattern of black squares sets the runs, random digits fill them, and digits are changed until
 * the answer is single. The board is then rated by solving it: easy by the single-run rules, medium once a digit
 * that must appear has to be traced, hard by supposing, and extra-hard the most-supposing of several boards.
 * If no board of the level is found within the attempts the next level down is tried, and the first generator
 * (a 10×10 only) is the last resort, so a seed never throws.
 */
export function generateKakuro(seed = 1, level: KakuroLevel = "medium", size = 10): KakuroPuzzle {
  if (!isKazuSeed(seed) || !KAKURO_LEVELS.includes(level) || !Number.isInteger(size)
    || size < KAKURO_LEAST_GENERATED_SIDE || size > KAKURO_MAX_SIDE) throw new RangeError("Invalid Kakuro settings");
  const random = seededRandom(seed);
  for (let aim = KAKURO_LEVELS.indexOf(level); aim >= 0; aim -= 1) {
    const aimed = KAKURO_LEVELS[aim]!;
    const wanted = aimed === "extra-hard" ? 3 : 1;
    let best: { board: KakuroBoard; score: number } | null = null, found = 0;
    for (let attempt = 0; attempt < MOST_ATTEMPTS && found < wanted; attempt += 1) {
      const built = candidateKakuro(size, aimed, random);
      if (!built) continue;
      const score = scored(built.board, aimed);
      if (score === null) continue;
      found += 1;
      if (!best || score > best.score) best = { board: built.board, score };
    }
    if (best) {
      const proof = solveKakuro(best.board);
      if (proof.complete && proof.count === 1 && proof.solution && checkKakuro(best.board, proof.solution).ok) {
        return { ...best.board, seed, level, solution: proof.solution };
      }
    }
  }
  if (size === 10) return { ...templateKakuro(seed), level };
  throw new Error("No uniquely solvable Kakuro board was found within the generation budget; try another seed");
}

/** Whether a board suits a level, and how well: higher is harder. */
function scored(board: KakuroBoard, level: KakuroLevel): number | null {
  const weak = kakuroModel(board, 0), strong = kakuroModel(board, 1);
  if (logicCsp(weak.csp, openSlots(weak.csp), 0).solved) return level === "easy" ? 0 : null;
  if (level === "easy") return null;
  if (logicCsp(strong.csp, openSlots(strong.csp), 0).solved) return level === "medium" ? 0 : null;
  if (level === "medium") return null;
  const probing = logicCsp(strong.csp, openSlots(strong.csp), 1);
  return probing.solved ? probing.probes : level === "extra-hard" ? 1_000 : null;
}
