import type { CrossSumsBoard, CrossSumsGame, CrossSumsLanguage, CrossSumsMaterial, CrossSumsPieces } from "./cross-sums.types.ts";
import type { CrossSumsDrawOptions } from "./cross-sums-draw.ts";
export type CrossSumsMountOptions = CrossSumsDrawOptions & { board: CrossSumsBoard; language?: CrossSumsLanguage; progress?: string; onChange?: (game: CrossSumsGame) => void; onFinish?: (game: CrossSumsGame) => void; material?: CrossSumsMaterial; pieces?: CrossSumsPieces };
export type CrossSumsMount = { game: () => CrossSumsGame; progress: () => string; set: (options: CrossSumsDrawOptions & { language?: CrossSumsLanguage }) => void; restart: () => void; destroy: () => void };
