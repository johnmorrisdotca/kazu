---
title: "Getting started"
section: tutorial
order: 1
description: "Generate and check a small Sudoku before mounting a player."
---

## Begin with a small native grid

Install `@johnmorrisdotca/kazu` with npm. The root supplies the six number-grid engines and the other named puzzle engines. Each family also has a direct engine, drawing and player entry.

```ts
import {generateKazu,checkKazu,newKazuGame,enterNumber,decodeCells,kazuProgress} from "@johnmorrisdotca/kazu";
const puzzle = generateKazu("number-place",4,"easy",42);
const game = newKazuGame(puzzle.kind,puzzle.size,puzzle.givens)!;
const solution = decodeCells(puzzle.solution,4)!;
const cell = game.printed.cells.findIndex(value=>value===0);
console.log(checkKazu(puzzle.kind,4,puzzle.givens,puzzle.solution));
console.log(kazuProgress(enterNumber(game,cell,solution[cell])));
```

The assertions use a generated, validated native puzzle. Pasted codes need a `null` branch. Printed numbers and player entries are different: entries remain zero on printed cells. Rule actions return new game values.

Next read [number-grid kinds](number-grids.md), [other families](other-families.md), [proof and hints](hints-and-proof.md) or [native embeds](native-embeds.md). Use `KAZU_SPECS` to choose supported dimensions rather than assuming every kind supports a 4×4 example.
