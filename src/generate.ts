import { isKazuKind, isKazuLevel, isKazuSize, type KazuKind, type KazuLevel, type KazuPuzzle } from "./kinds.ts";
import { generateJigsaw } from "./jigsaw.ts";
import { generateMoreOrLess } from "./more-or-less.ts";
import { generateDiagonal, generateNumberPlace } from "./number-place.ts";
import { isKazuSeed } from "./random.ts";
import { generateSumCages } from "./sum-cages.ts";
import { generateTowers } from "./towers.ts";

const GENERATORS: Record<KazuKind, (size: number, level: KazuLevel, seed: number) => KazuPuzzle> = {
  "number-place": generateNumberPlace,
  jigsaw: generateJigsaw,
  diagonal: generateDiagonal,
  "sum-cages": generateSumCages,
  "more-or-less": generateMoreOrLess,
  towers: generateTowers,
};

/**
 * A puzzle of any of the six, from a seed: the one door. The same kind, size, level and seed make the
 * same puzzle in every browser and every Node, for ever, which is what lets a solve be kept as those
 * four and a race be handed one number. Every puzzle has exactly one answer, and an easy one yields
 * to singles alone.
 *
 * Throws a RangeError for a kind, size, level or seed it does not make, rather than a puzzle made
 * from something else.
 */
export function generateKazu(kind: KazuKind, size: number, level: KazuLevel, seed: number): KazuPuzzle {
  if (!isKazuKind(kind)) throw new RangeError(`Kazu has no puzzle called ${String(kind)}.`);
  if (!isKazuSize(kind, size)) throw new RangeError(`Kazu makes no ${kind} at ${size}×${size}.`);
  if (!isKazuLevel(level)) throw new RangeError(`Kazu has no level called ${String(level)}.`);
  if (!isKazuSeed(seed)) throw new RangeError(`${String(seed)} is not a seed: a whole number from 1 to 2147483647.`);
  return GENERATORS[kind](size, level, seed);
}
