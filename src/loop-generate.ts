import { LOOP_LEVELS, LOOP_MOST_ATTEMPTS, LOOP_MOST_SIDE } from "./loop.constants.ts";
import { checkLoop, loopCellEdges } from "./loop-board.ts";
import { loopModel } from "./loop-logic.ts";
import { solveLoop } from "./loop-solve.ts";
import { templateLoop } from "./loop-template.ts";
import { countCsp, logicCsp, openSlots } from "./csp.ts";
import { isKazuSeed, seededRandom, shuffled } from "./random.ts";
import type { LoopBoard, LoopLevel, LoopPuzzle } from "./loop.types.ts";
import type { Random } from "./random.ts";

/**
 * Makes a seeded puzzle and proves it has one answer. A random winding loop is grown cell by cell, every square is
 * numbered with how many of its edges the loop uses, and then numbers are taken away for as long as the puzzle can
 * still be solved the way the level asks: easy and medium by the rules alone (easy keeps most numbers), hard by
 * supposing one edge at a time, extra-hard the most-supposing of several such boards. Numbers that say 0 are
 * taken away first, because they say least. If no board of the level is found within the attempts the next level
 * down is tried, and the first generator, which cannot fail, is the last.
 */
export function generateLoop(width = 5, height = width, seed = 1, level: LoopLevel = "medium"): LoopPuzzle {
  if (![width, height].every(side => Number.isInteger(side) && side >= 2 && side <= LOOP_MOST_SIDE)
    || !isKazuSeed(seed) || !LOOP_LEVELS.includes(level)) throw new RangeError("Invalid Loop settings");
  const random = seededRandom(seed);
  // The work an attempt does is counted in rule runs, never in time, so a seed makes the same puzzle on every machine. When a level has used its share the next one down is tried.
  const work = { calls: 0, limit: width * height * 900 };
  for (let aim = LOOP_LEVELS.indexOf(level); aim >= 0; aim -= 1) {
    work.calls = 0;
    const aimed = LOOP_LEVELS[aim]!;
    const wanted = 1;
    let best: { board: LoopBoard; probes: number } | null = null, found = 0;
    for (let attempt = 0; attempt < LOOP_MOST_ATTEMPTS && found < wanted && work.calls < work.limit; attempt += 1) {
      const made = attemptLoop(width, height, aimed, random, work);
      if (!made) continue;
      found += 1;
      if (!best || made.probes > best.probes) best = made;
    }
    if (best) {
      const proof = solveLoop(best.board);
      if (proof.complete && proof.count === 1 && proof.solution && checkLoop(best.board, proof.solution).ok) {
        return { ...best.board, seed, level, solution: proof.solution };
      }
    }
  }
  return { ...templateLoop(width, height, seed), level };
}

/** The loop of a random region of squares: connected, without a hole, and never touching itself at a corner. */
function growRegion(width: number, height: number, share: number, thin: number, random: Random): Uint8Array {
  const stride = width + 2, inside = new Uint8Array(stride * (height + 2));
  const at = (x: number, y: number) => (y + 1) * stride + x + 1;
  const target = Math.max(2, Math.round(width * height * share));
  const start = at(Math.floor(random() * width), Math.floor(random() * height));
  inside[start] = 1;
  let size = 1;
  const outsideReaches = (): boolean => {
    // Every square not in the region must still be reachable from beyond the board.
    const seen = new Uint8Array(inside.length), stack = [0];
    seen[0] = 1;
    let reached = 1;
    while (stack.length) {
      const cell = stack.pop()!;
      for (const next of [cell - 1, cell + 1, cell - stride, cell + stride]) {
        if (next < 0 || next >= inside.length || seen[next] || inside[next]) continue;
        seen[next] = 1; reached += 1; stack.push(next);
      }
    }
    return reached === inside.length - size;
  };
  while (size < target) {
    const options: { cell: number; touching: number }[] = [];
    for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
      const cell = at(x, y);
      if (inside[cell]) continue;
      const touching = (inside[cell - 1]! + inside[cell + 1]! + inside[cell - stride]! + inside[cell + stride]!);
      if (!touching) continue;
      // Two squares touching only at a corner would pinch the loop where it passes itself.
      if ([[cell - 1, cell - stride, cell - stride - 1], [cell + 1, cell - stride, cell - stride + 1], [cell - 1, cell + stride, cell + stride - 1], [cell + 1, cell + stride, cell + stride + 1]]
        .some(([a, b, diagonal]) => inside[diagonal!] && !inside[a!] && !inside[b!])) continue;
      inside[cell] = 1; size += 1;
      const fine = outsideReaches();
      inside[cell] = 0; size -= 1;
      if (!fine) continue;
      options.push({ cell, touching });
    }
    if (!options.length) break;
    const thinnest = options.filter(option => option.touching === 1);
    const pool = thinnest.length && random() < thin ? thinnest : options;
    inside[pool[Math.floor(random() * pool.length)]!.cell] = 1;
    size += 1;
  }
  const region = new Uint8Array(width * height);
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) region[y * width + x] = inside[at(x, y)]!;
  return region;
}

