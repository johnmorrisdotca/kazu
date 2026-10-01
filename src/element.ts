import type { KazuGame } from "./game.ts";
import { generateKazu } from "./generate.ts";
import { isKazuKind, isKazuLevel, isKazuSize, KAZU_SPECS, type KazuKind, type KazuLevel } from "./kinds.ts";
import { mountKazu, type KazuEventDetail, type KazuMount } from "./mount.ts";
import { freshKazuSeed, isKazuSeed } from "./random.ts";

/**
 * THE `<kazu-board>` ELEMENT: a playable Kazu puzzle in a tag, with no framework.
 * `@johnmorrisdotca/kazu/element/define` defines it; this entry holds the class alone, to extend or to
 * define under another name. Safe to import on a server, where there is no page: the class then extends
 * nothing.
 *
 * ```html
 * <kazu-board kind="sum-cages" size="9" level="medium" seed="42"></kazu-board>
 * <kazu-board kind="towers" size="5" givens="…" solution="…" hints="show"></kazu-board>
 * ```
 *
 * Attributes (each is read again when it changes):
 *  - `kind`: `number-place` (default), `jigsaw`, `diagonal`, `sum-cages`, `more-or-less` or `towers`.
 *  - `size` (the kind's default side if left out) with `level` (`easy`, `medium` (default) or `hard`) and
 *    `seed` (a new one if left out): the puzzle is made in the page. Or `size` with `givens` (and
 *    `solution`, if you have it): a puzzle of your own.
 *  - `run` and `notes`: what has been written and the pencil marks, from an event's `run` and `notes`, to
 *    carry on a puzzle half done. `elapsed`: milliseconds already on the clock.
 *  - `hints`: `place` (default), `show` or `off`. `check`: `count` (default), `show` or `off`.
 *  - `conflicts`, `peers`, `tidy`, `clock`, `controls`, `tap-to-step`: each on by default; `off` turns it off.
 *  - `lang`: `en` or `ja`, or the page's.
 *
 * It fires `kazu-change`, `kazu-hint`, `kazu-check` and `kazu-solve` (see `mountKazu`), and has the methods
 * `undo()`, `hint()`, `check()`, `restart()`, `pencil()` and `select()`. Nothing in it can be selected, and
 * its box stays one steady square whatever is drawn.
 */
const ElementBase: typeof HTMLElement = typeof HTMLElement === "undefined" ? (class {} as unknown as typeof HTMLElement) : HTMLElement;

const isOff = (value: string | null): boolean => value !== null && ["false", "off", "0", "no"].includes(value.toLowerCase());
const oneOf = <T extends string>(value: string | null, allowed: readonly T[]): T | undefined => (allowed.includes(value as T) ? (value as T) : undefined);

export class KazuBoard extends ElementBase {
  static observedAttributes = ["kind", "size", "level", "seed", "givens", "solution", "run", "notes", "elapsed", "hints", "check", "conflicts", "peers", "tidy", "tap-to-step", "clock", "controls", "lang"];

  #mount: KazuMount | null = null;
  #key = "";
  #queued = false;
  #seed: number | null = null;

  connectedCallback(): void {
    this.#refresh();
  }

  disconnectedCallback(): void {
    this.#mount?.destroy();
    this.#mount = null;
    this.#key = "";
  }

  attributeChangedCallback(): void {
    if (!this.isConnected || this.#queued) return;
    this.#queued = true;
    queueMicrotask(() => {
      this.#queued = false;
      this.#refresh();
    });
  }

  /** The mounted board's handle (`mountKazu`), or null until a puzzle has been made. */
  get mount(): KazuMount | null {
    return this.#mount;
  }

  get game(): KazuGame | null {
    return this.#mount?.game() ?? null;
  }

  /** What the events would tell now. */
  get detail(): KazuEventDetail | null {
    return this.#mount?.detail() ?? null;
  }

  undo(): void {
    this.#mount?.undo();
  }

  hint(): void {
    this.#mount?.hint();
  }

  check(): void {
    this.#mount?.check();
  }

  restart(): void {
    this.#mount?.restart();
  }

  pencil(on?: boolean): void {
    this.#mount?.pencil(on);
  }

  select(cell: number | null): void {
    this.#mount?.select(cell);
  }

  #refresh(): void {
    const kind: KazuKind = isKazuKind(this.getAttribute("kind")) ? (this.getAttribute("kind") as KazuKind) : "number-place";
    const asked = Number(this.getAttribute("size"));
    const size = Number.isInteger(asked) && asked > 0 ? asked : KAZU_SPECS[kind].defaultSize;
    const level: KazuLevel = isKazuLevel(this.getAttribute("level")) ? (this.getAttribute("level") as KazuLevel) : "medium";
    const givens = this.getAttribute("givens") ?? undefined;
    const solution = this.getAttribute("solution") ?? undefined;
    const seedAttribute = this.getAttribute("seed");
    const seed = isKazuSeed(Number(seedAttribute)) && seedAttribute !== null ? Number(seedAttribute) : (this.#seed ??= freshKazuSeed());
    const run = this.getAttribute("run") ?? undefined;
    const notes = this.getAttribute("notes") ?? undefined;
    const elapsed = this.getAttribute("elapsed") === null ? undefined : Number(this.getAttribute("elapsed"));
    const settings = {
      hints: oneOf(this.getAttribute("hints"), ["place", "show", "off"] as const),
      check: oneOf(this.getAttribute("check"), ["count", "show", "off"] as const),
      conflicts: !isOff(this.getAttribute("conflicts")),
      peers: !isOff(this.getAttribute("peers")),
      tidy: !isOff(this.getAttribute("tidy")),
      tapToStep: !isOff(this.getAttribute("tap-to-step")),
      clock: !isOff(this.getAttribute("clock")),
      controls: !isOff(this.getAttribute("controls")),
      language: oneOf(this.getAttribute("lang"), ["en", "ja"] as const),
    };
    const key = JSON.stringify([kind, size, givens === undefined ? [level, seed] : givens, solution, run, notes, elapsed]);
    if (key === this.#key && this.#mount !== null) {
      this.#mount.set(settings);
      return;
    }
    if (givens === undefined && !isKazuSize(kind, size)) return;
    const made = givens === undefined ? generateKazu(kind, size, level, seed) : null;
    this.#mount?.destroy();
    this.#mount = null;
    this.#key = key;
    this.#mount = mountKazu(this, {
      kind,
      size,
      givens: made?.givens ?? givens!,
      solution: made?.solution ?? solution,
      level: made?.level,
      seed: made?.seed,
      run,
      notes,
      elapsed: elapsed !== undefined && Number.isFinite(elapsed) ? elapsed : undefined,
      ...settings,
    });
  }
}
