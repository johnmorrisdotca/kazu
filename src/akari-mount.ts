import { akariVisible, checkAkari } from "./akari-board.ts";
import {
  akariFinished,
  decodeAkari,
  encodeAkari,
  hintAkari,
  newAkari,
  toggleAkari,
  undoAkari,
} from "./akari-game.ts";
import { drawAkari } from "./akari-draw.ts";
import { KAZU_STYLE } from "./style.ts";
import { AKARI_PLAY_STYLE } from "./akari-style.ts";
import { akariWords } from "./akari-strings.ts";
import type { AkariDrawOptions, AkariMount, AkariMountOptions } from "./akari-play.types.ts";

/** Mounts the player in a host element; call destroy when the host is removed. */
export function mountAkari(host: HTMLElement, initial: AkariMountOptions): AkariMount {
  const doc = host.ownerDocument;
  let options = { ...initial };
  let game = initial.progress ? decodeAkari(initial.progress) : null;
  game ??= newAkari(initial.board);

  let selected = game.board.cells.findIndex(cell => cell === null);
  let errors: number[] = [];
  let message = "";
  let finished = akariFinished(game);
  let dead = false;

  const root = doc.createElement("div");
  const style = doc.createElement("style");
  const board = doc.createElement("div");
  const status = doc.createElement("p");
  const tools = doc.createElement("div");
  const help = doc.createElement("p");

  root.className = "ka-root";
  style.textContent = KAZU_STYLE.replace(/\.kazu/g, ".ka-palette") + AKARI_PLAY_STYLE;
  board.className = "ka-board";
  status.className = "ka-status";
  status.setAttribute("role", "status");
  tools.className = "ka-tools";
  help.className = "ka-help";
  root.append(style, board, status, tools, help);
  host.append(root);

  const copy = () => ({
    ...game!,
    board: { ...game!.board, cells: [...game!.board.cells] },
    bulbs: [...game!.bulbs],
    history: game!.history.map(turn => [...turn]),
  });
  const words = () => akariWords(options.language);

  const button = (label: string, action: () => void, disabled = false) => {
    const control = doc.createElement("button");
    control.type = "button";
    control.textContent = label;
    control.disabled = disabled;
    control.onclick = action;
    tools.append(control);
  };

  const changed = () => {
    errors = [];
    message = "";
    const won = akariFinished(game!);
    render();
    options.onChange?.(copy());
    root.dispatchEvent(new CustomEvent("akari-change", { detail: copy(), bubbles: true }));
    if (won && !finished) {
      options.onFinish?.(copy());
      root.dispatchEvent(new CustomEvent("akari-finish", { detail: copy(), bubbles: true }));
    }
    finished = won;
  };

  const toggle = (cell: number) => {
    if (finished || game!.board.cells[cell] !== null) return;
    selected = cell;
    game = toggleAkari(game!, cell);
    changed();
  };

  const restart = () => {
    game = newAkari(game!.board);
    finished = false;
    selected = game.board.cells.findIndex(cell => cell === null);
    changed();
  };

  const render = () => {
    if (dead) return;
    const w = words();
    const current = game!.board;
    const focused = board.contains(doc.activeElement);
    const check = checkAkari(current, game!.bulbs);

    board.classList.toggle("ka-palette", (options.material ?? "ivory") === "ivory");
    board.innerHTML = drawAkari(current, { ...options, bulbs: game!.bulbs, selected, errors });

    const cells = doc.createElement("div");
    cells.className = "ka-cells";
    cells.setAttribute("role", "grid");
    cells.style.gridTemplateColumns = `repeat(${current.width},1fr)`;

    for (let cellIndex = 0; cellIndex < current.cells.length; cellIndex += 1) {
      const white = current.cells[cellIndex] === null;
      const bulb = game!.bulbs.includes(cellIndex);
      const lit = white && game!.bulbs.some(on => akariVisible(current, on).includes(cellIndex));
      const control = doc.createElement("button");
      const row = Math.floor(cellIndex / current.width) + 1;
      const column = cellIndex % current.width + 1;

      control.type = "button";
      control.className = "ka-cell";
      control.dataset.cell = String(cellIndex);
      control.tabIndex = white && cellIndex === selected ? 0 : -1;
      control.disabled = !white;
      control.setAttribute("role", "gridcell");
      control.setAttribute("aria-pressed", String(bulb));
      control.setAttribute("aria-label", cellLabel(w, current.cells[cellIndex]!, row, column, lit, bulb, white));
      control.onclick = () => toggle(cellIndex);
      control.onkeydown = event => handleKey(event, cellIndex, current.width, current.cells);
      cells.append(control);
    }

    board.append(cells);
    if (focused) board.querySelector<HTMLElement>(`[data-cell="${selected}"]`)?.focus();
    status.textContent = check.ok ? (game!.helped ? w.helped : w.won) : message || w.checked;
    help.textContent = w.help;
    tools.replaceChildren();

    button(w.undo, () => {
      game = undoAkari(game!);
      finished = akariFinished(game!);
      changed();
    }, !game!.history.length);
    button(w.check, () => {
      errors = [...new Set([...check.dark, ...check.numbered, ...check.conflicts])];
      message = check.ok ? w.won : w.wrong;
      render();
    });
    button(w.hint, () => {
      const cell = hintAkari(game!);
      if (cell === null) {
        message = w.noHint;
        render();
        return;
      }
      game = { ...toggleAkari(game!, cell), helped: true };
      changed();
      message = w.hintWhy;
      render();
    }, finished);
    button(w.restart, restart);
    button(w.expand, expand);
  };

  function cellLabel(
    w: ReturnType<typeof akariWords>,
    value: number | null | false,
    row: number,
    column: number,
    lit: boolean,
    bulb: boolean,
    white: boolean,
  ): string {
    const position = `${w.row} ${row}, ${w.column} ${column}`;
    if (!white) return `${position}: ${w.black}${typeof value === "number" && value ? ` ${value}` : ""}`;
    return `${position}: ${w.white}${lit ? `, ${w.lit}` : `, ${w.dark}`}${bulb ? `, ${w.bulb}` : ""}`;
  }

  function handleKey(
    event: KeyboardEvent,
    cell: number,
    width: number,
    values: readonly (number | null | false)[],
  ) {
    const steps: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -width,
      ArrowDown: width,
    };
    if (event.key in steps) {
      event.preventDefault();
      const delta = steps[event.key]!;
      let next = cell;
      while (true) {
        const candidate = next + delta;
        if (candidate < 0 || candidate >= values.length) break;
        if (Math.abs(delta) === 1 && Math.floor(candidate / width) !== Math.floor(next / width)) break;
        next = candidate;
        if (values[next] === null) break;
      }
      if (values[next] === null) {
        selected = next;
        render();
      }
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle(cell);
    } else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      if (game!.bulbs.includes(cell)) toggle(cell);
    }
  }

  function expand() {
    if (root.parentElement !== host) return;
    const dialog = doc.createElement("dialog");
    const close = doc.createElement("button");
    dialog.className = "ka-dialog";
    close.className = "ka-close";
    close.textContent = words().close;
    close.onclick = () => dialog.close();
    dialog.append(close, root);
    host.append(dialog);
    dialog.onclose = () => {
      host.append(root);
      dialog.remove();
    };
    dialog.showModal();
  }

  render();
  return {
    game: copy,
    progress: () => encodeAkari(game!),
    restart,
    set: (next: AkariDrawOptions) => {
      if (next.language && next.language !== options.language) message = "";
      options = { ...options, ...next };
      render();
    },
    destroy: () => {
      dead = true;
      const dialog = root.closest("dialog");
      root.remove();
      dialog?.remove();
    },
  };
}
