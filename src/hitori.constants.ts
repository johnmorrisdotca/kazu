export const HITORI_MAX_NODES = 300_000;
/** The sides on offer; any side from 4 to `HITORI_MOST_SIDE` is a board `isHitoriBoard` takes. */
export const HITORI_SIZES = [5, 6, 7, 8, 9, 10, 12] as const;
export const HITORI_MOST_SIDE = 12;
export const HITORI_LEAST_SIDE = 4;
/** How hard a puzzle is made, by what a person must do to solve it; see `rateHitori`. */
export const HITORI_LEVELS = ["easy", "medium", "hard", "extra-hard"] as const;
export const HITORI_MOST_ATTEMPTS = 600;
