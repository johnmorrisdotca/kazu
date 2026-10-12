---
title: "Troubleshooting and FAQ"
section: troubleshooting
order: 9
description: "Resolve unsupported generation, invalid codes and incomplete search."
---

## Generation threw

Validate kind, size, level and seed through the native constants/predicates. Do not infer a generator's dimensions from the drawing's ability to accept a custom board: current Juosan, Ripple, Masyu and Yajilin constraints are deliberately narrow. An exhausted generation/proof attempt is a refusal, not permission to return an unchecked puzzle. Try a supported seed/settings combination.

## Null or incomplete results

Number-grid decoders, `readGivens`, `newKazuGame` and `mountKazu` return `null` on invalid setup. Family game decoders reject malformed board/progress. Rectangle/room cell helpers return `null` for out-of-board geometry; hints return `null` when unavailable. `layoutOfGivens` can be absent for non-group constraints. A bounded solver's `complete:false` is inconclusive, even with one answer; count-only calls lack that proof signal.

If entered numbers appear missing, printed cells keep entries zero: inspect `valuesOf`. A note uses bit `v`. If saved progress will not load, keep the matching board and family code. If elements are unregistered, import `/element/define`. Destroy removed mounts, and use [the complete contract](../embeds.md) for attribute/property precedence and private host options. [The Japanese string list](../strings-ja.md) preserves existing words and their English partners.
