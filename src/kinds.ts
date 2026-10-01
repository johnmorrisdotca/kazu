/**
 * THE SIX PUZZLES, and what each offers: the keys, the sizes and the levels.
 *
 * A key is kebab case and is the name of the puzzle everywhere in this package: the
 * address of one, the `kind` of a puzzle, the value of the element's `kind` attribute.
 * itsutsu.com spelled the same six `numberPlace`, `jigsaw`, `diagonal`, `sumCages`,
 * `moreOrLess` and `towers`; `KAZU_KIND_OF_SITE_KIND` maps one to the other.
 */
export const KAZU_KINDS = ["number-place", "jigsaw", "diagonal", "sum-cages", "more-or-less", "towers"] as const;

export type KazuKind = (typeof KAZU_KINDS)[number];

/** How hard a puzzle is made: what the solver needed. Easy yields to singles alone, medium to one guess, hard to whatever it takes. */
export const KAZU_LEVELS = ["easy", "medium", "hard"] as const;

export type KazuLevel = (typeof KAZU_LEVELS)[number];

/** What one puzzle offers. */
export type KazuSpec = {
  /** Every side it can be made at, smallest first. */
  sizes: readonly number[];
  /** The side a first visit opens on. */
  defaultSize: number;
  /** The most characters one of its codes can hold, for a route to refuse anything larger. */
  mostCells: number;
};

export const KAZU_SPECS: Record<KazuKind, KazuSpec> = {
  "number-place": { sizes: [4, 6, 9, 16], defaultSize: 9, mostCells: 256 },
  jigsaw: { sizes: [5, 6, 7, 9], defaultSize: 7, mostCells: 162 },
  diagonal: { sizes: [6, 9], defaultSize: 9, mostCells: 81 },
  "sum-cages": { sizes: [6, 9], defaultSize: 9, mostCells: 286 },
  "more-or-less": { sizes: [4, 5, 6, 7], defaultSize: 5, mostCells: 133 },
  towers: { sizes: [4, 5, 6, 7], defaultSize: 5, mostCells: 77 },
};

/** The names itsutsu.com gave the six in its code, to the keys here: what a site's stored kind becomes. */
export const KAZU_KIND_OF_SITE_KIND: Record<string, KazuKind> = {
  numberPlace: "number-place",
  jigsaw: "jigsaw",
  diagonal: "diagonal",
  sumCages: "sum-cages",
  moreOrLess: "more-or-less",
  towers: "towers",
};

/** Whether a value is one of the six keys. */
export function isKazuKind(value: unknown): value is KazuKind {
  return (KAZU_KINDS as readonly unknown[]).includes(value);
}

/** Whether a value is one of the three levels. */
export function isKazuLevel(value: unknown): value is KazuLevel {
  return (KAZU_LEVELS as readonly unknown[]).includes(value);
}

/** Whether this puzzle can be made at this side. */
export function isKazuSize(kind: KazuKind, size: number): boolean {
  return isKazuKind(kind) && KAZU_SPECS[kind].sizes.includes(size);
}

/**
 * One puzzle, made from a seed or read back from its codes. `givens` and `solution` are the strings
 * `cells.ts` and the kinds' own codes write: row-major cells, one character each, and for a Jigsaw, Sum
 * Cages, More or Less or Towers the rest of what the puzzle is printed with, after the cells.
 */
export type KazuPuzzle = {
  kind: KazuKind;
  size: number;
  level: KazuLevel;
  seed: number;
  givens: string;
  solution: string;
};

/** The verdict on a submitted answer: `{ ok: true }`, or `{ ok: false, reason }` in the words the site has always used. */
export type KazuCheck = { ok: true } | { ok: false; reason: string };
