export type HitoriBoard = {
  size: 5 | 7;
  numbers: readonly number[];
};

export type HitoriPuzzle = HitoriBoard & {
  seed: number;
  solution: readonly boolean[];
};

export type HitoriSolve = {
  count: number;
  solution: readonly boolean[] | null;
  complete: boolean;
  nodes: number;
};

export type HitoriGame = {
  board: HitoriBoard;
  shaded: readonly boolean[];
  history: readonly (readonly boolean[])[];
  helped: boolean;
};
