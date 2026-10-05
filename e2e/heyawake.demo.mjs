import { test, expect } from "@playwright/test";
import { serve, noSidewaysScroll } from "./demo.mjs";

test("Heyawake marks, undo, proved hint, language and saved progress", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await serve(page);
  await page.goto("http://kazu.test/heyawake.html?seed=17");
  await expect(page.locator(".kh-cell")).toHaveCount(20);
  await page.locator('.kh-cell[data-cell="0"]').click();
  await expect(page.locator('.kh-cell[data-cell="0"]')).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByRole("button", { name: "Undo", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Hint", exact: true }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("kazu-heyawake-v1")));
  expect(saved.progress).toContain('"helped":true');
  await page.locator("#material").selectOption("slate");
  await page.locator("#pieces").selectOption("tiles");
  await page.getByRole("button", { name: "日本語", exact: true }).click();
  await expect(page.getByRole("button", { name: "元に戻す", exact: true })).toBeVisible();
  await noSidewaysScroll(page);
  await page.goto("http://kazu.test/heyawake.html");
  await expect(page.locator(".kh-cell[aria-label*='行']")).toHaveCount(20);
  expect(errors).toEqual([]);
});
