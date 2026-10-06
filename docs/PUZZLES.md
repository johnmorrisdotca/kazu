# The puzzles with a page of their own

Masyu, Yajilin, Shikaku, Juosan, Akari, Loop, Ripple Effect, Cross Sums, Regions, Heyawake, Hitori and Nurikabe: each one's rules, entries, generator, solver and player, and the levels of the grid puzzles. Back to the [README](../README.md#masyu--pearls-and-a-single-loop).

## Masyu — pearls and a single loop

Masyu is a line puzzle with its own cell-centre loop model. A white pearl lies on a straight section and the loop turns in at least one of its adjacent cells. A black pearl lies at a turn, with a straight section in each adjacent cell. One closed loop must pass through every pearl.

```ts
import { generateMasyu, checkMasyu, solveMasyu } from "@johnmorrisdotca/kazu/masyu";
import { mountMasyu } from "@johnmorrisdotca/kazu/masyu/play";

const puzzle = generateMasyu(5, 42);
checkMasyu(puzzle, puzzle.solution); // { ok: true }
solveMasyu(puzzle);                  // count: 1, complete: true
mountMasyu(document.querySelector("#board"), { board: puzzle });
```

The dedicated `/masyu`, `/masyu/play`, and `/masyu/draw` entry points keep the loop engine separate from number-entry state. Import them from `@johnmorrisdotca/kazu/masyu`, `@johnmorrisdotca/kazu/masyu/play`, and `@johnmorrisdotca/kazu/masyu/draw`. The solver uses bounded cell-degree search; it reports `complete: false` when its node budget stops. The seeded generator currently supports original 5×5 layouts only: four distinct loop families, with board symmetries, produce varied pearl patterns and loop lengths. It returns a puzzle only after a completed uniqueness proof. Larger boards are not advertised until they can be proved within the search budget. Hints expose a next loop edge from a proved unique solution; saved play data contains the public pearls, drawn edges, and whether a hint was used.

