import { isAkariBoard } from "./akariBoard.ts";
import { akariModel } from "./akariLogic.ts";
import { logicCsp, openSlots, solveCsp } from "./csp.ts";
import type { AkariBoard, AkariRating } from "./akari.types.ts";

/**
 * Rates a board by solving it as a person would: with the rules alone (depth 0), then with one supposition at
 * a time (depth 1), and anything beyond that is depth 2. A board with no single answer cannot be rated.
 */
export function rateAkari(board: AkariBoard): AkariRating {
  if (!isAkariBoard(board)) throw new RangeError("Invalid Akari board");
  const { csp, whites } = akariModel(board);
  const proof = solveCsp(csp, openSlots(csp), 2, 250_000);
  if (proof.count !== 1 || proof.exhausted) throw new RangeError("Akari rating needs a board with one answer");
  const plain = logicCsp(csp, openSlots(csp), 0);
  const probing = plain.solved ? plain : logicCsp(csp, openSlots(csp), 1);
  const blacks = board.cells.length - whites.length;
  const clues = board.cells.filter(cell => typeof cell === "number").length;
  const lit = board.cells.map((cell, at) => cell === false || typeof cell === "number" ? at : -1).filter(at => at >= 0);
  const touching = lit.filter(at => {
    const x = at % board.width, y = Math.floor(at / board.width);
    return [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].some(([nx, ny]) => nx! >= 0 && ny! >= 0 && nx! < board.width && ny! < board.height && board.cells[ny! * board.width + nx!] === null);
  }).length;
  return {
    depth: plain.solved ? 0 : probing.solved ? 1 : 2,
    probes: plain.solved ? 0 : probing.probes,
    whites: whites.length,
    blacks,
    clues,
    bulbs: proof.solution ? whites.filter((_, i) => proof.solution![2 * i + 1] === 1).length : 0,
    clueShare: touching ? clues / touching : 0,
    openShare: whites.length / board.cells.length,
  };
}
