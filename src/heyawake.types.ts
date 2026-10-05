export type HeyawakeRoom = { x: number; y: number; width: number; height: number; blacks: number | null };
export type HeyawakeBoard = { width: number; height: number; rooms: readonly HeyawakeRoom[] };
export type HeyawakeLevel = "easy" | "medium" | "hard";
export type HeyawakePuzzle = HeyawakeBoard & { seed: number; level: HeyawakeLevel; solution: readonly boolean[] };
export type HeyawakeCheck = { ok: boolean; complete: boolean; errors: readonly number[] };
export type HeyawakeSolve = { count: number; solution: readonly boolean[] | null; complete: boolean; nodes: number };
export type HeyawakeGame = { board: HeyawakeBoard; entries: readonly (boolean | null)[]; history: readonly (readonly (boolean | null)[])[]; helped: boolean };
