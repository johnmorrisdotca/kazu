import { describe, expect, it } from "vitest";

import fixture from "./site.fixture.json" with { type: "json" };
import { recordedSizes, sitePuzzles } from "./site.fixture.ts";
import { decodeCells, encodeCells } from "./cells.ts";
import { checkKazu } from "./check.ts";
import { readGivens } from "./givens.ts";
import { KAZU_KIND_OF_SITE_KIND, KAZU_LEVELS, type KazuKind } from "./kinds.ts";
import { decodeSteps, encodeSteps } from "./progress.ts";
import { encodeJigsaw } from "./jigsaw.ts";
import { encodeKiller } from "./sum-cages.ts";
import { encodeMoreOrLess } from "./more-or-less-code.ts";
import { encodeTowers } from "./towers-code.ts";

/**
 * EVERYTHING ITSUTSU.COM MADE BEFORE THE MOVE, MADE AGAIN. Recorded from the site's own generators on
 * 2026-10-01, the day the Numbers puzzles came here: for every puzzle, every size and every level,
 * sixty seeds (1 to 50 and ten large ones, the largest being the most a seed can be), each one's givens
 * and solution. People's kept runs and solves are addressed by (kind, size, level, seed), so a change
 * that alters any of them is a new version of the rules, never a fix. Making them again is six files,
 * `site.<puzzle>.test.ts`, which run side by side; what is here is everything else about the record.
 */
const rows = sitePuzzles;

describe("the puzzles itsutsu.com made", () => {
  it("covers every kind, every size and every level, with sixty seeds each", () => {
    const seen = new Map<string, number>();
    for (const [kind, size, level] of rows) seen.set(`${kind}/${size}/${level}`, (seen.get(`${kind}/${size}/${level}`) ?? 0) + 1);
    const wanted = Object.entries(KAZU_KIND_OF_SITE_KIND).flatMap(([site, kind]) => recordedSizes(kind).flatMap((size) => KAZU_LEVELS.map((level) => `${site}/${size}/${level}`)));
    expect([...seen.keys()].sort()).toEqual(wanted.sort());
    for (const [key, count] of seen) expect(count, key).toBe(60);
    expect(rows).toHaveLength(3600);
  });

  it("reads every recorded puzzle's givens and writes them back as the same string", () => {
    for (const [site, size, level, seed, givens] of rows) {
      const kind = KAZU_KIND_OF_SITE_KIND[site]! as KazuKind;
      const read = readGivens(kind, size, givens);
      expect(read, `${kind} ${size} ${level} ${seed}`).not.toBeNull();
      const cells = encodeCells(read!.cells);
      const written =
        kind === "jigsaw" ? encodeJigsaw(read!.cells, read!.regions!) : kind === "sum-cages" ? encodeKiller(read!.cells, read!.cages!) : kind === "more-or-less" ? encodeMoreOrLess(read!.cells, read!.marks, size) : kind === "towers" ? encodeTowers(read!.cells, read!.clues!) : cells;
      expect(written).toBe(givens);
    }
  });

  it("accepts every recorded solution, and says what the site said of each spoiled answer, word for word", () => {
    for (const [site, size, , , givens, solution] of rows.filter((row) => row[3] <= 5)) {
      expect(checkKazu(KAZU_KIND_OF_SITE_KIND[site]!, size, givens, solution)).toEqual({ ok: true });
    }
    const checks = fixture.checks as [string, number, string, number, string, string, string][];
    expect(checks).toHaveLength(1080);
    const verdicts = new Set<string>();
    for (const [site, size, level, seed, how, answer, was] of checks) {
      const puzzle = rows.find((row) => row[0] === site && row[1] === size && row[2] === level && row[3] === seed)!;
      const got = checkKazu(KAZU_KIND_OF_SITE_KIND[site]!, size, puzzle[4], answer);
      expect(got.ok ? "ok" : got.reason, `${site} ${size} ${level} ${seed} ${how}`).toBe(was);
      verdicts.add(was.replace(/\d+/g, "N"));
    }
    // Spoiling an answer was refused in several different ways, not one.
    expect(verdicts.size).toBeGreaterThan(5);
  });

  it("writes a step log as the site wrote it, and reads the site's back", () => {
    expect(encodeSteps(fixture.steps.grids)).toBe(fixture.steps.log);
    expect(decodeSteps(fixture.steps.log, 4)).toEqual(fixture.steps.back);
  });

  it("reads the site's entries codes: a grid of 1 to 9 and A to G, upper case only", () => {
    expect(decodeCells(".3.1", 2)).toBeNull();
    expect(decodeCells("123456789ABCDEFG".padEnd(256, "."), 16)).toHaveLength(256);
    expect(decodeCells("a".padEnd(256, "."), 16)).toBeNull();
  });
});
