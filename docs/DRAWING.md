# Drawing a puzzle

`drawKazu`, what it draws and its options. Back to the [README](../README.md#drawing-a-puzzle).

## Drawing a puzzle

```ts no-check
import { drawKazu, KAZU_STYLE } from "@johnmorrisdotca/kazu/draw";

const svg = drawKazu("sum-cages", 9, givens, { entries, notes, selected: 40, peers: true, conflicts: [3, 4], language: "ja" });
```

`drawKazu` returns SVG text: put it in a page, a file or an image, with nothing to load. It draws the grid with
its printed numbers and whatever has been written, pencil marks in a small grid in the cell, the heavier rules
round boxes or a Jigsaw's regions, the shaded diagonals, a cage's dashed outline with its sum in the corner,
the more-than marks as chevrons between cells, and the clues of a Towers puzzle round the edge. Null for givens
that are not a puzzle.

| Option | What it does |
| --- | --- |
| `entries` | what the player has written, row-major, 0 for empty |
| `notes` | pencil marks, a bit mask a cell: bit `v` is the note `v` |
| `selected`, `peers` | the chosen cell, and with `peers` its row, column and group and every cell holding its number washed |
| `conflicts` | cells that break a rule, in red with their numbers (`conflictsOf` finds them from the rules alone) |
| `wrong`, `hint` | the cells Check flagged, and the cell a hint pointed at |
| `done` | a faint wash of green, and `data-solved="true"` |
| `interactive` | a transparent square over every cell with its `data-cell`, for a page to press on (`mountKazu` does) |
| `language`, `label` | what a screen reader hears, and a description instead of "Sudoku puzzle, 9 by 9" |
| `style`, `frame` | `style: true` puts `KAZU_STYLE` inside, so the drawing stands alone as an image; `frame` draws a wooden frame round the paper |

Generic colours, no branding: every colour is a custom property on `.kazu` (`--kz-paper`, `--kz-ink`,
`--kz-given`, `--kz-entry`, `--kz-note`, `--kz-grid`, `--kz-box`, `--kz-frame`, `--kz-cage`, `--kz-clue`,
`--kz-diagonal`, `--kz-peer`, `--kz-same`, `--kz-select`, `--kz-hint`, `--kz-conflict`, `--kz-wrong`,
`--kz-good`), so a page sets only what it wants different, and the paper follows the page's light or dark. The parts carry classes
and data attributes to style or find them: `kz-given`, `kz-entry`, `kz-note`, `kz-cage-sum`, `kz-clue`, `kz-mark`,
`kz-conflict`, `kz-hit` (`data-cell`). It is one steady square whatever is drawn, so nothing moves as numbers
are written, and nothing in it can be selected, dragged or double-tapped into a selection.
`kazuGeometry(kind, size)` says where every cell is in the drawing and which cell a point is over, so a page of
your own can play it.
