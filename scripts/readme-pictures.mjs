// Takes the pictures the README shows, from the built demo in `site/`: `pnpm pictures` (builds the demo, then runs this).
// The page is served to a browser without a port, never fetched from the live site, and the same each run: the puzzle is
// named by its address (a seed), a fixed set of its cells is filled from its answer by tapping, and motion is reduced.
// It waits on the board's own svg, and on the page saying how many cells are filled, never on a clock.
// Output: docs/desktop.jpg (1280 wide, light, English) and docs/phone.jpg (390 by 844, dark, Japanese).
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

import { decodeCells, generateKazu, readGivens } from "../dist/index.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = join(root, "site");
const docs = join(root, "docs");
const host = "http://kazu.test";
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
const QUALITY = 76;

if (!existsSync(join(site, "index.html"))) throw new Error("site/ is not built: run `pnpm pictures` (it builds the demo first)");
const browser = await chromium.launch();

/** A puzzle by its address, with every `every`th empty cell filled in from its answer (a number tapped on the pad), and one cell chosen. */
async function shot({ width, height, colorScheme, lang, kind, size, level, seed, every, path, scrollTo, touch }) {
  const puzzle = generateKazu(kind, size, level, seed);
  const answer = decodeCells(puzzle.solution, size);
  const printed = readGivens(kind, size, puzzle.givens).cells;
  const empty = printed.flatMap((value, index) => (value === 0 ? [index] : []));
  const context = await browser.newContext({ viewport: { width, height }, colorScheme, reducedMotion: "reduce", locale: "en-US", deviceScaleFactor: 2, hasTouch: touch, isMobile: touch });
  const page = await context.newPage();
  await page.route(`${host}/**`, (route) => {
    const { pathname } = new URL(route.request().url());
    const file = join(site, pathname === "/" ? "index.html" : pathname);
    if (!existsSync(file)) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ body: readFileSync(file), contentType: TYPES[file.slice(file.lastIndexOf("."))] ?? "application/octet-stream" });
  });
  await page.goto(`${host}/?kind=${kind}&size=${size}&level=${level}&seed=${seed}&lang=${lang}`);
  await page.waitForSelector('[data-testid="board"][data-ready="true"] svg.kazu');
  const filled = empty.filter((_, at) => at % every === 0);
  for (const index of filled) {
    await page.locator(`#board .kz-hit[data-cell="${index}"]`).click();
    await page.locator(`#board .kzp-key[data-value="${answer[index]}"]`).click();
  }
  // One more cell chosen, so its row, column and group are washed, as they are when somebody is playing.
  await page.locator(`#board .kz-hit[data-cell="${empty.find((index) => !filled.includes(index))}"]`).click();
  await page.waitForFunction((count) => Number(document.getElementById("board").dataset.filled) >= count, filled.length);
  if (scrollTo) await page.locator(scrollTo).evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 4));
  else await page.evaluate(() => window.scrollTo(0, 0));
  await page.mouse.move(0, 0);
  await page.screenshot({ path, type: "jpeg", quality: QUALITY });
  await context.close();
}

// A Killer Sudoku on a desk, from the top of the page so the header, the language chooser, the cloth patches, the choices and the board all show.
await shot({ width: 1280, height: 1420, colorScheme: "light", lang: "en", kind: "sum-cages", size: 9, level: "medium", seed: 7, every: 3, path: join(docs, "desktop.jpg"), touch: false });
// Skyscrapers on a phone in dark mode and Japanese, scrolled to the board.
await shot({ width: 390, height: 844, colorScheme: "dark", lang: "ja", kind: "towers", size: 6, level: "medium", seed: 3, every: 3, path: join(docs, "phone.jpg"), scrollTo: "#board", touch: true });
await browser.close();
