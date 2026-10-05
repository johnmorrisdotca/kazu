export type FillominoBoard = {
  width: number;
  height: number;
  givens: readonly number[];
};

export type FillominoPuzzle = FillominoBoard & {
  seed: number;
  level: FillominoLevel;
  solution: readonly number[];
};

export type FillominoLevel = "easy" | "medium" | "hard" | "extra-hard";
export type FillominoCheck = {
  ok: boolean;
  complete: boolean;
  filled: number;
  regions: number;
  errors: readonly number[];
};
export type FillominoSolve = {
  count: number;
  solution: readonly number[] | null;
  complete: boolean;
  nodes: number;
};
export type FillominoGame = {
  board: FillominoBoard;
  entries: readonly number[];
  history: readonly (readonly number[])[];
  helped: boolean;
};
/**
 * How hard a board is, measured by solving it. `depth` 0 means the rules solve it, 1 that somebody has to suppose a
 * number in a square and watch it break, 2 that more than that is needed; `probes` is how many suppositions depth 1
 * needed. The rest describes the board.
 */
export type FillominoRating = {
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
