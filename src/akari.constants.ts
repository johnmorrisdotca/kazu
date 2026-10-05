export const AKARI_MOST_SIDE = 16;
export const AKARI_MOST_NODES = 250_000;
/** How hard a puzzle is made, by what a person must do to solve it; see `rateAkari`. */
export const AKARI_LEVELS = ["easy", "medium", "hard", "extra-hard"] as const;
/** The sides the demo and the site offer for a square board; any side from 2 to `AKARI_MOST_SIDE` can be made. */
export const AKARI_SIZES = [5, 7, 10, 14] as const;
export const AKARI_MOST_ATTEMPTS = 60;
