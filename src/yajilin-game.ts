import { isYajilinBoard, yajilinEdgeCount } from "./yajilin-board.ts";
import { solveYajilin } from "./yajilin-solve.ts";
import type { YajilinBoard, YajilinGame } from "./yajilin.types.ts";

/** Create the initial immutable Yajilin game from a valid board.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @returns Create the initial immutable Yajilin game from a valid board.
 * @example
 * ```ts
 * import type { YajilinBoard } from "@johnmorrisdotca/kazu/yajilin";
 * import { newYajilin } from "@johnmorrisdotca/kazu/yajilin";
 *
 * const yajilinBoard: YajilinBoard = {"width":5,"height":5,"clues":[{"direction":"left","count":0},null,{"direction":"right","count":1},null,{"direction":"up","count":0},null,null,null,null,null,{"direction":"right","count":0},null,{"direction":"left","count":0},null,{"direction":"down","count":1},{"direction":"left","count":0},null,null,null,null,null,{"direction":"up","count":1},{"direction":"down","count":0},null,{"direction":"down","count":0}]};
 * console.log(newYajilin(yajilinBoard));
 * ```
 */
export function newYajilin(board: YajilinBoard): YajilinGame {
  if (!isYajilinBoard(board)) throw new RangeError("Invalid Yajilin board");
  return { board: { width: board.width, height: board.height, clues: board.clues.map(clue => clue ? { ...clue } : null) }, shaded: Array(board.width * board.height).fill(false), edges: [], history: [], helped: false };
}
function snapshot(game: YajilinGame) { return { shaded: [...game.shaded], edges: [...game.edges] }; }
/** Apply the requested native Yajilin entry or mark to a new immutable game; invalid or fixed targets stay unchanged.
 *
 * @param game - The current immutable game state.
 * @param cell - A zero-based row-major cell index.
 * @returns Apply the requested native Yajilin entry or mark to a new immutable game; invalid or fixed targets stay unchanged.
 * @example
 * ```ts
 * import type { YajilinBoard } from "@johnmorrisdotca/kazu/yajilin";
 * import { newYajilin, toggleYajilinShade } from "@johnmorrisdotca/kazu/yajilin";
 *
 * const yajilinBoard: YajilinBoard = {"width":5,"height":5,"clues":[{"direction":"left","count":0},null,{"direction":"right","count":1},null,{"direction":"up","count":0},null,null,null,null,null,{"direction":"right","count":0},null,{"direction":"left","count":0},null,{"direction":"down","count":1},{"direction":"left","count":0},null,null,null,null,null,{"direction":"up","count":1},{"direction":"down","count":0},null,{"direction":"down","count":0}]};
 * const yajilinGame = newYajilin(yajilinBoard);
 * console.log(toggleYajilinShade(yajilinGame,0));
 * ```
 */
export function toggleYajilinShade(game: YajilinGame, cell: number): YajilinGame {
  if (!Number.isInteger(cell) || cell < 0 || cell >= game.shaded.length || game.board.clues[cell]) return game;
  const shaded = [...game.shaded]; shaded[cell] = !shaded[cell];
  return { ...game, shaded, history: [...game.history, snapshot(game)] };
}
/** Apply the requested native Yajilin entry or mark to a new immutable game; invalid or fixed targets stay unchanged.
 *
 * @param game - The current immutable game state.
 * @param edge - A zero-based native edge index.
 * @returns Apply the requested native Yajilin entry or mark to a new immutable game; invalid or fixed targets stay unchanged.
 * @example
 * ```ts
 * import type { YajilinBoard } from "@johnmorrisdotca/kazu/yajilin";
 * import { newYajilin, toggleYajilinEdge } from "@johnmorrisdotca/kazu/yajilin";
 *
 * const yajilinBoard: YajilinBoard = {"width":5,"height":5,"clues":[{"direction":"left","count":0},null,{"direction":"right","count":1},null,{"direction":"up","count":0},null,null,null,null,null,{"direction":"right","count":0},null,{"direction":"left","count":0},null,{"direction":"down","count":1},{"direction":"left","count":0},null,null,null,null,null,{"direction":"up","count":1},{"direction":"down","count":0},null,{"direction":"down","count":0}]};
 * const yajilinGame = newYajilin(yajilinBoard);
 * console.log(toggleYajilinEdge(yajilinGame,0));
 * ```
 */
