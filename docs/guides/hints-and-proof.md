---
title: "Separate answer checking, hints and proof"
section: how-to
order: 4
description: "Treat bounded search completion as part of a uniqueness result."
---

## A valid answer is not a uniqueness proof

```ts
import {generateHitori,checkHitori,solveHitori} from "@johnmorrisdotca/kazu/hitori";
const puzzle = generateHitori(5,42,"easy");
const proof = solveHitori(puzzle,{limit:2,nodes:20000});
console.log(checkHitori(puzzle,puzzle.solution).ok,proof.count,proof.complete);
console.log(proof.complete && proof.count===1);
```

Check validates the supplied answer against native clues. Solve searches within a budget and may stop incomplete; one found answer after exhaustion does not prove uniqueness. Use a limit of two and require a complete search with count one. The six-grid count helper returns a count or `null`, so do not infer completion solely from that count.

## What a hint means

Number-grid hints first seek an only-number or only-place deduction. When a hard puzzle needs an answer-based move, the hint marks `why:"answer"`; it is not falsely presented as a logical single. Wrong entries do not become premises for the hint. Family hints return their own rectangle/cell/edge action or `null` when no usable hint is available, and native play tracks help. An assisted result should not be reported as unassisted. See [hintKazu](api:hintKazu) and [the established player modes](../PLAYING.md).
