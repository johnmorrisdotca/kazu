# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0] - 2026-10-01

The Numbers family of grid puzzles, taken out of itsutsu.com so that the site can import them as it
imports its other family packages. Every puzzle the site made before the move is made again here, givens and
solution, byte for byte: `src/site.fixture.json` holds 3,600 of them (every puzzle, size and level, sixty
seeds each) and six tests make each again.

- **Six puzzles**, by key: `number-place` (Sudoku, 4×4 to a 16×16 Giant), `jigsaw`, `diagonal`, `sum-cages` (Killer
  Sudoku), `more-or-less` (Futoshiki) and `towers` (Skyscrapers), each at `easy`, `medium` and `hard`.
- **`@johnmorrisdotca/kazu`**: `generateKazu`, `solveKazu`, `countKazuSolutions`, `kazuGuessDepth`, `checkKazu` (the
  O(cells) check, with the site's own reasons), `hintKazu` (the next cell and why), `conflictsOf`, `readGivens`, the
  string codes of givens, runs, pencil marks and step logs (the site's own spellings, which decode unchanged), and a
  game in play as pure functions.
- **`@johnmorrisdotca/kazu/draw`**: a puzzle as SVG text with entries, pencil marks, the chosen cell and its lines,
  conflicts, diagonals, dashed cages with their sums, more-than marks and the tower clues round the edge, in light and
  dark, with generic colours as custom properties.
- **`@johnmorrisdotca/kazu/play`**: `mountKazu` plays a puzzle in any element by touch, mouse and keyboard, with a
  number pad, pencil marks, Undo, Hint, Check, a clock and events; English and Japanese.
- **`<kazu-board>`** (`/element`, `/element/define`): the same in a tag.
- A demo with a chooser, a Help switch, the cloth patches, and browser tests (`pnpm test:demo`) at a phone's width
  and a desk's, in Chromium and WebKit.
