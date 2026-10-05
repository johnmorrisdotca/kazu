import { checkMasyu, masyuNeighbors } from "./masyuBoard.ts";
import { decodeMasyu, encodeMasyu, hintMasyu, newMasyu, restartMasyu, toggleMasyuEdge, undoMasyu } from "./masyuGame.ts";
import { drawMasyu } from "./masyuDraw.ts";
import { MASYU_PLAY_STYLE } from "./masyuStyle.ts";
import { MASYU_STRINGS } from "./masyuStrings.ts";
import type { MasyuMount, MasyuMountOptions } from "./masyu.types.ts";

export function mountMasyu(element: HTMLElement, initial: MasyuMountOptions): MasyuMount {
  const document = element.ownerDocument, style = document.createElement("style");
  style.textContent = MASYU_PLAY_STYLE;
  const root = document.createElement("section"); root.className = "kazu-masyu";
  const help = document.createElement("p"), board = document.createElement("div"); board.className = "km-board";
  const tools = document.createElement("div"); tools.className = "km-tools";
  const status = document.createElement("p"); status.className = "km-status"; status.setAttribute("aria-live", "polite");
  root.append(help, board, tools, status); element.replaceChildren(style, root);
  let options = { ...initial };
  let game = initial.progress ? decodeMasyu(initial.progress) : null;
  if (!game || game.board.width !== initial.board.width || game.board.height !== initial.board.height
    || game.board.pearls.some((pearl, cell) => pearl !== initial.board.pearls[cell])) game = newMasyu(initial.board);
  let selected = 0, anchor: number | null = null, errors: readonly number[] = [], message = "", dead = false;
  const words = () => MASYU_STRINGS[options.language ?? "en"];
  const copy = () => ({ ...game!, board: { ...game!.board, pearls: [...game!.board.pearls] }, edges: [...game!.edges], history: game!.history.map(turn => [...turn]) });
  const changed = () => { options.onChange?.(copy()); if (checkMasyu(game!.board, game!.edges).ok) options.onFinish?.(copy()); };
  const toggleBetween = (first: number, second: number) => {
    const edge = masyuNeighbors(game!.board, first).find(next => next.cell === second)?.edge;
    if (edge === undefined) return;
    game = toggleMasyuEdge(game!, edge); anchor = second; selected = second; errors = []; message = ""; render(); changed();
  };
  const render = () => {
    if (dead) return;
    const w = words(); help.textContent = w.help;
    board.innerHTML = drawMasyu(game!.board, { ...options, edges: game!.edges, selected, errors });
    const controls = document.createElement("div"); controls.className = "km-cells";
    controls.style.gridTemplateColumns = `repeat(${game!.board.width}, 1fr)`;
    controls.style.gridTemplateRows = `repeat(${game!.board.height}, 1fr)`;
    game!.board.pearls.forEach((pearl, cell) => {
      const button = document.createElement("button"); button.type = "button"; button.className = "km-cell";
      button.dataset.cell = String(cell);
      button.textContent = String(cell + 1); button.setAttribute("aria-label", `${w.pearl[pearl]}, row ${Math.floor(cell / game!.board.width) + 1}, column ${cell % game!.board.width + 1}`);
      button.setAttribute("aria-pressed", String(selected === cell)); button.tabIndex = selected === cell ? 0 : -1;
      button.onclick = () => {
        selected = cell;
        if (anchor === null) anchor = cell;
        else if (anchor !== cell) toggleBetween(anchor, cell);
        render();
      };
      button.onkeydown = event => {
        const x = cell % game!.board.width, y = Math.floor(cell / game!.board.width);
        const moves: Record<string, [number, number]> = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
        if (event.key in moves) {
          event.preventDefault();
          const [dx, dy] = moves[event.key]!;
          const nextX = x + dx, nextY = y + dy;
          if (nextX >= 0 && nextX < game!.board.width && nextY >= 0 && nextY < game!.board.height) {
            selected = nextY * game!.board.width + nextX;
            render();
            board.querySelectorAll<HTMLButtonElement>(".km-cell")[selected]?.focus();
          }
        } else if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (anchor === null) anchor = cell;
          else if (anchor !== cell) toggleBetween(anchor, cell);
          render();
          board.querySelectorAll<HTMLButtonElement>(".km-cell")[selected]?.focus();
        }
      };
      controls.append(button);
    });
    board.append(controls); tools.replaceChildren();
    const add = (label: string, action: () => void) => { const button = document.createElement("button"); button.type = "button"; button.textContent = label; button.onclick = action; tools.append(button); };
    add(w.undo, () => { game = undoMasyu(game!); errors = []; render(); changed(); });
    add(w.hint, () => { const edge = hintMasyu(game!); if (edge === null) message = w.bad; else { game = toggleMasyuEdge(game!, edge); game = { ...game, helped: true }; message = w.good; changed(); } render(); });
    add(w.check, () => { errors = checkMasyu(game!.board, game!.edges).errors; message = errors.length ? w.bad : w.good; render(); });
    add(w.restart, () => { game = restartMasyu(game!); anchor = null; errors = []; message = ""; render(); changed(); });
    status.textContent = checkMasyu(game!.board, game!.edges).ok ? (game!.helped ? w.helped : w.won) : message;
  };
  render();
  return {
    game: copy,
    progress: () => encodeMasyu(game!),
    set: next => { options = { ...options, ...next }; render(); },
    restart: () => { game = restartMasyu(game!); anchor = null; render(); changed(); },
    destroy: () => { dead = true; element.replaceChildren(); },
  };
}
