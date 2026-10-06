import { checkNurikabe } from "./nurikabe-board.ts";
import { decodeNurikabe, encodeNurikabe, hintNurikabe, markNurikabeSea, newNurikabe, restartNurikabe, undoNurikabe } from "./nurikabe-game.ts";
import { drawNurikabe } from "./nurikabe-draw.ts";
import { KAZU_STYLE } from "./style.ts";
import { NURIKABE_PLAY_STYLE } from "./nurikabe-style.ts";
import { nurikabeWords } from "./nurikabe-strings.ts";
import type { NurikabeDrawOptions, NurikabeMount, NurikabeMountOptions } from "./nurikabe-play.types.ts";
/** A keyboard- and touch-friendly Nurikabe player, mounted in any host element. */
export function mountNurikabe(host: HTMLElement, initial: NurikabeMountOptions): NurikabeMount {
  const doc = host.ownerDocument;
  let options = { ...initial }, game = initial.progress ? decodeNurikabe(initial.progress) : null;
  game ??= newNurikabe(initial.board);
  let selected = 0, errors: readonly number[] = [], message = "", finished = checkNurikabe(game.board, game.sea).ok, dead = false;
  const root = doc.createElement("div"), style = doc.createElement("style"), board = doc.createElement("div"), status = doc.createElement("p"), tools = doc.createElement("div"), help = doc.createElement("p");
  root.className = "kn-root"; style.textContent = KAZU_STYLE.replace(/\.kazu/g, ".ks-palette") + NURIKABE_PLAY_STYLE;
  board.className = "kn-board"; status.className = "kn-status"; status.setAttribute("role", "status"); tools.className = "kn-tools"; help.className = "kn-help";
  root.append(style, board, status, tools, help); host.append(root);
  const copy = () => ({ ...game!, board: { ...game!.board, clues: [...game!.board.clues] }, sea: [...game!.sea], history: game!.history.map(turn => [...turn]) });
  const button = (label: string, action: () => void, disabled = false) => {
    const control = doc.createElement("button"); control.type = "button"; control.textContent = label; control.disabled = disabled; control.onclick = action; tools.append(control);
  };
  const changed = () => {
    errors = []; message = "";
    const wasFinished = finished; finished = checkNurikabe(game!.board, game!.sea).ok; render(); options.onChange?.(copy());
    if (finished && !wasFinished) options.onFinish?.(copy());
  };
  const mark = (cell: number) => { if (finished) return; selected = cell; game = markNurikabeSea(game!, cell); changed(); };
  const render = () => {
    if (dead) return;
    const words = nurikabeWords(options.language), focused = board.contains(doc.activeElement);
    board.innerHTML = drawNurikabe(game!.board, { ...options, sea: game!.sea, selected, errors });
    const cells = doc.createElement("div"); cells.className = "kn-cells"; cells.style.gridTemplateColumns = `repeat(${game!.board.size},1fr)`;
    for (let cell = 0; cell < game!.sea.length; cell += 1) {
      const control = doc.createElement("button"); control.type = "button"; control.className = "kn-cell"; control.dataset.cell = String(cell); control.tabIndex = cell === selected ? 0 : -1;
      control.setAttribute("aria-label", `${words.row} ${Math.floor(cell / game!.board.size) + 1}, ${words.column} ${cell % game!.board.size + 1}: ${game!.board.clues[cell] || (game!.sea[cell] ? words.sea : words.white)}`);
      control.onclick = () => mark(cell);
      control.onkeydown = event => {
        const n = game!.board.size, moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -n, ArrowDown: n };
        if (event.key in moves) { event.preventDefault(); selected = Math.max(0, Math.min(game!.sea.length - 1, cell + moves[event.key]!)); render(); }
        else if (event.key === " " || event.key === "Enter") { event.preventDefault(); mark(cell); }
      };
      cells.append(control);
    }
    board.append(cells);
    if (focused) board.querySelector<HTMLElement>(`[data-cell="${selected}"]`)?.focus();
    status.textContent = finished ? (game!.helped ? words.helped : words.won) : message; help.textContent = words.help; tools.replaceChildren();
    button(words.undo, () => { game = undoNurikabe(game!); changed(); }, !game!.history.length);
    button(words.check, () => { errors = checkNurikabe(game!.board, game!.sea).errors; message = errors.length ? words.wrong : words.good; render(); });
    button(words.hint, () => {
      const cell = hintNurikabe(game!);
      if (cell === null) { message = words.noHint; render(); return; }
      game = { ...markNurikabeSea(game!, cell), helped: true }; changed();
    }, finished);
    button(words.restart, () => { game = restartNurikabe(game!); finished = false; changed(); });
  };
  render();
  return {
    game: copy, progress: () => encodeNurikabe(game!), restart: () => { game = restartNurikabe(game!); finished = false; changed(); },
    set: (next: NurikabeDrawOptions) => { options = { ...options, ...next }; render(); }, destroy: () => { dead = true; root.remove(); },
  };
}
