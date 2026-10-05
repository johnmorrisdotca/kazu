import { isKakuroBoard } from "./kakuroBoard.ts";
import { kakuroModel } from "./kakuroLogic.ts";
import { countCsp, logicCsp, openSlots } from "./csp.ts";
import { shuffled } from "./random.ts";
import type { KakuroBoard, KakuroCell, KakuroLevel } from "./kakuro.types.ts";
import type { Random } from "./random.ts";

/** How the black squares are scattered, and the longest run a level allows. */
export const SHAPE: Record<KakuroLevel, { black: number; longest: number }> = {
  easy: { black: .34, longest: 4 },
  medium: { black: .3, longest: 5 },
  hard: { black: .26, longest: 7 },
  "extra-hard": { black: .22, longest: 9 },
};

/** Which squares are white: no run shorter than two, none longer than the level allows, and all of them one connected piece. */
export function kakuroPattern(side: number, level: KakuroLevel, random: Random): boolean[] | null {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const white = laidRows(side, level, random);
    if (white && oneStrip(side, white)) return white;
  }
  return null;
}

/**
 * Lays the squares out row by row, each row left to right, so that a run is never one square or longer than the
 * level allows: a column whose run is one square long must go on, one at the limit must stop, and a row's own
 * runs are kept the same way. A square is white with the level's chance, except where a rule forces it.
 */
function laidRows(side: number, level: KakuroLevel, random: Random): boolean[] | null {
  const { black, longest } = SHAPE[level];
  const white = Array<boolean>(side * side).fill(false), above = Array<number>(side).fill(0);
  const chance = 1 - black * (.85 + random() * .3);
  for (let row = 1; row < side; row += 1) {
    const last = row === side - 1, chosen = Array<boolean>(side).fill(false);
    let steps = 0;
    const place = (col: number, run: number): boolean => {
      if (++steps > 4000) return false;
      if (col === side) return run !== 1;
      const mustWhite = above[col] === 1;
      const mustBlack = above[col] === longest || last && above[col] === 0;
      const options: boolean[] = [];
      if (mustWhite && mustBlack) return false;
      if (mustWhite) options.push(true); else if (mustBlack) options.push(false);
      else options.push(...(random() < chance ? [true, false] : [false, true]));
      for (const isWhite of options) {
        if (isWhite && run + 1 > longest) continue;
        if (!isWhite && run === 1) continue;
        chosen[col] = isWhite;
        if (place(col + 1, isWhite ? run + 1 : 0)) return true;
      }
      return false;
    };
    if (!place(1, 0)) return null;
    for (let col = 1; col < side; col += 1) {
      white[row * side + col] = chosen[col]!;
      above[col] = chosen[col] ? above[col]! + 1 : 0;
    }
  }
  return white;
}

/** How many different sets of digits can make `sum` out of `length` squares. */
export function kakuroWays(length: number, sum: number): number {
  let ways = 0;
  for (let mask = 1; mask < 512; mask += 1) {
    let n = 0, total = 0;
    for (let d = 1; d <= 9; d += 1) if (mask & 1 << d - 1) { n += 1; total += d; }
    if (n === length && total === sum) ways += 1;
  }
  return ways;
}
const WAYS: number[][] = Array.from({ length: 10 }, (_, length) => Array.from({ length: 46 }, (_, sum) => length < 2 ? 0 : kakuroWays(length, sum)));

/** A random digit for every white square with no digit repeated in a run, or null when the search gives up. */
export function kakuroDigits(side: number, white: readonly boolean[], random: Random): number[] | null {
  const digits = Array<number>(white.length).fill(0);
  let steps = 0;
  const fill = (at: number): boolean => {
    while (at < white.length && !white[at]) at += 1;
    if (at === white.length) return true;
    if (++steps > 40_000) return false;
    const used = new Set<number>();
    for (let left = at - 1; left >= 0 && white[left] && (left + 1) % side !== 0; left -= 1) used.add(digits[left]!);
    for (let up = at - side; up >= 0 && white[up]; up -= side) used.add(digits[up]!);
    for (const digit of shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9].filter(d => !used.has(d)), random)) {
      digits[at] = digit;
      if (fill(at + 1)) return true;
    }
    digits[at] = 0;
    return false;
  };
  return fill(0) ? digits : null;
}

/**
 * Changes digits one square at a time, keeping every run free of repeats, to make runs whose totals can be made in
 * few ways: a run that says a lot about its digits lets the solver start from the rules alone. A change is kept when
 * it does not raise the count of ways, summed over runs, which is `weight` raised to the number of ways.
 */
