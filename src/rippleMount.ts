import { KAZU_STYLE } from "./style.ts";
import { checkRipple, progressRipple, rippleRoomSizes } from "./rippleBoard.ts";
import { decodeRipple, encodeRipple, hintRipple, newRipple, rippleFinished, setRippleValue, toggleRippleNote, undoRipple } from "./rippleGame.ts";
import { RIPPLE_PLAY_STYLE } from "./rippleStyle.ts";
import { rippleWords } from "./rippleStrings.ts";
import type { RippleGame } from "./ripple.types.ts";
import type { RippleDrawOptions, RippleMount, RippleMountOptions } from "./ripplePlay.types.ts";

export function mountRipple(host: HTMLElement, initial: RippleMountOptions): RippleMount {
  const doc = host.ownerDocument;
  let options = { ...initial };
  let game = initial.progress ? decodeRipple(initial.progress) : null;
  game ??= newRipple(initial.board);
  let selected = game.values.findIndex((value, cell) => game!.board.clues[cell] === null);
  if (selected < 0) selected = 0;
  let pencil = false, errors: number[] = [], message = "", dead = false;
  const root = doc.createElement("section"); root.className = "rp-root";
  const style = doc.createElement("style"); style.textContent = KAZU_STYLE.replace(/\.kazu/g, ".rp-palette") + RIPPLE_PLAY_STYLE;
  const board = doc.createElement("div"); board.className = "rp-board"; board.setAttribute("role", "grid");
  const status = doc.createElement("p"); status.className = "rp-status"; status.setAttribute("role", "status");
  const help = doc.createElement("p"); help.className = "rp-help";
  const controls = doc.createElement("div"); controls.className = "rp-controls";
  const numpad = doc.createElement("div"); numpad.className = "rp-numpad"; numpad.setAttribute("aria-label", "Numbers");
  root.append(style, board, status, help, numpad, controls); host.append(root);
  const words = () => rippleWords(options.language);
  const copy = (): RippleGame => ({ ...game!, board: { ...game!.board, rooms: [...game!.board.rooms], clues: [...game!.board.clues] }, values: [...game!.values], notes: game!.notes.map(list => [...list]), history: game!.history.map(turn => ({ values: [...turn.values], notes: turn.notes.map(list => [...list]) })) });
  const changed = () => {
    errors = []; message = ""; render();
    const snapshot = copy(); options.onChange?.(snapshot);
    root.dispatchEvent(new CustomEvent("ripple-change", { detail: snapshot, bubbles: true }));
    if (rippleFinished(game!)) { options.onFinish?.(snapshot); root.dispatchEvent(new CustomEvent("ripple-finish", { detail: snapshot, bubbles: true })); }
  };
  const enter = (value: number) => {
    if (game!.board.clues[selected] !== null) return;
    game = pencil ? toggleRippleNote(game!, selected, value) : setRippleValue(game!, selected, value);
    changed();
  };
  const button = (label: string, action: () => void, disabled = false) => {
    const item = doc.createElement("button"); item.type = "button"; item.className = "rp-tool"; item.textContent = label; item.disabled = disabled; item.onclick = action; controls.append(item); return item;
  };
  const render = () => {
    if (dead) return;
    const focused = board.contains(doc.activeElement);
    const w = words(), current = game!.board, sizes = rippleRoomSizes(current), validation = progressRipple(current, game!.values);
    root.dataset.material = options.material ?? "ivory"; root.dataset.pieces = options.pieces ?? "ink";
    root.classList.toggle("rp-tiles", options.pieces === "tiles");
    root.style.setProperty("--rp-width", String(current.width));
    board.setAttribute("aria-label", w.title); board.replaceChildren();
    for (let cell = 0; cell < current.rooms.length; cell += 1) {
      const x = cell % current.width, y = Math.floor(cell / current.width), room = current.rooms[cell]!;
      const control = doc.createElement("button"); control.type = "button"; control.className = "rp-cell";
      if (x + 1 < current.width && current.rooms[cell + 1] !== room) control.classList.add("rp-room-right");
      if (y + 1 < current.height && current.rooms[cell + current.width] !== room) control.classList.add("rp-room-bottom");
      const clue = current.clues[cell] !== null, value = game!.values[cell]!;
      control.dataset.cell = String(cell); control.dataset.clue = String(clue); control.dataset.error = String(errors.includes(cell)); control.dataset.selected = String(cell === selected);
      control.setAttribute("aria-disabled", String(clue)); control.tabIndex = cell === selected ? 0 : -1;
      control.setAttribute("role", "gridcell"); control.setAttribute("aria-label", `${w.cell.replace("{row}", String(y + 1)).replace("{column}", String(x + 1))}, ${clue ? w.clue.replace("{value}", String(current.clues[cell])) : value ? w.entry.replace("{value}", String(value)) : game!.notes[cell]!.length ? w.note.replace("{values}", game!.notes[cell]!.join(", ")) : w.empty}`);
      if (clue) control.textContent = String(current.clues[cell]);
      else if (value) control.textContent = String(value);
      else if (game!.notes[cell]!.length) {
        const mini = doc.createElement("span"); mini.className = "rp-notes";
        for (let digit = 1; digit <= sizes[room]!; digit += 1) { const span = doc.createElement("span"); span.textContent = game!.notes[cell]!.includes(digit) ? String(digit) : ""; mini.append(span); }
        control.append(mini);
      }
      control.onclick = () => { selected = cell; render(); };
      control.onkeydown = event => {
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) { event.preventDefault(); move(cell, event.key); }
        else if (/^[1-9]$/.test(event.key)) { event.preventDefault(); enter(Number(event.key)); }
        else if (event.key === "Backspace" || event.key === "Delete") { event.preventDefault(); enter(0); }
        else if (event.key.toLowerCase() === "p") { event.preventDefault(); pencil = !pencil; render(); }
      };
      board.append(control);
    }
    if (focused) board.querySelector<HTMLElement>(`[data-cell="${selected}"]`)?.focus({ preventScroll: true });
    numpad.replaceChildren();
    for (let digit = 1; digit <= Math.max(...sizes); digit += 1) {
      const key = doc.createElement("button"); key.type = "button"; key.className = "rp-key"; key.textContent = String(digit); key.disabled = digit > sizes[current.rooms[selected]!]!; key.onclick = () => enter(digit); numpad.append(key);
    }
    status.textContent = rippleFinished(game!) ? (game!.helped ? `${w.won} · ${w.hint}` : w.won) : message || (validation.ok ? w.won : w.checked);
    help.textContent = w.help; controls.replaceChildren();
    button(w.undo, () => { game = undoRipple(game!); changed(); }, !game!.history.length);
    button(w.check, () => { errors = [...checkRipple(current, game!.values).errors]; message = checkRipple(current, game!.values).ok ? w.won : w.wrong; render(); });
    button(w.hint, () => { const hint = hintRipple(game!); if (!hint) { message = w.noHint; render(); return; } game = { ...setRippleValue(game!, hint.cell, hint.value), helped: true }; selected = hint.cell; changed(); message = w.hintWhy; render(); });
    button(pencil ? `${w.pencil} ✓` : w.pencil, () => { pencil = !pencil; render(); });
    button(w.restart, restart);
    button(w.view, expand);
  };
  function move(cell: number, direction: string) {
    const dx = direction === "ArrowLeft" ? -1 : direction === "ArrowRight" ? 1 : 0;
    const dy = direction === "ArrowUp" ? -1 : direction === "ArrowDown" ? 1 : 0;
    const x = cell % game!.board.width, y = Math.floor(cell / game!.board.width);
    const nx = Math.min(game!.board.width - 1, Math.max(0, x + dx)), ny = Math.min(game!.board.height - 1, Math.max(0, y + dy));
    selected = ny * game!.board.width + nx; render(); board.querySelector<HTMLElement>(`[data-cell="${selected}"]`)?.focus();
  }
  function restart() { game = newRipple(game!.board); selected = game.values.findIndex((value, cell) => game!.board.clues[cell] === null); changed(); }
  function expand() {
    const dialog = doc.createElement("dialog"), close = doc.createElement("button"); dialog.className = "rp-dialog"; close.type = "button"; close.className = "rp-tool rp-close"; close.textContent = words().close; close.onclick = () => dialog.close(); dialog.append(close, root); host.append(dialog); dialog.onclose = () => { host.append(root); dialog.remove(); }; dialog.showModal();
  }
  render();
  return { game: copy, progress: () => encodeRipple(game!), restart, set: (next: RippleDrawOptions) => { options = { ...options, ...next }; render(); }, destroy: () => { dead = true; root.remove(); root.closest("dialog")?.remove(); } };
}
