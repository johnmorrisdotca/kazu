/** The native Hitori search-node budget.
 *
 * @example
 * ```ts
 * import { HITORI_MAX_NODES } from "@johnmorrisdotca/kazu/hitori";
 *
 * console.log(HITORI_MAX_NODES);
 * ```
 */
export const HITORI_MAX_NODES = 300_000;
/** The sides on offer; any side from 4 to `HITORI_MOST_SIDE` is a board `isHitoriBoard` takes.
 *
 * @example
 * ```ts
 * import { HITORI_SIZES } from "@johnmorrisdotca/kazu/hitori";
 *
 * console.log(HITORI_SIZES);
 * ```
 */
export const HITORI_SIZES = [5, 6, 7, 8, 9, 10, 12] as const;
/** The maximum supported Hitori board dimension.
 *
 * @example
 * ```ts
 * import { HITORI_MOST_SIDE } from "@johnmorrisdotca/kazu/hitori";
 *
 * console.log(HITORI_MOST_SIDE);
 * ```
 */
export const HITORI_MOST_SIDE = 12;
/** The minimum supported Hitori board dimension.
 *
 * @example
 * ```ts
 * import { HITORI_LEAST_SIDE } from "@johnmorrisdotca/kazu/hitori";
 *
 * console.log(HITORI_LEAST_SIDE);
 * ```
 */
export const HITORI_LEAST_SIDE = 4;
/** How hard a puzzle is made, by what a person must do to solve it; see `rateHitori`.
 *
 * @example
 * ```ts
 * import { HITORI_LEVELS } from "@johnmorrisdotca/kazu/hitori";
 *
 * console.log(HITORI_LEVELS);
 * ```
 */
export const HITORI_LEVELS = ["easy", "medium", "hard", "extra-hard"] as const;
/** The native Hitori generation-attempt limit.
 *
 * @example
 * ```ts
 * import { HITORI_MOST_ATTEMPTS } from "@johnmorrisdotca/kazu/hitori";
 *
 * console.log(HITORI_MOST_ATTEMPTS);
 * ```
 */
export const HITORI_MOST_ATTEMPTS = 600;