export function toggleYajilinEdge(game: YajilinGame, edge: number): YajilinGame {
  if (!Number.isInteger(edge) || edge < 0 || edge >= yajilinEdgeCount(game.board)) return game;
  const edges = game.edges.includes(edge) ? game.edges.filter(value => value !== edge) : [...game.edges, edge].sort((a, b) => a - b);
  return { ...game, edges, history: [...game.history, snapshot(game)] };
}
/** Return the Yajilin game with its previous marks or entries restored, or unchanged when there is no undo history.
 *
 * @param game - The current immutable game state.
 * @returns Return the Yajilin game with its previous marks or entries restored, or unchanged when there is no undo history.
 * @example
 * ```ts
 * import type { YajilinBoard } from "@johnmorrisdotca/kazu/yajilin";
 * import { newYajilin, undoYajilin } from "@johnmorrisdotca/kazu/yajilin";
 *
 * const yajilinBoard: YajilinBoard = {"width":5,"height":5,"clues":[{"direction":"left","count":0},null,{"direction":"right","count":1},null,{"direction":"up","count":0},null,null,null,null,null,{"direction":"right","count":0},null,{"direction":"left","count":0},null,{"direction":"down","count":1},{"direction":"left","count":0},null,null,null,null,null,{"direction":"up","count":1},{"direction":"down","count":0},null,{"direction":"down","count":0}]};
 * const yajilinGame = newYajilin(yajilinBoard);
 * console.log(undoYajilin(yajilinGame));
 * ```
 */
export function undoYajilin(game: YajilinGame): YajilinGame {
  const previous = game.history.at(-1);
  return previous ? { ...game, shaded: [...previous.shaded], edges: [...previous.edges], history: game.history.slice(0, -1) } : game;
}
/** Return the Yajilin game reset to its initial entries or marks.
 *
 * @param game - The current immutable game state.
 * @returns Return the Yajilin game reset to its initial entries or marks.
 * @example
 * ```ts
 * import type { YajilinBoard } from "@johnmorrisdotca/kazu/yajilin";
 * import { newYajilin, restartYajilin } from "@johnmorrisdotca/kazu/yajilin";
 *
 * const yajilinBoard: YajilinBoard = {"width":5,"height":5,"clues":[{"direction":"left","count":0},null,{"direction":"right","count":1},null,{"direction":"up","count":0},null,null,null,null,null,{"direction":"right","count":0},null,{"direction":"left","count":0},null,{"direction":"down","count":1},{"direction":"left","count":0},null,null,null,null,null,{"direction":"up","count":1},{"direction":"down","count":0},null,{"direction":"down","count":0}]};
 * const yajilinGame = newYajilin(yajilinBoard);
 * console.log(restartYajilin(yajilinGame));
 * ```
 */
export function restartYajilin(game: YajilinGame): YajilinGame { return { ...newYajilin(game.board), helped: false }; }
/** Find a native Yajilin hint, or null when no actionable hint is available.
 *
 * @param game - The current immutable game state.
 * @returns Find a native Yajilin hint, or null when no actionable hint is available.
 * @example
 * ```ts
 * import type { YajilinBoard } from "@johnmorrisdotca/kazu/yajilin";
 * import { hintYajilin, newYajilin } from "@johnmorrisdotca/kazu/yajilin";
 *
 * const yajilinBoard: YajilinBoard = {"width":5,"height":5,"clues":[{"direction":"left","count":0},null,{"direction":"right","count":1},null,{"direction":"up","count":0},null,null,null,null,null,{"direction":"right","count":0},null,{"direction":"left","count":0},null,{"direction":"down","count":1},{"direction":"left","count":0},null,null,null,null,null,{"direction":"up","count":1},{"direction":"down","count":0},null,{"direction":"down","count":0}]};
 * const yajilinGame = newYajilin(yajilinBoard);
 * console.log(hintYajilin(yajilinGame));
 * ```
 */
