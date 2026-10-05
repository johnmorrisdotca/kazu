import { checkAkari, isAkariBoard } from "./akariBoard.ts";
import { solveAkari } from "./akariSolve.ts";
import type { AkariBoard, AkariGame } from "./akari.types.ts";

/** Starts a game with only its public board data. */
export function newAkari(board: AkariBoard): AkariGame {
  if (!isAkariBoard(board)) throw new RangeError("Invalid Akari board");
  return {
    board: { width: board.width, height: board.height, cells: [...board.cells] },
    bulbs: [],
    history: [],
    helped: false,
  };
}

/** Toggles a bulb on a white square and keeps one prior turn for undo. */
export function toggleAkari(game: AkariGame, cell: number): AkariGame {
  if (!Number.isInteger(cell) || cell < 0 || cell >= game.board.cells.length || game.board.cells[cell] !== null) {
    return game;
  }
  const bulbs = game.bulbs.includes(cell)
    ? game.bulbs.filter(placed => placed !== cell)
    : [...game.bulbs, cell];
  return { ...game, bulbs, history: [...game.history, [...game.bulbs]] };
}

/** Restores the last bulb placement. */
export function undoAkari(game: AkariGame): AkariGame {
  const previous = game.history.at(-1);
  return previous
    ? { ...game, bulbs: [...previous], history: game.history.slice(0, -1) }
    : game;
}

/** A game is finished only when its bulbs satisfy every rule and light every white square. */
export function akariFinished(game: AkariGame): boolean {
  return checkAkari(game.board, game.bulbs).ok;
}

/** Returns a missing bulb, or an extra bulb to remove, only after uniqueness is proved. */
export function hintAkari(game: AkariGame): number | null {
  const solved = solveAkari(game.board);
  if (!solved.complete || solved.count !== 1 || !solved.solution) return null;
  return solved.solution.find(cell => !game.bulbs.includes(cell))
    ?? game.bulbs.find(cell => !solved.solution!.includes(cell))
    ?? null;
}

/** Encodes only public clues and player placements. */
export function encodeAkari(game: AkariGame): string {
  return JSON.stringify({ version: 1, board: game.board, bulbs: game.bulbs, helped: game.helped });
}

/** Decodes a bounded save after validating the board and each placement. */
export function decodeAkari(code: string): AkariGame | null {
  try {
    if (code.length > 40_000) return null;
    const value = JSON.parse(code);
    if (value.version !== 1 || !isAkariBoard(value.board) || !Array.isArray(value.bulbs)
      || value.bulbs.length > value.board.cells.length || typeof value.helped !== "boolean") return null;
    if (new Set(value.bulbs).size !== value.bulbs.length) return null;

    let game = newAkari(value.board);
    for (const cell of value.bulbs) {
      const next = toggleAkari(game, cell);
      if (next === game) return null;
      game = next;
    }
    return { ...game, history: [], helped: value.helped };
  } catch {
    return null;
  }
}
