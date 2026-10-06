// Measures how hard the generated puzzles of the six grid kinds are, and how long they take to make.
//
//   pnpm build && node scripts/measure-levels.mjs                 every kind, every size, 30 seeds
//   node scripts/measure-levels.mjs cross-sums 40                     one kind, 40 seeds
//   node scripts/measure-levels.mjs cross-sums 200 12                 one kind, 200 seeds, one size
//   node scripts/measure-levels.mjs --show akari 7 hard 3         one puzzle, drawn in text
//
// For every kind, size and level it makes the puzzle for seeds 1 to N, checks the answer with the package's own solver
// (exactly one), rates it with the kind's rateX, and prints a markdown table: the share made, the median, 95th
// percentile and slowest time in milliseconds, and the means of what the rating measures.
import { performance } from "node:perf_hooks";
import process from "node:process";

import * as akari from "../dist/akari-entry.js";
import * as regions from "../dist/regions-entry.js";
import * as hitori from "../dist/hitori-entry.js";
import * as crossSums from "../dist/cross-sums-entry.js";
import * as shikaku from "../dist/shikaku-entry.js";
import * as loop from "../dist/loop-entry.js";

const LEVELS = ["easy", "medium", "hard", "extra-hard"];

/** What each kind makes, rates and counts, and which numbers of its rating are worth a column. */
const KINDS = {
  shikaku: {
    sizes: shikaku.SHIKAKU_SIZES,
    make: (n, level, seed) => shikaku.generateShikaku(n, n, level, seed),
    count: (puzzle) => shikaku.solveShikaku(puzzle),
    rate: shikaku.rateShikaku,
    columns: ["rules", "probes", "rectangles", "meanArea", "largest", "ambiguity"],
  },
  akari: {
    sizes: akari.AKARI_SIZES,
    make: (n, level, seed) => akari.generateAkari(n, n, seed, level),
    count: (puzzle) => akari.solveAkari(puzzle),
    rate: akari.rateAkari,
    columns: ["probes", "clues", "clueShare", "openShare", "bulbs"],
  },
  loop: {
    sizes: loop.LOOP_SIZES,
    make: (n, level, seed) => loop.generateLoop(n, n, seed, level),
    count: (puzzle) => loop.solveLoop(puzzle),
    rate: loop.rateLoop,
    columns: ["probes", "clues", "clueShare", "zeroShare", "loop"],
  },
  hitori: {
    sizes: hitori.HITORI_SIZES,
    make: (n, level, seed) => hitori.generateHitori(n, seed, level),
    count: (puzzle) => hitori.solveHitori(puzzle),
    rate: hitori.rateHitori,
    columns: ["reach", "probes", "shaded", "shadedShare", "repeatShare"],
  },
  regions: {
    sizes: regions.REGIONS_SIZES,
    make: (n, level, seed) => regions.generateRegions(n, n, level, seed),
    count: (puzzle) => regions.solveRegions(puzzle),
    rate: regions.rateRegions,
    columns: ["probes", "givens", "givenShare", "regions", "unnamed", "largest", "meanRegion"],
  },
  "cross-sums": {
    sizes: crossSums.CROSS_SUMS_SIZES,
    make: (n, level, seed) => crossSums.generateCrossSums(seed, level, n),
    count: (puzzle) => crossSums.solveCrossSums(puzzle),
    rate: crossSums.rateCrossSums,
    columns: ["plain", "probes", "whites", "runs", "longest", "meanRun", "fixedShare"],
  },
};

const quantile = (sorted, q) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
const shown = (value) => (typeof value === "boolean" ? (value ? "1" : "0") : Number.isInteger(value) ? String(value) : value.toFixed(2));

