<h1 align="center">Kazu <sub>数</sub></h1>

<p align="center"><strong>Grid number puzzles for JavaScript and TypeScript.</strong><br>
Sudoku (4×4 to a 16×16 Giant), Jigsaw, Diagonal and Killer Sudoku, Futoshiki and Skyscrapers. A seeded generator whose every puzzle has exactly one answer, at three levels; a solver that counts answers; a check that reads a finished grid in O(cells); a hint that says which cell to fill next and why; puzzles and runs as short codes; the grid drawn as SVG; and played by touch, mouse and keyboard in any page, with pencil marks, undo and a clock, as one call or one tag. No dependencies.</p>

<p align="center">
  <a href="https://github.com/johnmorrisdotca/kazu/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/johnmorrisdotca/kazu/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://www.npmjs.com/package/@johnmorrisdotca/kazu"><img alt="npm" src="https://img.shields.io/npm/v/@johnmorrisdotca/kazu?color=2f5d4a"></a>
  <a href="./LICENSE"><img alt="MIT licence" src="https://img.shields.io/badge/licence-MIT-2f5d4a"></a>
  <img alt="No dependencies" src="https://img.shields.io/badge/dependencies-0-2f5d4a">
</p>

<p align="center"><a href="https://johnmorrisdotca.github.io/kazu/"><strong>Play a puzzle →</strong></a> · <a href="https://johnmorrisdotca.github.io/kazu/api.html">API reference</a></p>

<p align="center">
  <img src="docs/desktop.jpg" alt="A 9×9 Killer Sudoku part filled in, under the demo's header with its language chooser and five cloth patches: the choices of puzzle, size and level, then the board on green felt with dashed cages and their sums, the chosen cell and its row, column and box washed in colour, the number pad and the Undo, Pencil, Hint and Check buttons" width="620">
  <img src="docs/phone.jpg" alt="A 6×6 Skyscrapers puzzle part filled in, on a phone in dark mode and in Japanese: the clues round the edge, the number pad, the buttons and the first of the settings under it" width="200">
</p>

