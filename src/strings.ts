import type { KazuKind } from "./kinds.ts";
import { KAZU_NAMES } from "./names.ts";

/**
 * THE WORDS A KAZU BOARD SAYS, in English and Japanese: what a screen reader hears of the drawing, the
 * buttons and lines under a playable board, and what a hint says. Plain data, so a page can read them,
 * replace a few or add a language of its own beside these two.
 *
 * `{name}` in a line is a value filled in; a line `foo` that has a `fooOne` beside it is said as
 * `fooOne` when its `{n}` is 1.
 */
export type KazuLanguage = "en" | "ja";

export const KAZU_STRINGS: Record<KazuLanguage, Record<string, string>> = {
  en: {
    board: "{name} puzzle, {size} by {size}",
    cell: "row {row}, column {col}",
    cellEmpty: "{cell}, empty",
    cellValue: "{cell}, {value}",
    cellGiven: "{cell}, {value}, printed",
    cellNotes: "{cell}, empty, pencil marks {notes}",
    cellConflict: "{cell}, {value}, breaks a rule",
    cageSum: "a cage adding to {sum}",
    clueTop: "Towers seen from the top of column {at}: {n}",
    clueBottom: "Towers seen from the bottom of column {at}: {n}",
    clueLeft: "Towers seen from the left of row {at}: {n}",
    clueRight: "Towers seen from the right of row {at}: {n}",
    markLess: "{a} is smaller than {b}",
    solved: "Solved. Every cell is filled and right.",
    solvedIn: "Solved in {time}. Every cell is filled and right.",
    tap: "Tap a cell, then a number.",
    tapPencil: "Pencil marks are on: tap a number to note it in the cell.",
    keys: "Arrow keys move, a number fills the cell, Backspace empties it, N turns pencil marks on or off.",
    undo: "Undo",
    pencil: "Pencil",
    pencilTitle: "Write small notes in a cell instead of a number",
    erase: "Erase the cell",
    hint: "Hint",
    hintTitle: "Show the next cell you could fill in, and why",
    check: "Check",
    checkTitle: "Say how many cells are wrong, without saying which",
    restart: "Restart",
    clock: "Time",
    pad: "Numbers",
    padNumber: "Number {n}",
    padDone: "Number {n}, all placed",
    full: "Every cell is filled, and it is not right yet.",
    checkRight: "Everything filled in so far is right.",
    checkWrong: "{wrong} cells are wrong, {empty} still to fill.",
    checkWrongOne: "{wrong} cell is wrong, {empty} still to fill.",
    checkWrongNoneEmpty: "{wrong} cells are wrong.",
    checkWrongNoneEmptyOne: "{wrong} cell is wrong.",
    checkOnlyEmpty: "Nothing wrong so far, {empty} still to fill.",
    conflicts: "{n} cells break a rule.",
    conflictsOne: "{n} cell breaks a rule.",
    hintOnly: "{cell} can only be {value}: every other number is ruled out by {where}.",
    hintOnlyBy: "{cell} can only be {value}: every other number is ruled out by {where} and {by}.",
    hintPlace: "In {group}, the {value} can only go in {cell}: no other cell there can hold it.",
    hintAnswer: "{cell} is {value}. Nothing here follows from a single step, so this is the answer's own number.",
    hintReplaces: "What is in {cell} now is wrong. ",
    hintDone: "Every cell is right.",
    whereNumberPlace: "its row, column and box",
    whereDiagonal: "its row, column, box and diagonal",
    whereJigsaw: "its row, column and region",
    whereSumCages: "its row, column, box and cage",
    whereMoreOrLess: "its row and column",
    whereTowers: "its row and column",
    byCage: "the cage's sum",
    byMarks: "the more-than marks",
    byClues: "the clues round the edge",
    groupRow: "row {n}",
    groupColumn: "column {n}",
    groupBox: "box {n}",
    groupRegion: "region {n}",
    groupDiagonal: "the diagonal from the top left",
    groupDiagonalOther: "the diagonal from the top right",
    paused: "Paused",
  },
  ja: {
    board: "{name}、{size}×{size}",
    cell: "{row}行{col}列",
    cellEmpty: "{cell}、空き",
    cellValue: "{cell}、{value}",
    cellGiven: "{cell}、{value}、最初から書かれています",
    cellNotes: "{cell}、空き、メモ{notes}",
    cellConflict: "{cell}、{value}、ルールに反しています",
    cageSum: "合計{sum}の囲み",
    clueTop: "第{at}列の上から見える塔の数：{n}",
    clueBottom: "第{at}列の下から見える塔の数：{n}",
    clueLeft: "第{at}行の左から見える塔の数：{n}",
    clueRight: "第{at}行の右から見える塔の数：{n}",
    markLess: "{a}は{b}より小さい",
    solved: "解けました。すべてのマスが埋まり、すべて正しい数字です。",
    solvedIn: "{time}で解けました。すべてのマスが埋まり、すべて正しい数字です。",
    tap: "マスをタップして、数字を選びます。",
    tapPencil: "メモがオンです。数字をタップすると、マスにメモします。",
    keys: "矢印キーで移動、数字キーで入力、Backspaceで消去、Nでメモのオンとオフ。",
    undo: "元に戻す",
    pencil: "メモ",
    pencilTitle: "数字のかわりに、マスに小さくメモを書きます",
    erase: "このマスを消す",
    hint: "ヒント",
    hintTitle: "次に入れられるマスと、その理由を表示します",
    check: "確かめる",
    checkTitle: "まちがっているマスの数だけを教えます（どこかは教えません）",
    restart: "やり直す",
    clock: "時間",
    pad: "数字",
    padNumber: "数字{n}",
    padDone: "数字{n}、すべて置きました",
    full: "すべてのマスが埋まりましたが、まだ正しくありません。",
    checkRight: "ここまでに入れた数字は、すべて正しいです。",
    checkWrong: "まちがいが{wrong}マス、まだ空きが{empty}マスあります。",
    checkWrongNoneEmpty: "まちがいが{wrong}マスあります。",
    checkOnlyEmpty: "いまのところまちがいはなく、空きが{empty}マスあります。",
    conflicts: "ルールに反するマスが{n}マスあります。",
    hintOnly: "{cell}は{value}しか入りません。ほかの数字は、{where}で入れないからです。",
    hintOnlyBy: "{cell}は{value}しか入りません。ほかの数字は、{where}と{by}で入れないからです。",
    hintPlace: "{group}で、{value}を入れられるのは{cell}だけです。ほかのマスには入りません。",
    hintAnswer: "{cell}は{value}です。ここは一手で決まるところがないので、答えの数字をそのまま示しています。",
    hintReplaces: "いま{cell}に入っている数字はまちがいです。",
    hintDone: "すべてのマスが正しいです。",
    whereNumberPlace: "同じ行、列、ブロック",
    whereDiagonal: "同じ行、列、ブロック、対角線",
    whereJigsaw: "同じ行、列、領域",
    whereSumCages: "同じ行、列、ブロック、囲み",
    whereMoreOrLess: "同じ行と列",
    whereTowers: "同じ行と列",
    byCage: "囲みの合計",
    byMarks: "不等号",
    byClues: "盤の外の数字",
    groupRow: "第{n}行",
    groupColumn: "第{n}列",
    groupBox: "第{n}ブロック",
    groupRegion: "第{n}領域",
    groupDiagonal: "左上から右下への対角線",
    groupDiagonalOther: "右上から左下への対角線",
    paused: "一時停止中",
  },
};

/** A line in a language, with its values filled in; the line itself if there is none by that name. */
export function kazuSay(language: KazuLanguage, key: string, values: Record<string, string | number> = {}): string {
  const table = KAZU_STRINGS[language] ?? KAZU_STRINGS.en;
  const one = values.n === 1 || values.wrong === 1 ? table[`${key}One`] : undefined;
  const line = one ?? table[key] ?? KAZU_STRINGS.en[key] ?? key;
  return line.replace(/\{(\w+)\}/g, (whole, name: string) => (name in values ? String(values[name]) : whole));
}

/** The language a piece of text is in: Japanese for anything starting `ja`, English for everything else. */
export function kazuLanguageOf(tag: string | null | undefined): KazuLanguage {
  return String(tag ?? "").toLowerCase().startsWith("ja") ? "ja" : "en";
}

/** What a puzzle is called in a language, as a screen reader says it. */
export function kazuNameOf(kind: KazuKind, language: KazuLanguage): string {
  return KAZU_NAMES[kind][language];
}