export function hintYajilin(game: YajilinGame): { type: "shade"; cell: number } | { type: "edge"; edge: number } | null {
  const result = solveYajilin(game.board);
  if (!result.complete || result.count !== 1) return null;
  const cell = result.solution!.shaded.findIndex((value, index) => value !== game.shaded[index]);
  if (cell >= 0) return { type: "shade", cell };
  const edge = result.solution!.edges.find(value => !game.edges.includes(value));
  return edge === undefined ? null : { type: "edge", edge };
}
/** Encode the Yajilin board and current game as native resumable text.
 *
 * @param game - The current immutable game state.
 * @returns Encode the Yajilin board and current game as native resumable text.
 * @example
 * ```ts
 * import type { YajilinBoard } from "@johnmorrisdotca/kazu/yajilin";
 * import { encodeYajilin, newYajilin } from "@johnmorrisdotca/kazu/yajilin";
 *
 * const yajilinBoard: YajilinBoard = {"width":5,"height":5,"clues":[{"direction":"left","count":0},null,{"direction":"right","count":1},null,{"direction":"up","count":0},null,null,null,null,null,{"direction":"right","count":0},null,{"direction":"left","count":0},null,{"direction":"down","count":1},{"direction":"left","count":0},null,null,null,null,null,{"direction":"up","count":1},{"direction":"down","count":0},null,{"direction":"down","count":0}]};
 * const yajilinGame = newYajilin(yajilinBoard);
 * console.log(encodeYajilin(yajilinGame));
 * ```
 */
export function encodeYajilin(game: YajilinGame): string {
  return JSON.stringify({ version: 1, board: game.board, shaded: game.shaded, edges: game.edges, helped: game.helped });
}
/** Read a native saved Yajilin game, or null for invalid board data or progress.
 *
 * @param code - Native saved board and progress text.
 * @returns Read a native saved Yajilin game, or null for invalid board data or progress.
 * @example
 * ```ts
 * import { decodeYajilin } from "@johnmorrisdotca/kazu/yajilin";
 *
 * console.log(decodeYajilin("{\"version\":1,\"board\":{\"width\":5,\"height\":5,\"clues\":[{\"direction\":\"left\",\"count\":0},null,{\"direction\":\"right\",\"count\":1},null,{\"direction\":\"up\",\"count\":0},null,null,null,null,null,{\"direction\":\"right\",\"count\":0},null,{\"direction\":\"left\",\"count\":0},null,{\"direction\":\"down\",\"count\":1},{\"direction\":\"left\",\"count\":0},null,null,null,null,null,{\"direction\":\"up\",\"count\":1},{\"direction\":\"down\",\"count\":0},null,{\"direction\":\"down\",\"count\":0}]},\"shaded\":[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],\"edges\":[],\"helped\":false}"));
 * ```
 */
export function decodeYajilin(code: string): YajilinGame | null {
  try {
    if (code.length > 40_000) return null;
    const value = JSON.parse(code);
    if (value.version !== 1 || !isYajilinBoard(value.board) || !Array.isArray(value.shaded)
      || value.shaded.length !== value.board.width * value.board.height || !value.shaded.every((cell: unknown) => typeof cell === "boolean")
      || !Array.isArray(value.edges) || !value.edges.every((edge: unknown) => Number.isInteger(edge))
      || typeof value.helped !== "boolean") return null;
    const edges = [...new Set(value.edges as number[])].sort((a, b) => a - b);
    if (edges.length !== value.edges.length || edges.some(edge => edge < 0 || edge >= yajilinEdgeCount(value.board))) return null;
    return { ...newYajilin(value.board), shaded: [...value.shaded], edges, helped: value.helped };
  } catch { return null; }
}
