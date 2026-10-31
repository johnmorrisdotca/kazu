import { stepEntry, symbolOf, valueOfSymbol } from "./cells.ts";
import { kazuClockText } from "./clock.ts";
import { kazuCellName } from "./draw.ts";
import {
  answerOf,
  clearCell,
  enterNumber,
  gameConflicts,
  isPrinted,
  isSolved,
  type KazuGame,
  kazuProgress,
  newKazuGame,
  toggleNote,
  valuesOf,
} from "./game.ts";
import type { KazuHint } from "./hint.ts";
import type { KazuKind, KazuLevel } from "./kinds.ts";
import { mountHandle } from "./mountHandle.ts";
import { NOTES_KEY_IS_A_NUMBER, renderBoard } from "./mountRender.ts";
import type { MountSession } from "./mountSession.ts";
import { KAZU_PLAY_STYLE } from "./play-style.ts";
import { decodeNotes, decodeRun, encodeNotes, encodeRun, notesOf } from "./progress.ts";
import { solveKazu } from "./solve.ts";
import { type KazuLanguage, kazuLanguageOf, kazuSay } from "./strings.ts";

/**
 * A PLAYABLE KAZU BOARD IN ANY PAGE: `mountKazu(host, options)` draws a puzzle into an element and plays
 * it by touch, mouse and keyboard. Tap a cell and tap a number on the pad (or type it); tap the chosen
 * cell again to step it on, 1, 2, 3 … and back to empty; turn Pencil on and the pad writes small notes
 * instead; Undo takes the last change back; Hint says which cell to fill next and why; Check says how
 * many are wrong, never which. A clock starts on the first entry and stops when the last cell is right.
 *
 * The keys: the arrows move, a number (1 to 9, then A to G on the 16×16 and on to P on the 25×25) fills
 * the chosen cell, Shift with a number writes it as a pencil mark, Backspace empties the cell, N turns
 * Pencil on or off (the slash key on the 25×25, where N is the number 23), Ctrl or Cmd with Z undoes,
 * and Escape lets the cell go.
 *
 * What happens is told in events, on the host as DOM events and to the callbacks given: `kazu-change`
 * for every change to the grid, `kazu-hint` for each hint, `kazu-check` for each check, and `kazu-solve`
 * once, with the answer ready for `checkKazu`. Every button is also a method of the returned handle.
 * The rules it plays by are `game.ts`'s, and the drawing is `drawKazu`'s: both are usable alone.
 *
 * Needs a page. Its words are English and Japanese and follow the page's `lang`.
 */

/** What every event tells of the board.
 *
 * @example
 * ```ts
 * import type { KazuPuzzle } from "@johnmorrisdotca/kazu";
 * import { answerOf, decodeCells, encodeNotes, encodeRun, isSolved, kazuProgress, newKazuGame } from "@johnmorrisdotca/kazu";
 * import type { KazuEventDetail } from "@johnmorrisdotca/kazu/play";
 *
 * const puzzle: KazuPuzzle = {"kind":"number-place","size":4,"level":"easy","seed":42,"givens":"14..2..1412.3..4","solution":"1432234141233214"};
 * const kind = puzzle.kind;
 * const size = puzzle.size;
 * const givens = puzzle.givens;
 * const answer = puzzle.solution;
 * const solution = decodeCells(answer,size)!;
 * const game = newKazuGame(kind,size,givens)!;
 * const value: KazuEventDetail = {kind,size,run:encodeRun(game.entries),notes:encodeNotes(game.notes),answer:answerOf(game),progress:kazuProgress(game),elapsedMs:0,hints:0,checks:0,helped:false,solved:isSolved(game)};
 * console.log(value);
 * ```
 */
export type KazuEventDetail = {
  kind: KazuKind;
  size: number;
  level?: KazuLevel;
  seed?: number;
  /** What the player has written, as a run's code (`decodeRun` brings it back): to keep a puzzle half done. */
  run: string;
  /** The pencil marks, as a code (`decodeNotes`). Empty for none. */
  notes: string;
  /** The whole grid, printed numbers and the player's: what `checkKazu` takes as an answer. */
  answer: string;
  progress: { filled: number; total: number };
  /** The time on the clock, in milliseconds. */
  elapsedMs: number;
  /** How many hints were taken, and how many times Check was pressed. A solve with any hint is a helped one. */
  hints: number;
  checks: number;
  helped: boolean;
  solved: boolean;
  /** For `kazu-hint`: what the hint said. */
  hint?: KazuHint;
};

