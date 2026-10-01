import { describe, expect, it } from "vitest";

import { decodeNotes, decodeRun, decodeSteps, encodeNotes, encodeRun, encodeSteps, KAZU_STEPS_KEPT } from "./progress.ts";

describe("a run, its pencil marks and its steps", () => {
  it("writes the entries as the site does and reads them back, for a run of the right size only", () => {
    const entries = [0, 3, 0, 1, 4, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0];
    expect(encodeRun(entries)).toBe(".3.14..2........");
    expect(decodeRun(encodeRun(entries), 4)).toEqual(entries);
    expect(decodeRun("12", 4)).toBeNull();
    expect(decodeRun("9".repeat(16), 4)).toBeNull();
  });

  it("round-trips pencil marks at every size, and writes nothing for a grid with none", () => {
    for (const size of [4, 6, 9, 16]) {
      const notes = new Array<number>(size * size).fill(0);
      notes[0] = 1 << 1;
      notes[size + 1] = (1 << 2) | (1 << size);
      notes[size * size - 1] = ((1 << (size + 1)) - 2);
      expect(decodeNotes(encodeNotes(notes), size)).toEqual(notes);
    }
    expect(encodeNotes(new Array(81).fill(0))).toBe("");
    expect(decodeNotes("", 9)).toEqual(new Array(81).fill(0));
  });

  it("refuses a pencil-mark code that is not for this grid", () => {
    expect(decodeNotes("abc", 9)).toBeNull();
    expect(decodeNotes("zzzzzz", 9)).toBeNull();
    expect(decodeNotes("000000", 9)).toBeNull();
    expect(decodeNotes(`${(80).toString(36).padStart(2, "0")}${(1 << 9).toString(36).padStart(4, "0")}`, 9)).toBeNull();
  });

  it("writes a step log as the cells that changed, and reads it back", () => {
    const grids = ["1.2.", "1.2.", "1.23", "4.23"];
    const log = encodeSteps(grids);
    expect(log).toBe("1.2.~~033~004");
    expect(decodeSteps(log, 4)).toEqual(grids);
  });

  it("keeps only the newest steps, and refuses a log that does not read", () => {
    const grids = Array.from({ length: KAZU_STEPS_KEPT + 20 }, (_, i) => `${i % 9 || 1}...`);
    expect(decodeSteps(encodeSteps(grids), 4)).toEqual(grids.slice(-KAZU_STEPS_KEPT));
    expect(decodeSteps("", 4)).toBeNull();
    expect(decodeSteps("1.2", 4)).toBeNull();
    expect(decodeSteps("1.2.~03", 4)).toBeNull();
    expect(decodeSteps("1.2.~zz1", 4)).toBeNull();
    expect(encodeSteps([])).toBe("");
  });
});
