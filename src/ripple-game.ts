import { isRippleBoard, checkRipple, rippleRoomSizes } from "./ripple-board.ts";
import { solveRipple } from "./ripple-solve.ts";
import type { RippleBoard, RippleGame } from "./ripple.types.ts";

/** Create the initial immutable Ripple game from a valid board.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @returns Create the initial immutable Ripple game from a valid board.
 * @example
 * ```ts
 * import type { RippleBoard } from "@johnmorrisdotca/kazu/ripple";
 * import { newRipple } from "@johnmorrisdotca/kazu/ripple";
 *
 * const rippleBoard: RippleBoard = {"width":9,"height":9,"rooms":[0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8],"clues":[4,null,7,9,2,null,5,null,3,null,null,3,6,7,4,8,9,2,8,null,2,1,3,null,null,null,null,7,null,1,null,6,null,null,null,9,3,8,null,5,1,7,null,null,6,2,4,6,null,9,3,7,5,1,1,null,8,null,5,null,9,2,4,null,2,null,null,null,null,null,null,null,6,null,null,2,4,null,null,3,null]};
 * console.log(newRipple(rippleBoard));
 * ```
 */
export function newRipple(board: RippleBoard): RippleGame {
  if (!isRippleBoard(board)) throw new RangeError("Invalid Ripple Effect board");
  return { board: { width: board.width, height: board.height, rooms: [...board.rooms], clues: [...board.clues] },
    values: board.clues.map(clue => clue ?? 0), notes: board.rooms.map(() => []), history: [], helped: false };
}

/** Apply the requested native Ripple entry or mark to a new immutable game; invalid or fixed targets stay unchanged.
 *
 * @param game - The current immutable game state.
 * @param cell - A zero-based row-major cell index.
 * @param value - A candidate board, digit, mark or encoded game specified by this signature.
 * @returns Apply the requested native Ripple entry or mark to a new immutable game; invalid or fixed targets stay unchanged.
 * @example
 * ```ts
 * import type { RippleBoard } from "@johnmorrisdotca/kazu/ripple";
 * import { newRipple, setRippleValue } from "@johnmorrisdotca/kazu/ripple";
 *
 * const rippleBoard: RippleBoard = {"width":9,"height":9,"rooms":[0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8],"clues":[4,null,7,9,2,null,5,null,3,null,null,3,6,7,4,8,9,2,8,null,2,1,3,null,null,null,null,7,null,1,null,6,null,null,null,9,3,8,null,5,1,7,null,null,6,2,4,6,null,9,3,7,5,1,1,null,8,null,5,null,9,2,4,null,2,null,null,null,null,null,null,null,6,null,null,2,4,null,null,3,null]};
 * const rippleGame = newRipple(rippleBoard);
 * console.log(setRippleValue(rippleGame,0,1));
 * ```
 */
export function setRippleValue(game: RippleGame, cell: number, value: number): RippleGame {
  if (!Number.isInteger(cell) || cell < 0 || cell >= game.values.length || game.board.clues[cell] !== null
    || !Number.isInteger(value) || value < 0 || value > rippleRoomSizes(game.board)[game.board.rooms[cell]!]!) return game;
  if (game.values[cell] === value) return game;
  const values = [...game.values]; values[cell] = value;
  const notes = game.notes.map((list, index) => index === cell ? [] : [...list]);
  return { ...game, values, notes, history: [...game.history, snapshot(game)] };
}

/** Apply the requested native Ripple entry or mark to a new immutable game; invalid or fixed targets stay unchanged.
 *
 * @param game - The current immutable game state.
 * @param cell - A zero-based row-major cell index.
 * @param value - A candidate board, digit, mark or encoded game specified by this signature.
 * @returns Apply the requested native Ripple entry or mark to a new immutable game; invalid or fixed targets stay unchanged.
 * @example
 * ```ts
 * import type { RippleBoard } from "@johnmorrisdotca/kazu/ripple";
 * import { newRipple, toggleRippleNote } from "@johnmorrisdotca/kazu/ripple";
 *
 * const rippleBoard: RippleBoard = {"width":9,"height":9,"rooms":[0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8],"clues":[4,null,7,9,2,null,5,null,3,null,null,3,6,7,4,8,9,2,8,null,2,1,3,null,null,null,null,7,null,1,null,6,null,null,null,9,3,8,null,5,1,7,null,null,6,2,4,6,null,9,3,7,5,1,1,null,8,null,5,null,9,2,4,null,2,null,null,null,null,null,null,null,6,null,null,2,4,null,null,3,null]};
 * const rippleGame = newRipple(rippleBoard);
 * console.log(toggleRippleNote(rippleGame,0,1));
 * ```
 */