/** The puzzle, optional solution/progress, assistance, controls and event callbacks for mounting a number grid.
 *
 * @example
 * ```ts
 * import type { KazuPuzzle } from "@johnmorrisdotca/kazu";
 * import { decodeCells } from "@johnmorrisdotca/kazu";
 * import type { KazuMountOptions } from "@johnmorrisdotca/kazu/play";
 *
 * const puzzle: KazuPuzzle = {"kind":"number-place","size":4,"level":"easy","seed":42,"givens":"14..2..1412.3..4","solution":"1432234141233214"};
 * const kind = puzzle.kind;
 * const size = puzzle.size;
 * const givens = puzzle.givens;
 * const answer = puzzle.solution;
 * const solution = decodeCells(answer,size)!;
 * const value: KazuMountOptions = {kind,size,givens,solution:answer,hints:"show"};
 * console.log(value);
 * ```
 */
export type KazuMountOptions = {
  kind: KazuKind;
  size: number;
  /** The puzzle's givens code. */
  givens: string;
  /** The puzzle's one answer, as a cells code. Left out, it is worked out from the givens when Hint or Check needs it. */
  solution?: string;
  /** Which level and seed made it, to carry in the events. */
  level?: KazuLevel;
  seed?: number;
  /** A run to start from: the entries of a puzzle half done (`decodeRun`'s code). */
  run?: string;
  /** Pencil marks to start from (`decodeNotes`'s code). */
  notes?: string;
  /** Milliseconds already on the clock, to carry on a puzzle kept half done. */
  elapsed?: number;
  /** Show the clock, which starts on the first entry. Default true. */
  clock?: boolean;
  /** The number pad and the buttons under the board. Default true. */
  controls?: boolean;
  /** What Hint does: `place` writes the number it found (default), `show` only points at the cell and says why, `off` takes the button away. */
  hints?: "place" | "show" | "off";
  /** What Check does: `count` says how many cells are wrong (default), `show` marks them too, `off` takes the button away. */
  check?: "count" | "show" | "off";
  /** Draw the cells that break a rule in red as they are made. Default true. */
  conflicts?: boolean;
  /** Wash the chosen cell's row, column and group, and the cells holding its number. Default true. */
  peers?: boolean;
  /** A number written takes itself out of the pencil marks of the cells it shares a group with. Default true. */
  tidy?: boolean;
  /** A tap on the chosen cell steps its number on. Default true. */
  tapToStep?: boolean;
  /** The language the words are in. Left out, the host's own `lang`, or the page's, and it follows the page's. */
  language?: KazuLanguage;
  onChange?: (detail: KazuEventDetail) => void;
  onHint?: (detail: KazuEventDetail) => void;
  onCheck?: (detail: KazuEventDetail) => void;
  onSolve?: (detail: KazuEventDetail) => void;
};

/** Everything about how a mounted board plays that can change while it is on the page.
 *
 * @example
 * ```ts
 * import type { KazuMountSettings } from "@johnmorrisdotca/kazu/play";
 *
 * const value: KazuMountSettings = {language:"ja",hints:"off"};
 * console.log(value);
 * ```
 */
export type KazuMountSettings = Pick<
  KazuMountOptions,
  "hints" | "check" | "conflicts" | "peers" | "tidy" | "tapToStep" | "language" | "clock" | "controls"
>;

