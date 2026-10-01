import { describe, expect, it } from "vitest";

import { decodeCells, EMPTY_CELL, encodeCells, kazuHash, stepEntry, symbolOf, valueOfSymbol } from "./cells.ts";

describe("cells as a string", () => {
  it("writes 1 to 9 and then A to G", () => {
    expect([1, 9, 10, 16].map(symbolOf)).toEqual(["1", "9", "A", "G"]);
    expect(["1", "9", "A", "G", "a", "g", "H", "0", ".", "", "12"].map(valueOfSymbol)).toEqual([1, 9, 10, 16, 10, 16, 0, 0, 0, 0, 0]);
  });

  it("round-trips a grid of every size", () => {
    for (const size of [4, 6, 9, 16]) {
      const cells = Array.from({ length: size * size }, (_, i) => (i % 3 === 0 ? 0 : (i % size) + 1));
      expect(decodeCells(encodeCells(cells), size)).toEqual(cells);
    }
    expect(encodeCells([0, 3, 0, 1])).toBe(`${EMPTY_CELL}3${EMPTY_CELL}1`);
  });

  it("refuses a string that is not a grid of that side, rather than a grid with holes", () => {
    expect(decodeCells("123", 2)).toBeNull();
    expect(decodeCells("1a..", 2)).toBeNull();
    expect(decodeCells("1x..", 2)).toBeNull();
    expect(decodeCells("..3.", 2)).toBeNull();
    expect(decodeCells(undefined as unknown as string, 2)).toBeNull();
  });

  it("fingerprints a puzzle, the same for the same string", () => {
    expect(kazuHash("abc")).toBe("1a47e90b");
    expect(kazuHash("abc")).toHaveLength(8);
    expect(kazuHash("abd")).not.toBe(kazuHash("abc"));
  });

  it("steps a tapped cell on, and round to empty after the largest", () => {
    expect([0, 1, 8, 9].map((value) => stepEntry(value, 9))).toEqual([1, 2, 9, 0]);
    expect(stepEntry(4, 4)).toBe(0);
  });
});
