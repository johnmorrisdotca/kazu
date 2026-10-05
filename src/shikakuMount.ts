import { checkShikaku, shikakuCells } from "./shikakuBoard.ts";
import { decodeShikaku, encodeShikaku, hintShikaku, newShikaku, placeShikaku, removeShikaku, shikakuFinished, undoShikaku } from "./shikakuGame.ts";
import { drawShikaku } from "./shikakuDraw.ts";
import { KAZU_STYLE } from "./style.ts";
import { SHIKAKU_PLAY_STYLE } from "./shikakuStyle.ts";
import { shikakuWords } from "./shikakuStrings.ts";
import type { ShikakuDrawOptions, ShikakuMount, ShikakuMountOptions } from "./shikakuPlay.types.ts";

/** A rectangle player in any element; mount once, update appearance with set, destroy on unmount. */
export function mountShikaku(host: HTMLElement, initial: ShikakuMountOptions): ShikakuMount {
  const doc = host.ownerDocument;
  let options = { ...initial }, game = initial.progress ? decodeShikaku(initial.progress) : null;
  game ??= newShikaku(initial.board);
  let selected = 0, anchor: number | null = null, errors: readonly number[] = [], message = "", finished = shikakuFinished(game), dead = false;
  const root = doc.createElement("div"), style = doc.createElement("style"), board = doc.createElement("div"), status = doc.createElement("p"), tools = doc.createElement("div"), help = doc.createElement("p");
  root.className = "ks-root"; style.textContent = KAZU_STYLE.replace(/\.kazu/g, ".ks-palette") + SHIKAKU_PLAY_STYLE; board.className = "ks-board";
  status.className = "ks-status"; status.setAttribute("role", "status"); tools.className = "ks-tools"; help.className = "ks-help";
  root.append(style, board, status, tools, help); host.append(root);
  const copy = () => ({ ...game!, board: { ...game!.board, clues: [...game!.board.clues] }, rectangles: game!.rectangles.map(r => ({ ...r })), history: game!.history.map(turn => turn.map(r => ({ ...r }))) });
  const words = () => shikakuWords(options.language);
  const button = (text: string, action: () => void, disabled = false) => {
    const b = doc.createElement("button"); b.type = "button"; b.textContent = text; b.disabled = disabled; b.onclick = action; tools.append(b);
  };
  const changed = () => {
    errors = []; message = ""; anchor = null;
    const won = shikakuFinished(game!); render();
    options.onChange?.(copy()); root.dispatchEvent(new CustomEvent("shikaku-change", { detail: copy(), bubbles: true }));
    if (won && !finished) { options.onFinish?.(copy()); root.dispatchEvent(new CustomEvent("shikaku-finish", { detail: copy(), bubbles: true })); }
    finished = won;
  };
  const choose = (cell: number) => {
    if (finished) return;
    selected = cell;
    if (anchor === null) { anchor = cell; message = ""; render(); return; }
    const a = anchor, width = game!.board.width, ax = a % width, ay = Math.floor(a / width), x = cell % width, y = Math.floor(cell / width);
    game = placeShikaku(game!, { x: Math.min(ax, x), y: Math.min(ay, y), width: Math.abs(ax - x) + 1, height: Math.abs(ay - y) + 1 }); changed();
  };
  const remove = () => { game = removeShikaku(game!, selected); changed(); };
  const restart = () => { game = newShikaku(game!.board); finished = false; changed(); };
  const render = () => {
    if (dead) return;
    const w = words(), b = game!.board, focused = board.contains(doc.activeElement);
    board.classList.toggle("ks-palette", (options.material ?? "ivory") === "ivory");
    board.innerHTML = drawShikaku(b, { ...options, rectangles: game!.rectangles, selected, anchor, errors });
    const cells = doc.createElement("div"); cells.className = "ks-cells"; cells.style.gridTemplateColumns = `repeat(${b.width},1fr)`;
    for (let c = 0; c < b.clues.length; c += 1) {
      const cell = doc.createElement("button"); cell.type = "button"; cell.className = "ks-cell"; cell.dataset.cell = String(c); cell.tabIndex = c === selected ? 0 : -1;
      const inside = game!.rectangles.find(r => shikakuCells(b, r)!.includes(c));
      cell.setAttribute("aria-label", `${w.row} ${Math.floor(c / b.width) + 1}, ${w.column} ${c % b.width + 1}: ${b.clues[c] ? `${w.clue} ${b.clues[c]}` : w.blank}${inside ? `, ${w.covered}` : ""}`);
      cell.onclick = () => choose(c);
      cell.onkeydown = e => {
        const steps: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -b.width, ArrowDown: b.width };
        if (e.key in steps) { e.preventDefault(); selected = Math.max(0, Math.min(b.clues.length - 1, c + steps[e.key])); render(); }
        else if (e.key === "Escape") { e.preventDefault(); anchor = null; render(); }
        else if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); selected = c; remove(); }
      };
      cells.append(cell);
    }
    board.append(cells);
    if (focused) board.querySelector<HTMLElement>(`[data-cell="${selected}"]`)?.focus();
    status.textContent = shikakuFinished(game!) ? (game!.helped ? w.helped : w.won) : message || (anchor === null ? w.ready : w.corner);
    help.textContent = w.help; tools.replaceChildren();
    button(w.undo, () => { game = undoShikaku(game!); finished = shikakuFinished(game!); changed(); }, !game!.history.length);
    button(w.remove, remove, finished || !game!.rectangles.some(r => shikakuCells(b, r)!.includes(selected)));
    button(w.cancel, () => { anchor = null; message = ""; render(); }, anchor === null);
    button(w.check, () => { errors = checkShikaku(b, game!.rectangles).errors; message = errors.length ? w.wrong : w.checked; render(); });
    button(w.hint, () => {
      const r = hintShikaku(game!);
      if (!r) { message = w.noHint; render(); return; }
      game = { ...placeShikaku(game!, r), helped: true }; changed(); message = w.hintWhy; render();
    }, finished);
    button(w.restart, restart);
    button(w.expand, () => {
      if (root.parentElement !== host) return;
      const dialog = doc.createElement("dialog"), close = doc.createElement("button"); dialog.className = "ks-dialog"; close.className = "ks-close"; close.textContent = w.close;
      close.onclick = () => dialog.close(); dialog.append(close, root); host.append(dialog);
      dialog.onclose = () => { host.append(root); dialog.remove(); }; dialog.showModal();
    });
  };
  render();
  return { game: copy, progress: () => encodeShikaku(game!), restart,
    set: (next: ShikakuDrawOptions) => { if (next.language && next.language !== options.language) message = ""; options = { ...options, ...next }; render(); },
    destroy: () => { dead = true; const dialog = root.closest("dialog"); root.remove(); dialog?.remove(); } };
}