export function toggleRippleNote(game: RippleGame, cell: number, value: number): RippleGame {
  if (!Number.isInteger(cell) || cell < 0 || cell >= game.values.length || game.board.clues[cell] !== null || game.values[cell] !== 0
    || !Number.isInteger(value) || value < 1 || value > rippleRoomSizes(game.board)[game.board.rooms[cell]!]!) return game;
  const notes = game.notes.map(list => [...list]);
  const current = new Set(notes[cell]);
  if (current.has(value)) current.delete(value);
  else current.add(value);
  notes[cell] = [...current].sort((a, b) => a - b);
  return { ...game, notes, history: [...game.history, snapshot(game)] };
}

/** Return the Ripple game with its previous marks or entries restored, or unchanged when there is no undo history.
 *
 * @param game - The current immutable game state.
 * @returns Return the Ripple game with its previous marks or entries restored, or unchanged when there is no undo history.
 * @example
 * ```ts
 * import type { RippleBoard } from "@johnmorrisdotca/kazu/ripple";
 * import { newRipple, undoRipple } from "@johnmorrisdotca/kazu/ripple";
 *
 * const rippleBoard: RippleBoard = {"width":9,"height":9,"rooms":[0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8],"clues":[4,null,7,9,2,null,5,null,3,null,null,3,6,7,4,8,9,2,8,null,2,1,3,null,null,null,null,7,null,1,null,6,null,null,null,9,3,8,null,5,1,7,null,null,6,2,4,6,null,9,3,7,5,1,1,null,8,null,5,null,9,2,4,null,2,null,null,null,null,null,null,null,6,null,null,2,4,null,null,3,null]};
 * const rippleGame = newRipple(rippleBoard);
 * console.log(undoRipple(rippleGame));
 * ```
 */
export function undoRipple(game: RippleGame): RippleGame {
  const previous = game.history.at(-1);
  return previous ? { ...game, values: [...previous.values], notes: previous.notes.map(list => [...list]), history: game.history.slice(0, -1) } : game;
}

/** Whether this Ripple game satisfies its complete native rules.
 *
 * @param game - The current immutable game state.
 * @returns Whether this Ripple game satisfies its complete native rules.
 * @example
 * ```ts
 * import type { RippleBoard } from "@johnmorrisdotca/kazu/ripple";
 * import { newRipple, rippleFinished } from "@johnmorrisdotca/kazu/ripple";
 *
 * const rippleBoard: RippleBoard = {"width":9,"height":9,"rooms":[0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8],"clues":[4,null,7,9,2,null,5,null,3,null,null,3,6,7,4,8,9,2,8,null,2,1,3,null,null,null,null,7,null,1,null,6,null,null,null,9,3,8,null,5,1,7,null,null,6,2,4,6,null,9,3,7,5,1,1,null,8,null,5,null,9,2,4,null,2,null,null,null,null,null,null,null,6,null,null,2,4,null,null,3,null]};
 * const rippleGame = newRipple(rippleBoard);
 * console.log(rippleFinished(rippleGame));
 * ```
 */
export function rippleFinished(game: RippleGame): boolean { return checkRipple(game.board, game.values).ok; }

/** Offers a cell only when the current public entries leave one proved completion.
 *
 * @param game - The current immutable game state.
 * @returns Find a native Ripple hint, or null when no actionable hint is available.
 * @example
 * ```ts
 * import type { RippleBoard } from "@johnmorrisdotca/kazu/ripple";
 * import { hintRipple, newRipple } from "@johnmorrisdotca/kazu/ripple";
 *
 * const rippleBoard: RippleBoard = {"width":9,"height":9,"rooms":[0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8],"clues":[4,null,7,9,2,null,5,null,3,null,null,3,6,7,4,8,9,2,8,null,2,1,3,null,null,null,null,7,null,1,null,6,null,null,null,9,3,8,null,5,1,7,null,null,6,2,4,6,null,9,3,7,5,1,1,null,8,null,5,null,9,2,4,null,2,null,null,null,null,null,null,null,6,null,null,2,4,null,null,3,null]};
 * const rippleGame = newRipple(rippleBoard);
 * console.log(hintRipple(rippleGame));
 * ```
 */
