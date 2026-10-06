export const JUOSAN_STRINGS = {
  en: {
    title: "Juosan",
    ready: "Fill every cell with a horizontal or vertical mark.",
    won: "Solved.",
    assisted: "Solved with a hint.",
    help: "Click a cell to cycle through horizontal, vertical and empty. Press H / V to write; arrow keys move and Delete clears.",
    undo: "Undo",
    hint: "Hint",
    restart: "Restart",
    check: "Check",
    checked: "The marks follow the rules.",
    wrong: "Some marks break a territory clue or run rule.",
    horizontal: "horizontal",
    vertical: "vertical",
    blank: "unmarked",
    row: "row",
    column: "column",
    hintWhy: "This mark follows the printed territory clue and line rules.",
  },
  ja: {
    title: "じゅうさん",
    ready: "各マスに横線か縦線を入れます。",
    won: "できました。",
    assisted: "ヒントを使ってできました。",
    help: "マスをクリックすると、横線、縦線、空欄の順に切り替わります。H / V キーで記入し、矢印キーで移動、Delete で消します。",
    undo: "戻す",
    hint: "ヒント",
    restart: "最初から",
    check: "確認",
    checked: "ルールに合っています。",
    wrong: "陣地の数字か線の並びを確認してください。",
    horizontal: "横線",
    vertical: "縦線",
    blank: "未記入",
    row: "行",
    column: "列",
    hintWhy: "この線は、陣地の数字と線のルールに合います。",
  },
} as const;

export function juosanWords(language: "en" | "ja" = "en") {
  return JUOSAN_STRINGS[language];
}
