import { decodeCells, stepEntry, symbolOf, valueOfSymbol } from "./cells.ts";
import { kazuClockText } from "./clock.ts";
import { drawKazu, kazuCellName, kazuWhere } from "./draw.ts";
import { answerOf, clearCell, enterNumber, gameConflicts, isPrinted, isSolved, kazuProgress, newKazuGame, numberCounts, restartKazu, toggleNote, undoKazu, valuesOf, type KazuGame } from "./game.ts";
import { hintKazu, type KazuHint } from "./hint.ts";
import type { KazuKind, KazuLevel } from "./kinds.ts";
import { KAZU_PLAY_STYLE } from "./playStyle.ts";
import { decodeNotes, decodeRun, encodeNotes, encodeRun, notesOf } from "./progress.ts";
import { solveKazu } from "./solve.ts";
import { kazuLanguageOf, kazuNameOf, kazuSay, type KazuLanguage } from "./strings.ts";

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

/** From this side up the letter N is a number (A is 10, so N is 23), and Pencil moves to the slash key. */
const NOTES_KEY_IS_A_NUMBER = 23;

/** What every event tells of the board. */
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

/** Everything about how a mounted board plays that can change while it is on the page. */
export type KazuMountSettings = Pick<KazuMountOptions, "hints" | "check" | "conflicts" | "peers" | "tidy" | "tapToStep" | "language" | "clock" | "controls">;

export type KazuMount = {
  readonly host: HTMLElement;
  /** The game as it stands. */
  game: () => KazuGame;
  /** What the events would tell now. */
  detail: () => KazuEventDetail;
  /** Play another puzzle (or the same one again, fresh). `run`, `notes` and `elapsed` carry on a kept one. */
  load: (puzzle: Pick<KazuMountOptions, "kind" | "size" | "givens" | "solution" | "level" | "seed" | "run" | "notes" | "elapsed">) => boolean;
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

/** Put the style in the page once: in the document's head, or in the shadow root the host is in. */
export function ensureKazuPlayStyle(host: Element): void {
  const root = host.getRootNode();
  const target: ParentNode = typeof ShadowRoot !== "undefined" && root instanceof ShadowRoot ? root : host.ownerDocument.head;
  if (target.querySelector("style[data-kazu-play]") !== null) return;
  const style = host.ownerDocument.createElement("style");
  style.setAttribute("data-kazu-play", "");
  style.textContent = KAZU_PLAY_STYLE;
  target.append(style);
}

function create<K extends keyof HTMLElementTagNameMap>(document: Document, tag: K, className: string, text?: string): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

const ARROWS: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };

