// The demo, played as a person plays it: tap a cell, tap a number, make notes, undo, ask for a hint, check, and solve.
// What the page shows is held to what the package says of the same puzzle.
import { expect, test } from "@playwright/test";

import { conflictsOf, decodeCells, generateKazu, hintKazu, KAZU_KINDS, KAZU_SPECS, readGivens } from "../dist/index.js";
import { at, cell, grid, noSidewaysScroll, open, tap } from "./demo.mjs";

const key = (page, value) => page.locator(`${at("board")} .kzp-key[data-value="${value}"]`);
const button = (page, name) => page.locator(`${at("board")} [data-action="${name}"]`);
const says = (page) => page.locator(`${at("board")} .kzp-says`);
const notesIn = (page) => page.locator(`${at("board")} svg.kazu .kz-note`);
const valueAt = async (page, index) => {
  const digit = page.locator(`${at("board")} svg.kazu text.kz-digit[data-cell="${index}"]`);
  return (await digit.count()) === 0 ? null : digit.textContent();
};

/** The puzzle the demo makes for an address, made here by the package: the same puzzle and its answer. */
const made = (kind, size, level, seed) => {
  const puzzle = generateKazu(kind, size, level, seed);
  return { puzzle, printed: readGivens(kind, size, puzzle.givens).cells, answer: decodeCells(puzzle.solution, size) };
};
const emptyCells = (m) => m.printed.flatMap((value, index) => (value === 0 ? [index] : []));

test("a first visit draws the puzzle its address names, with the numbers the package printed", async ({ page }) => {
  const errors = await open(page, "?kind=number-place&size=9&level=easy&seed=3");
  const m = made("number-place", 9, "easy", 3);
  await expect(grid(page)).toHaveAttribute("data-kind", "number-place");
  await expect(page.locator(`${at("board")} .kz-hit`)).toHaveCount(81);
  const printed = await page.locator(`${at("board")} text.kz-given`).evaluateAll((nodes) => nodes.map((node) => [Number(node.dataset.cell), node.textContent]));
  expect(printed).toEqual(m.printed.flatMap((value, index) => (value === 0 ? [] : [[index, String(value)]])));
  await expect(page.locator(at("board"))).toHaveAttribute("data-seed", "3");
  await expect(page.locator(at("seed"))).toHaveText("Seed 3");
  expect(errors).toEqual([]);
  await noSidewaysScroll(page);
});

test("a cell tapped and a number tapped writes it, and the puzzle is solved when every cell is right", async ({ page }, testInfo) => {
  await open(page, "?kind=number-place&size=4&level=easy&seed=3");
  const m = made("number-place", 4, "easy", 3);
  const cells = emptyCells(m);
  for (const index of cells.slice(0, -1)) {
    await tap(page, cell(page, index), testInfo);
    await tap(page, key(page, m.answer[index]), testInfo);
    await expect(page.locator(`${at("board")} text.kz-entry[data-cell="${index}"]`)).toHaveText(String(m.answer[index]));
  }
  await expect(grid(page)).not.toHaveAttribute("data-solved", "true");
  const last = cells.at(-1);
  await tap(page, cell(page, last), testInfo);
  await tap(page, key(page, m.answer[last]), testInfo);
  await expect(grid(page)).toHaveAttribute("data-solved", "true");
  await expect(says(page)).toContainText("Solved");
  await expect(page.locator(at("board"))).toHaveAttribute("data-solved", "true");
  await expect(key(page, 1)).toBeDisabled();
});

test("a number that breaks a rule is drawn in red as it is written, and goes when it is taken away", async ({ page }, testInfo) => {
  await open(page, "?kind=number-place&size=9&level=easy&seed=3");
  const m = made("number-place", 9, "easy", 3);
  const [a] = emptyCells(m);
  // The same number as a printed cell in its row, which repeats it.
  const row = Math.floor(a / 9);
  const twin = m.printed.findIndex((value, index) => value !== 0 && Math.floor(index / 9) === row);
  await tap(page, cell(page, a), testInfo);
  await tap(page, key(page, m.printed[twin]), testInfo);
  await expect(page.locator(`${at("board")} .kz-conflict`)).toHaveCount(conflictsOf(readGivens("number-place", 9, made("number-place", 9, "easy", 3).puzzle.givens), m.printed.map((value, index) => (index === a ? m.printed[twin] : value))).length);
  await tap(page, button(page, "erase"), testInfo);
  await expect(page.locator(`${at("board")} .kz-conflict`)).toHaveCount(0);
});

