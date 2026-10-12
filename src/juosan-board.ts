import { JUOSAN_MOST_SIDE } from "./juosan.constants.ts";
import type { JuosanBoard, JuosanCheck, JuosanMark } from "./juosan.types.ts";

/** Whether territories partition a bounded board and each territory is connected.
 *
 * @param value - A candidate board, digit, mark or encoded game specified by this signature.
 * @returns Whether territories partition a bounded board and each territory is connected.
 * @example
 * ```ts
 * import type { JuosanBoard } from "@johnmorrisdotca/kazu/juosan";
 * import { isJuosanBoard } from "@johnmorrisdotca/kazu/juosan";
 *
 * const juosanBoard: JuosanBoard = {"width":3,"height":2,"territories":[{"cells":[0,1,2],"difference":3},{"cells":[3,4,5],"difference":3}]};
 * console.log(isJuosanBoard(juosanBoard));
 * ```
 */
export function isJuosanBoard(value: unknown): value is JuosanBoard {
  if (!value || typeof value !== "object") return false;

  const board = value as JuosanBoard;
  if (
    !Number.isInteger(board.width) ||
    board.width < 2 ||
    board.width > JUOSAN_MOST_SIDE ||
    !Number.isInteger(board.height) ||
    board.height < 2 ||
    board.height > JUOSAN_MOST_SIDE ||
    !Array.isArray(board.territories)
  ) {
    return false;
  }

  const cellCount = board.width * board.height;
  const occupied = new Set<number>();
  for (const territory of board.territories) {
    if (
      !territory ||
      !Array.isArray(territory.cells) ||
      territory.cells.length === 0 ||
      !(
        territory.difference === null ||
        (Number.isInteger(territory.difference) &&
          territory.difference >= 0 &&
          territory.difference <= territory.cells.length)
      )
    ) {
      return false;
    }

    for (const cell of territory.cells) {
      if (
        !Number.isInteger(cell) ||
        cell < 0 ||
        cell >= cellCount ||
        occupied.has(cell)
      ) {
        return false;
      }
      occupied.add(cell);
    }

    const members = new Set(territory.cells);
    const reached = new Set<number>([territory.cells[0]]);
    const queue = [territory.cells[0]];
    while (queue.length > 0) {
      const cell = queue.pop()!;
      const x = cell % board.width;
      const y = Math.floor(cell / board.width);
      const neighbors = [
        x > 0 ? cell - 1 : -1,
        x + 1 < board.width ? cell + 1 : -1,
        y > 0 ? cell - board.width : -1,
        y + 1 < board.height ? cell + board.width : -1,
      ];
      for (const neighbor of neighbors) {
        if (members.has(neighbor) && !reached.has(neighbor)) {
          reached.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    if (reached.size !== members.size) return false;
  }

  return occupied.size === cellCount;
}

/** Returns the index of the territory containing a cell, or -1 when absent.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @param cell - A zero-based row-major cell index.
 * @returns Returns the index of the territory containing a cell, or -1 when absent.
 * @example
 * ```ts
 * import type { JuosanBoard } from "@johnmorrisdotca/kazu/juosan";
 * import { juosanTerritoryAt } from "@johnmorrisdotca/kazu/juosan";
 *
 * const juosanBoard: JuosanBoard = {"width":3,"height":2,"territories":[{"cells":[0,1,2],"difference":3},{"cells":[3,4,5],"difference":3}]};
 * console.log(juosanTerritoryAt(juosanBoard,0));
 * ```
 */
export function juosanTerritoryAt(board: JuosanBoard, cell: number): number {
  return board.territories.findIndex(territory => territory.cells.includes(cell));
}

/** Checks public rules directly, independently of the solver and stored answer.
 *
 * @param board - The valid native board with its printed clues and dimensions.
 * @param marks - The current horizontal, vertical or blank Juosan marks.
 * @returns Checks public rules directly, independently of the solver and stored answer.
 * @example
 * ```ts
 * import type { JuosanBoard, JuosanPuzzle } from "@johnmorrisdotca/kazu/juosan";
 * import { checkJuosan } from "@johnmorrisdotca/kazu/juosan";
 *
 * const juosanBoard: JuosanBoard = {"width":3,"height":2,"territories":[{"cells":[0,1,2],"difference":3},{"cells":[3,4,5],"difference":3}]};
 * const juosanSolution: JuosanPuzzle["solution"] = [1,1,1,1,1,1];
 * console.log(checkJuosan(juosanBoard,juosanSolution));
 * ```
 */
export function checkJuosan(
  board: JuosanBoard,
  marks: readonly JuosanMark[],
): JuosanCheck {
  if (!isJuosanBoard(board)) throw new RangeError("Invalid Juosan board");
  if (
    !Array.isArray(marks) ||
    marks.length !== board.width * board.height ||
    marks.some(mark => mark !== 1 && mark !== 2)
  ) {
    return { ok: false, errors: [-1] };
  }

  const errors: number[] = [];
  board.territories.forEach((territory, index) => {
    if (territory.difference === null) return;
    const horizontal = territory.cells.filter(cell => marks[cell] === 1).length;
    const vertical = territory.cells.length - horizontal;
    if (Math.abs(horizontal - vertical) !== territory.difference) errors.push(index);
  });

  for (let y = 0; y < board.height; y += 1) {
    for (let x = 0; x < board.width; x += 1) {
      const cell = y * board.width + x;
      if (
        x + 2 < board.width &&
        marks[cell] === 2 &&
        marks[cell + 1] === 2 &&
        marks[cell + 2] === 2
      ) {
        errors.push(-2);
      }
      if (
        y + 2 < board.height &&
        marks[cell] === 1 &&
        marks[cell + board.width] === 1 &&
        marks[cell + 2 * board.width] === 1
      ) {
        errors.push(-3);
      }
    }
  }

  return { ok: errors.length === 0, errors: [...new Set(errors)] };
}
