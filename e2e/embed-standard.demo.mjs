import { expect, test } from "@playwright/test";
import { serve } from "./demo.mjs";

test("the shared number-puzzle builder covers options, adjusts incompatible grids and writes host formats", async ({ page }) => {
  const errors = []; page.on("pageerror", (error) => errors.push(String(error)));
  await serve(page); await page.goto("http://kazu.test/builder.html?lang=en");
  await expect(page.locator("#bld-stage kazu-board svg")).toBeVisible();
  for (const format of ["element", "iframe", "module", "react", "vue", "svelte", "angular", "html", "url"]) { await page.locator(`#bld-formats [data-format="${format}"]`).click(); await expect(page.locator("#bld-code")).not.toHaveText(""); }
  await page.locator("#bld-groups details").first().evaluate((details) => { details.open = true; });
  await page.locator('#opt-kind [data-value="towers"]').click();
  await expect(page.locator("#opt-grid")).toHaveValue("5");
  await expect(page.locator("#bld-stage kazu-board svg")).toHaveAttribute("data-kind", "towers");
  await page.locator('[data-lang="ja"]').click(); await expect(page.locator("#bld-maker-says")).toContainText("パズル");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true); expect(errors).toEqual([]);
});

test("a UTC daily date repeats its puzzle and old numeric sizes still select a grid", async ({ page }) => {
  await serve(page); await page.goto("http://kazu.test/embed/?kind=number-place&grid=4&daily=2026-10-09&size=small&clock=off");
  const board = page.locator("kazu-board"); await expect(board.locator("svg")).toBeVisible();
  await expect(board).toHaveAttribute("data-day", "2026-10-09");
  const before = await board.evaluate((element) => ({ givens: element.game.givens, seed: element.detail.seed, width: element.style.width })); expect(before.width).toBe("320px");
  await page.reload(); await expect(board.locator("svg")).toBeVisible(); expect(await board.evaluate((element) => element.game.givens)).toBe(before.givens);
  await page.goto("http://kazu.test/embed/?kind=towers&size=5&seed=7"); await expect(board.locator("svg")).toBeVisible(); expect(await board.evaluate((element) => element.game.size)).toBe(5);
});

test("off aliases and reflected properties preserve methods and callbacks", async ({ page }) => {
  await serve(page); const label = '<img src=x onerror="bad">';
  await page.goto(`http://kazu.test/embed/?grid=4&seed=7&controls=false&clock=no&hints=0&check=false&theme=dark&label=${encodeURIComponent(label)}`);
  const board = page.locator("kazu-board"); await expect(board.locator("svg")).toBeVisible(); await expect(board).toHaveAttribute("aria-label", label);
  await expect(board.locator('[data-action="hint"]')).toBeHidden(); await expect(board.locator('[data-action="check"]')).toBeHidden();
  expect(await board.locator("svg").evaluate((svg) => getComputedStyle(svg).getPropertyValue("--kz-paper").trim())).toBe("#262a27"); expect(await page.locator("img").count()).toBe(0);
  const value = await board.evaluate(async (element) => {
    const { defineBoard } = await import("../dist/element.js"); defineBoard("article-numbers"); defineBoard("article-numbers");
    const game = element.game; element.options = { onChange: () => { window.heardChange = true; } }; const preserved = element.game === game;
    element.check = "show"; const method = typeof element.check; const at = element.game.printed.cells.findIndex((value) => value === 0); element.select(at); element.mount.enter(1);
    return { preserved, method, check: element.getAttribute("check"), undo: typeof element.undo, detail: typeof element.detail.run };
  });
  expect(value).toEqual({ preserved: true, method: "function", check: "show", undo: "function", detail: "string" }); expect(await page.evaluate(() => window.heardChange)).toBe(true);
});

