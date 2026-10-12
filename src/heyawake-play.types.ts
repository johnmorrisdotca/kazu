import type { HeyawakeGame, HeyawakeBoard } from "./heyawake.types.ts";

/** Language, material and marks for a native Heyawake board.
 *
 * @example
 * ```ts
 * import type { HeyawakeAppearance } from "@johnmorrisdotca/kazu/heyawake";
 *
 * const value: HeyawakeAppearance = {language:"en",material:"ivory",pieces:"ink"};
 * console.log(value);
 * ```
 */
export type HeyawakeAppearance = { language?: "en" | "ja"; material?: "ivory" | "wood" | "slate"; pieces?: "ink" | "tiles" };
/** The initial Heyawake board, native progress, appearance and host event callbacks.
 *
 * @example
 * ```ts
 * import type { HeyawakeBoard, HeyawakeMountOptions } from "@johnmorrisdotca/kazu/heyawake";
 *
 * const heyawakeBoard: HeyawakeBoard = {"width":5,"height":5,"rooms":[{"x":0,"y":0,"width":1,"height":1,"blacks":0},{"x":0,"y":1,"width":1,"height":2,"blacks":0},{"x":0,"y":3,"width":1,"height":2,"blacks":1},{"x":1,"y":0,"width":1,"height":4,"blacks":1},{"x":1,"y":4,"width":1,"height":1,"blacks":0},{"x":2,"y":0,"width":3,"height":5,"blacks":3}]};
 * const value: HeyawakeMountOptions = {board:heyawakeBoard};
 * console.log(value);
 * ```
 */
export type HeyawakeMountOptions = HeyawakeAppearance & { board: HeyawakeBoard; progress?: string; onChange?: (game: HeyawakeGame) => void; onFinish?: (game: HeyawakeGame) => void };
/** Current Heyawake marks or entries, selection, errors and native SVG appearance choices.
 *
 * @example
 * ```ts
 * import type { HeyawakeDrawOptions } from "@johnmorrisdotca/kazu/heyawake";
 *
 * const value: HeyawakeDrawOptions = {language:"en"};
 * console.log(value);
 * ```
 */
export type HeyawakeDrawOptions = HeyawakeAppearance & { entries?: readonly (boolean | null)[]; selected?: number; errors?: readonly number[] };
/** The mounted Heyawake game and progress, native controls and cleanup handle.
 *
 * @example
 * ```ts no-run
 * import type { HeyawakeBoard, HeyawakeMount } from "@johnmorrisdotca/kazu/heyawake";
 * import { mountHeyawake } from "@johnmorrisdotca/kazu/heyawake";
 *
 * const heyawakeBoard: HeyawakeBoard = {"width":5,"height":5,"rooms":[{"x":0,"y":0,"width":1,"height":1,"blacks":0},{"x":0,"y":1,"width":1,"height":2,"blacks":0},{"x":0,"y":3,"width":1,"height":2,"blacks":1},{"x":1,"y":0,"width":1,"height":4,"blacks":1},{"x":1,"y":4,"width":1,"height":1,"blacks":0},{"x":2,"y":0,"width":3,"height":5,"blacks":3}]};
 * const host = document.createElement("div");
 * document.body.append(host);
 * const player: HeyawakeMount = mountHeyawake(host,{board:heyawakeBoard});
 * console.log(player.progress());
 * player.destroy();
 * ```
 */
export type HeyawakeMount = { game: () => HeyawakeGame; progress: () => string; restart: () => void; set: (options: HeyawakeAppearance) => void; destroy: () => void };
