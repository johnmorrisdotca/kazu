/**
 * Kazu, played in a page: `mountKazu` draws a puzzle into any element and plays it by touch, mouse and
 * keyboard, with a number pad, pencil marks, Undo, Hint, Check and a clock, and the words in English and
 * Japanese. A separate entry (`@johnmorrisdotca/kazu/play`), so a server never loads any of it.
 */
export { ensureKazuPlayStyle, mountKazu } from "./mount.ts";
export type { KazuEventDetail, KazuMount, KazuMountOptions, KazuMountSettings } from "./mount.ts";
export { KAZU_PLAY_STYLE } from "./play-style.ts";
export { kazuClockText } from "./clock.ts";

export * from "./shikaku-play-entry.ts";
