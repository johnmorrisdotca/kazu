import { describe, expect, it } from "vitest";

import { KAZU_KINDS, KAZU_SPECS } from "./kinds.ts";
import { KAZU_NAMES, KAZU_SIZE_NAMES } from "./names.ts";
import { kazuLanguageOf, kazuNameOf, kazuSay, KAZU_STRINGS } from "./strings.ts";

describe("the words", () => {
  it("say every line in both languages, with the same values to fill in", () => {
    const placeholders = (line: string) => [...line.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
    for (const key of Object.keys(KAZU_STRINGS.en)) {
      if (/One$/.test(key)) continue;
      expect(KAZU_STRINGS.ja[key], `ja ${key}`).toBeDefined();
      expect(placeholders(KAZU_STRINGS.ja[key]!), key).toEqual(placeholders(KAZU_STRINGS.en[key]!));
    }
    for (const key of Object.keys(KAZU_STRINGS.ja)) expect(KAZU_STRINGS.en[key], `en ${key}`).toBeDefined();
  });

  it("fills a value in, says a line in the singular for one, and gives the key itself for a line it does not have", () => {
    expect(kazuSay("en", "checkWrong", { wrong: 3, empty: 2 })).toBe("3 cells are wrong, 2 still to fill.");
    expect(kazuSay("en", "checkWrong", { wrong: 1, empty: 2 })).toBe("1 cell is wrong, 2 still to fill.");
    expect(kazuSay("ja", "checkWrong", { wrong: 1, empty: 2 })).toBe("まちがいが1マス、まだ空きが2マスあります。");
    expect(kazuSay("en", "nothing here")).toBe("nothing here");
    expect(kazuSay("en", "cell", { row: 2 })).toBe("row 2, column {col}");
  });

  it("reads a language from a tag: Japanese for ja, English for the rest", () => {
    expect(["ja", "ja-JP", "JA", "en", "fr", "", null, undefined].map(kazuLanguageOf)).toEqual(["ja", "ja", "ja", "en", "en", "en", "en", "en"]);
  });

  it("names every puzzle, with its rules, its origin and a name for every size it offers, in both languages", () => {
    for (const kind of KAZU_KINDS) {
      const info = KAZU_NAMES[kind];
      for (const language of ["en", "ja"] as const) {
        expect(kazuNameOf(kind, language).length).toBeGreaterThan(1);
        expect(info.tagline[language].length).toBeGreaterThan(10);
        expect(info.rules[language].length).toBeGreaterThanOrEqual(3);
        expect(info.origin[language].length).toBeGreaterThan(10);
      }
      expect(info.rules.ja).toHaveLength(info.rules.en.length);
      expect(Object.keys(KAZU_SIZE_NAMES[kind]).map(Number)).toEqual([...KAZU_SPECS[kind].sizes]);
    }
    expect(KAZU_NAMES["number-place"].ja).toBe("ナンプレ");
    expect(Object.values(KAZU_NAMES).some((info) => info.ja.includes("数独"))).toBe(false);
  });
});
