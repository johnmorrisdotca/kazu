import { checkHitori, isHitoriBoard } from "./hitori-board.ts";
import { hitoriModel } from "./hitori-logic.ts";
import { logicCsp, openSlots, solveCsp } from "./csp.ts";
import type { HitoriBoard, HitoriRating } from "./hitori.types.ts";

/** Rates a board with one answer by solving it: with the plain rules, with the whites-stay-together rule, then by supposing. */
export function rateHitori(board: HitoriBoard): HitoriRating {
  if (!isHitoriBoard(board)) throw new RangeError("Invalid Hitori board");
  const strong = hitoriModel(board, 2).csp;
  const proof = solveCsp(strong, openSlots(strong), 2, 300_000);
  if (proof.count !== 1 || proof.exhausted) throw new RangeError("Hitori rating needs a board with one answer");
  const shaded = Array.from({ length: board.size ** 2 }, (_, cell) => proof.solution![2 * cell + 1] === 1);
  const solvedBy = (strength: 0 | 2, depth: number) => {
    const { csp } = hitoriModel(board, strength);
    const run = logicCsp(csp, openSlots(csp), depth);
    return { ...run, solved: run.solved && checkHitori(board, Array.from({ length: board.size ** 2 }, (_, cell) => run.alive[2 * cell + 1] === 1)).ok };
  };
  const plain = solvedBy(0, 0), reach = plain.solved ? plain : solvedBy(2, 0);
  const probing = reach.solved ? reach : solvedBy(2, 1);
  const repeats = board.numbers.filter((_, cell) => {
    const x = cell % board.size, y = Math.floor(cell / board.size);
    return board.numbers.some((other, at) => at !== cell && other === board.numbers[cell] && (at % board.size === x || Math.floor(at / board.size) === y));
  }).length;
  return {
    depth: reach.solved ? 0 : probing.solved ? 1 : 2,
    reach: !plain.solved && reach.solved,
    probes: reach.solved ? 0 : probing.probes,
    shaded: shaded.filter(Boolean).length,
    shadedShare: shaded.filter(Boolean).length / shaded.length,
    repeatShare: repeats / shaded.length,
  };
}
