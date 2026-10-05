import { test, expect } from "@playwright/test";
import { serve } from "./demo.mjs";

test("Nurikabe plays, saves progress and restores the same board", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await serve(page);
  await page.goto("http://kazu.test/nurikabe.html");
  await expect(page.locator(".kn-cell")).toHaveCount(25);
  await page.locator('.kn-cell[data-cell="1"]').click();
  await expect(page.locator('.kn-cell[data-cell="1"]')).toHaveAttribute("aria-label", /sea/);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator('.kn-cell[data-cell="1"]')).toHaveAttribute("aria-label", /island/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("kazu-nurikabe-progress"))).toContain('"progress"');
  await page.reload();
  await expect(page.locator(".kn-cell")).toHaveCount(25);
  expect(errors).toEqual([]);
});
