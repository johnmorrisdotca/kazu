import { checkRegions } from "./regions-board.ts";
import { regionsMostValue } from "./regions-logic.ts";
import { drawRegions } from "./regions-draw.ts";
import { decodeRegionsGame, encodeRegionsGame, hintRegions, newRegions, restartRegions, setRegionsCell, undoRegions } from "./regions-game.ts";
import { REGIONS_PLAY_STYLE } from "./regions-style.ts";
import { regionsWords } from "./regions-strings.ts";
import type { RegionsGame } from "./regions.types.ts";
import type { RegionsDrawOptions, RegionsMount, RegionsMountOptions } from "./regions-play.types.ts";

export function mountRegions(host: HTMLElement, initial: RegionsMountOptions): RegionsMount {
  const document = host.ownerDocument;
  let options = { ...initial };
  let game = restoreGame(initial);
  let selected: number | null = null;
  let errors: readonly number[] = [];
  let message = "";
  let destroyed = false;
  let lastFinishState = false;

  const style = document.createElement("style");
  style.textContent = REGIONS_PLAY_STYLE;
  const root = document.createElement("div");
  root.className = "regions-play";
  const status = document.createElement("p");
  status.className = "regions-status";
  status.setAttribute("role", "status");
  const board = document.createElement("div");
  board.className = "regions-board";
  const controls = document.createElement("div");
  controls.className = "regions-controls";
  root.append(status, board, controls);
  host.append(style, root);

  const language = () => options.language ?? "en";
  const copyGame = (state = game): RegionsGame => ({
    board: { ...state.board, givens: [...state.board.givens] },
    entries: [...state.entries],
    history: state.history.map(entries => [...entries]),
    helped: state.helped,
  });
  const emit = () => {
    const snapshot = copyGame();
    options.onChange?.(snapshot);
    host.dispatchEvent(new document.defaultView!.CustomEvent("regions-change", { detail: snapshot }));
  };
  const button = (label: string, action: () => void, disabled = false) => {
    const control = document.createElement("button");
    control.type = "button";
    control.textContent = label;
    control.disabled = disabled;
    control.addEventListener("click", action);
    controls.append(control);
  };

  const update = () => {
    if (destroyed) return;
    const words = regionsWords(language());
    const checked = checkRegions(game.board, game.entries);
    status.textContent = message || (checked.ok ? game.helped ? words.helped : words.solved : checked.errors.length ? words.wrong : words.remaining);
    board.replaceChildren();
    board.style.setProperty("--regions-width", String(game.board.width));
    board.style.setProperty("--regions-height", String(game.board.height));
    const drawing = document.createElement("div");
    drawing.className = "regions-drawing";
    drawing.innerHTML = drawRegions(game.board, {
      entries: game.entries,
      selected,
      errors,
      material: options.material,
      pieces: options.pieces,
      language: language(),
    });
    const cells = document.createElement("div");
    cells.className = "regions-cells";
    cells.setAttribute("role", "grid");
    cells.setAttribute("aria-label", words.title);
    for (let cell = 0; cell < game.entries.length; cell += 1) {
      const x = cell % game.board.width;
      const y = Math.floor(cell / game.board.width);
      const given = game.board.givens[cell]!;
      const value = game.entries[cell]!;
      const control = document.createElement("button");
      control.type = "button";
      control.className = "regions-cell";
      control.dataset.cell = String(cell);
      control.setAttribute("role", "gridcell");
      control.setAttribute("aria-label", `${words.row} ${y + 1}, ${words.column} ${x + 1}, ${value || words.empty}${value ? `, ${words.filled}` : ""}${given ? `, ${words.clue}` : ""}`);
      control.setAttribute("aria-pressed", String(selected === cell));
      control.tabIndex = selected === cell || (selected === null && cell === 0) ? 0 : -1;
      control.addEventListener("click", () => {
        selected = cell;
        message = "";
        update();
      });
      control.addEventListener("keydown", event => moveByKeyboard(event, cell));
      cells.append(control);
    }
    drawing.append(cells);
    board.append(drawing);
    controls.replaceChildren();

    const label = document.createElement("label");
    label.className = "regions-number-label";
    label.textContent = words.selectNumber;
    const number = document.createElement("select");
    number.setAttribute("aria-label", words.selectNumber);
    number.dataset.number = "true";
    // Only numbers an answer can hold: more than the biggest given only fits among squares that have no given.
    const most = Math.max(regionsMostValue(game.board, game.board.givens), ...game.entries);
    for (let value = 1; value <= most; value += 1) {
      const option = document.createElement("option");
      option.value = String(value);
      option.textContent = String(value);
      number.append(option);
    }
    label.append(number);
    controls.append(label);
    button(words.fill, () => applySelected(Number(number.value)), selected === null || Boolean(game.board.givens[selected]));
    button(words.clear, () => applySelected(0), selected === null || Boolean(game.board.givens[selected]));
    button(words.undo, () => {
      game = undoRegions(game);
      errors = [];
      message = "";
      emit();
      update();
    }, game.history.length === 0);
    button(words.check, checkBoard);
    button(words.hint, giveHint);
    button(words.restart, restart);

    const nowFinished = checked.ok;
    if (nowFinished && !lastFinishState) options.onFinish?.(copyGame());
    lastFinishState = nowFinished;
  };

  const applySelected = (value: number) => {
    if (selected === null) return;
    const next = setRegionsCell(game, selected, value);
    if (next === game) return;
    game = next;
    errors = [];
    message = "";
    emit();
    update();
  };

  const moveByKeyboard = (event: KeyboardEvent, cell: number) => {
    const x = cell % game.board.width;
    const y = Math.floor(cell / game.board.width);
    const moves: Record<string, number> = {
      ArrowUp: y > 0 ? cell - game.board.width : cell,
      ArrowDown: y + 1 < game.board.height ? cell + game.board.width : cell,
      ArrowLeft: x > 0 ? cell - 1 : cell,
      ArrowRight: x + 1 < game.board.width ? cell + 1 : cell,
    };
    if (event.key in moves) {
      event.preventDefault();
      selected = moves[event.key]!;
      update();
      board.querySelector<HTMLButtonElement>(`button[data-cell="${selected}"]`)?.focus();
      return;
    }
    if (/^[1-9]$/.test(event.key)) {
      event.preventDefault();
      selected = cell;
      applySelected(Number(event.key));
      return;
    }
    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      selected = cell;
      applySelected(0);
    }
  };

  const checkBoard = () => {
    const checked = checkRegions(game.board, game.entries);
    errors = checked.errors;
    message = checked.ok ? game.helped ? regionsWords(language()).helped : regionsWords(language()).solved
      : checked.errors.length ? regionsWords(language()).wrong : regionsWords(language()).checked;
    update();
  };

  const giveHint = () => {
    const hint = hintRegions(game);
    if (!hint) {
      message = regionsWords(language()).noHint;
      update();
      return;
    }
    game = setRegionsCell(game, hint.cell, hint.value);
    game = { ...game, helped: true };
    selected = hint.cell;
    errors = [];
    message = regionsWords(language()).hintWhy;
    emit();
    update();
  };

  const restart = () => {
    game = restartRegions(game);
    selected = null;
    errors = [];
    message = "";
    emit();
    update();
  };

  update();
  return {
    game: () => copyGame(),
    progress: () => encodeRegionsGame(game),
    set: (next: RegionsDrawOptions) => { options = { ...options, ...next }; update(); },
    restart,
    destroy: () => { destroyed = true; root.remove(); style.remove(); },
  };
}

function restoreGame(source: RegionsMountOptions): RegionsGame {
  const saved = source.progress ? decodeRegionsGame(source.progress) : null;
  return saved && saved.board.width === source.board.width && saved.board.height === source.board.height
    && saved.board.givens.every((given, cell) => given === source.board.givens[cell])
    ? saved
    : newRegions(source.board);
}
