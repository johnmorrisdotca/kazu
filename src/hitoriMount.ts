import { checkHitori } from "./hitoriBoard.ts";
import { decodeHitori, encodeHitori, hintHitori, newHitori, restartHitori, shadeHitori, undoHitori } from "./hitoriGame.ts";
import { drawHitori } from "./hitoriDraw.ts";
import { KAZU_STYLE } from "./style.ts";
import { HITORI_PLAY_STYLE } from "./hitoriStyle.ts";
import { hitoriWords } from "./hitoriStrings.ts";
import type { HitoriDrawOptions, HitoriMount, HitoriMountOptions } from "./hitoriPlay.types.ts";

/** A keyboard- and touch-friendly Hitori player, mounted in any host element. */
export function mountHitori(host: HTMLElement, initial: HitoriMountOptions): HitoriMount {
  const doc = host.ownerDocument;
  let options = { ...initial }, game = initial.progress ? decodeHitori(initial.progress) : null;
  game ??= newHitori(initial.board);
  let selected = 0, errors: readonly number[] = [], message = "", finished = checkHitori(game.board, game.shaded).ok, dead = false;
  const root = doc.createElement("div"), style = doc.createElement("style"), board = doc.createElement("div");
  const status = doc.createElement("p"), tools = doc.createElement("div"), help = doc.createElement("p");
  root.className = "kh-root";
  style.textContent = KAZU_STYLE.replace(/\.kazu/g, ".ks-palette") + HITORI_PLAY_STYLE;
  board.className = "kh-board"; status.className = "kh-status"; status.setAttribute("role", "status");
  tools.className = "kh-tools"; help.className = "kh-help";
  root.append(style, board, status, tools, help); host.append(root);

  const copy = () => ({ ...game!, board: { ...game!.board, numbers: [...game!.board.numbers] }, shaded: [...game!.shaded], history: game!.history.map(turn => [...turn]) });
  const button = (label: string, action: () => void, disabled = false) => {
    const control = doc.createElement("button"); control.type = "button"; control.textContent = label; control.disabled = disabled; control.onclick = action; tools.append(control);
  };
  const changed = () => {
    errors = []; message = "";
    const wasFinished = finished; finished = checkHitori(game!.board, game!.shaded).ok;
    render(); options.onChange?.(copy());
    if (finished && !wasFinished) options.onFinish?.(copy());
  };
  const shade = (cell: number) => {
    if (finished) return;
    selected = cell; game = shadeHitori(game!, cell); changed();
  };
  const render = () => {
    if (dead) return;
    const words = hitoriWords(options.language), focused = board.contains(doc.activeElement), size = game!.board.size;
    board.innerHTML = drawHitori(game!.board, { ...options, shaded: game!.shaded, selected, errors });
    const cells = doc.createElement("div"); cells.className = "kh-cells"; cells.style.gridTemplateColumns = `repeat(${size},1fr)`;
    for (let cell = 0; cell < game!.shaded.length; cell += 1) {
      const control = doc.createElement("button"); control.type = "button"; control.className = "kh-cell";
      control.dataset.cell = String(cell); control.tabIndex = cell === selected ? 0 : -1;
      const state = game!.shaded[cell] ? words.shaded : words.white;
      control.setAttribute("aria-label", `${words.cell} ${Math.floor(cell / size) + 1}, ${words.column} ${cell % size + 1}: ${game!.board.numbers[cell]}, ${state}`);
      control.setAttribute("aria-pressed", String(game!.shaded[cell]));
      control.onclick = () => shade(cell);
      control.onkeydown = event => {
        const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -size, ArrowDown: size };
        if (event.key in moves) { event.preventDefault(); selected = Math.max(0, Math.min(game!.shaded.length - 1, cell + moves[event.key]!)); render(); }
        else if (event.key === " " || event.key === "Enter") { event.preventDefault(); shade(cell); }
      };
      cells.append(control);
    }
    board.append(cells);
    if (focused) board.querySelector<HTMLElement>(`[data-cell="${selected}"]`)?.focus();
    status.textContent = finished ? (game!.helped ? words.helped : words.won) : message;
    help.textContent = words.help; tools.replaceChildren();
    button(words.undo, () => { game = undoHitori(game!); changed(); }, !game!.history.length);
    button(words.check, () => { errors = checkHitori(game!.board, game!.shaded).errors; message = errors.length ? words.bad : words.good; render(); });
    button(words.hint, () => {
      const cell = hintHitori(game!);
      if (cell === null) { message = words.noHint; render(); return; }
      selected = cell; game = { ...shadeHitori(game!, cell), helped: true }; changed();
    }, finished);
    button(words.restart, () => { game = restartHitori(game!); finished = false; changed(); });
  };
  render();
  return {
    game: copy,
    progress: () => encodeHitori(game!),
    restart: () => { game = restartHitori(game!); finished = false; changed(); },
    set: (next: HitoriDrawOptions) => { options = { ...options, ...next }; render(); },
    destroy: () => { dead = true; root.remove(); },
  };
}
