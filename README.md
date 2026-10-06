<h1 align="center">Kazu <sub>数</sub></h1>

<p align="center"><strong>Grid number and logic puzzles for JavaScript and TypeScript.</strong><br>
Sudoku (4×4 to a 25×25 Colossus), Jigsaw, Diagonal and Killer Sudoku, Futoshiki, Skyscrapers, Shikaku, Hitori, Nurikabe, Akari, Juosan, Loop, Masyu, Yajilin, Ripple Effect, Cross Sums, Regions and Heyawake. Dedicated typed engines, independently checked puzzles, SVG drawing, saved progress, and English and Japanese players for touch, mouse and keyboard. No runtime dependencies.</p>

<p align="center">
  <a href="https://github.com/johnmorrisdotca/kazu/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/johnmorrisdotca/kazu/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://www.npmjs.com/package/@johnmorrisdotca/kazu"><img alt="npm" src="https://img.shields.io/npm/v/@johnmorrisdotca/kazu?color=2f5d4a"></a>
  <a href="./LICENSE"><img alt="MIT licence" src="https://img.shields.io/badge/licence-MIT-2f5d4a"></a>
  <img alt="No dependencies" src="https://img.shields.io/badge/dependencies-0-2f5d4a">
  <img alt="TypeScript" src="https://img.shields.io/badge/types-TypeScript-3178c6">
</p>

<p align="center"><a href="https://johnmorrisdotca.github.io/kazu/"><strong>Play a puzzle →</strong></a> · <a href="https://johnmorrisdotca.github.io/kazu/api.html">API reference</a></p>

<table align="center">
<tr>
<td align="center" valign="top">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/hero-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/hero-desk-light.webp" alt="The demo on a desk, in English, with a 9×9 Killer Sudoku part filled in: the page header with the language chooser, the API reference link, five cloth patches and the Help switch, the choices of puzzle, size and level, then the board on green felt with dashed cages and their sums, the chosen cell and its row, column and box washed in colour, the number pad and the Undo, Pencil, Hint and Check buttons" width="600">
</picture>
<br><em>The demo on a desk: a Killer Sudoku part filled in.</em>
</td>
<td align="center" valign="top">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/hero-phone-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/hero-phone-light.webp" alt="The demo on a phone, in Japanese: a 6×6 Skyscrapers puzzle part filled in, with the clues round the edge, the number pad from 1 to 6, the buttons 元に戻す, メモ, ヒント and 確かめる, and the line マスをタップして、数字を選びます, then the first of the settings under it" width="190">
</picture>
<br><em>On a phone, in Japanese, in the device's light or dark.</em>
</td>
</tr>
</table>

