// The documents and the demo, held to the source. Plain JavaScript, so that reading files needs no Node types.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { KazuBoard } from "./element.ts";
import { KAZU_KINDS, KAZU_LEVELS, KAZU_SPECS } from "./kinds.ts";
import { VERSION } from "./version.ts";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const readme = readFileSync("README.md", "utf8");

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
