# Regions

### 🗺️ Board & Components

The board is a rectangular grid. Some cells have printed area numbers; the rest are blank. The engine accepts boards up to 12 cells per side. Its original seeded generator supports rectangular dimensions from 4 to 8, capped at 36 cells so uniqueness proofs remain bounded. Profiles set a starting clue density; the generator retains more original clues when needed to prove uniqueness.

### 🤫 Region Logic

All orthogonally connected cells with the same number form one region. A region may contain no printed clue: clues guide the solver but are not a required property of a completed region. Diagonal contact does not connect regions.

### ⚔️ Fill Rules

Every cell receives a positive number, and each region contains exactly as many cells as its number. Regions with the same area may not touch along an edge. The implementation checks those rules from the filled grid and never compares it with a hidden answer. Seeded puzzles are retained only when the bounded solver exhausts the search and counts exactly one answer.

### 🏆 Completion Conditions

All cells must be filled, every same-number connected region must have its stated area, and all printed clues must remain unchanged. A search that reaches its node or solution limit reports incomplete; it does not claim uniqueness.

## Public API

The `@johnmorrisdotca/kazu/regions` entry exports a DOM-free board model, independent checker, bounded solution counter, seeded generator, immutable play state, hint, and versioned progress codec. `/regions/draw` exports the SVG renderer; `/regions/play` exports the browser mount. The player stores no generated solution in its save data.

## Source

Regions is also known as Fillomino, and [Nikoli's rules](https://www.nikoli.co.jp/en/puzzles/fillomino/) define the connected equal-number regions, exact area, and separation condition. All demo puzzles are generated in this package; no published puzzle grids or art are included.
