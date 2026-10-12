/** The maximum supported Loop board dimension.
 *
 * @example
 * ```ts
 * import { LOOP_MOST_SIDE } from "@johnmorrisdotca/kazu/loop";
 *
 * console.log(LOOP_MOST_SIDE);
 * ```
 */
export const LOOP_MOST_SIDE = 10;
/** The native Loop search-node budget.
 *
 * @example
 * ```ts
 * import { LOOP_MOST_NODES } from "@johnmorrisdotca/kazu/loop";
 *
 * console.log(LOOP_MOST_NODES);
 * ```
 */
export const LOOP_MOST_NODES = 300_000;
/** How hard a puzzle is made, by what a person must do to solve it; see `rateLoop`.
 *
 * @example
 * ```ts
 * import { LOOP_LEVELS } from "@johnmorrisdotca/kazu/loop";
 *
 * console.log(LOOP_LEVELS);
 * ```
 */
export const LOOP_LEVELS = ["easy", "medium", "hard", "extra-hard"] as const;
/** The sides on offer for a square board; any side from 2 to `LOOP_MOST_SIDE` can be made.
 *
 * @example
 * ```ts
 * import { LOOP_SIZES } from "@johnmorrisdotca/kazu/loop";
 *
 * console.log(LOOP_SIZES);
 * ```
 */
export const LOOP_SIZES = [5, 7, 10] as const;
/** The native Loop generation-attempt limit.
 *
 * @example
 * ```ts
 * import { LOOP_MOST_ATTEMPTS } from "@johnmorrisdotca/kazu/loop";
 *
 * console.log(LOOP_MOST_ATTEMPTS);
 * ```
 */
export const LOOP_MOST_ATTEMPTS = 40;
