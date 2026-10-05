import type { HeyawakeGame, HeyawakeBoard } from "./heyawake.types.ts";

export type HeyawakeAppearance = { language?: "en" | "ja"; material?: "ivory" | "wood" | "slate"; pieces?: "ink" | "tiles" };
export type HeyawakeMountOptions = HeyawakeAppearance & { board: HeyawakeBoard; progress?: string; onChange?: (game: HeyawakeGame) => void; onFinish?: (game: HeyawakeGame) => void };
export type HeyawakeDrawOptions = HeyawakeAppearance & { entries?: readonly (boolean | null)[]; selected?: number; errors?: readonly number[] };
export type HeyawakeMount = { game: () => HeyawakeGame; progress: () => string; restart: () => void; set: (options: HeyawakeAppearance) => void; destroy: () => void };
