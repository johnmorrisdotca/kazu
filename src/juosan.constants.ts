/** The maximum supported Juosan board dimension.
 *
 * @example
 * ```ts
 * import { JUOSAN_MOST_SIDE } from "@johnmorrisdotca/kazu/juosan";
 *
 * console.log(JUOSAN_MOST_SIDE);
 * ```
 */
export const JUOSAN_MOST_SIDE = 16;
/** The native Juosan search-node budget.
 *
 * @example
 * ```ts
 * import { JUOSAN_MOST_NODES } from "@johnmorrisdotca/kazu/juosan";
 *
 * console.log(JUOSAN_MOST_NODES);
 * ```
 */
export const JUOSAN_MOST_NODES = 250_000;
/** The native Juosan generation-attempt limit.
 *
 * @example
 * ```ts
 * import { JUOSAN_MOST_ATTEMPTS } from "@johnmorrisdotca/kazu/juosan";
 *
 * console.log(JUOSAN_MOST_ATTEMPTS);
 * ```
 */
export const JUOSAN_MOST_ATTEMPTS = 500;
/** The native Juosan generation difficulty tiers.
 *
 * @example
 * ```ts
 * import { JUOSAN_LEVELS } from "@johnmorrisdotca/kazu/juosan";
 *
 * console.log(JUOSAN_LEVELS);
 * ```
 */
export const JUOSAN_LEVELS = ["easy", "medium", "hard"] as const;