/** The native mounted number grid, its current game/detail, controls and cleanup methods.
 *
 * @example
 * ```ts no-run
 * import type { KazuPuzzle } from "@johnmorrisdotca/kazu";
 * import { decodeCells } from "@johnmorrisdotca/kazu";
 * import type { KazuMount } from "@johnmorrisdotca/kazu/play";
 * import { mountKazu } from "@johnmorrisdotca/kazu/play";
 *
 * const puzzle: KazuPuzzle = {"kind":"number-place","size":4,"level":"easy","seed":42,"givens":"14..2..1412.3..4","solution":"1432234141233214"};
 * const kind = puzzle.kind;
 * const size = puzzle.size;
 * const givens = puzzle.givens;
 * const answer = puzzle.solution;
 * const solution = decodeCells(answer,size)!;
 * const host = document.createElement("div");
 * document.body.append(host);
 * const board: KazuMount | null = mountKazu(host,{kind,size,givens,solution:answer});
 * console.log(board?.detail().progress);
 * board?.destroy();
 * ```
 */
export type KazuMount = {
  readonly host: HTMLElement;
  /** The game as it stands. */
  game: () => KazuGame;
  /** What the events would tell now. */
  detail: () => KazuEventDetail;
  /** Play another puzzle (or the same one again, fresh). `run`, `notes` and `elapsed` carry on a kept one. */
  load: (
    puzzle: Pick<
      KazuMountOptions,
      "kind" | "size" | "givens" | "solution" | "level" | "seed" | "run" | "notes" | "elapsed"
    >,
  ) => boolean;
  /** Change how it plays: hints, check, conflicts, peers, tidy, tapToStep, language, clock, controls. */
  set: (changes: KazuMountSettings) => void;
  /** Choose a cell (or none, with null). */
  select: (cell: number | null) => void;
  /** Write a number into the chosen cell, or a pencil mark if Pencil is on; 0 empties the cell. */
  enter: (value: number) => void;
  /** Turn Pencil on or off. */
  pencil: (on?: boolean) => void;
  undo: () => void;
  hint: () => void;
  check: () => void;
  /** Start again: every entry gone and the clock at nothing. */
  restart: () => void;
  /** Take the board down: its listeners, its timers and everything it put in the host. */
  destroy: () => void;
};

/** Put the style in the page once: in the document's head, or in the shadow root the host is in.
 *
 * @param host - The DOM element receiving scoped styles or the native player.
 * @returns Nothing; the native scoped player styles are installed for the host.
 * @example
 * ```ts no-run
 * import { ensureKazuPlayStyle } from "@johnmorrisdotca/kazu/play";
 *
 * const host = document.createElement("div");
 * ensureKazuPlayStyle(host);
 * console.log(host.tagName);
 * ```
 */
export function ensureKazuPlayStyle(host: Element): void {
  const root = host.getRootNode();
  const target: ParentNode =
    typeof ShadowRoot !== "undefined" && root instanceof ShadowRoot ? root : host.ownerDocument.head;
  if (target.querySelector("style[data-kazu-play]") !== null) return;
  const style = host.ownerDocument.createElement("style");
  style.setAttribute("data-kazu-play", "");
  style.textContent = KAZU_PLAY_STYLE;
  target.append(style);
}

