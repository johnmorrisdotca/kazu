import { HEYAWAKE_MOST_NODES } from "./heyawake.constants.ts";
import { checkHeyawake, heyawakeCells, heyawakeNeighbours, isHeyawakeBoard, roomForCell } from "./heyawake-board.ts";
import type { HeyawakeBoard, HeyawakeSolve } from "./heyawake.types.ts";

/** Search for Heyawake answers up to the solution and node limits; completion distinguishes a proved result from exhausted work.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @param entries - Current row-major entries; omit to search from printed clues.
 * @param options - Solution/node limits or native SVG choices specified by the signature.
 * @returns Search for Heyawake answers up to the solution and node limits; completion distinguishes a proved result from exhausted work.
 * @example
 * ```ts
 * import type { HeyawakeBoard } from "@johnmorrisdotca/kazu/heyawake";
 * import { solveHeyawake } from "@johnmorrisdotca/kazu/heyawake";
 *
 * const heyawakeBoard: HeyawakeBoard = {"width":5,"height":5,"rooms":[{"x":0,"y":0,"width":1,"height":1,"blacks":0},{"x":0,"y":1,"width":1,"height":2,"blacks":0},{"x":0,"y":3,"width":1,"height":2,"blacks":1},{"x":1,"y":0,"width":1,"height":4,"blacks":1},{"x":1,"y":4,"width":1,"height":1,"blacks":0},{"x":2,"y":0,"width":3,"height":5,"blacks":3}]};
 * console.log(solveHeyawake(heyawakeBoard,undefined,{limit:2,nodes:20000}));
 * ```
 */
export function solveHeyawake(board: HeyawakeBoard, entries: readonly (boolean | null)[] = Array(board.width * board.height).fill(null), options: { limit?: number; nodes?: number } = {}): HeyawakeSolve {
  if (!isHeyawakeBoard(board)) throw new RangeError("Invalid Heyawake board");
  const limit = Math.max(1, Math.floor(options.limit ?? 2)), maxNodes = Math.max(1, Math.floor(options.nodes ?? HEYAWAKE_MOST_NODES));
  const work = [...entries], ids = roomForCell(board), roomCells = board.rooms.map(room => heyawakeCells(board, room)!);
  if (work.length !== board.width * board.height || work.some(value => value !== true && value !== false && value !== null)) throw new RangeError("Invalid Heyawake entries");
  let count = 0, nodes = 0, solution: readonly boolean[] | null = null, stopped = false;
  const visit = (index: number): void => {
    if (count >= limit || stopped) return;
    if (++nodes > maxNodes) { stopped = true; return; }
    if (index === work.length) {
      const checked = checkHeyawake(board, work);
      if (checked.ok) { count += 1; solution ??= work.map(value => value === true); }
      return;
    }
    if (work[index] !== null) { visit(index + 1); return; }
    const optionsAtCell = [false, true];
    for (const black of optionsAtCell) {
      if (black && heyawakeNeighbours(board, index).some(next => work[next] === true)) continue;
      work[index] = black;
      const room = board.rooms[ids[index]!]!, cells = roomCells[ids[index]!]!;
      if (room.blacks !== null) {
        const marked = cells.filter(cell => work[cell] === true).length;
        const unknown = cells.filter(cell => work[cell] === null).length;
        if (marked > room.blacks || marked + unknown < room.blacks) { work[index] = null; continue; }
      }
      visit(index + 1);
      work[index] = null;
      if (count >= limit || stopped) break;
    }
  };
  visit(0);
  return { count, solution, nodes: Math.min(nodes, maxNodes), complete: !stopped && count < limit };
}
