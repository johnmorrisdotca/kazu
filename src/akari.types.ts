/** A board is row-major. null is white, false is a plain black square, and 0–4 are numbered black squares. */
export type AkariBoard = { width: number; height: number; cells: readonly (number | null | false)[] };
export type AkariLevel = "easy" | "medium" | "hard" | "extra-hard";
export type AkariPuzzle = AkariBoard & { seed: number; level: AkariLevel; solution: readonly number[] };
/**
 * How hard a board is, measured by solving it. `depth` 0 means the plain rules solve it, 1 means somebody has to
 * suppose a bulb or an empty square and see it break, 2 means more than that. `probes` is how many suppositions
 * the depth-1 reasoning needed. The rest describes the board.
 */
export type AkariRating = {
  depth: 0 | 1 | 2;
  probes: number;
  whites: number;
  blacks: number;
  clues: number;
  bulbs: number;
  /** Numbered squares as a share of the black squares that touch a white one. */
  clueShare: number;
  /** White squares as a share of the board. */
  openShare: number;
};
export type AkariCheck = { ok: boolean; illuminated: number; errors: readonly number[]; dark: readonly number[]; numbered: readonly number[]; conflicts: readonly number[] };
export type AkariProgress = Omit<AkariCheck, "ok"> & { ok: boolean };
export type AkariSolve = { count: number; solution: readonly number[] | null; complete: boolean; nodes: number };
export type AkariGame = { board: AkariBoard; bulbs: readonly number[]; history: readonly (readonly number[])[]; helped: boolean };
