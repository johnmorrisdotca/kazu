/**
 * ONE SMALL ENGINE for the puzzles that are solved by narrowing down what each square, edge or rectangle can
 * still be. A puzzle supplies its variables and one function that prunes; this file does the two things
 * every one of them needs: counting answers (a search that stops at a limit) and rating how hard a puzzle
 * is (how deep the reasoning must go before the grid is decided).
 *
 * A variable has a few slots (its possible values). `alive[slot]` is 1 while that value is still possible.
 * A variable is decided when exactly one of its slots is alive and impossible when none is.
 */

export type Csp = {
  /** The slots of variable `v` are `starts[v]` up to, not including, `starts[v + 1]`. */
  starts: Int32Array;
  /**
   * Prunes `alive` as far as the rules force and says `false` when they cannot all be kept. Never guesses.
   * `decided` names a variable that was just narrowed from a state that was already pruned, so a rule may
   * look only at what that can change; leaving it out means look at everything.
   */
  propagate: (alive: Uint8Array, decided?: number) => boolean;
  /** Which variable to branch on in a search; the default is the one with the fewest values left. */
  choose?: (alive: Uint8Array) => number;
};

/** How many values a variable still has. */
export function slotsLeft(csp: Csp, alive: Uint8Array, variable: number): number {
  let left = 0;
  for (let slot = csp.starts[variable]!; slot < csp.starts[variable + 1]!; slot += 1) left += alive[slot]!;
  return left;
}

/** Every value of every variable still possible. */
export function openSlots(csp: Csp): Uint8Array {
  return new Uint8Array(csp.starts[csp.starts.length - 1]!).fill(1);
}

/** Leaves `variable` with only `slot` (a slot number, not an offset). */
export function decide(csp: Csp, alive: Uint8Array, variable: number, slot: number): void {
  for (let at = csp.starts[variable]!; at < csp.starts[variable + 1]!; at += 1) alive[at] = at === slot ? 1 : 0;
}

/** The slot a decided variable has left, or -1 when it has more than one or none. */
export function decidedSlot(csp: Csp, alive: Uint8Array, variable: number): number {
  let found = -1;
  for (let slot = csp.starts[variable]!; slot < csp.starts[variable + 1]!; slot += 1) {
    if (!alive[slot]) continue;
    if (found >= 0) return -1;
    found = slot;
  }
  return found;
}

export type CspCount = { count: number; solution: Uint8Array | null; solutions: Uint8Array[]; stopped: boolean; exhausted: boolean; nodes: number };

/**
 * Counts the ways to decide every variable, up to `limit`. `exhausted` says the node budget ran out;
 * `stopped` says the limit was reached. Either way the count must not be read as proof of anything
 * beyond what was seen.
 */
export function countCsp(csp: Csp, start: Uint8Array, limit: number, budget: number): CspCount {
  const variables = csp.starts.length - 1;
  let count = 0, nodes = 0, exhausted = false, stopped = false;
  let solution: Uint8Array | null = null;
  const solutions: Uint8Array[] = [];
  const visit = (alive: Uint8Array, hint?: number): void => {
    if (exhausted || stopped) return;
    if (++nodes > budget) { exhausted = true; return; }
    if (!csp.propagate(alive, hint)) return;
    let pick = csp.choose ? csp.choose(alive) : -1, best = 99_999;
    if (!csp.choose) {
      for (let v = 0; v < variables; v += 1) {
        const left = slotsLeft(csp, alive, v);
        if (left > 1 && left < best) { best = left; pick = v; if (left === 2) break; }
      }
    }
    if (pick < 0) {
      count += 1;
      solution ??= alive.slice();
      solutions.push(alive.slice());
      if (count >= limit) stopped = true;
      return;
    }
    for (let slot = csp.starts[pick]!; slot < csp.starts[pick + 1]!; slot += 1) {
      if (!alive[slot]) continue;
      const next = alive.slice();
      decide(csp, next, pick, slot);
      visit(next, pick);
      if (exhausted || stopped) return;
    }
  };
  visit(start.slice());
  return { count, solution, solutions, stopped, exhausted, nodes: Math.min(nodes, budget) };
}

export type CspLogic = { solved: boolean; contradiction: boolean; probes: number; alive: Uint8Array };

/**
 * Solves by reasoning alone, never by guessing a value and keeping it. `depth` 0 is the rules' own
 * pruning. Depth 1 adds probing: suppose one value, prune, and when that breaks a rule the value is
 * ruled out. Depth 2 lets a probe probe. `probes` counts the values ruled out by supposing, which is how
 * much supposing the puzzle asks of a person.
 */
export function logicCsp(csp: Csp, start: Uint8Array, depth: number): CspLogic {
  const variables = csp.starts.length - 1;
  let probes = 0;
  const decidedAll = (alive: Uint8Array): boolean => {
    for (let v = 0; v < variables; v += 1) if (slotsLeft(csp, alive, v) > 1) return false;
    return true;
  };
  const run = (alive: Uint8Array, level: number, hint?: number): boolean | "stuck" | "solved" => {
    let first = hint;
    for (;;) {
      if (!csp.propagate(alive, first)) return false;
      first = undefined;
      let open = false;
      for (let v = 0; v < variables && !open; v += 1) if (slotsLeft(csp, alive, v) > 1) open = true;
      if (!open) return "solved";
      if (level === 0) return "stuck";
      let moved = false;
      for (let v = 0; v < variables; v += 1) {
        if (slotsLeft(csp, alive, v) < 2) continue;
        for (let slot = csp.starts[v]!; slot < csp.starts[v + 1]!; slot += 1) {
          if (!alive[slot] || slotsLeft(csp, alive, v) < 2) continue;
          const trial = alive.slice();
          decide(csp, trial, v, slot);
          const result = run(trial, level - 1, v);
          if (result === false) {
            alive[slot] = 0;
            probes += 1;
            moved = true;
            if (!csp.propagate(alive)) return false;
            if (decidedAll(alive)) return "solved";
          }
        }
      }
      if (!moved) return "stuck";
    }
  };
  const alive = start.slice();
  const result = run(alive, depth);
  return { solved: result === "solved", contradiction: result === false, probes, alive };
}

/**
 * Counts answers like `countCsp`, but first tries to settle the puzzle by reasoning (rules, then one level of
 * supposing): reasoning that leaves every variable decided proves exactly one answer, and reasoning that breaks a
 * rule proves none, in far fewer steps than a search. Only a puzzle that reasoning leaves open is searched, from the
 * state reasoning reached.
 */
export function solveCsp(csp: Csp, start: Uint8Array, limit: number, budget: number, depth = 1): CspCount {
  const plain = logicCsp(csp, start, 0);
  const reasoned = plain.solved || plain.contradiction || depth < 1 ? plain : logicCsp(csp, start, 1);
  if (reasoned.contradiction) return { count: 0, solution: null, solutions: [], stopped: false, exhausted: false, nodes: 0 };
  if (reasoned.solved) return { count: 1, solution: reasoned.alive, solutions: [reasoned.alive], stopped: limit <= 1, exhausted: false, nodes: 0 };
  return countCsp(csp, reasoned.alive, limit, budget);
}
