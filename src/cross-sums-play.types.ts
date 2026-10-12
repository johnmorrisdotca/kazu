import type { CrossSumsBoard, CrossSumsGame, CrossSumsLanguage, CrossSumsMaterial, CrossSumsPieces } from "./cross-sums.types.ts";
import type { CrossSumsDrawOptions } from "./cross-sums-draw.ts";
/** The initial CrossSums board, native progress, appearance and host event callbacks.
 *
 * @example
 * ```ts
 * import type { CrossSumsBoard, CrossSumsMountOptions } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * const crossSumsBoard: CrossSumsBoard = {"width":5,"height":5,"cells":[{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":10},{"kind":"black","across":null,"down":7},{"kind":"black","across":null,"down":12},{"kind":"black","across":null,"down":null},{"kind":"black","across":6,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":23,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null}]};
 * const value: CrossSumsMountOptions = {board:crossSumsBoard};
 * console.log(value);
 * ```
 */
export type CrossSumsMountOptions = CrossSumsDrawOptions & { board: CrossSumsBoard; language?: CrossSumsLanguage; progress?: string; onChange?: (game: CrossSumsGame) => void; onFinish?: (game: CrossSumsGame) => void; material?: CrossSumsMaterial; pieces?: CrossSumsPieces };
/** The mounted CrossSums game and progress, native controls and cleanup handle.
 *
 * @example
 * ```ts no-run
 * import type { CrossSumsBoard, CrossSumsMount } from "@johnmorrisdotca/kazu/cross-sums";
 * import { mountCrossSums } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * const crossSumsBoard: CrossSumsBoard = {"width":5,"height":5,"cells":[{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":10},{"kind":"black","across":null,"down":7},{"kind":"black","across":null,"down":12},{"kind":"black","across":null,"down":null},{"kind":"black","across":6,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":23,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null}]};
 * const host = document.createElement("div");
 * document.body.append(host);
 * const player: CrossSumsMount = mountCrossSums(host,{board:crossSumsBoard});
 * console.log(player.progress());
 * player.destroy();
 * ```
 */
export type CrossSumsMount = { game: () => CrossSumsGame; progress: () => string; set: (options: CrossSumsDrawOptions & { language?: CrossSumsLanguage }) => void; restart: () => void; destroy: () => void };
