/**
 * Kazu's drawing: a puzzle as SVG text, with the style that gives it its look, and where everything sits
 * in it (so a page can tell which cell a finger is over). A separate entry
 * (`@johnmorrisdotca/kazu/draw`), so a server that only checks an answer never loads any of it.
 */
export { drawKazu, kazuCellName, kazuWhere } from "./draw.ts";
export type { KazuDrawOptions } from "./draw.ts";
export { kazuGeometry, KAZU_CELL } from "./geometry.ts";
export type { KazuGeometry } from "./geometry.ts";
export { KAZU_STYLE } from "./style.ts";
export { KAZU_STRINGS, kazuLanguageOf, kazuNameOf, kazuSay } from "./strings.ts";
export type { KazuLanguage } from "./strings.ts";
export { KAZU_NAMES, KAZU_SIZE_NAMES } from "./names.ts";
export type { KazuName } from "./names.ts";
