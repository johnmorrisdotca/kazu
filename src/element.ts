import { embedDay, dailySeed } from "./embed-day.ts";
import { KAZU_PLAY_STYLE } from "./play-style.ts";
import type { KazuMountOptions } from "./mount.ts";
import type { KazuGame } from "./game.ts";
import { generateKazu } from "./generate.ts";
import { isKazuKind, isKazuLevel, isKazuSize, KAZU_SPECS, type KazuKind, type KazuLevel } from "./kinds.ts";
import { mountKazu, type KazuEventDetail, type KazuMount } from "./mount.ts";
import { freshKazuSeed, isKazuSeed, KAZU_SEED_MOST } from "./random.ts";

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

const isOff = (value: string | null): boolean => value !== null && ["false", "off", "0", "no"].includes(value.trim().toLowerCase());
const oneOf = <T extends string>(value: string | null, allowed: readonly T[]): T | undefined => (allowed.includes(value as T) ? (value as T) : undefined);

/** Every mounted-board option, kept complete by TypeScript and checked by the builder.
 * @example
 * ```ts
 * import { KAZU_EMBED_OPTION_KEYS } from "@johnmorrisdotca/kazu/element";
 * console.log(typeof KAZU_EMBED_OPTION_KEYS); // object
 * ```
 */
export const KAZU_EMBED_OPTION_KEYS = Object.keys({ kind: true, size: true, givens: true, solution: true, level: true, seed: true, run: true, notes: true, elapsed: true, clock: true, controls: true, hints: true, check: true, conflicts: true, peers: true, tidy: true, tapToStep: true, language: true, onChange: true, onHint: true, onCheck: true, onSolve: true } satisfies Record<keyof KazuMountOptions, boolean>);
/** Host callbacks; the same actions also emit native events.
 * @example
 * ```ts
 * import type { KazuElementOptions } from "@johnmorrisdotca/kazu/element";
 * const options: KazuElementOptions = {};
 * console.log(Object.keys(options).length); // 0
 * ```
 */
export type KazuElementOptions = Pick<KazuMountOptions, "onChange" | "onHint" | "onCheck" | "onSolve">;

/** Native custom element with reflected setup and presentation.
 * @example
 * ```ts
 * import { KazuBoard } from "@johnmorrisdotca/kazu/element";
 * console.log(KazuBoard.observedAttributes.includes("lang")); // true
 * ```
 */
export class KazuBoard extends ElementBase {
  static observedAttributes = ["kind", "size", "level", "seed", "givens", "solution", "run", "notes", "elapsed", "hints", "check", "conflicts", "peers", "tidy", "tap-to-step", "clock", "controls", "lang", "grid", "daily", "theme", "width", "label"];

