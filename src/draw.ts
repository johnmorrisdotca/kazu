import { symbolOf } from "./cells.ts";
import { kazuGeometry, KAZU_CELL } from "./geometry.ts";
import { readGivens, type KazuGivens } from "./givens.ts";
import type { KazuKind } from "./kinds.ts";
import { notesOf } from "./progress.ts";
import { kazuNameOf, kazuSay, type KazuLanguage } from "./strings.ts";
import { KAZU_STYLE } from "./style.ts";
import { cageOutline } from "./sum-cages.ts";
import { lineFrom, TOWER_SIDES } from "./towers-code.ts";

/** What a drawing shows beyond the puzzle itself. Every part is optional: a puzzle alone is its printed grid. */
export type KazuDrawOptions = {
  /** What the player has written, row-major, 0 for empty. */
  entries?: readonly number[];
  /** Pencil marks, a bit mask a cell: bit `v` is the note `v` (`notesOf`). */
  notes?: readonly number[];
  /** The chosen cell. */
  selected?: number | null;
  /** Wash the chosen cell's row, column and group, and every cell holding its number. */
  peers?: boolean;
  /** Cells that break a rule, drawn in red with their numbers (`conflictsOf`). */
  conflicts?: readonly number[];
  /** Cells Check flagged wrong. */
  wrong?: readonly number[];
  /** The cell a hint pointed at. */
  hint?: number | null;
  /** A faint wash of green, and `data-solved="true"`. */
  done?: boolean;
  /** Put a transparent square over every cell, each with its `data-cell`, for a page to press on. `mountKazu` does. */
  interactive?: boolean;
  /** What a screen reader hears. */
  language?: KazuLanguage;
  /** A description instead of "Sudoku puzzle, 9 by 9". */
  label?: string;
  /** Put `KAZU_STYLE` inside, so the drawing stands alone as an image. */
  style?: boolean;
  /** Draw the wooden frame round the paper. Default false. */
  frame?: boolean;
};

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const num = (value: number) => String(Math.round(value * 100) / 100);

const WHERE_KEY: Record<KazuKind, string> = {
  "number-place": "whereNumberPlace",
  diagonal: "whereDiagonal",
  jigsaw: "whereJigsaw",
  "sum-cages": "whereSumCages",
  "more-or-less": "whereMoreOrLess",
  towers: "whereTowers",
};

/** The words for the groups a number is ruled out by, for a hint's line: "its row, column and box". */
export function kazuWhere(kind: KazuKind, language: KazuLanguage): string {
  return kazuSay(language, WHERE_KEY[kind]);
}

/** A cell as a screen reader names it: "row 3, column 5". */
export function kazuCellName(size: number, index: number, language: KazuLanguage): string {
  return kazuSay(language, "cell", { row: Math.floor(index / size) + 1, col: (index % size) + 1 });
}

/** The thick lines: where two neighbouring cells are in different regions, and the outer edge. */
function boxPath(givens: KazuGivens, x0: number, y0: number): string {
  const { size, regions } = givens;
  const U = KAZU_CELL;
  const parts = [`M${x0} ${y0}h${size * U}v${size * U}h${-size * U}z`];
  if (regions !== null) {
    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        const here = regions[row * size + col];
        if (col < size - 1 && regions[row * size + col + 1] !== here) parts.push(`M${x0 + (col + 1) * U} ${y0 + row * U}v${U}`);
        if (row < size - 1 && regions[(row + 1) * size + col] !== here) parts.push(`M${x0 + col * U} ${y0 + (row + 1) * U}h${U}`);
      }
    }
  }
  return parts.join("");
}

/** A mark between two cells: a chevron on the shared edge whose point faces the smaller number. */
function markShape(size: number, less: number, more: number, x0: number, y0: number): string {
  const U = KAZU_CELL;
  const low = Math.min(less, more);
  const horizontal = Math.max(less, more) === low + 1;
  const d = 0.1 * U;
  const lowRow = Math.floor(low / size);
  const lowCol = low % size;
  if (horizontal) {
    const x = x0 + (lowCol + 1) * U;
    const y = y0 + lowRow * U + U / 2;
    // The point faces the smaller cell: left when the left cell is the smaller.
    const toward = less === low ? -1 : 1;
    return `<circle class="kz-mark-bg" cx="${num(x)}" cy="${num(y)}" r="${num(0.19 * U)}"/><path class="kz-mark" d="M${num(x - toward * d)} ${num(y - d * 1.2)}L${num(x + toward * d)} ${num(y)}L${num(x - toward * d)} ${num(y + d * 1.2)}"/>`;
  }
  const x = x0 + lowCol * U + U / 2;
  const y = y0 + (lowRow + 1) * U;
  const toward = less === low ? -1 : 1;
  return `<circle class="kz-mark-bg" cx="${num(x)}" cy="${num(y)}" r="${num(0.19 * U)}"/><path class="kz-mark" d="M${num(x - d * 1.2)} ${num(y - toward * d)}L${num(x)} ${num(y + toward * d)}L${num(x + d * 1.2)} ${num(y - toward * d)}"/>`;
}

