import type { AkariBoard, AkariGame } from "./akari.types.ts";
/** A supported material of the native Akari board.
 *
 * @example
 * ```ts
 * import type { AkariMaterial } from "@johnmorrisdotca/kazu/akari";
 *
 * const value: AkariMaterial = "ivory";
 * console.log(value);
 * ```
 */
export type AkariMaterial = "ivory" | "wood" | "slate";
/** A supported native Akari mark or piece appearance.
 *
 * @example
 * ```ts
 * import type { AkariPieces } from "@johnmorrisdotca/kazu/akari";
 *
 * const value: AkariPieces = "ink";
 * console.log(value);
 * ```
 */
export type AkariPieces = "ink" | "tiles";
/** The native English or Japanese display language for Akari.
 *
 * @example
 * ```ts
 * import type { AkariLanguage } from "@johnmorrisdotca/kazu/akari";
 *
 * const value: AkariLanguage = "en";
 * console.log(value);
 * ```
 */
export type AkariLanguage = "en" | "ja";
/** Current Akari marks or entries, selection, errors and native SVG appearance choices.
 *
 * @example
 * ```ts
 * import type { AkariDrawOptions } from "@johnmorrisdotca/kazu/akari";
 *
 * const value: AkariDrawOptions = {language:"en"};
 * console.log(value);
 * ```
 */
export type AkariDrawOptions = { bulbs?: AkariGame["bulbs"]; selected?: number | null; errors?: readonly number[]; material?: AkariMaterial; pieces?: AkariPieces; language?: AkariLanguage };
/** The initial Akari board, native progress, appearance and host event callbacks.
 *
 * @example
 * ```ts
 * import type { AkariBoard, AkariMountOptions } from "@johnmorrisdotca/kazu/akari";
 *
 * const akariBoard: AkariBoard = {"width":5,"height":5,"cells":[1,null,null,null,null,0,null,null,null,0,1,0,null,null,null,null,false,null,null,null,null,false,null,null,2]};
 * const value: AkariMountOptions = {board:akariBoard};
 * console.log(value);
 * ```
 */
export type AkariMountOptions = AkariDrawOptions & { board: AkariBoard; progress?: string; onChange?: (game: AkariGame) => void; onFinish?: (game: AkariGame) => void };
/** The mounted Akari game and progress, native controls and cleanup handle.
 *
 * @example
 * ```ts no-run
 * import type { AkariBoard, AkariMount } from "@johnmorrisdotca/kazu/akari";
 * import { mountAkari } from "@johnmorrisdotca/kazu/akari";
 *
 * const akariBoard: AkariBoard = {"width":5,"height":5,"cells":[1,null,null,null,null,0,null,null,null,0,1,0,null,null,null,null,false,null,null,null,null,false,null,null,2]};
 * const host = document.createElement("div");
 * document.body.append(host);
 * const player: AkariMount = mountAkari(host,{board:akariBoard});
 * console.log(player.progress());
 * player.destroy();
 * ```
 */
export type AkariMount = { game: () => AkariGame; progress: () => string; set: (options: AkariDrawOptions) => void; restart: () => void; destroy: () => void };
