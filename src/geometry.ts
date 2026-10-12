import type { KazuKind } from "./kinds.ts";

/**
 * WHERE EVERYTHING IS IN A DRAWING, so a page of your own can play it: the drawing is a square of
 * `side` units, every cell `cell` units across, and a Towers square sits inside a ring one cell deep
 * that holds its clues. Pure arithmetic, no page needed.
 *
 * @example
 * ```ts
 * import type { KazuGeometry } from "@johnmorrisdotca/kazu/draw";
 * import { kazuGeometry } from "@johnmorrisdotca/kazu/draw";
 *
 * const value: KazuGeometry = kazuGeometry("number-place",4);
 * console.log(value);
 * ```
 */
export type KazuGeometry = {
  /** The side of the drawing, in its own units (the viewBox is `0 0 side side`). */
  side: number;
  /** The side of one cell. */
  cell: number;
  /** Where the grid's top left corner is. */
  origin: number;
  /** How many cells deep the ring round the grid is: 1 for Towers, which keeps its clues there, 0 for the rest. */
  ring: number;
  size: number;
  /** The top left corner of a cell. */
  corner: (index: number) => { x: number; y: number };
  /** The middle of a cell. */
  centre: (index: number) => { x: number; y: number };
  /** The cell a point is over, or -1 for a point outside the grid. */
  cellAt: (x: number, y: number) => number;
};

/** The units of a cell, and the margin round the drawing.
 *
 * @example
 * ```ts
 * import { KAZU_CELL } from "@johnmorrisdotca/kazu/draw";
 * console.log(KAZU_CELL);
 * ```
 */
export const KAZU_CELL = 100;
const MARGIN = 10;

/** Where everything is in the drawing of a puzzle of this kind and side.
 *
 * @param kind - The native number-grid puzzle key.
 * @param size - The supported square grid side length.
 * @returns Where everything is in the drawing of a puzzle of this kind and side.
 * @example
 * ```ts
 * import { kazuGeometry } from "@johnmorrisdotca/kazu/draw";
 *
 * console.log(kazuGeometry("number-place",4).centre(0));
 * ```
 */
export function kazuGeometry(kind: KazuKind, size: number): KazuGeometry {
  const ring = kind === "towers" ? 1 : 0;
  const origin = MARGIN + ring * KAZU_CELL;
  const side = 2 * MARGIN + (size + 2 * ring) * KAZU_CELL;
  const corner = (index: number) => ({ x: origin + (index % size) * KAZU_CELL, y: origin + Math.floor(index / size) * KAZU_CELL });
  return {
    side,
    cell: KAZU_CELL,
    origin,
    ring,
    size,
    corner,
    centre: (index) => {
      const at = corner(index);
      return { x: at.x + KAZU_CELL / 2, y: at.y + KAZU_CELL / 2 };
    },
    cellAt: (x, y) => {
      const col = Math.floor((x - origin) / KAZU_CELL);
      const row = Math.floor((y - origin) / KAZU_CELL);
      return col < 0 || row < 0 || col >= size || row >= size ? -1 : row * size + col;
    },
  };
}
