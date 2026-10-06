import { isLoopBoard } from "./loop-board.ts";
import { loopModel } from "./loop-logic.ts";
import { logicCsp, openSlots, solveCsp } from "./csp.ts";
import type { LoopBoard, LoopRating } from "./loop.types.ts";

/** Rates a board with one answer by solving it as a person would: with the rules, then by supposing one edge at a time. */
export function rateLoop(board: LoopBoard): LoopRating {
  if (!isLoopBoard(board)) throw new RangeError("Invalid Loop board");
  const { csp } = loopModel(board);
  const proof = solveCsp(csp, openSlots(csp), 2, 300_000);
  if (proof.count !== 1 || proof.exhausted) throw new RangeError("Loop rating needs a board with one answer");
  const plain = logicCsp(csp, openSlots(csp), 0);
  const probing = plain.solved ? plain : logicCsp(csp, openSlots(csp), 1);
  const numbered = board.clues.filter(clue => clue !== null);
  let loop = 0;
  for (let at = 1; at < proof.solution!.length; at += 2) loop += proof.solution![at]!;
  return {
    depth: plain.solved ? 0 : probing.solved ? 1 : 2,
    probes: plain.solved ? 0 : probing.probes,
    clues: numbered.length,
    clueShare: numbered.length / board.clues.length,
    zeroShare: numbered.length ? numbered.filter(clue => clue === 0).length / numbered.length : 0,
    loop,
  };
}
