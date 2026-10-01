// How the demo looks and holds still: a steady box, nothing selectable, finger-sized buttons, light and dark, and the
// words in Japanese, at a phone's width and a desk's.
import { expect, test } from "@playwright/test";

import { KAZU_KINDS, KAZU_SPECS } from "../dist/index.js";
import { at, grid, noSidewaysScroll, open, tap } from "./demo.mjs";

test("the board keeps one steady square whatever is written, hinted or checked, and the lines of words never move it", async ({ page }, testInfo) => {
  await open(page, "?kind=sum-cages&size=9&level=easy&seed=3");
  const box = page.locator(`${at("board")} .kzp-box`);
  // Measured on the page, not the window: pressing a button may scroll it into view.
  const measure = (locator) => locator.evaluate((node) => { const r = node.getBoundingClientRect(); return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height }; });
  const before = await measure(box);
  expect(Math.abs(before.width - before.height)).toBeLessThan(1);
  const page0 = await measure(page.locator(at("board")));
  for (const action of ["hint", "hint", "check", "pencil", "undo"]) {
    await tap(page, page.locator(`${at("board")} [data-action="${action}"]`), testInfo);
    const after = await measure(box);
    expect(Math.abs(after.width - before.width)).toBeLessThan(0.5);
    expect(Math.abs(after.height - before.height)).toBeLessThan(0.5);
    expect(Math.abs(after.y - before.y)).toBeLessThan(0.5);
  }
  // The table itself keeps its height too, because the lines of words keep the room their longest wording takes.
  const page1 = await measure(page.locator(at("board")));
  expect(Math.abs(page1.height - page0.height)).toBeLessThan(0.5);
});

test("nothing on the play surface can be selected, and every button is a finger wide", async ({ page }) => {
  await open(page);
  const surface = await page.evaluate(() => {
    const names = [".kazu-play", ".kzp-box", ".kzp-key", ".kzp-button", "svg.kazu"];
    return names.map((name) => getComputedStyle(document.querySelector(`#board ${name}`) ?? document.querySelector("#board")).userSelect);
  });
  expect(surface.every((value) => value === "none")).toBe(true);
  const small = await page.evaluate(() => [...document.querySelectorAll("#board button, nav button")].filter((one) => one.offsetParent !== null).map((one) => ({ name: one.textContent.trim() || one.dataset.action, ...one.getBoundingClientRect().toJSON() })).filter((one) => one.width < 43.5 || one.height < 43.5));
  expect(small).toEqual([]);
});

for (const kind of KAZU_KINDS) {
  test(`${kind} fits the page and is drawn at every size in light and dark, without a sideways scroll`, async ({ page }, testInfo) => {
    for (const scheme of ["light", "dark"]) {
      await page.emulateMedia({ colorScheme: scheme });
      await open(page, `?kind=${kind}&size=${KAZU_SPECS[kind].sizes.at(-1)}&level=medium&seed=4`);
      await expect(grid(page)).toBeVisible();
      await noSidewaysScroll(page);
      const paper = await page.locator(`${at("board")} .kz-paper`).evaluate((node) => getComputedStyle(node).fill);
      expect(paper).toBe(scheme === "dark" ? "rgb(38, 42, 39)" : "rgb(251, 248, 241)");
    }
    expect(testInfo.project.name).toBeTruthy();
  });
}

test("in Japanese the page, the board and the hint all speak Japanese, and nothing sticks out of the page", async ({ page }, testInfo) => {
  await open(page, "?kind=towers&size=5&level=easy&seed=2&lang=ja");
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  await expect(page.locator(`${at("board")} [data-action="hint"]`)).toHaveText("ヒント");
  await expect(grid(page)).toHaveAttribute("aria-label", "摩天楼、5×5");
  await tap(page, page.locator(`${at("board")} [data-action="hint"]`), testInfo);
  await expect(page.locator(`${at("board")} .kzp-says`)).toContainText("しか入りません");
  await noSidewaysScroll(page);
});
