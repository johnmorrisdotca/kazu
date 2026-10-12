/** The direction an arrow clue looks along a row or column.
 *
 * @example
 * ```ts
 * import type { YajilinDirection } from "@johnmorrisdotca/kazu/yajilin";
 *
 * const value: YajilinDirection = "right";
 * console.log(value);
 * ```
 */
export type YajilinDirection = "up" | "right" | "down" | "left";
/** An arrow direction and the required number of shaded cells in its ray.
 *
 * @example
 * ```ts
 * import type { YajilinClue } from "@johnmorrisdotca/kazu/yajilin";
 *
 * const value: YajilinClue = {direction:"right",count:1};
 * console.log(value);
 * ```
 */
export type YajilinClue = { direction: YajilinDirection; count: number };
/** Yajilin dimensions and printed clues in their native row-major representation.
 *
 * @example
 * ```ts
 * import type { YajilinBoard } from "@johnmorrisdotca/kazu/yajilin";
 *
 * const yajilinBoard: YajilinBoard = {"width":5,"height":5,"clues":[{"direction":"left","count":0},null,{"direction":"right","count":1},null,{"direction":"up","count":0},null,null,null,null,null,{"direction":"right","count":0},null,{"direction":"left","count":0},null,{"direction":"down","count":1},{"direction":"left","count":0},null,null,null,null,null,{"direction":"up","count":1},{"direction":"down","count":0},null,{"direction":"down","count":0}]};
 * const value: YajilinBoard = yajilinBoard;
 * console.log(value);
 * ```
 */
export type YajilinBoard = { width: number; height: number; clues: readonly (YajilinClue | null)[] };
/** A seeded Yajilin board with its verified solution.
 *
 * @example
 * ```ts
 * import type { YajilinPuzzle } from "@johnmorrisdotca/kazu/yajilin";
 *
 * const yajilinPuzzle: YajilinPuzzle = {"width":5,"height":5,"clues":[{"direction":"left","count":0},null,{"direction":"right","count":1},null,{"direction":"up","count":0},null,null,null,null,null,{"direction":"right","count":0},null,{"direction":"left","count":0},null,{"direction":"down","count":1},{"direction":"left","count":0},null,null,null,null,null,{"direction":"up","count":1},{"direction":"down","count":0},null,{"direction":"down","count":0}],"seed":42,"solution":{"shaded":[false,true,false,true,false,true,false,false,false,true,false,false,false,false,false,false,false,false,false,true,true,false,false,true,false],"edges":[5,26,6,28,31,33,13,14]}};
 * const value: YajilinPuzzle = yajilinPuzzle;
 * console.log(value);
 * ```
 */
export type YajilinPuzzle = YajilinBoard & { seed: number; solution: { shaded: readonly boolean[]; edges: readonly number[] } };
/** The Yajilin completion result and cells that violate its native rules.
 *
 * @example
 * ```ts
 * import type { YajilinBoard, YajilinCheck, YajilinPuzzle } from "@johnmorrisdotca/kazu/yajilin";
 * import { checkYajilin } from "@johnmorrisdotca/kazu/yajilin";
 *
 * const yajilinBoard: YajilinBoard = {"width":5,"height":5,"clues":[{"direction":"left","count":0},null,{"direction":"right","count":1},null,{"direction":"up","count":0},null,null,null,null,null,{"direction":"right","count":0},null,{"direction":"left","count":0},null,{"direction":"down","count":1},{"direction":"left","count":0},null,null,null,null,null,{"direction":"up","count":1},{"direction":"down","count":0},null,{"direction":"down","count":0}]};
 * const yajilinSolution: YajilinPuzzle["solution"] = {"shaded":[false,true,false,true,false,true,false,false,false,true,false,false,false,false,false,false,false,false,false,true,true,false,false,true,false],"edges":[5,26,6,28,31,33,13,14]};
 * const value: YajilinCheck = checkYajilin(yajilinBoard,yajilinSolution.shaded,yajilinSolution.edges);
 * console.log(value);
 * ```
 */
export type YajilinCheck = { ok: boolean; errors: readonly number[] };
/** The solved Yajilin shading and loop edges.
 *
 * @example
 * ```ts
 * import type { YajilinPuzzle, YajilinSolution } from "@johnmorrisdotca/kazu/yajilin";
 *
 * const yajilinSolution: YajilinPuzzle["solution"] = {"shaded":[false,true,false,true,false,true,false,false,false,true,false,false,false,false,false,false,false,false,false,true,true,false,false,true,false],"edges":[5,26,6,28,31,33,13,14]};
 * const value: YajilinSolution = yajilinSolution;
 * console.log(value);
 * ```
 */
