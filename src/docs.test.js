// The documents and the demo, held to the source. Plain JavaScript, so that reading files needs no Node types.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import process from "node:process";

import { describe, expect, it } from "vitest";

import { KazuBoard } from "./element.ts";
import { KAZU_KINDS, KAZU_LEVELS, KAZU_SPECS } from "./kinds.ts";
import { KAZU_PLAY_STYLE } from "./playStyle.ts";
import { KAZU_STEPS_KEPT } from "./progress.ts";
import { KAZU_SEED_MOST } from "./random.ts";
import { KAZU_STRINGS } from "./strings.ts";
import { KAZU_STYLE } from "./style.ts";
import { VERSION } from "./version.ts";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const readme = readFileSync("README.md", "utf8");

/** A README section's text, from its heading to the next heading of the same level. */
const section = (heading) => {
  const from = readme.indexOf(`\n## ${heading}\n`);
  if (from < 0) throw new Error(`no “## ${heading}” in the README`);
  const next = readme.indexOf("\n## ", from + 5);
  return readme.slice(from, next < 0 ? undefined : next);
};

/** The cells of every table row in a piece of text, header and rule rows left out. */
const rows = (text) =>
  text
    .split("\n")
    .filter((line) => line.startsWith("|") && !/^\|[\s|:-]+\|$/.test(line))
    .map((line) => line.split(/(?<!\\)\|/).slice(1, -1).map((cell) => cell.replace(/\\\|/g, "|").trim()));

/** The custom properties a block of CSS declares: { name: value }. */
const declarations = (css) => Object.fromEntries([...css.matchAll(/(--[a-z0-9-]+):\s*([^;}]+)[;}]/g)].map((match) => [match[1], match[2].trim()]));

describe("the documents", () => {
  it("say the version package.json says, in the code and at the top of the changelog", () => {
    expect(VERSION).toBe(pkg.version);
    expect(readFileSync("CHANGELOG.md", "utf8")).toMatch(new RegExp(`^## ${pkg.version.replace(/\./g, "\\.")} `, "m"));
  });

  it("name in the README every entry package.json exports, and no other", () => {
    const exported = Object.keys(pkg.exports).filter((key) => key !== ".").map((key) => `${pkg.name}/${key.slice(2)}`);
    for (const entry of exported) expect(readme, entry).toContain(`\`${entry}\``);
  });

  it("name in the README every puzzle, with its sizes and its levels, and every attribute of the element", () => {
    for (const kind of KAZU_KINDS) {
      expect(readme, kind).toContain(`\`${kind}\``);
      const row = readme.split("\n").find((line) => line.startsWith("|") && line.includes(`\`${kind}\``));
      expect(row, kind).toBeDefined();
      for (const size of KAZU_SPECS[kind].sizes) expect(row, `${kind} ${size}`).toContain(`${size}×${size}`);
    }
    for (const level of KAZU_LEVELS) expect(readme, level).toContain(`\`${level}\``);
    for (const attribute of KazuBoard.observedAttributes) expect(readme, attribute).toMatch(new RegExp(`\`${attribute}[\`=]|\`${attribute}\``));
  });

  it("keep the family's stylesheet byte for byte, as its first line's hash says", () => {
    const [first, ...rest] = readFileSync("demo/family.css", "utf8").split("\n");
    const hash = /sha256 of every line after this one: ([0-9a-f]{64})/.exec(first)?.[1];
    expect(createHash("sha256").update(rest.join("\n")).digest("hex")).toBe(hash);
  });

  it("keep the family's template naming this package among the family, as the footer lists it", () => {
    expect(readFileSync("scripts/family-template.mjs", "utf8")).toContain(`{ id: "kazu", name: "Kazu", kana: "数" }`);
  });
});

