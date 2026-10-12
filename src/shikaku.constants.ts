/** Bounds keep custom boards and searches finite.
 *
 * @example
 * ```ts
 * import { SHIKAKU_MOST_SIDE } from "@johnmorrisdotca/kazu/shikaku";
 *
 * console.log(SHIKAKU_MOST_SIDE);
 * ```
 */
export const SHIKAKU_MOST_SIDE = 16;
/** The native Shikaku search-node budget.
 *
 * @example
 * ```ts
 * import { SHIKAKU_MOST_NODES } from "@johnmorrisdotca/kazu/shikaku";
 *
 * console.log(SHIKAKU_MOST_NODES);
 * ```
 */
export const SHIKAKU_MOST_NODES = 100_000;
/** The native Shikaku generation-attempt limit.
 *
 * @example
 * ```ts
 * import { SHIKAKU_MOST_ATTEMPTS } from "@johnmorrisdotca/kazu/shikaku";
 *
 * console.log(SHIKAKU_MOST_ATTEMPTS);
 * ```
 */
export const SHIKAKU_MOST_ATTEMPTS = 1500;
/** How hard a puzzle is made, by what a person must do to solve it; see `rateShikaku`.
 *
 * @example
 * ```ts
 * import { SHIKAKU_LEVELS } from "@johnmorrisdotca/kazu/shikaku";
 *
 * console.log(SHIKAKU_LEVELS);
 * ```
 */
export const SHIKAKU_LEVELS = ["easy", "medium", "hard", "extra-hard"] as const;
/** The sides on offer for a square board; any side from 2 to `SHIKAKU_MOST_SIDE` can be made.
 *
 * @example
 * ```ts
 * import { SHIKAKU_SIZES } from "@johnmorrisdotca/kazu/shikaku";
 *
 * console.log(SHIKAKU_SIZES);
 * ```
 */
export const SHIKAKU_SIZES = [5, 7, 10, 14] as const;
