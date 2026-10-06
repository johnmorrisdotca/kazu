import type { KakuroBoard, KakuroGame, KakuroLanguage, KakuroMaterial, KakuroPieces } from "./kakuro.types.ts";
import type { KakuroDrawOptions } from "./kakuro-draw.ts";
export type KakuroMountOptions = KakuroDrawOptions & { board: KakuroBoard; language?: KakuroLanguage; progress?: string; onChange?: (game: KakuroGame) => void; onFinish?: (game: KakuroGame) => void; material?: KakuroMaterial; pieces?: KakuroPieces };
export type KakuroMount = { game: () => KakuroGame; progress: () => string; set: (options: KakuroDrawOptions & { language?: KakuroLanguage }) => void; restart: () => void; destroy: () => void };
