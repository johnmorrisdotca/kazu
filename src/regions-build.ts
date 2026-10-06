import { regionsNeighbours } from "./regions-board.ts";
import { shuffled } from "./random.ts";
import type { RegionsBoard, RegionsLevel } from "./regions.types.ts";
import type { Random } from "./random.ts";

/** How likely each region size is, by level: a small board of small regions is easy, long ones with few givens are not. */
export const REGIONS_SIZES_BY_LEVEL: Record<RegionsLevel, readonly number[]> = {
  easy: [1, 2, 2, 2, 3, 3, 3, 4, 4],
  medium: [1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 6],
  hard: [2, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7, 8],
  "extra-hard": [2, 3, 4, 4, 5, 5, 6, 6, 6, 7, 7, 8, 8, 9],
};

/**
 * A full Regions answer: the board cut into connected regions, every region holding its own size, and no two
 * regions of the same size touching. Regions are grown one at a time from the square with the fewest free neighbours;
 * null when a corner of the board cannot be finished, so the caller tries again.
 */
export function partitionRegions(width: number, height: number, level: RegionsLevel, random: Random): number[] | null {
  const board: RegionsBoard = { width, height, givens: Array(width * height).fill(0) };
  const entries = Array<number>(width * height).fill(0);
  const sizes = REGIONS_SIZES_BY_LEVEL[level];
  for (let guard = 0; guard < width * height; guard += 1) {
    let anchor = -1, fewest = 9, ties = 0;
    for (let cell = 0; cell < entries.length; cell += 1) {
      if (entries[cell]) continue;
      const free = regionsNeighbours(board, cell).filter(next => !entries[next]).length;
      if (free < fewest) { fewest = free; anchor = cell; ties = 1; } else if (free === fewest && random() * ++ties < 1) anchor = cell;
    }
    if (anchor < 0) return entries;
    const left = entries.filter(value => !value).length;
    let done = false;
    const tried = new Set<number>();
    // Sizes come in the order of a shuffle of the weighted list, so common sizes are tried first more often.
    for (const area of shuffled(sizes, random)) {
      if (tried.has(area) || area > left) continue;
      tried.add(area);
      if (regionsNeighbours(board, anchor).some(next => entries[next] === area)) continue;
      for (let proposal = 0; proposal < 6 && !done; proposal += 1) {
        const cells = [anchor], members = new Set(cells);
        while (cells.length < area) {
          const frontier = new Set<number>();
          for (const cell of cells) for (const next of regionsNeighbours(board, cell)) {
            if (entries[next] || members.has(next)) continue;
            if (regionsNeighbours(board, next).some(other => entries[other] === area)) continue;
            frontier.add(next);
          }
          if (!frontier.size) break;
          // Prefer squares that are hard to reach later: those with few free neighbours.
          const options = [...frontier].sort((a, b) => regionsNeighbours(board, a).filter(n => !entries[n] && !members.has(n)).length - regionsNeighbours(board, b).filter(n => !entries[n] && !members.has(n)).length);
          const pick = random() < .55 ? options[0]! : options[Math.floor(random() * options.length)]!;
          cells.push(pick); members.add(pick);
        }
        if (cells.length !== area) continue;
        for (const cell of cells) entries[cell] = area;
        done = true;
      }
      if (done) break;
    }
    if (!done) return null;
  }
  return null;
}
