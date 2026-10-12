import { checkCrossSums, isCrossSumsBoard } from "./cross-sums-board.ts";
import { solveCrossSums } from "./cross-sums-solve.ts";
import type { CrossSumsBoard, CrossSumsGame } from "./cross-sums.types.ts";

/** Create the initial immutable CrossSums game from a valid board.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @returns Create the initial immutable CrossSums game from a valid board.
 * @example
 * ```ts
 * import type { CrossSumsBoard } from "@johnmorrisdotca/kazu/cross-sums";
 * import { newCrossSums } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * const crossSumsBoard: CrossSumsBoard = {"width":5,"height":5,"cells":[{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":10},{"kind":"black","across":null,"down":7},{"kind":"black","across":null,"down":12},{"kind":"black","across":null,"down":null},{"kind":"black","across":6,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":23,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null}]};
 * console.log(newCrossSums(crossSumsBoard));
 * ```
 */
export function newCrossSums(board: CrossSumsBoard): CrossSumsGame {
  if (!isCrossSumsBoard(board)) throw new RangeError("Invalid Cross Sums board");
  return { board: { width: board.width, height: board.height, cells: board.cells.map(cell => ({ ...cell })) },
    values: Array(board.cells.length).fill(0), notes: board.cells.map(() => []), history: [], helped: false };
}

/** Apply the requested native CrossSums entry or mark to a new immutable game; invalid or fixed targets stay unchanged.
 *
 * @param game - The current immutable game state.
 * @param cell - A zero-based row-major cell index.
 * @param digit - The digit to enter, or zero to clear.
 * @param pencil - Whether to toggle a note rather than enter a digit.
 * @returns Apply the requested native CrossSums entry or mark to a new immutable game; invalid or fixed targets stay unchanged.
 * @example
 * ```ts
 * import type { CrossSumsBoard } from "@johnmorrisdotca/kazu/cross-sums";
 * import { enterCrossSums, newCrossSums } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * const crossSumsBoard: CrossSumsBoard = {"width":5,"height":5,"cells":[{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":10},{"kind":"black","across":null,"down":7},{"kind":"black","across":null,"down":12},{"kind":"black","across":null,"down":null},{"kind":"black","across":6,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":23,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null}]};
 * const crossSumsGame = newCrossSums(crossSumsBoard);
 * console.log(enterCrossSums(crossSumsGame,0,1,false));
 * ```
 */
export function enterCrossSums(game: CrossSumsGame, cell: number, digit: number, pencil = false): CrossSumsGame {
  if (!Number.isInteger(cell) || cell < 0 || cell >= game.values.length || game.board.cells[cell]!.kind !== "white"
    || !Number.isInteger(digit) || digit < 0 || digit > 9) return game;
  const values = [...game.values], notes = game.notes.map(mark => [...mark]);
  if (pencil) {
    if (!digit) return game;
    const index = notes[cell]!.indexOf(digit);
    if (index < 0) notes[cell]!.push(digit);
    else notes[cell]!.splice(index, 1);
    notes[cell]!.sort((a, b) => a - b);
  } else { values[cell] = digit; notes[cell] = []; }
  return { ...game, values, notes, history: [...game.history, snapshot(game)] };
}

/** Return the CrossSums game with its previous marks or entries restored, or unchanged when there is no undo history.
 *
 * @param game - The current immutable game state.
 * @returns Return the CrossSums game with its previous marks or entries restored, or unchanged when there is no undo history.
 * @example
 * ```ts
 * import type { CrossSumsBoard } from "@johnmorrisdotca/kazu/cross-sums";
 * import { newCrossSums, undoCrossSums } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * const crossSumsBoard: CrossSumsBoard = {"width":5,"height":5,"cells":[{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":10},{"kind":"black","across":null,"down":7},{"kind":"black","across":null,"down":12},{"kind":"black","across":null,"down":null},{"kind":"black","across":6,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":23,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null}]};
 * const crossSumsGame = newCrossSums(crossSumsBoard);
 * console.log(undoCrossSums(crossSumsGame));
 * ```
 */
