import { test, expect } from "@playwright/test";
import { serve, noSidewaysScroll } from "./demo.mjs";

test("Juosan training board, play, undo, hints, language and saved progress", async ({ page }) => {
  const errors = []; page.on("pageerror", e => errors.push(String(e)));
  await serve(page); await page.goto("http://kazu.test/juosan.html?seed=42");
  await expect(page.locator(".js-cell")).toHaveCount(6);
  await page.locator('.js-cell[data-cell="0"]').click();
  await expect(page.locator("svg")).toContainText("—");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator("svg")).not.toContainText("—");
  for (let i = 0; i < 6; i++) await page.getByRole("button", { name: "Hint", exact: true }).click();
  await expect(page.getByRole("status").last()).toHaveText("Solved with a hint.");
  await page.getByRole("button", { name: "日本語", exact: true }).click();
  await expect(page.getByRole("status").last()).toHaveText("ヒントを使ってできました。");
  await page.locator("#material").selectOption("slate"); await page.locator("#pieces").selectOption("tiles");
  await noSidewaysScroll(page);
  expect(errors).toEqual([]);
});