Kazu is a family of grid puzzles: number placement, regions, shading, lights and loops. Each puzzle has its own rules and engine. The original number puzzles are
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
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/kazu@2/dist/element-define.js"></script>
<kazu-board kind="number-place" size="9" level="medium" seed="7"></kazu-board>
```
## Who it is for

- **Puzzle sites and apps** that want these number puzzles with the rules already right: puzzles everybody
  plays alike from a seed, a check a server can trust in O(cells), a hint that is a reason and not just
  an answer, and runs kept as short strings.
- **Anyone making number puzzles of their own**, who wants a solver that counts answers, generators whose
  every puzzle has exactly one, and the layout of groups (rows, columns, boxes, regions, diagonals, cages)
  one solver reads for four of the six.
- **Pages that just want the grid**: it draws itself as SVG text, and plays itself in an element or one
  function call, with a number pad, pencil marks, Undo, Hint, Check and a clock, and its words in English and
  Japanese.
## Features

- **Six number puzzles, three levels.** Sudoku (4×4, 6×6, 9×9, a 16×16 Giant and a 25×25 Colossus), Jigsaw, Diagonal and Killer Sudoku, Futoshiki and Skyscrapers, each at `easy`, `medium` and `hard`, named by kebab-case keys. Shikaku and Juosan use dedicated rectangle and territory models.
- **Four levels on the grid puzzles.** Shikaku, Akari, Loop, Hitori, Regions and Cross Sums each make `easy`, `medium`, `hard` and `extra-hard` boards, at three or more sizes each, every one with exactly one answer and rated by what a person must do to solve it: [Levels of the grid puzzles](#levels-of-the-grid-puzzles).
- **Exactly one answer.** A generator makes puzzles from a seed, and a solver that counts answers confirms there is one. The same kind, size, level and seed make the same puzzle in every browser and every Node, for ever.
- **A check a server can trust.** `checkKazu` reads a finished grid in O(cells), with no search, and says the first thing wrong in words.
- **A hint that is a reason.** Which cell to fill next, with the rule that says so (a cell with one number left, a number with one place left), never built on a wrong entry.
- **Puzzles and runs as short strings**, so a game half done, its pencil marks and its steps can be kept in a database column.
- **Drawn as SVG text**, in an entry of its own: a server that only checks answers never loads the drawing.
- **Played in any page** by touch, mouse and keyboard, with pencil marks, Undo, Hint, Check and a clock, as one function call (`mountKazu`) or one tag (`<kazu-board>`).
- **English and Japanese**, in the board's words, the puzzles' names and rules, and the demo.
- **No dependencies**, no network requests, no sound, no animation, and nothing stored outside the page it is in.
### What's in it

Each picture is the real puzzle, drawn and played by the package and taken from [the demo](https://johnmorrisdotca.github.io/kazu/) with `pnpm screenshots:readme`, in light and dark. Every puzzle is the same seed each time, and the number puzzles are part filled in by tapping, as a person plays.

<table>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/sudoku-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/sudoku-desk-light.webp" alt="Sudoku, 9×9, on a desk part filled in: the 3×3 boxes marked by heavy lines, printed numbers in black, the player's numbers in blue, the chosen cell washed in yellow and its row, column and box in beige, the number pad 1 to 9 and the Undo, Pencil, Hint and Check buttons" width="300">
</picture>
<br><em><strong>Sudoku.</strong> 4×4 to a 25×25 Colossus, three levels, exactly one answer.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/jigsaw-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/jigsaw-desk-light.webp" alt="A 7×7 Jigsaw Sudoku on a desk, part filled in: irregular regions marked by heavy lines in place of boxes, numbers 1 to 7 in black and blue, the chosen cell washed yellow, and the number pad 1 to 7 under the board" width="300">
</picture>
<br><em><strong>Jigsaw.</strong> The boxes are irregular regions, each joined and none a row or a column.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/diagonal-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/diagonal-desk-light.webp" alt="A 9×9 Diagonal Sudoku on a desk, part filled in: the two long diagonals shaded in beige, printed and written numbers, the number pad and the buttons under the board" width="300">
</picture>
<br><em><strong>Diagonal.</strong> The two long diagonals hold each number once too.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/killer-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/killer-desk-light.webp" alt="A 6×6 Killer Sudoku on a desk, part filled in: dashed cages each with its sum in the corner, large numbers in black and blue, the chosen cell washed yellow, and the number pad 1 to 6" width="300">
</picture>
<br><em><strong>Killer Sudoku.</strong> Dashed cages each add to their sum and repeat nothing.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/futoshiki-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/futoshiki-desk-light.webp" alt="A 5×5 Futoshiki on a desk, part filled in: numbers 1 to 5 with small less-than and greater-than marks between some cells, and the number pad 1 to 5 under the board" width="300">
</picture>
<br><em><strong>Futoshiki.</strong> Every mark between two cells must be true.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/skyscrapers-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/skyscrapers-desk-light.webp" alt="A 5×5 Skyscrapers puzzle on a desk, part filled in: numbers 1 to 5 in the grid, brown clue numbers round the edge saying how many towers show from there, and the number pad" width="300">
</picture>
<br><em><strong>Skyscrapers.</strong> A clue is how many towers show from there; a taller one hides those behind it.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/shikaku-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/shikaku-desk-light.webp" alt="A 7×7 Shikaku board on a desk: a grid with numbers 12, 6, 4, 3 and others in some cells, and the buttons Undo, Remove selected rectangle, Cancel, Check, Hint and Restart under it" width="300">
</picture>
<br><em><strong>Shikaku.</strong> Divide the board into rectangles, each holding one number equal to its area.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/hitori-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/hitori-desk-light.webp" alt="A 5×5 Hitori board on a desk: rows of numbers 1 to 5 in boxed cells, one cell shaded black and the others white, and the buttons Undo, Check, Hint and Restart under it" width="300">
</picture>
<br><em><strong>Hitori.</strong> Shade squares so that no number repeats in a row or column, with the unshaded squares in one piece.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/nurikabe-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/nurikabe-desk-light.webp" alt="A 5×5 Nurikabe board on a desk: an almost empty grid with the numbers 1, 6, 2 and 3 in some cells, one shaded black, and the buttons Undo, Check, Hint and Restart under it" width="300">
</picture>
<br><em><strong>Nurikabe.</strong> Original 5×5 puzzles, each proved to have exactly one solution.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/akari-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/akari-desk-light.webp" alt="A 7×7 Akari board on a desk: black squares with numbers 1, 2, 3, 0 and others, and pale white squares, with the line No rule conflicts so far and the buttons Undo, Check, Hint, Restart and Just the board" width="300">
</picture>
<br><em><strong>Akari.</strong> Light every white square with bulbs that cannot see each other.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/juosan-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/juosan-desk-light.webp" alt="A 3×2 Juosan board on a desk: two territories, each with the number 3 in its corner, empty cells to fill with a horizontal or vertical mark, and the buttons under it" width="300">
</picture>
<br><em><strong>Juosan.</strong> Each cell takes a horizontal or a vertical mark, and a territory clue is the difference between the counts.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/loop-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/loop-desk-light.webp" alt="A 7×7 Loop board on a desk: a grid of dots with numbers 1, 2 and 3 in some squares and lines laid along some edges, and the buttons Undo, Check, Hint, Restart and Just the board" width="300">
</picture>
<br><em><strong>Loop.</strong> One closed loop along the edges, each number counting the edges of its square the loop uses.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/masyu-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/masyu-desk-light.webp" alt="A 5×5 Masyu board on a desk: a grid of dots with white and black pearls placed on some of them, and the buttons Undo, Hint, Check and Restart under it" width="300">
</picture>
<br><em><strong>Masyu.</strong> One loop through every pearl: straight through a white one, turning at a black one.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/yajilin-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/yajilin-desk-light.webp" alt="A 5×5 Yajilin board on a desk: arrows with counts in some cells, a Line and Shade choice above the grid, and the buttons Undo, Hint, Check and Restart under it" width="300">
</picture>
<br><em><strong>Yajilin.</strong> Arrow counts, black cells that never touch, and one loop through every other empty cell.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/ripple-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/ripple-desk-light.webp" alt="A 9×9 Ripple Effect board on a desk: rooms outlined by heavy lines holding printed numbers, a row of number buttons 1 to 9 and the buttons Undo, Check, Hint, Restart and Just the board" width="300">
</picture>
<br><em><strong>Ripple Effect.</strong> Each room holds 1 to its size once, and equal numbers in a line are further apart than the number.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/cross-sums-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/cross-sums-desk-light.webp" alt="A Cross Sums board on a desk: a crossword of black cells with diagonal clue sums and white cells to fill with the digits 1 to 9, a row of buttons for the digits below it" width="300">
</picture>
<br><em><strong>Cross Sums.</strong> Fill the white cells so that every across and down run adds to its clue without repeating a digit.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/regions-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/regions-desk-light.webp" alt="A 6×6 Regions board on a desk: a grid with faint numbers 1 to 6 in some cells and a row of number buttons under it with the line Keep filling the empty cells" width="300">
</picture>
<br><em><strong>Regions.</strong> Each connected group of one number is exactly that many cells, and equal groups never touch.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/heyawake-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kazu/main/docs/images/heyawake-desk-light.webp" alt="A 5×4 Heyawake board on a desk: rooms outlined by heavy lines, each with a count of black cells (0, 1 or 2), and the buttons Undo, Check, Hint and Restart under it" width="300">
</picture>
<br><em><strong>Heyawake.</strong> Black cells that never touch, white cells that stay connected, and no white run through more than two rooms.</em>
</td>
</tr>
</table>

## Use it in your project

Kazu is three things, each usable without the others: **the puzzles** (making, solving, checking and hinting, as plain functions over strings), **the drawing** (SVG text), and **the page** (a mounted board or a tag). The table under [The element](docs/PLAYING.md#the-element) says which entry holds which. The examples are one puzzle each time, written in `number-place` at 9×9.

### Install

```sh
npm install @johnmorrisdotca/kazu
pnpm add @johnmorrisdotca/kazu
yarn add @johnmorrisdotca/kazu
```

It is ES modules only, with its types included, and needs Node 22 or later outside a browser. A page with no bundler loads the tag from a CDN (`@2` is the major version).

### 1. The API alone, on a server

```ts no-check
import { checkKazu, generateKazu } from "@johnmorrisdotca/kazu";

