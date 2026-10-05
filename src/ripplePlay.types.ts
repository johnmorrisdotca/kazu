import type { RippleBoard, RippleGame, RippleLanguage, RippleMaterial, RipplePieces } from "./ripple.types.ts";
export type RippleDrawOptions = { values?: readonly number[]; notes?: readonly (readonly number[])[]; errors?: readonly number[]; selected?: number | null; material?: RippleMaterial; pieces?: RipplePieces; language?: RippleLanguage };
export type RippleMountOptions = RippleDrawOptions & { board: RippleBoard; progress?: string; onChange?: (game: RippleGame) => void; onFinish?: (game: RippleGame) => void };
export type RippleMount = { game: () => RippleGame; progress: () => string; set: (options: RippleDrawOptions) => void; restart: () => void; destroy: () => void };
