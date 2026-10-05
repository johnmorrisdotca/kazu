/** A rectangle uses zero-based column and row coordinates. */
export type ShikakuRectangle = { x: number; y: number; width: number; height: number };
/** One area clue per rectangle; zero is an unnumbered cell. */
export type ShikakuBoard = { width: number; height: number; clues: readonly number[] };
export type ShikakuLevel = "easy" | "medium" | "hard" | "extra-hard";
export type ShikakuPuzzle = ShikakuBoard & { seed: number; level: ShikakuLevel; solution: readonly ShikakuRectangle[] };
export type ShikakuCheck = { ok: boolean; covered: number; errors: readonly number[] };
export type ShikakuSolve = { count: number; solution: readonly ShikakuRectangle[] | null; complete: boolean; nodes: number };
export type ShikakuGame = { board: ShikakuBoard; rectangles: readonly ShikakuRectangle[]; history: readonly (readonly ShikakuRectangle[])[]; helped: boolean };
/**
 * How hard a board is, measured by solving it. `depth` 0 means the rules solve it, 1 that somebody has to suppose a
 * rectangle and watch it break, 2 that more than that is needed. `rules` is how many of the three rules a depth-0
 * solve needed: 1 for a number with one fitting rectangle (a settled rectangle clears its squares), 2 adding that a
 * square only one rectangle can cover is covered by it, 3 adding that a square only one number can reach makes that
 * number's rectangle cover it. `probes` is the suppositions depth 1 needed.
 */
export type ShikakuRating = {
  depth: 0 | 1 | 2;
  rules: 1 | 2 | 3;
  probes: number;
  rectangles: number;
  meanArea: number;
  largest: number;
  /** Mean number of rectangles a number could be at the start. */
  ambiguity: number;
};
