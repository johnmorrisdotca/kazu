import { checkLoop, isLoopBoard } from "./loop-board.ts";
import { solveLoop } from "./loop-solve.ts";
import type { LoopBoard, LoopGame } from "./loop.types.ts";

/** Create the initial immutable Loop game from a valid board.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @returns Create the initial immutable Loop game from a valid board.
 * @example
 * ```ts
 * import type { LoopBoard } from "@johnmorrisdotca/kazu/loop";
 * import { newLoop } from "@johnmorrisdotca/kazu/loop";
 *
 * const loopBoard: LoopBoard = {"width":5,"height":5,"clues":[2,3,1,null,null,3,1,1,null,null,3,2,2,null,null,3,0,2,2,null,2,2,1,2,3]};
 * console.log(newLoop(loopBoard));
 * ```
 */
export function newLoop(board: LoopBoard): LoopGame {
  if (!isLoopBoard(board)) throw new RangeError("Invalid Loop board");
  return {
    board: { width: board.width, height: board.height, clues: [...board.clues] },
    edges: [],
    history: [],
    helped: false,
  };
}

/** Apply the requested native Loop entry or mark to a new immutable game; invalid or fixed targets stay unchanged.
 *
 * @param game - The current immutable game state.
 * @param edge - A zero-based native edge index.
 * @returns Apply the requested native Loop entry or mark to a new immutable game; invalid or fixed targets stay unchanged.
 * @example
 * ```ts
 * import type { LoopBoard } from "@johnmorrisdotca/kazu/loop";
 * import { newLoop, toggleLoop } from "@johnmorrisdotca/kazu/loop";
 *
 * const loopBoard: LoopBoard = {"width":5,"height":5,"clues":[2,3,1,null,null,3,1,1,null,null,3,2,2,null,null,3,0,2,2,null,2,2,1,2,3]};
 * const loopGame = newLoop(loopBoard);
 * console.log(toggleLoop(loopGame,0));
 * ```
 */
export function toggleLoop(game: LoopGame, edge: number): LoopGame {
  const maximum = (game.board.height + 1) * game.board.width + game.board.height * (game.board.width + 1);
  if (!Number.isInteger(edge) || edge < 0 || edge >= maximum) return game;
  const edges = game.edges.includes(edge)
    ? game.edges.filter(selected => selected !== edge)
    : [...game.edges, edge];
  return { ...game, edges, history: [...game.history, [...game.edges]] };
}

/** Return the Loop game with its previous marks or entries restored, or unchanged when there is no undo history.
 *
 * @param game - The current immutable game state.
 * @returns Return the Loop game with its previous marks or entries restored, or unchanged when there is no undo history.
 * @example
 * ```ts
 * import type { LoopBoard } from "@johnmorrisdotca/kazu/loop";
 * import { newLoop, undoLoop } from "@johnmorrisdotca/kazu/loop";
 *
 * const loopBoard: LoopBoard = {"width":5,"height":5,"clues":[2,3,1,null,null,3,1,1,null,null,3,2,2,null,null,3,0,2,2,null,2,2,1,2,3]};
 * const loopGame = newLoop(loopBoard);
 * console.log(undoLoop(loopGame));
 * ```
 */
export function undoLoop(game: LoopGame): LoopGame {
  const previous = game.history.at(-1);
  return previous
    ? { ...game, edges: [...previous], history: game.history.slice(0, -1) }
    : game;
}

/** Whether this Loop game satisfies its complete native rules.
 *
 * @param game - The current immutable game state.
 * @returns Whether this Loop game satisfies its complete native rules.
 * @example
 * ```ts
 * import type { LoopBoard } from "@johnmorrisdotca/kazu/loop";
 * import { loopFinished, newLoop } from "@johnmorrisdotca/kazu/loop";
 *
 * const loopBoard: LoopBoard = {"width":5,"height":5,"clues":[2,3,1,null,null,3,1,1,null,null,3,2,2,null,null,3,0,2,2,null,2,2,1,2,3]};
 * const loopGame = newLoop(loopBoard);
 * console.log(loopFinished(loopGame));
 * ```
 */
export function loopFinished(game: LoopGame): boolean {
  return checkLoop(game.board, game.edges).ok;
}

/** Find a native Loop hint, or null when no actionable hint is available.
 *
 * @param game - The current immutable game state.
 * @returns Find a native Loop hint, or null when no actionable hint is available.
 * @example
 * ```ts
 * import type { LoopBoard } from "@johnmorrisdotca/kazu/loop";
 * import { hintLoop, newLoop } from "@johnmorrisdotca/kazu/loop";
 *
 * const loopBoard: LoopBoard = {"width":5,"height":5,"clues":[2,3,1,null,null,3,1,1,null,null,3,2,2,null,null,3,0,2,2,null,2,2,1,2,3]};
 * const loopGame = newLoop(loopBoard);
 * console.log(hintLoop(loopGame));
 * ```
 */
export function hintLoop(game: LoopGame): number | null {
  const solved = solveLoop(game.board);
  if (!solved.complete || solved.count !== 1 || !solved.solution) return null;
  return solved.solution.find(edge => !game.edges.includes(edge))
    ?? game.edges.find(edge => !solved.solution!.includes(edge))
    ?? null;
}

/** Encode the Loop board and current game as native resumable text.
 *
 * @param game - The current immutable game state.
 * @returns Encode the Loop board and current game as native resumable text.
 * @example
 * ```ts
 * import type { LoopBoard } from "@johnmorrisdotca/kazu/loop";
 * import { encodeLoop, newLoop } from "@johnmorrisdotca/kazu/loop";
 *
 * const loopBoard: LoopBoard = {"width":5,"height":5,"clues":[2,3,1,null,null,3,1,1,null,null,3,2,2,null,null,3,0,2,2,null,2,2,1,2,3]};
 * const loopGame = newLoop(loopBoard);
 * console.log(encodeLoop(loopGame));
 * ```
 */
export function encodeLoop(game: LoopGame): string {
  return JSON.stringify({ version: 1, board: game.board, edges: game.edges, helped: game.helped });
}

/** Read a native saved Loop game, or null for invalid board data or progress.
 *
 * @param code - Native saved board and progress text.
 * @returns Read a native saved Loop game, or null for invalid board data or progress.
 * @example
 * ```ts
 * import { decodeLoop } from "@johnmorrisdotca/kazu/loop";
 *
 * console.log(decodeLoop("{\"version\":1,\"board\":{\"width\":5,\"height\":5,\"clues\":[2,3,1,null,null,3,1,1,null,null,3,2,2,null,null,3,0,2,2,null,2,2,1,2,3]},\"edges\":[],\"helped\":false}"));
 * ```
 */
export function decodeLoop(code: string): LoopGame | null {
  try {
    if (code.length > 40_000) return null;
    const value = JSON.parse(code);
    if (value.version !== 1 || !isLoopBoard(value.board) || !Array.isArray(value.edges)
      || value.edges.length > (value.board.width + 1) * (value.board.height + 1) * 2
      || typeof value.helped !== "boolean" || new Set(value.edges).size !== value.edges.length) return null;
    let game = newLoop(value.board);
    for (const edge of value.edges) {
      const next = toggleLoop(game, edge);
      if (next === game) return null;
      game = next;
    }
    return { ...game, history: [], helped: value.helped };
  } catch {
    return null;
  }
}
