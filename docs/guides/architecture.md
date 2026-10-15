---
title: "Architecture and checked generation"
section: explanation
order: 8
description: "Keep rules, seeded puzzles and players in their native layers."
---

## Existing source organization

The rules are plain functions over strings with no DOM; the drawing is a separate entry, so a server that only checks answers never loads it; and each puzzle has its own engine, drawing and player in its own entry. Tests sit beside the code they test. [Architecture](../ARCHITECTURE.md#architecture) lists every source file and what it does.

The complete [source tree](../ARCHITECTURE.md) stays in its established page. The README's moved-section markers are preserved so existing upkeep checks can reconstruct the full reference.

## Constraints and search

The six number grids share native numeric/group machinery with kind-specific cage, inequality and visibility constraints. Dedicated families use their own board models and bounded search. Generation validates uniqueness before returning a puzzle; source gates recheck native rules, codecs and generated boards. Drawing consumes state, while mounted players add selection, callbacks, controls and optional local host behavior.

Search on the documentation site is an index built with the static pages. Examples import the public entry they demonstrate. Expensive generation examples and DOM mounts are marked no-run but still typechecked; small static native boards let rule examples execute without repeatedly generating a large puzzle.
