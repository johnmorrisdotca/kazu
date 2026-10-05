import { checkYajilin, yajilinNeighbors } from "./yajilinBoard.ts";
import { decodeYajilin, encodeYajilin, hintYajilin, newYajilin, restartYajilin, toggleYajilinEdge, toggleYajilinShade, undoYajilin } from "./yajilinGame.ts";
import { drawYajilin } from "./yajilinDraw.ts";
import { YAJILIN_PLAY_STYLE } from "./yajilinStyle.ts";
import { YAJILIN_STRINGS } from "./yajilinStrings.ts";
import type { YajilinMount, YajilinMountOptions } from "./yajilin.types.ts";

export function mountYajilin(element: HTMLElement, initial: YajilinMountOptions): YajilinMount {
  const document = element.ownerDocument, style = document.createElement("style");
  style.textContent = YAJILIN_PLAY_STYLE;
  const root = document.createElement("section"); root.className = "kazu-yajilin";
  const help = document.createElement("p"), board = document.createElement("div"); board.className = "ky-board";
  const modes = document.createElement("div"); modes.className = "ky-tools ky-modes";
  const tools = document.createElement("div"); tools.className = "ky-tools";
  const status = document.createElement("p"); status.className = "ky-status"; status.setAttribute("aria-live", "polite");
  root.append(help, modes, board, tools, status); element.replaceChildren(style, root);
  let options = { ...initial };
  let game = initial.progress ? decodeYajilin(initial.progress) : null;
  const sameBoard = game && game.board.width === initial.board.width && game.board.height === initial.board.height
    && game.board.clues.every((clue, cell) => JSON.stringify(clue) === JSON.stringify(initial.board.clues[cell]));
  if (!sameBoard) game = newYajilin(initial.board);
  let selected = 0, anchor: number | null = null, mode: "line" | "shade" = "line";
  let errors: readonly number[] = [], message = "", dead = false;
  const words = () => YAJILIN_STRINGS[options.language ?? "en"];
  const copy = () => ({ ...game!, board: { ...game!.board, clues: game!.board.clues.map(clue => clue ? { ...clue } : null) }, shaded: [...game!.shaded], edges: [...game!.edges], history: game!.history.map(turn => ({ shaded: [...turn.shaded], edges: [...turn.edges] })) });
  const changed = () => { options.onChange?.(copy()); if (checkYajilin(game!.board, game!.shaded, game!.edges).ok) options.onFinish?.(copy()); };
  const toggleBetween = (first: number, second: number) => {
    const edge = yajilinNeighbors(game!.board, first).find(next => next.cell === second)?.edge;
    if (edge === undefined) return;
    game = toggleYajilinEdge(game!, edge); anchor = second; selected = second; errors = []; message = ""; render(); changed();
  };
  const render = () => {
    if (dead) return;
    const w = words(); help.textContent = w.help;
    board.innerHTML = drawYajilin(game!.board, { ...options, shaded: game!.shaded, edges: game!.edges, selected, errors });
    const controls = document.createElement("div"); controls.className = "ky-cells";
    controls.style.gridTemplateColumns = `repeat(${game!.board.width}, 1fr)`;
    controls.style.gridTemplateRows = `repeat(${game!.board.height}, 1fr)`;
    game!.board.clues.forEach((clue, cell) => {
      const button = document.createElement("button"); button.type = "button"; button.className = "ky-cell"; button.dataset.cell = String(cell);
      if (clue) button.dataset.clue = "true";
      button.textContent = clue ? `${clue.direction} ${clue.count}` : String(cell + 1);
      button.setAttribute("aria-label", clue ? `${clue.direction} ${clue.count}` : `row ${Math.floor(cell / game!.board.width) + 1}, column ${cell % game!.board.width + 1}${game!.shaded[cell] ? ", shaded" : ""}`);
      button.setAttribute("aria-pressed", String(selected === cell)); button.tabIndex = selected === cell ? 0 : -1;
      button.onclick = () => {
        selected = cell;
        if (mode === "shade") { game = toggleYajilinShade(game!, cell); errors = []; changed(); }
        else if (anchor === null) anchor = cell;
        else if (anchor !== cell) toggleBetween(anchor, cell);
        render();
      };
      button.onkeydown = event => {
        const x = cell % game!.board.width, y = Math.floor(cell / game!.board.width);
        const moves: Record<string, [number, number]> = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
        if (event.key in moves) {
          event.preventDefault();
          const [dx, dy] = moves[event.key]!, nextX = x + dx, nextY = y + dy;
          if (nextX >= 0 && nextX < game!.board.width && nextY >= 0 && nextY < game!.board.height) {
            selected = nextY * game!.board.width + nextX; render();
            board.querySelectorAll<HTMLButtonElement>(".ky-cell")[selected]?.focus();
          }
        } else if (event.key === "Enter") {
          event.preventDefault();
          if (mode === "shade") { game = toggleYajilinShade(game!, cell); errors = []; changed(); }
          else if (anchor === null) anchor = cell;
          else if (anchor !== cell) toggleBetween(anchor, cell);
          render(); board.querySelectorAll<HTMLButtonElement>(".ky-cell")[selected]?.focus();
        } else if (event.key === " ") {
          event.preventDefault(); mode = "shade"; game = toggleYajilinShade(game!, cell); errors = []; changed(); render(); board.querySelectorAll<HTMLButtonElement>(".ky-cell")[selected]?.focus();
        } else if (event.key.toLowerCase() === "l") { mode = "line"; render(); board.querySelectorAll<HTMLButtonElement>(".ky-cell")[selected]?.focus(); }
        else if (event.key.toLowerCase() === "s") { mode = "shade"; render(); board.querySelectorAll<HTMLButtonElement>(".ky-cell")[selected]?.focus(); }
      };
      controls.append(button);
    });
    board.append(controls); modes.replaceChildren(); tools.replaceChildren();
    const add = (host: HTMLElement, label: string, action: () => void, pressed?: boolean) => {
      const button = document.createElement("button"); button.type = "button"; button.textContent = label;
      if (pressed !== undefined) button.setAttribute("aria-pressed", String(pressed));
      button.onclick = action; host.append(button);
    };
    add(modes, w.line, () => { mode = "line"; render(); }, mode === "line");
    add(modes, w.shade, () => { mode = "shade"; render(); }, mode === "shade");
    add(tools, w.undo, () => { game = undoYajilin(game!); errors = []; message = ""; render(); changed(); });
    add(tools, w.hint, () => {
      const hint = hintYajilin(game!);
      if (!hint) message = w.bad;
      else {
        game = hint.type === "shade" ? toggleYajilinShade(game!, hint.cell) : toggleYajilinEdge(game!, hint.edge);
        game = { ...game, helped: true }; selected = hint.type === "shade" ? hint.cell : selected;
        message = w.good; changed();
      }
      render();
    });
    add(tools, w.check, () => { errors = checkYajilin(game!.board, game!.shaded, game!.edges).errors; message = errors.length ? w.bad : w.good; render(); });
    add(tools, w.restart, () => { game = restartYajilin(game!); anchor = null; errors = []; message = ""; render(); changed(); });
    status.textContent = checkYajilin(game!.board, game!.shaded, game!.edges).ok ? (game!.helped ? w.helped : w.won) : message;
  };
  render();
  return { game: copy, progress: () => encodeYajilin(game!), set: next => { options = { ...options, ...next }; render(); }, restart: () => { game = restartYajilin(game!); anchor = null; render(); changed(); }, destroy: () => { dead = true; element.replaceChildren(); } };
}