/** The puzzle as text: a number where the puzzle gives one, and the answer's own marks where it has them. */
function draw(kind, puzzle) {
  const rows = [];
  if (kind === "akari") {
    for (let y = 0; y < puzzle.height; y += 1) rows.push(Array.from({ length: puzzle.width }, (_, x) => {
      const cell = puzzle.cells[y * puzzle.width + x];
      return cell === null ? (puzzle.solution.includes(y * puzzle.width + x) ? "o" : ".") : cell === false ? "#" : String(cell);
    }).join(" "));
  } else if (kind === "hitori") {
    for (let y = 0; y < puzzle.size; y += 1) rows.push(Array.from({ length: puzzle.size }, (_, x) => {
      const at = y * puzzle.size + x;
      return puzzle.solution[at] ? "#" : String(puzzle.numbers[at]).padStart(2);
    }).join(" "));
  } else if (kind === "regions") {
    for (let y = 0; y < puzzle.height; y += 1) rows.push(Array.from({ length: puzzle.width }, (_, x) => {
      const at = y * puzzle.width + x;
      return puzzle.givens[at] ? String(puzzle.givens[at]).padStart(2) : " .";
    }).join(" "));
  } else if (kind === "shikaku") {
    for (let y = 0; y < puzzle.height; y += 1) rows.push(Array.from({ length: puzzle.width }, (_, x) => {
      const at = y * puzzle.width + x;
      return puzzle.clues[at] ? String(puzzle.clues[at]).padStart(2) : " .";
    }).join(" "));
  } else if (kind === "cross-sums") {
    for (let y = 0; y < puzzle.height; y += 1) rows.push(Array.from({ length: puzzle.width }, (_, x) => {
      const cell = puzzle.cells[y * puzzle.width + x];
      return cell.kind === "white" ? "  .  " : `${cell.down ?? "  "}\\${cell.across ?? "  "}`.padEnd(5);
    }).join(" "));
  } else if (kind === "loop") {
    for (let y = 0; y < puzzle.height; y += 1) rows.push(Array.from({ length: puzzle.width }, (_, x) => {
      const clue = puzzle.clues[y * puzzle.width + x];
      return clue === null ? "." : String(clue);
    }).join(" "));
  }
  return rows.join("\n");
}

const [first, ...rest] = process.argv.slice(2);
if (first === "--show") {
  const [kind, size, level, seed] = rest;
  const spec = KINDS[kind];
  if (!spec) throw new Error(`kinds: ${Object.keys(KINDS).join(", ")}`);
  const puzzle = spec.make(Number(size), level, Number(seed));
  console.log(`${kind} ${size} ${level} seed ${seed}: ${JSON.stringify(spec.rate(puzzle))}`);
  console.log(draw(kind, puzzle));
} else {
  const only = first && KINDS[first] ? first : null, seeds = Number((only ? rest[0] : first) ?? 30) || 30, size = Number((only ? rest[1] : rest[0]) ?? 0) || 0;
  for (const [kind, spec] of Object.entries(KINDS)) {
    if (only && kind !== only) continue;
    console.log(`\n### ${kind}, ${seeds} seeds\n`);
    console.log(`| size | level | made | median ms | p95 ms | slowest ms | depth 0 / 1 / 2 | ${spec.columns.join(" | ")} |`);
    console.log(`| --- | --- | --- | --- | --- | --- | --- | ${spec.columns.map(() => "---").join(" | ")} |`);
    for (const n of spec.sizes) {
      if (size && n !== size) continue;
      for (const level of LEVELS) {
        const times = [], depths = [0, 0, 0], sums = Object.fromEntries(spec.columns.map((c) => [c, 0]));
        let made = 0;
        for (let seed = 1; seed <= seeds; seed += 1) {
          const started = performance.now();
          let puzzle;
          try { puzzle = spec.make(n, level, seed); } catch { continue; }
          times.push(performance.now() - started);
          const counted = spec.count(puzzle);
          if (!counted.complete && counted.count !== 1 || counted.count !== 1) continue;
          made += 1;
          const rating = spec.rate(puzzle);
          depths[rating.depth] += 1;
          for (const column of spec.columns) sums[column] += Number(rating[column]);
        }
        times.sort((a, b) => a - b);
        const mean = (column) => (made ? shown(sums[column] / made) : "-");
        console.log(`| ${n} | ${level} | ${made}/${seeds} | ${times.length ? Math.round(quantile(times, .5)) : "-"} | ${times.length ? Math.round(quantile(times, .95)) : "-"} | ${times.length ? Math.round(times[times.length - 1]) : "-"} | ${depths.join(" / ")} | ${spec.columns.map(mean).join(" | ")} |`);
      }
    }
  }
}
