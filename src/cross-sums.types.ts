export type CrossSumsCell = { kind: "white" } | { kind: "black"; across: number | null; down: number | null };
export type CrossSumsBoard = { width: number; height: number; cells: readonly CrossSumsCell[] };
export type CrossSumsRun = { direction: "across" | "down"; clueCell: number; cells: readonly number[]; sum: number };
export type CrossSumsLevel = "easy" | "medium" | "hard" | "extra-hard";
export type CrossSumsPuzzle = CrossSumsBoard & { seed: number; level: CrossSumsLevel; solution: readonly number[] };
/**
 * How hard a board is, measured by solving it. `depth` 0 means the rules solve it, 1 that somebody has to suppose a
 * digit and watch it break, 2 that more than that is needed; `plain` says the single-run rules were enough (no
 * digit that must appear had to be traced). `probes` is how many suppositions depth 1 needed. The rest describes the runs.
 */
export type CrossSumsRating = {
  depth: 0 | 1 | 2;
  plain: boolean;
  probes: number;
  whites: number;
  runs: number;
  longest: number;
  /** Mean number of squares in a run. */
  meanRun: number;
  /** Runs whose total can be made in only one way, as a share of the runs. */
  fixedShare: number;
};
export type CrossSumsCheck = { ok: boolean; complete: boolean; errors: readonly number[] };
export type CrossSumsSolve = { count: number; solution: readonly number[] | null; complete: boolean; nodes: number };
export type CrossSumsGame = { board: CrossSumsBoard; values: readonly number[]; notes: readonly (readonly number[])[]; history: readonly { values: readonly number[]; notes: readonly (readonly number[])[] }[]; helped: boolean };
export type CrossSumsLanguage = "en" | "ja";
export type CrossSumsMaterial = "ivory" | "wood" | "slate";
export type CrossSumsPieces = "ink" | "tiles";
