export type KakuroCell = { kind: "white" } | { kind: "black"; across: number | null; down: number | null };
export type KakuroBoard = { width: number; height: number; cells: readonly KakuroCell[] };
export type KakuroRun = { direction: "across" | "down"; clueCell: number; cells: readonly number[]; sum: number };
export type KakuroLevel = "easy" | "medium" | "hard" | "extra-hard";
export type KakuroPuzzle = KakuroBoard & { seed: number; level: KakuroLevel; solution: readonly number[] };
/**
 * How hard a board is, measured by solving it. `depth` 0 means the rules solve it, 1 that somebody has to suppose a
 * digit and watch it break, 2 that more than that is needed; `plain` says the single-run rules were enough (no
 * digit that must appear had to be traced). `probes` is how many suppositions depth 1 needed. The rest describes the runs.
 */
export type KakuroRating = {
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
export type KakuroCheck = { ok: boolean; complete: boolean; errors: readonly number[] };
export type KakuroSolve = { count: number; solution: readonly number[] | null; complete: boolean; nodes: number };
export type KakuroGame = { board: KakuroBoard; values: readonly number[]; notes: readonly (readonly number[])[]; history: readonly { values: readonly number[]; notes: readonly (readonly number[])[] }[]; helped: boolean };
export type KakuroLanguage = "en" | "ja";
export type KakuroMaterial = "ivory" | "wood" | "slate";
export type KakuroPieces = "ink" | "tiles";
