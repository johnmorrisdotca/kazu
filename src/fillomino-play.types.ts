import type { FillominoBoard, FillominoGame } from "./fillomino.types.ts";

export type FillominoLanguage = "en" | "ja";
export type FillominoMaterial = "ivory" | "wood" | "slate";
export type FillominoPieces = "ink" | "tiles";
export type FillominoDrawOptions = {
  entries?: readonly number[];
  errors?: readonly number[];
  selected?: number | null;
  material?: FillominoMaterial;
  pieces?: FillominoPieces;
  language?: FillominoLanguage;
};
export type FillominoMountOptions = FillominoDrawOptions & {
  board: FillominoBoard;
  progress?: string;
  onChange?: (game: FillominoGame) => void;
  onFinish?: (game: FillominoGame) => void;
};
export type FillominoMount = {
  game: () => FillominoGame;
  progress: () => string;
  set: (options: FillominoDrawOptions) => void;
  restart: () => void;
  destroy: () => void;
};
