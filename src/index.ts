/**
 * Kazu 数: the Numbers family of grid puzzles. Sudoku, Jigsaw Sudoku, Diagonal Sudoku, Killer Sudoku
 * (Sum Cages), Futoshiki (More or Less) and Skyscrapers (Towers): a seeded generator whose every puzzle
 * has exactly one answer, at three levels; a solver that counts answers; a check that reads a finished
 * grid in O(cells); a hint that says which cell to fill next and why; puzzles and runs as short codes;
 * and a game in play as pure functions. The drawing is `@johnmorrisdotca/kazu/draw`, playing in a page
 * is `@johnmorrisdotca/kazu/play`, and the tag is `@johnmorrisdotca/kazu/element/define`.
 */
export * from "./kinds.ts";
export * from "./generate.ts";
export * from "./solve.ts";
export * from "./check.ts";
export * from "./hint.ts";
export * from "./givens.ts";
export * from "./conflicts.ts";
export * from "./game.ts";
export * from "./cells.ts";
export * from "./progress.ts";
export { kazuClockText } from "./clock.ts";
export { generateNumberPlace, generateDiagonal } from "./number-place.ts";
export { generateJigsaw } from "./jigsaw.ts";
export { generateSumCages } from "./sum-cages.ts";
export { generateMoreOrLess } from "./more-or-less.ts";
export { generateTowers } from "./towers.ts";
export { encodeJigsaw, decodeJigsaw, encodeRegions, decodeRegions } from "./jigsaw.ts";
export { encodeKiller, decodeKiller, cageOutline, CAGE_LETTERS } from "./sum-cages.ts";
export type { Cage, Segment } from "./sum-cages.ts";
export { encodeMoreOrLess, decodeMoreOrLess, NO_MARK } from "./more-or-less-code.ts";
export type { Mark } from "./more-or-less-code.ts";
export { encodeTowers, decodeTowers, cluesOf, lineFrom, towersSeen, noClues, TOWER_SIDES } from "./towers-code.ts";
export type { TowerClues, TowerSide } from "./towers-code.ts";
export { boxedLayout, boxOf, KAZU_BOXES, neighbours, regionsAreSound } from "./layout.ts";
export type { Boxes } from "./layout.ts";
export { seededRandom, shuffled, freshKazuSeed, isKazuSeed, KAZU_SEED_MOST } from "./random.ts";
export type { Random } from "./random.ts";
export { VERSION } from "./version.ts";

export * from "./shikaku-entry.ts";

export * from "./hitori-entry.ts";
export * from "./nurikabe-entry.ts";
export * from "./akari-entry.ts";
export * from "./juosan-entry.ts";
export * from "./slitherlink-entry.ts";
export * from "./ripple-entry.ts";
export * from "./kakuro-entry.ts";
export * from "./fillomino-entry.ts";
export * from "./heyawake-entry.ts";

export * from "./masyu-entry.ts";
export * from "./yajilin-entry.ts";
