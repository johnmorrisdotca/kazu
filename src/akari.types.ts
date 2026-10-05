/** A board is row-major. null is white, false is a plain black square, and 0–4 are numbered black squares. */
export type AkariBoard = { width: number; height: number; cells: readonly (number | null | false)[] };
export type AkariPuzzle = AkariBoard & { seed: number; solution: readonly number[] };
export type AkariCheck = { ok: boolean; illuminated: number; errors: readonly number[]; dark: readonly number[]; numbered: readonly number[]; conflicts: readonly number[] };
export type AkariProgress = Omit<AkariCheck, "ok"> & { ok: boolean };
export type AkariSolve = { count: number; solution: readonly number[] | null; complete: boolean; nodes: number };
export type AkariGame = { board: AkariBoard; bulbs: readonly number[]; history: readonly (readonly number[])[]; helped: boolean };
