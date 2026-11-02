import type { KazuCheck } from "./kinds.ts";

/**
 * Why `checkKazu` will not take an answer, as a stable code and the English clause it says: `{name}` is a gap
 * the check's `values` fill. The clause is what `reason` has always said, word for word; a site that speaks
 * another language says the code in its own words and puts the values in the gaps.
 *
 * | Code | Values |
 * | --- | --- |
 * | `no-kind-at` | `kind` (the puzzle's key), `size` |
 * | `no-check` | `kind` |
 * | `givens-not-grid`, `givens-not-regions`, `givens-not-cages`, `givens-not-marks`, `givens-not-clues` | none |
 * | `regions-not-sound`, `answer-not-grid`, `answer-has-empty-cells`, `given-changed`, `mark-not-true`, `diagonal-repeats` | none |
 * | `row-repeats`, `column-repeats`, `box-repeats`, `region-repeats` | `n`: the group's number, counted from 1 |
 * | `cage-repeats` | `n`: the cage's number, counted from 1 |
 * | `cage-sum-wrong` | `n`, `sum`: what the cage should add to |
 * | `clue-sees-wrong` | `side` (`top`, `bottom`, `left` or `right`), `clue`, `seen` |
 *
 * @example
 * ```ts
 * import { KAZU_CHECK_REASONS } from "@johnmorrisdotca/kazu";
 *
 * console.log(KAZU_CHECK_REASONS["row-repeats"]);
 * ```
 */
export const KAZU_CHECK_REASONS = {
  "no-kind-at": "no {kind} at {size}",
  "no-check": "no check for {kind}",
  "givens-not-grid": "the givens are not a grid",
  "givens-not-regions": "the givens are not a grid with regions",
  "givens-not-cages": "the givens are not a grid with cages",
  "givens-not-marks": "the givens are not a grid with marks",
  "givens-not-clues": "the givens are not a square with clues",
  "regions-not-sound": "the regions do not divide the grid",
  "answer-not-grid": "the answer is not a grid",
  "answer-has-empty-cells": "the answer has empty cells",
  "given-changed": "a given was changed",
  "row-repeats": "row {n} repeats a number",
  "column-repeats": "column {n} repeats a number",
  "box-repeats": "box {n} repeats a number",
  "region-repeats": "region {n} repeats a number",
  "diagonal-repeats": "a diagonal repeats a number",
  "cage-repeats": "cage {n} repeats a number",
  "cage-sum-wrong": "cage {n} does not add to {sum}",
  "mark-not-true": "a mark is not true",
  "clue-sees-wrong": "the {side} clue {clue} sees {seen}",
} as const;

/**
 * A reason `checkKazu` can give, by its stable code.
 *
 * @example
 * ```ts
 * import type { KazuCheckCode } from "@johnmorrisdotca/kazu";
 *
 * const code: KazuCheckCode = "row-repeats";
 * console.log(code);
 * ```
 */
export type KazuCheckCode = keyof typeof KAZU_CHECK_REASONS;

/**
 * The numbers and names that fill a reason's gaps, by the gap's name (see `KAZU_CHECK_REASONS` for each code's).
 *
 * @example
 * ```ts
 * import type { KazuCheckValues } from "@johnmorrisdotca/kazu";
 *
 * const values: KazuCheckValues = { n: 3 };
 * console.log(values);
 * ```
 */
export type KazuCheckValues = Readonly<Record<string, string | number>>;

/**
 * A refusal: `{ ok: false }`, the English `reason` (the clause of the code with the values in its gaps), the code
 * and the values.
 *
 * @param code - Why the answer is not taken.
 * @param values - What fills the clause's gaps, where it has any.
 * @returns The refusal `checkKazu` gives.
 * @example
 * ```ts
 * import { kazuRefusal } from "@johnmorrisdotca/kazu";
 *
 * console.log(kazuRefusal("row-repeats", { n: 3 }));
 * ```
 */
export function kazuRefusal(code: KazuCheckCode, values?: KazuCheckValues): Extract<KazuCheck, { ok: false }> {
  const reason = KAZU_CHECK_REASONS[code].replace(/\{(\w+)\}/g, (_gap, name: string) => String(values?.[name]));
  return values === undefined ? { ok: false, reason, code } : { ok: false, reason, code, values };
}
