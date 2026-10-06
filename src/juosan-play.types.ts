import type { JuosanBoard, JuosanGame } from "./juosan.types.ts";
export type JuosanMaterial = "ivory" | "wood" | "slate";
export type JuosanPieces = "ink" | "tiles";
export type JuosanLanguage = "en" | "ja";
export type JuosanDrawOptions = { marks?: JuosanGame["marks"]; selected?: number | null; material?: JuosanMaterial; pieces?: JuosanPieces; language?: JuosanLanguage };
export type JuosanMountOptions = JuosanDrawOptions & { board: JuosanBoard; progress?: string; onChange?: (game: JuosanGame) => void; onFinish?: (game: JuosanGame) => void };
export type JuosanMount = { game: () => JuosanGame; progress: () => string; set: (options: JuosanDrawOptions) => void; restart: () => void; destroy: () => void };
