import type { RegionsBoard, RegionsGame } from "./regions.types.ts";

/** The native English or Japanese display language for Regions.
 *
 * @example
 * ```ts
 * import type { RegionsLanguage } from "@johnmorrisdotca/kazu/regions/play";
 *
 * const value: RegionsLanguage = "en";
 * console.log(value);
 * ```
 */
export type RegionsLanguage = "en" | "ja";
/** A supported material of the native Regions board.
 *
 * @example
 * ```ts
 * import type { RegionsMaterial } from "@johnmorrisdotca/kazu/regions/play";
 *
 * const value: RegionsMaterial = "ivory";
 * console.log(value);
 * ```
 */
export type RegionsMaterial = "ivory" | "wood" | "slate";
/** A supported native Regions mark or piece appearance.
 *
 * @example
 * ```ts
 * import type { RegionsPieces } from "@johnmorrisdotca/kazu/regions/play";
 *
 * const value: RegionsPieces = "ink";
 * console.log(value);
 * ```
 */
export type RegionsPieces = "ink" | "tiles";
/** Current Regions marks or entries, selection, errors and native SVG appearance choices.
 *
 * @example
 * ```ts
 * import type { RegionsDrawOptions } from "@johnmorrisdotca/kazu/regions";
 *
 * const value: RegionsDrawOptions = {language:"en"};
 * console.log(value);
 * ```
 */
export type RegionsDrawOptions = {
  entries?: readonly number[];
  errors?: readonly number[];
  selected?: number | null;
  material?: RegionsMaterial;
  pieces?: RegionsPieces;
  language?: RegionsLanguage;
};
/** The initial Regions board, native progress, appearance and host event callbacks.
 *
 * @example
 * ```ts
 * import type { RegionsBoard } from "@johnmorrisdotca/kazu/regions";
 * import type { RegionsMountOptions } from "@johnmorrisdotca/kazu/regions/play";
 *
 * const regionsBoard: RegionsBoard = {"width":5,"height":5,"givens":[0,0,2,0,3,2,0,3,0,0,0,3,0,0,1,3,1,0,1,2,3,3,4,0,0]};
 * const value: RegionsMountOptions = {board:regionsBoard};
 * console.log(value);
 * ```
 */
export type RegionsMountOptions = RegionsDrawOptions & {
  board: RegionsBoard;
  progress?: string;
  onChange?: (game: RegionsGame) => void;
  onFinish?: (game: RegionsGame) => void;
};
/** The mounted Regions game and progress, native controls and cleanup handle.
 *
 * @example
 * ```ts no-run
 * import type { RegionsBoard } from "@johnmorrisdotca/kazu/regions";
 * import type { RegionsMount } from "@johnmorrisdotca/kazu/regions/play";
 * import { mountRegions } from "@johnmorrisdotca/kazu/regions/play";
 *
 * const regionsBoard: RegionsBoard = {"width":5,"height":5,"givens":[0,0,2,0,3,2,0,3,0,0,0,3,0,0,1,3,1,0,1,2,3,3,4,0,0]};
 * const host = document.createElement("div");
 * document.body.append(host);
 * const player: RegionsMount = mountRegions(host,{board:regionsBoard});
 * console.log(player.progress());
 * player.destroy();
 * ```
 */
export type RegionsMount = {
  game: () => RegionsGame;
  progress: () => string;
  set: (options: RegionsDrawOptions) => void;
  restart: () => void;
  destroy: () => void;
};
