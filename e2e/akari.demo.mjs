import { test, expect } from "@playwright/test";
import { serve, noSidewaysScroll } from "./demo.mjs";
import { generateAkari } from "../dist/akari-entry.js";

test("Akari bulbs, undo, hints, language, materials and restore", async ({ page }) => {
  const errors = []; page.on("pageerror", e => errors.push(String(e)));
  await serve(page); await page.goto("http://kazu.test/akari.html?seed=42");
  const puzzle = generateAkari(7, 7, 42);
  const whiteCells = puzzle.cells.filter(cell => cell === null).length;
  await expect(page.locator(".ka-cell:not(:disabled)")).toHaveCount(whiteCells);
  const cell = page.locator(".ka-cell:not(:disabled)").first(); await cell.click();
  await expect(page.locator("svg circle")).toHaveCount(1);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator("svg circle")).toHaveCount(0);
  await page.getByRole("button", { name: "Hint", exact: true }).click();
  await expect(page.locator("svg circle")).toHaveCount(1);
  await page.getByRole("button", { name: "Just the board", exact: true }).click();
  await expect(page.locator("dialog")).toBeVisible(); await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).toHaveCount(0);
  await page.locator("#material").selectOption("slate"); await page.locator("#pieces").selectOption("tiles");
  await page.getByRole("button", { name: "日本語", exact: true }).click();
  await expect(page.getByRole("button", { name: "戻す", exact: true })).toBeVisible();
  await noSidewaysScroll(page);
  await page.goto("http://kazu.test/akari.html");
  await expect(page.locator('.ka-cell[aria-label*="照明あり"], .ka-cell[aria-label*="lit"]')).not.toHaveCount(0);
  expect(errors).toEqual([]);
});
