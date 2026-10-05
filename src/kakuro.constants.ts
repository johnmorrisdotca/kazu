export const KAKURO_MIN_SIDE = 3;
export const KAKURO_MAX_SIDE = 12;
export const KAKURO_MAX_NODES = 250_000;
export const KAKURO_MAX_ATTEMPTS = 120;
export const KAKURO_GENERATION_ATTEMPTS = 1_200;
export const KAKURO_GENERATION_NODES = 1_000_000;
/** How hard a puzzle is made, by what a person must do to solve it; see `rateKakuro`. */
export const KAKURO_LEVELS = ["easy", "medium", "hard", "extra-hard"] as const;
/** The sides on offer, counting the row and column of totals; any side from 5 to `KAKURO_MAX_SIDE` can be made. */
export const KAKURO_SIZES = [6, 8, 10, 12] as const;
export const KAKURO_LEAST_GENERATED_SIDE = 5;
