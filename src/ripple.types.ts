export type RippleBoard = {
  width: number;
  height: number;
  rooms: readonly number[];
  clues: readonly (number | null)[];
};
export type RipplePuzzle = RippleBoard & { seed: number; solution: readonly number[] };
export type RippleCheck = { ok: boolean; errors: readonly number[]; complete: boolean };
export type RippleSolve = { count: number; solution: readonly number[] | null; complete: boolean; nodes: number };
export type RippleGame = { board: RippleBoard; values: readonly number[]; notes: readonly (readonly number[])[]; history: readonly { values: readonly number[]; notes: readonly (readonly number[])[] }[]; helped: boolean };
export type RippleLanguage = "en" | "ja";
export type RippleMaterial = "ivory" | "wood" | "slate";
export type RipplePieces = "ink" | "tiles";
