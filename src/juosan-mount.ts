import { checkJuosan } from "./juosan-board.ts";
import {
  decodeJuosan,
  encodeJuosan,
  hintJuosan,
  juosanFinished,
  newJuosan,
  restartJuosan,
  setJuosanMark,
  undoJuosan,
} from "./juosan-game.ts";
import { drawJuosan } from "./juosan-draw.ts";
import { KAZU_STYLE } from "./style.ts";
import { JUOSAN_PLAY_STYLE } from "./juosan-style.ts";
import { juosanWords } from "./juosan-strings.ts";
import type { JuosanDrawOptions, JuosanMount, JuosanMountOptions } from "./juosan-play.types.ts";

/** Mounts a touch, mouse, and keyboard player into an existing page element. */
export function mountJuosan(host: HTMLElement, initial: JuosanMountOptions): JuosanMount {
  const doc = host.ownerDocument;
  let options = { ...initial };
  let game = initial.progress ? decodeJuosan(initial.progress) : null;
  game ??= newJuosan(initial.board);

  let selected = 0;
  let message = "";
  let finished = juosanFinished(game);
  let destroyed = false;

  const root = doc.createElement("div");
  const style = doc.createElement("style");
  const board = doc.createElement("div");
  const status = doc.createElement("p");
  const tools = doc.createElement("div");
  const help = doc.createElement("p");

  root.className = "js-root";
  style.textContent = KAZU_STYLE.replace(/\.kazu/g, ".js-palette") + JUOSAN_PLAY_STYLE;
  board.className = "js-board";
  status.className = "js-status";
  status.setAttribute("role", "status");
  tools.className = "js-tools";
  help.className = "js-help";
  root.append(style, board, status, tools, help);
  host.append(root);

  const copyGame = () => ({
    ...game!,
    board: {
      ...game!.board,
      territories: game!.board.territories.map(territory => ({
        ...territory,
        cells: [...territory.cells],
      })),
    },
    marks: [...game!.marks],
    history: game!.history.map(turn => [...turn]),
  });
  const words = () => juosanWords(options.language);

  const addButton = (label: string, action: () => void, disabled = false) => {
    const button = doc.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.disabled = disabled;
    button.onclick = action;
    tools.append(button);
  };

  const changed = () => {
    message = "";
    const wasFinished = finished;
    finished = juosanFinished(game!);
    render();
    options.onChange?.(copyGame());
    if (finished && !wasFinished) options.onFinish?.(copyGame());
  };

  const apply = (mark: 0 | 1 | 2) => {
    if (finished) return;
    if (mark === 0) {
      if (!game!.marks[selected]) return;
      const marks = [...game!.marks];
      marks[selected] = 0;
      game = { ...game!, marks, history: [...game!.history, [...game!.marks]] };
    } else {
      game = setJuosanMark(game!, selected, mark);
    }
    changed();
  };

  const restart = () => {
    game = restartJuosan(game!);
    finished = false;
    changed();
  };

  const moveSelection = (cell: number) => {
    selected = Math.max(0, Math.min(game!.marks.length - 1, cell));
    render();
    board.querySelector<HTMLElement>(`[data-cell="${selected}"]`)?.focus();
  };

  const onCellKey = (event: KeyboardEvent, cell: number) => {
    const step = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -game!.board.width,
      ArrowDown: game!.board.width,
    }[event.key];
    if (step !== undefined) {
      event.preventDefault();
      moveSelection(cell + step);
    } else if (event.key.toLowerCase() === "h") {
      event.preventDefault();
      selected = cell;
      apply(1);
    } else if (event.key.toLowerCase() === "v") {
      event.preventDefault();
      selected = cell;
      apply(2);
    } else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      selected = cell;
      apply(0);
    }
  };

  const render = () => {
    if (destroyed) return;
    const { board: puzzleBoard } = game!;
    const hadFocus = board.contains(doc.activeElement);

    board.style.aspectRatio = `${puzzleBoard.width}/${puzzleBoard.height}`;
    board.style.setProperty("--juosan-width", String(puzzleBoard.width));
    board.style.setProperty("--juosan-height", String(puzzleBoard.height));
    board.classList.toggle("js-palette", (options.material ?? "ivory") === "ivory");
    board.innerHTML = drawJuosan(puzzleBoard, {
      ...options,
      marks: game!.marks,
      selected,
    });

    const cellButtons = doc.createElement("div");
    cellButtons.className = "js-cells";
    for (let cell = 0; cell < game!.marks.length; cell += 1) {
      const button = doc.createElement("button");
      button.type = "button";
      button.className = "js-cell";
      button.tabIndex = cell === selected ? 0 : -1;
      button.dataset.cell = String(cell);
      button.setAttribute("aria-label", markLabel(cell));
      button.addEventListener("click", () => {
        selected = cell;
        const next = game!.marks[cell] === 0 ? 1 : game!.marks[cell] === 1 ? 2 : 0;
        apply(next);
      });
      button.addEventListener("keydown", event => onCellKey(event, cell));
      cellButtons.append(button);
    }
    board.append(cellButtons);
    if (hadFocus) board.querySelector<HTMLElement>(`[data-cell="${selected}"]`)?.focus();

    status.textContent = juosanFinished(game!)
      ? game!.helped ? words().assisted : words().won
      : message || words().ready;
    help.textContent = words().help;
    tools.replaceChildren();
    addButton(words().undo, () => {
      game = undoJuosan(game!);
      finished = juosanFinished(game!);
      changed();
    }, game!.history.length === 0);
    addButton(words().hint, giveHint, finished);
    addButton(words().check, checkCurrent);
    addButton(words().restart, restart);
  };

  const markLabel = (cell: number) => {
    const mark = game!.marks[cell];
    const kind = mark === 1
      ? words().horizontal
      : mark === 2 ? words().vertical : words().blank;
    const row = Math.floor(cell / game!.board.width) + 1;
    const column = cell % game!.board.width + 1;
    return `${words().row} ${row}, ${words().column} ${column}: ${kind}`;
  };

  const giveHint = () => {
    const hint = hintJuosan(game!);
    if (!hint) {
      message = words().wrong;
      render();
      return;
    }
    selected = hint.cell;
    game = setJuosanMark(game!, hint.cell, hint.mark);
    game = { ...game!, helped: true };
    changed();
    message = words().hintWhy;
    render();
  };

  const checkCurrent = () => {
    const complete = game!.marks.every(mark => mark !== 0);
    message = complete && checkJuosan(game!.board, game!.marks).ok
      ? words().checked
      : words().wrong;
    render();
  };

  render();
  return {
    game: copyGame,
    progress: () => encodeJuosan(game!),
    restart,
    set: (next: JuosanDrawOptions) => {
      options = { ...options, ...next };
      render();
    },
    destroy: () => {
      destroyed = true;
      root.remove();
    },
  };
}
