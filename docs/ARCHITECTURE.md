# Architecture

How the source is laid out, and why. Back to the [README](../README.md#architecture).

## Architecture

The generators, the solvers, the check, the hint and the game are plain functions over short codes, with no
DOM. The drawing is SVG text in an entry of its own, so a server that only checks an answer never loads it, and
the page's part (the mount and the element) is another.

```text
├── hitori-draw-entry.ts
├── hitori-entry.ts
├── hitori-play-entry.ts
├── hitori.constants.ts
├── hitori.types.ts
├── hitori-board.ts
├── hitori-draw.ts
├── hitori-game.ts
├── hitori-generate.ts
├── hitori-build.ts
├── hitori-logic.ts
├── hitori-rate.ts
├── hitori-mount.ts
├── hitori-play.types.ts
├── hitori-solve.ts
├── hitori-strings.ts
├── hitori-style.ts
├── nurikabe-draw-entry.ts
├── nurikabe-entry.ts
├── nurikabe-play-entry.ts
├── nurikabe.constants.ts
├── nurikabe.types.ts
├── nurikabe-board.ts
├── nurikabe-draw.ts
├── nurikabe-game.ts
├── nurikabe-generate.ts
├── nurikabe-mount.ts
├── nurikabe-play.types.ts
├── nurikabe-solve.ts
├── nurikabe-strings.ts
├── nurikabe-style.ts
├── juosan-draw-entry.ts
├── juosan-entry.ts
├── juosan-play-entry.ts
├── juosan.constants.ts
├── juosan.types.ts
├── juosan-board.ts
├── juosan-draw.ts
├── juosan-game.ts
├── juosan-generate.ts
├── juosan-mount.ts
├── juosan-play.types.ts
├── juosan-solve.ts
├── juosan-strings.ts
├── juosan-style.ts
├── masyu-draw-entry.ts
├── masyu-entry.ts
├── masyu-play-entry.ts
├── masyu.constants.ts
├── masyu.types.ts
├── masyu-board.ts
├── masyu-draw.ts
├── masyu-game.ts
├── masyu-generate.ts
├── masyu-mount.ts
├── masyu-play.types.ts
├── masyu-solve.ts
├── masyu-strings.ts
├── masyu-style.ts
├── yajilin-draw-entry.ts
├── yajilin-entry.ts
├── yajilin-play-entry.ts
├── yajilin.constants.ts
├── yajilin.types.ts
├── yajilin-board.ts
├── yajilin-draw.ts
├── yajilin-game.ts
├── yajilin-generate.ts
├── yajilin-mount.ts
├── yajilin-play.types.ts
├── yajilin-solve.ts
├── yajilin-strings.ts
├── yajilin-style.ts
├── regions-draw-entry.ts
├── regions-entry.ts
├── regions-play-entry.ts
├── regions.constants.ts
├── regions.types.ts
├── regions-board.ts
├── regions-draw.ts
├── regions-game.ts
├── regions-generate.ts
├── regions-build.ts
├── regions-logic.ts
├── regions-rate.ts
├── regions-mount.ts
├── regions-play.types.ts
├── regions-solve.ts
├── regions-strings.ts
├── regions-style.ts
├── regions-worker.ts
├── shikaku-draw-entry.ts
├── shikaku-entry.ts
├── shikaku-play-entry.ts
├── cross-sums-draw-entry.ts
├── cross-sums-entry.ts
├── cross-sums-play-entry.ts
├── cross-sums.constants.ts
├── cross-sums.types.ts
├── cross-sums-board.ts
├── cross-sums-draw.ts
├── cross-sums-game.ts
├── cross-sums-generate.ts
├── cross-sums-build.ts
├── cross-sums-logic.ts
├── cross-sums-rate.ts
├── cross-sums-template.ts
├── cross-sums-mount.ts
├── cross-sums-play.types.ts
├── cross-sums-solve.ts
├── cross-sums-strings.ts
├── cross-sums-style.ts
├── shikaku.constants.ts
├── shikaku.types.ts
├── shikaku-board.ts
├── shikaku-draw.ts
├── shikaku-game.ts
├── shikaku-generate.ts
├── shikaku-build.ts
├── shikaku-logic.ts
├── shikaku-rate.ts
├── shikaku-template.ts
├── shikaku-mount.ts
├── shikaku-packs.ts
├── shikaku-play.types.ts
├── shikaku-solve.ts
├── shikaku-strings.ts
├── shikaku-style.ts
├── shikaku-worker.ts
├── akari-draw-entry.ts
├── akari-entry.ts
├── akari-play-entry.ts
├── akari.constants.ts
├── akari.types.ts
├── akari-board.ts
├── akari-draw.ts
├── akari-game.ts
├── akari-generate.ts
├── akari-logic.ts
├── akari-rate.ts
├── akari-template.ts
├── akari-mount.ts
├── akari-play.types.ts
├── akari-solve.ts
├── akari-strings.ts
├── akari-style.ts
├── loop-draw-entry.ts
├── loop-entry.ts
├── loop-play-entry.ts
├── loop.constants.ts
├── loop.types.ts
├── loop-board.ts
├── loop-draw.ts
├── loop-game.ts
├── loop-generate.ts
├── loop-logic.ts
├── loop-rate.ts
├── loop-template.ts
├── loop-mount.ts
├── loop-play.types.ts
├── loop-solve.ts
├── loop-strings.ts
├── loop-style.ts
├── ripple-draw-entry.ts
├── ripple-entry.ts
├── ripple-play-entry.ts
├── ripple.constants.ts
├── ripple.types.ts
├── ripple-board.ts
├── ripple-draw.ts
├── ripple-game.ts
├── ripple-generate.ts
├── ripple-mount.ts
├── ripple-play.types.ts
├── ripple-solve.ts
├── ripple-strings.ts
├── ripple-style.ts
├── heyawake-draw-entry.ts
├── heyawake-entry.ts
├── heyawake-play-entry.ts
├── heyawake.constants.ts
├── heyawake.types.ts
├── heyawake-board.ts
├── heyawake-draw.ts
├── heyawake-game.ts
├── heyawake-generate.ts
├── heyawake-mount.ts
├── heyawake-play.types.ts
├── heyawake-solve.ts
├── heyawake-strings.ts
├── heyawake-style.ts
├── heyawake-worker.ts
src/
├── index.ts            the main entry: everything but the drawing and the page
├── kinds.ts            the six puzzles' keys, sizes and levels, and the shape of a puzzle
├── random.ts           the seeded random numbers every puzzle is made from
├── csp.ts              the one small engine under the six grid kinds: counting answers, and reasoning with and without supposing
├── cells.ts            a grid of numbers as a string, 1 to 9 and A to P
├── layout.ts           the groups that must each hold every number once: rows, columns, boxes, regions, diagonals, cages
├── group-solve.ts       the solver for puzzles made of groups: counting, singles, depth
├── number-place.ts      Sudoku and Diagonal Sudoku: the generator and how givens are carved
├── jigsaw.ts           Jigsaw Sudoku: irregular regions, their code and the generator
├── sum-cages.ts         Killer Sudoku: cages grown by joining, their code and outline
├── more-or-less.ts       Futoshiki: the Latin square, the marks and the generator
├── more-or-less-code.ts   Futoshiki's givens as a string
├── more-or-less-solve.ts  Futoshiki's solver
├── towers.ts           Skyscrapers: the generator
├── towers-code.ts       Skyscrapers' givens as a string, and what a clue sees
├── towers-solve.ts      Skyscrapers' solver
├── generate.ts         generateKazu: the one door to every generator
├── solve.ts            solving, counting and measuring any puzzle from its givens
├── givens.ts           what a puzzle was printed with, read from its code
├── check.ts            whether a finished grid is right, in O(cells)
├── conflicts.ts        the cells that break a rule right now
├── hint.ts             the next cell a person could fill in, and why
├── progress.ts         runs, pencil marks and step logs as strings
├── game.ts             a game in play as pure functions: entries, notes, Undo
├── clock.ts            a time as a clock shows it
├── names.ts            each puzzle's names, rules and origin, in English and Japanese
├── strings.ts          the words a board says, in English and Japanese
├── geometry.ts         where every cell is in the drawing, and which cell a point is over
├── style.ts            the drawing's style: its colours as custom properties
├── draw.ts             a puzzle as SVG text
├── draw-entry.ts       the "/draw" entry
├── play-style.ts        the style of a playable board: its box, pad, buttons and words
├── mount.ts            mountKazu: draws a puzzle into an element and plays it
├── play-entry.ts       the "/play" entry
├── element.ts          the "/element" entry: the <kazu-board> class
├── element-define.ts   the "/element/define" entry: defines the tag on the page
└── version.ts          the package's version
```

Tests sit beside the code they test (`*.test.ts`). `src/site.fixture.json` is what itsutsu.com made before the move,
and six `site.<puzzle>.test.ts` files make it all again. `scripts/` builds the demo and its API reference page, takes the
README's pictures and checks the package as npm packs it; `demo/` is the playable page, and `e2e/` its browser tests.
