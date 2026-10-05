import { test, expect } from "@playwright/test";
import { serve, noSidewaysScroll } from "./demo.mjs";

test("Shikaku rectangles, undo, hints, language, materials and restore", async ({ page }) => {
  const errors = []; page.on("pageerror", e => errors.push(String(e)));
  await serve(page); await page.goto("http://kazu.test/shikaku.html?seed=42");
  await expect(page.locator(".ks-cell")).toHaveCount(49);
  await page.locator('.ks-cell[data-cell="0"]').click();
  await expect(page.getByRole("status").last()).toHaveText("Choose the opposite corner.");
  await page.locator('.ks-cell[data-cell="1"]').click();
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.getByRole("status").last()).toContainText("Some rectangles");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByRole("button", { name: "Undo", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Hint", exact: true }).click();
  await expect(page.getByRole("status").last()).toContainText("only remaining");
  await page.getByRole("button", { name: "Just the board", exact: true }).click();
  await expect(page.locator("dialog")).toBeVisible(); await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).toHaveCount(0);
  await page.locator("#material").selectOption("slate"); await page.locator("#pieces").selectOption("tiles");
  await page.getByRole("button", { name: "日本語", exact: true }).click();
  await expect(page.getByRole("button", { name: "戻す", exact: true })).toBeVisible();
  await noSidewaysScroll(page);
  await page.goto("http://kazu.test/shikaku.html");
  await expect(page.locator('.ks-cell[aria-label*="長方形の中"], .ks-cell[aria-label*="in a rectangle"]')).not.toHaveCount(0);
  expect(errors).toEqual([]);
});


test("the named challenge selector starts square, wide and tall pack puzzles", async ({ page }) => {
  await serve(page); await page.goto("http://kazu.test/shikaku.html");
  await page.locator("#pack").selectOption("wide"); await page.locator("#challenge").selectOption("2");
  await page.getByRole("button", { name: "Play challenge", exact: true }).click();
  await expect(page.locator("#notice")).toContainText("The Long Table · Causeway");
  await expect(page.locator("#summary")).toContainText("10 × 6");
  await page.locator("#pack").selectOption("tall"); await page.locator("#challenge").selectOption("3");
  await page.getByRole("button", { name: "Play challenge", exact: true }).click();
  await expect(page.locator("#notice")).toContainText("The Narrow Garden · Lantern Walk");
  await expect(page.locator("#summary")).toContainText("6 × 10");
});
