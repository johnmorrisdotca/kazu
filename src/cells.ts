/**
 * A GRID OF NUMBERS AS A STRING: for an address, a POST body, and a kept run.
 *
 * Row-major, one character per cell: a digit for a value, `.` for an empty cell. Past nine the
 * values are letters, A for 10 up to G for 16 as a 16×16 Sudoku is printed, and on to P for 25 on a
 * 25×25 (`symbolOf`), so one character is still one cell. Upper case only in a code, so one grid has one spelling. These are
 * the spellings itsutsu.com has always stored, and they decode here unchanged.
 *
 * @example
 * ```ts
 * import { EMPTY_CELL } from "@johnmorrisdotca/kazu";
 * console.log(EMPTY_CELL);
 * ```
 */

export const EMPTY_CELL = ".";

/** The letters after 9, in order: A is 10, G is 16, P is 25. */
const PAST_NINE = "ABCDEFGHIJKLMNOP";

/** How a value is written, in a code and on a cell: 1–9, then A–P.
 *
 * @param value - The value to validate, encode or enter specified by this signature.
 * @returns How a value is written, in a code and on a cell: 1–9, then A–P.
 * @example
 * ```ts
 * import { symbolOf } from "@johnmorrisdotca/kazu";
 *
 * console.log(symbolOf(10));
 * ```
 */
export function symbolOf(value: number): string {
  return value <= 9 ? String(value) : PAST_NINE[value - 10]!;
}

/** The value a symbol names, or 0 for one that is not 1–9 or A–P (either case).
 *
 * @param symbol - One native numeric-cell character.
 * @returns The value a symbol names, or 0 for one that is not 1–9 or A–P (either case).
 * @example
 * ```ts
 * import { valueOfSymbol } from "@johnmorrisdotca/kazu";
 *
 * console.log(valueOfSymbol("A"));
 * ```
 */
export function valueOfSymbol(symbol: string): number {
  if (symbol.length !== 1) return 0;
  if (symbol >= "1" && symbol <= "9") return Number(symbol);
  const at = PAST_NINE.indexOf(symbol.toUpperCase());
  return at === -1 ? 0 : at + 10;
}

/** `[0, 3, 0, 1]` → `".3.1"`.
 *
 * @param cells - Row-major numeric cells, or expected cell count for step logs as specified by the signature.
 * @returns `[0, 3, 0, 1]` → `".3.1"`.
 * @example
 * ```ts
 * import type { KazuPuzzle } from "@johnmorrisdotca/kazu";
 * import { decodeCells, encodeCells } from "@johnmorrisdotca/kazu";
 *
 * const puzzle: KazuPuzzle = {"kind":"number-place","size":4,"level":"easy","seed":42,"givens":"14..2..1412.3..4","solution":"1432234141233214"};
 * const size = puzzle.size;
 * const answer = puzzle.solution;
 * const solution = decodeCells(answer,size)!;
 * console.log(encodeCells(solution));
 * ```
 */
export function encodeCells(cells: readonly number[]): string {
  return cells.map((value) => (value === 0 ? EMPTY_CELL : symbolOf(value))).join("");
}

/**
 * `".3.1"` at a side of 2 → `[0, 3, 0, 1]`, or null for a string that is not a grid of that size:
 * the wrong length, a value past the side, a stray character. Null rather than a grid with holes,
 * because a grid with holes is a grid.
 *
 * @param code - The native encoded clues, entries or notes specified by the signature.
 * @param size - The supported square grid side length.
 * @returns `".3.1"` at a side of 2 → `[0, 3, 0, 1]`, or null for a string that is not a grid of that size: the wrong length, a value past the side, a stray character. null rather than a grid with holes, because a grid with holes is a grid.
 * @example
 * ```ts
 * import type { KazuPuzzle } from "@johnmorrisdotca/kazu";
 * import { decodeCells } from "@johnmorrisdotca/kazu";
 *
 * const puzzle: KazuPuzzle = {"kind":"number-place","size":4,"level":"easy","seed":42,"givens":"14..2..1412.3..4","solution":"1432234141233214"};
 * const size = puzzle.size;
 * const answer = puzzle.solution;
 * const solution = decodeCells(answer,size)!;
 * console.log(decodeCells(answer,size));
 * ```
 */
export function decodeCells(code: string, size: number): number[] | null {
  if (typeof code !== "string" || code.length !== size * size) return null;
  const cells: number[] = [];
  for (const character of code) {
    if (character === EMPTY_CELL) {
      cells.push(0);
      continue;
    }
    const value = character === character.toUpperCase() ? valueOfSymbol(character) : 0;
    if (value < 1 || value > size) return null;
    cells.push(value);
  }
  return cells;
}

/** A short fingerprint of a puzzle's givens (FNV-1a, eight hex characters): the same puzzle, however it was kept, has the same one. Not a credential.
 *
 * @param givens - The original native printed-clue code.
 * @returns A short fingerprint of a puzzle's givens (FNV-1a, eight hex characters): the same puzzle, however it was kept, has the same one. Not a credential.
 * @example
 * ```ts
 * import type { KazuPuzzle } from "@johnmorrisdotca/kazu";
 * import { kazuHash } from "@johnmorrisdotca/kazu";
 *
 * const puzzle: KazuPuzzle = {"kind":"number-place","size":4,"level":"easy","seed":42,"givens":"14..2..1412.3..4","solution":"1432234141233214"};
 * const givens = puzzle.givens;
 * console.log(kazuHash(givens));
 * ```
 */
export function kazuHash(givens: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < givens.length; i += 1) {
    hash ^= givens.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * The number a tap on the chosen cell puts in it: one more, and after the largest the cell empties,
 * and then it starts again at 1. A tap on a cell that is not chosen still only chooses it.
 *
 * @param value - The value to validate, encode or enter specified by this signature.
 * @param size - The supported square grid side length.
 * @returns The number a tap on the chosen cell puts in it: one more, and after the largest the cell empties, and then it starts again at 1. A tap on a cell that is not chosen still only chooses it.
 * @example
 * ```ts
 * import { stepEntry } from "@johnmorrisdotca/kazu";
 *
 * console.log(stepEntry(4,4));
 * ```
 */
export function stepEntry(value: number, size: number): number {
  return value >= size ? 0 : value + 1;
}
