---
title: "Choose Sudoku and number-grid rules"
section: how-to
order: 2
description: "Keep printed codes and variant constraints together."
---

## Choose a native kind

`number-place` is ordinary Sudoku; jigsaw uses irregular regions, diagonal adds the long diagonals, and `sum-cages` adds totals in cages. `more-or-less` is Futoshiki with inequalities; towers is Skyscrapers with edge visibility clues. The kind decides how to decode the givens and which rules the answer must satisfy.

```ts
import {KAZU_KINDS,KAZU_SPECS,isKazuSize,generateKazu,checkKazu} from "@johnmorrisdotca/kazu";
console.log(KAZU_KINDS.map(kind=>[kind,KAZU_SPECS[kind].sizes]));
const puzzle = generateKazu("more-or-less",4,"easy",42);
console.log(isKazuSize("more-or-less",4),checkKazu(puzzle.kind,puzzle.size,puzzle.givens,puzzle.solution));
```

## Preserve the complete printed puzzle

A givens code can include regions, cages, inequalities or edge clues after its numeric cells. Do not slice it down to `size * size` before checking. Use `readGivens` and the kind-specific decoders; `decodeCells` alone is only the numeric cell part. `layoutOfGivens` can be `null` for the separate inequality/visibility rules.

Seeds are integers from 1 to `KAZU_SEED_MOST`, and levels easy/medium/hard. Unsupported generation inputs throw. Huge grids or difficult variants can block synchronous host code; use a worker for a responsive custom host. See [the established level notes](../LEVELS.md).
