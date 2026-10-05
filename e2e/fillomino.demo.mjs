import { test, expect } from "@playwright/test";
import { serve, noSidewaysScroll } from "./demo.mjs";

test("Fillomino accepts entries, undo and hints, and restores assisted progress", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await serve(page);
  await page.goto("http://kazu.test/fillomino.html?width=4&height=4&level=easy&seed=17");
  await expect(page.locator(".fillomino-cell")).toHaveCount(16);
  const editable = page.locator('.fillomino-cell[aria-label*="empty"]').first();
  await editable.click();
  await page.locator("select[data-number]").selectOption("2");
  await page.getByRole("button", { name: "Enter", exact: true }).click();
  await expect(page.locator('.fillomino-cell[aria-label*="filled"]')).not.toHaveCount(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.getByRole("button", { name: "Hint", exact: true }).click();
  await expect(page.locator(".fillomino-status")).toContainText("follows from the only complete solution");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("kazu-fillomino-v1")).progress)).toContain('"helped":true');
  await page.getByRole("button", { name: "日本語", exact: true }).click();
  await expect(page.getByRole("button", { name: "戻す", exact: true })).toBeVisible();
  await page.locator("#material").selectOption("slate");
  await page.locator("#pieces").selectOption("tiles");
  await noSidewaysScroll(page);
  await page.goto("http://kazu.test/fillomino.html");
  await expect(page.locator('.fillomino-cell[aria-label*="入力済み"]')).not.toHaveCount(0);
  expect(errors).toEqual([]);
});
