import type { NurikabeLanguage } from "./nurikabePlay.types.ts";
export const NURIKABE_STRINGS = {
  en: { title: "Nurikabe", help: "Shade cells to build one connected wall. Black cells cannot form a 2×2 square. Each remaining white region contains one number and has that exact area. Tap or press Space to shade; arrows move.", undo: "Undo", hint: "Hint", check: "Check", restart: "Restart", won: "Solved!", helped: "Solved with help.", wrong: "Some rules are broken.", good: "No rule errors yet. Keep going.", noHint: "No proved hint is available.", row: "Row", column: "column", sea: "sea", white: "island" },
  ja: { title: "ぬりかべ", help: "黒マスをつなげて一つの壁にします。黒マスで2×2の四角形を作れません。白い島には数字が一つだけあり、島の面積はその数字と同じです。マスを押すかスペースで黒くし、矢印キーで移動します。", undo: "戻す", hint: "ヒント", check: "確認", restart: "やり直す", won: "完成！", helped: "ヒントを使って完成。", wrong: "ルールに合わないところがあります。", good: "今のところルール違反はありません。", noHint: "確かなヒントはありません。", row: "行", column: "列", sea: "海", white: "島" },
} as const;
export function nurikabeWords(language: NurikabeLanguage = "en") { return NURIKABE_STRINGS[language]; }
