import { expect, test } from "@playwright/test";

import { serve } from "./demo.mjs";

test("Masyu draws a loop edge, saves it, and restores progress", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await serve(page);
  await page.goto("http://kazu.test/masyu.html?seed=3");
  const cells = page.locator(".km-cell");
  await expect(cells).toHaveCount(25);
  await cells.nth(0).click();
  await cells.nth(1).click();
  await expect.poll(async () => page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("kazu-masyu-progress"));
    return JSON.parse(saved.progress).edges.length;
  })).toBe(1);

  await page.reload();
  await expect(page.locator(".kazu-masyu svg line")).toHaveCount(1);
  await expect.poll(async () => page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("kazu-masyu-progress"));
    return JSON.parse(saved.progress).edges.length;
  })).toBe(1);
  expect(errors).toEqual([]);
});

test("Masyu can join neighbouring cells from the keyboard", async ({ page }, testInfo) => {
  test.skip(testInfo.project.use.hasTouch === true, "keyboard input");
  await serve(page);
  await page.goto("http://kazu.test/masyu.html?seed=4");
  const first = page.locator('.km-cell[data-cell="0"]');
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(page.locator(".kazu-masyu svg line")).toHaveCount(1);
});