Kazu is the family of grid puzzles Sudoku belongs to: fill every cell with a number, so that no number repeats where the rules say it must not. It is
played at [itsutsu.com](https://itsutsu.com), which this package was taken out of, and in
[the demo](https://johnmorrisdotca.github.io/kazu/), with nothing to install.

## In 30 seconds

```sh
npm install @johnmorrisdotca/kazu
```

```ts
import { checkKazu, countKazuSolutions, generateKazu, hintKazu } from "@johnmorrisdotca/kazu";

const puzzle = generateKazu("sum-cages", 9, "medium", 42);   // a Killer Sudoku: the same one in every browser, for ever
countKazuSolutions("sum-cages", 9, puzzle.givens);            // 1: exactly one answer
checkKazu("sum-cages", 9, puzzle.givens, puzzle.solution);    // { ok: true }, read in O(cells)

const sudoku = generateKazu("number-place", 9, "easy", 7);
hintKazu("number-place", 9, sudoku.givens, new Array(81).fill(0));
// { cell: 2, value: 8, why: "only-number", replaces: false }: which cell, what goes in it, and why
```

And in a page, a puzzle to play, by touch, mouse and keyboard, with nothing else to set up:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/kazu@1/dist/element-define.js"></script>
<kazu-board kind="number-place" size="9" level="medium" seed="7"></kazu-board>
```

## Who it is for

- **Puzzle sites and apps** that want these six puzzles with the rules already right: puzzles everybody
  plays alike from a seed, a check a server can trust in O(cells), a hint that is a reason and not just
  an answer, and runs kept as short strings.
- **Anyone making number puzzles of their own**, who wants a solver that counts answers, generators whose
  every puzzle has exactly one, and the layout of groups (rows, columns, boxes, regions, diagonals, cages)
  one solver reads for four of the six.
- **Pages that just want the grid**: it draws itself as SVG text, and plays itself in an element or one
  function call, with a number pad, pencil marks, Undo, Hint, Check and a clock, and its words in English and
  Japanese.

## The puzzles

A puzzle is a grid of `size × size` cells, a few printed numbers and whatever else the kind prints, and
exactly one answer. Every kind is named by a kebab-case key.

| Key | Called | In Japanese | Sizes | What it prints | What is new |
| --- | --- | --- | --- | --- | --- |
| `number-place` | Sudoku | ナンプレ | 4×4, 6×6, 9×9, 16×16 | numbers | every row, column and box holds each number once; the 16×16 Giant uses 1 to 9 and then A to G |
| `jigsaw` | Jigsaw Sudoku | 変形ナンプレ | 5×5, 6×6, 7×7, 9×9 | numbers, and the regions | the boxes are irregular regions, each joined and none a row or a column |
| `diagonal` | Diagonal Sudoku | 対角ナンプレ | 6×6, 9×9 | numbers | the two long diagonals hold each number once too |
| `sum-cages` | Killer Sudoku | サムナンプレ | 6×6, 9×9 | cages and their sums | next to no numbers: dashed cages each add to a sum, and repeat nothing |
| `more-or-less` | Futoshiki | 不等式 | 4×4, 5×5, 6×6, 7×7 | numbers, and more-than marks | rows and columns, and every mark between two cells must be true |
| `towers` | Skyscrapers | 摩天楼 | 4×4, 5×5, 6×6, 7×7 | numbers, and clues round the edge | a clue is how many towers show from there; a taller one hides those behind it |

Each is made at three levels, `easy`, `medium` and `hard`: what the solver needed, not how many numbers
are printed. Easy yields to singles alone (a cell with one number left, a number with one place left in a
group); medium needs one guess; hard whatever it takes. Sum Cages' levels are the size of its cages, and
fewer of them.

*Sudoku* 数独 is Nikoli's mark in Japan, so its Japanese name here is ナンプレ (Number Place, the puzzle's
own original name and the word Japanese publishers use); the English names are the ones players search
for. `KAZU_NAMES` has each puzzle's names, its rules in English and Japanese, and where it comes from.

## Making, solving and checking

```ts
import { checkKazu, generateKazu, solveKazu, countKazuSolutions, kazuGuessDepth, readGivens } from "@johnmorrisdotca/kazu";

const { kind, size, level, seed, givens, solution } = generateKazu("towers", 6, "hard", 1234);
solveKazu("towers", 6, givens) === solution;        // the one answer, worked out from the givens alone
countKazuSolutions("towers", 6, givens);              // 1 (up to a limit, two by default); null for givens that are not a puzzle
kazuGuessDepth("towers", 6, givens);                  // how many guesses a person needs: 0 easy, 1 medium, more hard
readGivens("towers", 6, givens);                      // { cells, clues, … }: what the puzzle was printed with
```

The same kind, size, level and seed make the same puzzle in every browser and every Node, for ever
(`seededRandom` is mulberry32). That is the promise itsutsu.com's kept runs and solves are built on, and
it is held by a test: `src/site.fixture.json` is 3,600 puzzles the site made before the move, every kind at
every size and level from sixty seeds, and each is made again here, givens and solution, byte for byte.
Changing how any puzzle is made is a new major version, never a fix.

`checkKazu(kind, size, givens, answer)` reads a finished grid in O(cells), with no search: right in every group,
every given where it was, every cage, mark and clue true. `{ ok: false, reason }` says the first thing
wrong (`"row 3 repeats a number"`, `"cage 4 does not add to 17"`, `"the top clue 3 sees 2"`), in the words the site
has always used. It restates the rules rather than reading the solver's mind, so a server can trust it.
A solver and a generator never run on a server unless you ask them to.

A run is kept as short strings the site's own stored runs decode as they are: `encodeRun(entries)` and
`decodeRun(code, size)` (one character a cell, `.` for empty, A to G past nine), `encodeSteps` and
`decodeSteps` for a step log, `kazuHash(givens)` for a fingerprint of a puzzle, and `encodeNotes` and
`decodeNotes` for Kazu's own pencil marks.

### A hint

```ts
import { hintKazu } from "@johnmorrisdotca/kazu";

hintKazu("number-place", 9, givens, entries);
// for example { cell: 25, value: 7, why: "only-place", group: { type: "row", index: 2 }, replaces: false }
```

It reasons from what is right on the grid so far (a wrong entry is treated as empty, so it never builds on a
mistake), one step at a time, as a person does: a cell only one number fits (`only-number`, and `by` says
whether a cage's sum, a Futoshiki mark or a Skyscrapers clue did part of the ruling out), or a number with
only one place left in a row, column, box, region or diagonal (`only-place`). When nothing follows by a single
step, which a hard puzzle asks for, it says so (`answer`). `mountKazu` puts the reason into words.

## Drawing a puzzle

```ts
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

## Playing it in a page

```ts
import { mountKazu } from "@johnmorrisdotca/kazu/play";

const board = mountKazu(document.getElementById("here")!, {
  kind: "towers", size: 6, givens, solution, level: "hard", seed: 1234,
  hints: "show", check: "count",
  onChange: ({ run, notes, elapsedMs }) => keep(run, notes, elapsedMs),   // to carry on a puzzle half done
  onSolve: ({ answer, elapsedMs, helped }) => send(answer, elapsedMs, helped),   // `answer` is what checkKazu takes
});
board?.undo(); board?.hint(); board?.load({ kind: "diagonal", size: 9, givens: other });
```

Tap a cell and tap a number on the pad (or type it); tap the chosen cell again to step its number on, 1, 2, 3
… and round to empty. Turn **Pencil** on and the pad writes small notes instead, and a number written takes itself
out of the notes of the cells it shares a group with. **Undo** takes the last change back, **Hint** says which
cell to fill next and why, **Check** says how many cells are wrong, never which. A clock starts on the first entry
and stops when the last cell is right, and waits while the page is hidden.

The keys: the arrows move, a number (1 to 9, and A to G on the 16×16) fills the chosen cell, Shift with a
number writes it as a pencil mark, Backspace empties the cell, N turns Pencil on or off, Ctrl or Cmd with Z
undoes, Escape lets the cell go. The board's box keeps one steady square, and the lines of words under it keep
the room their longest wording takes, so nothing moves as numbers are written or messages come and go. Nothing
the player touches can be selected. Its words are English and Japanese and follow the page's `lang`.

| Option | What it does |
| --- | --- |
| `kind`, `size`, `givens`, `solution` | the puzzle; `solution` is worked out when Hint or Check needs it if you leave it out |
| `level`, `seed` | carried in the events, to say which puzzle it was |
| `run`, `notes`, `elapsed` | a run kept half done (`decodeRun`'s code), its pencil marks, and the milliseconds already on the clock |
| `hints` | `place` (default) writes the number it found, `show` only points at the cell and says why, `off` takes the button away |
| `check` | `count` (default) says how many are wrong, `show` marks them too, `off` takes the button away |
| `conflicts`, `peers`, `tidy`, `tapToStep` | each on by default: cells that break a rule in red, the chosen cell's lines washed, a written number rubbed out of the notes beside it, a tap on the chosen cell stepping it on |
| `clock`, `controls` | the clock (default on); the number pad and buttons (default on) |
| `language` | `en` or `ja`; left out, the host's `lang` or the page's, and it follows the page's |
| `onChange`, `onHint`, `onCheck`, `onSolve` | callbacks, and the same four as DOM events on the host: `kazu-change`, `kazu-hint`, `kazu-check`, `kazu-solve`. Each `detail` has `run`, `notes`, `answer`, `progress`, `elapsedMs`, `hints`, `checks`, `helped` and `solved` |

Everything a button does is also a method on the handle (`undo`, `hint`, `check`, `restart`, `pencil`, `select`,
`enter`, `load`, `set`, `destroy`). The rules it plays by are `game.ts`'s, which are pure and need no page
(`newKazuGame`, `enterNumber`, `toggleNote`, `undoKazu`, `isSolved`), so a server can replay a game.

### The element

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/kazu@1/dist/element-define.js"></script>
<kazu-board kind="sum-cages" size="9" level="medium" seed="42"></kazu-board>
<kazu-board kind="towers" size="5" givens="…" solution="…" hints="show" lang="ja"></kazu-board>
```

Or `import "@johnmorrisdotca/kazu/element/define"` in a bundle. Attributes, each read again when it changes:
`kind` (the key of one of the six), `size`, `level` (`easy`, `medium` or `hard`) and `seed` (a new one if left out): the
puzzle is made in the page; or `size` with `givens` and `solution`, a puzzle of your own; `run`, `notes` and
`elapsed`, to carry on a puzzle half done; `hints` (`place`, `show`, `off`); `check` (`count`, `show`, `off`);
`conflicts`, `peers`, `tidy`, `tap-to-step`, `clock` and `controls`, each on unless set to `off`; and `lang`. It
fires the four events above and has the methods `undo()`, `hint()`, `check()`, `restart()`, `pencil()` and
`select()`. Importing either entry on a server is safe.

| Import | What it holds |
| --- | --- |
| `@johnmorrisdotca/kazu` | the generator, the solver, the check, the hint, the codes, and the game in play as pure functions: everything but the drawing and the page |
| `@johnmorrisdotca/kazu/draw` | `drawKazu` and the rest of the drawing as SVG text, its style, where everything sits in it, the words and the names; no page needed |
| `@johnmorrisdotca/kazu/play` | `mountKazu`: a puzzle played in any element by touch, mouse and keyboard, with its pad, buttons, clock, words and events |
| `@johnmorrisdotca/kazu/element` | the `KazuBoard` class behind `<kazu-board>`, to extend or to define under another name |
| `@johnmorrisdotca/kazu/element/define` | defines `<kazu-board>` on the page, for its effect |

## API

The [API reference](https://johnmorrisdotca.github.io/kazu/api.html) lists every export of every entry point with its signature and its doc comment. It is made from the source by `pnpm site`, so it cannot fall behind the code.

| Export | What it does |
| --- | --- |
| `generateKazu(kind, size, level, seed)` | a puzzle: `{ kind, size, level, seed, givens, solution }`; throws a RangeError for what it does not make |
| `generateNumberPlace`, `generateJigsaw`, `generateDiagonal`, `generateSumCages`, `generateMoreOrLess`, `generateTowers` | each puzzle's own generator |
| `solveKazu`, `countKazuSolutions`, `kazuGuessDepth` | the one answer, how many answers (up to a limit and a budget; null when it cannot say), and how many guesses a person needs |
| `checkKazu(kind, size, givens, answer)`, `isKazuGivens` | whether a finished grid is right, in O(cells), and whether givens are a well-formed puzzle |
| `hintKazu(kind, size, givens, entries)` | the next cell a person could fill in, and why |
| `conflictsOf(givens, values)` | the cells that break a rule right now, from the rules alone |
| `readGivens(kind, size, code)` | what a puzzle was printed with: cells, regions, cages, marks or clues; null for a code that is not a puzzle |
| `encodeCells`, `decodeCells`, `symbolOf`, `valueOfSymbol`, `stepEntry`, `kazuHash` | a grid as a string, one character a cell |
| `encodeJigsaw`, `encodeKiller`, `encodeMoreOrLess`, `encodeTowers` and their `decode…` | each kind's givens code |
| `encodeRun`, `decodeRun`, `encodeNotes`, `decodeNotes`, `encodeSteps`, `decodeSteps` | a puzzle half done, its pencil marks and its steps |
| `newKazuGame`, `enterNumber`, `toggleNote`, `clearCell`, `undoKazu`, `restartKazu`, `isSolved`, `kazuProgress`, `answerOf`, `valuesOf`, `numberCounts`, `gameConflicts` | a game in play as pure functions; each returns a new game |
| `boxedLayout`, `regionsAreSound`, `cageOutline`, `lineFrom`, `towersSeen`, `cluesOf` | the groups a puzzle is made of, a cage's outline, and what a clue sees |
| `seededRandom(seed)`, `freshKazuSeed`, `isKazuSeed` | the mulberry32 stream every puzzle is made from, and seeds |
| `KAZU_KINDS`, `KAZU_LEVELS`, `KAZU_SPECS`, `KAZU_KIND_OF_SITE_KIND` | the six keys, the three levels, what each offers, and the names itsutsu.com's code used |
| `KAZU_NAMES`, `KAZU_SIZE_NAMES`, `KAZU_STRINGS`, `kazuSay` | names, rules and words in English and Japanese |

Every function is pure: it returns new values and never changes what it was given.

## Architecture

The generators, the solvers, the check, the hint and the game are plain functions over short codes, with no
DOM. The drawing is SVG text in an entry of its own, so a server that only checks an answer never loads it, and
the page's part (the mount and the element) is another.

```text
src/
├── index.ts            the main entry: everything but the drawing and the page
├── kinds.ts            the six puzzles' keys, sizes and levels, and the shape of a puzzle
├── random.ts           the seeded random numbers every puzzle is made from
├── cells.ts            a grid of numbers as a string, 1 to 9 and A to G
├── layout.ts           the groups that must each hold every number once: rows, columns, boxes, regions, diagonals, cages
├── groupSolve.ts       the solver for puzzles made of groups: counting, singles, depth
├── numberPlace.ts      Sudoku and Diagonal Sudoku: the generator and how givens are carved
├── jigsaw.ts           Jigsaw Sudoku: irregular regions, their code and the generator
├── sumCages.ts         Killer Sudoku: cages grown by joining, their code and outline
├── moreOrLess.ts       Futoshiki: the Latin square, the marks and the generator
├── moreOrLessCode.ts   Futoshiki's givens as a string
├── moreOrLessSolve.ts  Futoshiki's solver
├── towers.ts           Skyscrapers: the generator
├── towersCode.ts       Skyscrapers' givens as a string, and what a clue sees
├── towersSolve.ts      Skyscrapers' solver
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
├── playStyle.ts        the style of a playable board: its box, pad, buttons and words
├── mount.ts            mountKazu: draws a puzzle into an element and plays it
├── play-entry.ts       the "/play" entry
├── element.ts          the "/element" entry: the <kazu-board> class
├── element-define.ts   the "/element/define" entry: defines the tag on the page
└── version.ts          the package's version
```

Tests sit beside the code they test (`*.test.ts`). `src/site.fixture.json` is what itsutsu.com made before the move,
and six `site.<puzzle>.test.ts` files make it all again. `scripts/` builds the demo and its API reference page, takes the
README's pictures and checks the package as npm packs it; `demo/` is the playable page, and `e2e/` its browser tests.

## The name

*Kazu* (数) is Japanese for "number": the everyday word for a number or an amount, read かず, as in 数を数える
(*kazu o kazoeru*), to count numbers; its other reading, すう (*sū*), is the one used in mathematics, and 数える
(*kazoeru*), to count, is the verb that goes with it. It is said in two beats, *ka-zu*. In every puzzle here a
number is what you write in each cell. ([Wiktionary: 数](https://en.wiktionary.org/wiki/数), which gives かず as
"number; amount" and かぞえる as "to count".)

## Where it comes from, and where it is used

Kazu was built for [Itsutsu](https://itsutsu.com), a site for board games, puzzles, card games and dice games
played at your own pace. *Itsutsu* (五つ) is Japanese for "five", after five in a row, the game the site began
with. The site's Numbers family of six puzzles was made there, one by one, each from its own solver and generator
and each checked on a server in O(cells); once they all stood alone it seemed worth sharing them.

### Used by

- [Itsutsu](https://itsutsu.com), for its Numbers puzzles: Sudoku, Jigsaw Sudoku, Diagonal Sudoku, Killer Sudoku, Futoshiki and Skyscrapers.

### The family

Kazu has siblings, each made for the same site, each MIT, each at
[github.com/johnmorrisdotca](https://github.com/johnmorrisdotca): Korokoro (dice), Kyuubu (a cube), Hitotsu
(a colour-card game), Toranpu (card games), Tane (seeded random numbers), Narabe (abstract board games), Tenka
(world conquest), Kumimoji (a crossword tile race), Tsunagi (a line-joining puzzle), Jarajara (mahjong tiles),
Suido (a pipe puzzle), Domino (dominoes) and Kotoba (words).

## Development

```sh
pnpm install
pnpm check          # lint, types and every test, every puzzle the site made made again
pnpm test:package   # pack, install and import it as somebody who installed it would
pnpm test:demo      # build the demo and play it in a real browser, at a phone's width and a desk's
pnpm site           # build the demo into site/, as the Pages workflow publishes it
pnpm pictures       # take the README's two pictures from the built demo
```

## Licence

MIT, © John Morris. The puzzles are made in code and the drawing is SVG; there is no sound and no data file but the record of what the site made.
