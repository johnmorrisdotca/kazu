export type HitoriBoard = {
  size: number;
  numbers: readonly number[];
};

export type HitoriLevel = "easy" | "medium" | "hard" | "extra-hard";

export type HitoriPuzzle = HitoriBoard & {
  seed: number;
  level: HitoriLevel;
  solution: readonly boolean[];
};

/**
 * How hard a board is, measured by solving it. `depth` 0 means the rules solve it, 1 that somebody has to suppose a
 * square shaded or white and watch it break, 2 that more than that is needed. `reach` says the rule that the white
 * squares stay in one piece was needed at depth 0. `probes` is the suppositions depth 1 needed.
 */
export type HitoriRating = {
  depth: 0 | 1 | 2;
  reach: boolean;
  probes: number;
  shaded: number;
  /** Shaded squares as a share of the board. */
  shadedShare: number;
  /** Squares whose number repeats in their row or column, as a share of the board. */
  repeatShare: number;
};

export type HitoriSolve = {
  count: number;
  solution: readonly boolean[] | null;
  complete: boolean;
  nodes: number;
};

export type HitoriGame = {
  board: HitoriBoard;
  shaded: readonly boolean[];
  history: readonly (readonly boolean[])[];
  helped: boolean;
};
