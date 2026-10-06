import { isShikakuBoard } from "./shikaku-board.ts";
import { shikakuModel } from "./shikaku-logic.ts";
import { logicCsp, openSlots, solveCsp } from "./csp.ts";
import type { ShikakuBoard, ShikakuRating } from "./shikaku.types.ts";

/** Rates a board with one answer by solving it with the first rule, with the first two, with all three, then by supposing. */
export function rateShikaku(board: ShikakuBoard): ShikakuRating {
  if (!isShikakuBoard(board)) throw new RangeError("Invalid Shikaku board");
  const first = shikakuModel(board, 0), second = shikakuModel(board, 1), strong = shikakuModel(board, 2);
  const proof = solveCsp(strong.csp, openSlots(strong.csp), 2, 100_000);
  if (proof.count !== 1 || proof.exhausted) throw new RangeError("Shikaku rating needs a board with one answer");
  const one = logicCsp(first.csp, openSlots(first.csp), 0);
  const two = one.solved ? one : logicCsp(second.csp, openSlots(second.csp), 0);
  const rules = two.solved ? two : logicCsp(strong.csp, openSlots(strong.csp), 0);
  const probing = rules.solved ? rules : logicCsp(strong.csp, openSlots(strong.csp), 1);
  const areas = strong.clues.map(cell => board.clues[cell]!);
  const options = strong.clues.map((_, v) => strong.csp.starts[v + 1]! - strong.csp.starts[v]!);
  return {
    depth: rules.solved ? 0 : probing.solved ? 1 : 2,
    rules: one.solved ? 1 : two.solved ? 2 : 3,
    probes: rules.solved ? 0 : probing.probes,
    rectangles: areas.length,
    meanArea: board.clues.length / areas.length,
    largest: Math.max(...areas),
    ambiguity: options.reduce((a, b) => a + b, 0) / options.length,
  };
}
