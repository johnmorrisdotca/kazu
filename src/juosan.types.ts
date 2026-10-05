/** A territory is a list of zero-based cell indexes and an absolute orientation difference. */
export type JuosanTerritory = { cells: readonly number[]; difference: number | null };
export type JuosanBoard = { width: number; height: number; territories: readonly JuosanTerritory[] };
export type JuosanMark = 0 | 1 | 2;
export type JuosanLevel = "easy" | "medium" | "hard";
export type JuosanPuzzle = JuosanBoard & { seed: number; level: JuosanLevel; solution: readonly JuosanMark[] };
export type JuosanCheck = { ok: boolean; errors: readonly number[] };
export type JuosanSolve = { count: number; solution: readonly JuosanMark[] | null; complete: boolean; nodes: number };
export type JuosanGame = { board: JuosanBoard; marks: readonly JuosanMark[]; history: readonly (readonly JuosanMark[])[]; helped: boolean };
