// The boards made for a seed, held to what they were pinned as. Plain JavaScript, so that reading files needs no Node types.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import process from "node:process";

import { describe, expect, it, vi } from "vitest";

import { generateAkari } from "./akariGenerate.ts";
import { generateFillomino } from "./fillominoGenerate.ts";
import { generateHitori } from "./hitoriGenerate.ts";
import { generateKakuro } from "./kakuroGenerate.ts";
import { generateShikaku } from "./shikakuGenerate.ts";
import { generateSlitherlink } from "./slitherlinkGenerate.ts";

// These generate and enumerate a lot; a slow runner must not fail them for taking its time.
vi.setConfig({ testTimeout: 120_000 });

const LEVELS = ["easy", "medium", "hard", "extra-hard"];

/**
 * A board is kept by its kind, size, level and seed, so a change to how boards are made must be a decision. Each line is a
 * checksum of one made board; a change that alters one fails here. `UPDATE_LEVELS=1 pnpm test` writes the file again when
 * the change is meant (a new version of the generators, with the changelog saying so).
 */
describe("the boards made for a seed", () => {
  const made = {};
  for (const level of LEVELS) for (const seed of [1, 2]) {
    made[`shikaku 7 ${level} ${seed}`] = () => generateShikaku(7, 7, level, seed);
    made[`akari 7 ${level} ${seed}`] = () => generateAkari(7, 7, seed, level);
    made[`slitherlink 7 ${level} ${seed}`] = () => generateSlitherlink(7, 7, seed, level);
    made[`hitori 7 ${level} ${seed}`] = () => generateHitori(7, seed, level);
    made[`fillomino 8 ${level} ${seed}`] = () => generateFillomino(8, 8, level, seed);
    made[`kakuro 8 ${level} ${seed}`] = () => generateKakuro(seed, level, 8);
  }
  it("are the same as when they were pinned", () => {
    const sums = Object.fromEntries(Object.entries(made).map(([key, make]) => [key, createHash("sha256").update(JSON.stringify(make())).digest("hex").slice(0, 16)]));
    if (process.env.UPDATE_LEVELS === "1") writeFileSync("src/levels.fixture.json", `${JSON.stringify(sums, null, 2)}\n`);
    expect(sums).toEqual(JSON.parse(readFileSync("src/levels.fixture.json", "utf8")));
  });
});
