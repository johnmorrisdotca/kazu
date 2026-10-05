/** Bounds keep custom boards and searches finite. */
export const SHIKAKU_MOST_SIDE = 16;
export const SHIKAKU_MOST_NODES = 100_000;
export const SHIKAKU_MOST_ATTEMPTS = 1500;
/** How hard a puzzle is made, by what a person must do to solve it; see `rateShikaku`. */
export const SHIKAKU_LEVELS = ["easy", "medium", "hard", "extra-hard"] as const;
/** The sides on offer for a square board; any side from 2 to `SHIKAKU_MOST_SIDE` can be made. */
export const SHIKAKU_SIZES = [5, 7, 10, 14] as const;