test("Pencil writes small notes instead of a number, a number written takes itself out of the notes beside it, and Undo takes each back", async ({ page }, testInfo) => {
  await open(page, "?kind=number-place&size=9&level=easy&seed=3");
  const m = made("number-place", 9, "easy", 3);
  const [a] = emptyCells(m);
  const mate = emptyCells(m).find((index) => index !== a && Math.floor(index / 9) === Math.floor(a / 9));
  await tap(page, button(page, "pencil"), testInfo);
  await expect(button(page, "pencil")).toHaveAttribute("aria-pressed", "true");
  await tap(page, cell(page, a), testInfo);
  await tap(page, key(page, 4), testInfo);
  await tap(page, key(page, 7), testInfo);
  await tap(page, cell(page, mate), testInfo);
  await tap(page, key(page, 4), testInfo);
  await expect(notesIn(page)).toHaveCount(3);
  await tap(page, button(page, "pencil"), testInfo);
  await tap(page, cell(page, a), testInfo);
  await tap(page, key(page, 4), testInfo);
  // Its own notes are gone, and the 4 is out of its row's: only the 7 is left of what was written.
  await expect(notesIn(page)).toHaveCount(0);
  expect(await valueAt(page, a)).toBe("4");
  await tap(page, button(page, "undo"), testInfo);
  await expect(notesIn(page)).toHaveCount(3);
});

test("tapping the chosen cell again steps its number on, and round to empty", async ({ page }, testInfo) => {
  await open(page, "?kind=number-place&size=4&level=easy&seed=3");
  const [a] = emptyCells(made("number-place", 4, "easy", 3));
  await tap(page, cell(page, a), testInfo);
  for (const expected of ["1", "2", "3", "4", null, "1"]) {
    await tap(page, cell(page, a), testInfo);
    expect(await valueAt(page, a)).toBe(expected);
  }
});

test("Hint fills in the next cell and says why, and a hint that only points leaves the cell empty", async ({ page }, testInfo) => {
  await open(page, "?kind=number-place&size=9&level=easy&seed=3");
  const m = made("number-place", 9, "easy", 3);
  const hint = hintKazu("number-place", 9, m.puzzle.givens, new Array(81).fill(0), m.puzzle.solution);
  await tap(page, button(page, "hint"), testInfo);
  expect(await valueAt(page, hint.cell)).toBe(String(hint.value));
  await expect(says(page)).toContainText(`row ${Math.floor(hint.cell / 9) + 1}, column ${(hint.cell % 9) + 1}`);
  await expect(says(page)).toContainText(hint.why === "only-place" ? "can only go in" : "can only be");
  await expect(page.locator(`${at("board")} .kz-hint`)).toHaveCount(1);
  // Points only.
  await tap(page, page.locator(`${at("hints")} button[data-value="show"]`), testInfo);
  await tap(page, button(page, "hint"), testInfo);
  const next = hintKazu("number-place", 9, m.puzzle.givens, [...new Array(81).fill(0).map((_, i) => (i === hint.cell ? hint.value : 0))], m.puzzle.solution);
  expect(await valueAt(page, next.cell)).toBeNull();
  await expect(page.locator(`${at("board")} .kz-hint`)).toHaveCount(1);
});

test("Check says how many cells are wrong, never which, until it is asked to mark them", async ({ page }, testInfo) => {
  await open(page, "?kind=number-place&size=4&level=easy&seed=3");
  const m = made("number-place", 4, "easy", 3);
  const [a, b] = emptyCells(m);
  await tap(page, cell(page, a), testInfo);
  await tap(page, key(page, (m.answer[a] % 4) + 1), testInfo);
  await tap(page, cell(page, b), testInfo);
  await tap(page, key(page, m.answer[b]), testInfo);
  await tap(page, button(page, "check"), testInfo);
  await expect(says(page)).toContainText(`1 cell is wrong, ${emptyCells(m).length - 2} still to fill.`);
  await expect(page.locator(`${at("board")} .kz-wrong`)).toHaveCount(0);
  await tap(page, page.locator(`${at("check")} button[data-value="show"]`), testInfo);
  await tap(page, button(page, "check"), testInfo);
  await expect(page.locator(`${at("board")} .kz-wrong`)).toHaveCount(1);
});

