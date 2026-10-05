import { isKakuroBoard, kakuroRuns } from "./kakuroBoard.ts";
import { kakuroModel } from "./kakuroLogic.ts";
import { logicCsp, openSlots, solveCsp } from "./csp.ts";
import type { KakuroBoard, KakuroRating } from "./kakuro.types.ts";

const COMBOS = (length: number, sum: number): number => {
  let count = 0;
  for (let mask = 1; mask < 512; mask += 1) {
    let n = 0, total = 0;
    for (let d = 1; d <= 9; d += 1) if (mask & 1 << d - 1) { n += 1; total += d; }
    if (n === length && total === sum) count += 1;
  }
  return count;
};

/** Rates a board with one answer by solving it: with the single-run rules, with the digit-that-must-appear rule, then by supposing. */
export function rateKakuro(board: KakuroBoard): KakuroRating {
  if (!isKakuroBoard(board)) throw new RangeError("Invalid Kakuro board");
  const weak = kakuroModel(board, 0), strong = kakuroModel(board, 1);
  const proof = solveCsp(strong.csp, openSlots(strong.csp), 2, 250_000);
  if (proof.count !== 1 || proof.exhausted) throw new RangeError("Kakuro rating needs a board with one answer");
  const plain = logicCsp(weak.csp, openSlots(weak.csp), 0);
  const rules = plain.solved ? plain : logicCsp(strong.csp, openSlots(strong.csp), 0);
  const probing = rules.solved ? rules : logicCsp(strong.csp, openSlots(strong.csp), 1);
  const runs = kakuroRuns(board);
  return {
    depth: rules.solved ? 0 : probing.solved ? 1 : 2,
    plain: plain.solved,
    probes: rules.solved ? 0 : probing.probes,
    whites: strong.whites.length,
    runs: runs.length,
    longest: Math.max(...runs.map(run => run.cells.length)),
    meanRun: runs.reduce((total, run) => total + run.cells.length, 0) / runs.length,
    fixedShare: runs.filter(run => COMBOS(run.cells.length, run.sum) === 1).length / runs.length,
  };
}