/**
 * A PUZZLE AS SVG TEXT: the grid with its printed numbers, whatever has been written in it, pencil
 * marks, and everything the kind of puzzle prints: the heavier rules round the boxes or a Jigsaw's
 * regions, the shaded diagonals, a cage's dashed outline with its sum, the more-than marks between
 * cells, and the tower clues round the edge. The chosen cell, the cells that break a rule, the cells
 * Check flagged and the cell a hint pointed at are washed in colour.
 *
 * Returns the `<svg>` as a string: put it in a page, a file or an image, with nothing to load. It is
 * one steady square whatever is drawn, so nothing moves as numbers are written. Nothing in it can be
 * selected or dragged. Null for givens that are not a puzzle of that kind and side.
 */
export function drawKazu(kind: KazuKind, size: number, givensCode: string, options: KazuDrawOptions = {}): string | null {
  const givens = readGivens(kind, size, givensCode);
  if (givens === null) return null;
  const language = options.language ?? "en";
  const U = KAZU_CELL;
  const geo = kazuGeometry(kind, size);
  const { origin: x0, side } = geo;
  const y0 = x0;
  const entries = options.entries ?? [];
  const notes = options.notes ?? [];
  const value = (index: number) => (givens.cells[index] !== 0 ? givens.cells[index]! : (entries[index] ?? 0));
  const selected = options.selected ?? null;
  const conflicts = new Set(options.conflicts ?? []);
  const wrong = new Set(options.wrong ?? []);
  const area = size * size;
  const at = (index: number) => geo.corner(index);

  // Washes: the chosen cell's lines and its number, then the colours that say something is wrong.
  const peers = new Set<number>();
  const same = new Set<number>();
  if (options.peers === true && selected !== null && selected >= 0 && selected < area) {
    const row = Math.floor(selected / size);
    const col = selected % size;
    for (let index = 0; index < area; index += 1) {
      const sharesRegion = givens.regions !== null && givens.regions[index] === givens.regions[selected];
      if (Math.floor(index / size) === row || index % size === col || sharesRegion) peers.add(index);
    }
    const chosen = value(selected);
    if (chosen !== 0) for (let index = 0; index < area; index += 1) if (value(index) === chosen) same.add(index);
  }
  const wash: string[] = [];
  const square = (index: number, cls: string) => {
    const { x, y } = at(index);
    return `<rect class="${cls}" x="${x}" y="${y}" width="${U}" height="${U}"/>`;
  };
  for (let index = 0; index < area; index += 1) {
    const row = Math.floor(index / size);
    const col = index % size;
    if (givens.diagonals && (row === col || row + col === size - 1)) wash.push(square(index, "kz-diagonal"));
    if (peers.has(index)) wash.push(square(index, "kz-peer"));
    if (same.has(index)) wash.push(square(index, "kz-same"));
    if (index === selected) wash.push(square(index, "kz-select"));
    if (options.hint === index) wash.push(square(index, "kz-hint"));
    if (wrong.has(index)) wash.push(square(index, "kz-wrong"));
    if (conflicts.has(index)) wash.push(square(index, "kz-conflict"));
  }

  const grid: string[] = [];
  for (let k = 1; k < size; k += 1) {
    grid.push(`M${x0 + k * U} ${y0}v${size * U}`, `M${x0} ${y0 + k * U}h${size * U}`);
  }

  // Cages: a dashed outline inside each, and the sum in the first cell's corner.
  const cageOf = new Map<number, number>();
  const sumAt = new Map<number, number>();
  (givens.cages ?? []).forEach((cage, c) => {
    cage.cells.forEach((index) => cageOf.set(index, c));
    sumAt.set(Math.min(...cage.cells), cage.sum);
  });
  const cageLines = givens.cages === null ? [] : cageOutline(size, (index) => cageOf.get(index)).map((line) => `<line x1="${num(x0 + line.x1 * U)}" y1="${num(y0 + line.y1 * U)}" x2="${num(x0 + line.x2 * U)}" y2="${num(y0 + line.y2 * U)}"/>`);

  // Numbers and pencil marks.
  const digitSize = size > 9 ? 0.5 * U : 0.6 * U;
  const columns = Math.ceil(Math.sqrt(size));
  const noteTop = givens.cages === null ? 0.07 * U : 0.27 * U;
  const noteSide = 0.07 * U;
  const noteWidth = U - 2 * noteSide;
  const noteHeight = U - noteTop - 0.05 * U;
  const noteRows = Math.ceil(size / columns);
  const noteFont = Math.min(noteWidth / columns, noteHeight / noteRows) * 0.72;
  const digits: string[] = [];
  const pencil: string[] = [];
  for (let index = 0; index < area; index += 1) {
    const shown = value(index);
    const { x, y } = at(index);
    if (shown !== 0) {
      const printed = givens.cells[index] !== 0;
      const bad = conflicts.has(index) || wrong.has(index);
      digits.push(`<text class="kz-digit ${printed ? "kz-given" : "kz-entry"}${bad ? " kz-bad" : ""}" x="${num(x + U / 2)}" y="${num(y + U / 2 + (givens.cages !== null ? 0.06 * U : 0))}" font-size="${num(digitSize)}" data-cell="${index}">${symbolOf(shown)}</text>`);
    } else {
      for (const noted of notesOf(notes[index] ?? 0)) {
        const col = (noted - 1) % columns;
        const row = Math.floor((noted - 1) / columns);
        pencil.push(`<text class="kz-note" x="${num(x + noteSide + ((col + 0.5) * noteWidth) / columns)}" y="${num(y + noteTop + ((row + 0.5) * noteHeight) / noteRows)}" font-size="${num(noteFont)}">${symbolOf(noted)}</text>`);
      }
    }
  }
  const sums = [...sumAt].map(([index, sum]) => {
    const { x, y } = at(index);
    return `<text class="kz-cage-sum" x="${num(x + 0.17 * U)}" y="${num(y + 0.17 * U)}" font-size="${num(0.24 * U)}" data-cell="${index}">${sum}</text>`;
  });

  const marks = givens.marks.map((mark) => markShape(size, mark.less, mark.more, x0, y0));

  // Towers' clues, round the edge.
  const clues: string[] = [];
  if (givens.clues !== null) {
    for (const side of TOWER_SIDES) {
      for (let place = 0; place < size; place += 1) {
        const clue = givens.clues[side][place]!;
        if (clue === 0) continue;
        const first = lineFrom(side, place, size)[0]!;
        const { x, y } = at(first);
        const cx = side === "left" ? x - U / 2 : side === "right" ? x + U + U / 2 : x + U / 2;
        const cy = side === "top" ? y - U / 2 : side === "bottom" ? y + U + U / 2 : y + U / 2;
        clues.push(`<text class="kz-clue" x="${num(cx)}" y="${num(cy)}" font-size="${num(0.5 * U)}" data-side="${side}" data-at="${place}">${clue}</text>`);
      }
    }
  }

  const hits: string[] = [];
  if (options.interactive === true) {
    for (let index = 0; index < area; index += 1) {
      const { x, y } = at(index);
      hits.push(`<rect class="kz-hit" x="${x}" y="${y}" width="${U}" height="${U}" data-cell="${index}"/>`);
    }
  }

  const label = options.label ?? kazuSay(language, "board", { name: kazuNameOf(kind, language), size });
  return [
    `<svg class="kazu" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${side} ${side}" role="img" aria-label="${escape(label)}" data-kind="${kind}" data-size="${size}"${options.done === true ? ` data-solved="true"` : ""}>`,
    options.style === true ? `<style>${KAZU_STYLE}</style>` : "",
    options.frame === true ? `<rect class="kz-frame" x="0" y="0" width="${side}" height="${side}" rx="12"/>` : "",
    `<rect class="kz-paper" x="${options.frame === true ? 6 : 0}" y="${options.frame === true ? 6 : 0}" width="${options.frame === true ? side - 12 : side}" height="${options.frame === true ? side - 12 : side}" rx="${options.frame === true ? 8 : 6}"/>`,
    wash.join(""),
    `<path class="kz-grid" d="${grid.join("")}"/>`,
    cageLines.length > 0 ? `<g class="kz-cage">${cageLines.join("")}</g>` : "",
    `<path class="kz-box" d="${boxPath(givens, x0, y0)}"/>`,
    pencil.join(""),
    digits.join(""),
    sums.join(""),
    marks.join(""),
    clues.join(""),
    options.done === true ? `<rect class="kz-solved" x="${x0}" y="${y0}" width="${size * U}" height="${size * U}"/>` : "",
    hits.join(""),
    `</svg>`,
  ].join("");
}
