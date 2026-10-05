export const FILLOMINO_MOST_SIDE = 12;
export const FILLOMINO_GENERATOR_MOST_CELLS = 144;
export const FILLOMINO_MOST_NODES = 80_000;
export const FILLOMINO_MOST_ATTEMPTS = 120;
/** How hard a puzzle is made, by what a person must do to solve it; see `rateFillomino`. */
export const FILLOMINO_LEVELS = ["easy", "medium", "hard", "extra-hard"] as const;
/** The sides on offer for a square board; any side from 4 to `FILLOMINO_MOST_SIDE` can be made. */
export const FILLOMINO_SIZES = [6, 8, 10, 12] as const;
export const FILLOMINO_LEAST_GENERATED_SIDE = 4;