export function undoCrossSums(game: CrossSumsGame): CrossSumsGame {
  const previous = game.history.at(-1);
  return previous ? { ...game, ...previous, history: game.history.slice(0, -1) } : game;
}
/** Return the CrossSums game reset to its initial entries or marks.
 *
 * @param game - The current immutable game state.
 * @returns Return the CrossSums game reset to its initial entries or marks.
 * @example
 * ```ts
 * import type { CrossSumsBoard } from "@johnmorrisdotca/kazu/cross-sums";
 * import { newCrossSums, restartCrossSums } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * const crossSumsBoard: CrossSumsBoard = {"width":5,"height":5,"cells":[{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":10},{"kind":"black","across":null,"down":7},{"kind":"black","across":null,"down":12},{"kind":"black","across":null,"down":null},{"kind":"black","across":6,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":23,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null}]};
 * const crossSumsGame = newCrossSums(crossSumsBoard);
 * console.log(restartCrossSums(crossSumsGame));
 * ```
 */
export function restartCrossSums(game: CrossSumsGame): CrossSumsGame { return newCrossSums(game.board); }
/** Whether this CrossSums game satisfies its complete native rules.
 *
 * @param game - The current immutable game state.
 * @returns Whether this CrossSums game satisfies its complete native rules.
 * @example
 * ```ts
 * import type { CrossSumsBoard } from "@johnmorrisdotca/kazu/cross-sums";
 * import { finishedCrossSums, newCrossSums } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * const crossSumsBoard: CrossSumsBoard = {"width":5,"height":5,"cells":[{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":10},{"kind":"black","across":null,"down":7},{"kind":"black","across":null,"down":12},{"kind":"black","across":null,"down":null},{"kind":"black","across":6,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":23,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null}]};
 * const crossSumsGame = newCrossSums(crossSumsBoard);
 * console.log(finishedCrossSums(crossSumsGame));
 * ```
 */
export function finishedCrossSums(game: CrossSumsGame): boolean { return checkCrossSums(game.board, game.values).ok; }

/** Find a native CrossSums hint, or null when no actionable hint is available.
 *
 * @param game - The current immutable game state.
 * @returns Find a native CrossSums hint, or null when no actionable hint is available.
 * @example
 * ```ts
 * import type { CrossSumsBoard } from "@johnmorrisdotca/kazu/cross-sums";
 * import { hintCrossSums, newCrossSums } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * const crossSumsBoard: CrossSumsBoard = {"width":5,"height":5,"cells":[{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":10},{"kind":"black","across":null,"down":7},{"kind":"black","across":null,"down":12},{"kind":"black","across":null,"down":null},{"kind":"black","across":6,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":23,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null}]};
 * const crossSumsGame = newCrossSums(crossSumsBoard);
 * console.log(hintCrossSums(crossSumsGame));
 * ```
 */
export function hintCrossSums(game: CrossSumsGame): { cell: number; digit: number } | null {
  const proof = solveCrossSums(game.board, game.values, { limit: 2 });
  if (!proof.complete || proof.count !== 1 || !proof.solution) return null;
  const cell = game.board.cells.findIndex((tile, at) => tile.kind === "white" && game.values[at] === 0);
  return cell < 0 ? null : { cell, digit: proof.solution[cell]! };
}

