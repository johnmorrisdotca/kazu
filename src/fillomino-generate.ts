import { FILLOMINO_LEAST_GENERATED_SIDE, FILLOMINO_LEVELS, FILLOMINO_MOST_ATTEMPTS, FILLOMINO_MOST_SIDE } from "./fillomino.constants.ts";
import { checkFillomino } from "./fillomino-board.ts";
import { partitionFillomino } from "./fillomino-build.ts";
import { fillominoModel, fillominoMostValue } from "./fillomino-logic.ts";
import { solveFillomino } from "./fillomino-solve.ts";
import { countCsp, decide, logicCsp, openSlots } from "./csp.ts";
import { isKazuSeed, seededRandom, shuffled } from "./random.ts";
import type { FillominoBoard, FillominoLevel, FillominoPuzzle } from "./fillomino.types.ts";
import type { Random } from "./random.ts";

/**
 * Makes a seeded puzzle and proves its answer is the only one. The board is cut into connected regions, each holding
 * its own size, with no two of one size touching; every square starts given, and givens are taken away for as long as
 * the puzzle can still be solved the way the level asks: easy and medium by the rules alone (easy keeps most givens),
 * hard by supposing one number at a time, extra-hard for as long as the answer stays single. If no board of the level
 * is found within the attempts the next level down is tried, and a puzzle that gives every square is the last resort.
 */
export function generateFillomino(
  width = 5,
  height = width,
  level: FillominoLevel = "medium",
  seed = 1,
): FillominoPuzzle {
  if (![width, height].every(value => Number.isInteger(value) && value >= FILLOMINO_LEAST_GENERATED_SIDE && value <= FILLOMINO_MOST_SIDE)
    || !FILLOMINO_LEVELS.includes(level) || !isKazuSeed(seed)) {
    throw new RangeError("Fillomino generation supports 4–12 cells per side and a valid level and seed");
  }
  const random = seededRandom(seed);
  for (let aim = FILLOMINO_LEVELS.indexOf(level); aim >= 0; aim -= 1) {
    const aimed = FILLOMINO_LEVELS[aim]!;
    for (let attempt = 0; attempt < FILLOMINO_MOST_ATTEMPTS; attempt += 1) {
      const solution = partitionFillomino(width, height, aimed, random);
      if (!solution) continue;
      const board = thin(width, height, solution, aimed, random);
      if (!board) continue;
      const proof = solveFillomino(board);
      if (proof.complete && proof.count === 1 && proof.solution && checkFillomino(board, proof.solution).ok) {
        return { ...board, seed, level, solution: proof.solution };
      }
    }
  }
  const board: FillominoBoard = { width, height, givens: [] };
  const answer = partitionFillomino(width, height, "easy", random) ?? Array<number>(width * height).fill(1);
  return { ...board, givens: [...answer], seed, level, solution: answer };
}

/** Takes givens away from a full answer while the level's way of solving still works; null when the result is not the level. */
function thin(width: number, height: number, solution: readonly number[], level: FillominoLevel, random: Random): FillominoBoard | null {
  const givens = [...solution];
  let calls = 0;
  const model = () => {
    const { csp: inner, most } = fillominoModel({ width, height, givens }, givens);
    const csp = { ...inner, propagate: (alive: Uint8Array, decided?: number) => { calls += 1; return inner.propagate(alive, decided); } };
    const start = openSlots(csp);
    givens.forEach((value, cell) => { if (value) decide(csp, start, cell, cell * most + value - 1); });
    return { csp, start };
  };
  // A region with no given can be as big as the squares with none joined together, which the solver must allow for; keeping
  // those stretches short keeps every proof short, and keeps the board fair: no vast blank area.
  const roomy = (): boolean => fillominoMostValue({ width, height, givens }, givens) > Math.max(12, Math.max(...solution));
  const byRules = (): boolean => { const { csp, start } = model(); return logicCsp(csp, start, 0).solved; };
  const unique = (): boolean => { const { csp, start } = model(); const count = countCsp(csp, start, 2, 500); return !count.exhausted && count.count === 1; };
  const bySupposing = (): boolean => { const { csp, start } = model(); return logicCsp(csp, start, 1).solved; };
  const keepAtLeast = level === "easy" ? Math.ceil(solution.length * .5) : 0;
  let left = givens.length;
  const order = shuffled(givens.map((_, i) => i), random);
  // First as many as the rules alone allow.
  for (const cell of order) {
    if (left <= keepAtLeast) break;
    const was = givens[cell]!;
    givens[cell] = 0;
    if (!roomy() && byRules()) left -= 1; else givens[cell] = was;
  }
  if (level === "easy" || level === "medium") return { width, height, givens };
  // Then, beyond the rules: hard takes the first given that leaves a board solved by supposing, extra-hard keeps going while the answer stays single.
  let taken = 0;
  const from = calls, budget = width * height * 60;
  for (const cell of order) {
    if (!givens[cell] || calls - from > budget) continue;
    const was = givens[cell]!;
    givens[cell] = 0;
    if (!roomy() && unique() && (level === "extra-hard" || bySupposing())) { taken += 1; if (taken >= (level === "hard" ? 3 : 6)) break; } else givens[cell] = was;
  }
  if (!taken || byRules()) return null;
  return { width, height, givens };
}
