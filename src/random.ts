/**
 * SEEDED RANDOMNESS, the one thing every puzzle is made from.
 *
 * mulberry32 (Tommy Ettinger, 2017): one 32-bit word of state, a few multiplies
 * a draw, the same stream for the same seed in every browser and every Node. It
 * decides every shuffle, so it must never change: a solve kept as its kind, size,
 * level and seed is made again from them, and a changed stream would hand somebody
 * a different puzzle from the one they were playing. It is the same stream
 * `@johnmorrisdotca/tane` draws, written out here so this package depends on
 * nothing; `site.fixture.test.ts` pins every puzzle the site made from it.
 *
 * Not a credential: it is for fair-looking puzzles, never for secrets.
 */

/** A number in [0, 1), like `Math.random`, from a stream a seed fixes. */
export type Random = () => number;

/** A stream of numbers in [0, 1) fixed by a seed. The seed is read as an unsigned 32-bit integer. */
export function seededRandom(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A copy of the list in a random order (Fisher–Yates, from the end); the list given is left alone. */
export function shuffled<T>(items: readonly T[], random: Random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** The most a seed can be: a whole number from 1 to 2³¹ − 1, so it travels in an address as a plain integer. */
export const KAZU_SEED_MOST = 2 ** 31 - 1;

/** Whether a value is a seed this package takes: a whole number from 1 to `KAZU_SEED_MOST`. */
export function isKazuSeed(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= KAZU_SEED_MOST;
}

/** A new seed, from `Math.random` or the stream given: anywhere in the range. */
export function freshKazuSeed(random: Random = Math.random): number {
  return 1 + Math.floor(random() * KAZU_SEED_MOST);
}
