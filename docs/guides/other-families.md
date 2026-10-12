---
title: "Use the dedicated logic-puzzle engines"
section: how-to
order: 3
description: "Select the right state model for rectangles, shading, lamps and loops."
---

## Rectangles and shading

Shikaku places rectangles with one matching area clue. Hitori shades duplicate numbers while keeping white cells connected; Nurikabe builds islands and connected sea. Akari places lamps to light white squares and satisfy numbered walls. Juosan uses horizontal/vertical marks in territories; Heyawake shades cells under room and straight-line restrictions.

```ts
import {generateJuosan,checkJuosan} from "@johnmorrisdotca/kazu/juosan";
import {generateMasyu,checkMasyu} from "@johnmorrisdotca/kazu/masyu";
const marks = generateJuosan(3,2,"easy",42);
const loop = generateMasyu(5,42);
console.log(checkJuosan(marks,marks.solution),checkMasyu(loop,loop.solution));
```

## Edges and room numbers

Loop uses grid-vertex edges; Masyu uses a loop through cell centres with pearl rules. Yajilin combines cell shading and a cell-centre loop. Their edge arrays are not interchangeable. Ripple Effect fills each room with its numbers and enforces spacing between repeats. Cross Sums uses distinct digits in crossing total runs. Regions connects equal-number cells into regions of that size.

Import each engine from its named entry, plus `/draw` or `/play` only when needed. Current generation limits matter: Juosan supports 3×2/2×3, Masyu/Yajilin seeded generation uses 5×5, and Ripple uses 9×9. A size constant or custom-board decoder is not a promise that generation supports every listed/custom size. [The preserved family reference](../PUZZLES.md), [Regions](../REGIONS.md) and [Heyawake](../HEYAWAKE.md) give the complete rules and source notes.