const { givens } = generateKazu("number-place", 9, "medium", 42);   // send `givens` to the browser; keep `42` and the answer
checkKazu("number-place", 9, givens, answerFromThePlayer);          // { ok: true } or { ok: false, reason }, in O(cells)
```

Importing the main entry on a server is safe: it touches no page.

### 2. One tag, no bundler

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/kazu@2/dist/element-define.js"></script>
<kazu-board kind="number-place" size="9" level="medium" seed="42"></kazu-board>
<script>
  document.querySelector("kazu-board").addEventListener("kazu-solve", (event) => console.log(event.detail.elapsedMs));
</script>
```

### 3. A bundler, and a framework

`import "@johnmorrisdotca/kazu/element/define"` once, in code that runs in the browser, and `<kazu-board>` is a tag like any other. The tag draws itself in the page's own DOM, so the page's CSS reaches it. Its attributes are read again when they change, and it speaks through DOM events (`kazu-change`, `kazu-hint`, `kazu-check`, `kazu-solve`) that carry a `detail`.

```jsx
// React 19
import { useEffect, useRef } from "react";
import "@johnmorrisdotca/kazu/element/define";

export function Puzzle({ seed, onSolved }) {
  const board = useRef(null);
  useEffect(() => {
    const listen = (event) => onSolved(event.detail.elapsedMs);
    board.current?.addEventListener("kazu-solve", listen);
    return () => board.current?.removeEventListener("kazu-solve", listen);
  }, [onSolved]);
  return <kazu-board ref={board} kind="number-place" size="9" level="medium" seed={String(seed)} />;
}
```

```vue
<!-- Vue 3: tell the compiler the tag is not a Vue component -->
<script setup>
import "@johnmorrisdotca/kazu/element/define";
defineProps({ seed: Number });
</script>
<template>
  <kazu-board kind="number-place" size="9" level="medium" :seed="seed" @kazu-solve="(event) => console.log(event.detail.elapsedMs)" />
</template>
<!-- in vite.config: vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith("kazu-") } } }) -->
```

```svelte
<!-- Svelte 5 -->
<script>
  import "@johnmorrisdotca/kazu/element/define";
  let { seed } = $props();
  let board;
  $effect(() => {
    const listen = (event) => console.log(event.detail.elapsedMs);
    board.addEventListener("kazu-solve", listen);
    return () => board.removeEventListener("kazu-solve", listen);
  });
</script>
<kazu-board bind:this={board} kind="number-place" size="9" level="medium" seed={seed}></kazu-board>
```

```ts no-check
// Angular: a standalone component with CUSTOM_ELEMENTS_SCHEMA
import { Component, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import "@johnmorrisdotca/kazu/element/define";

@Component({
  selector: "app-puzzle",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<kazu-board kind="number-place" size="9" level="medium" seed="42" (kazu-solve)="solved($event)"></kazu-board>`,
})
export class Puzzle {
  solved(event: Event) { console.log((event as CustomEvent).detail.elapsedMs); }
}
```

In Next.js or any server-rendering framework, import the define entry from a client component, so the tag is defined in the browser. Or skip the tag and call `mountKazu(element, options)` from `@johnmorrisdotca/kazu/play` in an effect: the handle it returns has `destroy()`.

These recipes are written to the tag's documented attributes and events; they are not built from the packed tarball by this repository's tests, which play the tag in a bare page in Chromium and WebKit.

### What a developer gets

- **Typed results**, with a doc comment on every export. Every function is pure and returns new values.
- **No dependencies.** ES modules, an entry per concern, and `sideEffects` set so that only the define entry has an effect.
- **Where it runs.** See [Browser support](#browser-support).
## Examples

Each example is a whole recipe: copy it and it works. The ones in TypeScript are run in CI against the built package (`pnpm test:readme`), so none of them is a guess, and the output shown is what they print.

### A puzzle on a page with no script of your own

Save this as a file and open it: a Killer Sudoku for touch, mouse and keyboard, with a number pad, pencil marks, Undo, Hint, Check and a clock. The tag registers itself when its module is imported, and `@2` is the major version.

```html
<!doctype html>
<meta charset="utf-8">
<title>Killer Sudoku</title>
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/kazu@2/dist/element-define.js"></script>
<kazu-board kind="sum-cages" size="9" level="medium" seed="42"></kazu-board>
<p id="said"></p>
<script>
  const board = document.querySelector("kazu-board");
  board.addEventListener("kazu-solve", (event) => {
    document.getElementById("said").textContent = `Solved in ${Math.round(event.detail.elapsedMs / 1000)} s${event.detail.helped ? ", with help" : ""}`;
  });
