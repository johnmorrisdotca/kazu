import { shikakuModel } from "./shikaku-logic.ts";
import { countCsp, openSlots } from "./csp.ts";
import { shuffled } from "./random.ts";
import type { ShikakuBoard, ShikakuLevel, ShikakuRectangle } from "./shikaku.types.ts";
import type { Random } from "./random.ts";

/** The smallest and largest rectangle a level cuts the board into. */
export const SHIKAKU_AREAS: Record<ShikakuLevel, { least: number; most: number }> = {
  easy: { least: 2, most: 6 },
  medium: { least: 3, most: 12 },
  hard: { least: 3, most: 9 },
  "extra-hard": { least: 4, most: 9 },
};

/**
 * Cuts a board into rectangles by packing: the square with the fewest free neighbours is covered next, by a random
 * rectangle of a random allowed area that fits the free squares round it. Unlike cutting the board in two over and
 * over, this makes pinwheels and rectangles that interlock.
 */
export function packRectangles(width: number, height: number, level: ShikakuLevel, random: Random): ShikakuRectangle[] {
  const free = new Uint8Array(width * height).fill(1);
  const { least, most: wanted } = SHIKAKU_AREAS[level];
  const most = Math.max(least, Math.min(wanted, Math.round(width * height * .3)));
  const freeAt = (x: number, y: number) => x >= 0 && y >= 0 && x < width && y < height && free[y * width + x] === 1;
  const rectangles: ShikakuRectangle[] = [];
  for (;;) {
    let anchor = -1, fewest = 9, ties = 0;
    for (let cell = 0; cell < free.length; cell += 1) {
      if (!free[cell]) continue;
      const x = cell % width, y = Math.floor(cell / width);
      const around = +freeAt(x - 1, y) + +freeAt(x + 1, y) + +freeAt(x, y - 1) + +freeAt(x, y + 1);
      if (around < fewest) { fewest = around; anchor = cell; ties = 1; } else if (around === fewest && random() * ++ties < 1) anchor = cell;
    }
    if (anchor < 0) return rectangles;
    const ax = anchor % width, ay = Math.floor(anchor / width);
    const fits: ShikakuRectangle[] = [];
    for (let w = 1; w <= Math.min(width, most); w += 1) for (let h = 1; w * h <= most; h += 1) {
      for (let ox = 0; ox < w; ox += 1) for (let oy = 0; oy < h; oy += 1) {
        const x = ax - ox, y = ay - oy;
        let all = x >= 0 && y >= 0 && x + w <= width && y + h <= height;
        for (let k = 0; all && k < w * h; k += 1) if (!free[(y + Math.floor(k / w)) * width + x + k % w]) all = false;
        if (all) fits.push({ x, y, width: w, height: h });
      }
    }
    // Prefer rectangles that leave no square with nowhere to go, then rectangles of a decent size.
    const leavesIsland = (r: ShikakuRectangle): boolean => {
      const inside = (x: number, y: number) => x >= r.x && x < r.x + r.width && y >= r.y && y < r.y + r.height;
      for (let x = r.x - 1; x <= r.x + r.width; x += 1) for (let y = r.y - 1; y <= r.y + r.height; y += 1) {
        if (inside(x, y) || !freeAt(x, y)) continue;
        const exits = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].filter(([nx, ny]) => freeAt(nx!, ny!) && !inside(nx!, ny!)).length;
        if (!exits) return true;
      }
      return false;
    };
    const sound = fits.filter(r => !leavesIsland(r));
    const roomy = (sound.length ? sound : fits).filter(r => r.width * r.height >= least);
    const pool = roomy.length ? roomy : sound.length ? sound : fits;
    const areas = [...new Set(pool.map(r => r.width * r.height))];
    const area = areas[Math.floor(random() * areas.length)]!;
    const same = pool.filter(r => r.width * r.height === area);
    const pick = same[Math.floor(random() * same.length)]!;
    rectangles.push(pick);
    for (let k = 0; k < pick.width * pick.height; k += 1) free[(pick.y + Math.floor(k / pick.width)) * width + pick.x + k % pick.width] = 0;
  }
}

/**
 * A board with exactly one answer, or null. Each rectangle's number sits in a random square of it; while there is
 * another answer, the numbers of the rectangles the two answers disagree on move to new squares.
 */
export function candidateShikaku(width: number, height: number, level: ShikakuLevel, random: Random): { board: ShikakuBoard; solution: readonly ShikakuRectangle[] } | null {
  const solution = packRectangles(width, height, level, random);
  if (solution.length < 2 || solution.some(r => r.width * r.height === 1)) return null;
  const cellsOf = (r: ShikakuRectangle) => Array.from({ length: r.width * r.height }, (_, i) => (r.y + Math.floor(i / r.width)) * width + r.x + i % r.width);
  // Where a number sits decides how many rectangles it could be: easy boards put it where it has the fewest, the others anywhere.
  const freedom = (r: ShikakuRectangle, cell: number): number => {
    const area = r.width * r.height;
    let count = 0;
    for (let w = 1; w <= area && w <= width; w += 1) {
      if (area % w || area / w > height) continue;
      const h = area / w;
      count += (Math.min(cell % width, width - w) - Math.max(0, cell % width - w + 1) + 1) * (Math.min(Math.floor(cell / width), height - h) - Math.max(0, Math.floor(cell / width) - h + 1) + 1);
    }
    return count;
  };
  const chooseSpot = (r: ShikakuRectangle, not?: number): number => {
    const cells = shuffled(cellsOf(r).filter(c => c !== not), random);
    if (!cells.length) return not!;
    if (level !== "easy") return cells[0]!;
    const ranked = [...cells].sort((a, b) => freedom(r, a) - freedom(r, b));
    return ranked[Math.floor(random() * Math.min(2, ranked.length))]!;
  };
  const spot = solution.map(r => chooseSpot(r));
  for (let repair = 0; repair < 40; repair += 1) {
    const clues = Array<number>(width * height).fill(0);
    solution.forEach((r, i) => { clues[spot[i]!] = r.width * r.height; });
    const board: ShikakuBoard = { width, height, clues };
    const model = shikakuModel(board);
    const found = countCsp(model.csp, openSlots(model.csp), 2, 20_000);
    if (found.exhausted) return null;
    if (found.count === 1) return { board, solution };
    const alt = found.solutions[1]!;
    let moved = false;
    solution.forEach((r, i) => {
      const slot = model.rectangles.findIndex((c, s) => model.owner[s] === model.clues.indexOf(spot[i]!) && c.x === r.x && c.y === r.y && c.width === r.width && c.height === r.height);
      if (slot >= 0 && alt[slot]) return;
      if (cellsOf(r).length < 2) return;
      spot[i] = shuffled(cellsOf(r).filter(c => c !== spot[i]), random)[0]!;
      moved = true;
    });
    if (!moved) return null;
  }
  return null;
}
