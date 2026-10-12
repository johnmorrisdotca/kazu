import type { NurikabeBoard, NurikabeGame } from "./nurikabe.types.ts";

/** The native English or Japanese display language for Nurikabe.
 *
 * @example
 * ```ts
 * import type { NurikabeLanguage } from "@johnmorrisdotca/kazu/nurikabe/play";
 *
 * const value: NurikabeLanguage = "en";
 * console.log(value);
 * ```
 */
export type NurikabeLanguage = "en" | "ja";
/** A supported material of the native Nurikabe board.
 *
 * @example
 * ```ts
 * import type { NurikabeMaterial } from "@johnmorrisdotca/kazu/nurikabe/play";
 *
 * const value: NurikabeMaterial = "ivory";
 * console.log(value);
 * ```
 */
export type NurikabeMaterial = "ivory" | "wood" | "slate";
/** A supported native Nurikabe mark or piece appearance.
 *
 * @example
 * ```ts
 * import type { NurikabePieces } from "@johnmorrisdotca/kazu/nurikabe/play";
 *
 * const value: NurikabePieces = "ink";
 * console.log(value);
 * ```
 */
export type NurikabePieces = "ink" | "tiles";

/** Current Nurikabe marks or entries, selection, errors and native SVG appearance choices.
 *
 * @example
 * ```ts
 * import type { NurikabeDrawOptions } from "@johnmorrisdotca/kazu/nurikabe/play";
 *
 * const value: NurikabeDrawOptions = {language:"en"};
 * console.log(value);
 * ```
 */
export type NurikabeDrawOptions = {
  sea?: readonly boolean[];
  selected?: number | null;
  errors?: readonly number[];
  material?: NurikabeMaterial;
  pieces?: NurikabePieces;
  language?: NurikabeLanguage;
};

/** The initial Nurikabe board, native progress, appearance and host event callbacks.
 *
 * @example
 * ```ts
 * import type { NurikabeBoard } from "@johnmorrisdotca/kazu/nurikabe";
 * import type { NurikabeMountOptions } from "@johnmorrisdotca/kazu/nurikabe/play";
 *
 * const nurikabeBoard: NurikabeBoard = {"size":5,"clues":[1,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,2,0,0,3,0,0]};
 * const value: NurikabeMountOptions = {board:nurikabeBoard};
 * console.log(value);
 * ```
 */
export type NurikabeMountOptions = NurikabeDrawOptions & {
  board: NurikabeBoard;
  progress?: string;
  onChange?: (game: NurikabeGame) => void;
  onFinish?: (game: NurikabeGame) => void;
};

/** The mounted Nurikabe game and progress, native controls and cleanup handle.
 *
 * @example
 * ```ts no-run
 * import type { NurikabeBoard } from "@johnmorrisdotca/kazu/nurikabe";
 * import type { NurikabeMount } from "@johnmorrisdotca/kazu/nurikabe/play";
 * import { mountNurikabe } from "@johnmorrisdotca/kazu/nurikabe/play";
 *
 * const nurikabeBoard: NurikabeBoard = {"size":5,"clues":[1,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,2,0,0,3,0,0]};
 * const host = document.createElement("div");
 * document.body.append(host);
 * const player: NurikabeMount = mountNurikabe(host,{board:nurikabeBoard});
 * console.log(player.progress());
 * player.destroy();
 * ```
 */
export type NurikabeMount = {
  game: () => NurikabeGame;
  progress: () => string;
  restart: () => void;
  set: (options: NurikabeDrawOptions) => void;
  destroy: () => void;
};
