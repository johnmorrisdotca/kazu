import type { LoopBoard, LoopGame } from "./loop.types.ts";

/** The native English or Japanese display language for Loop.
 *
 * @example
 * ```ts
 * import type { LoopLanguage } from "@johnmorrisdotca/kazu/loop";
 *
 * const value: LoopLanguage = "en";
 * console.log(value);
 * ```
 */
export type LoopLanguage = "en" | "ja";
/** A supported material of the native Loop board.
 *
 * @example
 * ```ts
 * import type { LoopMaterial } from "@johnmorrisdotca/kazu/loop";
 *
 * const value: LoopMaterial = "ivory";
 * console.log(value);
 * ```
 */
export type LoopMaterial = "ivory" | "wood" | "slate";
/** Current Loop marks or entries, selection, errors and native SVG appearance choices.
 *
 * @example
 * ```ts
 * import type { LoopDrawOptions } from "@johnmorrisdotca/kazu/loop";
 *
 * const value: LoopDrawOptions = {language:"en"};
 * console.log(value);
 * ```
 */
export type LoopDrawOptions = {
  edges?: LoopGame["edges"];
  selected?: number | null;
  errors?: readonly number[];
  material?: LoopMaterial;
  language?: LoopLanguage;
};
/** The initial Loop board, native progress, appearance and host event callbacks.
 *
 * @example
 * ```ts
 * import type { LoopBoard, LoopMountOptions } from "@johnmorrisdotca/kazu/loop";
 *
 * const loopBoard: LoopBoard = {"width":5,"height":5,"clues":[2,3,1,null,null,3,1,1,null,null,3,2,2,null,null,3,0,2,2,null,2,2,1,2,3]};
 * const value: LoopMountOptions = {board:loopBoard};
 * console.log(value);
 * ```
 */
export type LoopMountOptions = LoopDrawOptions & {
  board: LoopBoard;
  progress?: string;
  onChange?: (game: LoopGame) => void;
  onFinish?: (game: LoopGame) => void;
};
/** The mounted Loop game and progress, native controls and cleanup handle.
 *
 * @example
 * ```ts no-run
 * import type { LoopBoard, LoopMount } from "@johnmorrisdotca/kazu/loop";
 * import { mountLoop } from "@johnmorrisdotca/kazu/loop";
 *
 * const loopBoard: LoopBoard = {"width":5,"height":5,"clues":[2,3,1,null,null,3,1,1,null,null,3,2,2,null,null,3,0,2,2,null,2,2,1,2,3]};
 * const host = document.createElement("div");
 * document.body.append(host);
 * const player: LoopMount = mountLoop(host,{board:loopBoard});
 * console.log(player.progress());
 * player.destroy();
 * ```
 */
export type LoopMount = {
  game: () => LoopGame;
  progress: () => string;
  set: (options: LoopDrawOptions) => void;
  restart: () => void;
  destroy: () => void;
};