describe("the README's promises", () => {
  it("has the sections a package of this family has, each with something in it", () => {
    for (const heading of ["In 30 seconds", "Who it is for", "Features", "Use it in your project", "API", "Theming", "Limits", "Browser support", "Languages", "Roadmap", "Architecture", "The name", "Where it comes from, and where it is used", "Development", "Contributing", "Changes", "Licence"]) {
      expect(section(heading).length, heading).toBeGreaterThan(heading.length + 40);
    }
  });

  it("installs the package it is, and every version it names is the one in package.json", () => {
    expect(readme).toContain(`npm install ${pkg.name}`);
    const major = pkg.version.split(".")[0];
    const named = [...readme.matchAll(/@johnmorrisdotca\/kazu@([\w.-]+)/g)].map((match) => match[1]);
    expect(named.length).toBeGreaterThan(0);
    for (const version of named) expect(version).toBe(major);
    expect(readme).not.toMatch(/\bkazu@\d+\.\d+/);
  });

  it("links only to files that exist", () => {
    const targets = [...readme.matchAll(/\]\((?!https?:|#|mailto:)([^)\s#]+)/g)].map((match) => match[1]);
    expect(targets.length).toBeGreaterThan(5);
    for (const target of targets) expect(existsSync(target), target).toBe(true);
  });

  it("lists every package of the family, with its kana, as the demo's footer does", () => {
    const template = readFileSync("scripts/family-template.mjs", "utf8");
    const family = [...template.matchAll(/\{ id: "([\w-]+)", name: "(\w+)", kana: "([^"]+)" \}/g)].map((match) => ({ id: match[1], name: match[2], kana: match[3] }));
    expect(family.length).toBeGreaterThanOrEqual(16);
    const block = readme.slice(readme.indexOf("### The family"), readme.indexOf("\n## ", readme.indexOf("### The family")));
    for (const { id, name, kana } of family) expect(block, id).toContain(`- [${name}](https://github.com/johnmorrisdotca/${id}) (${kana}`);
    const words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
    expect(block).toContain(`one of ${words[family.length]} packages`);
    expect([...block.matchAll(/^- \[/gm)]).toHaveLength(family.length);
  });

  it("gives every colour of the drawing, and of the playable board, with its light and dark values", () => {
    const light = declarations(KAZU_STYLE.slice(0, KAZU_STYLE.indexOf("@media")));
    const dark = declarations(KAZU_STYLE.slice(KAZU_STYLE.indexOf(':root[data-theme="dark"]')).split("}")[0]);
    const play = KAZU_PLAY_STYLE.slice(KAZU_STYLE.length);
    const playLight = declarations(play.slice(0, play.indexOf("@media")));
    const playDark = declarations(play.slice(play.indexOf(':root[data-theme="dark"]')).split("}")[0]);
    const table = Object.fromEntries(rows(section("Theming")).filter((row) => row[0].startsWith("`--")).map((row) => [row[0].replace(/`/g, ""), row]));
    expect(Object.keys(table).sort()).toEqual([...Object.keys(light), ...Object.keys(playLight)].sort());
    for (const [name, value] of Object.entries({ ...light, ...playLight })) {
      if (name === "--kz-font") continue;
      const row = table[name];
      expect(row[2], name).toBe(`\`${value}\``);
      const other = { ...dark, ...playDark }[name];
      expect(row[3], name).toBe(other === undefined || other === value ? "the same" : `\`${other}\``);
    }
  });

  it("states the limits as the code has them", () => {
    const limits = section("Limits");
    expect(limits).toContain(`from 1 to ${KAZU_SEED_MOST.toLocaleString("en-US")}`);
    expect(limits).toContain(`the newest ${KAZU_STEPS_KEPT} steps`);
    const longest = `Sudoku ${KAZU_SPECS["number-place"].mostCells} characters, Jigsaw ${KAZU_SPECS.jigsaw.mostCells}, Diagonal ${KAZU_SPECS.diagonal.mostCells}, Killer Sudoku ${KAZU_SPECS["sum-cages"].mostCells}, Futoshiki ${KAZU_SPECS["more-or-less"].mostCells}, Skyscrapers ${KAZU_SPECS.towers.mostCells}`;
    expect(limits).toContain(longest);
    const solve = readFileSync("src/solve.ts", "utf8");
    expect(solve).toContain("limit = 2, budget = Infinity");
    expect(solve).toContain("budget = 2_000_000");
    expect(limits).toContain("2,000,000 steps");
  });

  it("keeps docs/strings-ja.md as the board's words, English beside Japanese (pnpm docs:make rewrites it)", () => {
    const cell = (text) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");
    const lines = ["# Kazu's words, in English and Japanese", "", "Made from `src/strings.ts` by `pnpm docs:make`; a test fails if the two differ, so this list is never out of date.", "", "**The Japanese has not yet been reviewed by a native reader.** If a line reads wrongly or unnaturally, please", "open a *Fix a translation* issue with the string's name. `{name}` and the other braces are filled in when shown. A line\nwith `One` at the end of its name is the singular, said in English when the count is 1.", "", "| Name | English | Japanese |", "| --- | --- | --- |"];
    for (const key of Object.keys(KAZU_STRINGS.en).filter((name) => !/One$/.test(name))) lines.push(`| \`${key}\` | ${cell(KAZU_STRINGS.en[key])} | ${cell(KAZU_STRINGS.ja[key] ?? "")} |`);
    const made = `${lines.join("\n")}\n`;
    if (process.env.UPDATE_DOCS === "1") writeFileSync("docs/strings-ja.md", made);
    expect(readFileSync("docs/strings-ja.md", "utf8")).toBe(made);
  });

  it("has the files a visitor looks for: issue templates, a pull request template, a security policy", () => {
    for (const file of [".github/ISSUE_TEMPLATE/report-a-bug.md", ".github/ISSUE_TEMPLATE/suggest-a-feature.md", ".github/ISSUE_TEMPLATE/fix-a-translation.md", ".github/ISSUE_TEMPLATE/add-my-project.md", ".github/ISSUE_TEMPLATE/config.yml", ".github/pull_request_template.md", "SECURITY.md", "CONTRIBUTING.md", "CODE_OF_CONDUCT.md"]) expect(existsSync(file), file).toBe(true);
    expect(readme).toContain("issues/new?template=fix-a-translation.md");
  });
});
