export type LoopBoard = { width: number; height: number; clues: readonly (number | null)[] };
export type LoopLevel = "easy" | "medium" | "hard" | "extra-hard";
export type LoopPuzzle = LoopBoard & { seed: number; level: LoopLevel; solution: readonly number[] };
/**
 * How hard a board is, measured by solving it. `depth` 0 means the plain rules solve it, 1 that somebody has to
 * suppose an edge drawn or crossed and watch it break, 2 that more than that is needed; `probes` is how many
 * suppositions depth 1 needed. The rest describes the board.
 */
export type LoopRating = {
  depth: 0 | 1 | 2;
  probes: number;
  clues: number;
  /** Numbered squares as a share of all squares. */
  clueShare: number;
  /** Squares numbered 0 as a share of the numbered ones. */
  zeroShare: number;
  /** Edges in the loop. */
  loop: number;
};
export type LoopCheck = { ok: boolean; errors: readonly number[]; clues: readonly number[]; vertices: readonly number[]; loops: number };
export type LoopProgress = { ok: boolean; clues: readonly number[]; vertices: readonly number[]; loops: number };
export type LoopSolve = { count: number; solution: readonly number[] | null; complete: boolean; nodes: number };
export type LoopGame = { board: LoopBoard; edges: readonly number[]; history: readonly (readonly number[])[]; helped: boolean };
