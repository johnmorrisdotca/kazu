import {
  progressLoop,
  loopCellEdges,
  loopHorizontalCount,
  loopVertexEdges,
} from "./loop-board.ts";
import {
  decodeLoop,
  encodeLoop,
  hintLoop,
  newLoop,
  loopFinished,
  toggleLoop,
  undoLoop,
} from "./loop-game.ts";
import { KAZU_STYLE } from "./style.ts";
import { LOOP_PLAY_STYLE } from "./loop-style.ts";
import { loopWords } from "./loop-strings.ts";
import type {
  LoopDrawOptions,
  LoopMount,
  LoopMountOptions,
} from "./loop-play.types.ts";
import type { LoopBoard } from "./loop.types.ts";

/** Mounts an accessible dot-and-edge loop player in the given host element. */
export function mountLoop(host: HTMLElement, initial: LoopMountOptions): LoopMount {
  const doc = host.ownerDocument;
  let options = { ...initial };
  let game = initial.progress ? decodeLoop(initial.progress) : null;
  game ??= newLoop(initial.board);
  const geometry = edgeGeometry(game.board);
  let selected = 0;
  let errors: number[] = [];
  let message = "";
  let finished = loopFinished(game);
  let dead = false;

  const root = doc.createElement("div");
  const style = doc.createElement("style");
  const board = doc.createElement("div");
  const status = doc.createElement("p");
  const tools = doc.createElement("div");
  const help = doc.createElement("p");
  root.className = "sl-root";
  style.textContent = KAZU_STYLE.replace(/\.kazu/g, ".sl-palette") + LOOP_PLAY_STYLE;
  board.className = "sl-board";
  status.className = "sl-status";
  status.setAttribute("role", "status");
  tools.className = "sl-tools";
  help.className = "sl-help";
  root.append(style, board, status, tools, help);
  host.append(root);

  const copy = () => ({
    ...game!,
    board: { ...game!.board, clues: [...game!.board.clues] },
    edges: [...game!.edges],
    history: game!.history.map(turn => [...turn]),
  });
  const words = () => loopWords(options.language);

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
    const won = loopFinished(game!);
    render();
    options.onChange?.(copy());
    root.dispatchEvent(new CustomEvent("loop-change", { detail: copy(), bubbles: true }));
    if (won && !finished) {
      options.onFinish?.(copy());
      root.dispatchEvent(new CustomEvent("loop-finish", { detail: copy(), bubbles: true }));
    }
    finished = won;
  };

  const toggle = (edge: number) => {
    if (finished) return;
    selected = edge;
    game = toggleLoop(game!, edge);
    changed();
  };

  const restart = () => {
    game = newLoop(game!.board);
    finished = false;
    selected = 0;
    changed();
  };

  const render = () => {
    if (dead) return;
    const focused = board.contains(doc.activeElement);
    const w = words();
    const current = game!.board;
    const selectedEdges = new Set(game!.edges);
    const clues = progressLoop(current, game!.edges);
    board.classList.toggle("sl-palette", (options.material ?? "ivory") === "ivory");
    const material = options.material ?? "ivory";
    const palette = {
      ivory: ["var(--kz-ink,#1f2320)", "var(--kz-grid,#cfc6b2)"],
      wood: ["#493e2f", "#bca582"],
      slate: ["#ece8dc", "#454a44"],
    }[material];
    board.style.setProperty("--sl-ink", palette[0]!);
    board.style.setProperty("--kz-grid", palette[1]!);
    board.setAttribute("role", "grid");
    board.setAttribute("aria-label", w.title);
    board.style.gridTemplateColumns = `repeat(${current.width * 2 + 1}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${current.height * 2 + 1}, 1fr)`;
    board.style.aspectRatio = `${current.width * 2 + 1} / ${current.height * 2 + 1}`;
    board.replaceChildren();

    for (let cell = 0; cell < current.clues.length; cell += 1) {
      const clue = current.clues[cell];
      if (clue === null) continue;
      const tile = doc.createElement("span");
      tile.className = "sl-cell";
      tile.style.gridColumnStart = String((cell % current.width) * 2 + 2);
      tile.style.gridRowStart = String(Math.floor(cell / current.width) * 2 + 2);
      tile.textContent = String(clue);
      tile.setAttribute("aria-hidden", "true");
      board.append(tile);
    }

    for (const point of gridPoints(current)) {
      const dot = doc.createElement("span");
      dot.className = "sl-dot";
      dot.style.gridColumnStart = String(point.x * 2 + 1);
      dot.style.gridRowStart = String(point.y * 2 + 1);
      dot.setAttribute("aria-hidden", "true");
      board.append(dot);
    }

    for (const edge of geometry) {
      const control = doc.createElement("button");
      const on = selectedEdges.has(edge.id);
      control.type = "button";
      control.className = `sl-edge ${edge.orientation}${on ? " on" : ""}${errors.includes(edge.id) ? " error" : ""}`;
      control.style.gridColumnStart = String(edge.x * 2 + 1);
      control.style.gridRowStart = String(edge.y * 2 + 1);
      if (edge.orientation === "horizontal") control.style.gridColumnEnd = "span 3";
      else control.style.gridRowEnd = "span 3";
      control.tabIndex = edge.id === selected ? 0 : -1;
      control.dataset.edge = String(edge.id);
      control.setAttribute("aria-pressed", String(on));
      control.setAttribute("aria-label", `${w.edge} ${edge.id + 1}, ${on ? "on" : "off"}`);
      control.onclick = () => toggle(edge.id);
      control.onkeydown = event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle(edge.id);
        } else if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
          event.preventDefault();
          moveFocus(edge.id, event.key);
        } else if ((event.key === "Delete" || event.key === "Backspace") && on) {
          event.preventDefault();
          toggle(edge.id);
        }
      };
      board.append(control);
    }

    if (focused) board.querySelector<HTMLElement>(`[data-edge="${selected}"]`)?.focus();
    status.textContent = finished ? (game!.helped ? w.helped : w.won) : message || w.checked;
    help.textContent = w.help;
    tools.replaceChildren();

    button(w.undo, () => {
      game = undoLoop(game!);
      finished = loopFinished(game!);
      changed();
    }, !game!.history.length);
    button(w.check, () => {
      errors = progressEdges(current, game!.edges, clues.clues, clues.vertices, clues.loops);
      message = loopFinished(game!) ? w.won : w.wrong;
      render();
    });
    button(w.hint, () => {
      const edge = hintLoop(game!);
      if (edge === null) {
        message = w.noHint;
        render();
        return;
      }
      game = { ...toggleLoop(game!, edge), helped: true };
      changed();
      message = w.hintWhy;
      render();
    }, finished);
    button(w.restart, restart);
    button(w.expand, expand);
  };

  function moveFocus(edge: number, direction: string) {
    const origin = geometry[edge]!;
    const dx = direction === "ArrowLeft" ? -1 : direction === "ArrowRight" ? 1 : 0;
    const dy = direction === "ArrowUp" ? -1 : direction === "ArrowDown" ? 1 : 0;
    const candidates = geometry.filter(candidate => {
      const deltaX = candidate.cx - origin.cx;
      const deltaY = candidate.cy - origin.cy;
      return dx ? deltaX * dx > 0 : deltaY * dy > 0;
    });
    candidates.sort((a, b) => {
      const aMajor = dx ? Math.abs(a.cx - origin.cx) : Math.abs(a.cy - origin.cy);
      const bMajor = dx ? Math.abs(b.cx - origin.cx) : Math.abs(b.cy - origin.cy);
      if (aMajor !== bMajor) return aMajor - bMajor;
      const aMinor = dx ? Math.abs(a.cy - origin.cy) : Math.abs(a.cx - origin.cx);
      const bMinor = dx ? Math.abs(b.cy - origin.cy) : Math.abs(b.cx - origin.cx);
      return aMinor - bMinor;
    });
    const next = candidates[0];
    if (!next) return;
    selected = next.id;
    render();
  }

  function expand() {
    if (root.parentElement !== host) return;
    const dialog = doc.createElement("dialog");
    const close = doc.createElement("button");
    dialog.className = "sl-dialog";
    close.className = "sl-close";
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
    progress: () => encodeLoop(game!),
    restart,
    set: (next: LoopDrawOptions) => {
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

function gridPoints(board: LoopBoard): { x: number; y: number }[] {
  return Array.from({ length: (board.width + 1) * (board.height + 1) }, (_, vertex) => ({
    x: vertex % (board.width + 1),
    y: Math.floor(vertex / (board.width + 1)),
  }));
}

function edgeGeometry(board: LoopBoard) {
  const horizontal = loopHorizontalCount(board);
  const edges = Array.from({ length: horizontal + board.height * (board.width + 1) }, (_, id) => {
    if (id < horizontal) {
      const x = id % board.width;
      const y = Math.floor(id / board.width);
      return { id, orientation: "horizontal" as const, x, y, cx: x + .5, cy: y };
    }
    const local = id - horizontal;
    const x = local % (board.width + 1);
    const y = Math.floor(local / (board.width + 1));
    return { id, orientation: "vertical" as const, x, y, cx: x, cy: y + .5 };
  });
  return edges;
}

function progressEdges(
  board: LoopBoard,
  edges: readonly number[],
  clueErrors: readonly number[],
  vertexErrors: readonly number[],
  loops: number,
): number[] {
  if (loops > 1) return [...edges];
  const result = new Set<number>();
  clueErrors.forEach(cell => loopCellEdges(board, cell)?.forEach(edge => result.add(edge)));
  vertexErrors.forEach(vertex => loopVertexEdges(board, vertex).forEach(edge => result.add(edge)));
  return [...result];
}