</script>
```

### Make a puzzle, count its answers, check one

A kind, a size, a level and a seed make the same puzzle in every browser and every Node, for ever. The solver counts the answers, so a generated puzzle has exactly one, and `checkKazu` reads a finished grid in O(cells), with no search, and says the first thing wrong in words.

```ts
import { checkKazu, countKazuSolutions, generateKazu } from "@johnmorrisdotca/kazu";

const puzzle = generateKazu("sum-cages", 9, "medium", 42);        // a Killer Sudoku
console.log(puzzle.givens.length, "characters of givens;", puzzle.solution.length, "cells in the answer");
console.log("answers:", countKazuSolutions("sum-cages", 9, puzzle.givens));
console.log(checkKazu("sum-cages", 9, puzzle.givens, puzzle.solution));
console.log(checkKazu("sum-cages", 9, puzzle.givens, puzzle.solution.replace(/^./, (first) => (first === "1" ? "2" : "1"))));
```

```text
224 characters of givens; 81 cells in the answer
answers: 1
{ ok: true }
{ ok: false, reason: 'row 1 repeats a number' }
```

### What the levels mean

A level is what the solver needed, not how many numbers are printed. Easy yields to singles alone, medium needs one guess, hard whatever it takes, and `kazuGuessDepth` says how many.

```ts
import { generateKazu, kazuGuessDepth } from "@johnmorrisdotca/kazu";

for (const level of ["easy", "medium", "hard"] as const) {
  const { givens } = generateKazu("towers", 6, level, 1234);
  console.log(level.padEnd(6), "guesses a person needs:", kazuGuessDepth("towers", 6, givens));
}
```

```text
easy   guesses a person needs: 0
medium guesses a person needs: 1
hard   guesses a person needs: 7
```

### A hint that is a reason

`hintKazu` reasons from what is right on the grid so far, one step at a time, as a person does, and says which rule makes the next cell certain.

```ts
import { generateKazu, hintKazu } from "@johnmorrisdotca/kazu";

const sudoku = generateKazu("number-place", 9, "easy", 7);
const empty = new Array(81).fill(0);                              // nothing written yet
const hint = hintKazu("number-place", 9, sudoku.givens, empty)!;
console.log(`cell ${hint.cell} takes ${hint.value}: ${hint.why}`);
```

```text
cell 2 takes 8: only-number
```

### Keep a run as a short string

A game half done, as one character a cell, fits in a database column; `kazuHash` is a fingerprint of the puzzle it belongs to.

```ts
import { decodeCells, decodeRun, encodeRun, generateKazu, kazuHash } from "@johnmorrisdotca/kazu";

const small = generateKazu("number-place", 4, "easy", 3);
const run = encodeRun(decodeCells(small.givens, 4)!);
console.log(run, "->", decodeRun(run, 4)!.join(""), "| puzzle", kazuHash(small.givens));
```

```text
....1.4231244..3 -> 0000104231244003 | puzzle 9f50bd47
```

### Draw a puzzle as SVG text, on a server

`drawKazu` returns a string: put it in a page, a file or an email, with nothing to load. The puzzle's names and rules come in English and Japanese from the same entry.

```ts
import { KAZU_NAMES, drawKazu } from "@johnmorrisdotca/kazu/draw";
import { generateKazu } from "@johnmorrisdotca/kazu";

const { givens } = generateKazu("towers", 5, "medium", 7);
const svg = drawKazu("towers", 5, givens, { language: "ja", style: true })!;
console.log(svg.startsWith("<svg"), svg.includes("kz-clue"));
console.log(KAZU_NAMES.towers.en, "/", KAZU_NAMES.towers.ja, "/", KAZU_NAMES.towers.alsoKnownAs.join(", "));
console.log(KAZU_NAMES.towers.rules.en[0]);
```

```text
true true
Skyscrapers / 摩天楼 / Towers, Building Heights
Fill every cell with a tower from 1 up to the side of the square, so that each row and each column holds every height exactly once.
```

### The other puzzles have engines of their own

Hitori, Loop, Akari, Shikaku, Masyu and the rest each have an entry for the rules (`/hitori`), one for the player (`/hitori/play`) and one for the drawing (`/hitori/draw`). The rules are the same shape: make a puzzle from a seed, check an answer, solve, rate.

```ts
import { checkHitori, generateHitori, rateHitori, solveHitori } from "@johnmorrisdotca/kazu/hitori";
import { checkLoop, generateLoop } from "@johnmorrisdotca/kazu/loop";
import { checkAkari, generateAkari } from "@johnmorrisdotca/kazu/akari";

const hitori = generateHitori(6, 42, "medium");                   // size, seed, level
console.log("Hitori:", checkHitori(hitori, hitori.solution).ok, "| solutions found:", solveHitori(hitori).count, "| shaded:", rateHitori(hitori).shaded);
const loop = generateLoop(5, 5, 42, "easy");                      // width, height, seed, level
console.log("Loop:", checkLoop(loop, loop.solution).loops, "closed loop");
const akari = generateAkari(7, 7, 42, "medium");
console.log("Akari:", checkAkari(akari, akari.solution).illuminated, "squares lit by", akari.solution.length, "bulbs");
```

```text
Hitori: true | solutions found: 1 | shaded: 10
Loop: 1 closed loop
Akari: 35 squares lit by 12 bulbs
```

### Play it from a script

`mountKazu` plays a puzzle in any element. Callbacks hand the run, the pencil marks and the clock to a page that keeps a game half done, and the answer to one that checks it.

```ts no-run
import { generateKazu } from "@johnmorrisdotca/kazu";
import { mountKazu } from "@johnmorrisdotca/kazu/play";

