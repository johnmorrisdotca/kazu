export type SlitherlinkBoard = { width: number; height: number; clues: readonly (number | null)[] };
export type SlitherlinkPuzzle = SlitherlinkBoard & { seed: number; solution: readonly number[] };
export type SlitherlinkCheck = { ok: boolean; errors: readonly number[]; clues: readonly number[]; vertices: readonly number[]; loops: number };
export type SlitherlinkProgress = { ok: boolean; clues: readonly number[]; vertices: readonly number[]; loops: number };
export type SlitherlinkSolve = { count: number; solution: readonly number[] | null; complete: boolean; nodes: number };
export type SlitherlinkGame = { board: SlitherlinkBoard; edges: readonly number[]; history: readonly (readonly number[])[]; helped: boolean };
