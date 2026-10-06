import { checkHeyawake, isHeyawakeBoard } from "./heyawake-board.ts";
import { decodeHeyawake, encodeHeyawake, hintHeyawake, newHeyawake, restartHeyawake, setHeyawakeCell, undoHeyawake, heyawakeFinished } from "./heyawake-game.ts";
import { drawHeyawake } from "./heyawake-draw.ts";
import { KAZU_STYLE } from "./style.ts";
import { HEYAWAKE_PLAY_STYLE } from "./heyawake-style.ts";
import { heyawakeWords } from "./heyawake-strings.ts";
import type { HeyawakeDrawOptions, HeyawakeMount, HeyawakeMountOptions } from "./heyawake-play.types.ts";

export function mountHeyawake(host: HTMLElement, initial: HeyawakeMountOptions): HeyawakeMount {
  if (!isHeyawakeBoard(initial.board)) throw new RangeError("Invalid Heyawake board");
  const doc = host.ownerDocument;
  let options = { ...initial }, game = initial.progress ? decodeHeyawake(initial.progress) : null;
  if (!game || JSON.stringify(game.board) !== JSON.stringify(initial.board)) game = newHeyawake(initial.board);
  let selected = 0, errors: readonly number[] = [], message = "", dead = false, finished = heyawakeFinished(game);
  const root = doc.createElement("div"), style = doc.createElement("style"), board = doc.createElement("div"), grid = doc.createElement("div"), status = doc.createElement("p"), tools = doc.createElement("div"), help = doc.createElement("p");
  root.className = "kh-root"; style.textContent = KAZU_STYLE.replace(/\.kazu/g, ".kh-palette") + HEYAWAKE_PLAY_STYLE;
  board.className = "kh-board"; grid.className = "kh-grid"; status.className = "kh-status"; status.setAttribute("role", "status"); tools.className = "kh-tools"; help.className = "kh-help";
  root.append(style, board, status, tools, help); host.append(root);
  const copy = () => ({ ...game!, board: { width: game!.board.width, height: game!.board.height, rooms: game!.board.rooms.map(room => ({ ...room })) }, entries: [...game!.entries], history: game!.history.map(turn => [...turn]) });
  const words = () => heyawakeWords(options.language);
  const button = (label: string, action: () => void, disabled = false) => { const item = doc.createElement("button"); item.type = "button"; item.textContent = label; item.disabled = disabled; item.onclick = action; tools.append(item); };
  const changed = () => {
    errors = []; message = ""; const won = heyawakeFinished(game!); render();
    options.onChange?.(copy()); root.dispatchEvent(new CustomEvent("heyawake-change", { detail: copy(), bubbles: true }));
    if (won && !finished) { options.onFinish?.(copy()); root.dispatchEvent(new CustomEvent("heyawake-finish", { detail: copy(), bubbles: true })); }
    finished = won;
  };
  const choose = (cell: number) => {
    if (finished) return;
    selected = cell; const value = game!.entries[cell] === null ? true : game!.entries[cell] === true ? false : null;
    game = setHeyawakeCell(game!, cell, value); changed();
  };
  const restart = () => { game = restartHeyawake(game!); finished = false; changed(); };
  const render = () => {
    if (dead) return;
    const w = words(), b = game!.board, focused = grid.contains(doc.activeElement);
    board.classList.toggle("kh-palette", (options.material ?? "ivory") === "ivory");
    board.innerHTML = drawHeyawake(b, { ...options, entries: game!.entries, selected, errors });
    grid.replaceChildren(); grid.style.gridTemplateColumns = `repeat(${b.width},1fr)`;
    game!.entries.forEach((entry, cellIndex) => {
      const cell = doc.createElement("button"); cell.type = "button"; cell.className = "kh-cell"; cell.dataset.cell = String(cellIndex); cell.tabIndex = cellIndex === selected ? 0 : -1;
      cell.setAttribute("aria-label", `${w.row} ${Math.floor(cellIndex / b.width) + 1}, ${w.column} ${cellIndex % b.width + 1}: ${entry === true ? w.black : entry === false ? w.white : w.blank}`);
      cell.setAttribute("aria-pressed", String(entry !== null)); cell.onclick = () => choose(cellIndex);
      cell.onkeydown = event => {
        const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -b.width, ArrowDown: b.width };
        if (event.key in moves) { event.preventDefault(); selected = Math.max(0, Math.min(game!.entries.length - 1, cellIndex + moves[event.key]!)); render(); }
        else if (event.key === " " || event.key === "Enter") { event.preventDefault(); choose(cellIndex); }
      };
      grid.append(cell);
    });
    board.append(grid); if (focused) grid.querySelector<HTMLElement>(`[data-cell="${selected}"]`)?.focus();
    const checked = checkHeyawake(b, game!.entries);
    status.textContent = heyawakeFinished(game!) ? game!.helped ? w.helped : w.won : message || (errors.length ? w.wrong : "");
    status.classList.toggle("kh-errors", errors.length > 0); help.textContent = w.help; tools.replaceChildren();
    button(w.undo, () => { game = undoHeyawake(game!); finished = heyawakeFinished(game!); changed(); }, !game!.history.length);
    button(w.check, () => { errors = checked.errors; message = checked.errors.length === 0 ? w.checked : w.wrong; render(); });
    button(w.hint, () => {
      const hint = hintHeyawake(game!);
      if (!hint) { message = w.noHint; render(); return; }
      game = { ...setHeyawakeCell(game!, hint.cell, hint.value), helped: true }; changed();
    }, finished);
    button(w.restart, restart);
  };
  render();
  return { game: copy, progress: () => encodeHeyawake(game!), restart, set: (next: HeyawakeDrawOptions) => { options = { ...options, ...next }; render(); }, destroy: () => { dead = true; root.remove(); } };
}
