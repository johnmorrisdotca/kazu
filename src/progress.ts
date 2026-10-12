import { decodeCells, encodeCells } from "./cells.ts";

/**
 * WHAT HAS BEEN WRITTEN ON AN UNFINISHED PUZZLE, as strings a page can keep and bring back.
 *
 * A run is the player's entries the way a puzzle's cells are written (`cells.ts`): one character a
 * cell, the printed cells left empty. These are the spellings itsutsu.com keeps (`PuzzleRun.progress`
 * and its step log), and they read here unchanged. Pencil marks are Kazu's own and ride beside a run
 * as a second string.
 */

/** The entries of a run as its code.
 *
 * @param entries - The player entries, row-major, zero for blanks and printed cells.
 * @returns The entries of a run as its code.
 * @example
 * ```ts
 * import type { KazuPuzzle } from "@johnmorrisdotca/kazu";
 * import { encodeRun, newKazuGame } from "@johnmorrisdotca/kazu";
 *
 * const puzzle: KazuPuzzle = {"kind":"number-place","size":4,"level":"easy","seed":42,"givens":"14..2..1412.3..4","solution":"1432234141233214"};
 * const kind = puzzle.kind;
 * const size = puzzle.size;
 * const givens = puzzle.givens;
 * const game = newKazuGame(kind,size,givens)!;
 * console.log(encodeRun(game.entries));
 * ```
 */
export function encodeRun(entries: readonly number[]): string {
  return encodeCells(entries);
}

/** The entries a run's code says, or null for a code that is not a run of this side.
 *
 * @param code - The native encoded clues, entries or notes specified by the signature.
 * @param size - The supported square grid side length.
 * @returns The entries a run's code says, or null for a code that is not a run of this side.
 * @example
 * ```ts
 * import type { KazuPuzzle } from "@johnmorrisdotca/kazu";
 * import { decodeRun, encodeRun, newKazuGame } from "@johnmorrisdotca/kazu";
 *
 * const puzzle: KazuPuzzle = {"kind":"number-place","size":4,"level":"easy","seed":42,"givens":"14..2..1412.3..4","solution":"1432234141233214"};
 * const kind = puzzle.kind;
 * const size = puzzle.size;
 * const givens = puzzle.givens;
 * const game = newKazuGame(kind,size,givens)!;
 * console.log(decodeRun(encodeRun(game.entries),size));
 * ```
 */
export function decodeRun(code: string, size: number): number[] | null {
  return code.length === size * size ? decodeCells(code, size) : null;
}

/** Every value of a pencil-mark mask, smallest first.
 *
 * @param mask - The pencil-note bit mask: bit value denotes that note.
 * @returns Every value of a pencil-mark mask, smallest first.
 * @example
 * ```ts
 * import { notesOf } from "@johnmorrisdotca/kazu";
 *
 * console.log(notesOf((1<<1)|(1<<3)));
 * ```
 */
export function notesOf(mask: number): number[] {
  const out: number[] = [];
  for (let value = 1; mask >>> value !== 0; value += 1) if ((mask >>> value) & 1) out.push(value);
  return out;
}

/** Pencil marks as a code: for each cell that has any, its index in base 36 (two characters) and its marks as one number in base 36 (four characters); nothing at all for a grid with none.
 *
 * @param notes - One pencil-note mask per cell.
 * @returns Pencil marks as a code: for each cell that has any, its index in base 36 (two characters) and its marks as one number in base 36 (four characters); nothing at all for a grid with none.
 * @example
 * ```ts
 * import type { KazuPuzzle } from "@johnmorrisdotca/kazu";
 * import { encodeNotes, newKazuGame } from "@johnmorrisdotca/kazu";
 *
 * const puzzle: KazuPuzzle = {"kind":"number-place","size":4,"level":"easy","seed":42,"givens":"14..2..1412.3..4","solution":"1432234141233214"};
 * const kind = puzzle.kind;
 * const size = puzzle.size;
 * const givens = puzzle.givens;
 * const game = newKazuGame(kind,size,givens)!;
 * console.log(encodeNotes(game.notes));
 * ```
 */
export function encodeNotes(notes: readonly number[]): string {
  let code = "";
  notes.forEach((mask, index) => {
    if (mask !== 0) code += index.toString(36).padStart(2, "0") + (mask >>> 1).toString(36).padStart(4, "0");
  });
  return code;
}

/** The pencil marks a code says (each cell a bit mask, bit `v` for the number `v`), or null for a code that is not one for a grid of this side.
 *
 * @param code - The native encoded clues, entries or notes specified by the signature.
 * @param size - The supported square grid side length.
 * @returns The pencil marks a code says (each cell a bit mask, bit `v` for the number `v`), or null for a code that is not one for a grid of this side.
 * @example
 * ```ts
 * import type { KazuPuzzle } from "@johnmorrisdotca/kazu";
 * import { decodeNotes, encodeNotes, newKazuGame } from "@johnmorrisdotca/kazu";
 *
 * const puzzle: KazuPuzzle = {"kind":"number-place","size":4,"level":"easy","seed":42,"givens":"14..2..1412.3..4","solution":"1432234141233214"};
 * const kind = puzzle.kind;
 * const size = puzzle.size;
 * const givens = puzzle.givens;
 * const game = newKazuGame(kind,size,givens)!;
 * console.log(decodeNotes(encodeNotes(game.notes),size));
 * ```
 */
