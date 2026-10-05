import { SHIKAKU_LEVELS, SHIKAKU_MOST_ATTEMPTS } from "./shikaku.constants.ts";
import { isShikakuBoard, shikakuCells } from "./shikakuBoard.ts";
import { solveShikaku } from "./shikakuSolve.ts";
import { isKazuSeed, seededRandom } from "./random.ts";
import type { ShikakuLevel, ShikakuPuzzle, ShikakuRectangle } from "./shikaku.types.ts";

/** The first generator, kept as the fallback that cannot fail on a board it can make: seeded cuts into rectangles, accepted when the answer is single. */
export function templateShikaku(width = 7, height = width, level: ShikakuLevel = "medium", seed = 1): ShikakuPuzzle {
  if (![width, height].every(n => Number.isInteger(n) && n >= 2 && n <= 16)) throw new RangeError("Invalid Shikaku dimensions");
  const empty = { width, height, clues: Array(width * height).fill(0) as number[] };
  if (!isKazuSeed(seed) || !SHIKAKU_LEVELS.includes(level)
    || !isShikakuBoard({ ...empty, clues: [width * height, ...empty.clues.slice(1)] })) throw new RangeError("Invalid Shikaku settings");
  const random = seededRandom(seed), maximum = { easy: 5, medium: 9, hard: 15, "extra-hard": 20 }[level];
  for (let attempt = 0; attempt < SHIKAKU_MOST_ATTEMPTS; attempt += 1) {
    const solution: ShikakuRectangle[] = [];
    const split = (r: ShikakuRectangle) => {
      if (r.width * r.height <= maximum && (r.width * r.height < 3 || random() < .6)) { solution.push(r); return; }
      const vertical = r.height === 1 || (r.width > 1 && random() < .5);
      const cut = 1 + Math.floor(random() * ((vertical ? r.width : r.height) - 1));
      if (vertical) { split({ ...r, width: cut }); split({ ...r, x: r.x + cut, width: r.width - cut }); }
      else { split({ ...r, height: cut }); split({ ...r, y: r.y + cut, height: r.height - cut }); }
    };
    split({ x: 0, y: 0, width, height });
    const clues = [...empty.clues];
    for (const r of solution) {
      const cells = shikakuCells(empty, r)!;
      clues[cells[Math.floor(random() * cells.length)]] = cells.length;
    }
    const board = { width, height, clues }, counted = solveShikaku(board);
    if (counted.complete && counted.count === 1) return { ...board, seed, level, solution: counted.solution! };
  }
  throw new Error("No unique Shikaku found within the generation budget; try another seed");
}
