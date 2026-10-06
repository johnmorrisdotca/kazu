import type { HitoriBoard, HitoriGame } from "./hitori.types.ts";

export type HitoriLanguage = "en" | "ja";
export type HitoriMaterial = "ivory" | "wood" | "slate";
export type HitoriPieces = "ink" | "tiles";

export type HitoriDrawOptions = {
  shaded?: readonly boolean[];
  selected?: number | null;
  errors?: readonly number[];
  material?: HitoriMaterial;
  pieces?: HitoriPieces;
  language?: HitoriLanguage;
};

export type HitoriMountOptions = HitoriDrawOptions & {
  board: HitoriBoard;
  progress?: string;
  onChange?: (game: HitoriGame) => void;
  onFinish?: (game: HitoriGame) => void;
};

export type HitoriMount = {
  game: () => HitoriGame;
  progress: () => string;
  restart: () => void;
  set: (options: HitoriDrawOptions) => void;
  destroy: () => void;
};