export function decodeNotes(code: string, size: number): number[] | null {
  if (code.length % 6 !== 0) return null;
  const notes = new Array<number>(size * size).fill(0);
  for (let at = 0; at < code.length; at += 6) {
    const index = Number.parseInt(code.slice(at, at + 2), 36);
    const bits = Number.parseInt(code.slice(at + 2, at + 6), 36);
    if (!Number.isInteger(index) || index < 0 || index >= size * size || !Number.isInteger(bits) || bits <= 0 || bits >= 2 ** size) return null;
    notes[index] = bits << 1;
  }
  return notes;
}

/** How many grids a step log keeps: the newest, so a long puzzle's log has a ceiling.
 *
 * @example
 * ```ts
 * import { KAZU_STEPS_KEPT } from "@johnmorrisdotca/kazu";
 * console.log(KAZU_STEPS_KEPT);
 * ```
 */
export const KAZU_STEPS_KEPT = 400;
const PARTED = "~";

/**
 * THE STEPS OF A PUZZLE, written down so a scrubber has them when the puzzle is picked up again. Every
 * step is a grid in a run's code. The first is written whole; each after it as the cells that changed
 * (a cell's place in base 36, two characters, and its new character), the steps parted by "~", which
 * no run uses. A long puzzle's log is a few hundred characters, not a grid per step.
 *
 * @param codes - Native entry codes in chronological order.
 * @returns THE STEPS OF A PUZZLE, written down so a scrubber has them when the puzzle is picked up again. Every step is a grid in a run's code. The first is written whole; each after it as the cells that changed (a cell's place in base 36, two characters, and its new character), the steps parted by "~", which no run uses. A long puzzle's log is a few hundred characters, not a grid per step.
 * @example
 * ```ts
 * import type { KazuPuzzle } from "@johnmorrisdotca/kazu";
 * import { encodeRun, encodeSteps, newKazuGame } from "@johnmorrisdotca/kazu";
 *
 * const puzzle: KazuPuzzle = {"kind":"number-place","size":4,"level":"easy","seed":42,"givens":"14..2..1412.3..4","solution":"1432234141233214"};
 * const kind = puzzle.kind;
 * const size = puzzle.size;
 * const givens = puzzle.givens;
 * const game = newKazuGame(kind,size,givens)!;
 * console.log(encodeSteps([encodeRun(game.entries)]));
 * ```
 */
export function encodeSteps(codes: readonly string[]): string {
  const kept = codes.slice(-KAZU_STEPS_KEPT);
  if (kept.length === 0) return "";
  const parts = [kept[0]!];
  for (let at = 1; at < kept.length; at += 1) {
    const before = kept[at - 1]!;
    const after = kept[at]!;
    let changed = "";
    for (let cell = 0; cell < after.length; cell += 1) {
      if (after[cell] !== before[cell]) changed += cell.toString(36).padStart(2, "0") + after[cell];
    }
    parts.push(changed);
  }
  return parts.join(PARTED);
}

/** The grids a step log holds, each `cells` characters long, or null for a log that does not read as one.
 *
 * @param log - The encoded native step log.
 * @param cells - Row-major numeric cells, or expected cell count for step logs as specified by the signature.
 * @returns The grids a step log holds, each `cells` characters long, or null for a log that does not read as one.
 * @example
 * ```ts
 * import type { KazuPuzzle } from "@johnmorrisdotca/kazu";
 * import { decodeSteps, encodeRun, encodeSteps, newKazuGame } from "@johnmorrisdotca/kazu";
 *
 * const puzzle: KazuPuzzle = {"kind":"number-place","size":4,"level":"easy","seed":42,"givens":"14..2..1412.3..4","solution":"1432234141233214"};
 * const kind = puzzle.kind;
 * const size = puzzle.size;
 * const givens = puzzle.givens;
 * const game = newKazuGame(kind,size,givens)!;
 * console.log(decodeSteps(encodeSteps([encodeRun(game.entries)]),size*size));
 * ```
 */
export function decodeSteps(log: string, cells: number): string[] | null {
  if (log === "") return null;
  const [first, ...changes] = log.split(PARTED);
  if (first === undefined || first.length !== cells || changes.length >= KAZU_STEPS_KEPT) return null;
  const codes = [first];
  for (const change of changes) {
    if (change.length % 3 !== 0) return null;
    const grid = [...codes.at(-1)!];
    for (let at = 0; at < change.length; at += 3) {
      const cell = Number.parseInt(change.slice(at, at + 2), 36);
      if (!Number.isInteger(cell) || cell < 0 || cell >= cells) return null;
      grid[cell] = change[at + 2]!;
    }
    codes.push(grid.join(""));
  }
  return codes;
}
