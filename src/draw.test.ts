import { describe, expect, it } from "vitest";

import { drawKazu, kazuCellName, kazuWhere } from "./draw.ts";
import { kazuGeometry } from "./geometry.ts";
import { generateKazu } from "./generate.ts";
import { readGivens } from "./givens.ts";
import { KAZU_KINDS, KAZU_SPECS } from "./kinds.ts";
import { KAZU_STYLE } from "./style.ts";

const count = (svg: string, cls: string) => (svg.match(new RegExp(`class="${cls}[ "]`, "g")) ?? []).length;

describe("drawing a puzzle", () => {
  it("draws every kind at every size as one svg with the printed numbers in it", () => {
    for (const kind of KAZU_KINDS) {
      for (const size of KAZU_SPECS[kind].sizes) {
        const puzzle = generateKazu(kind, size, "easy", 3);
        const svg = drawKazu(kind, size, puzzle.givens)!;
        expect(svg.startsWith("<svg")).toBe(true);
        expect(svg.endsWith("</svg>")).toBe(true);
        expect(svg).toContain(`data-kind="${kind}"`);
        const printed = readGivens(kind, size, puzzle.givens)!.cells.filter((value) => value !== 0).length;
        expect(count(svg, "kz-digit kz-given")).toBe(printed);
        const side = kazuGeometry(kind, size).side;
        expect(svg).toContain(`viewBox="0 0 ${side} ${side}"`);
      }
    }
  });

  it("draws what the kind prints: cages and sums, marks, clues, diagonals, regions", () => {
    const cages = generateKazu("sum-cages", 9, "medium", 1);
    const read = readGivens("sum-cages", 9, cages.givens)!;
    const svg = drawKazu("sum-cages", 9, cages.givens)!;
    expect(count(svg, "kz-cage-sum")).toBe(read.cages!.length);
    expect(svg).toContain(`class="kz-cage"`);
    const more = generateKazu("more-or-less", 5, "easy", 2);
    expect(count(drawKazu("more-or-less", 5, more.givens)!, "kz-mark")).toBe(readGivens("more-or-less", 5, more.givens)!.marks.length);
    const towers = generateKazu("towers", 5, "easy", 2);
    const clues = Object.values(readGivens("towers", 5, towers.givens)!.clues!).flat().filter((clue) => clue !== 0).length;
    expect(count(drawKazu("towers", 5, towers.givens)!, "kz-clue")).toBe(clues);
    const diagonal = drawKazu("diagonal", 9, generateKazu("diagonal", 9, "easy", 1).givens, {})!;
    expect(count(diagonal, "kz-diagonal")).toBe(17);
    expect(drawKazu("number-place", 9, generateKazu("number-place", 9, "easy", 1).givens)!).not.toContain("kz-diagonal");
  });

  it("draws entries, notes, the chosen cell and its lines, conflicts, wrong cells and a hint, each washed or marked", () => {
    const puzzle = generateKazu("number-place", 9, "easy", 3);
    const printed = readGivens("number-place", 9, puzzle.givens)!.cells;
    const open = printed.flatMap((value, index) => (value === 0 ? [index] : []));
    const entries = new Array<number>(81).fill(0);
    entries[open[0]!] = 5;
    const notes = new Array<number>(81).fill(0);
    notes[open[1]!] = (1 << 2) | (1 << 9);
    const svg = drawKazu("number-place", 9, puzzle.givens, { entries, notes, selected: open[2]!, peers: true, conflicts: [open[0]!], wrong: [open[3]!], hint: open[4]!, interactive: true })!;
    expect(count(svg, "kz-digit kz-entry")).toBe(1);
    expect(count(svg, "kz-digit kz-entry kz-bad")).toBe(1);
    expect(count(svg, "kz-note")).toBe(2);
    expect(count(svg, "kz-select")).toBe(1);
    expect(count(svg, "kz-peer")).toBeGreaterThan(8);
    expect(count(svg, "kz-conflict")).toBe(1);
    expect(count(svg, "kz-wrong")).toBe(1);
    expect(count(svg, "kz-hint")).toBe(1);
    expect(count(svg, "kz-hit")).toBe(81);
    expect(drawKazu("number-place", 9, puzzle.givens)!).not.toContain("kz-hit");
  });

  it("draws the same puzzle the same way every time, and is one steady square whatever is written", () => {
    const puzzle = generateKazu("jigsaw", 7, "medium", 5);
    const a = drawKazu("jigsaw", 7, puzzle.givens, { entries: new Array<number>(49).fill(0) });
    expect(drawKazu("jigsaw", 7, puzzle.givens)).toBe(a);
    const full = drawKazu("jigsaw", 7, puzzle.givens, { entries: Array.from({ length: 49 }, (_, i) => (i % 7) + 1), done: true })!;
    expect(full.match(/viewBox="[^"]+"/)![0]).toBe(a!.match(/viewBox="[^"]+"/)![0]);
    expect(full).toContain(`data-solved="true"`);
  });

  it("puts the style inside on request, and speaks Japanese to a screen reader on request, and escapes a label", () => {
    const puzzle = generateKazu("number-place", 4, "easy", 1);
    expect(drawKazu("number-place", 4, puzzle.givens, { style: true })).toContain(KAZU_STYLE.slice(0, 40));
    expect(drawKazu("number-place", 4, puzzle.givens, { language: "ja" })).toContain(`aria-label="ナンプレ、4×4"`);
    expect(drawKazu("number-place", 4, puzzle.givens)).toContain(`aria-label="Sudoku puzzle, 4 by 4"`);
    expect(drawKazu("number-place", 4, puzzle.givens, { label: `a "<b>"` })).toContain(`aria-label="a &quot;&lt;b&gt;&quot;"`);
  });

  it("makes the style one that cannot be selected, and says null for givens that are not a puzzle", () => {
    expect(KAZU_STYLE).toContain("user-select: none");
    expect(KAZU_STYLE).toContain("touch-action: manipulation");
    expect(drawKazu("number-place", 9, "nonsense")).toBeNull();
  });

  it("says where every cell is, and which cell a point is over", () => {
    for (const kind of KAZU_KINDS) {
      const size = KAZU_SPECS[kind].sizes[0]!;
      const geometry = kazuGeometry(kind, size);
      expect(geometry.ring).toBe(kind === "towers" ? 1 : 0);
      for (const index of [0, size - 1, size * size - 1]) {
        const middle = geometry.centre(index);
        expect(geometry.cellAt(middle.x, middle.y)).toBe(index);
      }
      expect(geometry.cellAt(0, 0)).toBe(-1);
      expect(geometry.cellAt(geometry.side, geometry.side)).toBe(-1);
    }
  });

  it("names a cell and the groups that rule a number out, in either language", () => {
    expect(kazuCellName(9, 40, "en")).toBe("row 5, column 5");
    expect(kazuCellName(9, 40, "ja")).toBe("5行5列");
    expect(kazuWhere("sum-cages", "en")).toContain("cage");
    expect(kazuWhere("towers", "ja")).toBe("同じ行と列");
  });
});
