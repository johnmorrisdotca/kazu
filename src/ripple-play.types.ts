import type { RippleBoard, RippleGame, RippleLanguage, RippleMaterial, RipplePieces } from "./ripple.types.ts";
/** Current Ripple marks or entries, selection, errors and native SVG appearance choices.
 *
 * @example
 * ```ts
 * import type { RippleDrawOptions } from "@johnmorrisdotca/kazu/ripple";
 *
 * const value: RippleDrawOptions = {language:"en"};
 * console.log(value);
 * ```
 */
export type RippleDrawOptions = { values?: readonly number[]; notes?: readonly (readonly number[])[]; errors?: readonly number[]; selected?: number | null; material?: RippleMaterial; pieces?: RipplePieces; language?: RippleLanguage };
/** The initial Ripple board, native progress, appearance and host event callbacks.
 *
 * @example
 * ```ts
 * import type { RippleBoard, RippleMountOptions } from "@johnmorrisdotca/kazu/ripple";
 *
 * const rippleBoard: RippleBoard = {"width":9,"height":9,"rooms":[0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8],"clues":[4,null,7,9,2,null,5,null,3,null,null,3,6,7,4,8,9,2,8,null,2,1,3,null,null,null,null,7,null,1,null,6,null,null,null,9,3,8,null,5,1,7,null,null,6,2,4,6,null,9,3,7,5,1,1,null,8,null,5,null,9,2,4,null,2,null,null,null,null,null,null,null,6,null,null,2,4,null,null,3,null]};
 * const value: RippleMountOptions = {board:rippleBoard};
 * console.log(value);
 * ```
 */
export type RippleMountOptions = RippleDrawOptions & { board: RippleBoard; progress?: string; onChange?: (game: RippleGame) => void; onFinish?: (game: RippleGame) => void };
/** The mounted Ripple game and progress, native controls and cleanup handle.
 *
 * @example
 * ```ts no-run
 * import type { RippleBoard, RippleMount } from "@johnmorrisdotca/kazu/ripple";
 * import { mountRipple } from "@johnmorrisdotca/kazu/ripple";
 *
 * const rippleBoard: RippleBoard = {"width":9,"height":9,"rooms":[0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8],"clues":[4,null,7,9,2,null,5,null,3,null,null,3,6,7,4,8,9,2,8,null,2,1,3,null,null,null,null,7,null,1,null,6,null,null,null,9,3,8,null,5,1,7,null,null,6,2,4,6,null,9,3,7,5,1,1,null,8,null,5,null,9,2,4,null,2,null,null,null,null,null,null,null,6,null,null,2,4,null,null,3,null]};
 * const host = document.createElement("div");
 * document.body.append(host);
 * const player: RippleMount = mountRipple(host,{board:rippleBoard});
 * console.log(player.progress());
 * player.destroy();
 * ```
 */
export type RippleMount = { game: () => RippleGame; progress: () => string; set: (options: RippleDrawOptions) => void; restart: () => void; destroy: () => void };
