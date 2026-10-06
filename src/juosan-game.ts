import { checkJuosan, isJuosanBoard } from "./juosan-board.ts";
import { solveJuosan } from "./juosan-solve.ts";
import type { JuosanBoard, JuosanGame, JuosanMark } from "./juosan.types.ts";

/** Starts a game with a copy of its public board and no generated answer. */
export function newJuosan(board: JuosanBoard): JuosanGame {
  if (!isJuosanBoard(board)) throw new RangeError("Invalid Juosan board");
  return {
    board: {
      width: board.width,
      height: board.height,
      territories: board.territories.map(territory => ({
        cells: [...territory.cells],
        difference: territory.difference,
      })),
    },
    marks: Array(board.width * board.height).fill(0),
    history: [],
    helped: false,
  };
}

/** Writes a mark and records the previous state; invalid or unchanged moves are ignored. */
export function setJuosanMark(
  game: JuosanGame,
  cell: number,
  mark: JuosanMark,
): JuosanGame {
  if (
    !Number.isInteger(cell) ||
    cell < 0 ||
    cell >= game.marks.length ||
    (mark !== 1 && mark !== 2) ||
    game.marks[cell] === mark
  ) {
    return game;
  }

  const marks = [...game.marks];
  marks[cell] = mark;
  return { ...game, marks, history: [...game.history, [...game.marks]] };
}

/** Restores the preceding mark state, if one exists. */
export function undoJuosan(game: JuosanGame): JuosanGame {
  const previous = game.history.at(-1);
  return previous
    ? { ...game, marks: [...previous], history: game.history.slice(0, -1) }
    : game;
}

/** Clears the board while retaining whether the player used a hint. */
export function restartJuosan(game: JuosanGame): JuosanGame {
  return { ...newJuosan(game.board), helped: game.helped };
}

/** Whether every cell is filled and the independent checker accepts the board. */
export function juosanFinished(game: JuosanGame): boolean {
  return (
    game.marks.every(mark => mark !== 0) &&
    checkJuosan(game.board, game.marks).ok
  );
}

/** Returns one next mark only when the public clues prove a unique answer. */
export function hintJuosan(
  game: JuosanGame,
): { cell: number; mark: JuosanMark } | null {
  const counted = solveJuosan(game.board, 2);
  if (!counted.complete || counted.count !== 1 || !counted.solution) return null;

  const cell = game.marks.findIndex((mark, index) => mark !== counted.solution![index]);
  return cell < 0 ? null : { cell, mark: counted.solution[cell] };
}

/** Serializes public clues, placements, and assisted status. */
export function encodeJuosan(game: JuosanGame): string {
  return JSON.stringify({
    version: 1,
    board: game.board,
    marks: game.marks,
    helped: game.helped,
  });
}

/** Reads a bounded public save; malformed or incompatible data returns null. */
export function decodeJuosan(code: string): JuosanGame | null {
  try {
    if (code.length > 40_000) return null;
    const value = JSON.parse(code);
    if (
      value.version !== 1 ||
      !isJuosanBoard(value.board) ||
      !Array.isArray(value.marks) ||
      value.marks.length !== value.board.width * value.board.height ||
      value.marks.some((mark: unknown) => mark !== 0 && mark !== 1 && mark !== 2) ||
      typeof value.helped !== "boolean"
    ) {
      return null;
    }
    return { ...newJuosan(value.board), marks: [...value.marks], helped: value.helped };
  } catch {
    return null;
  }
}
