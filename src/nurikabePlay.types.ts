import type { NurikabeBoard, NurikabeGame } from "./nurikabe.types.ts";

export type NurikabeLanguage = "en" | "ja";
export type NurikabeMaterial = "ivory" | "wood" | "slate";
export type NurikabePieces = "ink" | "tiles";

export type NurikabeDrawOptions = {
  sea?: readonly boolean[];
  selected?: number | null;
  errors?: readonly number[];
  material?: NurikabeMaterial;
  pieces?: NurikabePieces;
  language?: NurikabeLanguage;
};

export type NurikabeMountOptions = NurikabeDrawOptions & {
  board: NurikabeBoard;
  progress?: string;
  onChange?: (game: NurikabeGame) => void;
  onFinish?: (game: NurikabeGame) => void;
};

export type NurikabeMount = {
  game: () => NurikabeGame;
  progress: () => string;
  restart: () => void;
  set: (options: NurikabeDrawOptions) => void;
  destroy: () => void;
};