export function kakuroTighten(side: number, white: readonly boolean[], digits: number[], random: Random, rounds: number): void {
  const runsAt = (cell: number): { across: number[]; down: number[] } => {
    const across: number[] = [cell], down: number[] = [cell];
    for (let at = cell - 1; at >= 0 && white[at] && (at + 1) % side !== 0; at -= 1) across.push(at);
    for (let at = cell + 1; at < white.length && white[at] && at % side !== 0; at += 1) across.push(at);
    for (let at = cell - side; at >= 0 && white[at]; at -= side) down.push(at);
    for (let at = cell + side; at < white.length && white[at]; at += side) down.push(at);
    return { across, down };
  };
  const ways = (run: readonly number[], swap?: { cell: number; digit: number }): number => {
    let sum = 0;
    for (const at of run) sum += swap && at === swap.cell ? swap.digit : digits[at]!;
    return WAYS[run.length]![sum]!;
  };
  const cells = white.flatMap((w, i) => w ? [i] : []);
  for (let round = 0; round < rounds; round += 1) {
    const cell = cells[Math.floor(random() * cells.length)]!;
    const { across, down } = runsAt(cell);
    const used = new Set<number>();
    for (const at of [...across, ...down]) if (at !== cell) used.add(digits[at]!);
    const options = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(d => !used.has(d) && d !== digits[cell]);
    if (!options.length) continue;
    const digit = options[Math.floor(random() * options.length)]!;
    const before = ways(across) + ways(down), after = ways(across, { cell, digit }) + ways(down, { cell, digit });
    if (after <= before) digits[cell] = digit;
  }
}

/** The totals of a pattern and its digits, as a board. */
export function kakuroBoardOf(side: number, white: readonly boolean[], digits: readonly number[]): KakuroBoard {
  const cells: KakuroCell[] = white.map(w => w ? { kind: "white" } : { kind: "black", across: null, down: null });
  for (let cell = 0; cell < white.length; cell += 1) {
    if (white[cell]) continue;
    const black = cells[cell] as Extract<KakuroCell, { kind: "black" }>;
    if (cell % side < side - 1 && white[cell + 1]) { let sum = 0; for (let at = cell + 1; white[at]; at += 1) { sum += digits[at]!; if ((at + 1) % side === 0) break; } black.across = sum; }
    if (cell + side < white.length && white[cell + side]) { let sum = 0; for (let at = cell + side; at < white.length && white[at]; at += side) sum += digits[at]!; black.down = sum; }
  }
  return { width: side, height: side, cells };
}

/** Whether the white squares are one connected piece. */
function oneStrip(side: number, white: readonly boolean[]): boolean {
  const first = white.indexOf(true);
  if (first < 0) return false;
  const seen = new Set<number>([first]), stack = [first];
  while (stack.length) {
    const at = stack.pop()!;
    for (const next of [at - 1, at + 1, at - side, at + side]) {
      if (next < 0 || next >= white.length || !white[next] || seen.has(next) || (next === at + 1 && next % side === 0)) continue;
      seen.add(next); stack.push(next);
    }
  }
  return seen.size === white.filter(Boolean).length;
}

/** The squares in the same row or column strip as `cell` that have the given digit, to see what digits it may take. */
function digitsAround(side: number, white: readonly boolean[], digits: readonly number[], cell: number): Set<number> {
  const used = new Set<number>();
  for (let at = cell - 1; at >= 0 && white[at] && (at + 1) % side !== 0; at -= 1) used.add(digits[at]!);
  for (let at = cell + 1; at < white.length && white[at] && at % side !== 0; at += 1) used.add(digits[at]!);
  for (let at = cell - side; at >= 0 && white[at]; at -= side) used.add(digits[at]!);
  for (let at = cell + side; at < white.length && white[at]; at += side) used.add(digits[at]!);
  return used;
}

/**
 * A board with exactly one answer, or null. While the board has other answers, each one is broken: a square the
 * two answers disagree on is turned black (when every run stays two long and the squares stay one piece) or given
 * another digit that still repeats nowhere in its runs, which changes two totals.
 */
