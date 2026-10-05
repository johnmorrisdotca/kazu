export type FillominoBoard = {
  width: number;
  height: number;
  givens: readonly number[];
};

export type FillominoPuzzle = FillominoBoard & {
  seed: number;
  level: FillominoLevel;
  solution: readonly number[];
};

export type FillominoLevel = "easy" | "medium" | "hard";
export type FillominoCheck = {
  ok: boolean;
  complete: boolean;
  filled: number;
  regions: number;
  errors: readonly number[];
};
export type FillominoSolve = {
  count: number;
  solution: readonly number[] | null;
  complete: boolean;
  nodes: number;
};
export type FillominoGame = {
  board: FillominoBoard;
  entries: readonly number[];
  history: readonly (readonly number[])[];
  helped: boolean;
};
