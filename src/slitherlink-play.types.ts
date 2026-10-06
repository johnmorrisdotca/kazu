import type { SlitherlinkBoard, SlitherlinkGame } from "./slitherlink.types.ts";

export type SlitherlinkLanguage = "en" | "ja";
export type SlitherlinkMaterial = "ivory" | "wood" | "slate";
export type SlitherlinkDrawOptions = {
  edges?: SlitherlinkGame["edges"];
  selected?: number | null;
  errors?: readonly number[];
  material?: SlitherlinkMaterial;
  language?: SlitherlinkLanguage;
};
export type SlitherlinkMountOptions = SlitherlinkDrawOptions & {
  board: SlitherlinkBoard;
  progress?: string;
  onChange?: (game: SlitherlinkGame) => void;
  onFinish?: (game: SlitherlinkGame) => void;
};
export type SlitherlinkMount = {
  game: () => SlitherlinkGame;
  progress: () => string;
  set: (options: SlitherlinkDrawOptions) => void;
  restart: () => void;
  destroy: () => void;
};