/** Draw a puzzle into `host` and play it. Returns the handle that drives it, or null for givens that are not a puzzle of that kind and side. */
export function mountKazu(host: HTMLElement, options: KazuMountOptions): KazuMount | null {
  const document = host.ownerDocument;
  const view = document.defaultView!;
  const firstGame = start(options);
  if (firstGame === null) return null;
  ensureKazuPlayStyle(host);

  let game: KazuGame = firstGame;
  let level = options.level;
  let seed = options.seed;
  let solution: string | null = options.solution ?? null;
  let settings = {
    hints: options.hints ?? "place",
    check: options.check ?? "count",
    conflicts: options.conflicts !== false,
    peers: options.peers !== false,
    tidy: options.tidy !== false,
    tapToStep: options.tapToStep !== false,
    clock: options.clock !== false,
    controls: options.controls !== false,
  };
  const explicitLanguage = { value: options.language };
  const callbacks = options;

  let selected: number | null = null;
  let pencilOn = false;
  let hintCell: number | null = null;
  let wrongCells: number[] = [];
  let says: { key: string; values?: Record<string, string | number>; warn?: boolean; text?: string } = { key: "tap" };
  let hints = 0;
  let checks = 0;
  let solved = isSolved(game);
  let banked = options.elapsed ?? 0;
  let ranSince: number | null = null;
  let tick: ReturnType<typeof setInterval> | null = null;
  let language: KazuLanguage = explicitLanguage.value ?? languageOfPage();
  let drawn = "";
  let announced = "";

  function languageOfPage(): KazuLanguage {
    return kazuLanguageOf(host.closest("[lang]")?.getAttribute("lang") ?? document.documentElement.lang);
  }

  // The parts.
  host.classList.add("kazu-play");
  host.replaceChildren();
  const bar = create(document, "div", "kzp-bar");
  const clockEl = create(document, "span", "kzp-clock");
  clockEl.setAttribute("role", "timer");
  const progressEl = create(document, "span", "kzp-progress");
  bar.append(clockEl, progressEl);
  const box = create(document, "div", "kzp-box");
  box.tabIndex = 0;
  box.setAttribute("role", "application");
  const inner = create(document, "div", "kzp-inner");
  box.append(inner);
  const keysNote = create(document, "p", "kzp-sr");
  box.setAttribute("aria-describedby", `kzp-keys-${Math.random().toString(36).slice(2, 8)}`);
  keysNote.id = box.getAttribute("aria-describedby")!;
  const announce = create(document, "p", "kzp-sr");
  announce.setAttribute("aria-live", "polite");
  const pad = create(document, "div", "kzp-pad");
  pad.setAttribute("role", "group");
  const controls = create(document, "div", "kzp-controls");
  const saysEl = create(document, "p", "kzp-says");
  saysEl.setAttribute("aria-live", "polite");
  host.append(bar, box, keysNote, announce, pad, controls, saysEl);

  const button = (name: string, onPress: () => void, parent: HTMLElement, className = "kzp-button"): HTMLButtonElement => {
    const one = create(document, "button", className);
    one.type = "button";
    one.dataset.action = name;
    one.addEventListener("click", onPress);
    parent.append(one);
    return one;
  };
  const undoButton = button("undo", () => api.undo(), controls);
  const pencilButton = button("pencil", () => api.pencil(), controls);
  const hintButton = button("hint", () => api.hint(), controls);
  const checkButton = button("check", () => api.check(), controls);
  let padKeys: HTMLButtonElement[] = [];
  let eraseKey: HTMLButtonElement | null = null;

  const say = (key: string, values: Record<string, string | number> = {}): string => kazuSay(language, key, values);

  function elapsed(): number {
    return banked + (ranSince === null ? 0 : view.performance.now() - ranSince);
  }

  function runClock(): void {
    if (ranSince !== null || solved || document.hidden) return;
    ranSince = view.performance.now();
    if (tick === null) tick = setInterval(paintClock, 1000);
  }

  function stopClock(): void {
    if (ranSince !== null) banked += view.performance.now() - ranSince;
    ranSince = null;
    if (tick !== null) clearInterval(tick);
    tick = null;
  }

  function paintClock(): void {
    const text = kazuClockText(elapsed());
    if (clockEl.textContent !== text) clockEl.textContent = text;
  }

  // The pad: a key for every number, and one to erase. Its columns are fixed for a puzzle's side.
  function buildPad(): void {
    pad.replaceChildren();
    padKeys = [];
    for (let value = 1; value <= game.size; value += 1) {
      const key = button(`number-${value}`, () => api.enter(value), pad, "kzp-key");
      key.dataset.value = String(value);
      key.textContent = symbolOf(value);
      padKeys.push(key);
    }
    eraseKey = button("erase", () => api.enter(0), pad, "kzp-key");
    eraseKey.dataset.erase = "true";
    eraseKey.textContent = "×";
    const rows = game.size <= 6 ? 1 : game.size <= 9 ? 2 : 3;
    pad.style.setProperty("--kzp-columns", String(Math.ceil((game.size + 1) / rows)));
  }

  function detail(): KazuEventDetail {
    return {
      kind: game.kind,
      size: game.size,
      level,
      seed,
      run: encodeRun(game.entries),
      notes: encodeNotes(game.notes),
      answer: answerOf(game),
      progress: kazuProgress(game),
      elapsedMs: Math.round(elapsed()),
      hints,
      checks,
      helped: hints > 0,
      solved,
    };
  }

  function emit(name: "kazu-change" | "kazu-hint" | "kazu-check" | "kazu-solve", extra: Partial<KazuEventDetail> = {}): void {
    const info = { ...detail(), ...extra };
    host.dispatchEvent(new CustomEvent(name, { detail: info, bubbles: true }));
    const call = { "kazu-change": callbacks.onChange, "kazu-hint": callbacks.onHint, "kazu-check": callbacks.onCheck, "kazu-solve": callbacks.onSolve }[name];
    call?.(info);
  }

  function answerKey(): string | null {
    if (solution === null) solution = solveKazu(game.kind, game.size, game.givens);
    return solution;
  }

  function sayText(): string {
    return says.text ?? kazuSay(language, says.key, says.values ?? {});
  }

  function cellDescription(index: number): string {
    const cell = kazuCellName(game.size, index, language);
    const shown = valuesOf(game)[index]!;
    if (isPrinted(game, index)) return say("cellGiven", { cell, value: symbolOf(shown) });
    if (shown !== 0) return say(gameConflicts(game).includes(index) ? "cellConflict" : "cellValue", { cell, value: symbolOf(shown) });
    const notes = notesOf(game.notes[index]!);
    return notes.length > 0 ? say("cellNotes", { cell, notes: notes.map(symbolOf).join(", ") }) : say("cellEmpty", { cell });
  }

  function render(): void {
    const conflicts = settings.conflicts ? gameConflicts(game) : [];
    const svg = drawKazu(game.kind, game.size, game.givens, {
      entries: game.entries,
      notes: game.notes,
      selected,
      peers: settings.peers,
      conflicts,
      wrong: wrongCells,
      hint: hintCell,
      done: solved,
      interactive: !solved,
      language,
    });
    if (svg !== null && svg !== drawn) {
      inner.innerHTML = svg;
      drawn = svg;
    }
    box.dataset.over = String(solved);
    host.dataset.solved = String(solved);
    host.dataset.pencil = String(pencilOn);
    host.dataset.kind = game.kind;
    host.dataset.size = String(game.size);
    box.setAttribute("aria-label", say("board", { name: kazuNameOf(game.kind, language), size: game.size }));
    keysNote.textContent = say(game.size >= NOTES_KEY_IS_A_NUMBER ? "keysColossus" : "keys");
    const counts = numberCounts(game);
    padKeys.forEach((key, at) => {
      const value = at + 1;
      key.disabled = solved;
      key.dataset.done = String(counts[value]! >= game.size);
      key.setAttribute("aria-label", say(counts[value]! >= game.size ? "padDone" : "padNumber", { n: symbolOf(value) }));
    });
    if (eraseKey !== null) {
      eraseKey.disabled = solved;
      eraseKey.setAttribute("aria-label", say("erase"));
    }
    pad.setAttribute("aria-label", say("pad"));
    undoButton.textContent = say("undo");
    undoButton.disabled = game.past.length === 0 || solved;
    pencilButton.textContent = say("pencil");
    pencilButton.title = say("pencilTitle");
    pencilButton.setAttribute("aria-pressed", String(pencilOn));
    pencilButton.disabled = solved;
    hintButton.textContent = say("hint");
    hintButton.title = say("hintTitle");
    hintButton.hidden = settings.hints === "off";
    hintButton.disabled = solved;
    checkButton.textContent = say("check");
    checkButton.title = say("checkTitle");
    checkButton.hidden = settings.check === "off";
    checkButton.disabled = solved;
    controls.hidden = !settings.controls;
    pad.hidden = !settings.controls;
    clockEl.hidden = !settings.clock;
    clockEl.setAttribute("aria-label", say("clock"));
    const progress = kazuProgress(game);
    progressEl.textContent = `${progress.filled} / ${progress.total}`;
    paintClock();
    const text = solved ? say(banked > 0 || ranSince !== null ? "solvedIn" : "solved", { time: kazuClockText(elapsed()) }) : sayText();
    saysEl.textContent = text;
    saysEl.dataset.warn = String(says.warn === true && !solved);
    const note = selected === null ? "" : cellDescription(selected);
    if (note !== announced) {
      announced = note;
      announce.textContent = note;
    }
  }

  function setSays(key: string, values?: Record<string, string | number>, warn = false, text?: string): void {
    says = { key, values, warn, text };
  }

  function tapWords(): void {
    setSays(pencilOn ? "tapPencil" : "tap");
  }

  function changed(): void {
    hintCell = null;
    wrongCells = [];
    solved = isSolved(game);
    if (solved) {
      stopClock();
      setSays("solved");
    } else if (kazuProgress(game).filled === game.size * game.size) setSays("full", undefined, true);
    else tapWords();
    render();
    emit("kazu-change");
    if (solved) emit("kazu-solve");
  }

  function write(cell: number, value: number): void {
    if (solved || cell < 0 || isPrinted(game, cell)) return;
    const next = pencilOn && value !== 0 ? toggleNote(game, cell, value) : value === 0 ? clearCell(game, cell) : enterNumber(game, cell, value, settings.tidy);
    if (next === game) return;
    runClock();
    game = next;
    changed();
  }

  function move(by: [number, number]): void {
    const { size } = game;
    const from = selected ?? 0;
    const row = Math.min(size - 1, Math.max(0, Math.floor(from / size) + by[0]));
    const col = Math.min(size - 1, Math.max(0, (from % size) + by[1]));
    api.select(row * size + col);
  }

  const onClick = (event: Event) => {
    const target = (event.target as Element | null)?.closest("[data-cell]");
    if (target === null || target === undefined || solved) return;
    const index = Number((target as HTMLElement).dataset.cell);
    if (!Number.isInteger(index)) return;
    if (index === selected && settings.tapToStep && !pencilOn && !isPrinted(game, index)) write(index, stepEntry(game.entries[index]!, game.size));
    else api.select(index);
  };

  const onKey = (event: KeyboardEvent) => {
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
    if (solved) return;
    if (event.key === "Escape") {
      event.preventDefault();
      api.select(null);
    } else if (event.key === "Backspace" || event.key === "Delete" || event.key === "0" || event.key === " ") {
      event.preventDefault();
      api.enter(0);
    } else if (event.key.toLowerCase() === (game.size >= NOTES_KEY_IS_A_NUMBER ? "/" : "n")) {
      event.preventDefault();
      api.pencil();
    } else if (event.shiftKey && selected !== null) {
      // Shift with a number is a pencil mark, whatever the keyboard writes for a shifted digit: read the key's place, not its symbol.
      const code = /^Digit([1-9])$/.exec(event.code)?.[1] ?? /^Key([A-P])$/.exec(event.code)?.[1];
      const value = code === undefined ? 0 : valueOfSymbol(code);
      if (value >= 1 && value <= game.size) {
        event.preventDefault();
        write(selected, 0);
        const next = toggleNote(game, selected, value);
        if (next !== game) {
          runClock();
          game = next;
          changed();
        }
      }
    } else {
      const value = valueOfSymbol(event.key);
      if (value >= 1 && value <= game.size) {
        event.preventDefault();
        api.enter(value);
      }
    }
  };

  const onFocus = () => {
    if (selected === null && !solved) api.select(0);
  };

  const onVisible = () => {
    if (document.hidden) {
      if (ranSince !== null) {
        stopClock();
        paintClock();
        resumeOnShow = true;
      }
    } else if (resumeOnShow) {
      resumeOnShow = false;
      runClock();
    }
  };
  let resumeOnShow = false;

  box.addEventListener("click", onClick);
  box.addEventListener("keydown", onKey);
  box.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", onVisible);
  const watching =
    typeof MutationObserver === "undefined"
      ? null
      : new MutationObserver(() => {
          if (explicitLanguage.value !== undefined) return;
          const next = languageOfPage();
          if (next === language) return;
          language = next;
          drawn = "";
          render();
        });
  watching?.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  buildPad();
  render();

  const api: KazuMount = {
    host,
    game: () => game,
    detail,
    load: (puzzle) => {
      const next = start(puzzle);
      if (next === null) return false;
      stopClock();
      game = next;
      solution = puzzle.solution ?? null;
      level = puzzle.level;
      seed = puzzle.seed;
      banked = puzzle.elapsed ?? 0;
      selected = null;
      pencilOn = false;
      hints = 0;
      checks = 0;
      hintCell = null;
      wrongCells = [];
      solved = isSolved(game);
      drawn = "";
      setSays("tap");
      buildPad();
      render();
      return true;
    },
    set: (changes) => {
      const { language: nextLanguage, ...rest } = changes;
      settings = { ...settings, ...Object.fromEntries(Object.entries(rest).filter(([, value]) => value !== undefined)) } as typeof settings;
      if ("language" in changes) {
        explicitLanguage.value = nextLanguage;
        language = nextLanguage ?? languageOfPage();
      }
      drawn = "";
      render();
    },
    select: (cell) => {
      selected = cell !== null && cell >= 0 && cell < game.size * game.size ? cell : null;
      if (hintCell !== null && hintCell !== selected) hintCell = null;
      render();
    },
    enter: (value) => {
      if (selected !== null) write(selected, value);
    },
    pencil: (on) => {
      pencilOn = on ?? !pencilOn;
      if (!solved) tapWords();
      render();
    },
    undo: () => {
      const next = undoKazu(game);
      if (next === game || solved) return;
      game = next;
      changed();
    },
    hint: () => {
      if (solved || settings.hints === "off") return;
      const found = hintKazu(game.kind, game.size, game.givens, game.entries, answerKey() ?? undefined);
      if (found === null) {
        setSays("hintDone");
        render();
        return;
      }
      hints += 1;
      selected = found.cell;
      const words = hintWords(found);
      if (settings.hints === "place") {
        runClock();
        game = enterNumber(game, found.cell, found.value, settings.tidy);
        changed();
        if (!solved) setSays("", undefined, false, words);
        hintCell = found.cell;
        render();
      } else {
        hintCell = found.cell;
        wrongCells = [];
        setSays("", undefined, false, words);
        render();
      }
      emit("kazu-hint", { hint: found });
    },
    check: () => {
      if (solved || settings.check === "off") return;
      checks += 1;
      const answer = decodeCells(answerKey() ?? "", game.size);
      const wrong: number[] = [];
      const empty = game.entries.filter((value, index) => !isPrinted(game, index) && value === 0).length;
      if (answer !== null) game.entries.forEach((value, index) => (!isPrinted(game, index) && value !== 0 && value !== answer[index] ? wrong.push(index) : undefined));
      else wrong.push(...gameConflicts(game).filter((index) => !isPrinted(game, index)));
      wrongCells = settings.check === "show" ? wrong : [];
      hintCell = null;
      if (wrong.length === 0 && empty === 0) setSays("checkRight");
      else if (wrong.length === 0) setSays("checkOnlyEmpty", { empty });
      else if (empty === 0) setSays("checkWrongNoneEmpty", { wrong: wrong.length }, true);
      else setSays("checkWrong", { wrong: wrong.length, empty }, true);
      render();
      emit("kazu-check");
    },
    restart: () => {
      stopClock();
      game = restartKazu(game);
      banked = 0;
      hints = 0;
      checks = 0;
      selected = null;
      hintCell = null;
      wrongCells = [];
      solved = isSolved(game);
      setSays("tap");
      render();
      emit("kazu-change");
    },
    destroy: () => {
      stopClock();
      box.removeEventListener("click", onClick);
      box.removeEventListener("keydown", onKey);
      box.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      watching?.disconnect();
      host.replaceChildren();
      host.classList.remove("kazu-play");
      for (const name of ["solved", "pencil", "kind", "size"]) delete host.dataset[name];
    },
  };

  /** The line a hint says, in the board's language. */
  function hintWords(found: KazuHint): string {
    const cell = kazuCellName(game.size, found.cell, language);
    const value = symbolOf(found.value);
    const lead = found.replaces ? say("hintReplaces", { cell }) : "";
    if (found.why === "answer") return lead + say("hintAnswer", { cell, value });
    if (found.why === "only-number") {
      const where = kazuWhere(game.kind, language);
      return lead + (found.by === undefined ? say("hintOnly", { cell, value, where }) : say("hintOnlyBy", { cell, value, where, by: say(found.by === "cage" ? "byCage" : found.by === "marks" ? "byMarks" : "byClues") }));
    }
    const group = found.group!;
    const diagonal = group.type === "diagonal" ? say(group.index === 0 ? "groupDiagonal" : "groupDiagonalOther") : "";
    const named = group.type === "diagonal" ? diagonal : say(`group${group.type[0]!.toUpperCase()}${group.type.slice(1)}`, { n: group.index + 1 });
    return lead + say("hintPlace", { group: named, value, cell });
  }

  return api;
}

/** The game a set of options starts from, or null for givens that are not a puzzle. */
function start(options: Pick<KazuMountOptions, "kind" | "size" | "givens" | "run" | "notes">): KazuGame | null {
  const entries = options.run === undefined ? undefined : (decodeRun(options.run, options.size) ?? undefined);
  const notes = options.notes === undefined ? undefined : (decodeNotes(options.notes, options.size) ?? undefined);
  return newKazuGame(options.kind, options.size, options.givens, { entries, notes });
}
