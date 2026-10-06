// The boards made for a seed, held to what they were pinned as. Plain JavaScript, so that reading files needs no Node types.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import process from "node:process";

import { describe, expect, it, vi } from "vitest";

import { generateAkari } from "./akari-generate.ts";
import { generateKazu } from "./generate.ts";
import { generateRegions } from "./regions-generate.ts";
import { generateHitori } from "./hitori-generate.ts";
import { generateCrossSums } from "./cross-sums-generate.ts";
import { generateShikaku } from "./shikaku-generate.ts";
import { generateLoop } from "./loop-generate.ts";

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
    made[`loop 7 ${level} ${seed}`] = () => generateLoop(7, 7, seed, level);
    made[`hitori 7 ${level} ${seed}`] = () => generateHitori(7, seed, level);
    made[`regions 8 ${level} ${seed}`] = () => generateRegions(8, 8, level, seed);
    made[`cross-sums 8 ${level} ${seed}`] = () => generateCrossSums(seed, level, 8);
  }
  // The 25×25 Sudoku was never on itsutsu.com, so `site.fixture.json` has none of it; these pin it from Kazu 1.4.0.
  for (const level of ["easy", "medium", "hard"]) for (const seed of [1, 2]) made[`number-place 25 ${level} ${seed}`] = () => generateKazu("number-place", 25, level, seed);
  // Akari at the sizes whose seeds used to fall back to a fixed lattice: the random board they make now is pinned.
  for (const seed of [1, 2, 3]) made[`akari 14 easy ${seed}`] = () => generateAkari(14, 14, seed, "easy");
  it("are the same as when they were pinned", () => {
    const sums = Object.fromEntries(Object.entries(made).map(([key, make]) => [key, createHash("sha256").update(JSON.stringify(make())).digest("hex").slice(0, 16)]));
    if (process.env.UPDATE_LEVELS === "1") writeFileSync("src/levels.fixture.json", `${JSON.stringify(sums, null, 2)}\n`);
    expect(sums).toEqual(JSON.parse(readFileSync("src/levels.fixture.json", "utf8")));
  });
});