[Nikoli describes the Masyu rules here](https://www.nikoli.co.jp/en/puzzles/masyu/). The generated layouts are original and do not use Nikoli's grids or artwork.

## Yajilin — arrows, shaded cells and a loop

Yajilin places black cells by arrow counts and draws one loop through every remaining empty cell. Black cells do not touch by an edge; arrow cells are not shaded and are not part of the loop. The loop uses cell centres, not Loop's grid edges.

```ts
import { generateYajilin, checkYajilin, solveYajilin } from "@johnmorrisdotca/kazu/yajilin";
import { mountYajilin } from "@johnmorrisdotca/kazu/yajilin/play";

const puzzle = generateYajilin(5, 42);
checkYajilin(puzzle, puzzle.solution.shaded, puzzle.solution.edges); // { ok: true }
solveYajilin(puzzle); // count: 1, complete: true
mountYajilin(document.querySelector("#board"), { board: puzzle });
```

Import the engine, player, and drawing from `@johnmorrisdotca/kazu/yajilin`, `@johnmorrisdotca/kazu/yajilin/play`, and `@johnmorrisdotca/kazu/yajilin/draw`. The solver enumerates public shade assignments, then checks the remaining cell-centre loop, with a finite node budget and an explicit incomplete result. The original seeded generator currently supports 5×5 only and keeps boards whose unique answer was proved. It varies both 3×3 and 3×4 loop families and their symmetries. Hints infer either a shade or a loop edge from the public clues and mark progress as helped. Save data contains only clues, current shades and drawn edges.

[Nikoli's Yajilin rules](https://www.nikoli.co.jp/en/puzzles/yajilin/) define the arrow counts, non-touching shaded cells and single loop. These original layouts use no Nikoli puzzle grids or artwork.

## Shikaku — rectangles in Kazu

The demo includes square boards (5, 7, 10 and 14 on a side), wide (10 × 6), tall (6 × 10) and custom rectangular boards, with width and height from 2 to 16, at four levels. The named Courtyard (square), Long Table (wide) and Narrow Garden (tall) packs each hold three uniquely proved challenges with useful titles. Shares and saved settings preserve both dimensions. It uses Kazu’s shared materials and pieces palette.

Shikaku belongs to the number-and-grid family. Its moves are rectangles rather than number entries, so it has a dedicated model and optional entry points; the existing six `KazuKind` values and saved Sudoku codes remain compatible.

```js
import { generateShikaku, newShikaku, placeShikaku, checkShikaku } from "@johnmorrisdotca/kazu/shikaku";
import { mountShikaku } from "@johnmorrisdotca/kazu/shikaku/play";
import { generateShikakuChallenge } from "@johnmorrisdotca/kazu/shikaku";

const { puzzle } = generateShikakuChallenge("wide", 2); // Causeway, a proved 10 × 6 puzzle
const player = mountShikaku(document.querySelector("#board"), {
  board: puzzle, material: "ivory", pieces: "ink", language: "en",
  onFinish: game => console.log(game.helped ? "Solved with help" : "Solved"),
});
// player.progress() saves public clues and rectangles; player.destroy() removes the player.
```

`generateShikakuChallenge("square" | "wide" | "tall", 1..3)` selects a named challenge and checks uniqueness with the existing solver.

Use `@johnmorrisdotca/kazu/shikaku`, `@johnmorrisdotca/kazu/shikaku/play`, or `@johnmorrisdotca/kazu/shikaku/draw`.

The root entry re-exports the engine, `/play` re-exports `mountShikaku`, and `/draw` re-exports `drawShikaku`. The dedicated entries let a consumer load only Shikaku. There are no runtime dependencies.

## Juosan — horizontal and vertical marks

Juosan gives each cell either a horizontal mark (`1`) or a vertical mark (`2`). A territory clue is the absolute difference between its horizontal and vertical mark counts; an unnumbered territory uses `difference: null`. Horizontal marks may make longer runs horizontally but never three vertically; vertical marks may make longer runs vertically but never three horizontally. See [Nikoli's English rules](https://www.nikoli.co.jp/en/puzzles/juosan/) for the original rule wording.

```ts
import { checkJuosan, generateJuosan, solveJuosan } from "@johnmorrisdotca/kazu/juosan";
import { mountJuosan } from "@johnmorrisdotca/kazu/juosan/play";

const puzzle = generateJuosan(3, 2, "easy", 42); // 3 × 2 training board; answer proved unique
solveJuosan(puzzle, 2);                         // { count: 1, complete: true, ... }
checkJuosan(puzzle, puzzle.solution);           // { ok: true, errors: [] }
const game = mountJuosan(document.querySelector("#board")!, { board: puzzle });
```

Juosan has a dedicated immutable engine and package paths: `@johnmorrisdotca/kazu/juosan`, `@johnmorrisdotca/kazu/juosan/play`, and `@johnmorrisdotca/kazu/juosan/draw`. The player accepts any valid supplied board from 2×2 through 16×16. The built-in seeded generator currently supports the two small training shapes, 3×2 and 2×3. Even seeds split the board into straight three-cell territories; odd seeds use one whole-board territory. In each case, the maximum difference clue plus the directional run rule proves the single uniform orientation. Its `level` setting is reserved and does not change rule difficulty yet. The demo saves progress locally, marks hint use as assisted, and offers keyboard and touch input in English and Japanese.

- `ShikakuBoard`: `width`, `height`, and row-major `clues` (zero for an empty cell). Dimensions are 2–16; clue areas sum to the grid area.
- `ShikakuRectangle`: zero-based `x`, `y`, `width`, `height`.
- `generateShikaku(width, height, level, seed)`: deterministic puzzle and solution; `level` is `easy`, `medium`, `hard` or `extra-hard` (`SHIKAKU_LEVELS`), and `SHIKAKU_SIZES` lists the square sides the demo offers (5, 7, 10, 14). The board is cut into interlocking rectangles by packing, not by straight cuts, each carries one number, and the answer is counted independently; every level is checked by solving the board (see [Levels](#levels-of-the-grid-puzzles)). It never returns an unproved board. If no board of a level is found within its attempts the next level down is made instead, which the rating shows.
- `rateShikaku(board)`: how hard a board is, measured by solving it: `depth` (0 rules alone, 1 supposing one rectangle, 2 more), `rules` (how many of the three rules a depth-0 solve needed), `probes`, and the number, area and ambiguity of the rectangles.
- `solveShikaku(board, placements?, {limit?, nodes?})`: exact-cover count, first answer, nodes visited and `complete`. The default limit is two answers and 100,000 nodes. Only `complete && count === 1` proves uniqueness; a stopped search is explicitly incomplete.
- `checkShikaku(board, rectangles)`: coverage and rectangle rule errors, independent of a stored answer. It accepts any valid completion.
- `newShikaku`, `placeShikaku`, `removeShikaku`, `undoShikaku`: immutable game operations. A placement replaces intersecting rectangles, and rule errors are allowed until checked. The game strips generated solutions.
- `hintShikaku(game)`: a rectangle from the single proved remaining partition, or `null`. Hints in the mounted player mark the run as helped.
- `encodeShikaku`, `decodeShikaku`: versioned JSON with only public puzzle data and placements, validated on restore. Undo history and the clock are session-only.
- `drawShikaku(board, options)`: SVG. Materials `ivory`, `wood`, `slate`; numbers `ink`, `tiles`; language `en`, `ja`.
- `mountShikaku(host, options)`: tap two opposite corner cells, or use arrows and Enter/Space. Delete removes a selected rectangle; Escape cancels a pending corner. Undo, Check, Hint, Restart and a modal board view are built in. The handle has `game`, `progress`, `set`, `restart`, `destroy`; callbacks and bubbling `shikaku-change` / `shikaku-finish` events carry copies of public state. Mount once per puzzle; use `set` for appearance changes.

The demo is `site/shikaku.html` after `pnpm site`; its generator runs in a module worker at `dist/shikakuWorker.js`. Deploy the worker with the built files and permit same-origin module workers. The npm player accepts a board synchronously; hosts can use their own worker when generating large custom boards. The demo stores progress locally and shares settings through the address. Shared seeds start fresh; they do not share your placements. Restart and page reload reset the session clock.

[Shikaku's rules are described by Nikoli](https://www.nikoli.co.jp/en/puzzles/shikaku/). This implementation generates its own puzzles and does not copy Nikoli's puzzle grids, wording or artwork.

## Akari — light the grid

Akari (美術館) places bulbs in white squares. Each bulb lights in straight lines until a black square or the edge. Every white square must be lit, bulbs cannot see each other, and a numbered black square must touch exactly that many bulbs. Boards may be square, wide, tall or custom, with each side from 2 to 16. The seeded generator scatters black squares at random (half the time in rotating pairs), lights them with random bulbs, numbers every black square that touches a white one, and then takes numbers away for as long as the board can still be solved the way the level asks, so the layouts are not a fixed motif. It returns a board only when its answer is proved single.

```js
import { generateAkari, checkAkari } from "@johnmorrisdotca/kazu/akari";
import { mountAkari } from "@johnmorrisdotca/kazu/akari/play";

const puzzle = generateAkari(7, 7, 42, "hard"); // width, height, seed, level ("medium" if left out)
const player = mountAkari(document.querySelector("#board"), {
  board: puzzle, material: "ivory", pieces: "ink", language: "en",
});
// player.progress() saves public clues and bulbs; player.destroy() removes the player.
```

Use `@johnmorrisdotca/kazu/akari`, `@johnmorrisdotca/kazu/akari/play`, or `@johnmorrisdotca/kazu/akari/draw`. The root package also re-exports the engine; the dedicated drawing and player entries keep those features optional. There are no runtime dependencies.

- `AkariBoard`: width, height and row-major `cells`: `null` is white, `false` is an unnumbered black square, and `0`–`4` are numbered black squares.
- `generateAkari(width, height, seed, level?)`: deterministic puzzle and its solution at `easy`, `medium`, `hard` or `extra-hard` (`AKARI_LEVELS`; `AKARI_SIZES` lists the square sides on offer: 5, 7, 10, 14). Easy keeps most of its numbers, medium is solved by the rules alone with as few as it can, hard needs supposing a bulb or an empty square, extra-hard needs the most of that. It returns only when an independent count proves exactly one answer; if no board of the level is found within its attempts the next level down is made, and the first generator, which cannot fail, is the last resort.
- `rateAkari(board)`: how hard a board is, measured by solving it: `depth` (0 rules alone, 1 supposing one square, 2 more), `probes`, and the numbers, bulbs and white squares.
- `solveAkari(board, {limit?, nodes?})`: counts placements, returns the first answer, visited nodes and `complete`; only `complete && count === 1` proves uniqueness. The default answer limit is two and the node budget is 250,000.
- `checkAkari(board, bulbs)`: checks a complete placement from the rules, independently of the generated answer. `progressAkari` reports dark squares and immediate conflicts while permitting unfinished numbered clues.
- `newAkari`, `toggleAkari`, `undoAkari`, `akariFinished`, `hintAkari`: immutable play operations. Hints require a proved unique answer and mark the game as helped.
- `encodeAkari`, `decodeAkari`: versioned JSON containing only public board data and player bulbs.
- `drawAkari(board, options)`: SVG with `ivory`, `wood` and `slate` materials, `ink` or `tiles` bulb pieces, and `en` or `ja` labels.
- `mountAkari(host, options)`: toggle bulbs by tap, click, Enter or Space. Arrow keys move through the grid; Delete removes a bulb. Undo, Check, Hint, Restart and a modal board view are built in. The handle has `game`, `progress`, `set`, `restart` and `destroy`.

The demo is `site/akari.html` after `pnpm site`. It shares Kazu's family header, footer, palette and felt board. Progress stays in local storage; share links carry board settings, not player data.

[Nikoli's Akari rules](https://www.nikoli.co.jp/en/puzzles/akari/) describe the same line-of-sight and numbered-square constraints. These boards are generated here; the implementation does not copy Nikoli's grids or artwork.

## Loop

```js
import { generateLoop } from "@johnmorrisdotca/kazu/loop";
import { mountLoop } from "@johnmorrisdotca/kazu/loop/play";

const puzzle = generateLoop(7, 7, 42, "hard"); // width, height, seed, level ("medium" if left out)
const player = mountLoop(document.querySelector("#board"), {
  board: puzzle, material: "ivory", language: "en",
});
// player.progress() saves the public clues and selected edges.
```

The Loop engine has its own edge model, checker, progress checker, bounded solution counter, seeded generator and immutable play state. `solveLoop` distinguishes an exhausted search from a proved count; the generator returns only boards proved to have one loop. `generateLoop(width, height, seed, level?)` makes `easy`, `medium`, `hard` or `extra-hard` (`LOOP_LEVELS`) boards, and `LOOP_SIZES` lists the square sides on offer (5, 7, 10). `rateLoop(board)` measures a board by solving it: `depth` (0 rules alone, 1 supposing one edge, 2 more), `probes`, the numbers, how many of them say 0, and the loop's length. Boards may be 2–10 cells wide and high. The generator grows a random winding loop (a connected region without holes whose outline never touches itself), numbers every square with how many of its edges the loop uses, and takes numbers away, squares numbered 0 first, for as long as the board can still be solved the way the level asks, so boards are not a few shapes and few squares say 0. The player supports touch and mouse edge toggles, arrow-key focus, Enter/Space, undo, restart, checking, proved hints, save/restore, and ivory, wood and slate materials in English and Japanese.

Use `@johnmorrisdotca/kazu/loop`, `@johnmorrisdotca/kazu/loop/play`, or `@johnmorrisdotca/kazu/loop/draw`. The demo is `site/loop.html` after `pnpm site`. Loop is also known as Slitherlink, and its rules are described by [Nikoli](https://www.nikoli.co.jp/en/puzzles/slitherlink/). This implementation uses original generated layouts and does not copy Nikoli puzzle grids, wording or artwork.

## Ripple Effect

```ts
import { generateRipple, newRipple, hintRipple } from "@johnmorrisdotca/kazu/ripple";
import { mountRipple } from "@johnmorrisdotca/kazu/ripple/play";

const puzzle = generateRipple(9, 9, 42);
const game = newRipple(puzzle);
const hint = hintRipple(game); // only returned after a unique completion is proved
const player = mountRipple(document.querySelector<HTMLElement>("#board")!, {
  board: puzzle, material: "ivory", pieces: "ink", language: "en",
});
```

Each room contains every number from 1 through its size exactly once. Repeated N values in one row or column have at least N cells between them, so their coordinate distance must exceed N. The DOM-free engine has independent completion and progress checks and a bounded solution counter that reports when a search stopped before proof. The original seeded 9×9 generator uses 3×3 rooms, seeded row-band, column-stack and digit permutations, and uniqueness-preserving clue removal. It returns only puzzles proved to have one completion; custom sizes are not advertised until their generator family passes the same proof checks. These are original layouts and do not reproduce Nikoli puzzle grids or artwork.

Use `@johnmorrisdotca/kazu/ripple`, `@johnmorrisdotca/kazu/ripple/play`, or `@johnmorrisdotca/kazu/ripple/draw`. The touch and keyboard player includes number entry, pencil notes, undo, restart, checking, unique-proof hints, accessible room boundaries, save/restore, and ivory, wood and slate materials with ink or tile pieces in English and Japanese. The demo is `site/ripple.html` after `pnpm site`. Rules: [Nikoli’s Ripple Effect page](https://www.nikoli.co.jp/en/puzzles/ripple_effect/).

## Cross Sums — crossword sums in Kazu

Cross Sums fills white cells with digits 1–9. Each across and down run must match its clue sum without repeating a digit. Run lengths are at least two, and every white cell belongs to exactly one run in each direction. The puzzle is also known as Kakuro, and [Nikoli describes the rules](https://www.nikoli.co.jp/en/puzzles/kakuro/); generated layouts here are original.

```js
import { generateCrossSums, solveCrossSums, checkCrossSums } from "@johnmorrisdotca/kazu/cross-sums";
import { mountCrossSums } from "@johnmorrisdotca/kazu/cross-sums/play";

const puzzle = generateCrossSums(42, "hard", 8); // seed, level ("medium"), size including the totals' row and column (10)
const proof = solveCrossSums(puzzle); // uniqueness only when complete && count === 1
const player = mountCrossSums(document.querySelector("#board"), { board: puzzle, language: "en" });
player.progress(); // public clues, entries and pencil marks; no answer
```

`@johnmorrisdotca/kazu/cross-sums/draw` provides standalone SVG drawing. `generateCrossSums(seed, level?, size?)` makes a board of any side from 5 to 12 (`CROSS_SUMS_SIZES` lists those on offer: 6, 8, 10, 12) at `easy`, `medium`, `hard` or `extra-hard` (`CROSS_SUMS_LEVELS`). It lays out the black squares row by row so that no run is a single square or longer than the level allows, fills random digits, and changes digits or darkens squares until the answer is single; easy and medium also ease the board until the rules they promise are enough, and hard and extra-hard ask for supposing. A board is accepted only after a bounded exact count proves one answer, and a seed never throws: if a level is not found within its attempts the next level down is made, and the first generator is the last resort on a 10×10. `rateCrossSums(board)` measures a board by solving it: `depth`, `plain` (the single-run rules were enough), `probes`, the runs, the longest run and the share of totals that can be made one way only. `solveCrossSums` reports `complete: false` when its node budget or answer limit stops counting. `checkCrossSums` validates completed runs independently; `progressCrossSums` permits blanks while marking impossible totals and repeats. The bilingual player supports touch, arrows, digits, pencil mode, Undo, Hint, Check, Restart and versioned saved progress.

The Cross Sums entries are `@johnmorrisdotca/kazu/cross-sums`, `@johnmorrisdotca/kazu/cross-sums/play` and `@johnmorrisdotca/kazu/cross-sums/draw`.

## Regions — connected regions with exact areas

The dedicated package entries are `@johnmorrisdotca/kazu/regions`, `@johnmorrisdotca/kazu/regions/play`, and `@johnmorrisdotca/kazu/regions/draw`.

Each cell holds a number. All orthogonally connected cells with the same number form a region, and the region's area must equal that number. Two regions of the same area cannot touch. A completed region does not need to contain a printed clue; the checker and solver do not require one clue per region.

```ts
import { generateRegions, checkRegions, solveRegions } from "@johnmorrisdotca/kazu/regions";
import { mountRegions } from "@johnmorrisdotca/kazu/regions/play";

const puzzle = generateRegions(6, 6, "hard", 17);
const result = solveRegions(puzzle);
if (!result.complete || result.count !== 1) throw new Error("The answer was not proved unique");
checkRegions(puzzle, result.solution);
mountRegions(document.querySelector("#board"), { board: puzzle });
```

`RegionsBoard` contains `width`, `height`, and row-major `givens`, with zero for an empty cell. Engine validation and the seeded generator both support rectangular boards from 4 to 12 cells per side (`REGIONS_SIZES` lists the square sides on offer: 6, 8, 10, 12). A seed reproduces its puzzle. The levels are `easy`, `medium`, `hard` and `extra-hard` (`REGIONS_LEVELS`), and `rateRegions(board)` measures a board by solving it: `depth` (0 rules alone, 1 supposing one number, 2 more), `probes`, the givens and their share, the regions, how many have no given and how big they are. The generator cuts the board into connected regions with no two of one size touching, gives every square, and takes givens away while the board can still be solved the way the level asks. Search bounds report when counting stopped rather than treating a partial search as a uniqueness proof.

`checkRegions(board, entries)` checks givens, oversized connected groups and completion independently of the generated answer. An unfinished group smaller than its number can still grow. `solveRegions(board, entries?, { limit?, nodes? })` counts filled solutions by growing connected regions, including regions with no given. Only `complete && count === 1` proves uniqueness. `newRegions`, `setRegionsCell`, `undoRegions`, `restartRegions`, `hintRegions`, and `regionsFinished` are immutable game helpers. Progress codes contain public clues, entries, and the persistent assisted flag; they contain no stored answer.

The player accepts touch, mouse, and keyboard input, with undo, check, a proved hint, restart, and local progress codes. Hints persistently mark a run as assisted. The English and Japanese player uses the same board materials and number styles as Shikaku. The demo offers 4×4 through 12×12 settings at four levels. It is at [regions.html](https://johnmorrisdotca.github.io/kazu/regions.html).

Regions is also known as Fillomino, and [Nikoli's rules](https://www.nikoli.co.jp/en/puzzles/fillomino/) describe numbered connected regions, exact area, and separation between equal-area regions. This implementation generates original puzzles and does not reuse published grids or artwork.

## Levels of the grid puzzles

Shikaku, Akari, Loop, Hitori, Regions and Cross Sums make boards at `easy`, `medium`, `hard` and `extra-hard`. Every board has exactly one answer, and a level says what a person has to do to solve it, measured by solving the board with the package's own rules: easy and medium need only the rules (easy keeps more numbers, medium as few as the rules allow), hard needs supposing something and watching it break, and extra-hard needs the most of that. `rateShikaku`, `rateAkari`, `rateLoop`, `rateHitori`, `rateRegions` and `rateCrossSums` return the measure of a board (`depth`, `probes` and what it is made of), so a site can show it or pick boards by it.

| Kind | Call | Sizes on offer | Largest size, extra-hard: median / slowest to make |
| --- | --- | --- | --- |
| Shikaku | `generateShikaku(width, height, level, seed)` | 5, 7, 10, 14 (any side 2–16) | 14 × 14: 89 ms / 302 ms |
| Akari | `generateAkari(width, height, seed, level?)` | 5, 7, 10, 14 (any side 2–16) | 14 × 14: 212 ms / 366 ms |
| Loop | `generateLoop(width, height, seed, level?)` | 5, 7, 10 (any side 2–10) | 10 × 10: 231 ms / 286 ms |
| Hitori | `generateHitori(size, seed, level?)` | 5, 6, 7, 8, 9, 10, 12 (any side 4–12) | 12 × 12: 157 ms / 511 ms |
| Regions | `generateRegions(width, height, level, seed)` | 6, 8, 10, 12 (any side 4–12) | 12 × 12: 187 ms / 422 ms |
| Cross Sums | `generateCrossSums(seed, level?, size?)` | 6, 8, 10, 12 (any side 5–12) | 12 × 12: 273 ms / 1,254 ms |

[docs/LEVELS.md](LEVELS.md) defines each level for each kind, defines the measure, and tables it by size and level over 200 seeds, with the median, 95th percentile and slowest time to make a board; `node scripts/measure-levels.mjs` makes the tables again. These are the same boards in every browser and every Node for a given kind, size, level and seed, but they are **not** the boards 1.2.0 made for that seed.

## Heyawake — rooms and white paths

The Heyawake demo supports rectangular room boards, black/white/blank marking, keyboard and touch play, undo, a contradiction check, unique-solution hints, restart, local progress, and English/Japanese labels. Use `@johnmorrisdotca/kazu/heyawake`, `@johnmorrisdotca/kazu/heyawake/play`, or `@johnmorrisdotca/kazu/heyawake/draw`; generated answers are never included in progress data.

```js
import { generateHeyawake, checkHeyawake, solveHeyawake } from "@johnmorrisdotca/kazu/heyawake";

const puzzle = generateHeyawake(5, 4, "easy", 17);
checkHeyawake(puzzle, puzzle.solution); // checks room counts and all three global rules
solveHeyawake(puzzle); // { count: 1, complete: true, ... }
```

The engine accepts boards up to 12×12. The original seeded generator supports rectangles from 4 to 8 cells per side, capped at 25 total cells to keep uniqueness proofs bounded. Its easy, medium and hard profiles start with different room-clue densities, then retain more room clues and may split rooms more finely when needed for a uniqueness proof. These are clue profiles, not measured human difficulty. See [the Heyawake rules and API guide](HEYAWAKE.md).

[Nikoli's Heyawake rules](https://www.nikoli.co.jp/en/puzzles/heyawake/) describe numbered room counts, non-touching black cells, connected whites, and a maximum of two rooms in a straight uninterrupted white run. The package generates original grids and uses no published puzzle boards or artwork.

## Hitori

Hitori is included as a small standalone rules engine, drawing and player. Its public board has a `size` from 4 to 12 (`HITORI_SIZES` lists those on offer: 5, 6, 7, 8, 9, 10, 12) and a flat row-major `numbers` array. A solution is a Boolean shade mask: `true` means black. The solver counts minimal shade patterns, excluding redundant extra black cells; `complete: true` means the search finished, while a node-budget stop never claims uniqueness. `generateHitori(size, seed, level?)` makes `easy`, `medium`, `hard` or `extra-hard` (`HITORI_LEVELS`) puzzles: a random set of shaded squares that never touch and leave the rest in one piece, white squares numbered from a random Latin square so nothing repeats among them, and every shaded square numbered like a white one in its row or column, repaired until the answer is single. Easy is solved by the duplicates, pairs and sandwiches alone, medium once the whites must stay connected, hard by supposing, extra-hard needs the most supposing of several boards. The generator returns only puzzles proved to have one minimal answer, and `rateHitori(board)` measures a board by solving it: `depth`, `reach`, `probes` and how much is shaded and repeated.

```ts
import { generateHitori, checkHitori, solveHitori } from "@johnmorrisdotca/kazu/hitori";
import { drawHitori } from "@johnmorrisdotca/kazu/hitori/draw";
import { mountHitori } from "@johnmorrisdotca/kazu/hitori/play";

const puzzle = generateHitori(9, 42, "hard"); // size, seed, level ("medium" if left out)
checkHitori(puzzle, puzzle.solution); // { ok: true, errors: [] }
solveHitori(puzzle);                 // count: 1, complete: true
```

`newHitori`, `shadeHitori`, `undoHitori`, `hintHitori`, `encodeHitori` and `decodeHitori` keep play state immutable and progress codes free of the answer. Hints are assistance and set `helped`; generated answers are never put into the player state. The demo is `site/hitori.html` after `pnpm site`, and stores progress in this browser only. The implementation follows [Nikoli's Hitori rules](https://www.nikoli.co.jp/en/puzzles/hitori/) and makes its own boards.

Use `@johnmorrisdotca/kazu/hitori`, `@johnmorrisdotca/kazu/hitori/play`, or `@johnmorrisdotca/kazu/hitori/draw`.

## Nurikabe

Nurikabe is available through its own rules, drawing and player entries. This compact edition makes original 5×5 puzzles from seeded symmetric layouts; it returns a puzzle only after the bounded solver proves exactly one solution. The supported board size is intentionally limited to 5×5 so generation remains quick and dependable.

```ts
import { generateNurikabe, checkNurikabe, solveNurikabe } from "@johnmorrisdotca/kazu/nurikabe";
import { drawNurikabe } from "@johnmorrisdotca/kazu/nurikabe/draw";
import { mountNurikabe } from "@johnmorrisdotca/kazu/nurikabe/play";

const puzzle = generateNurikabe(42);
checkNurikabe(puzzle, puzzle.solution); // { ok: true, errors: [] }
solveNurikabe(puzzle);                 // count: 1, complete: true
```

A clue gives the exact size of its white island; each island has one clue, the remaining black sea is connected, and no 2×2 square is entirely black. `newNurikabe`, `markNurikabeSea`, `undoNurikabe`, `hintNurikabe`, `encodeNurikabe` and `decodeNurikabe` keep the player's state separate from the answer. The demo stores progress locally. The implementation follows [Nikoli's Nurikabe rules](https://www.nikoli.co.jp/en/puzzles/nurikabe/) and uses its own puzzle layouts.

Use `@johnmorrisdotca/kazu/nurikabe`, `@johnmorrisdotca/kazu/nurikabe/play`, or `@johnmorrisdotca/kazu/nurikabe/draw`.
