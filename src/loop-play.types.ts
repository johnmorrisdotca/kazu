import type { LoopBoard, LoopGame } from "./loop.types.ts";

export type LoopLanguage = "en" | "ja";
export type LoopMaterial = "ivory" | "wood" | "slate";
export type LoopDrawOptions = {
  edges?: LoopGame["edges"];
  selected?: number | null;
  errors?: readonly number[];
  material?: LoopMaterial;
  language?: LoopLanguage;
};
export type LoopMountOptions = LoopDrawOptions & {
  board: LoopBoard;
  progress?: string;
  onChange?: (game: LoopGame) => void;
  onFinish?: (game: LoopGame) => void;
};
export type LoopMount = {
  game: () => LoopGame;
  progress: () => string;
  set: (options: LoopDrawOptions) => void;
  restart: () => void;
  destroy: () => void;
};
