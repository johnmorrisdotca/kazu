import { test, expect } from "@playwright/test";
import { serve, noSidewaysScroll } from "./demo.mjs";

test("Ripple Effect rooms, pencil notes, undo, hints, restore and appearance", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await serve(page);
  await page.goto("http://kazu.test/ripple.html?seed=42");
  await expect(page.locator(".rp-cell")).toHaveCount(81);
  await expect(page.locator(".rp-cell[aria-disabled=true]")).toHaveCount(46);
  await page.getByRole("button", { name: "Hint", exact: true }).click();
  await expect(page.locator(".rp-cell:not(:disabled)").filter({ hasText: /^[1-9]$/ })).not.toHaveCount(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  const empty = page.locator('.rp-cell[data-clue="false"]').first();
  const cell = await empty.getAttribute("data-cell");
  await empty.focus(); await page.keyboard.press("p"); await page.keyboard.press("3");
  await expect(page.locator(`[data-cell="${cell}"] .rp-notes`)).toContainText("3");
  await page.getByRole("button", { name: "Just the board", exact: true }).click();
  await expect(page.locator("dialog")).toBeVisible(); await page.keyboard.press("Escape");
  await page.locator("#material").selectOption("slate"); await page.locator("#pieces").selectOption("tiles");
  await page.getByRole("button", { name: "日本語", exact: true }).click();
  await expect(page.getByRole("button", { name: "戻す", exact: true })).toBeVisible();
  await noSidewaysScroll(page);
  await page.goto("http://kazu.test/ripple.html");
  await expect(page.locator(`[data-cell="${cell}"] .rp-notes`)).toContainText("3");
  expect(errors).toEqual([]);
});