export type YajilinSolution = { shaded: readonly boolean[]; edges: readonly number[] };
/** A bounded Yajilin solve result: answer count, first solution, node work and whether the search completed.
 *
 * @example
 * ```ts
 * import type { YajilinBoard, YajilinSolve } from "@johnmorrisdotca/kazu/yajilin";
 * import { solveYajilin } from "@johnmorrisdotca/kazu/yajilin";
 *
 * const yajilinBoard: YajilinBoard = {"width":5,"height":5,"clues":[{"direction":"left","count":0},null,{"direction":"right","count":1},null,{"direction":"up","count":0},null,null,null,null,null,{"direction":"right","count":0},null,{"direction":"left","count":0},null,{"direction":"down","count":1},{"direction":"left","count":0},null,null,null,null,null,{"direction":"up","count":1},{"direction":"down","count":0},null,{"direction":"down","count":0}]};
 * const value: YajilinSolve = solveYajilin(yajilinBoard,{limit:2,nodes:20000});
 * console.log(value);
 * ```
 */
export type YajilinSolve = { count: number; solution: YajilinSolution | null; complete: boolean; nodes: number };
/** The immutable Yajilin board, current entries or marks, undo history and assistance state.
 *
 * @example
 * ```ts
 * import type { YajilinBoard, YajilinGame } from "@johnmorrisdotca/kazu/yajilin";
 * import { newYajilin } from "@johnmorrisdotca/kazu/yajilin";
 *
 * const yajilinBoard: YajilinBoard = {"width":5,"height":5,"clues":[{"direction":"left","count":0},null,{"direction":"right","count":1},null,{"direction":"up","count":0},null,null,null,null,null,{"direction":"right","count":0},null,{"direction":"left","count":0},null,{"direction":"down","count":1},{"direction":"left","count":0},null,null,null,null,null,{"direction":"up","count":1},{"direction":"down","count":0},null,{"direction":"down","count":0}]};
 * const yajilinGame = newYajilin(yajilinBoard);
 * const value: YajilinGame = yajilinGame;
 * console.log(value);
 * ```
 */
export type YajilinGame = { board: YajilinBoard; shaded: readonly boolean[]; edges: readonly number[]; history: readonly { shaded: readonly boolean[]; edges: readonly number[] }[]; helped: boolean };
/** Current Yajilin marks or entries, selection, errors and native SVG appearance choices.
 *
 * @example
 * ```ts
 * import type { YajilinDrawOptions } from "@johnmorrisdotca/kazu/yajilin";
 *
 * const value: YajilinDrawOptions = {language:"en"};
 * console.log(value);
 * ```
 */
export type YajilinDrawOptions = { shaded?: readonly boolean[]; edges?: readonly number[]; selected?: number; errors?: readonly number[]; material?: "ivory" | "wood" | "slate"; pieces?: "plain" | "tiles"; language?: "en" | "ja" };
/** The initial Yajilin board, native progress, appearance and host event callbacks.
 *
 * @example
 * ```ts
 * import type { YajilinBoard, YajilinMountOptions } from "@johnmorrisdotca/kazu/yajilin";
 *
 * const yajilinBoard: YajilinBoard = {"width":5,"height":5,"clues":[{"direction":"left","count":0},null,{"direction":"right","count":1},null,{"direction":"up","count":0},null,null,null,null,null,{"direction":"right","count":0},null,{"direction":"left","count":0},null,{"direction":"down","count":1},{"direction":"left","count":0},null,null,null,null,null,{"direction":"up","count":1},{"direction":"down","count":0},null,{"direction":"down","count":0}]};
 * const value: YajilinMountOptions = {board:yajilinBoard};
 * console.log(value);
 * ```
 */
export type YajilinMountOptions = YajilinDrawOptions & { board: YajilinBoard; progress?: string; onChange?: (game: YajilinGame) => void; onFinish?: (game: YajilinGame) => void };
/** The mounted Yajilin game and progress, native controls and cleanup handle.
 *
 * @example
 * ```ts no-run
 * import type { YajilinBoard, YajilinMount } from "@johnmorrisdotca/kazu/yajilin";
 * import { mountYajilin } from "@johnmorrisdotca/kazu/yajilin/play";
 *
 * const yajilinBoard: YajilinBoard = {"width":5,"height":5,"clues":[{"direction":"left","count":0},null,{"direction":"right","count":1},null,{"direction":"up","count":0},null,null,null,null,null,{"direction":"right","count":0},null,{"direction":"left","count":0},null,{"direction":"down","count":1},{"direction":"left","count":0},null,null,null,null,null,{"direction":"up","count":1},{"direction":"down","count":0},null,{"direction":"down","count":0}]};
 * const host = document.createElement("div");
 * document.body.append(host);
 * const player: YajilinMount = mountYajilin(host,{board:yajilinBoard});
 * console.log(player.progress());
 * player.destroy();
 * ```
 */
export type YajilinMount = { game: () => YajilinGame; progress: () => string; set: (options: YajilinDrawOptions) => void; restart: () => void; destroy: () => void };