export function hintRipple(game: RippleGame): { cell: number; value: number } | null {
  const clues = game.values.map((value, cell) => game.board.clues[cell] ?? (value || null));
  const solved = solveRipple({ ...game.board, clues });
  if (!solved.complete || solved.count !== 1 || !solved.solution) return null;
  const cell = solved.solution.findIndex((value, index) => game.values[index] === 0 && value > 0);
  return cell < 0 ? null : { cell, value: solved.solution[cell]! };
}

/** Encode the Ripple board and current game as native resumable text.
 *
 * @param game - The current immutable game state.
 * @returns Encode the Ripple board and current game as native resumable text.
 * @example
 * ```ts
 * import type { RippleBoard } from "@johnmorrisdotca/kazu/ripple";
 * import { encodeRipple, newRipple } from "@johnmorrisdotca/kazu/ripple";
 *
 * const rippleBoard: RippleBoard = {"width":9,"height":9,"rooms":[0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8],"clues":[4,null,7,9,2,null,5,null,3,null,null,3,6,7,4,8,9,2,8,null,2,1,3,null,null,null,null,7,null,1,null,6,null,null,null,9,3,8,null,5,1,7,null,null,6,2,4,6,null,9,3,7,5,1,1,null,8,null,5,null,9,2,4,null,2,null,null,null,null,null,null,null,6,null,null,2,4,null,null,3,null]};
 * const rippleGame = newRipple(rippleBoard);
 * console.log(encodeRipple(rippleGame));
 * ```
 */
export function encodeRipple(game: RippleGame): string {
  return JSON.stringify({ version: 1, board: game.board, values: game.values, notes: game.notes, helped: game.helped });
}

/** Read a native saved Ripple game, or null for invalid board data or progress.
 *
 * @param code - Native saved board and progress text.
 * @returns Read a native saved Ripple game, or null for invalid board data or progress.
 * @example
 * ```ts
 * import { decodeRipple } from "@johnmorrisdotca/kazu/ripple";
 *
 * console.log(decodeRipple("{\"version\":1,\"board\":{\"width\":9,\"height\":9,\"rooms\":[0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8],\"clues\":[4,null,7,9,2,null,5,null,3,null,null,3,6,7,4,8,9,2,8,null,2,1,3,null,null,null,null,7,null,1,null,6,null,null,null,9,3,8,null,5,1,7,null,null,6,2,4,6,null,9,3,7,5,1,1,null,8,null,5,null,9,2,4,null,2,null,null,null,null,null,null,null,6,null,null,2,4,null,null,3,null]},\"values\":[4,0,7,9,2,0,5,0,3,0,0,3,6,7,4,8,9,2,8,0,2,1,3,0,0,0,0,7,0,1,0,6,0,0,0,9,3,8,0,5,1,7,0,0,6,2,4,6,0,9,3,7,5,1,1,0,8,0,5,0,9,2,4,0,2,0,0,0,0,0,0,0,6,0,0,2,4,0,0,3,0],\"notes\":[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],\"helped\":false}"));
 * ```
 */
export function decodeRipple(code: string): RippleGame | null {
  try {
    if (code.length > 40_000) return null;
    const data = JSON.parse(code);
    if (data.version !== 1 || !isRippleBoard(data.board) || !Array.isArray(data.values)
      || data.values.length !== data.board.rooms.length || !Array.isArray(data.notes)
      || data.notes.length !== data.board.rooms.length || typeof data.helped !== "boolean") return null;
    let game = newRipple(data.board);
    for (let cell = 0; cell < data.values.length; cell += 1) {
      const value = data.values[cell];
      if (game.board.clues[cell] !== null && value !== game.board.clues[cell]) return null;
      if (game.board.clues[cell] === null && value) {
        const next = setRippleValue(game, cell, value);
        if (next === game) return null;
        game = next;
      }
      const list = data.notes[cell];
      if (!Array.isArray(list) || new Set(list).size !== list.length
        || list.some(note => !Number.isInteger(note) || note < 1 || note > rippleRoomSizes(game.board)[game.board.rooms[cell]!]!)) return null;
      for (const note of list) game = toggleRippleNote(game, cell, note);
    }
    return { ...game, history: [], helped: data.helped };
  } catch { return null; }
}

function snapshot(game: RippleGame) {
  return { values: [...game.values], notes: game.notes.map(list => [...list]) };
}
