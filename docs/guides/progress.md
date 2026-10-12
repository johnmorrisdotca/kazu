---
title: "Keep entries, notes and native progress"
section: how-to
order: 5
description: "Store the puzzle identity alongside the player state."
---

## Number-grid progress is separate from clues

```ts
import {generateKazu,newKazuGame,toggleNote,encodeRun,encodeNotes,decodeRun,decodeNotes} from "@johnmorrisdotca/kazu";
const puzzle = generateKazu("number-place",4,"easy",42);
const game = newKazuGame(puzzle.kind,4,puzzle.givens)!;
const cell = game.printed.cells.findIndex(value=>value===0);
const noted = toggleNote(game,cell,1);
const restored = newKazuGame(puzzle.kind,4,puzzle.givens,{entries:decodeRun(encodeRun(noted.entries),4)!,notes:decodeNotes(encodeNotes(noted.notes),4)!});
console.log(restored?.notes[cell]);
```

Keep kind, size and the complete givens code with run/notes. Entries are zero on printed cells; notes use bit `v` for value `v`, not bit `v-1`. `valuesOf` combines clues with entries, and `answerOf` writes the current answer. Undo belongs to current game state; saved run text is not a promise to retain all undo history.

## Dedicated families

Each family encodes its own board and marks using `encodeShikaku`, `encodeHitori`, `encodeRegionsGame` and corresponding decoders. Invalid encoded state returns `null`. Do not feed one family's progress into another just because their grids have the same dimensions.

The host decides whether to save/download text. Native frames read no storage, while the full demo retains its established local progress behavior. Keep assistance and elapsed time when your result policy uses them; a browser time is not a server proof. See [encodings](encodings.md) and [embeds](native-embeds.md).
