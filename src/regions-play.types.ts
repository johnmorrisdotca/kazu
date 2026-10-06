import type { RegionsBoard, RegionsGame } from "./regions.types.ts";

export type RegionsLanguage = "en" | "ja";
export type RegionsMaterial = "ivory" | "wood" | "slate";
export type RegionsPieces = "ink" | "tiles";
export type RegionsDrawOptions = {
  entries?: readonly number[];
  errors?: readonly number[];
  selected?: number | null;
  material?: RegionsMaterial;
  pieces?: RegionsPieces;
  language?: RegionsLanguage;
};
export type RegionsMountOptions = RegionsDrawOptions & {
  board: RegionsBoard;
  progress?: string;
  onChange?: (game: RegionsGame) => void;
  onFinish?: (game: RegionsGame) => void;
};
export type RegionsMount = {
  game: () => RegionsGame;
  progress: () => string;
  set: (options: RegionsDrawOptions) => void;
  restart: () => void;
  destroy: () => void;
};
