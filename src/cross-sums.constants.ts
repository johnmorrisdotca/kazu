/** The minimum supported CrossSums board dimension.
 *
 * @example
 * ```ts
 * import { CROSS_SUMS_MIN_SIDE } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * console.log(CROSS_SUMS_MIN_SIDE);
 * ```
 */
export const CROSS_SUMS_MIN_SIDE = 3;
/** The maximum supported CrossSums board dimension.
 *
 * @example
 * ```ts
 * import { CROSS_SUMS_MAX_SIDE } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * console.log(CROSS_SUMS_MAX_SIDE);
 * ```
 */
export const CROSS_SUMS_MAX_SIDE = 12;
/** The native CrossSums search-node budget.
 *
 * @example
 * ```ts
 * import { CROSS_SUMS_MAX_NODES } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * console.log(CROSS_SUMS_MAX_NODES);
 * ```
 */
export const CROSS_SUMS_MAX_NODES = 250_000;
/** The native CrossSums generation-attempt limit.
 *
 * @example
 * ```ts
 * import { CROSS_SUMS_MAX_ATTEMPTS } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * console.log(CROSS_SUMS_MAX_ATTEMPTS);
 * ```
 */
export const CROSS_SUMS_MAX_ATTEMPTS = 120;
/** The native CrossSums generation-attempt limit.
 *
 * @example
 * ```ts
 * import { CROSS_SUMS_GENERATION_ATTEMPTS } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * console.log(CROSS_SUMS_GENERATION_ATTEMPTS);
 * ```
 */
export const CROSS_SUMS_GENERATION_ATTEMPTS = 1_200;
/** The native CrossSums search-node budget.
 *
 * @example
 * ```ts
 * import { CROSS_SUMS_GENERATION_NODES } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * console.log(CROSS_SUMS_GENERATION_NODES);
 * ```
 */
export const CROSS_SUMS_GENERATION_NODES = 1_000_000;
/** How hard a puzzle is made, by what a person must do to solve it; see `rateCrossSums`.
 *
 * @example
 * ```ts
 * import { CROSS_SUMS_LEVELS } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * console.log(CROSS_SUMS_LEVELS);
 * ```
 */
export const CROSS_SUMS_LEVELS = ["easy", "medium", "hard", "extra-hard"] as const;
/** The sides on offer, counting the row and column of totals; any side from 5 to `CROSS_SUMS_MAX_SIDE` can be made.
 *
 * @example
 * ```ts
 * import { CROSS_SUMS_SIZES } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * console.log(CROSS_SUMS_SIZES);
 * ```
 */
export const CROSS_SUMS_SIZES = [6, 8, 10, 12] as const;
/** The minimum supported CrossSums board dimension for generation.
 *
 * @example
 * ```ts
 * import { CROSS_SUMS_LEAST_GENERATED_SIDE } from "@johnmorrisdotca/kazu/cross-sums";
 *
 * console.log(CROSS_SUMS_LEAST_GENERATED_SIDE);
 * ```
 */
export const CROSS_SUMS_LEAST_GENERATED_SIDE = 5;
