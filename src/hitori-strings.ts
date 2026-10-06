import type { HitoriLanguage } from "./hitori-play.types.ts";

export const HITORI_STRINGS = {
  en: {
    title: "Hitori",
    help: "Tap a cell or press Space to shade it. Shaded cells cannot touch; the remaining numbers must be unique in every row and column, and the unshaded cells must stay connected. Arrow keys move.",
    undo: "Undo", hint: "Hint", check: "Check", restart: "Restart", won: "Solved!", helped: "Solved with help.",
    bad: "Some rules are broken.", good: "No rule errors yet. Keep going.", noHint: "No proved hint is available.",
    cell: "Row", column: "column", shaded: "shaded", white: "unshaded",
  },
  ja: {
    title: "ひとりにしてくれ",
    help: "マスを押すかスペースキーで黒くします。黒マスは辺で隣り合えません。白マスの行と列に同じ数字がなく、白マス全体がつながるようにします。矢印キーで移動します。",
    undo: "戻す", hint: "ヒント", check: "確認", restart: "やり直す", won: "完成！", helped: "ヒントを使って完成。",
    bad: "ルールに合わないところがあります。", good: "今のところルール違反はありません。", noHint: "確かなヒントはありません。",
    cell: "行", column: "列", shaded: "黒", white: "白",
  },
} as const;

export function hitoriWords(language: HitoriLanguage = "en") { return HITORI_STRINGS[language]; }
