# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.3.0] - 2026-10-05

### Added

- **Four levels on six grid puzzles.** Shikaku, Akari, Slitherlink, Hitori, Fillomino and Kakuro each make `easy`, `medium`, `hard` and `extra-hard` boards (the level types and `SHIKAKU_LEVELS`, `AKARI_LEVELS`, `SLITHERLINK_LEVELS`, `HITORI_LEVELS`, `FILLOMINO_LEVELS` and `KAKURO_LEVELS`), every one with exactly one answer, and every puzzle now carries its `level`. Easy and medium are solved by plain rules (easy keeps more of its numbers, medium has as few as the rules allow); hard needs supposing something and seeing it break; extra-hard needs the most of that.
- **More sizes.** `AKARI_SIZES` (5, 7, 10, 14), `SLITHERLINK_SIZES` (5, 7, 10), `HITORI_SIZES` (5, 6, 7, 8, 9, 10, 12), `FILLOMINO_SIZES` (6, 8, 10, 12), `KAKURO_SIZES` (6, 8, 10, 12) and `SHIKAKU_SIZES` (5, 7, 10, 14) list what the demo offers. Hitori takes any side from 4 to 12 (was 5 and 7), Kakuro any side from 5 to 12 (was one size, 10), Fillomino any side from 4 to 12 (was 4 to 8 and 36 squares).
- **A measured difficulty.** `rateShikaku`, `rateAkari`, `rateSlitherlink`, `rateHitori`, `rateFillomino` and `rateKakuro` solve a board with one answer the way a person does (the rules alone, then supposing one thing, then more) and report how deep that went (`depth`, `probes`) and what the board is made of (numbers, runs, regions, loop length). `docs/LEVELS.md` defines each level per kind and tables the measures and the generation times by size and level; `node scripts/measure-levels.mjs` makes the tables again, and draws a puzzle as text with `--show`.
- A shared engine (`src/csp.ts`) under the six kinds: counting answers, reasoning with and without supposing, and proving one answer by reasoning when that is enough.
- `generateAkari`, `generateSlitherlink`, `generateHitori` and `generateKakuro` take the level as a last argument (`generateAkari(width, height, seed, level?)`, `generateSlitherlink(width, height, seed, level?)`, `generateHitori(size, seed, level?)`, `generateKakuro(seed, level?, size?)`), `"medium"` if left out; Shikaku and Fillomino keep `(width, height, level, seed)` and add `extra-hard`.
- The demo has a Level choice, in English and Japanese, on all six pages, and the sizes above.

### Changed

- **The six generators make new boards.** Akari, Slitherlink, Hitori and Kakuro used fixed layouts (the Akari rooms, a loop of one or two blocks with nearly every square numbered and most of them 0, three or four shaded squares in Hitori, a 10×10 of 2×2 to 3×3 blocks) and made the same few motifs again and again; they now build random boards: Akari scatters black squares and takes numbers away, Slitherlink grows a winding loop and takes numbers away (few say 0), Hitori shades about a quarter of the squares and repairs the numbers until the answer is single, Kakuro lays runs out row by row and repairs digits, and Shikaku packs interlocking rectangles instead of cutting straight lines. Fillomino's generator is new and no longer slow (a 6×6 took up to 1.7 s). **A seed makes a different puzzle from the one 1.2.0 made** for Shikaku, Akari, Slitherlink, Hitori, Kakuro and Fillomino; a progress code carries its board, so a saved game is unaffected, but a site that keeps a game as kind, size, level and seed will find that seed is another puzzle. The six number puzzles are untouched, and `src/site.fixture.json` still makes all 3,600 of them again, byte for byte.
- The six solvers count answers with a shared engine that reasons first: a board that the rules (or one supposition) settle is proved with no search at all, and others are searched from what reasoning left. Counts are the same as before on every board the tests compare (exhaustive enumeration of small boards, and the old solvers); only the node counts, and so what a given `nodes` budget reaches, are different, and answers are found in far fewer nodes. `hint*` calls are quicker as a result.
- If a generator cannot make a board of the level within its attempts it makes one of the next level down, and finally a plain one, rather than throw; the rating of the board shows what it is. On the 20,800 boards of `docs/LEVELS.md` (seeds 1 to 200 at every size and level) this happened on none.
- Fillomino's number choice in the player offers only numbers a board can hold (up to the biggest given, or the biggest stretch of squares with none), not up to the square count.

### Fixed

- `generateKakuro(97)` threw "No uniquely solvable Kakuro board was proved within the generation budget"; no seed throws now, at any level or size.
- `solveHitori` could count one shade pattern twice (so a board with two answers could be reported as having three, and a limit could be reached early); it counts each distinct pattern once.

## [1.2.0] - 2026-10-05

### Added

- Hitori and Nurikabe: independent shading rules, bounded solution counting, original proof-backed puzzle families, bilingual players and package entry points.
- Juosan: a dedicated territory model, verified small training layouts and a bilingual player for supplied boards.
- Nine named Shikaku challenges across square, wide and tall routes.
- Akari: a separate rule engine, bounded solution counter, seeded unique puzzle generator, immutable play, accessible bilingual player, drawing and demo.
- Slitherlink: a dedicated edge-loop engine, bounded unique-puzzle generation, accessible bilingual player, demo and package entry points.
- Ripple Effect: a dedicated room and spacing engine, bounded unique 9×9 generation, bilingual accessible player, demo and package entries.
- Kakuro: a seeded uniquely proved crossword-sum family, independent bounded solver, immutable progress, SVG and accessible English/Japanese player.

- Masyu and Yajilin: cell-centre loop engines, bounded proof-backed 5×5 families, drawing, bilingual players and saved progress.
- Fillomino: connected numbered regions, bounded original rectangular generation, independent checks, hints and a bilingual player.
- Heyawake: rectangular rooms, shading and white-path rules, bounded original small-board generation, hints and a bilingual player.

## [1.1.0] - 2026-10-04

### Added

- Shikaku: unique seeded rectangle puzzles, exact-cover solving, immutable play and progress, SVG drawing, accessible bilingual controls and worker-backed generation.
- Square, wide, tall and custom rectangle demos using the shared family styling. Existing six number-entry kinds and saved codes remain compatible.

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
