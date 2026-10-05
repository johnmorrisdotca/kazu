import { hitoriNeighbors } from "./hitoriBoard.ts";
import { hitoriModel } from "./hitoriLogic.ts";
import { countCsp, openSlots } from "./csp.ts";
import { shuffled } from "./random.ts";
import type { HitoriBoard, HitoriLevel } from "./hitori.types.ts";
import type { Random } from "./random.ts";

export const SHARE: Record<HitoriLevel, number> = { easy: .26, medium: .27, hard: .28, "extra-hard": .3 };

/** A board with one answer, or null when the random choices did not lead to one. How the numbers are chosen leans on the level. */
export function candidateHitori(size: number, level: HitoriLevel, random: Random, base: readonly number[] = latinSquare(size, random) ?? []): { board: HitoriBoard; shaded: readonly boolean[] } | null {
  const total = size * size;
  if (base.length !== total) return null;
  const target = Math.round(total * SHARE[level] * (.9 + random() * .2));
  const shaded = Array<boolean>(total).fill(false);
  let count = 0;
  const around = Array.from({ length: total }, (_, cell) => hitoriNeighbors(size, cell));
  const mark = new Int32Array(total), stack = new Int32Array(total);
  let stamp = 0;
  const connected = (): boolean => {
    const first = shaded.indexOf(false);
    stamp += 1;
    let top = 0, reached = 1;
    stack[top++] = first; mark[first] = stamp;
    while (top) for (const next of around[stack[--top]!]!) if (!shaded[next] && mark[next] !== stamp) { mark[next] = stamp; reached += 1; stack[top++] = next; }
    return reached === total - count;
  };
  for (const cell of shuffled(Array.from({ length: total }, (_, i) => i), random)) {
    if (count >= target) break;
    if (around[cell]!.some(next => shaded[next])) continue;
    shaded[cell] = true; count += 1;
    if (!connected()) { shaded[cell] = false; count -= 1; }
  }
  if (count < Math.max(2, target - 2)) return null;

  const numbers = isotope(base, size, random).map((n, cell) => shaded[cell] ? 0 : n);
  const partnersOf = (cell: number): number[] => {
    const x = cell % size, y = Math.floor(cell / size), found: number[] = [];
    for (let k = 0; k < size; k += 1) {
      if (k !== x && !shaded[y * size + k]) found.push(y * size + k);
      if (k !== y && !shaded[k * size + x]) found.push(k * size + x);
    }
    return found;
  };
  const blacks = shaded.flatMap((on, cell) => on ? [cell] : []);
  for (const cell of blacks) {
    const options = partnersOf(cell);
    if (!options.length) return null;
    numbers[cell] = numbers[options[Math.floor(random() * options.length)]!]!;
  }

  const board: HitoriBoard = { size, numbers };
  const { csp } = hitoriModel(board, 2);
  let proof = countCsp(csp, openSlots(csp), 2, 20_000);
  for (let repair = 0; repair < 60 && proof.count > 1 && !proof.exhausted; repair += 1) {
    const other = proof.solutions[1]!.slice(), mine = (alive: Uint8Array, cell: number) => alive[2 * cell + 1] === 1;
    const candidates = shuffled(blacks.filter(cell => !mine(other, cell)), random);
    let changed = false;
    for (const cell of candidates) {
      const keepers = partnersOf(cell).filter(p => !mine(other, p));
      if (!keepers.length) continue;
      numbers[cell] = numbers[keepers[Math.floor(random() * keepers.length)]!]!;
      changed = true;
      break;
    }
    if (!changed) return null;
    proof = countCsp(csp, openSlots(csp), 2, 20_000);
  }
  if (proof.count !== 1 || proof.exhausted) return null;

  return { board, shaded };
}

/** A random Latin square: every number once in each row and column, built row by row with backtracking. */
export function latinSquare(size: number, random: Random): number[] | null {
  const cells = Array<number>(size * size).fill(0);
  let steps = 0;
  const fill = (at: number): boolean => {
    if (at === cells.length) return true;
    if (++steps > 20_000) return false;
    const x = at % size, y = Math.floor(at / size);
    const used = new Set<number>();
    for (let k = 0; k < x; k += 1) used.add(cells[y * size + k]!);
    for (let k = 0; k < y; k += 1) used.add(cells[k * size + x]!);
    for (const n of shuffled(Array.from({ length: size }, (_, i) => i + 1).filter(i => !used.has(i)), random)) {
      cells[at] = n;
      if (fill(at + 1)) return true;
    }
    cells[at] = 0;
    return false;
  };
  return fill(0) ? cells : null;
}

/** The same square with its rows, columns and numbers renamed at random: still one of each in every line. */
export function isotope(square: readonly number[], size: number, random: Random): number[] {
  const rows = shuffled(Array.from({ length: size }, (_, i) => i), random), cols = shuffled(Array.from({ length: size }, (_, i) => i), random);
  const names = shuffled(Array.from({ length: size }, (_, i) => i + 1), random);
  return Array.from({ length: size * size }, (_, cell) => names[square[rows[Math.floor(cell / size)]! * size + cols[cell % size]!]! - 1]!);
}
