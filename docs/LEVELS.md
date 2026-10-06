# Levels of the grid puzzles

Shikaku, Akari, Loop, Hitori, Regions and Cross Sums each make boards at four levels, `easy`, `medium`, `hard` and
`extra-hard`. A level is not a promise about how many numbers a board has: it says what a person has to do to solve it,
and it is measured by solving the board, never guessed from how it was made. This page says what each level means for
each kind, defines the numbers the `rate*` functions report, and tables them by size and level, with the time each
generator takes.

Every board in every table has exactly one answer, proved by the package's own solver (`solve*` returns `count: 1,
complete: true`). Nothing here is a human difficulty rating; it is how deep the package's own reasoning has to go.

## How a board is rated

`rateShikaku`, `rateAkari`, `rateLoop`, `rateHitori`, `rateRegions` and `rateCrossSums` solve a board with one
answer the way a person works, never by guessing a value and keeping it:

1. **The rules alone** (`depth` 0). Each kind has a few rules that follow from its definition, listed below. They are
   applied over and over until nothing more follows.
2. **Supposing one thing** (`depth` 1). Suppose a square, edge or rectangle is one way, apply the rules, and when that
   breaks a rule the opposite is certain. `probes` counts the suppositions that broke a rule: how much trial and error the
   board asks of a person.
3. **More than that** (`depth` 2). Supposing once is not enough; the answer is still single but needs a supposition inside a supposition, or a search.

A level is the lowest depth, and the extra rules, a board needs: easy and medium need the rules alone, hard needs
supposing one thing, and extra-hard needs the most of that. The generators check a board against its level by solving
it, and keep making boards until one fits; the tests (`src/levels.test.ts`) and `node scripts/measure-levels.mjs` hold
that. On the 20,800 boards of the tables below (every kind, size and level, seeds 1 to 200), none was off its level.

## What each level means, by kind

**Shikaku** has three rules: (1) a number with only one rectangle that fits is settled, and a settled rectangle clears
its squares for the others; (2) a square only one rectangle can still cover is covered by it; (3) a square only one number
can still reach makes that number's rectangle cover it. Rectangles are packed into the board so that they interlock (a pinwheel is
possible), not cut by straight lines.

| level | the board needs | made from |
| --- | --- | --- |
| easy | rules 1 and 2 | rectangles of 2 to 6 squares; each number sits where it has the fewest places to go |
| medium | rule 3 as well, no supposing | rectangles of 3 to 12; numbers anywhere in them |
| hard | supposing one rectangle | rectangles of 3 to 9 |
| extra-hard | supposing, the most suppositions of three boards | rectangles of 4 to 9 |

**Akari** has three rules: a bulb shades every other square in its row and column up to a black square; a numbered black
square touches exactly that many bulbs; every white square needs a bulb that lights it. A board starts with a random
black wall (a fifth to a quarter of the squares, rising with the level, half of them in rotating pairs), random bulbs that light it,
and a number on every black square that touches a white one; numbers are then taken away while the level still holds.

| level | the board needs | numbers |
| --- | --- | --- |
| easy | the rules alone | at least 70% of the numbers it started with are kept |
| medium | the rules alone | as few as the rules allow |
| hard | supposing one square | as few as that allows |
| extra-hard | supposing, the most suppositions of eight boards | as few as that allows |

**Loop** has these rules: every corner has no edge or two; a number is how many of its square's four edges are in
the loop; the loop is one piece and may not close before everything drawn is part of it, nor while a number is unmet; and everything drawn must still be able to
join up. A board starts as a random winding loop (a connected region of squares with no hole, whose outline never touches itself) that covers a half
of the squares, every square is numbered with the edges it has in the loop, and numbers are taken away, the 0s first.

| level | the board needs | numbers |
| --- | --- | --- |
| easy | the rules alone | at least 70% of the squares keep a number |
| medium | the rules alone | as few as the rules allow (about half of the squares) |
| hard | supposing one edge | taken away while one supposition still solves it, for up to 120 rule runs a square |
| extra-hard | supposing one edge, more of it | the same with 420 rule runs a square, so it ends sparser and needs more suppositions |

**Hitori** has these rules: no number repeats among the unshaded squares of a row or column; shaded squares never touch
on a side; the unshaded squares are one piece; and a square is shaded only to settle a duplicate. The rules alone (`reach`
false) are the duplicates, the ban on touching shades, a pair of equal numbers (the others of that number in the line are shaded) and
a sandwich (a square between two equal numbers is white); `reach` adds that the white squares must stay in one piece (a square
whose shading would cut them in two stays white). About a quarter of the squares are shaded, and the white squares are numbered from a random Latin square.

| level | the board needs |
| --- | --- |
| easy | the plain rules alone |
| medium | the rules, and that the white squares stay in one piece |
| hard | supposing one square |
| extra-hard | supposing, the most suppositions of four boards |

**Regions** has these rules: a finished group of equal numbers keeps its neighbours off that number; a group still
short of its size must be able to grow, to squares that can still be that number, and takes exactly the room it has; and a square can only be a
number if the squares that can still be it, joined up, make a group that big. Boards are cut into connected regions with no two of one size touching.

| level | the board needs | regions | givens |
| --- | --- | --- | --- |
| easy | the rules alone | 1 to 4 squares | half of the squares |
| medium | the rules alone | 1 to 6 | as few as the rules allow |
| hard | supposing one number | 2 to 8 | a few fewer than that |
| extra-hard | supposing; more of it | 2 to 9 | fewer still, while one answer remains within a short search |

No stretch of squares with no given is longer than 12 (or than the biggest region, if that is more), so a proof never has to allow for a giant blank region.

**Cross Sums** has these rules: a run's digits are different and add to its total, so a square can only be a digit that some set of digits making
the total can still use; a digit already settled in a run leaves its other squares; and (when `plain` is false) a digit that every
remaining set uses must go somewhere, so a square that is the only one to hold it takes it. Boards are laid out row by row so that
no run is a single square or longer than the level allows, and every board is one connected piece.

| level | the board needs | longest run | black squares |
| --- | --- | --- | --- |
| easy | the single-run rules (`plain`) | 4 | about a third; digits chosen so that many totals can be made one way only |
| medium | the digit-that-must-appear rule too | 5 | the same |
| hard | supposing one digit | 7 | a quarter |
| extra-hard | supposing, the most suppositions of three boards | 9 | a fifth |

## What the columns mean

- **made**: boards made, of the seeds tried; every one has one answer.
- **median, p95, slowest ms**: time to make a board in Node 24 on a laptop, over seeds 1 to 200. See below.
- **depth 0 / 1 / 2**: how many of the boards were solved by the rules alone, by supposing once, or needed more.
- **probes**: mean suppositions that broke a rule at depth 1 (0 for a board the rules solve).
- Shikaku: **rules** is the highest of the three rules a depth-0 solve needed (a mean, 3 when every board needs the third); **rectangles**, **meanArea**, **largest** are their count and areas; **ambiguity** is the mean number of rectangles a number could be at the start.
- Akari: **clues** is the numbered black squares, **clueShare** their share of the black squares that touch a white one, **openShare** the white squares' share of the board, **bulbs** the bulbs in the answer.
- Loop: **clues** and **clueShare** are the numbered squares and their share of all squares; **zeroShare** is how many numbered squares say 0; **loop** is the loop's length in edges.
- Hitori: **reach** is the share of boards that needed the white squares to stay in one piece; **shaded**, **shadedShare** and **repeatShare** are the shaded squares, their share, and the share of squares whose number repeats in their row or column.
- Regions: **givens**, **givenShare**; **regions**; **unnamed** is regions with no given; **largest** and **meanRegion** are their sizes.
- Cross Sums: **plain** is the share of boards the single-run rules solved; **whites**, **runs**, **longest** and **meanRun** describe the runs; **fixedShare** is the share of runs whose total can be made one way only.

## Times

Times are for one `generate*` call in Node 24 on an Apple-silicon laptop that was busy with other work (a load average of about 13 on 20 cores), so a quiet machine is faster. A browser runs the same code at much the same speed on a desk
and slower on a phone. The generators work in rule runs and attempts, never in time, so a seed makes the same board on every machine; the demo makes Shikaku and Regions in a worker. On the largest size of
each kind, at extra-hard (the slowest level), over 200 seeds:

| kind | size | median ms | p95 ms | slowest ms |
| --- | --- | --- | --- | --- |
| Shikaku | 14 | 89 | 256 | 302 |
| Akari | 14 | 212 | 286 | 362 |
| Loop | 10 | 231 | 259 | 286 |
| Hitori | 12 | 157 | 311 | 511 |
| Regions | 12 | 187 | 273 | 422 |
| Cross Sums | 12 | 273 | 665 | 1254 |

If a generator cannot make a board of the level within its attempts it makes the next level down, and in the end a plain one; no seed of these tables did.

## The tables

Made again with `pnpm build && node scripts/measure-levels.mjs <kind> 200`, on 2026-10-05.

### Shikaku

| size | level | made | median ms | p95 ms | slowest ms | depth 0 / 1 / 2 | rules | probes | rectangles | meanArea | largest | ambiguity |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | easy | 200/200 | 0 | 1 | 5 | 200 / 0 / 0 | 1.23 | 0 | 7.27 | 3.53 | 5.58 | 2.18 |
| 5 | medium | 200/200 | 2 | 12 | 19 | 200 / 0 / 0 | 3 | 0 | 5.70 | 4.51 | 6.82 | 3.06 |
| 5 | hard | 200/200 | 4 | 19 | 38 | 0 / 200 / 0 | 3 | 1.38 | 6.31 | 4.04 | 6.32 | 3.13 |
| 5 | extra-hard | 200/200 | 24 | 53 | 70 | 0 / 200 / 0 | 3 | 1.71 | 5.64 | 4.48 | 6.83 | 3.31 |
| 7 | easy | 200/200 | 0 | 3 | 6 | 200 / 0 / 0 | 1.49 | 0 | 13.81 | 3.58 | 5.88 | 2.67 |
| 7 | medium | 200/200 | 2 | 11 | 24 | 200 / 0 / 0 | 3 | 0 | 9.02 | 5.61 | 10.60 | 3.93 |
| 7 | hard | 200/200 | 4 | 18 | 40 | 0 / 200 / 0 | 3 | 1.47 | 10.84 | 4.58 | 7.94 | 3.78 |
| 7 | extra-hard | 200/200 | 17 | 36 | 82 | 0 / 200 / 0 | 3 | 2.65 | 9.54 | 5.20 | 7.97 | 4.40 |
| 10 | easy | 200/200 | 1 | 12 | 22 | 200 / 0 / 0 | 1.83 | 0 | 27.60 | 3.65 | 5.99 | 3.05 |
| 10 | medium | 200/200 | 3 | 10 | 24 | 200 / 0 / 0 | 3 | 0 | 17.66 | 5.74 | 11.20 | 4.76 |
| 10 | hard | 200/200 | 6 | 23 | 37 | 0 / 200 / 0 | 3 | 2.27 | 20.16 | 5.01 | 8.79 | 4.57 |
| 10 | extra-hard | 200/200 | 23 | 47 | 70 | 0 / 200 / 0 | 3 | 4.30 | 18.18 | 5.53 | 8.82 | 5.34 |
| 14 | easy | 200/200 | 19 | 108 | 229 | 200 / 0 / 0 | 2.00 | 0 | 53.16 | 3.70 | 6 | 3.50 |
| 14 | medium | 200/200 | 5 | 17 | 42 | 200 / 0 / 0 | 3 | 0 | 33.76 | 5.84 | 11.87 | 5.41 |
| 14 | hard | 200/200 | 14 | 110 | 173 | 0 / 200 / 0 | 3 | 2.44 | 38.62 | 5.10 | 8.95 | 5.12 |
| 14 | extra-hard | 200/200 | 89 | 256 | 302 | 0 / 200 / 0 | 3 | 6.33 | 34.95 | 5.62 | 8.96 | 6.12 |

### Akari

| size | level | made | median ms | p95 ms | slowest ms | depth 0 / 1 / 2 | probes | clues | clueShare | openShare | bulbs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | easy | 200/200 | 0 | 0 | 3 | 200 / 0 / 0 | 0 | 5.50 | 0.77 | 0.71 | 6.21 |
| 5 | medium | 200/200 | 0 | 0 | 0 | 200 / 0 / 0 | 0 | 3.60 | 0.50 | 0.69 | 6.14 |
| 5 | hard | 200/200 | 1 | 2 | 4 | 0 / 200 / 0 | 3.27 | 3.87 | 0.61 | 0.72 | 6.18 |
| 5 | extra-hard | 200/200 | 6 | 7 | 8 | 0 / 200 / 0 | 5.64 | 3.79 | 0.63 | 0.74 | 6.20 |
| 7 | easy | 200/200 | 0 | 1 | 1 | 200 / 0 / 0 | 0 | 9.96 | 0.74 | 0.72 | 10.36 |
| 7 | medium | 200/200 | 0 | 1 | 1 | 200 / 0 / 0 | 0 | 6.70 | 0.48 | 0.70 | 10.41 |
| 7 | hard | 200/200 | 2 | 5 | 8 | 0 / 200 / 0 | 4.93 | 7.07 | 0.54 | 0.72 | 10.47 |
| 7 | extra-hard | 200/200 | 14 | 20 | 24 | 0 / 200 / 0 | 8.24 | 7.23 | 0.58 | 0.73 | 10.48 |
| 10 | easy | 200/200 | 1 | 3 | 4 | 200 / 0 / 0 | 0 | 19.61 | 0.72 | 0.72 | 19.05 |
| 10 | medium | 200/200 | 1 | 2 | 5 | 200 / 0 / 0 | 0 | 12.65 | 0.45 | 0.71 | 19.07 |
| 10 | hard | 200/200 | 6 | 12 | 22 | 0 / 200 / 0 | 6.70 | 13.39 | 0.50 | 0.72 | 19.12 |
| 10 | extra-hard | 200/200 | 49 | 65 | 86 | 0 / 200 / 0 | 13.60 | 13.82 | 0.52 | 0.72 | 18.95 |
| 14 | easy | 200/200 | 9 | 10 | 12 | 200 / 0 / 0 | 0 | 41.31 | 0.71 | 0.70 | 35.63 |
| 14 | medium | 200/200 | 7 | 18 | 19 | 200 / 0 / 0 | 0 | 25.44 | 0.47 | 0.71 | 35.13 |
| 14 | hard | 200/200 | 33 | 72 | 113 | 0 / 200 / 0 | 12.88 | 24.57 | 0.45 | 0.71 | 35.16 |
| 14 | extra-hard | 200/200 | 212 | 286 | 362 | 0 / 200 / 0 | 22.46 | 25.62 | 0.48 | 0.72 | 34.91 |

### Loop

| size | level | made | median ms | p95 ms | slowest ms | depth 0 / 1 / 2 | probes | clues | clueShare | zeroShare | loop |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | easy | 200/200 | 0 | 1 | 7 | 200 / 0 / 0 | 0 | 18 | 0.72 | 0.09 | 22.64 |
| 5 | medium | 200/200 | 1 | 1 | 2 | 200 / 0 / 0 | 0 | 12.11 | 0.48 | 0.12 | 24.68 |
| 5 | hard | 200/200 | 3 | 7 | 12 | 0 / 200 / 0 | 7.13 | 9.70 | 0.39 | 0.08 | 26.31 |
| 5 | extra-hard | 200/200 | 3 | 7 | 11 | 0 / 200 / 0 | 7.22 | 9.88 | 0.40 | 0.08 | 27.94 |
| 7 | easy | 200/200 | 1 | 2 | 2 | 200 / 0 / 0 | 0 | 35 | 0.71 | 0.06 | 40.83 |
| 7 | medium | 200/200 | 3 | 3 | 4 | 200 / 0 / 0 | 0 | 23.57 | 0.48 | 0.07 | 44.30 |
| 7 | hard | 200/200 | 21 | 26 | 30 | 0 / 200 / 0 | 16.02 | 19.36 | 0.40 | 0.04 | 47.31 |
| 7 | extra-hard | 200/200 | 26 | 66 | 71 | 0 / 200 / 0 | 17.45 | 19.52 | 0.40 | 0.04 | 50.47 |
| 10 | easy | 200/200 | 6 | 7 | 8 | 200 / 0 / 0 | 0 | 70 | 0.70 | 0.04 | 78.15 |
| 10 | medium | 200/200 | 11 | 13 | 16 | 200 / 0 / 0 | 0 | 48.30 | 0.48 | 0.05 | 85.39 |
| 10 | hard | 200/200 | 79 | 93 | 112 | 0 / 200 / 0 | 31.40 | 44.02 | 0.44 | 0.02 | 92.53 |
| 10 | extra-hard | 200/200 | 231 | 259 | 286 | 0 / 200 / 0 | 38.88 | 42.05 | 0.42 | 0.02 | 97.66 |

### Hitori

| size | level | made | median ms | p95 ms | slowest ms | depth 0 / 1 / 2 | reach | probes | shaded | shadedShare | repeatShare |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | easy | 200/200 | 1 | 3 | 7 | 200 / 0 / 0 | 0 | 0 | 6.48 | 0.26 | 0.62 |
| 5 | medium | 200/200 | 1 | 3 | 5 | 200 / 0 / 0 | 1 | 0 | 6.65 | 0.27 | 0.65 |
| 5 | hard | 200/200 | 0 | 4 | 8 | 0 / 200 / 0 | 0 | 1.35 | 6.58 | 0.26 | 0.64 |
| 5 | extra-hard | 200/200 | 3 | 7 | 16 | 0 / 200 / 0 | 0 | 1.99 | 6.81 | 0.27 | 0.66 |
| 6 | easy | 200/200 | 1 | 5 | 12 | 200 / 0 / 0 | 0 | 0 | 9.43 | 0.26 | 0.63 |
| 6 | medium | 200/200 | 0 | 4 | 7 | 200 / 0 / 0 | 1 | 0 | 9.60 | 0.27 | 0.64 |
| 6 | hard | 200/200 | 1 | 6 | 12 | 0 / 200 / 0 | 0 | 1.34 | 9.69 | 0.27 | 0.64 |
| 6 | extra-hard | 200/200 | 6 | 12 | 20 | 0 / 200 / 0 | 0 | 1.96 | 10.01 | 0.28 | 0.65 |
| 7 | easy | 200/200 | 2 | 11 | 18 | 200 / 0 / 0 | 0 | 0 | 12.88 | 0.26 | 0.63 |
| 7 | medium | 200/200 | 1 | 4 | 8 | 200 / 0 / 0 | 1 | 0 | 13.15 | 0.27 | 0.64 |
| 7 | hard | 200/200 | 3 | 15 | 28 | 0 / 200 / 0 | 0 | 1.35 | 13.26 | 0.27 | 0.64 |
| 7 | extra-hard | 200/200 | 13 | 29 | 42 | 0 / 200 / 0 | 0 | 2.02 | 13.73 | 0.28 | 0.66 |
| 8 | easy | 200/200 | 5 | 24 | 50 | 200 / 0 / 0 | 0 | 0 | 16.88 | 0.26 | 0.62 |
| 8 | medium | 200/200 | 1 | 9 | 17 | 200 / 0 / 0 | 1 | 0 | 17.33 | 0.27 | 0.64 |
| 8 | hard | 200/200 | 6 | 23 | 45 | 0 / 200 / 0 | 0 | 1.26 | 17.52 | 0.27 | 0.64 |
| 8 | extra-hard | 200/200 | 22 | 47 | 62 | 0 / 200 / 0 | 0 | 1.82 | 18.01 | 0.28 | 0.65 |
| 9 | easy | 200/200 | 9 | 48 | 79 | 200 / 0 / 0 | 0 | 0 | 21.57 | 0.27 | 0.63 |
| 9 | medium | 200/200 | 2 | 10 | 24 | 200 / 0 / 0 | 1 | 0 | 22.09 | 0.27 | 0.64 |
| 9 | hard | 200/200 | 12 | 47 | 87 | 0 / 200 / 0 | 0 | 1.23 | 22.34 | 0.28 | 0.64 |
| 9 | extra-hard | 200/200 | 40 | 95 | 178 | 0 / 200 / 0 | 0 | 1.88 | 22.87 | 0.28 | 0.65 |
| 10 | easy | 200/200 | 26 | 95 | 236 | 200 / 0 / 0 | 0 | 0 | 26.47 | 0.26 | 0.62 |
| 10 | medium | 200/200 | 3 | 18 | 36 | 200 / 0 / 0 | 1 | 0 | 27.43 | 0.27 | 0.64 |
| 10 | hard | 200/200 | 17 | 72 | 126 | 0 / 200 / 0 | 0 | 1.28 | 27.59 | 0.28 | 0.64 |
| 10 | extra-hard | 200/200 | 64 | 142 | 263 | 0 / 200 / 0 | 0 | 1.59 | 28.41 | 0.28 | 0.66 |
| 12 | easy | 200/200 | 79 | 311 | 586 | 200 / 0 / 0 | 0 | 0 | 38.69 | 0.27 | 0.63 |
| 12 | medium | 200/200 | 8 | 39 | 68 | 200 / 0 / 0 | 1 | 0 | 39.66 | 0.28 | 0.64 |
| 12 | hard | 200/200 | 47 | 188 | 460 | 0 / 200 / 0 | 0 | 1.17 | 40.19 | 0.28 | 0.64 |
| 12 | extra-hard | 200/200 | 157 | 311 | 511 | 0 / 200 / 0 | 0 | 1.59 | 41.20 | 0.29 | 0.66 |

### Regions

| size | level | made | median ms | p95 ms | slowest ms | depth 0 / 1 / 2 | probes | givens | givenShare | regions | unnamed | largest | meanRegion |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 6 | easy | 200/200 | 1 | 1 | 5 | 200 / 0 / 0 | 0 | 18.05 | 0.50 | 14.79 | 1.66 | 4 | 2.45 |
| 6 | medium | 200/200 | 1 | 1 | 1 | 200 / 0 / 0 | 0 | 16.06 | 0.45 | 11.11 | 0.59 | 5.73 | 3.28 |
| 6 | hard | 200/200 | 8 | 22 | 33 | 0 / 200 / 0 | 24.92 | 13.90 | 0.39 | 8.02 | 0.04 | 7.33 | 4.54 |
| 6 | extra-hard | 200/200 | 9 | 22 | 36 | 0 / 194 / 6 | 28.33 | 13.44 | 0.37 | 6.93 | 0.02 | 8.32 | 5.28 |
| 8 | easy | 200/200 | 2 | 3 | 4 | 200 / 0 / 0 | 0 | 32.08 | 0.50 | 26.18 | 3.06 | 4 | 2.45 |
| 8 | medium | 200/200 | 2 | 3 | 3 | 200 / 0 / 0 | 0 | 29.16 | 0.46 | 19.43 | 0.96 | 5.96 | 3.31 |
| 8 | hard | 200/200 | 31 | 62 | 102 | 0 / 200 / 0 | 37.56 | 26.51 | 0.41 | 14.01 | 0.01 | 7.74 | 4.59 |
| 8 | extra-hard | 200/200 | 33 | 61 | 125 | 0 / 193 / 7 | 37.76 | 26.02 | 0.41 | 12.12 | 0.04 | 8.64 | 5.32 |
| 10 | easy | 200/200 | 6 | 9 | 11 | 200 / 0 / 0 | 0 | 50.07 | 0.50 | 40.84 | 4.90 | 4 | 2.45 |
| 10 | medium | 200/200 | 7 | 9 | 11 | 200 / 0 / 0 | 0 | 46.86 | 0.47 | 30.41 | 1.37 | 6 | 3.30 |
| 10 | hard | 200/200 | 90 | 287 | 429 | 0 / 200 / 0 | 44.82 | 43.66 | 0.44 | 21.46 | 0.04 | 7.96 | 4.67 |
| 10 | extra-hard | 200/200 | 111 | 330 | 612 | 0 / 192 / 8 | 52.52 | 42.87 | 0.43 | 18.55 | 0.01 | 8.87 | 5.42 |
| 12 | easy | 200/200 | 16 | 31 | 67 | 200 / 0 / 0 | 0 | 72.06 | 0.50 | 59.13 | 7.16 | 4 | 2.44 |
| 12 | medium | 200/200 | 16 | 21 | 24 | 200 / 0 / 0 | 0 | 68.28 | 0.47 | 43.99 | 2.19 | 6 | 3.28 |
| 12 | hard | 200/200 | 154 | 291 | 434 | 0 / 200 / 0 | 53.40 | 64.62 | 0.45 | 30.82 | 0.04 | 7.99 | 4.68 |
| 12 | extra-hard | 200/200 | 187 | 273 | 422 | 0 / 191 / 9 | 62.59 | 63.88 | 0.44 | 26.57 | 0.03 | 8.91 | 5.44 |

### Cross Sums

| size | level | made | median ms | p95 ms | slowest ms | depth 0 / 1 / 2 | plain | probes | whites | runs | longest | meanRun | fixedShare |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 6 | easy | 200/200 | 1 | 10 | 16 | 200 / 0 / 0 | 1 | 0 | 12.53 | 9.94 | 3.70 | 2.52 | 0.38 |
| 6 | medium | 200/200 | 7 | 28 | 38 | 200 / 0 / 0 | 0 | 0 | 16.01 | 11.59 | 4.82 | 2.76 | 0.32 |
| 6 | hard | 200/200 | 2 | 8 | 21 | 0 / 200 / 0 | 0 | 3.02 | 15.69 | 12.23 | 4.83 | 2.56 | 0.18 |
| 6 | extra-hard | 200/200 | 6 | 15 | 28 | 0 / 200 / 0 | 0 | 5.05 | 15.88 | 12.38 | 4.83 | 2.56 | 0.17 |
| 8 | easy | 200/200 | 2 | 11 | 23 | 200 / 0 / 0 | 1 | 0 | 27.47 | 20.97 | 3.99 | 2.62 | 0.42 |
| 8 | medium | 200/200 | 7 | 38 | 52 | 200 / 0 / 0 | 0 | 0 | 27.77 | 20.38 | 4.84 | 2.73 | 0.36 |
| 8 | hard | 200/200 | 3 | 12 | 28 | 0 / 200 / 0 | 0 | 7.18 | 30.98 | 23.22 | 6.42 | 2.67 | 0.19 |
| 8 | extra-hard | 200/200 | 12 | 29 | 133 | 0 / 200 / 0 | 0 | 13.58 | 31.73 | 23.38 | 6.54 | 2.72 | 0.18 |
| 10 | easy | 200/200 | 5 | 23 | 50 | 200 / 0 / 0 | 1 | 0 | 47.53 | 35.80 | 4 | 2.66 | 0.41 |
| 10 | medium | 200/200 | 12 | 70 | 143 | 200 / 0 / 0 | 0 | 0 | 50.49 | 36.58 | 4.99 | 2.76 | 0.34 |
| 10 | hard | 200/200 | 8 | 101 | 278 | 0 / 200 / 0 | 0 | 8.95 | 45.91 | 34.85 | 6.24 | 2.64 | 0.19 |
| 10 | extra-hard | 200/200 | 45 | 184 | 422 | 0 / 200 / 0 | 0 | 19.52 | 50.55 | 37.46 | 7.63 | 2.70 | 0.19 |
| 12 | easy | 200/200 | 10 | 43 | 99 | 200 / 0 / 0 | 1 | 0 | 70.31 | 52.64 | 4 | 2.67 | 0.42 |
| 12 | medium | 200/200 | 29 | 188 | 345 | 200 / 0 / 0 | 0 | 0 | 73.17 | 53.09 | 4.99 | 2.76 | 0.34 |
| 12 | hard | 200/200 | 76 | 420 | 714 | 0 / 200 / 0 | 0 | 17.09 | 72.92 | 54.94 | 6.61 | 2.66 | 0.18 |
| 12 | extra-hard | 200/200 | 273 | 665 | 1254 | 0 / 200 / 0 | 0 | 27.63 | 71.80 | 53.59 | 7.58 | 2.68 | 0.18 |
