import { JUOSAN_MOST_NODES } from "./juosan.constants.ts";
import { checkJuosan, isJuosanBoard } from "./juosan-board.ts";
import type { JuosanBoard, JuosanMark, JuosanSolve } from "./juosan.types.ts";

/** Counts labeled solutions up to a limit; `complete` distinguishes exhaustion from cutoff. */
export function solveJuosan(
  board: JuosanBoard,
  limit = 2,
  maxNodes = JUOSAN_MOST_NODES,
): JuosanSolve {
  if (
    !isJuosanBoard(board) ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    !Number.isInteger(maxNodes) ||
    maxNodes < 1
  ) {
    throw new RangeError("Invalid Juosan search settings");
  }

  const cellCount = board.width * board.height;
  const marks = Array(cellCount).fill(0) as (0 | JuosanMark)[];
  const solutions: JuosanMark[][] = [];
  const territoryAt = Array(cellCount).fill(-1);
  board.territories.forEach((territory, index) => {
    territory.cells.forEach(cell => {
      territoryAt[cell] = index;
    });
  });

  let nodes = 0;
  let cutOff = false;

  const visit = (cell: number): void => {
    if (solutions.length >= limit) return;
    if (nodes >= maxNodes) {
      cutOff = true;
      return;
    }
    nodes += 1;

    if (cell === cellCount) {
      const answer = marks as JuosanMark[];
      if (checkJuosan(board, answer).ok) solutions.push([...answer]);
      return;
    }

    const x = cell % board.width;
    const y = Math.floor(cell / board.width);
    const territory = board.territories[territoryAt[cell]];
    for (const mark of [1, 2] as const) {
      if (
        mark === 2 &&
        x >= 2 &&
        marks[cell - 1] === 2 &&
        marks[cell - 2] === 2
      ) {
        continue;
      }
      if (
        mark === 1 &&
        y >= 2 &&
        marks[cell - board.width] === 1 &&
        marks[cell - 2 * board.width] === 1
      ) {
        continue;
      }

      marks[cell] = mark;
      if (!canStillMeetDifference(territory.cells, marks, territory.difference)) {
        marks[cell] = 0;
        continue;
      }

      visit(cell + 1);
      marks[cell] = 0;
      if (solutions.length >= limit || cutOff) return;
    }
  };

  visit(0);
  return {
    count: solutions.length,
    solution: solutions[0] ?? null,
    complete: !cutOff && solutions.length < limit,
    nodes,
  };
}

function canStillMeetDifference(
  cells: readonly number[],
  marks: readonly (0 | JuosanMark)[],
  difference: number | null,
): boolean {
  if (difference === null) return true;

  const assigned = cells.filter(cell => marks[cell] !== 0);
  const horizontal = assigned.filter(cell => marks[cell] === 1).length;
  const vertical = assigned.length - horizontal;
  const remaining = cells.length - assigned.length;
  const smallestDifference = Math.max(0, Math.abs(horizontal - vertical) - remaining);
  const largestDifference = Math.abs(horizontal - vertical) + remaining;
  return smallestDifference <= difference && largestDifference >= difference;
}
