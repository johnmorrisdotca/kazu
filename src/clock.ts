/** A time taken, as a clock shows it: `m:ss`, and `h:mm:ss` past an hour.
 *
 * @param ms - Elapsed milliseconds to format.
 * @returns A time taken, as a clock shows it: `m:ss`, and `h:mm:ss` past an hour.
 * @example
 * ```ts
 * import { kazuClockText } from "@johnmorrisdotca/kazu/play";
 *
 * console.log(kazuClockText(65000));
 * ```
 */
export function kazuClockText(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const s = seconds % 60;
  const m = Math.floor(seconds / 60) % 60;
  const h = Math.floor(seconds / 3600);
  const two = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${two(m)}:${two(s)}` : `${m}:${two(s)}`;
}
