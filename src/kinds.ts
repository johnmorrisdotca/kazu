/**
 * THE SIX PUZZLES, and what each offers: the keys, the sizes and the levels.
 *
 * A key is kebab case and is the name of the puzzle everywhere in this package: the
 * address of one, the `kind` of a puzzle, the value of the element's `kind` attribute.
 * itsutsu.com spelled the same six `numberPlace`, `jigsaw`, `diagonal`, `sumCages`,
 * `moreOrLess` and `towers`; `KAZU_KIND_OF_SITE_KIND` maps one to the other.
 *
 * @example
 * ```ts
 * import { KAZU_KINDS } from "@johnmorrisdotca/kazu";
 * console.log(KAZU_KINDS);
 * ```
 */
export const KAZU_KINDS = ["number-place", "jigsaw", "diagonal", "sum-cages", "more-or-less", "towers"] as const;

/** One of the six native number-grid puzzle kinds.
 *
 * @example
 * ```ts
 * import type { KazuKind } from "@johnmorrisdotca/kazu";
 *
 * const value: KazuKind = "number-place";
 * console.log(value);
 * ```
 */
export type KazuKind = (typeof KAZU_KINDS)[number];

/** How hard a puzzle is made: what the solver needed. Easy yields to singles alone, medium to one guess, hard to whatever it takes.
 *
 * @example
 * ```ts
 * import { KAZU_LEVELS } from "@johnmorrisdotca/kazu";
 * console.log(KAZU_LEVELS);
 * ```
 */
export const KAZU_LEVELS = ["easy", "medium", "hard"] as const;

/** One of the native easy, medium or hard generation tiers.
 *
 * @example
 * ```ts
 * import type { KazuLevel } from "@johnmorrisdotca/kazu";
 *
 * const value: KazuLevel = "easy";
 * console.log(value);
 * ```
 */
export type KazuLevel = (typeof KAZU_LEVELS)[number];

/** What one puzzle offers.
 *
 * @example
 * ```ts
 * import type { KazuSpec } from "@johnmorrisdotca/kazu";
 * import { KAZU_SPECS } from "@johnmorrisdotca/kazu";
 *
 * const value: KazuSpec = KAZU_SPECS["number-place"];
 * console.log(value);
 * ```
 */
export type KazuSpec = {
  /** Every side it can be made at, smallest first. */
  sizes: readonly number[];
  /** The side a first visit opens on. */
  defaultSize: number;
  /** The most characters one of its codes can hold, for a route to refuse anything larger. */
  mostCells: number;
};

/** Supported sizes, native default size and givens-code limits for each number-grid kind.
 *
 * @example
 * ```ts
 * import { KAZU_SPECS } from "@johnmorrisdotca/kazu";
 * console.log(KAZU_SPECS);
 * ```
 */
export const KAZU_SPECS: Record<KazuKind, KazuSpec> = {
  "number-place": { sizes: [4, 6, 9, 16, 25], defaultSize: 9, mostCells: 625 },
  jigsaw: { sizes: [5, 6, 7, 9], defaultSize: 7, mostCells: 162 },
  diagonal: { sizes: [6, 9], defaultSize: 9, mostCells: 81 },
  "sum-cages": { sizes: [6, 9], defaultSize: 9, mostCells: 286 },
  "more-or-less": { sizes: [4, 5, 6, 7], defaultSize: 5, mostCells: 133 },
  towers: { sizes: [4, 5, 6, 7], defaultSize: 5, mostCells: 77 },
};

/** The names itsutsu.com gave the six in its code, to the keys here: what a site's stored kind becomes.
 *
 * @example
 * ```ts
 * import { KAZU_KIND_OF_SITE_KIND } from "@johnmorrisdotca/kazu";
 * console.log(KAZU_KIND_OF_SITE_KIND);
 * ```
 */
export const KAZU_KIND_OF_SITE_KIND: Record<string, KazuKind> = {
  numberPlace: "number-place",
  jigsaw: "jigsaw",
  diagonal: "diagonal",
  sumCages: "sum-cages",
  moreOrLess: "more-or-less",
  towers: "towers",
};

/** Whether a value is one of the six keys.
 *
 * @param value - The value to validate, encode or enter specified by this signature.
 * @returns Whether a value is one of the six keys.
 * @example
 * ```ts
 * import { isKazuKind } from "@johnmorrisdotca/kazu";
 *
 * console.log(isKazuKind("number-place"));
 * ```
 */
export function isKazuKind(value: unknown): value is KazuKind {
  return (KAZU_KINDS as readonly unknown[]).includes(value);
}

/** Whether a value is one of the three levels.
 *
 * @param value - The value to validate, encode or enter specified by this signature.
 * @returns Whether a value is one of the three levels.
 * @example
 * ```ts
 * import { isKazuLevel } from "@johnmorrisdotca/kazu";
 *
 * console.log(isKazuLevel("easy"));
 * ```
 */
export function isKazuLevel(value: unknown): value is KazuLevel {
  return (KAZU_LEVELS as readonly unknown[]).includes(value);
}

/** Whether this puzzle can be made at this side.
 *
 * @param kind - The native number-grid puzzle key.
 * @param size - The supported square grid side length.
 * @returns Whether this puzzle can be made at this side.
 * @example
 * ```ts
 * import { isKazuSize } from "@johnmorrisdotca/kazu";
 *
 * console.log(isKazuSize("number-place",4));
 * ```
 */
export function isKazuSize(kind: KazuKind, size: number): boolean {
  return isKazuKind(kind) && KAZU_SPECS[kind].sizes.includes(size);
}

/**
 * One puzzle, made from a seed or read back from its codes. `givens` and `solution` are the strings
 * `cells.ts` and the kinds' own codes write: row-major cells, one character each, and for a Jigsaw, Sum
 * Cages, More or Less or Towers the rest of what the puzzle is printed with, after the cells.
 *
 * @example
 * ```ts
 * import type { KazuPuzzle } from "@johnmorrisdotca/kazu";
 *
 * const puzzle: KazuPuzzle = {"kind":"number-place","size":4,"level":"easy","seed":42,"givens":"14..2..1412.3..4","solution":"1432234141233214"};
 * const value: KazuPuzzle = puzzle;
 * console.log(value);
 * ```
 */
export type KazuPuzzle = {
  kind: KazuKind;
  size: number;
  level: KazuLevel;
  seed: number;
  givens: string;
  solution: string;
};

/** The verdict on a submitted answer: `{ ok: true }`, or `{ ok: false, reason }` in the words the site has always used.
 *
 * @example
 * ```ts
 * import type { KazuCheck, KazuPuzzle } from "@johnmorrisdotca/kazu";
 * import { checkKazu, decodeCells } from "@johnmorrisdotca/kazu";
 *
 * const puzzle: KazuPuzzle = {"kind":"number-place","size":4,"level":"easy","seed":42,"givens":"14..2..1412.3..4","solution":"1432234141233214"};
 * const kind = puzzle.kind;
 * const size = puzzle.size;
 * const givens = puzzle.givens;
 * const answer = puzzle.solution;
 * const solution = decodeCells(answer,size)!;
 * const value: KazuCheck = checkKazu(kind,size,givens,answer);
 * console.log(value);
 * ```
 */
export type KazuCheck = { ok: true } | { ok: false; reason: string };