const puzzle = generateKazu("towers", 6, "hard", 1234);
const board = mountKazu(document.getElementById("here")!, {
  kind: "towers",
  size: 6,
  givens: puzzle.givens,
  solution: puzzle.solution,
  hints: "show",                                                  // point at the cell and say why; write nothing
  language: "ja",
  onChange: ({ run, notes, elapsedMs }) => localStorage.setItem("kazu", JSON.stringify({ run, notes, elapsedMs })),
  onSolve: ({ answer, elapsedMs, helped }) => fetch("/solved", { method: "POST", body: JSON.stringify({ answer, elapsedMs, helped }) }),
});
board?.undo();
board?.hint();
```

### A look of your own

Every colour is a custom property on `.kazu`, so a page sets only what it wants different; the paper follows the page's light or dark.

```css
.kazu {
  --kz-paper: #fffaf0;
  --kz-entry: #7a1f12;
  --kz-select: #ffd9a8;
}
```

## The puzzles

A puzzle is a grid of `size × size` cells, a few printed numbers and whatever else the kind prints, and
exactly one answer. Every kind is named by a kebab-case key.

| Key | Called | In Japanese | Sizes | What it prints | What is new |
| --- | --- | --- | --- | --- | --- |
| `number-place` | Sudoku | ナンプレ | 4×4, 6×6, 9×9, 16×16, 25×25 | numbers | every row, column and box holds each number once; the 16×16 Giant uses 1 to 9 and then A to G, and the 25×25 Colossus goes on to P |
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
`decodeRun(code, size)` (one character a cell, `.` for empty, A to P past nine), `encodeSteps` and
`decodeSteps` for a step log, `kazuHash(givens)` for a fingerprint of a puzzle, and `encodeNotes` and
`decodeNotes` for Kazu's own pencil marks.

### A hint

```ts no-check
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
## Playing it in a page

<!-- moved: docs/PLAYING.md -->

