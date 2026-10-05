export type NurikabeBoard = {
  size: 5;
  clues: readonly number[];
};

export type NurikabePuzzle = NurikabeBoard & {
  seed: number;
  solution: readonly boolean[];
};

export type NurikabeSolve = {
  count: number;
  solution: readonly boolean[] | null;
  complete: boolean;
  nodes: number;
};

export type NurikabeGame = {
  board: NurikabeBoard;
  sea: readonly boolean[];
  history: readonly (readonly boolean[])[];
  helped: boolean;
};
