export const SLITHERLINK_MOST_SIDE = 10;
export const SLITHERLINK_MOST_NODES = 300_000;
/** How hard a puzzle is made, by what a person must do to solve it; see `rateSlitherlink`. */
export const SLITHERLINK_LEVELS = ["easy", "medium", "hard", "extra-hard"] as const;
/** The sides on offer for a square board; any side from 2 to `SLITHERLINK_MOST_SIDE` can be made. */
export const SLITHERLINK_SIZES = [5, 7, 10] as const;
export const SLITHERLINK_MOST_ATTEMPTS = 40;
