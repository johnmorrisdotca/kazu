import type { ShikakuBoard, ShikakuGame } from "./shikaku.types.ts";
export type ShikakuMaterial = "ivory" | "wood" | "slate";
export type ShikakuPieces = "ink" | "tiles";
export type ShikakuLanguage = "en" | "ja";
export type ShikakuDrawOptions = { rectangles?: ShikakuGame["rectangles"]; selected?: number | null; anchor?: number | null; errors?: readonly number[]; material?: ShikakuMaterial; pieces?: ShikakuPieces; language?: ShikakuLanguage };
export type ShikakuMountOptions = ShikakuDrawOptions & { board: ShikakuBoard; progress?: string; onChange?: (game: ShikakuGame) => void; onFinish?: (game: ShikakuGame) => void };
export type ShikakuMount = { game: () => ShikakuGame; progress: () => string; set: (options: ShikakuDrawOptions) => void; restart: () => void; destroy: () => void };
