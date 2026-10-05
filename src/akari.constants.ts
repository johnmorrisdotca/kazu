export const AKARI_MOST_SIDE = 16;
export const AKARI_MOST_NODES = 250_000;
/** How hard a puzzle is made, by what a person must do to solve it; see `rateAkari`. */
export const AKARI_LEVELS = ["easy", "medium", "hard", "extra-hard"] as const;
/** The sides the demo and the site offer for a square board; any side from 2 to `AKARI_MOST_SIDE` can be made. */
export const AKARI_SIZES = [5, 7, 10, 14] as const;
export const AKARI_MOST_ATTEMPTS = 60;
/**
 * When a level finds no board in `AKARI_MOST_ATTEMPTS` plain attempts (a large board of an easy level, mostly: one attempt in a
 * hundred succeeds on a 14×14), the generator tries again with more black squares, each of these multiples of the usual share in
 * turn, `AKARI_DENSER_ATTEMPTS` attempts at each. Black squares are what make a large board solvable by its numbers.
 */
export const AKARI_DENSER_CROWDS = [1.5, 1.8, 2.1, 2.4] as const;
export const AKARI_DENSER_ATTEMPTS = 30;
