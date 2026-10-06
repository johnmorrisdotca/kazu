export const CROSS_SUMS_MIN_SIDE = 3;
export const CROSS_SUMS_MAX_SIDE = 12;
export const CROSS_SUMS_MAX_NODES = 250_000;
export const CROSS_SUMS_MAX_ATTEMPTS = 120;
export const CROSS_SUMS_GENERATION_ATTEMPTS = 1_200;
export const CROSS_SUMS_GENERATION_NODES = 1_000_000;
/** How hard a puzzle is made, by what a person must do to solve it; see `rateCrossSums`. */
export const CROSS_SUMS_LEVELS = ["easy", "medium", "hard", "extra-hard"] as const;
/** The sides on offer, counting the row and column of totals; any side from 5 to `CROSS_SUMS_MAX_SIDE` can be made. */
export const CROSS_SUMS_SIZES = [6, 8, 10, 12] as const;
export const CROSS_SUMS_LEAST_GENERATED_SIDE = 5;
