import { AKARI_DENSER_ATTEMPTS, AKARI_DENSER_CROWDS, AKARI_LEVELS, AKARI_MOST_ATTEMPTS, AKARI_MOST_SIDE } from "./akari.constants.ts";
import { akariNeighbours, akariVisible, checkAkari, isAkariBoard } from "./akari-board.ts";
import { akariModel } from "./akari-logic.ts";
import { solveAkari } from "./akari-solve.ts";
import { templateAkari } from "./akari-template.ts";
import { logicCsp, openSlots } from "./csp.ts";
import { isKazuSeed, seededRandom, shuffled } from "./random.ts";
import type { AkariBoard, AkariLevel, AkariPuzzle } from "./akari.types.ts";
import type { Random } from "./random.ts";

type Cells = (number | null | false)[];

/**
 * Makes a seeded board and proves it has one answer. A random wall of black squares is lit by randomly placed
 * bulbs, every black square that touches a white one is numbered, and then numbers are taken away for as long as
 * the puzzle can still be solved the way the level asks: easy and medium by the rules alone (easy keeps most
 * of its numbers), hard by supposing one square at a time, extra-hard for as long as the answer stays single,
 * which leaves a board that needs more supposing than that. If no board of the level is found within the
 * attempts, the next one down is tried; if none of the levels finds one, the same is tried again with more
 * black squares, which a large board needs to be solvable at all (see `AKARI_DENSER_CROWDS`). The fixed lattice
 * of the first generator is only what is left if even that fails, which no seed does at any size offered.
 */
export function generateAkari(width = 7, height = width, seed = 1, level: AkariLevel = "medium"): AkariPuzzle {
  if (![width, height].every(n => Number.isInteger(n) && n >= 2 && n <= AKARI_MOST_SIDE)
    || !isKazuSeed(seed) || !AKARI_LEVELS.includes(level)) throw new RangeError("Invalid Akari settings");
  const random = seededRandom(seed);
  // The plain attempts come first, as they always have, so every seed that made a board before makes the same one.
  for (let aim = AKARI_LEVELS.indexOf(level); aim >= 0; aim -= 1) {
    const found = bestAkari(width, height, AKARI_LEVELS[aim]!, random, 1, AKARI_MOST_ATTEMPTS);
    if (found) return { ...found.board, seed, level, solution: found.solution };
  }
  for (const crowd of AKARI_DENSER_CROWDS) for (let aim = AKARI_LEVELS.indexOf(level); aim >= 0; aim -= 1) {
    const found = bestAkari(width, height, AKARI_LEVELS[aim]!, random, crowd, AKARI_DENSER_ATTEMPTS);
    if (found) return { ...found.board, seed, level, solution: found.solution };
  }
  const fallback = templateAkari(width, height, seed);
  return { ...fallback, level };
}

/** The best board of the level found within `attempts` tries at this share of black squares, with its answer, or null. */
function bestAkari(width: number, height: number, level: AkariLevel, random: Random, crowd: number, attempts: number): { board: AkariBoard; solution: readonly number[] } | null {
  // Extra-hard is the hardest of several boards that need supposing: the most suppositions wins.
  const wanted = level === "extra-hard" ? 8 : 1;
  let best: { board: AkariBoard; probes: number; solution: readonly number[] } | null = null, found = 0;
  for (let attempt = 0; attempt < attempts && found < wanted; attempt += 1) {
    const made = attemptAkari(width, height, level, random, crowd);
    if (!made) continue;
    const proof = solveAkari(made.board, { limit: 2 });
    if (!proof.complete || proof.count !== 1 || !proof.solution || !checkAkari(made.board, proof.solution).ok) continue;
    found += 1;
    if (!best || made.probes > best.probes) best = { board: made.board, probes: made.probes, solution: proof.solution };
  }
  return best;
}

function attemptAkari(width: number, height: number, level: AkariLevel, random: Random, crowd: number): { board: AkariBoard; probes: number } | null {
  const size = width * height;
  const density = { easy: .2, medium: .22, hard: .24, "extra-hard": .26 }[level] * (.85 + random() * .3) * crowd;
  const cells: Cells = Array.from({ length: size }, () => random() < density ? false : null);
  if (random() < .5) for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    const mirror = (height - 1 - y) * width + width - 1 - x;
    if (y * width + x < mirror) cells[mirror] = cells[y * width + x]!;
  }
  if (!cells.includes(null)) return null;
  const base: AkariBoard = { width, height, cells };

  // Light every white square with randomly chosen bulbs that never see one another.
  const lit = new Set<number>(), bulbs = new Set<number>();
  for (const cell of shuffled(cells.flatMap((value, at) => value === null ? [at] : []), random)) {
    if (lit.has(cell)) continue;
    bulbs.add(cell);
    for (const seen of akariVisible(base, cell)) lit.add(seen);
  }
  const numbered = cells.flatMap((value, at) => value === false && akariNeighbours(base, at).some(n => cells[n] === null) ? [at] : []);
  for (const at of numbered) cells[at] = akariNeighbours(base, at).filter(n => bulbs.has(n)).length;
  if (!numbered.length) return null;

  const accepts = (): boolean => {
    const { csp } = akariModel({ width, height, cells });
    return logicCsp(csp, openSlots(csp), level === "easy" || level === "medium" ? 0 : 1).solved;
  };
  if (!accepts()) return null;
  const keepAtLeast = level === "easy" ? Math.ceil(numbered.length * .7) : 0;
  let left = numbered.length;
  for (const at of shuffled(numbered, random)) {
    if (left <= keepAtLeast) break;
    const was = cells[at]!;
    cells[at] = false;
    if (accepts()) left -= 1; else cells[at] = was;
  }
  const board: AkariBoard = { width, height, cells };
  if (!isAkariBoard(board)) return null;
  const { csp } = akariModel(board);
  if (level === "easy" || level === "medium") return { board, probes: 0 };
  if (logicCsp(csp, openSlots(csp), 0).solved) return null;
  const probing = logicCsp(csp, openSlots(csp), 1);
  if (!probing.solved) return level === "extra-hard" ? { board, probes: 1_000 } : null;
  return probing.probes >= Math.max(2, Math.round(size * .02)) ? { board, probes: probing.probes } : null;
}
