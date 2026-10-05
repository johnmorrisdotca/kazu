import { expect, test } from "@playwright/test";

import { serve } from "./demo.mjs";

const savedGame = async (page) => page.evaluate(() => {
  const saved = JSON.parse(localStorage.getItem("kazu-hitori-progress"));
  return JSON.parse(saved.progress);
});

test("Hitori plays, saves public progress, and restores it", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));

  await serve(page);
  await page.goto("http://kazu.test/hitori.html");
  await expect(page.locator(".kh-cell")).toHaveCount(25);

  const cell = page.locator('.kh-cell[data-cell="1"]');
  await cell.click();
  await expect(cell).toHaveAttribute("aria-label", /shaded/);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(cell).toHaveAttribute("aria-label", /unshaded/);

  await page.getByRole("button", { name: "Hint", exact: true }).click();
  const helpedGame = await savedGame(page);
  expect(helpedGame.helped).toBe(true);
  expect(helpedGame.shaded.some(Boolean)).toBe(true);

  await page.reload();
  await expect(page.locator(".kh-cell")).toHaveCount(25);
  const restoredGame = await savedGame(page);
  expect(restoredGame.helped).toBe(true);
  expect(restoredGame.shaded).toEqual(helpedGame.shaded);
  await expect(page.locator('.kh-cell[aria-pressed="true"]')).toHaveCount(
    helpedGame.shaded.filter(Boolean).length,
  );
  expect(errors).toEqual([]);
});
