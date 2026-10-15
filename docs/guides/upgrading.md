---
title: "Upgrading to the current entries"
section: upgrading
order: 10
description: "Use the published version-2 names and preserve old native formats."
---

## Public major 2

Kazu's current public major is 2. [The changelog](../../CHANGELOG.md) records the actual 1→2 changes. Use the current kebab-case source/entry names (`number-place`, `sum-cages`, `cross-sums`, and named family `/draw`/`play` paths) shown in the exported reference. Existing site-kind camel names can be mapped through `KAZU_KIND_OF_SITE_KIND`; the native public puzzle keys stay explicit.

Each direct family entry lets a host choose only its engine; importing the root exposes the larger family. Existing stored codes should be decoded through their matching native readers, not renamed or trimmed because a filename changed.

## Migrating another host

Distinguish puzzle size from embed display size, printed clues from entries, a partial progress check from full completion, and a solver count from a completed proof. Keep full clue suffixes and native seed ranges. Current builder snippets use the installed major; callbacks remain host code and native events keep their meaning. [The existing embed contract](../embeds.md) and [the preserved full reference](../PUZZLES.md) explain the current behavior before release.
