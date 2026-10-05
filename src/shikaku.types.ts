/** A rectangle uses zero-based column and row coordinates. */
export type ShikakuRectangle = { x: number; y: number; width: number; height: number };
/** One area clue per rectangle; zero is an unnumbered cell. */
export type ShikakuBoard = { width: number; height: number; clues: readonly number[] };
export type ShikakuLevel = "easy" | "medium" | "hard";
export type ShikakuPuzzle = ShikakuBoard & { seed: number; level: ShikakuLevel; solution: readonly ShikakuRectangle[] };
export type ShikakuCheck = { ok: boolean; covered: number; errors: readonly number[] };
export type ShikakuSolve = { count: number; solution: readonly ShikakuRectangle[] | null; complete: boolean; nodes: number };
export type ShikakuGame = { board: ShikakuBoard; rectangles: readonly ShikakuRectangle[]; history: readonly (readonly ShikakuRectangle[])[]; helped: boolean };
