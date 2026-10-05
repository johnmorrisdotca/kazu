import { generateShikaku } from "./shikakuGenerate.ts";
import type { ShikakuLevel, ShikakuPuzzle } from "./shikaku.types.ts";

export type ShikakuPackKey = "square" | "wide" | "tall";
export type ShikakuChallenge = {
  pack: ShikakuPackKey;
  packTitle: string;
  name: string;
  level: ShikakuLevel;
  width: number;
  height: number;
  seed: number;
};
export type ShikakuChallengePuzzle = ShikakuChallenge & { puzzle: ShikakuPuzzle };

/** Three short, named challenge routes using the regular seeded unique-puzzle generator. */
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

export function generateShikakuChallenge(pack: ShikakuPackKey, challenge = 1): ShikakuChallengePuzzle {
  const definition = SHIKAKU_CHALLENGE_PACKS[pack], entry = definition?.challenges[challenge - 1];
  if (!definition || !entry) throw new RangeError("Unknown Shikaku challenge");
  return {
    pack, packTitle: definition.title, name: entry.name, level: entry.level,
    width: definition.width, height: definition.height, seed: entry.seed,
    puzzle: generateShikaku(definition.width, definition.height, entry.level, entry.seed),
  };
}
