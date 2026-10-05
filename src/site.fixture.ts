import { describe, expect, it } from "vitest";

import fixture from "./site.fixture.json" with { type: "json" };
import { generateKazu } from "./generate.ts";
import { KAZU_KIND_OF_SITE_KIND, KAZU_SPECS, type KazuKind, type KazuLevel } from "./kinds.ts";

/** Every puzzle itsutsu.com made before the move: [site kind, size, level, seed, givens, solution]. */
export const sitePuzzles = fixture.puzzles as [string, number, string, number, string, string][];

/**
 * The sizes made here and never on the site, so nothing of theirs was recorded: the 25×25 Sudoku joined in Kazu 1.4.0.
 * Their puzzles are pinned instead by `levels.pins.test.js`, from the day they were first made.
 */
export const SIZES_NEVER_ON_THE_SITE: Partial<Record<KazuKind, readonly number[]>> = { "number-place": [25] };

/** The sizes of a puzzle that itsutsu.com made before the move. */
export function recordedSizes(kind: KazuKind): number[] {
  return KAZU_SPECS[kind].sizes.filter((size) => !(SIZES_NEVER_ON_THE_SITE[kind] ?? []).includes(size));
}

/** The same, for one puzzle, by this package's key. */
const SITE_NAME_OF: Record<string, string> = Object.fromEntries(Object.entries(KAZU_KIND_OF_SITE_KIND).map(([site, kind]) => [kind, site]));

/**
 * One puzzle's recorded seeds, made again: every size and every level, sixty seeds each, byte for byte
 * (see `site.fixture.test.ts`). One file a puzzle so the six run side by side.
 */
export function madeAsBefore(kind: KazuKind): void {
  describe(`${kind}, as itsutsu.com made it`, () => {
    for (const size of recordedSizes(kind)) {
      it(`makes every ${size}×${size} exactly as before, byte for byte, at every level and every seed`, () => {
        let count = 0;
        for (const [wasKind, wasSize, level, seed, givens, solution] of sitePuzzles) {
          if (wasKind !== SITE_NAME_OF[kind] || wasSize !== size) continue;
          const made = generateKazu(kind, size, level as KazuLevel, seed);
          expect(made.kind).toBe(kind);
          expect(made.givens, `${kind} ${size} ${level} ${seed} givens`).toBe(givens);
          expect(made.solution, `${kind} ${size} ${level} ${seed} solution`).toBe(solution);
          count += 1;
        }
        expect(count).toBe(180);
      }, 300_000);
    }
  });
}