test("native changes cross shadow boundaries and iframe messages match JSON-safe detail", async ({ page }) => {
  await serve(page);
  await page.route("http://host.test/", (route) => route.fulfill({ contentType: "text/html", body: '<script>window.messages=[];addEventListener("message",event=>{if(event.origin==="http://kazu.test")messages.push(event.data);});</script><iframe src="http://kazu.test/embed/?grid=4&seed=7&clock=off" width="360" height="1000"></iframe>' }));
  await page.goto("http://host.test/"); const board = page.frameLocator("iframe").locator("kazu-board"); await expect(board.locator("svg")).toBeVisible();
  await board.evaluate((element) => { const at = element.game.printed.cells.findIndex((value) => value === 0); element.select(at); element.mount.enter(1); });
  await expect.poll(() => page.evaluate(() => window.messages.some((message) => message.type === "kazu-change"))).toBe(true);
  const message = await page.evaluate(() => window.messages.find((made) => made.type === "kazu-change")); expect(message.detail).toMatchObject({ kind: "number-place", size: 4, seed: 7 }); expect(JSON.parse(JSON.stringify(message))).toEqual(message);
  const child = page.frames().find((frame) => frame.url().startsWith("http://kazu.test/embed/"));
  await child.evaluate(() => { const host = document.createElement("div"); document.body.replaceChildren(host); const root = host.attachShadow({ mode: "open" }); window.changeCrossed = false; document.addEventListener("kazu-change", () => { window.changeCrossed = true; }); const board = document.createElement("kazu-board"); board.setAttribute("grid", "4"); board.setAttribute("seed", "7"); board.setAttribute("clock", "off"); root.append(board); });
  await expect(board.locator("svg")).toBeVisible(); await board.evaluate((element) => { const at = element.game.printed.cells.findIndex((value) => value === 0); element.select(at); element.mount.enter(1); }); await expect.poll(() => child.evaluate(() => window.changeCrossed)).toBe(true);
});

test("copied iframe code fits a narrow article and invalid parameters are ignored", async ({ page }) => {
  await serve(page); await page.goto("http://kazu.test/builder.html?lang=en"); await expect(page.locator("#bld-stage kazu-board svg")).toBeVisible(); await page.locator('#bld-formats [data-format="iframe"]').click();
  const code = (await page.locator("#bld-code").textContent()).replaceAll("https://johnmorrisdotca.github.io/kazu/", "http://kazu.test/").replace('loading="lazy"', '');
  await page.route("http://article.test/", (route) => route.fulfill({ contentType: "text/html", body: `<style>body{margin:0;width:320px}</style>${code}` })); await page.goto("http://article.test/"); await expect(page.frameLocator("iframe").locator("kazu-board svg")).toBeVisible(); const child = page.frames().find((frame) => frame.url().startsWith("http://kazu.test/embed/"));
  expect(await child.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight && document.documentElement.scrollWidth <= window.innerWidth && window.localStorage.length === 0)).toBe(true);
  await page.goto("http://kazu.test/embed/?kind=invalid&grid=999&seed=Infinity&daily=2026-02-30&width=Infinity"); const board = page.locator("kazu-board"); await expect(board.locator("svg")).toBeVisible(); await expect(board).toHaveAttribute("grid", "9"); await expect(board).not.toHaveAttribute("daily", /.*/); await expect(board).not.toHaveAttribute("width", /.*/);
});

test("a copied setup keeps a cleared starter seed and a disabled control", async ({ page }) => {
  await serve(page); await page.goto("http://kazu.test/builder.html?lang=en"); await expect(page.locator("#bld-stage kazu-board svg")).toBeVisible(); await page.locator("#bld-groups details").first().evaluate((details) => { details.open = true; });
  await page.locator("#opt-clock").click(); await page.locator('[data-option="seed"] input[type="number"]').fill("");
  await expect(page.locator("#opt-clock")).toHaveAttribute("aria-pressed", "false"); await page.reload(); await expect(page.locator("#bld-stage kazu-board svg")).toBeVisible(); await expect(page.locator("#opt-clock")).toHaveAttribute("aria-pressed", "false"); await expect(page.locator('[data-option="seed"] input[type="number"]')).toHaveValue("");
});


test("Copy uses the latest typed choices before the preview debounce finishes", async ({ page }) => {
  await serve(page); await page.goto("http://kazu.test/builder.html?lang=en"); await expect(page.locator("#bld-stage kazu-board svg")).toBeVisible();
  await page.evaluate(() => { Object.defineProperty(window.navigator, "clipboard", { configurable: true, value: { writeText: async (text) => { window.copiedText = text; } } }); });
  await page.locator("#bld-groups details").first().evaluate((details) => { details.open = true; });
  await page.locator('[data-option="seed"] input[type="number"]').fill("7");
  await page.locator("#bld-copy").evaluate((button) => button.click());
  await expect.poll(() => page.evaluate(() => window.copiedText)).toContain('seed="7"');
  const copied = await page.evaluate(() => window.copiedText);
  await page.locator('[data-option="daily"] input').fill("2026-02-30");
  await page.locator("#bld-copy").evaluate((button) => button.click());
  expect(await page.evaluate(() => window.copiedText)).toBe(copied);
});
