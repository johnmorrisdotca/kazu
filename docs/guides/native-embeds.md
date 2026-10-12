---
title: "Draw and embed the native players"
section: how-to
order: 6
description: "Use each family mount and keep display choices separate from rules."
---

## Mount the number grid

```ts no-run
import {generateKazu} from "@johnmorrisdotca/kazu";
import {mountKazu} from "@johnmorrisdotca/kazu/play";
const puzzle = generateKazu("number-place",4,"easy",42);
const host = document.createElement("div");document.body.append(host);
const board = mountKazu(host,{...puzzle,hints:"show",onSolve:detail=>console.log(detail.solved)});
console.log(board?.detail().progress);board?.destroy();
```

`mountKazu` returns `null` for an invalid setup. Family mounts use `{board:puzzle}` and their own option/handle types. Destroy every removed mount. SVG drawing is a separate entry; it returns an image rather than installing interactive controls.

## Choose a builder maker

The [builder](https://johnmorrisdotca.github.io/kazu/builder.html) provides number-grid and dedicated-family makers, fixed/daily seed choices, native assistance and display settings, and copied element/module/frame/framework code. Display `size` is small/medium/large; puzzle dimensions use the maker's own grid fields. Host-only callbacks and structured board/progress inputs are explained in the builder.

Native events retain the original meaning, bubble and cross shadow roots. Frames forward JSON-safe detail; validate origin and the sending frame. A daily seed is resolved at mount time without a rollover timer. [The complete existing contract](../embeds.md) lists reflected properties, precedence, private host choices and frame validation. Every native demo has a Docs link following its selected language.
