import { test, expect } from "@playwright/test";
import { serve, noSidewaysScroll } from "./demo.mjs";

test("Loop edges, undo, hints, language and materials", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await serve(page);
  await page.goto("http://kazu.test/loop.html?seed=42");
  await expect(page.locator(".sl-edge")).toHaveCount(112);
  const edge = page.locator(".sl-edge").first();
  await edge.click();
  await expect(edge).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".sl-edge").first()).toHaveAttribute("aria-pressed", "false");
  await edge.click();
  await page.goto("http://kazu.test/loop.html");
  await expect(page.locator(".sl-edge.on")).toHaveCount(1);
  await page.getByRole("button", { name: "Hint", exact: true }).click();
  await page.locator("#material").selectOption("slate");
  await page.getByRole("button", { name: "日本語", exact: true }).click();
  await expect(page.getByRole("button", { name: "戻す", exact: true })).toBeVisible();
  await noSidewaysScroll(page);
  expect(errors).toEqual([]);
});
