---
title: "Codes, indices and edge models"
section: explanation
order: 7
description: "Understand why native codes cannot be exchanged across puzzle kinds."
---

## Numeric cells and clue suffixes

Numeric cells are row-major, with zero blank and the native symbol encoding used above nine. A givens code can append geometry or constraints. Run strings contain player entries, while note strings pack cell indices and bit masks. The kinds' decoders enforce their full dimensions and structure, so a plausible-looking prefix is not enough.

```ts
import {symbolOf,valueOfSymbol,notesOf,boxOf} from "@johnmorrisdotca/kazu";
console.log(symbolOf(10),valueOfSymbol("A"),notesOf((1<<1)|(1<<3)),boxOf(6,12));
```

## Three different loop representations

Loop's edges join grid vertices around cells. Masyu and Yajilin instead join cell centres; Yajilin also keeps shaded cells and arrow rays. Shikaku stores rectangles, Akari lamp flags, Juosan orientation marks, and shading families boolean states. Room/region arrays describe native geometry, not arbitrary drawing groups.

Use matching board/game/solver/draw types for a family. Metadata such as maximum side or offered sizes can be broader than a current generator's supported layouts. The [family reference](../PUZZLES.md) and [architecture](architecture.md) preserve detailed format and rule descriptions.
