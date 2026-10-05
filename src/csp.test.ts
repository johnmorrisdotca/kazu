import { describe, expect, it } from "vitest";

import { countCsp, decide, decidedSlot, logicCsp, openSlots, slotsLeft, solveCsp } from "./csp.ts";
import type { Csp } from "./csp.ts";

/** Three squares that must hold three different digits of three: six answers. Only a decided square clears its digit from the others. */
const allDifferent = (size: number, extra?: (alive: Uint8Array) => boolean): Csp => {
  const starts = Int32Array.from({ length: size + 1 }, (_, i) => i * size);
  return {
    starts,
    propagate: alive => {
      let changed = true;
      while (changed) {
        changed = false;
        for (let v = 0; v < size; v += 1) {
          const left = [...Array(size).keys()].filter(d => alive[v * size + d]);
          if (!left.length) return false;
          if (left.length !== 1) continue;
          for (let other = 0; other < size; other += 1) if (other !== v && alive[other * size + left[0]!]) { alive[other * size + left[0]!] = 0; changed = true; }
        }
      }
      return extra ? extra(alive) : true;
    },
  };
};

describe("the shared engine", () => {
  it("counts every answer, stops at a limit and says so", () => {
    const csp = allDifferent(3);
    expect(countCsp(csp, openSlots(csp), 100, 1000)).toMatchObject({ count: 6, stopped: false, exhausted: false });
    expect(countCsp(csp, openSlots(csp), 4, 1000)).toMatchObject({ count: 4, stopped: true });
    expect(countCsp(csp, openSlots(csp), 100, 2)).toMatchObject({ exhausted: true });
    expect(countCsp(csp, openSlots(csp), 100, 1000).solutions).toHaveLength(6);
  });

  it("decides a variable to one slot and reads it back", () => {
    const csp = allDifferent(3), alive = openSlots(csp);
    expect(slotsLeft(csp, alive, 0)).toBe(3);
    decide(csp, alive, 0, 1);
    expect(decidedSlot(csp, alive, 0)).toBe(1);
    decide(csp, alive, 1, 5);
    expect(decidedSlot(csp, alive, 1)).toBe(5);
    expect(decidedSlot(csp, alive, 2)).toBe(-1);
  });

  it("solves by reasoning when the rules are enough, and says how much supposing it took", () => {
    const csp = allDifferent(3), alive = openSlots(csp);
    decide(csp, alive, 0, 0);
    decide(csp, alive, 1, 4);
    const plain = logicCsp(csp, alive, 0);
    expect(plain).toMatchObject({ solved: true, contradiction: false, probes: 0 });
    // Nothing is decided: the rules alone are stuck, but supposing a digit finds nothing wrong with any, so it is stuck too.
    const open = openSlots(csp);
    expect(logicCsp(csp, open, 0)).toMatchObject({ solved: false, contradiction: false });
    expect(logicCsp(csp, open, 1)).toMatchObject({ solved: false });
  });

  it("rules out a digit by supposing it breaks a rule", () => {
    // Square 0 may not be 0, but only supposing it shows: the extra rule fires only when square 0 is decided.
    const csp = allDifferent(2, alive => !(alive[0] && !alive[1]));
    const probed = logicCsp(csp, openSlots(csp), 1);
    expect(probed).toMatchObject({ solved: true });
    expect(probed.probes).toBeGreaterThan(0);
    expect(logicCsp(csp, openSlots(csp), 0).solved).toBe(false);
  });

  it("proves one answer by reasoning without searching, and none when a rule breaks", () => {
    const csp = allDifferent(3), alive = openSlots(csp);
    decide(csp, alive, 0, 0);
    decide(csp, alive, 1, 4);
    expect(solveCsp(csp, alive, 2, 1000)).toMatchObject({ count: 1, exhausted: false, nodes: 0 });
    const broken = openSlots(csp);
    decide(csp, broken, 0, 0);
    decide(csp, broken, 1, 3);
    expect(solveCsp(csp, broken, 2, 1000)).toMatchObject({ count: 0, exhausted: false });
    expect(solveCsp(csp, openSlots(csp), 100, 1000).count).toBe(6);
  });
});
