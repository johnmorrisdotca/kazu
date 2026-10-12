/** The maximum supported Regions board dimension.
 *
 * @example
 * ```ts
 * import { REGIONS_MOST_SIDE } from "@johnmorrisdotca/kazu/regions";
 *
 * console.log(REGIONS_MOST_SIDE);
 * ```
 */
export const REGIONS_MOST_SIDE = 12;
/** The maximum number of cells accepted by the Regions generator.
 *
 * @example
 * ```ts
 * import { REGIONS_GENERATOR_MOST_CELLS } from "@johnmorrisdotca/kazu/regions";
 *
 * console.log(REGIONS_GENERATOR_MOST_CELLS);
 * ```
 */
export const REGIONS_GENERATOR_MOST_CELLS = 144;
/** The native Regions search-node budget.
 *
 * @example
 * ```ts
 * import { REGIONS_MOST_NODES } from "@johnmorrisdotca/kazu/regions";
 *
 * console.log(REGIONS_MOST_NODES);
 * ```
 */
export const REGIONS_MOST_NODES = 80_000;
/** The native Regions generation-attempt limit.
 *
 * @example
 * ```ts
 * import { REGIONS_MOST_ATTEMPTS } from "@johnmorrisdotca/kazu/regions";
 *
 * console.log(REGIONS_MOST_ATTEMPTS);
 * ```
 */
export const REGIONS_MOST_ATTEMPTS = 120;
/** How hard a puzzle is made, by what a person must do to solve it; see `rateRegions`.
 *
 * @example
 * ```ts
 * import { REGIONS_LEVELS } from "@johnmorrisdotca/kazu/regions";
 *
 * console.log(REGIONS_LEVELS);
 * ```
 */
export const REGIONS_LEVELS = ["easy", "medium", "hard", "extra-hard"] as const;
/** The sides on offer for a square board; any side from 4 to `REGIONS_MOST_SIDE` can be made.
 *
 * @example
 * ```ts
 * import { REGIONS_SIZES } from "@johnmorrisdotca/kazu/regions";
 *
 * console.log(REGIONS_SIZES);
 * ```
 */
export const REGIONS_SIZES = [6, 8, 10, 12] as const;
/** The minimum supported Regions board dimension for generation.
 *
 * @example
 * ```ts
 * import { REGIONS_LEAST_GENERATED_SIDE } from "@johnmorrisdotca/kazu/regions";
 *
 * console.log(REGIONS_LEAST_GENERATED_SIDE);
 * ```
 */
export const REGIONS_LEAST_GENERATED_SIDE = 4;
