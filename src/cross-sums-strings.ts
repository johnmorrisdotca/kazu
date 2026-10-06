export type CrossSumsLanguage = "en" | "ja";
export const CROSS_SUMS_STRINGS = {
  en: { title: "Cross Sums", help: "Fill each white cell with 1–9. Digits in each across or down run add to its clue and cannot repeat. Arrows move; type a digit or use the number pad; P toggles pencil marks.", undo: "Undo", hint: "Hint", check: "Check", restart: "Restart", ready: "Choose a white cell.", won: "Every run is correct. Solved!", helped: "Solved with help.", checked: "No run errors so far. Keep filling.", wrong: "Some runs have a repeated digit or impossible total.", across: "Across", down: "Down", pencil: "Pencil marks", row: "Row", column: "column", blank: "blank", clear: "Clear" },
  ja: { title: "カックロ", help: "白マスに1〜9を入れます。横または縦の連続した数字はヒントの合計になり、同じ数字は使えません。矢印または数字パッドで入力、Pでメモを切り替えます。", undo: "戻す", hint: "ヒント", check: "確認", restart: "やり直す", ready: "白マスを選んでください。", won: "すべての合計が合いました。完成！", helped: "ヒントを使って完成！", checked: "ここまでの合計に誤りはありません。続けてください。", wrong: "同じ数字または合計の誤りがあります。", across: "横", down: "縦", pencil: "メモ", row: "行", column: "列", blank: "空白", clear: "消す" }
} as const;
export function crossSumsWords(language: CrossSumsLanguage = "en") { return CROSS_SUMS_STRINGS[language]; }