`mountKazu` plays a puzzle in any element by touch, mouse and keyboard, with a number pad, pencil marks, Undo, Hint, Check and a clock; `<kazu-board>` is the same as a tag. [Playing it in a page](docs/PLAYING.md#playing-it-in-a-page) has the options, the keys, the events and the table of entries.

## Masyu — pearls and a single loop

<!-- moved: docs/PUZZLES.md -->

Pearls on a grid and one closed loop through every one of them: a white pearl on a straight section, a black pearl at a turn. [More](docs/PUZZLES.md#masyu--pearls-and-a-single-loop).

## Yajilin — arrows, shaded cells and a loop

<!-- moved: docs/PUZZLES.md -->

Arrow counts, black cells that never touch, and one loop through every other empty cell. [More](docs/PUZZLES.md#yajilin--arrows-shaded-cells-and-a-loop).

## Shikaku — rectangles in Kazu

<!-- moved: docs/PUZZLES.md -->

Divide the board into rectangles; square, wide, tall and custom boards from 2 to 16 on a side, at four levels, with named packs of proved challenges. [More](docs/PUZZLES.md#shikaku--rectangles-in-kazu).

## Juosan — horizontal and vertical marks

<!-- moved: docs/PUZZLES.md -->

Each cell takes a horizontal or a vertical mark, and a territory clue is the difference between the two counts. [More](docs/PUZZLES.md#juosan--horizontal-and-vertical-marks).

## Akari — light the grid

<!-- moved: docs/PUZZLES.md -->

Place bulbs in white squares until every white square is lit, no two bulbs see each other, and every numbered black square touches that many. [More](docs/PUZZLES.md#akari--light-the-grid).

## Loop

<!-- moved: docs/PUZZLES.md -->

One closed loop along the edges of a grid of numbers, each number saying how many of its square's edges the loop uses: its own edge model, checker, solver and generator. [More](docs/PUZZLES.md#loop).

## Ripple Effect

<!-- moved: docs/PUZZLES.md -->

Rooms that each hold 1 to their size once, and equal numbers in a row or column that are further apart than the number. [More](docs/PUZZLES.md#ripple-effect).

## Cross Sums — crossword sums in Kazu

<!-- moved: docs/PUZZLES.md -->

Digits 1 to 9 in white cells so that every across and down run adds to its clue without repeating a digit (Kakuro). [More](docs/PUZZLES.md#cross-sums--crossword-sums-in-kazu).

## Regions — connected regions with exact areas

<!-- moved: docs/PUZZLES.md -->

Each cell holds a number; every connected group of one number must be exactly that many cells, and two groups of the same area never touch. [More](docs/PUZZLES.md#regions--connected-regions-with-exact-areas).

## Levels of the grid puzzles

<!-- moved: docs/PUZZLES.md -->

Shikaku, Akari, Loop, Hitori, Regions and Cross Sums make boards at `easy`, `medium`, `hard` and `extra-hard`, each with exactly one answer. [More](docs/PUZZLES.md#levels-of-the-grid-puzzles).

## Heyawake — rooms and white paths

<!-- moved: docs/PUZZLES.md -->

Black cells that never touch in rooms with counts, white cells that stay connected, and no straight white run across more than two rooms. [More](docs/PUZZLES.md#heyawake--rooms-and-white-paths).

## Hitori

<!-- moved: docs/PUZZLES.md -->

Shade squares so that no number repeats in a row or column among the unshaded, shaded squares never touch, and the rest stays in one piece. [More](docs/PUZZLES.md#hitori).

## Nurikabe

<!-- moved: docs/PUZZLES.md -->

Original 5×5 puzzles from seeded symmetric layouts, each proved to have exactly one solution. [More](docs/PUZZLES.md#nurikabe).

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

### Entry points

| Import | What it holds |
| --- | --- |
| `@johnmorrisdotca/kazu` | The generator, the solver, the check, the hint, the codes, and the game in play as pure functions, for the six number puzzles |
| `@johnmorrisdotca/kazu/draw` | `drawKazu` and the rest of the drawing as SVG text, the words and the names |
| `@johnmorrisdotca/kazu/play` | `mountKazu`: a puzzle played in any element |
| `@johnmorrisdotca/kazu/element` | The `KazuBoard` class behind `<kazu-board>` |
| `@johnmorrisdotca/kazu/element/define` | Defines `<kazu-board>` by being imported |
| `@johnmorrisdotca/kazu/<puzzle>`, `/<puzzle>/play`, `/<puzzle>/draw` | The rules, the player and the drawing of each puzzle with an engine of its own: `shikaku`, `hitori`, `nurikabe`, `akari`, `juosan`, `loop`, `masyu`, `yajilin`, `ripple`, `cross-sums`, `regions` and `heyawake` |

### The calls to learn first

| Call | What it does |
| --- | --- |
| `generateKazu(kind, size, level, seed)` | A puzzle with exactly one answer, the same everywhere |
| `checkKazu(kind, size, givens, answer)` | `{ ok: true }` or `{ ok: false, reason }`, in O(cells) |
| `hintKazu(kind, size, givens, entries)` | The next cell, its value and the rule that says so |
| `drawKazu(kind, size, givens, options)` | The puzzle as SVG text |
| `mountKazu(element, options)` | The puzzle, played |
| `generate<Puzzle>`, `check<Puzzle>`, `solve<Puzzle>` | The same three for each of the other puzzles |

## Theming

Nothing here is branded. The drawing and the playable board are coloured by custom properties, and a page sets only the ones it wants different. The paper follows the device's light or dark setting; `data-theme="light"` or `"dark"` on `<html>` forces one.

**The drawing** (`drawKazu`), custom properties on `.kazu`:

| Property | What it colours | Light | Dark |
| --- | --- | --- | --- |
| `--kz-paper` | the grid's paper | `#fbf8f1` | `#262a27` |
| `--kz-ink` | a mark's outline (Futoshiki's chevrons) | `#1f2320` | `#ece8dc` |
| `--kz-given` | a printed number | `#1f2320` | `#ece8dc` |
| `--kz-entry` | a number the player wrote | `#1d5fa8` | `#8fc1ff` |
| `--kz-note` | a pencil mark | `#5b6b7d` | `#9fb0c2` |
| `--kz-grid` | the thin lines between cells | `#cfc6b2` | `#454a44` |
| `--kz-box` | the heavy lines round boxes and regions | `#3a3d38` | `#c9c5b8` |
| `--kz-frame` | the frame, when `frame` is on | `#a98954` | `#6b5632` |
| `--kz-cage` | a Killer Sudoku cage and its sum | `#6a5a8e` | `#b8a5e6` |
| `--kz-clue` | a Skyscrapers clue | `#7a4b14` | `#e8c48f` |
| `--kz-diagonal` | the two diagonals of Diagonal Sudoku | `#e9dfc6` | `#34382f` |
| `--kz-peer` | the chosen cell's row, column and group | `#efe8d8` | `#2f332f` |
| `--kz-same` | every cell holding the chosen number | `#dcd0f2` | `#433a5c` |
| `--kz-select` | the chosen cell | `#ffe08a` | `#6b5a1f` |
| `--kz-hint` | the cell a hint pointed at | `#b9e3c4` | `#25503a` |
| `--kz-conflict` | a cell that breaks a rule | `#f4b8ad` | `#6e2f26` |
| `--kz-wrong` | a cell Check flagged | `#f4b8ad` | `#6e2f26` |
| `--kz-bad` | the number in a cell that breaks a rule | `#b5452c` | `#ff8a6b` |
| `--kz-good` | a solved puzzle's wash | `#2f7a4f` | `#6fcf97` |
| `--kz-font` | the numbers' type | the system's own | the same |

**The playable board** (`mountKazu` and `<kazu-board>`) wears the drawing's properties, and six of its own on `.kazu-play`:

| Property | What it colours | Light | Dark |
| --- | --- | --- | --- |
| `--kzp-ink` | text, the number pad's numbers, and a pressed button | `#1f2320` | `#ece8dc` |
| `--kzp-muted` | the progress count, the erase key and the words under the board | `#6b6f68` | `#a09d93` |
| `--kzp-rule` | borders | `#ddd6c6` | `#3a3d38` |
| `--kzp-surface` | the number pad and the buttons | `#fbf8f1` | `#1d201e` |
| `--kzp-accent` | the focus ring, and a warning in the words under the board | `#b5452c` | `#ff8a6b` |
| `--kzp-good` | the words and the clock once the puzzle is solved | `#2f7a4f` | `#6fcf97` |

```css
kazu-board, .kazu, .kazu-play { --kz-select: #ffd23f; --kz-entry: #0b5cad; --kzp-accent: #8a1c1c; }
```

The demo's own page is the worked example: its green felt and its cloth patches are the family's stylesheet, [`demo/family.css`](./demo/family.css), which is the same file byte for byte in every sibling's demo, and a test holds it to its hash. The parts of the drawing carry classes (`kz-given`, `kz-entry`, `kz-note`, `kz-cage-sum`, `kz-clue`, `kz-mark`, `kz-conflict`, `kz-hit`) for anything a property cannot reach.
## Limits

All of these are held by tests, and the ones with a name are exported.

| Limit | Value | Where |
| --- | --- | --- |
| Puzzles | the six keys of `KAZU_KINDS` | the table under [The puzzles](#the-puzzles) |
| Levels | `easy`, `medium`, `hard` | `KAZU_LEVELS` |
| Sizes | each puzzle's own, 4×4 to 25×25 | `KAZU_SPECS[kind].sizes` |
| A seed | a whole number from 1 to 2,147,483,647 | `KAZU_SEED_MOST`, `isKazuSeed` |
| Symbols in a grid | `1` to `9`, then `A` to `G` for the 16×16 and on to `P` for the 25×25 | `symbolOf`, `valueOfSymbol` |
| The longest givens code | Sudoku 625 characters, Jigsaw 162, Diagonal 81, Killer Sudoku 286, Futoshiki 133, Skyscrapers 77 | `KAZU_SPECS[kind].mostCells`, for a route that must refuse anything larger |
| Answers counted | two, so that "many" costs no more than "two" | the `limit` argument of `countKazuSolutions` |
| The solver's work | 2,000,000 steps, then it says it cannot say (`null`) | the `budget` argument of `solveKazu` |
| A step log | the newest 400 steps | `KAZU_STEPS_KEPT` |

A generator never runs on a server unless you ask it to. The check never searches: it is linear in the size of the grid.
## Accessibility

- **The board and the pad are named.** A drawn grid is an image with a label that says the puzzle and its size ("Sudoku puzzle, 9 by 9"), and the playable board is a labelled group with a description of its keys. Each number on the pad is a button named by its value, and one that is used up everywhere is named as done; Pencil is an `aria-pressed` button.
- **What happens is spoken.** A line under the board and a second line for announcements are polite live regions, so the result of a Hint (which cell, and the rule that says so), a Check (how many cells are wrong) and a solved puzzle are heard without moving focus.
- **The keyboard plays everything.** The board is one tab stop; the arrows move between cells, a number writes (Shift writes a pencil mark), Backspace empties a cell, N turns Pencil on or off, Ctrl or Cmd with Z undoes, and Escape lets the cell go. The pad and the buttons are native buttons, reached with Tab.
- **Touch targets.** Every key and button on the pad is at least 44 pixels square, and the board is one steady square that fits a phone at 390 pixels, so nothing moves as numbers are written.
- **No colour on its own.** A cell that breaks a rule is washed red and its number is red; a printed number, one the player wrote and a pencil mark differ in weight and size as well as in colour; a Hint's cell and the chosen cell's row and column are washes, not the only sign of anything. A player who cannot see colour can still turn on Check, which says how many cells are wrong.
- **No motion and no sound.** Nothing in the puzzles animates and nothing makes a sound, so there is nothing for `prefers-reduced-motion` to change.
- **Light and dark** follow the page, and every colour is a custom property (see [Theming](#theming)); the colour pairs have not been measured against WCAG contrast ratios.
- **The puzzles with a page of their own** (Hitori, Loop, Masyu, Yajilin, Shikaku, Akari and the rest) label their cells or edges as buttons ("cell 2, column 3: shaded"), keep one tab stop with the arrows to move, and say their state in a `status` line. How complete the keyboard play is differs from puzzle to puzzle, and has not been audited as the number puzzles' has.
- **Not yet.** The Japanese has not been read by a native reader (see [Languages](#languages)).

## Browser support

Any browser with ES2020 modules, custom elements and CSS `aspect-ratio`: Chrome and Edge 88, Safari 15, Firefox 89, all from 2021 on. The element draws in the page's own DOM, with no shadow DOM and no CSS the page cannot reach. The demo is played in a real Chromium at a phone's width (with touch) and a desk's, and in WebKit, Safari's engine, at a phone's width; Firefox is not in that run. The package itself (everything but the drawing and the page) needs no DOM: it runs in Node 22 or later (CI tests 22 and 24). Deno and Bun are not tested.
## Languages

English and Japanese, chosen by the `language` option, the host's `lang` or the page's, and followed when the page's `lang` changes. The demo has a chooser of its own and takes the browser's language on a first visit. The board's words (`KAZU_STRINGS`), each puzzle's names and rules (`KAZU_NAMES`) and the sizes' names are in both. **Japanese: included; not yet reviewed by a native reader. Corrections welcome.** Every string of the board is listed beside its English in [docs/strings-ja.md](./docs/strings-ja.md), and there is an [issue template](https://github.com/johnmorrisdotca/kazu/issues/new?template=fix-a-translation.md) for fixing one. Any other language is a table of your own, passed beside these two.
## Roadmap

Not here yet, and each welcome as an [issue](https://github.com/johnmorrisdotca/kazu/issues):

- A daily puzzle: a puzzle of the day for each kind and level, from the date, the way [Tane](https://github.com/johnmorrisdotca/tane) makes daily seeds.
- A command line: make a puzzle, solve a code, check an answer, and print the grid as text.

Left out on purpose: a puzzle with more than one answer, and any account, ranking or storage. A page keeps its own runs: `onChange` hands them over.
## Architecture

<!-- moved: docs/ARCHITECTURE.md -->

The rules are plain functions over strings with no DOM; the drawing is a separate entry, so a server that only checks answers never loads it; and each puzzle has its own engine, drawing and player in its own entry. Tests sit beside the code they test. [Architecture](docs/ARCHITECTURE.md#architecture) lists every source file and what it does.

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

Using Kazu in something? Open an *Add my project* issue and we will add you.

### The family

<!-- family:start (made by scripts/family-readme.mjs from scripts/family-template.mjs; change those, not this) -->
Kazu is one of twenty-four packages, each made for the same site, each at
[github.com/johnmorrisdotca](https://github.com/johnmorrisdotca). The code of every one is MIT.

- [Korokoro](https://github.com/johnmorrisdotca/korokoro) (コロコロ): dice, with notation, exact odds, real sounds and the dice of many games. [Demo](https://johnmorrisdotca.github.io/korokoro/).
- [Kyuubu](https://github.com/johnmorrisdotca/kyuubu) (キューブ): a turning cube for the browser, 2×2 to 7×7, with record solves to replay. [Demo](https://johnmorrisdotca.github.io/kyuubu/).
- [Hitotsu](https://github.com/johnmorrisdotca/hitotsu) (一つ): a colour-card shedding game for two to eight, with the house rules people play. [Demo](https://johnmorrisdotca.github.io/hitotsu/).
- [Toranpu](https://github.com/johnmorrisdotca/toranpu) (トランプ): a deck of playing cards, card games with computer players, and solitaires. [Demo](https://johnmorrisdotca.github.io/toranpu/).
- [Tane](https://github.com/johnmorrisdotca/tane) (種): seeded random numbers and daily seeds, the same in every browser and on every server. [Demo](https://johnmorrisdotca.github.io/tane/).
- [Narabe](https://github.com/johnmorrisdotca/narabe) (並べ): one rules engine for abstract board games, from gomoku and Reversi to Go and checkers. [Demo](https://johnmorrisdotca.github.io/narabe/).
- [Tenka](https://github.com/johnmorrisdotca/tenka) (天下): world conquest for two to six, on a map of the real world. [Demo](https://johnmorrisdotca.github.io/tenka/).
- [Kumimoji](https://github.com/johnmorrisdotca/kumimoji) (組み文字): a crossword tile race, in English and Japanese kana. [Demo](https://johnmorrisdotca.github.io/kumimoji/).
- [Tsunagi](https://github.com/johnmorrisdotca/tsunagi) (繋ぎ): a line-joining logic puzzle whose every level has exactly one answer. [Demo](https://johnmorrisdotca.github.io/tsunagi/).
- [Jarajara](https://github.com/johnmorrisdotca/jarajara) (ジャラジャラ): mahjong tiles drawn as SVG, stacked layouts, and the matching solitaire Awase. [Demo](https://johnmorrisdotca.github.io/jarajara/).
- [Suido](https://github.com/johnmorrisdotca/suido) (水道): a pipe puzzle: turn the pieces until the water reaches every drain. [Demo](https://johnmorrisdotca.github.io/suido/).
- [Domino](https://github.com/johnmorrisdotca/domino) (ドミノ): dominoes and Mexican Train. [Demo](https://johnmorrisdotca.github.io/domino/).
- [Kotoba](https://github.com/johnmorrisdotca/kotoba) (言葉): word lists and word-game rules in English, French, German and Japanese. [Demo](https://johnmorrisdotca.github.io/kotoba/).
- [Sugoroku](https://github.com/johnmorrisdotca/sugoroku) (双六): backgammon and its variants, with the doubling cube and match play. [Demo](https://johnmorrisdotca.github.io/sugoroku/).
- [Kazu](https://github.com/johnmorrisdotca/kazu) (数): grid number puzzles: Sudoku and its variants, Futoshiki and Skyscrapers. [Demo](https://johnmorrisdotca.github.io/kazu/).
- [Meikyuu](https://github.com/johnmorrisdotca/meikyuu) (迷宮): mazes on squares, hexagons, triangles and circles, made from a seed and drawn through with a finger or the mouse. [Demo](https://johnmorrisdotca.github.io/meikyuu/).
- [Hikidashi](https://github.com/johnmorrisdotca/hikidashi) (引き出し): a drawer of small Japanese text tools: era dates, kanji numerals, readings and sentence difficulty. [Demo](https://johnmorrisdotca.github.io/hikidashi/).
- [Chizu](https://github.com/johnmorrisdotca/chizu) (地図): maps of the world and of countries' regions, in English and Japanese, with a quiz and callouts. [Demo](https://johnmorrisdotca.github.io/chizu/).
- [Bushu](https://github.com/johnmorrisdotca/bushu) (部首): find a kanji by the parts it is made of. [Demo](https://johnmorrisdotca.github.io/bushu/).
- [Tobiishi](https://github.com/johnmorrisdotca/tobiishi) (飛び石): peg solitaire with nine boards and seeded solvable challenges. [Demo](https://johnmorrisdotca.github.io/tobiishi/).
- [Jirai](https://github.com/johnmorrisdotca/jirai) (地雷): minesweeper on shaped grids with verified no-guess boards. [Demo](https://johnmorrisdotca.github.io/jirai/).
- [Gunjin](https://github.com/johnmorrisdotca/gunjin) (軍人): five hidden-rank strategy games with pass-the-device play. [Demo](https://johnmorrisdotca.github.io/gunjin/).
- [Karakuri](https://github.com/johnmorrisdotca/karakuri) (からくり): eight hyper-casual puzzle games, some of them physics: draw a shield, pull pins, cut ropes, slide blocks, pour tubes. [Demo](https://johnmorrisdotca.github.io/karakuri/).
- [Houseki](https://github.com/johnmorrisdotca/houseki) (宝石): gem and stone matching puzzles: falling triplets, stone collapse, colour chains and gem swap. [Demo](https://johnmorrisdotca.github.io/houseki/).

**This package is Kazu.** The demos of all twenty-four share one header and footer, so each links the rest.
<!-- family:end -->
## Development

```sh
pnpm install
pnpm check                # lint, types and every test, every puzzle the site made made again
pnpm test:package        # pack it, install it, and use it as published
pnpm test:demo           # build the demo and play it in a real browser, at a phone's width and a desk's
pnpm test:readme         # run every example in this README against the built package
pnpm site                # build the demo into site/, as the Pages workflow publishes it
pnpm screenshots:readme  # take the README's pictures from the built demo, in light and dark
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). The commands are under [Development](#development).

Please follow the [code of conduct](./CODE_OF_CONDUCT.md). A way to make the check or the solver run for long, or markup that gets out of the drawing, is for the [security policy](./SECURITY.md), not a public issue.
## Changes

See [CHANGELOG.md](./CHANGELOG.md). The latest release, 2.0.1, adds no code: it is this README in full, with pictures of every puzzle, examples that are run on every change, an Accessibility section, and the reference for the puzzles with a page of their own moved to pages under `docs/`.

## Licence

MIT, © John Morris. The puzzles are made in code and the drawing is SVG; there is no sound and no data file but the record of what the site made.