function create<K extends keyof HTMLElementTagNameMap>(
  document: Document,
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

const ARROWS: Record<string, [number, number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

/** Draw a puzzle into `host` and play it. Returns the handle that drives it, or null for givens that are not a puzzle of that kind and side.
 * @param host - The HTMLElement that owns the native interface.
 * @param options - Native settings and callbacks for this mounted interface.
 * @returns The native mounted handle, or null for unsupported settings.
 * @example
 * ```ts
 * import { mountKazu } from "@johnmorrisdotca/kazu/play";
 * const show = (host: HTMLElement, options: Parameters<typeof mountKazu>[1]) => mountKazu(host, options);
 * console.log(typeof show); // function
 * ```
 */
export function mountKazu(host: HTMLElement, options: KazuMountOptions): KazuMount | null {
  const s = {} as MountSession;
  s.host = host;
  s.options = options;
  s.document = s.host.ownerDocument;
  s.view = s.document.defaultView!;
  s.firstGame = start(s.options);
  if (s.firstGame === null) return null;
  ensureKazuPlayStyle(s.host);

  s.game = s.firstGame;
  s.level = s.options.level;
  s.seed = s.options.seed;
  s.solution = s.options.solution ?? null;
  s.settings = {
    hints: s.options.hints ?? "place",
    check: s.options.check ?? "count",
    conflicts: s.options.conflicts !== false,
    peers: s.options.peers !== false,
    tidy: s.options.tidy !== false,
    tapToStep: s.options.tapToStep !== false,
    clock: s.options.clock !== false,
    controls: s.options.controls !== false,
  };
  s.explicitLanguage = { value: s.options.language };
  s.callbacks = s.options;

  s.selected = null;
  s.pencilOn = false;
  s.hintCell = null;
  s.wrongCells = [];
  s.says = { key: "tap" };
  s.hints = 0;
  s.checks = 0;
  s.solved = isSolved(s.game);
  s.banked = s.options.elapsed ?? 0;
  s.ranSince = null;
  s.tick = null;
  s.language = s.explicitLanguage.value ?? languageOfPage();
  s.drawn = "";
  s.announced = "";

  function languageOfPage(): KazuLanguage {
    return kazuLanguageOf(s.host.closest("[lang]")?.getAttribute("lang") ?? s.document.documentElement.lang);
  }

  // The parts.
  s.host.classList.add("kazu-play");
  s.host.replaceChildren();
  s.bar = create(s.document, "div", "kzp-bar");
  s.clockEl = create(s.document, "span", "kzp-clock");
  s.clockEl.setAttribute("role", "timer");
  s.progressEl = create(s.document, "span", "kzp-progress");
  s.bar.append(s.clockEl, s.progressEl);
  s.box = create(s.document, "div", "kzp-box");
  s.box.tabIndex = 0;
  s.box.setAttribute("role", "application");
  s.inner = create(s.document, "div", "kzp-inner");
  s.box.append(s.inner);
  s.keysNote = create(s.document, "p", "kzp-sr");
  s.box.setAttribute("aria-describedby", `kzp-keys-${Math.random().toString(36).slice(2, 8)}`);
  s.keysNote.id = s.box.getAttribute("aria-describedby")!;
  s.announce = create(s.document, "p", "kzp-sr");
  s.announce.setAttribute("aria-live", "polite");
  s.pad = create(s.document, "div", "kzp-pad");
  s.pad.setAttribute("role", "group");
  s.controls = create(s.document, "div", "kzp-controls");
  s.saysEl = create(s.document, "p", "kzp-says");
  s.saysEl.setAttribute("aria-live", "polite");
  s.host.append(s.bar, s.box, s.keysNote, s.announce, s.pad, s.controls, s.saysEl);

  s.button = (name: string, onPress: () => void, parent: HTMLElement, className = "kzp-button"): HTMLButtonElement => {
    const one = create(s.document, "button", className);
    one.type = "button";
    one.dataset.action = name;
    one.addEventListener("click", onPress);
    parent.append(one);
    return one;
  };
  s.undoButton = s.button("undo", () => api.undo(), s.controls);
  s.pencilButton = s.button("pencil", () => api.pencil(), s.controls);
  s.hintButton = s.button("hint", () => api.hint(), s.controls);
  s.checkButton = s.button("check", () => api.check(), s.controls);
  s.padKeys = [];
  s.eraseKey = null;

  s.say = (key: string, values: Record<string, string | number> = {}): string => kazuSay(s.language, key, values);

  function elapsed(): number {
    return s.banked + (s.ranSince === null ? 0 : s.view.performance.now() - s.ranSince);
  }

  function runClock(): void {
    if (s.ranSince !== null || s.solved || s.document.hidden) return;
    s.ranSince = s.view.performance.now();
    if (s.tick === null) s.tick = setInterval(paintClock, 1000);
  }

  function stopClock(): void {
    if (s.ranSince !== null) s.banked += s.view.performance.now() - s.ranSince;
    s.ranSince = null;
    if (s.tick !== null) clearInterval(s.tick);
    s.tick = null;
  }

  function paintClock(): void {
    const text = kazuClockText(elapsed());
    if (s.clockEl.textContent !== text) s.clockEl.textContent = text;
  }

  // The pad: a key for every number, and one to erase. Its columns are fixed for a puzzle's side.
  function buildPad(): void {
    s.pad.replaceChildren();
    s.padKeys = [];
    for (let value = 1; value <= s.game.size; value += 1) {
      const key = s.button(`number-${value}`, () => api.enter(value), s.pad, "kzp-key");
      key.dataset.value = String(value);
      key.textContent = symbolOf(value);
      s.padKeys.push(key);
    }
    s.eraseKey = s.button("erase", () => api.enter(0), s.pad, "kzp-key");
    s.eraseKey.dataset.erase = "true";
    s.eraseKey.textContent = "×";
    const rows = s.game.size <= 6 ? 1 : s.game.size <= 9 ? 2 : 3;
    s.pad.style.setProperty("--kzp-columns", String(Math.ceil((s.game.size + 1) / rows)));
  }

  function detail(): KazuEventDetail {
    return {
      kind: s.game.kind,
      size: s.game.size,
      level: s.level,
      seed: s.seed,
      run: encodeRun(s.game.entries),
      notes: encodeNotes(s.game.notes),
      answer: answerOf(s.game),
      progress: kazuProgress(s.game),
      elapsedMs: Math.round(elapsed()),
      hints: s.hints,
      checks: s.checks,
      helped: s.hints > 0,
      solved: s.solved,
    };
  }

  function emit(
    name: "kazu-change" | "kazu-hint" | "kazu-check" | "kazu-solve",
    extra: Partial<KazuEventDetail> = {},
  ): void {
    const info = { ...detail(), ...extra };
    s.host.dispatchEvent(
      new CustomEvent(name, { detail: JSON.parse(JSON.stringify(info)), bubbles: true, composed: true }),
    );
    const call = {
      "kazu-change": s.callbacks.onChange,
      "kazu-hint": s.callbacks.onHint,
      "kazu-check": s.callbacks.onCheck,
      "kazu-solve": s.callbacks.onSolve,
    }[name];
    call?.(info);
  }

  function answerKey(): string | null {
    if (s.solution === null) s.solution = solveKazu(s.game.kind, s.game.size, s.game.givens);
    return s.solution;
  }

  function sayText(): string {
    return s.says.text ?? kazuSay(s.language, s.says.key, s.says.values ?? {});
  }

  function cellDescription(index: number): string {
    const cell = kazuCellName(s.game.size, index, s.language);
    const shown = valuesOf(s.game)[index]!;
    if (isPrinted(s.game, index)) return s.say("cellGiven", { cell, value: symbolOf(shown) });
    if (shown !== 0)
      return s.say(gameConflicts(s.game).includes(index) ? "cellConflict" : "cellValue", {
        cell,
        value: symbolOf(shown),
      });
    const notes = notesOf(s.game.notes[index]!);
    return notes.length > 0
      ? s.say("cellNotes", { cell, notes: notes.map(symbolOf).join(", ") })
      : s.say("cellEmpty", { cell });
  }

  function setSays(key: string, values?: Record<string, string | number>, warn = false, text?: string): void {
    s.says = { key, values, warn, text };
  }

  function tapWords(): void {
    setSays(s.pencilOn ? "tapPencil" : "tap");
  }

  function changed(): void {
    s.hintCell = null;
    s.wrongCells = [];
    s.solved = isSolved(s.game);
    if (s.solved) {
      stopClock();
      setSays("solved");
    } else if (kazuProgress(s.game).filled === s.game.size * s.game.size) setSays("full", undefined, true);
    else tapWords();
    s.render();
    emit("kazu-change");
    if (s.solved) emit("kazu-solve");
  }

  function write(cell: number, value: number): void {
    if (s.solved || cell < 0 || isPrinted(s.game, cell)) return;
    const next =
      s.pencilOn && value !== 0
        ? toggleNote(s.game, cell, value)
        : value === 0
          ? clearCell(s.game, cell)
          : enterNumber(s.game, cell, value, s.settings.tidy);
    if (next === s.game) return;
    runClock();
    s.game = next;
    changed();
  }

  function move(by: [number, number]): void {
    const { size } = s.game;
    const from = s.selected ?? 0;
    const row = Math.min(size - 1, Math.max(0, Math.floor(from / size) + by[0]));
    const col = Math.min(size - 1, Math.max(0, (from % size) + by[1]));
    api.select(row * size + col);
  }

  s.onClick = (event: Event) => {
    const target = (event.target as Element | null)?.closest("[data-cell]");
    if (target === null || target === undefined || s.solved) return;
    const index = Number((target as HTMLElement).dataset.cell);
    if (!Number.isInteger(index)) return;
    if (index === s.selected && s.settings.tapToStep && !s.pencilOn && !isPrinted(s.game, index))
      write(index, stepEntry(s.game.entries[index]!, s.game.size));
    else api.select(index);
  };

  s.onKey = (event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        api.undo();
      }
      return;
    }
    if (event.key in ARROWS) {
      event.preventDefault();
      move(ARROWS[event.key]!);
      return;
    }
    if (s.solved) return;
    if (event.key === "Escape") {
      event.preventDefault();
      api.select(null);
    } else if (event.key === "Backspace" || event.key === "Delete" || event.key === "0" || event.key === " ") {
      event.preventDefault();
      api.enter(0);
    } else if (event.key.toLowerCase() === (s.game.size >= NOTES_KEY_IS_A_NUMBER ? "/" : "n")) {
      event.preventDefault();
      api.pencil();
    } else if (event.shiftKey && s.selected !== null) {
      // Shift with a number is a pencil mark, whatever the keyboard writes for a shifted digit: read the key's place, not its symbol.
      const code = /^Digit([1-9])$/.exec(event.code)?.[1] ?? /^Key([A-P])$/.exec(event.code)?.[1];
      const value = code === undefined ? 0 : valueOfSymbol(code);
      if (value >= 1 && value <= s.game.size) {
        event.preventDefault();
        write(s.selected, 0);
        const next = toggleNote(s.game, s.selected, value);
        if (next !== s.game) {
          runClock();
          s.game = next;
          changed();
        }
      }
    } else {
      const value = valueOfSymbol(event.key);
      if (value >= 1 && value <= s.game.size) {
        event.preventDefault();
        api.enter(value);
      }
    }
  };

  s.onFocus = () => {
    if (s.selected === null && !s.solved) api.select(0);
  };

  s.onVisible = () => {
    if (s.document.hidden) {
      if (s.ranSince !== null) {
        stopClock();
        paintClock();
        s.resumeOnShow = true;
      }
    } else if (s.resumeOnShow) {
      s.resumeOnShow = false;
      runClock();
    }
  };
  s.resumeOnShow = false;

  s.box.addEventListener("click", s.onClick);
  s.box.addEventListener("keydown", s.onKey);
  s.box.addEventListener("focus", s.onFocus);
  s.document.addEventListener("visibilitychange", s.onVisible);
  s.watching =
    typeof MutationObserver === "undefined"
      ? null
      : new MutationObserver(() => {
          if (s.explicitLanguage.value !== undefined) return;
          const next = languageOfPage();
          if (next === s.language) return;
          s.language = next;
          s.drawn = "";
          s.render();
        });
  s.watching?.observe(s.document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  s.paintClock = paintClock;
  s.elapsed = elapsed;
  s.sayText = sayText;
  s.cellDescription = cellDescription;
  s.render = () => renderBoard(s);
  buildPad();
  s.render();

  s.stopClock = stopClock;
  s.setSays = setSays;
  s.buildPad = buildPad;
  s.render = () => renderBoard(s);
  s.write = write;
  s.changed = changed;
  s.tapWords = tapWords;
  s.answerKey = answerKey;
  s.emit = emit;
  s.runClock = runClock;
  s.languageOfPage = languageOfPage;
  s.detail = detail;
  s.elapsed = elapsed;
  s.start = start;
  const api = mountHandle(s);
  return api;
}

/** The game a set of options starts from, or null for givens that are not a puzzle. */
function start(options: Pick<KazuMountOptions, "kind" | "size" | "givens" | "run" | "notes">): KazuGame | null {
  const entries = options.run === undefined ? undefined : (decodeRun(options.run, options.size) ?? undefined);
  const notes = options.notes === undefined ? undefined : (decodeNotes(options.notes, options.size) ?? undefined);
  return newKazuGame(options.kind, options.size, options.givens, { entries, notes });
}
