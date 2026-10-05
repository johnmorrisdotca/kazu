import { expect, test } from "@playwright/test";

import { serve } from "./demo.mjs";

test("Yajilin shades a playable cell, saves it, and restores the mark", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await serve(page);
  await page.goto("http://kazu.test/yajilin.html?seed=17");
  const cells = page.locator(".ky-cell");
  await expect(cells).toHaveCount(25);
  await page.getByRole("button", { name: "Shade", exact: true }).click();
  const openCell = page.locator('.ky-cell:not([data-clue="true"])').first();
  await openCell.click();
  await expect.poll(async () => page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("kazu-yajilin-progress"));
    return JSON.parse(saved.progress).shaded.filter(Boolean).length;
  })).toBe(1);

  await page.reload();
  await expect(page.locator('.ky-cell[aria-label$=", shaded"]')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("Yajilin joins neighbouring cells from the keyboard", async ({ page }, testInfo) => {
  test.skip(testInfo.project.use.hasTouch === true, "keyboard input");
  await serve(page);
  await page.goto("http://kazu.test/yajilin.html?seed=4");
  await page.locator('.ky-cell[data-cell="0"]').focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(page.locator(".kazu-yajilin svg line")).toHaveCount(1);
});
