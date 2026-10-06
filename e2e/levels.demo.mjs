import { expect, test } from "@playwright/test";

import { serve } from "./demo.mjs";

/** The six grid pages, each asked for a bigger board at a harder level, which must draw with the right number of squares. */
const PAGES = [
  { page: "shikaku", size: "10", cells: ".ks-cell", count: 100 },
  { page: "akari", size: "10", cells: ".ka-cell", count: 100 },
  { page: "loop", size: "10", cells: ".sl-edge", count: 220 },
  { page: "hitori", size: "9", cells: ".kh-cell", count: 81 },
  { page: "cross-sums", size: "8", cells: ".kk-cell", count: 64 },
  { page: "regions", size: "10", cells: ".regions-cell", count: 100 },
];

for (const { page: name, size, cells, count } of PAGES) {
  test(`${name} makes an extra-hard board ${size} wide from its Level choice, and names the level in Japanese`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    await serve(page);
    await page.goto(`http://kazu.test/${name}.html?seed=11`);
    await expect(page.locator(cells).first()).toBeVisible();
    await expect(page.locator("#level option")).toHaveCount(4);
    await expect(page.locator("#level")).toHaveValue("medium");
    if (name === "regions") {
      await page.locator("#width").fill(size);
      await page.locator("#height").fill(size);
    } else {
      await page.locator("#size").selectOption(size);
    }
    await page.locator("#level").selectOption("extra-hard");
    await page.locator("#new").click();
    await expect(page.locator(cells)).toHaveCount(count, { timeout: 20_000 });
    await expect(page.locator("#notice")).not.toContainText(/could not|unable|not produce|作れません/i);
    await page.getByRole("button", { name: "日本語", exact: true }).click();
    await expect(page.locator("#level option[value=extra-hard]")).toHaveText("とてもむずかしい");
    await page.locator("button[data-lang=en]").click();
    await expect(page.locator("#level option[value=extra-hard]")).toHaveText("Extra hard");
    expect(errors).toEqual([]);
  });
}
