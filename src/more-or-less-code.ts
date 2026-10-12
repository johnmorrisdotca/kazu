import { decodeCells, encodeCells } from "./cells.ts";

/**
 * More or Less (Futoshiki) as a string: the cells, then the marks between them.
 *
 * The cells come first, row-major, as every number grid is written (`.` for
 * empty). Then one character per edge between two cells: the horizontal
 * edges row by row (`size − 1` per row), then the vertical edges row by row
 * (`size` per row, `size − 1` rows). `<` and `>` say which side is bigger,
 * the way the mark is drawn between the cells; `^` and `v` do the same for
 * an edge between a cell and the one below it (`v` points down at the
 * smaller number). `.` is no mark. A 7×7 is 49 + 42 + 42 characters.
 */

/** A mark: the cell at `less` holds a smaller number than the cell at `more`. Both are indexes, always adjacent.
 *
 * @example
 * ```ts
 * import { decodeMoreOrLess } from "@johnmorrisdotca/kazu";
 * import type { Mark } from "@johnmorrisdotca/kazu";
 *
 * const inequalities = decodeMoreOrLess("1.........2......>...>...........^......",4)!;
 * const value: Mark = inequalities.marks[0];
 * console.log(value);
 * ```
 */
export type Mark = { less: number; more: number };

/** The native code character for an absent Futoshiki relation.
 *
 * @example
 * ```ts
 * import { NO_MARK } from "@johnmorrisdotca/kazu";
 * console.log(NO_MARK);
 * ```
 */
export const NO_MARK = ".";

/** Encode grid numbers and less-than relations as the native Futoshiki givens code.
 *
 * @param cells - Row-major numeric cells, or expected cell count for step logs as specified by the signature.
 * @param marks - The ordered less-than relations between cells.
 * @param size - The supported square grid side length.
 * @returns Encode grid numbers and less-than relations as the native Futoshiki givens code.
 * @example
 * ```ts
 * import type { KazuPuzzle } from "@johnmorrisdotca/kazu";
 * import { decodeMoreOrLess, encodeMoreOrLess, readGivens } from "@johnmorrisdotca/kazu";
 *
 * const puzzle: KazuPuzzle = {"kind":"number-place","size":4,"level":"easy","seed":42,"givens":"14..2..1412.3..4","solution":"1432234141233214"};
 * const kind = puzzle.kind;
 * const size = puzzle.size;
 * const givens = puzzle.givens;
 * const printed = readGivens(kind,size,givens)!;
 * const cells = printed.cells;
 * const inequalities = decodeMoreOrLess("1.........2......>...>...........^......",4)!;
 * console.log(encodeMoreOrLess(inequalities.cells,inequalities.marks,4));
 * ```
 */
export function encodeMoreOrLess(cells: readonly number[], marks: readonly Mark[], size: number): string {
  const horizontal = new Array<string>(size * (size - 1)).fill(NO_MARK);
  const vertical = new Array<string>((size - 1) * size).fill(NO_MARK);
  for (const mark of marks) {
    const low = Math.min(mark.less, mark.more);
    const high = Math.max(mark.less, mark.more);
    if (high === low + 1) {
      const row = Math.floor(low / size);
      const col = low % size;
      horizontal[row * (size - 1) + col] = mark.less === low ? "<" : ">";
    } else {
      vertical[low] = mark.less === low ? "^" : "v";
    }
  }
  return `${encodeCells(cells)}${horizontal.join("")}${vertical.join("")}`;
}

/** Decode native Futoshiki numbers and less-than relations, or null for an invalid code.
 *
 * @param code - The native encoded clues, entries or notes specified by the signature.
 * @param size - The supported square grid side length.
 * @returns Decode native Futoshiki numbers and less-than relations, or null for an invalid code.
 * @example
 * ```ts
 * import { decodeMoreOrLess } from "@johnmorrisdotca/kazu";
 *
 * console.log(decodeMoreOrLess("1.........2......>...>...........^......",4)?.marks.length);
 * ```
 */
export function decodeMoreOrLess(code: string, size: number): { cells: number[]; marks: Mark[] } | null {
  const cellsLength = size * size;
  const horizontalLength = size * (size - 1);
  const verticalLength = (size - 1) * size;
  if (typeof code !== "string" || code.length !== cellsLength + horizontalLength + verticalLength) return null;
  const cells = decodeCells(code.slice(0, cellsLength), size);
  if (cells === null) return null;
  const marks: Mark[] = [];
  const horizontal = code.slice(cellsLength, cellsLength + horizontalLength);
  for (let i = 0; i < horizontal.length; i += 1) {
    const row = Math.floor(i / (size - 1));
    const col = i % (size - 1);
    const left = row * size + col;
    if (horizontal[i] === "<") marks.push({ less: left, more: left + 1 });
    else if (horizontal[i] === ">") marks.push({ less: left + 1, more: left });
    else if (horizontal[i] !== NO_MARK) return null;
  }
  const vertical = code.slice(cellsLength + horizontalLength);
  for (let i = 0; i < vertical.length; i += 1) {
    if (vertical[i] === "^") marks.push({ less: i, more: i + size });
    else if (vertical[i] === "v") marks.push({ less: i + size, more: i });
    else if (vertical[i] !== NO_MARK) return null;
  }
  return { cells, marks };
}
