import {
  edgeVertices,
  isSlitherlinkBoard,
} from "./slitherlinkBoard.ts";
import type { SlitherlinkBoard } from "./slitherlink.types.ts";
import type { SlitherlinkDrawOptions } from "./slitherlinkPlay.types.ts";
import { slitherlinkWords } from "./slitherlinkStrings.ts";

/** Draws public clues and selected loop edges as an SVG board. */
export function drawSlitherlink(board: SlitherlinkBoard, options: SlitherlinkDrawOptions = {}): string {
  if (!isSlitherlinkBoard(board)) throw new RangeError("Invalid Slitherlink board");
  const words = slitherlinkWords(options.language);
  const size = 48;
  const colours = {
    ivory: ["var(--kz-paper,#fbf8f1)", "var(--kz-ink,#1f2320)", "var(--kz-grid,#cfc6b2)"],
    wood: ["#e5cda6", "#493e2f", "#bca582"],
    slate: ["#262a27", "#ece8dc", "#454a44"],
  };
  const [paper, ink, grid] = colours[options.material ?? "ivory"];
  const selected = new Set(options.edges ?? []);
  const clueText = board.clues.map((clue, cell) => {
    if (clue === null) return "";
    const x = (cell % board.width + .5) * size;
    const y = (Math.floor(cell / board.width) + .53) * size;
    return `<text x="${x}" y="${y}" dominant-baseline="middle" text-anchor="middle" fill="${ink}" font-size="20" font-weight="700" font-family="system-ui,sans-serif">${clue}</text>`;
  }).join("");
  const lines = [...selected].map(edge => {
    const [a, b] = edgeVertices(board, edge);
    const x1 = (a % (board.width + 1)) * size;
    const y1 = Math.floor(a / (board.width + 1)) * size;
    const x2 = (b % (board.width + 1)) * size;
    const y2 = Math.floor(b / (board.width + 1)) * size;
    const bad = options.errors?.includes(edge);
    const active = options.selected === edge;
    const colour = bad ? "var(--kz-bad,#b5452c)" : active ? "var(--kz-frame,#a98954)" : ink;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${colour}" stroke-width="${active ? 6 : 4}" stroke-linecap="round"/>`;
  }).join("");
  const dots = Array.from({ length: (board.width + 1) * (board.height + 1) }, (_, vertex) => {
    const x = (vertex % (board.width + 1)) * size;
    const y = Math.floor(vertex / (board.width + 1)) * size;
    return `<circle cx="${x}" cy="${y}" r="3.2" fill="${ink}"/>`;
  }).join("");
  const gridLines: string[] = [];
  for (let y = 0; y <= board.height; y += 1) {
    for (let x = 0; x < board.width; x += 1) {
      gridLines.push(`<line x1="${x * size}" y1="${y * size}" x2="${(x + 1) * size}" y2="${y * size}" stroke="${grid}" stroke-width="1"/>`);
    }
  }
  for (let y = 0; y < board.height; y += 1) {
    for (let x = 0; x <= board.width; x += 1) {
      gridLines.push(`<line x1="${x * size}" y1="${y * size}" x2="${x * size}" y2="${(y + 1) * size}" stroke="${grid}" stroke-width="1"/>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 ${board.width * size + 8} ${board.height * size + 8}" role="img" aria-label="${words.title}" style="display:block;width:100%;height:auto;background:${paper}">${gridLines.join("")}${clueText}${lines}${dots}<rect width="${board.width * size}" height="${board.height * size}" fill="none" stroke="var(--kz-frame,#a98954)" stroke-width="2"/></svg>`;
}
