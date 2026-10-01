// The <kazu-board> element, on a page of its own: made from a seed or from givens, played, its events, its words in
// either language, and changing an attribute.
import { expect, test } from "@playwright/test";

import { decodeCells, generateKazu, readGivens } from "../dist/index.js";
import { at, bare, tap } from "./demo.mjs";

test("a tag with a kind, size, level and seed draws that very puzzle, and an event tells every change and the solve", async ({ page }, testInfo) => {
  const errors = await bare(page, `<kazu-board id="b" kind="number-place" size="4" level="easy" seed="3"></kazu-board>`);
  const puzzle = generateKazu("number-place", 4, "easy", 3);
  const printed = readGivens("number-place", 4, puzzle.givens).cells;
  const answer = decodeCells(puzzle.solution, 4);
  await page.waitForSelector("#b svg.kazu");
  await page.evaluate(() => {
    window.heard = [];
    for (const name of ["kazu-change", "kazu-solve"]) document.getElementById("b").addEventListener(name, (event) => window.heard.push([name, event.detail.run, event.detail.solved, event.detail.progress.filled]));
  });
  const empty = printed.flatMap((value, index) => (value === 0 ? [index] : []));
  for (const index of empty) {
    await tap(page, page.locator(`#b .kz-hit[data-cell="${index}"]`), testInfo);
    await tap(page, page.locator(`#b .kzp-key[data-value="${answer[index]}"]`), testInfo);
  }
  const heard = await page.evaluate(() => window.heard);
  expect(heard.filter(([name]) => name === "kazu-change")).toHaveLength(empty.length);
  const solved = heard.filter(([name]) => name === "kazu-solve");
  expect(solved).toHaveLength(1);
  expect(solved[0][2]).toBe(true);
  expect(solved[0][1].replace(/\./g, "")).toHaveLength(empty.length);
  await expect(page.locator("#b svg.kazu")).toHaveAttribute("data-solved", "true");
  expect(errors).toEqual([]);
});

test("a tag with givens of its own plays them, and a run kept before opens as it was", async ({ page }) => {
  const puzzle = generateKazu("towers", 5, "easy", 9);
  const answer = decodeCells(puzzle.solution, 5);
  const printed = readGivens("towers", 5, puzzle.givens).cells;
  const first = printed.findIndex((value) => value === 0);
  const run = answer.map((value, index) => (index === first ? value : 0)).map((value) => (value === 0 ? "." : String(value))).join("");
  await bare(page, `<kazu-board id="b" kind="towers" size="5" givens="${puzzle.givens}" solution="${puzzle.solution}" run="${run}"></kazu-board>`);
  await page.waitForSelector("#b svg.kazu");
  await expect(page.locator(`#b text.kz-entry[data-cell="${first}"]`)).toHaveText(String(answer[first]));
  await expect(page.locator("#b .kz-clue").first()).toBeVisible();
  expect(await page.evaluate(() => document.getElementById("b").detail.progress.filled)).toBe(printed.filter((value) => value !== 0).length + 1);
});

test("its words are English or Japanese as the page's lang says, follow the page when it changes, and lang on the tag wins", async ({ page }) => {
  await bare(page, `<kazu-board id="b" kind="number-place" size="4" level="easy" seed="3"></kazu-board><kazu-board id="c" kind="number-place" size="4" level="easy" seed="3" lang="ja"></kazu-board>`);
  await page.waitForSelector("#b svg.kazu");
  await expect(page.locator("#b [data-action='hint']")).toHaveText("Hint");
  await expect(page.locator("#c [data-action='hint']")).toHaveText("ヒント");
  await page.evaluate(() => document.documentElement.setAttribute("lang", "ja"));
  await expect(page.locator("#b [data-action='hint']")).toHaveText("ヒント");
  await expect(page.locator("#b svg.kazu")).toHaveAttribute("aria-label", "ナンプレ、4×4");
  await page.locator("#b [data-action='hint']").click();
  await expect(page.locator("#b .kzp-says")).toContainText("しか入りません");
  await page.evaluate(() => document.documentElement.setAttribute("lang", "en"));
  await expect(page.locator("#b [data-action='hint']")).toHaveText("Hint");
  await expect(page.locator("#c [data-action='hint']")).toHaveText("ヒント");
});

test("changing an attribute changes the board: a new level makes a new puzzle, hints=off takes the button away, clock=off hides the clock", async ({ page }) => {
  await bare(page, `<kazu-board id="b" kind="jigsaw" size="6" level="easy" seed="5"></kazu-board>`);
  await page.waitForSelector("#b svg.kazu");
  const before = await page.locator("#b svg.kazu").innerHTML();
  await page.evaluate(() => document.getElementById("b").setAttribute("seed", "6"));
  await expect(async () => expect(await page.locator("#b svg.kazu").innerHTML()).not.toBe(before)).toPass();
  await page.evaluate(() => document.getElementById("b").setAttribute("hints", "off"));
  await expect(page.locator("#b [data-action='hint']")).toBeHidden();
  await page.evaluate(() => document.getElementById("b").setAttribute("clock", "off"));
  await expect(page.locator("#b .kzp-clock")).toBeHidden();
  await page.evaluate(() => document.getElementById("b").setAttribute("kind", "towers"));
  await expect(page.locator("#b svg.kazu")).toHaveAttribute("data-kind", "towers");
});

test("the tag on the demo page is a Killer Sudoku that points at its hint without filling it in", async ({ page }, testInfo) => {
  await bare(page, `<kazu-board id="b" kind="sum-cages" size="6" level="easy" seed="42" hints="show"></kazu-board>`);
  await page.waitForSelector("#b svg.kazu");
  await expect(page.locator("#b .kz-cage-sum").first()).toBeVisible();
  const filled = await page.evaluate(() => document.getElementById("b").detail.progress.filled);
  await tap(page, page.locator("#b [data-action='hint']"), testInfo);
  expect(await page.evaluate(() => document.getElementById("b").detail.progress.filled)).toBe(filled);
  await expect(page.locator("#b .kz-hint")).toHaveCount(1);
  expect(at("b")).toBeTruthy();
});
