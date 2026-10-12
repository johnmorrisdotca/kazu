import type { JuosanBoard, JuosanGame } from "./juosan.types.ts";
/** A supported material of the native Juosan board.
 *
 * @example
 * ```ts
 * import type { JuosanMaterial } from "@johnmorrisdotca/kazu/juosan";
 *
 * const value: JuosanMaterial = "ivory";
 * console.log(value);
 * ```
 */
export type JuosanMaterial = "ivory" | "wood" | "slate";
/** A supported native Juosan mark or piece appearance.
 *
 * @example
 * ```ts
 * import type { JuosanPieces } from "@johnmorrisdotca/kazu/juosan";
 *
 * const value: JuosanPieces = "ink";
 * console.log(value);
 * ```
 */
export type JuosanPieces = "ink" | "tiles";
/** The native English or Japanese display language for Juosan.
 *
 * @example
 * ```ts
 * import type { JuosanLanguage } from "@johnmorrisdotca/kazu/juosan";
 *
 * const value: JuosanLanguage = "en";
 * console.log(value);
 * ```
 */
export type JuosanLanguage = "en" | "ja";
/** Current Juosan marks or entries, selection, errors and native SVG appearance choices.
 *
 * @example
 * ```ts
 * import type { JuosanDrawOptions } from "@johnmorrisdotca/kazu/juosan";
 *
 * const value: JuosanDrawOptions = {language:"en"};
 * console.log(value);
 * ```
 */
export type JuosanDrawOptions = { marks?: JuosanGame["marks"]; selected?: number | null; material?: JuosanMaterial; pieces?: JuosanPieces; language?: JuosanLanguage };
/** The initial Juosan board, native progress, appearance and host event callbacks.
 *
 * @example
 * ```ts
 * import type { JuosanBoard, JuosanMountOptions } from "@johnmorrisdotca/kazu/juosan";
 *
 * const juosanBoard: JuosanBoard = {"width":3,"height":2,"territories":[{"cells":[0,1,2],"difference":3},{"cells":[3,4,5],"difference":3}]};
 * const value: JuosanMountOptions = {board:juosanBoard};
 * console.log(value);
 * ```
 */
export type JuosanMountOptions = JuosanDrawOptions & { board: JuosanBoard; progress?: string; onChange?: (game: JuosanGame) => void; onFinish?: (game: JuosanGame) => void };
/** The mounted Juosan game and progress, native controls and cleanup handle.
 *
 * @example
 * ```ts no-run
 * import type { JuosanBoard, JuosanMount } from "@johnmorrisdotca/kazu/juosan";
 * import { mountJuosan } from "@johnmorrisdotca/kazu/juosan";
 *
 * const juosanBoard: JuosanBoard = {"width":3,"height":2,"territories":[{"cells":[0,1,2],"difference":3},{"cells":[3,4,5],"difference":3}]};
 * const host = document.createElement("div");
 * document.body.append(host);
 * const player: JuosanMount = mountJuosan(host,{board:juosanBoard});
 * console.log(player.progress());
 * player.destroy();
 * ```
 */
export type JuosanMount = { game: () => JuosanGame; progress: () => string; set: (options: JuosanDrawOptions) => void; restart: () => void; destroy: () => void };
