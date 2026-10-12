import type { HitoriBoard, HitoriGame } from "./hitori.types.ts";

/** The native English or Japanese display language for Hitori.
 *
 * @example
 * ```ts
 * import type { HitoriLanguage } from "@johnmorrisdotca/kazu/hitori/play";
 *
 * const value: HitoriLanguage = "en";
 * console.log(value);
 * ```
 */
export type HitoriLanguage = "en" | "ja";
/** A supported material of the native Hitori board.
 *
 * @example
 * ```ts
 * import type { HitoriMaterial } from "@johnmorrisdotca/kazu/hitori/play";
 *
 * const value: HitoriMaterial = "ivory";
 * console.log(value);
 * ```
 */
export type HitoriMaterial = "ivory" | "wood" | "slate";
/** A supported native Hitori mark or piece appearance.
 *
 * @example
 * ```ts
 * import type { HitoriPieces } from "@johnmorrisdotca/kazu/hitori/play";
 *
 * const value: HitoriPieces = "ink";
 * console.log(value);
 * ```
 */
export type HitoriPieces = "ink" | "tiles";

/** Current Hitori marks or entries, selection, errors and native SVG appearance choices.
 *
 * @example
 * ```ts
 * import type { HitoriDrawOptions } from "@johnmorrisdotca/kazu/hitori/play";
 *
 * const value: HitoriDrawOptions = {language:"en"};
 * console.log(value);
 * ```
 */
export type HitoriDrawOptions = {
  shaded?: readonly boolean[];
  selected?: number | null;
  errors?: readonly number[];
  material?: HitoriMaterial;
  pieces?: HitoriPieces;
  language?: HitoriLanguage;
};

/** The initial Hitori board, native progress, appearance and host event callbacks.
 *
 * @example
 * ```ts
 * import type { HitoriBoard } from "@johnmorrisdotca/kazu/hitori";
 * import type { HitoriMountOptions } from "@johnmorrisdotca/kazu/hitori/play";
 *
 * const hitoriBoard: HitoriBoard = {"size":5,"numbers":[4,5,5,1,2,5,2,3,2,1,2,5,4,2,2,3,1,2,5,4,2,3,1,3,4]};
 * const value: HitoriMountOptions = {board:hitoriBoard};
 * console.log(value);
 * ```
 */
export type HitoriMountOptions = HitoriDrawOptions & {
  board: HitoriBoard;
  progress?: string;
  onChange?: (game: HitoriGame) => void;
  onFinish?: (game: HitoriGame) => void;
};

/** The mounted Hitori game and progress, native controls and cleanup handle.
 *
 * @example
 * ```ts no-run
 * import type { HitoriBoard } from "@johnmorrisdotca/kazu/hitori";
 * import type { HitoriMount } from "@johnmorrisdotca/kazu/hitori/play";
 * import { mountHitori } from "@johnmorrisdotca/kazu/hitori/play";
 *
 * const hitoriBoard: HitoriBoard = {"size":5,"numbers":[4,5,5,1,2,5,2,3,2,1,2,5,4,2,2,3,1,2,5,4,2,3,1,3,4]};
 * const host = document.createElement("div");
 * document.body.append(host);
 * const player: HitoriMount = mountHitori(host,{board:hitoriBoard});
 * console.log(player.progress());
 * player.destroy();
 * ```
 */
export type HitoriMount = {
  game: () => HitoriGame;
  progress: () => string;
  restart: () => void;
  set: (options: HitoriDrawOptions) => void;
  destroy: () => void;
};
