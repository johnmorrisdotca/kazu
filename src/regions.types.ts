export type RegionsBoard = {
  width: number;
  height: number;
  givens: readonly number[];
};

export type RegionsPuzzle = RegionsBoard & {
  seed: number;
  level: RegionsLevel;
  solution: readonly number[];
};

export type RegionsLevel = "easy" | "medium" | "hard" | "extra-hard";
export type RegionsCheck = {
  ok: boolean;
  complete: boolean;
  filled: number;
  regions: number;
  errors: readonly number[];
};
export type RegionsSolve = {
  count: number;
  solution: readonly number[] | null;
  complete: boolean;
  nodes: number;
};
export type RegionsGame = {
  board: RegionsBoard;
  entries: readonly number[];
  history: readonly (readonly number[])[];
  helped: boolean;
};
/**
 * How hard a board is, measured by solving it. `depth` 0 means the rules solve it, 1 that somebody has to suppose a
 * number in a square and watch it break, 2 that more than that is needed; `probes` is how many suppositions depth 1
 * needed. The rest describes the board.
 */
export type RegionsRating = {
  depth: 0 | 1 | 2;
  probes: number;
  givens: number;
  /** Squares that are given, as a share of the board. */
  givenShare: number;
  regions: number;
  /** Regions with no given in them: they are found only by what is round them. */
  unnamed: number;
  largest: number;
  meanRegion: number;
};