test("the arrows move, a number key fills, Backspace empties and N turns Pencil on, from the keyboard", async ({ page }, testInfo) => {
  test.skip(testInfo.project.use.hasTouch === true, "a keyboard");
  await open(page, "?kind=number-place&size=4&level=easy&seed=3");
  const m = made("number-place", 4, "easy", 3);
  const [a] = emptyCells(m);
  await page.locator(`${at("board")} .kzp-box`).focus();
  // Focus chooses the first cell; walk to the first empty one.
  for (let step = 0; step < a; step += 1) await page.keyboard.press("ArrowRight");
  await page.keyboard.press(String(m.answer[a]));
  expect(await valueAt(page, a)).toBe(String(m.answer[a]));
  await page.keyboard.press("Backspace");
  expect(await valueAt(page, a)).toBeNull();
  await page.keyboard.press("n");
  await expect(button(page, "pencil")).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("2");
  await expect(notesIn(page)).toHaveCount(1);
  await page.keyboard.press("Control+z");
  await expect(notesIn(page)).toHaveCount(0);
});

test("the clock starts on the first entry, and Restart empties the grid and the clock", async ({ page }, testInfo) => {
  await open(page, "?kind=number-place&size=4&level=easy&seed=3");
  const m = made("number-place", 4, "easy", 3);
  const [a] = emptyCells(m);
  await expect(page.locator(`${at("board")} .kzp-clock`)).toHaveText("0:00");
  await tap(page, cell(page, a), testInfo);
  await tap(page, key(page, m.answer[a]), testInfo);
  await expect(page.locator(`${at("board")} .kzp-clock`)).not.toHaveText("0:00", { timeout: 5000 });
  await tap(page, page.locator(at("restart")), testInfo);
  expect(await valueAt(page, a)).toBeNull();
  await expect(page.locator(`${at("board")} .kzp-clock`)).toHaveText("0:00");
});

for (const kind of KAZU_KINDS) {
  test(`${kind} is chosen, drawn at each of its sizes, with what it prints, and fits the page`, async ({ page }, testInfo) => {
    const errors = await open(page);
    await tap(page, page.locator(`${at("kinds")} button[data-value="${kind}"]`), testInfo);
    await expect(grid(page)).toHaveAttribute("data-kind", kind);
    for (const size of KAZU_SPECS[kind].sizes) {
      await tap(page, page.locator(`${at("sizes")} button[data-value="${size}"]`), testInfo);
      await expect(grid(page)).toHaveAttribute("data-size", String(size));
      await expect(page.locator(`${at("board")} .kz-hit`)).toHaveCount(size * size);
      if (kind === "towers") await expect(page.locator(`${at("board")} .kz-clue`).first()).toBeVisible();
      if (kind === "sum-cages") await expect(page.locator(`${at("board")} .kz-cage-sum`).first()).toBeVisible();
      if (kind === "more-or-less") expect(await page.locator(`${at("board")} .kz-mark`).count()).toBeGreaterThan(0);
      if (kind === "diagonal") expect(await page.locator(`${at("board")} .kz-diagonal`).count()).toBe(size % 2 === 1 ? 2 * size - 1 : 2 * size);
      await noSidewaysScroll(page);
    }
    expect(errors).toEqual([]);
    const address = new URL(page.url()).searchParams;
    expect(address.get("kind")).toBe(kind);
  });
}

test("New puzzle makes another from a new seed and puts it in the address; the same address makes the same puzzle again", async ({ page }, testInfo) => {
  await open(page, "?kind=jigsaw&size=6&level=easy&seed=11");
  const before = await grid(page).innerHTML();
  await tap(page, page.locator(at("new")), testInfo);
  await expect(page.locator(at("seed"))).not.toHaveText("Seed 11");
  expect(await grid(page).innerHTML()).not.toBe(before);
  await page.goto("http://kazu.test/?kind=jigsaw&size=6&level=easy&seed=11");
  await page.waitForSelector(`${at("board")}[data-ready="true"] svg.kazu`);
  expect(await grid(page).innerHTML()).toBe(before);
});

test("a puzzle half done is kept on this device and opens as it was left", async ({ page }, testInfo) => {
  await open(page, "?kind=number-place&size=4&level=easy&seed=3");
  const m = made("number-place", 4, "easy", 3);
  const [a] = emptyCells(m);
  await tap(page, cell(page, a), testInfo);
  await tap(page, key(page, m.answer[a]), testInfo);
  await page.reload();
  await page.waitForSelector(`${at("board")}[data-ready="true"] svg.kazu`);
  expect(await valueAt(page, a)).toBe(String(m.answer[a]));
});
