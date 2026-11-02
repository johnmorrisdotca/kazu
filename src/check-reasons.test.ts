import { describe, expect, it } from "vitest";
import { decodeCells } from "./cells.ts";
import { checkKazu } from "./check.ts";
import { KAZU_CHECK_REASONS, type KazuCheckCode, kazuRefusal } from "./check-reasons.ts";
import { generateKazu } from "./generate.ts";
import { readGivens } from "./givens.ts";
import { encodeJigsaw } from "./jigsaw.ts";
import { KAZU_KINDS, KAZU_SPECS, type KazuKind } from "./kinds.ts";
import { boxOf } from "./layout.ts";
import { seededRandom } from "./random.ts";
import { type Cage, encodeKiller } from "./sum-cages.ts";

/** The gaps a clause has, by name. */
const gapsOf = (clause: string): string[] => [...clause.matchAll(/\{(\w+)\}/g)].map((match) => match[1]!);

describe("a refusal in a form a site can say in its own language", () => {
  it("fills the clause of its code with its values, and that is the reason", () => {
    expect(kazuRefusal("row-repeats", { n: 3 })).toEqual({
      ok: false,
      reason: "row 3 repeats a number",
      code: "row-repeats",
      values: { n: 3 },
    });
    expect(kazuRefusal("cage-sum-wrong", { n: 4, sum: 17 }).reason).toBe("cage 4 does not add to 17");
    expect(kazuRefusal("diagonal-repeats")).toEqual({
      ok: false,
      reason: "a diagonal repeats a number",
      code: "diagonal-repeats",
    });
  });

  it("gives every refusal a code whose clause, filled with its values, is the reason, and with no gap left over", () => {
    const seen = new Set<KazuCheckCode>();
    const random = seededRandom(7);
    const note = (kind: KazuKind, size: number, givens: string, answer: string): void => {
      const verdict = checkKazu(kind, size, givens, answer);
      if (verdict.ok) return;
      seen.add(verdict.code);
      expect(verdict.reason, verdict.code).toBe(kazuRefusal(verdict.code, verdict.values).reason);
      expect(Object.keys(verdict.values ?? {}).sort(), verdict.code).toEqual(
        gapsOf(KAZU_CHECK_REASONS[verdict.code]).sort(),
      );
    };
    for (const kind of KAZU_KINDS) {
      for (const size of KAZU_SPECS[kind].sizes) {
        for (const seed of [1, 2, 3]) {
          const puzzle = generateKazu(kind, size, "easy", seed);
          const solution = [...puzzle.solution];
          for (let attempt = 0; attempt < 40; attempt += 1) {
            const answer = [...solution];
            const a = Math.floor(random() * answer.length);
            const b = Math.floor(random() * answer.length);
            if (attempt % 3 === 0) [answer[a], answer[b]] = [answer[b]!, answer[a]!];
            else if (attempt % 3 === 1) answer[a] = answer[b]!;
            else answer[a] = ".";
            note(kind, size, puzzle.givens, answer.join(""));
          }
          note(kind, size, puzzle.givens, puzzle.solution.slice(1));
          note(kind, size, "x", puzzle.solution);
          note(
            kind,
            size,
            puzzle.givens,
            puzzle.solution.replace(/[1-2]/g, (c) => (c === "1" ? "2" : "1")),
          );
        }
      }
    }
    // Another valid grid for the same cages, by swapping two numbers throughout: right in every row, column and box, wrong in a cage.
    for (let seed = 1; seed <= 30; seed += 1) {
      const puzzle = generateKazu("sum-cages", 6, "medium", seed);
      for (const [one, other] of [
        ["1", "2"],
        ["3", "4"],
        ["5", "6"],
        ["1", "6"],
      ]) {
        const swappedNumbers = [...puzzle.solution].map((c) => (c === one ? other! : c === other ? one! : c));
        note("sum-cages", 6, puzzle.givens, swappedNumbers.join(""));
      }
    }
    // A cage that holds one number twice, in two cells no row, column or box joins.
    const caged = generateKazu("sum-cages", 6, "easy", 1);
    const values = decodeCells(caged.solution, 6)!;
    const first = values.findIndex(
      (value, at) =>
        values.findIndex(
          (other, to) =>
            other === value &&
            Math.floor(to / 6) !== Math.floor(at / 6) &&
            to % 6 !== at % 6 &&
            boxOf(6, at) !== boxOf(6, to),
        ) > at,
    );
    const second = values.findIndex(
      (other, to) =>
        other === values[first] &&
        Math.floor(to / 6) !== Math.floor(first / 6) &&
        to % 6 !== first % 6 &&
        boxOf(6, first) !== boxOf(6, to),
    );
    const cages: Cage[] = [{ cells: [first, second], sum: values[first]! * 2 }];
    values.forEach((value, at) => {
      if (at !== first && at !== second) cages.push({ cells: [at], sum: value });
    });
    note("sum-cages", 6, encodeKiller(new Array<number>(36).fill(0), cages), caged.solution);
    // Regions that are not each one joined shape.
    const jigsaw = generateKazu("jigsaw", 5, "easy", 1);
    const read = readGivens("jigsaw", 5, jigsaw.givens)!;
    note(
      "jigsaw",
      5,
      encodeJigsaw(
        read.cells,
        Array.from({ length: 25 }, (_, i) => (Math.floor(i / 5) + (i % 5)) % 5),
      ),
      jigsaw.solution,
    );
    note("number-place", 8, "", "");
    // `no-check` guards a kind that has a size and no check: none has, so it is never reached through `checkKazu`.
    seen.add("no-check");
    expect([...seen].sort()).toEqual(Object.keys(KAZU_CHECK_REASONS).sort());
  });
});
