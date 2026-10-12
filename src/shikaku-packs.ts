import { generateShikaku } from "./shikaku-generate.ts";
import type { ShikakuLevel, ShikakuPuzzle } from "./shikaku.types.ts";

/** One of the square, wide or tall native Shikaku challenge routes.
 *
 * @example
 * ```ts
 * import type { ShikakuPackKey } from "@johnmorrisdotca/kazu/shikaku";
 *
 * const value: ShikakuPackKey = "square";
 * console.log(value);
 * ```
 */
export type ShikakuPackKey = "square" | "wide" | "tall";
/** The named route, board shape, difficulty and seed of one Shikaku challenge.
 *
 * @example
 * ```ts
 * import type { ShikakuChallenge } from "@johnmorrisdotca/kazu/shikaku";
 *
 * const value: ShikakuChallenge = {pack:"square",packTitle:"The Courtyard",name:"First Cut",level:"easy",width:7,height:7,seed:1};
 * console.log(value);
 * ```
 */
export type ShikakuChallenge = {
  pack: ShikakuPackKey;
  packTitle: string;
  name: string;
  level: ShikakuLevel;
  width: number;
  height: number;
  seed: number;
};
/** A named Shikaku challenge paired with its generated unique puzzle.
 *
 * @example
 * ```ts no-run
 * import type { ShikakuChallengePuzzle } from "@johnmorrisdotca/kazu/shikaku";
 * import { generateShikakuChallenge } from "@johnmorrisdotca/kazu/shikaku";
 *
 * const value: ShikakuChallengePuzzle = generateShikakuChallenge("square",1);
 * console.log(value);
 * ```
 */
export type ShikakuChallengePuzzle = ShikakuChallenge & { puzzle: ShikakuPuzzle };

/** Three short, named challenge routes using the regular seeded unique-puzzle generator.
 *
 * @example
 * ```ts
 * import { SHIKAKU_CHALLENGE_PACKS } from "@johnmorrisdotca/kazu/shikaku";
 *
 * console.log(Object.keys(SHIKAKU_CHALLENGE_PACKS));
 * ```
 */
export const SHIKAKU_CHALLENGE_PACKS: Readonly<Record<ShikakuPackKey, {
  title: string;
  description: string;
  width: number;
  height: number;
  challenges: readonly { name: string; level: ShikakuLevel; seed: number }[];
}>> = {
  square: {
    title: "The Courtyard", description: "A compact square route.", width: 7, height: 7,
    challenges: [{ name: "First Cut", level: "easy", seed: 1 }, { name: "Crossing", level: "medium", seed: 2 }, { name: "Mosaic", level: "hard", seed: 3 }],
  },
  wide: {
    title: "The Long Table", description: "Three puzzles across a wide board.", width: 10, height: 6,
    challenges: [{ name: "Harbour", level: "easy", seed: 1 }, { name: "Causeway", level: "medium", seed: 2 }, { name: "Headland", level: "hard", seed: 3 }],
  },
  tall: {
    title: "The Narrow Garden", description: "A tall route with long edges.", width: 6, height: 10,
    challenges: [{ name: "Gate", level: "easy", seed: 1 }, { name: "Pavilion", level: "medium", seed: 2 }, { name: "Lantern Walk", level: "hard", seed: 3 }],
  },
};

/** Generate a seeded Shikaku puzzle with a verified unique answer; unsupported inputs or exhausted attempts throw.
 *
 * @param pack - The square, wide or tall named challenge route.
 * @param challenge - The one-based challenge number within the route.
 * @returns Generate a seeded Shikaku puzzle with a verified unique answer; unsupported inputs or exhausted attempts throw.
 * @example
 * ```ts no-run
 * import { generateShikakuChallenge } from "@johnmorrisdotca/kazu/shikaku";
 *
 * console.log(generateShikakuChallenge("square",1));
 * ```
 */
export function generateShikakuChallenge(pack: ShikakuPackKey, challenge = 1): ShikakuChallengePuzzle {
  const definition = SHIKAKU_CHALLENGE_PACKS[pack], entry = definition?.challenges[challenge - 1];
  if (!definition || !entry) throw new RangeError("Unknown Shikaku challenge");
  return {
    pack, packTitle: definition.title, name: entry.name, level: entry.level,
    width: definition.width, height: definition.height, seed: entry.seed,
    puzzle: generateShikaku(definition.width, definition.height, entry.level, entry.seed),
  };
}
