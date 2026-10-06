import { JUOSAN_LEVELS, JUOSAN_MOST_NODES } from "./juosan.constants.ts";
import { isJuosanBoard } from "./juosan-board.ts";
import { solveJuosan } from "./juosan-solve.ts";
import { isKazuSeed } from "./random.ts";
import type { JuosanBoard, JuosanLevel, JuosanMark, JuosanPuzzle } from "./juosan.types.ts";

/** Makes an original small training puzzle and returns it only after uniqueness is proved. */
export function generateJuosan(
  width = 3,
  height = 2,
  level: JuosanLevel = "medium",
  seed = 1,
): JuosanPuzzle {
  const supported = (width === 3 && height === 2) || (width === 2 && height === 3);
  if (!isKazuSeed(seed) || !JUOSAN_LEVELS.includes(level) || !supported) {
    throw new RangeError("Juosan generation currently supports 3 × 2 and 2 × 3 boards");
  }

  const mark: JuosanMark = width > height ? 1 : 2;
  const territories = makeTrainingTerritories(width, height, seed);
  const board: JuosanBoard = { width, height, territories };
  if (!isJuosanBoard(board)) throw new RangeError("Invalid Juosan board");

  const counted = solveJuosan(board, 2, JUOSAN_MOST_NODES);
  if (
    !counted.complete ||
    counted.count !== 1 ||
    !counted.solution ||
    counted.solution.some(value => value !== mark)
  ) {
    throw new Error("The generated Juosan did not pass its uniqueness proof");
  }
  return { ...board, seed, level, solution: counted.solution };
}

function makeTrainingTerritories(
  width: number,
  height: number,
  seed: number,
): JuosanBoard["territories"] {
  const split = seed % 2 === 0;
  const cells = width > height
    ? (split ? [[0, 1, 2], [3, 4, 5]] : [[0, 1, 2, 3, 4, 5]])
    : (split ? [[0, 2, 4], [1, 3, 5]] : [[0, 1, 2, 3, 4, 5]]);

  return cells.map(group => ({ cells: group, difference: group.length }));
}
