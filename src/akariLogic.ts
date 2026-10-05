import type { Csp } from "./csp.ts";
import { akariNeighbours, akariVisible } from "./akariBoard.ts";
import type { AkariBoard } from "./akari.types.ts";

/** An Akari board as variables: one per white square, slot 0 for no bulb and slot 1 for a bulb. */
export type AkariModel = { csp: Csp; whites: readonly number[]; index: Int32Array };

/** Builds the pruning rules of Akari: a bulb shades its lines, a number counts its neighbours, every white square needs a lamp. */
export function akariModel(board: AkariBoard): AkariModel {
  const whites = board.cells.flatMap((value, cell) => value === null ? [cell] : []);
  const index = new Int32Array(board.cells.length).fill(-1);
  whites.forEach((cell, i) => { index[cell] = i; });
  const sees = whites.map(cell => Int32Array.from(akariVisible(board, cell).filter(other => other !== cell).map(other => index[other]!)));
  const clues = board.cells.flatMap((value, cell) => typeof value === "number"
    ? [{ need: value, near: Int32Array.from(akariNeighbours(board, cell).filter(other => index[other]! >= 0).map(other => index[other]!)) }]
    : []);
  const starts = Int32Array.from({ length: whites.length + 1 }, (_, i) => i * 2);

  const propagate = (alive: Uint8Array): boolean => {
    let changed = true;
    while (changed) {
      changed = false;
      for (let i = 0; i < whites.length; i += 1) {
        if (!alive[2 * i] && !alive[2 * i + 1]) return false;
        if (alive[2 * i] || !alive[2 * i + 1]) continue;
        const ray = sees[i]!;
        for (let k = 0; k < ray.length; k += 1) {
          const j = ray[k]!;
          if (alive[2 * j + 1]) {
            alive[2 * j + 1] = 0;
            changed = true;
            if (!alive[2 * j]) return false;
          }
        }
      }
      for (const clue of clues) {
        let on = 0, maybe = 0;
        for (let k = 0; k < clue.near.length; k += 1) {
          const j = clue.near[k]!;
          if (alive[2 * j + 1]) { maybe += 1; if (!alive[2 * j]) on += 1; }
        }
        if (on > clue.need || maybe < clue.need) return false;
        if (on === clue.need && maybe > on) {
          for (let k = 0; k < clue.near.length; k += 1) {
            const j = clue.near[k]!;
            if (alive[2 * j + 1] && alive[2 * j]) { alive[2 * j + 1] = 0; changed = true; }
          }
        } else if (maybe === clue.need && maybe > on) {
          for (let k = 0; k < clue.near.length; k += 1) {
            const j = clue.near[k]!;
            if (alive[2 * j + 1] && alive[2 * j]) { alive[2 * j] = 0; changed = true; }
          }
        }
      }
      for (let i = 0; i < whites.length; i += 1) {
        let lamps = alive[2 * i + 1] ? 1 : 0, only = alive[2 * i + 1] ? i : -1;
        const ray = sees[i]!;
        for (let k = 0; k < ray.length && lamps < 2; k += 1) {
          const j = ray[k]!;
          if (alive[2 * j + 1]) { lamps += 1; only = j; }
        }
        if (lamps === 0) return false;
        if (lamps === 1 && alive[2 * only]) { alive[2 * only] = 0; changed = true; }
      }
    }
    return true;
  };
  return { csp: { starts, propagate }, whites, index };
}
