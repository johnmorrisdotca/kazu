import { isFillominoBoard } from "./fillomino-board.ts";
import { fillominoModel } from "./fillomino-logic.ts";
import { decide, logicCsp, openSlots, solveCsp } from "./csp.ts";
import type { FillominoBoard, FillominoRating } from "./fillomino.types.ts";

/** Rates a board with one answer by solving it as a person would: with the rules, then by supposing one number at a time. */
export function rateFillomino(board: FillominoBoard): FillominoRating {
  if (!isFillominoBoard(board)) throw new RangeError("Invalid Fillomino board");
  const { csp, most } = fillominoModel(board, board.givens);
  const start = openSlots(csp);
  board.givens.forEach((value, cell) => { if (value) decide(csp, start, cell, cell * most + value - 1); });
  const proof = solveCsp(csp, start, 2, 200_000);
  if (proof.count !== 1 || proof.exhausted) throw new RangeError("Fillomino rating needs a board with one answer");
  const plain = logicCsp(csp, start, 0);
  const probing = plain.solved ? plain : logicCsp(csp, start, 1);
  const answer = Array.from({ length: board.givens.length }, (_, cell) => { for (let v = 0; v < most; v += 1) if (proof.solution![cell * most + v]) return v + 1; return 0; });
  const regions = new Map<string, number>();
  const label = Array<number>(answer.length).fill(-1);
  let count = 0, largest = 0, unnamed = 0;
  for (let first = 0; first < answer.length; first += 1) {
    if (label[first]! >= 0) continue;
    const members = [first];
    label[first] = count;
    for (let at = 0; at < members.length; at += 1) {
      const cell = members[at]!, x = cell % board.width, y = Math.floor(cell / board.width);
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]] as const) {
        if (nx < 0 || ny < 0 || nx >= board.width || ny >= board.height) continue;
        const next = ny * board.width + nx;
        if (label[next]! < 0 && answer[next] === answer[first]) { label[next] = count; members.push(next); }
      }
    }
    largest = Math.max(largest, members.length);
    if (!members.some(cell => board.givens[cell])) unnamed += 1;
    regions.set(String(count), members.length);
    count += 1;
  }
  const givens = board.givens.filter(Boolean).length;
  return {
    depth: plain.solved ? 0 : probing.solved ? 1 : 2,
    probes: plain.solved ? 0 : probing.probes,
    givens,
    givenShare: givens / board.givens.length,
    regions: count,
    unnamed,
    largest,
    meanRegion: board.givens.length / count,
  };
}
