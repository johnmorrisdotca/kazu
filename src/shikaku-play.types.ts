import type { ShikakuBoard, ShikakuGame } from "./shikaku.types.ts";
/** A supported material of the native Shikaku board.
 *
 * @example
 * ```ts
 * import type { ShikakuMaterial } from "@johnmorrisdotca/kazu/play";
 *
 * const value: ShikakuMaterial = "ivory";
 * console.log(value);
 * ```
 */
export type ShikakuMaterial = "ivory" | "wood" | "slate";
/** A supported native Shikaku mark or piece appearance.
 *
 * @example
 * ```ts
 * import type { ShikakuPieces } from "@johnmorrisdotca/kazu/play";
 *
 * const value: ShikakuPieces = "ink";
 * console.log(value);
 * ```
 */
export type ShikakuPieces = "ink" | "tiles";
/** The native English or Japanese display language for Shikaku.
 *
 * @example
 * ```ts
 * import type { ShikakuLanguage } from "@johnmorrisdotca/kazu/play";
 *
 * const value: ShikakuLanguage = "en";
 * console.log(value);
 * ```
 */
export type ShikakuLanguage = "en" | "ja";
/** Current Shikaku marks or entries, selection, errors and native SVG appearance choices.
 *
 * @example
 * ```ts
 * import type { ShikakuDrawOptions } from "@johnmorrisdotca/kazu/draw";
 *
 * const value: ShikakuDrawOptions = {language:"en"};
 * console.log(value);
 * ```
 */
export type ShikakuDrawOptions = { rectangles?: ShikakuGame["rectangles"]; selected?: number | null; anchor?: number | null; errors?: readonly number[]; material?: ShikakuMaterial; pieces?: ShikakuPieces; language?: ShikakuLanguage };
/** The initial Shikaku board, native progress, appearance and host event callbacks.
 *
 * @example
 * ```ts
 * import type { ShikakuBoard } from "@johnmorrisdotca/kazu/shikaku";
 * import type { ShikakuMountOptions } from "@johnmorrisdotca/kazu/play";
 *
 * const shikakuBoard: ShikakuBoard = {"width":5,"height":5,"clues":[3,0,0,0,2,0,0,0,0,4,0,0,0,0,0,0,0,0,0,3,4,3,6,0,0]};
 * const value: ShikakuMountOptions = {board:shikakuBoard};
 * console.log(value);
 * ```
 */
export type ShikakuMountOptions = ShikakuDrawOptions & { board: ShikakuBoard; progress?: string; onChange?: (game: ShikakuGame) => void; onFinish?: (game: ShikakuGame) => void };
/** The mounted Shikaku game and progress, native controls and cleanup handle.
 *
 * @example
 * ```ts no-run
 * import type { ShikakuBoard } from "@johnmorrisdotca/kazu/shikaku";
 * import type { ShikakuMount } from "@johnmorrisdotca/kazu/play";
 * import { mountShikaku } from "@johnmorrisdotca/kazu/play";
 *
 * const shikakuBoard: ShikakuBoard = {"width":5,"height":5,"clues":[3,0,0,0,2,0,0,0,0,4,0,0,0,0,0,0,0,0,0,3,4,3,6,0,0]};
 * const host = document.createElement("div");
 * document.body.append(host);
 * const player: ShikakuMount = mountShikaku(host,{board:shikakuBoard});
 * console.log(player.progress());
 * player.destroy();
 * ```
 */
export type ShikakuMount = { game: () => ShikakuGame; progress: () => string; set: (options: ShikakuDrawOptions) => void; restart: () => void; destroy: () => void };
