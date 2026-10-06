import type { FillominoLanguage } from "./fillomino-play.types.ts";

export const FILLOMINO_STRINGS = {
  en: {
    title: "Fillomino", help: "Fill every cell with a number. Connected regions of equal numbers must have exactly that many cells. Regions of the same size cannot touch. Arrow keys move; type a number to fill a cell. Clear removes your entry.",
    undo: "Undo", hint: "Hint", check: "Check", restart: "Restart", selectNumber: "Number", fill: "Enter", clear: "Clear", selected: "Selected", row: "Row", column: "column", empty: "empty", clue: "given", filled: "filled", checked: "The filled regions follow the rules so far.", wrong: "Some regions are too large or a clue was changed.", remaining: "Keep filling the empty cells.", solved: "Every region has the right size. Solved!", helped: "Solved with a hint.", hintWhy: "This cell follows from the only complete solution.", noHint: "No proved hint is available from the current entries.", restored: "Progress restored.",
  },
  ja: {
    title: "フィロミノ", help: "すべてのマスに数字を入れます。同じ数字が上下左右につながった領域のマス数は、その数字と同じです。同じ大きさの領域は辺で接しません。矢印キーで移動し、数字を入力します。消去で入力を消します。",
    undo: "戻す", hint: "ヒント", check: "確かめる", restart: "やり直す", selectNumber: "数字", fill: "入力", clear: "消去", selected: "選択中", row: "行", column: "列", empty: "空き", clue: "ヒント", filled: "入力済み", checked: "ここまでの領域はルールに合っています。", wrong: "大きすぎる領域か、変更されたヒントがあります。", remaining: "空きマスを埋めましょう。", solved: "すべての領域の大きさが合いました。完成！", helped: "ヒントを使って完成！", hintWhy: "唯一の完成形から、このマスが決まります。", noHint: "現在の入力から確かなヒントを出せません。", restored: "続きから再開しました。",
  },
} as const;

export function fillominoWords(language: FillominoLanguage = "en") {
  return FILLOMINO_STRINGS[language];
}
