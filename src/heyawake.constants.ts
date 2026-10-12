/** The maximum supported Heyawake board dimension.
 *
 * @example
 * ```ts
 * import { HEYAWAKE_MOST_SIDE } from "@johnmorrisdotca/kazu/heyawake";
 *
 * console.log(HEYAWAKE_MOST_SIDE);
 * ```
 */
export const HEYAWAKE_MOST_SIDE = 12;
/** The maximum number of cells accepted by the Heyawake generator.
 *
 * @example
 * ```ts
 * import { HEYAWAKE_GENERATOR_MOST_CELLS } from "@johnmorrisdotca/kazu/heyawake";
 *
 * console.log(HEYAWAKE_GENERATOR_MOST_CELLS);
 * ```
 */
export const HEYAWAKE_GENERATOR_MOST_CELLS = 25;
/** The native Heyawake search-node budget.
 *
 * @example
 * ```ts
 * import { HEYAWAKE_MOST_NODES } from "@johnmorrisdotca/kazu/heyawake";
 *
 * console.log(HEYAWAKE_MOST_NODES);
 * ```
 */
export const HEYAWAKE_MOST_NODES = 250_000;
/** The native Heyawake generation-attempt limit.
 *
 * @example
 * ```ts
 * import { HEYAWAKE_MOST_ATTEMPTS } from "@johnmorrisdotca/kazu/heyawake";
 *
 * console.log(HEYAWAKE_MOST_ATTEMPTS);
 * ```
 */
export const HEYAWAKE_MOST_ATTEMPTS = 500;
/** The native Heyawake generation difficulty tiers.
 *
 * @example
 * ```ts
 * import { HEYAWAKE_LEVELS } from "@johnmorrisdotca/kazu/heyawake";
 *
 * console.log(HEYAWAKE_LEVELS);
 * ```
 */
export const HEYAWAKE_LEVELS = ["easy", "medium", "hard"] as const;
