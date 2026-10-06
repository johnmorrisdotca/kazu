import type { LoopLanguage } from "./loop-play.types.ts";

export const LOOP_STRINGS = {
  en: {
    title: "Loop",
    help: "Connect adjacent dots with horizontal and vertical edges to make one closed loop. Each number says how many of its four bordering edges are in the loop. Empty cells may have any number of edges. The loop cannot branch or split into separate loops. Click or tap an edge, or focus it and press Enter or Space. Arrow keys move between edges.",
    undo: "Undo",
    hint: "Hint",
    check: "Check",
    restart: "Restart",
    expand: "Just the board",
    close: "Close",
    won: "One closed loop. Solved!",
    helped: "Solved with help.",
    checked: "No rule conflicts so far. Keep drawing the loop.",
    wrong: "Check the numbered cells, branches and loop connections.",
    hintWhy: "This edge is part of the only proved loop.",
    noHint: "No proved hint is available.",
    row: "Row",
    column: "column",
    clue: "number",
    blank: "no number",
    edge: "edge",
  },
  ja: {
    title: "スリザーリンク",
    help: "点を縦横の線でつなぎ、一つの閉じた輪を作ります。数字はそのマスを囲む四辺のうち、輪になる辺の数です。数字のないマスは何辺でも構いません。輪を分岐させたり、別々の輪に分けたりしません。線をタップ、クリック、または選んでEnterかSpaceを押します。矢印キーで辺を移動します。",
    undo: "戻す",
    hint: "ヒント",
    check: "確かめる",
    restart: "やり直す",
    expand: "盤だけ",
    close: "閉じる",
    won: "一つの輪ができました。完成！",
    helped: "ヒントを使って完成！",
    checked: "ここまでルールに合っています。輪を続けましょう。",
    wrong: "数字のマス、分岐、輪のつながりを確かめましょう。",
    hintWhy: "唯一の解答に含まれる辺です。",
    noHint: "確かなヒントがありません。",
    row: "行",
    column: "列",
    clue: "数字",
    blank: "数字なし",
    edge: "辺",
  },
} as const;

export function loopWords(language: LoopLanguage = "en") {
  return LOOP_STRINGS[language];
}
