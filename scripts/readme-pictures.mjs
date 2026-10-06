// Takes the pictures the README shows, from the built demo in `site/`: `pnpm screenshots:readme` (builds the demo, then runs this).
// The family's standard is in johnmorrisdotca/.github (README-STANDARD.md); the shared part is readme-pictures-lib.mjs.
// The page is served to a browser without a port, never fetched from the live site, and the same each run: a puzzle is named by
// its address (a seed), a fixed share of its empty cells is filled in from its answer by tapping, and motion is reduced. It
// waits on the board's own svg, and on the page saying how many cells are filled, never on a clock.
// Output: docs/images/<subject>-<desk|phone>-<light|dark>.webp.
import { decodeCells, generateKazu, readGivens } from "../dist/index.js";
import { takePictures } from "./readme-pictures-lib.mjs";

const READY = '[data-testid="board"][data-ready="true"] svg.kazu';
const OTHER = "#board svg, #board button";
const address = (query, lang = "en") => `/?lang=${lang}&help=off&${query}`;

/** Fill every `every`th empty cell of a number puzzle from its answer (a number tapped on the pad), and choose one more cell. */
const fill = ({ kind, size, level, seed, every }) => async (page) => {
  const puzzle = generateKazu(kind, size, level, seed);
  const answer = decodeCells(puzzle.solution, size);
  const printed = readGivens(kind, size, puzzle.givens).cells;
  const empty = printed.flatMap((value, index) => (value === 0 ? [index] : []));
  const filled = empty.filter((_, at) => at % every === 0);
  for (const index of filled) {
    await page.locator(`#board .kz-hit[data-cell="${index}"]`).click();
    await page.locator(`#board .kzp-key[data-value="${answer[index]}"]`).click();
  }
  await page.locator(`#board .kz-hit[data-cell="${empty.find((index) => !filled.includes(index))}"]`).click();
  await page.waitForFunction((count) => Number(document.getElementById("board").dataset.filled) >= count, filled.length);
};
const scrollTo = (selector) => (page) => page.locator(selector).evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 4));

/** A number puzzle on the main page, part filled in. */
const number = (subject, kind, size, level, seed) => ({
  subject,
  views: ["desk"],
  url: address(`kind=${kind}&size=${size}&level=${level}&seed=${seed}`),
  ready: READY,
  target: "#board",
  prepare: fill({ kind, size, level, seed, every: 3 }),
});
/** A puzzle with a page of its own, as it opens on a seed. */
const page = (subject, file, query = "seed=42") => ({ subject, views: ["desk"], url: `/${file}.html?lang=en&help=off&${query}`, ready: OTHER, target: "section.panel" });

await takePictures({
  shots: [
    // A Killer Sudoku on a desk, from the top of the page so the header, the choices and the board all show. On a phone, in Japanese: Skyscrapers, scrolled to the board.
    {
      subject: "hero",
      views: ["desk", "phone"],
      url: address("kind=sum-cages&size=9&level=medium&seed=7"),
      ready: READY,
      height: 1420,
      async prepare(page, { view }) {
        if (view === "phone") {
          await page.goto(`http://kazu.test${address("kind=towers&size=6&level=medium&seed=3", "ja")}`);
          await page.waitForSelector(READY);
          await fill({ kind: "towers", size: 6, level: "medium", seed: 3, every: 3 })(page);
          await scrollTo("#board")(page);
        } else {
          await fill({ kind: "sum-cages", size: 9, level: "medium", seed: 7, every: 3 })(page);
          await page.evaluate(() => window.scrollTo(0, 0));
        }
      },
    },
    number("sudoku", "number-place", 9, "medium", 7),
    number("jigsaw", "jigsaw", 7, "medium", 7),
    number("diagonal", "diagonal", 9, "medium", 7),
    number("killer", "sum-cages", 6, "medium", 7),
    number("futoshiki", "more-or-less", 5, "medium", 7),
    number("skyscrapers", "towers", 5, "medium", 7),
    page("shikaku", "shikaku"),
    page("hitori", "hitori"),
    page("nurikabe", "nurikabe"),
    page("akari", "akari"),
    page("juosan", "juosan"),
    page("loop", "loop"),
    page("masyu", "masyu"),
    page("yajilin", "yajilin"),
    page("ripple", "ripple"),
    page("cross-sums", "cross-sums"),
    page("regions", "regions"),
    page("heyawake", "heyawake"),
  ],
});