export function candidateKakuro(side: number, level: KakuroLevel, random: Random): { board: KakuroBoard; digits: readonly number[] } | null {
  // Easy and medium boards are also eased until the rules they promise are enough to solve them.
  const eased = level === "easy" ? 0 : level === "medium" ? 1 : -1;
  const white = kakuroPattern(side, level, random);
  if (!white) return null;
  const digits = kakuroDigits(side, white, random);
  if (!digits) return null;
  if (level === "easy" || level === "medium") kakuroTighten(side, white, digits, random, side * side * (level === "easy" ? 60 : 25));
  const valid = (): boolean => {
    for (let cell = 0; cell < white.length; cell += 1) {
      if (!white[cell]) continue;
      let across = 1, down = 1;
      for (let at = cell - 1; at >= 0 && white[at] && (at + 1) % side !== 0; at -= 1) across += 1;
      for (let at = cell + 1; at < white.length && white[at] && at % side !== 0; at += 1) across += 1;
      for (let at = cell - side; at >= 0 && white[at]; at -= side) down += 1;
      for (let at = cell + side; at < white.length && white[at]; at += side) down += 1;
      if (across < 2 || down < 2) return false;
    }
    return oneStrip(side, white);
  };
  for (let repair = 0; repair < 150; repair += 1) {
    const board = kakuroBoardOf(side, white, digits);
    if (!isKakuroBoard(board)) return null;
    const model = kakuroModel(board, 1, random);
    let found = countCsp(model.csp, openSlots(model.csp), 8, 3000);
    for (let restart = 0; restart < 5 && found.exhausted; restart += 1) found = countCsp(model.csp, openSlots(model.csp), 8, 3000);
    if (found.exhausted) {
      // Too many answers to even count: darken any square that can be darkened and look again.
      const any = shuffled(white.flatMap((w, cell) => w ? [cell] : []), random).find(cell => { white[cell] = false; if (valid()) return true; white[cell] = true; return false; });
      if (any === undefined) return null;
      continue;
    }
    if (found.count === 1 && eased < 0) return { board, digits };
    if (found.count === 1) {
      const rules = kakuroModel(board, eased as 0 | 1);
      const run = logicCsp(rules.csp, openSlots(rules.csp), 0);
      if (run.solved) return { board, digits };
      if (white.filter(Boolean).length < (side - 1) * (side - 1) * .42) return null;
      const open = rules.whites.filter((_, i) => { let n = 0; for (let k = 0; k < 9; k += 1) n += run.alive[9 * i + k]!; return n > 1; });
      // Squares still open, then the others that share a run with one.
      const near = new Set<number>(open);
      for (const cell of open) {
        for (let at = cell - 1; at >= 0 && white[at] && (at + 1) % side !== 0; at -= 1) near.add(at);
        for (let at = cell + 1; at < white.length && white[at] && at % side !== 0; at += 1) near.add(at);
        for (let at = cell - side; at >= 0 && white[at]; at -= side) near.add(at);
        for (let at = cell + side; at < white.length && white[at]; at += side) near.add(at);
      }
      const stuck = [...shuffled(open, random), ...shuffled([...near].filter(cell => !open.includes(cell)), random)];
      let eased_ = false;
      for (const cell of stuck) {
        white[cell] = false;
        if (valid()) { eased_ = true; break; }
        white[cell] = true;
      }
      if (!eased_) {
        const any = shuffled(white.flatMap((w, cell) => w ? [cell] : []), random).find(cell => { white[cell] = false; if (valid()) return true; white[cell] = true; return false; });
        if (any === undefined) return null;
      }
      continue;
    }
    const digitOf = (answer: Uint8Array, cell: number) => { const index = model.index[cell]!; let d = 0; for (let k = 0; k < 9; k += 1) if (answer[9 * index + k]) d = k + 1; return d; };
    let moved = false;
    for (const answer of found.solutions) {
      const differing = shuffled(white.flatMap((w, cell) => w && digitOf(answer, cell) !== digits[cell] ? [cell] : []), random);
      if (!differing.length) continue;
      const blacken = (): boolean => {
        for (const cell of differing) {
          if (!white[cell]) continue;
          white[cell] = false;
          if (valid()) return true;
          white[cell] = true;
        }
        return false;
      };
      const change = (): boolean => {
        for (const cell of differing) {
          if (!white[cell]) continue;
          const used = digitsAround(side, white, digits, cell);
          const options = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(d => !used.has(d));
          if (!options.length) continue;
          digits[cell] = options[Math.floor(random() * options.length)]!;
          return true;
        }
        return false;
      };
      if (random() < .5 ? blacken() || change() : change() || blacken()) moved = true;
    }
    if (!moved) return null;
  }
  return null;
}
