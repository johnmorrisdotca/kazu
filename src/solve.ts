import { encodeCells } from "./cells.ts";
import { countSolutionsWithin, guessDepth as groupDepth, solutionOf as groupSolution } from "./groupSolve.ts";
import { layoutOfGivens, readGivens } from "./givens.ts";
import type { KazuKind } from "./kinds.ts";
import { countSolutions as countMarks, guessDepth as marksDepth, solutionOf as marksSolution } from "./moreOrLessSolve.ts";
import { countSolutions as countClues, guessDepth as cluesDepth, solutionOf as cluesSolution } from "./towersSolve.ts";

/**
 * How many answers a puzzle has, up to `limit` (two by default, so "many" costs no more than "two"):
 * 1 is a puzzle, 0 is a grid that cannot be finished, 2 is a guessing game. Null, never a number,
 * for givens that are not a puzzle of this kind and side, and for a search that ran past `budget`
 * steps (Sudoku, Jigsaw, Diagonal and Sum Cages count steps; the other two have no budget): "I
 * could not say" is not "there are none".
 */
export function countKazuSolutions(kind: KazuKind, size: number, givens: string, limit = 2, budget = Infinity): number | null {
  const read = readGivens(kind, size, givens);
  if (read === null) return null;
  if (kind === "more-or-less") return countMarks(read.cells, size, read.marks, limit);
  if (kind === "towers") return countClues(read.cells, size, read.clues!, limit);
  const layout = layoutOfGivens(read);
  return layout === null ? null : countSolutionsWithin(read.cells, layout, limit, budget);
}

/**
 * The one answer a puzzle's givens allow, as a cells code, or null when they allow none, more than
 * one, or the search ran past `budget` steps (Sudoku, Jigsaw, Diagonal and Sum Cages). A grid this
 * cannot vouch for is never handed back as though it were the answer.
 */
export function solveKazu(kind: KazuKind, size: number, givens: string, budget = 2_000_000): string | null {
  const read = readGivens(kind, size, givens);
  if (read === null) return null;
  let grid: number[] | null;
  if (kind === "more-or-less") grid = marksSolution(read.cells, size, read.marks);
  else if (kind === "towers") grid = cluesSolution(read.cells, size, read.clues!);
  else {
    const layout = layoutOfGivens(read);
    grid = layout === null ? null : groupSolution(read.cells, layout, budget);
  }
  return grid === null ? null : encodeCells(grid);
}

/**
 * How many guesses, each followed by everything reasoning then finds, a person needs to finish the
 * puzzle: 0 when reasoning alone finishes it (easy), 1 when one guess does (medium), more when more
 * (hard); Infinity when there is no answer. Null for givens that are not a puzzle. Meant for a
 * puzzle already known to have exactly one answer.
 */
export function kazuGuessDepth(kind: KazuKind, size: number, givens: string): number | null {
  const read = readGivens(kind, size, givens);
  if (read === null) return null;
  if (kind === "more-or-less") return marksDepth(read.cells, size, read.marks);
  if (kind === "towers") return cluesDepth(read.cells, size, read.clues!);
  const layout = layoutOfGivens(read);
  return layout === null ? null : groupDepth(read.cells, layout);
}