  #widthBefore: string | null = null;
  #widthOwned = false;
  #labelBefore: { role: string | null; label: string | null } | null = null;
  #write(name: string, value: unknown): void {
    if (value === null || value === undefined) this.removeAttribute(name);
    else this.setAttribute(name, String(value));
  }
  #frame(): void {
    this.setAttribute("data-kazu-embed", "");
    const width = Number(this.getAttribute("width"));
    const size = this.getAttribute("size");
    const displaySize = size === null && (this.hasAttribute("grid") || this.hasAttribute("daily")) ? "medium" : size;
    const owned = (this.hasAttribute("width") && Number.isFinite(width) && width > 0) || (displaySize !== null && ["small", "medium", "large"].includes(displaySize));
    if (owned && !this.#widthOwned) { this.#widthBefore = this.style.width; this.#widthOwned = true; }
    if (this.hasAttribute("width") && Number.isFinite(width) && width > 0) this.style.width = `${Math.min(width, 2000)}px`;
    else if (displaySize !== null && ["small", "medium", "large"].includes(displaySize)) this.style.width = `${{ small: 320, medium: 480, large: 640 }[displaySize as "small" | "medium" | "large"]}px`;
    else if (this.#widthOwned) { this.style.width = this.#widthBefore ?? ""; this.#widthOwned = false; }
    this.style.maxWidth = "100%";
    const theme = this.getAttribute("theme"); this.style.colorScheme = theme === "light" || theme === "dark" ? theme : "light dark";
    const root = this.getRootNode();
    const target: ParentNode = typeof ShadowRoot !== "undefined" && root instanceof ShadowRoot ? root : this.ownerDocument.head;
    if (target.querySelector("style[data-kazu-embed-style]") === null) {
      const style = this.ownerDocument.createElement("style"); style.setAttribute("data-kazu-embed-style", "");
      const rules = (theme: string) => [...KAZU_PLAY_STYLE.matchAll(new RegExp(`:root\\[data-theme="${theme}"\\] ([^{]+)\\{([^}]+)\\}`, "g"))].map(match => `[data-kazu-embed][theme="${theme}"]${match[1].trim() === ".kazu-play" ? ".kazu-play" : ` ${match[1].trim()}`} {${match[2]}}`).join("\n");
      const light = [...KAZU_PLAY_STYLE.matchAll(/\.(kazu|kazu-play) \{([^}]+)\}/g)].filter(match => !match[2].includes("#ece8dc") && !match[2].includes("#171a18"));
      style.textContent = `@media(prefers-color-scheme:dark){${rules("dark").replaceAll('[theme="dark"]', ':not([theme="light"]):not([theme="dark"])')}}\n${rules("dark")}\n${light.map(match => `[data-kazu-embed][theme="light"]${match[1] === "kazu-play" ? ".kazu-play" : " .kazu"} {${match[2]}}`).join("\n")}\n[data-kazu-embed][label]{outline-offset:2px}`;
      target.append(style);
    }
    if (this.hasAttribute("label")) { this.#labelBefore ??= { role: this.getAttribute("role"), label: this.getAttribute("aria-label") }; this.setAttribute("role", "group"); this.setAttribute("aria-label", this.getAttribute("label")!); }
    else if (this.#labelBefore !== null) { for (const [name, value] of [["role", this.#labelBefore.role], ["aria-label", this.#labelBefore.label]]) { if (value === null) this.removeAttribute(name!); else this.setAttribute(name!, value); } this.#labelBefore = null; }
  }

  #options: KazuElementOptions = {};
  /** Host callbacks, read at event time without restarting the puzzle. */
  get options(): KazuElementOptions { return this.#options; }
  set options(value: KazuElementOptions) { this.#options = value ?? {}; }
  #problem(message: string): void {
    this.#mount?.destroy(); this.#mount = null; this.#key = "";
    const status = this.ownerDocument.createElement("p"); status.setAttribute("role", "status"); status.textContent = message; this.replaceChildren(status);
    this.dispatchEvent(new CustomEvent("kazu-error", { bubbles: true, composed: true, detail: { message } }));
  }
  /** The `kind` attribute, reflected. */
  get kind(): string | null { return this.getAttribute("kind"); }
  set kind(value: string | number | boolean | null | undefined) { this.#write("kind", value); }
  /** The `size` attribute, reflected. */
  get size(): string | null { return this.getAttribute("size"); }
  set size(value: string | number | boolean | null | undefined) { this.#write("size", value); }
  /** The `level` attribute, reflected. */
  get level(): string | null { return this.getAttribute("level"); }
  set level(value: string | number | boolean | null | undefined) { this.#write("level", value); }
  /** The `seed` attribute, reflected. */
  get seed(): string | null { return this.getAttribute("seed"); }
  set seed(value: string | number | boolean | null | undefined) { this.#write("seed", value); }
  /** The `givens` attribute, reflected. */
  get givens(): string | null { return this.getAttribute("givens"); }
  set givens(value: string | number | boolean | null | undefined) { this.#write("givens", value); }
  /** The `solution` attribute, reflected. */
  get solution(): string | null { return this.getAttribute("solution"); }
  set solution(value: string | number | boolean | null | undefined) { this.#write("solution", value); }
  /** The `run` attribute, reflected. */
  get run(): string | null { return this.getAttribute("run"); }
  set run(value: string | number | boolean | null | undefined) { this.#write("run", value); }
  /** The `notes` attribute, reflected. */
  get notes(): string | null { return this.getAttribute("notes"); }
  set notes(value: string | number | boolean | null | undefined) { this.#write("notes", value); }
  /** The `elapsed` attribute, reflected. */
  get elapsed(): string | null { return this.getAttribute("elapsed"); }
  set elapsed(value: string | number | boolean | null | undefined) { this.#write("elapsed", value); }
  /** The `hints` attribute, reflected. */
  get hints(): string | null { return this.getAttribute("hints"); }
  set hints(value: string | number | boolean | null | undefined) { this.#write("hints", value); }
  /** The `conflicts` attribute, reflected. */
  get conflicts(): string | null { return this.getAttribute("conflicts"); }
  set conflicts(value: string | number | boolean | null | undefined) { this.#write("conflicts", value); }
  /** The `peers` attribute, reflected. */
  get peers(): string | null { return this.getAttribute("peers"); }
  set peers(value: string | number | boolean | null | undefined) { this.#write("peers", value); }
  /** The `tidy` attribute, reflected. */
  get tidy(): string | null { return this.getAttribute("tidy"); }
  set tidy(value: string | number | boolean | null | undefined) { this.#write("tidy", value); }
  /** The `tap-to-step` attribute, reflected. */
  get "tap-to-step"(): string | null { return this.getAttribute("tap-to-step"); }
  set "tap-to-step"(value: string | number | boolean | null | undefined) { this.#write("tap-to-step", value); }
  /** The `tap-to-step` attribute, reflected. */
  get tapToStep(): string | null { return this.getAttribute("tap-to-step"); }
  set tapToStep(value: string | number | boolean | null | undefined) { this.#write("tap-to-step", value); }
  /** The `clock` attribute, reflected. */
  get clock(): string | null { return this.getAttribute("clock"); }
  set clock(value: string | number | boolean | null | undefined) { this.#write("clock", value); }
  /** The `controls` attribute, reflected. */
  get controls(): string | null { return this.getAttribute("controls"); }
  set controls(value: string | number | boolean | null | undefined) { this.#write("controls", value); }
  /** The `grid` attribute, reflected. */
  get grid(): string | null { return this.getAttribute("grid"); }
  set grid(value: string | number | boolean | null | undefined) { this.#write("grid", value); }
  /** The `daily` attribute, reflected. */
  get daily(): string | null { return this.getAttribute("daily"); }
  set daily(value: string | number | boolean | null | undefined) { this.#write("daily", value); }
  /** The `theme` attribute, reflected. */
  get theme(): string | null { return this.getAttribute("theme"); }
  set theme(value: string | number | boolean | null | undefined) { this.#write("theme", value); }
  /** The `width` attribute, reflected. */
  get width(): string | null { return this.getAttribute("width"); }
  set width(value: string | number | boolean | null | undefined) { this.#write("width", value); }
  /** The `label` attribute, reflected. */
  get label(): string | null { return this.getAttribute("label"); }
  set label(value: string | number | boolean | null | undefined) { this.#write("label", value); }

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
    if (!this.isConnected) return;
    this.#frame();
    const kind: KazuKind = isKazuKind(this.getAttribute("kind")) ? (this.getAttribute("kind") as KazuKind) : "number-place";
    const display = this.getAttribute("size");
    const asked = Number(this.getAttribute("grid") ?? (display !== null && !["small", "medium", "large"].includes(display) ? display : null));
    const size = Number.isInteger(asked) && asked > 0 ? asked : KAZU_SPECS[kind].defaultSize;
    const level: KazuLevel = isKazuLevel(this.getAttribute("level")) ? (this.getAttribute("level") as KazuLevel) : "medium";
    const givens = this.getAttribute("givens") ?? undefined;
    const solution = this.getAttribute("solution") ?? undefined;
    const seedAttribute = this.getAttribute("seed");
    let day: string | null;
    try { day = givens === undefined ? embedDay(this.getAttribute("daily")) : null; } catch { this.#problem("Use a real UTC date written YYYY-MM-DD."); return; }
    if (day === null) this.removeAttribute("data-day"); else this.setAttribute("data-day", day);
    const seed = day !== null ? dailySeed(day, `kazu/${kind}/${size}/${level}`) % KAZU_SEED_MOST + 1 : isKazuSeed(Number(seedAttribute)) && seedAttribute !== null ? Number(seedAttribute) : (this.#seed ??= freshKazuSeed());
    const run = this.getAttribute("run") ?? undefined;
    const notes = this.getAttribute("notes") ?? undefined;
    const elapsed = this.getAttribute("elapsed") === null ? undefined : Number(this.getAttribute("elapsed"));
    const settings = {
      hints: oneOf(isOff(this.getAttribute("hints")) ? "off" : this.getAttribute("hints"), ["place", "show", "off"] as const),
      check: oneOf(isOff(this.getAttribute("check")) ? "off" : this.getAttribute("check"), ["count", "show", "off"] as const),
      conflicts: !isOff(this.getAttribute("conflicts")),
      peers: !isOff(this.getAttribute("peers")),
      tidy: !isOff(this.getAttribute("tidy")),
      tapToStep: !isOff(this.getAttribute("tap-to-step")),
      clock: !isOff(this.getAttribute("clock")),
      controls: !isOff(this.getAttribute("controls")),
      language: oneOf(this.getAttribute("lang"), ["en", "ja"] as const),
    };
    const key = JSON.stringify([kind, size, day, givens === undefined ? [level, seed] : givens, solution, run, notes, elapsed]);
    if (key === this.#key && this.#mount !== null) {
      this.#mount.set(settings);
      return;
    }
    if (givens === undefined && !isKazuSize(kind, size)) { this.#problem("Choose a grid size supported by this puzzle kind."); return; }
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
      onChange: (detail) => this.#options.onChange?.(detail),
      onHint: (detail) => this.#options.onHint?.(detail),
      onCheck: (detail) => this.#options.onCheck?.(detail),
      onSolve: (detail) => this.#options.onSolve?.(detail),
    });
    if (this.#mount === null) { this.#problem("Provide valid givens for this puzzle kind and grid."); return; }
    this.#frame();
    this.dispatchEvent(new CustomEvent("kazu-load", { bubbles: true, composed: true, detail: { kind, grid: size, day, seed } }));
  }
}

// Preserve the method while allowing frameworks to assign its attribute.
const checkMethod = KazuBoard.prototype.check;
Object.defineProperty(KazuBoard.prototype, "check", { configurable: true, get() { return checkMethod; }, set(this: Element, value: unknown) { if (value === null || value === undefined) this.removeAttribute("check"); else this.setAttribute("check", value === false ? "off" : String(value)); } });
/** Register a standard or custom board tag without replacing a definition. Safe without a browser.
 * @param tag - The custom tag name; omitted to use the package default.
 * @returns Nothing; existing definitions and server imports remain safe.
 * @example
 * ```ts
 * import { defineBoard } from "@johnmorrisdotca/kazu/element";
 * defineBoard();
 * console.log(typeof defineBoard); // function
 * ```
 */
export function defineBoard(tag = "kazu-board"): void {
  if (typeof customElements === "undefined" || customElements.get(tag) !== undefined) return;
  customElements.define(tag, tag === "kazu-board" ? KazuBoard : class extends KazuBoard {});
}
