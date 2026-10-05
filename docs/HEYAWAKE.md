# Heyawake

### 🗺️ Board & Components

The board is a rectangle divided into rectangular rooms. A number in a room tells how many of its cells must be black; an unnumbered room has no count clue. The engine checks boards up to 12 cells per side. The seeded original generator supports rectangular dimensions from 4 to 8, with an area cap of 25 cells to keep uniqueness proofs bounded.

### 🤫 Hidden Information Logic

There is no hidden information. The independent checker reads the player's marks directly and does not compare them with a stored generated answer. Progress data contains only public room clues, entries, and whether a hint was used.

### ⚔️ Movement & Combat Rules

Mark each cell black or white. Black cells may not share an edge. All white cells must be connected by orthogonal steps. In every straight uninterrupted horizontal or vertical white run, the run may pass through at most two distinct rooms. A room boundary itself does not interrupt the run.

### 🏆 Victory Conditions

Every cell is marked, every numbered room has its stated black-cell count, black cells do not touch by an edge, all white cells are connected, and no straight white run spans more than two rooms. A stopped search reports incomplete and never claims uniqueness. Generation starts from clue-density profiles, then may retain more room clues and split rooms more finely when needed to prove exactly one solution. These profiles are not calibrated human difficulty ratings; some seeds can still exhaust the generation budget.

## Public API

`@johnmorrisdotca/kazu/heyawake` exports the DOM-free model, independent checker, bounded solution counter, seeded generator, immutable play helpers, hint, and progress codec. `/heyawake/draw` exports the SVG renderer and `/heyawake/play` exports the browser mount. The English/Japanese player supports touch, mouse, keyboard, undo, check, hint, restart, and local progress. Hints only appear when the remaining puzzle has one proved answer, and mark the saved run assisted.

## Source

[Nikoli's Heyawake rules](https://www.nikoli.co.jp/en/puzzles/heyawake/) specify room counts, non-touching black cells, connected white cells, and the limit of two rooms in a straight white run. This package generates original puzzles and includes no published puzzle grids or artwork.