/** Encode the CrossSums board and current game as native resumable text.
 *
 * @param game - The current immutable game state.
 * @returns Encode the CrossSums board and current game as native resumable text.
 * @example
 * ```ts
 * import type { CrossSumsBoard } from "@johnmorrisdotca/kazu/cross-sums";
 * import { encodeCrossSums, newCrossSums } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * const crossSumsBoard: CrossSumsBoard = {"width":5,"height":5,"cells":[{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":10},{"kind":"black","across":null,"down":7},{"kind":"black","across":null,"down":12},{"kind":"black","across":null,"down":null},{"kind":"black","across":6,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":23,"down":null},{"kind":"white"},{"kind":"white"},{"kind":"white"},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null},{"kind":"black","across":null,"down":null}]};
 * const crossSumsGame = newCrossSums(crossSumsBoard);
 * console.log(encodeCrossSums(crossSumsGame));
 * ```
 */
export function encodeCrossSums(game: CrossSumsGame): string {
  return JSON.stringify({ version: 1, board: game.board, values: game.values, notes: game.notes, helped: game.helped });
}
/** Read a native saved CrossSums game, or null for invalid board data or progress.
 *
 * @param code - Native saved board and progress text.
 * @returns Read a native saved CrossSums game, or null for invalid board data or progress.
 * @example
 * ```ts
 * import { decodeCrossSums } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * console.log(decodeCrossSums("{\"version\":1,\"board\":{\"width\":5,\"height\":5,\"cells\":[{\"kind\":\"black\",\"across\":null,\"down\":null},{\"kind\":\"black\",\"across\":null,\"down\":null},{\"kind\":\"black\",\"across\":null,\"down\":10},{\"kind\":\"black\",\"across\":null,\"down\":7},{\"kind\":\"black\",\"across\":null,\"down\":12},{\"kind\":\"black\",\"across\":null,\"down\":null},{\"kind\":\"black\",\"across\":6,\"down\":null},{\"kind\":\"white\"},{\"kind\":\"white\"},{\"kind\":\"white\"},{\"kind\":\"black\",\"across\":null,\"down\":null},{\"kind\":\"black\",\"across\":23,\"down\":null},{\"kind\":\"white\"},{\"kind\":\"white\"},{\"kind\":\"white\"},{\"kind\":\"black\",\"across\":null,\"down\":null},{\"kind\":\"black\",\"across\":null,\"down\":null},{\"kind\":\"black\",\"across\":null,\"down\":null},{\"kind\":\"black\",\"across\":null,\"down\":null},{\"kind\":\"black\",\"across\":null,\"down\":null},{\"kind\":\"black\",\"across\":null,\"down\":null},{\"kind\":\"black\",\"across\":null,\"down\":null},{\"kind\":\"black\",\"across\":null,\"down\":null},{\"kind\":\"black\",\"across\":null,\"down\":null},{\"kind\":\"black\",\"across\":null,\"down\":null}]},\"values\":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],\"notes\":[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],\"helped\":false}"));
 * ```
 */
export function decodeCrossSums(code: string): CrossSumsGame | null {
  try {
    if (code.length > 40000) return null;
    const value = JSON.parse(code);
    if (value.version !== 1 || !isCrossSumsBoard(value.board) || typeof value.helped !== "boolean"
      || !Array.isArray(value.values) || value.values.length !== value.board.cells.length
      || !Array.isArray(value.notes) || value.notes.length !== value.board.cells.length) return null;
    let game = newCrossSums(value.board);
    for (let cell = 0; cell < value.values.length; cell += 1) {
      const digit = value.values[cell];
      if (!Number.isInteger(digit) || digit < 0 || digit > 9 || value.board.cells[cell].kind === "black" && digit !== 0) return null;
      if (digit) game = enterCrossSums(game, cell, digit);
      const marks = value.notes[cell];
      if (!Array.isArray(marks) || marks.some(n => !Number.isInteger(n) || n < 1 || n > 9) || new Set(marks).size !== marks.length) return null;
      for (const mark of marks) game = enterCrossSums(game, cell, mark, true);
    }
    return { ...game, history: [], helped: value.helped };
  } catch { return null; }
}
function snapshot(game: CrossSumsGame) { return { values: [...game.values], notes: game.notes.map(mark => [...mark]) }; }