function loopOf(width: number, height: number, region: Uint8Array): Set<number> {
  const blank: LoopBoard = { width, height, clues: Array(width * height).fill(null) };
  const edges = new Set<number>();
  for (let cell = 0; cell < region.length; cell += 1) {
    if (!region[cell]) continue;
    const [top, right, bottom, left] = loopCellEdges(blank, cell)!;
    const x = cell % width;
    if (cell < width || !region[cell - width]) edges.add(top);
    if (x === width - 1 || !region[cell + 1]) edges.add(right);
    if (cell >= width * (height - 1) || !region[cell + width]) edges.add(bottom);
    if (x === 0 || !region[cell - 1]) edges.add(left);
  }
  return edges;
}

function attemptLoop(width: number, height: number, level: LoopLevel, random: Random, work: { calls: number }): { board: LoopBoard; probes: number } | null {
  const share = { easy: .45, medium: .5, hard: .55, "extra-hard": .6 }[level] * (.9 + random() * .2);
  const region = growRegion(width, height, share, .75, random);
  const edges = loopOf(width, height, region);
  const blank: LoopBoard = { width, height, clues: Array(width * height).fill(null) };
  const full = Array.from({ length: width * height }, (_, cell) => loopCellEdges(blank, cell)!.filter(edge => edges.has(edge)).length);
  const clues: (number | null)[] = [...full];
  let calls = 0;
  const csp = () => {
    const { csp: model } = loopModel({ width, height, clues });
    return { ...model, propagate: (alive: Uint8Array, decided?: number) => { calls += 1; work.calls += 1; return model.propagate(alive, decided); } };
  };
  const byRules = (): boolean => { const c = csp(); return logicCsp(c, openSlots(c), 0).solved; };
  const bySupposing = (): boolean => {
    const c = csp();
    const count = countCsp(c, openSlots(c), 2, 800);
    if (!count.exhausted && count.count !== 1) return false;
    return logicCsp(c, openSlots(c), 1).solved;
  };
  if (!byRules()) return null;
  const order = shuffled(clues.map((_, cell) => cell), random).sort((a, b) => (full[a] === 0 ? 0 : 1) - (full[b] === 0 ? 0 : 1));
  const keepAtLeast = level === "easy" ? Math.ceil(width * height * .7) : 0;
  let left = clues.length;
  /** Takes numbers away while `test` still passes, until `spent` says the work is used up or `done` says the board is hard enough. */
  const thin = (test: () => boolean, spent: () => boolean, done: () => boolean = () => false): void => {
    for (const cell of order) {
      if (clues[cell] === null) continue;
      if (left <= keepAtLeast || spent()) return;
      const was = clues[cell]!;
      clues[cell] = null;
      if (!test()) { clues[cell] = was; continue; }
      left -= 1;
      if (done()) return;
    }
  };
  thin(byRules, () => false);
  // Hard stops thinning when its share of work is used; extra-hard is given four times as much and so ends sparser.
  const budget = width * height * (level === "extra-hard" ? 420 : 120);
  const from = calls;
  if (level === "hard" || level === "extra-hard") thin(bySupposing, () => calls - from > budget);
  const board: LoopBoard = { width, height, clues };
  const c = csp();
  if (logicCsp(c, openSlots(c), 0).solved) return level === "easy" || level === "medium" ? { board, probes: 0 } : null;
  if (level === "easy" || level === "medium") return null;
  const probing = logicCsp(c, openSlots(c), 1);
  return probing.solved ? { board, probes: probing.probes } : level === "extra-hard" ? { board, probes: 1_000 } : null;
}
