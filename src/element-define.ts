/**
 * Defines the `<kazu-board>` element on the page. Import it for its effect:
 *
 * ```html
 * <script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/kazu@1/dist/element-define.js"></script>
 * <kazu-board kind="number-place" size="9" level="medium"></kazu-board>
 * ```
 *
 * A tag already defined is left as it is, and on a server, where there is no page, nothing happens.
 */
import { defineBoard } from "./element.ts";
defineBoard();
export * from "./element.ts";
