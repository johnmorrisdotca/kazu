import type { AkariBoard, AkariGame } from "./akari.types.ts";
export type AkariMaterial = "ivory" | "wood" | "slate";
export type AkariPieces = "ink" | "tiles";
export type AkariLanguage = "en" | "ja";
export type AkariDrawOptions = { bulbs?: AkariGame["bulbs"]; selected?: number | null; errors?: readonly number[]; material?: AkariMaterial; pieces?: AkariPieces; language?: AkariLanguage };
export type AkariMountOptions = AkariDrawOptions & { board: AkariBoard; progress?: string; onChange?: (game: AkariGame) => void; onFinish?: (game: AkariGame) => void };
export type AkariMount = { game: () => AkariGame; progress: () => string; set: (options: AkariDrawOptions) => void; restart: () => void; destroy: () => void };
