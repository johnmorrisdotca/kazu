import { progressCrossSums } from "./cross-sums-board.ts";
import { drawCrossSums } from "./cross-sums-draw.ts";
import { decodeCrossSums, encodeCrossSums, enterCrossSums, finishedCrossSums, hintCrossSums, newCrossSums, undoCrossSums } from "./cross-sums-game.ts";
import { CROSS_SUMS_PLAY_STYLE } from "./cross-sums-style.ts";
import { crossSumsWords } from "./cross-sums-strings.ts";
import type { CrossSumsGame } from "./cross-sums.types.ts";
import type { CrossSumsMount, CrossSumsMountOptions } from "./cross-sums-play.types.ts";

export function mountCrossSums(host: HTMLElement, initial: CrossSumsMountOptions): CrossSumsMount {
  const doc = host.ownerDocument;
  let options = { ...initial };
  const words = () => crossSumsWords(options.language);
  let game: CrossSumsGame = initial.progress ? decodeCrossSums(initial.progress) ?? newCrossSums(initial.board) : newCrossSums(initial.board);
  let selected = game.board.cells.findIndex(cell => cell.kind === "white"), pencil = false, message = "", dead = false;
  const root = doc.createElement("div"), style = doc.createElement("style"), board = doc.createElement("div"), tools = doc.createElement("div"), pad = doc.createElement("div"), status = doc.createElement("p"), help = doc.createElement("p"), grid = doc.createElement("div");
  root.className = "kk-root"; style.textContent = CROSS_SUMS_PLAY_STYLE; board.className = "kk-board"; tools.className = "kk-tools"; pad.className = "kk-pad"; pad.setAttribute("role", "group"); status.className = "kk-status"; status.setAttribute("role", "status"); help.className = "kk-help"; grid.className = "kk-cells";
  board.append(doc.createElement("div"), grid); root.append(style, board, pad, status, tools, help); host.append(root);
  const copy = (): CrossSumsGame => ({ ...game, board: { ...game.board, cells: game.board.cells.map(cell => ({ ...cell })) }, values: [...game.values], notes: game.notes.map(mark => [...mark]), history: [] });
  const update = (next: typeof game) => { game = next; render(); options.onChange?.(copy()); if (finishedCrossSums(game)) options.onFinish?.(copy()); };
  const button = (label: string, action: () => void) => { const item = doc.createElement("button"); item.type = "button"; item.textContent = label; item.onclick = action; tools.append(item); };
  const render = () => {
    if (dead) return;
    const w = words(), b = game.board, focus = grid.contains(doc.activeElement);
    (board.firstElementChild as HTMLElement).innerHTML = drawCrossSums(b, { values: game.values, notes: game.notes, selected, material: options.material, pieces: options.pieces });
    grid.style.gridTemplateColumns = `repeat(${b.width},1fr)`; grid.replaceChildren();
    b.cells.forEach((cell, index) => {
      const button = doc.createElement("button"); button.type = "button"; button.className = "kk-cell"; button.disabled = cell.kind === "black"; button.tabIndex = selected === index ? 0 : -1;
      const row = Math.floor(index / b.width) + 1, column = index % b.width + 1;
      const tile = cell.kind === "black" ? `${w.across} ${cell.across ?? "—"}, ${w.down} ${cell.down ?? "—"}` : game.values[index] || game.notes[index]!.length ? `value ${game.values[index] || game.notes[index]!.join(",")}` : w.blank;
      button.setAttribute("aria-label", `${w.row} ${row}, ${w.column} ${column}: ${tile}`); button.onclick = () => { selected = index; render(); };
      button.onkeydown = event => {
        const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -b.width, ArrowDown: b.width };
        if (event.key in step) { event.preventDefault(); let next = index; do { next += step[event.key]!; } while (next >= 0 && next < b.cells.length && b.cells[next]!.kind === "black"); if (next >= 0 && next < b.cells.length) selected = next; render(); }
        else if (/^[1-9]$/.test(event.key)) { event.preventDefault(); update(enterCrossSums(game, index, Number(event.key), pencil)); }
        else if (event.key === "0" || event.key === "Backspace" || event.key === "Delete") { event.preventDefault(); update(enterCrossSums(game, index, 0)); }
        else if (event.key.toLowerCase() === "p") { event.preventDefault(); pencil = !pencil; render(); }
      };
      grid.append(button);
    });
    if (focus) grid.querySelector<HTMLElement>(`button[aria-label^="${w.row} ${Math.floor(selected / b.width) + 1}, ${w.column} ${selected % b.width + 1}:"]`)?.focus();
    tools.replaceChildren(); button(w.undo, () => update(undoCrossSums(game))); button(w.pencil, () => { pencil = !pencil; render(); });
    button(w.hint, () => { const hint = hintCrossSums(game); if (!hint) { message = w.wrong; render(); return; } update({ ...enterCrossSums(game, hint.cell, hint.digit), helped: true }); message = `${w.row} ${Math.floor(hint.cell / b.width) + 1}, ${w.column} ${hint.cell % b.width + 1}: ${hint.digit}`; render(); });
    button(w.check, () => { const result = progressCrossSums(game.board, game.values); message = result.errors.length ? w.wrong : finishedCrossSums(game) ? game.helped ? w.helped : w.won : w.checked; render(); });
    button(w.restart, () => { game = newCrossSums(game.board); message = w.ready; render(); });
    pad.replaceChildren();
    for (let digit = 1; digit <= 9; digit += 1) {
      const key = doc.createElement("button"); key.type = "button"; key.textContent = String(digit); key.setAttribute("aria-label", `${digit}`);
      key.onclick = () => { if (selected >= 0) update(enterCrossSums(game, selected, digit, pencil)); };
      pad.append(key);
    }
    const clear = doc.createElement("button"); clear.type = "button"; clear.textContent = w.clear; clear.setAttribute("aria-label", w.clear); clear.onclick = () => { if (selected >= 0) update(enterCrossSums(game, selected, 0)); }; pad.append(clear);
    status.textContent = finishedCrossSums(game) ? game.helped ? w.helped : w.won : message || w.ready; help.textContent = w.help;
  };
  render();
  return { game: copy, progress: () => encodeCrossSums(game), set: next => { options = { ...options, ...next }; render(); }, restart: () => { game = newCrossSums(game.board); render(); }, destroy: () => { dead = true; root.remove(); } };
}
