# Kazu's words, in English and Japanese

Made from `src/strings.ts` by `pnpm docs:make`; a test fails if the two differ, so this list is never out of date.

**The Japanese has not yet been reviewed by a native reader.** If a line reads wrongly or unnaturally, please
open a *Fix a translation* issue with the string's name. `{name}` and the other braces are filled in when shown. A line
with `One` at the end of its name is the singular, said in English when the count is 1.

| Name | English | Japanese |
| --- | --- | --- |
| `board` | {name} puzzle, {size} by {size} | {name}、{size}×{size} |
| `cell` | row {row}, column {col} | {row}行{col}列 |
| `cellEmpty` | {cell}, empty | {cell}、空き |
| `cellValue` | {cell}, {value} | {cell}、{value} |
| `cellGiven` | {cell}, {value}, printed | {cell}、{value}、最初から書かれています |
| `cellNotes` | {cell}, empty, pencil marks {notes} | {cell}、空き、メモ{notes} |
| `cellConflict` | {cell}, {value}, breaks a rule | {cell}、{value}、ルールに反しています |
| `cageSum` | a cage adding to {sum} | 合計{sum}の囲み |
| `clueTop` | Towers seen from the top of column {at}: {n} | 第{at}列の上から見える塔の数：{n} |
| `clueBottom` | Towers seen from the bottom of column {at}: {n} | 第{at}列の下から見える塔の数：{n} |
| `clueLeft` | Towers seen from the left of row {at}: {n} | 第{at}行の左から見える塔の数：{n} |
| `clueRight` | Towers seen from the right of row {at}: {n} | 第{at}行の右から見える塔の数：{n} |
| `markLess` | {a} is smaller than {b} | {a}は{b}より小さい |
| `solved` | Solved. Every cell is filled and right. | 解けました。すべてのマスが埋まり、すべて正しい数字です。 |
| `solvedIn` | Solved in {time}. Every cell is filled and right. | {time}で解けました。すべてのマスが埋まり、すべて正しい数字です。 |
| `tap` | Tap a cell, then a number. | マスをタップして、数字を選びます。 |
| `tapPencil` | Pencil marks are on: tap a number to note it in the cell. | メモがオンです。数字をタップすると、マスにメモします。 |
| `keys` | Arrow keys move, a number fills the cell, Backspace empties it, N turns pencil marks on or off. | 矢印キーで移動、数字キーで入力、Backspaceで消去、Nでメモのオンとオフ。 |
| `keysColossus` | Arrow keys move, a number or a letter from A to P fills the cell, Backspace empties it, the slash key turns pencil marks on or off (N is a number here). | 矢印キーで移動、数字またはAからPのキーで入力、Backspaceで消去、スラッシュキーでメモのオンとオフ（ここではNは数字です）。 |
| `undo` | Undo | 元に戻す |
| `pencil` | Pencil | メモ |
| `pencilTitle` | Write small notes in a cell instead of a number | 数字のかわりに、マスに小さくメモを書きます |
| `erase` | Erase the cell | このマスを消す |
| `hint` | Hint | ヒント |
| `hintTitle` | Show the next cell you could fill in, and why | 次に入れられるマスと、その理由を表示します |
| `check` | Check | 確かめる |
| `checkTitle` | Say how many cells are wrong, without saying which | まちがっているマスの数だけを教えます（どこかは教えません） |
| `restart` | Restart | やり直す |
| `clock` | Time | 時間 |
| `pad` | Numbers | 数字 |
| `padNumber` | Number {n} | 数字{n} |
| `padDone` | Number {n}, all placed | 数字{n}、すべて置きました |
| `full` | Every cell is filled, and it is not right yet. | すべてのマスが埋まりましたが、まだ正しくありません。 |
| `checkRight` | Everything filled in so far is right. | ここまでに入れた数字は、すべて正しいです。 |
| `checkWrong` | {wrong} cells are wrong, {empty} still to fill. | まちがいが{wrong}マス、まだ空きが{empty}マスあります。 |
| `checkWrongNoneEmpty` | {wrong} cells are wrong. | まちがいが{wrong}マスあります。 |
| `checkOnlyEmpty` | Nothing wrong so far, {empty} still to fill. | いまのところまちがいはなく、空きが{empty}マスあります。 |
| `conflicts` | {n} cells break a rule. | ルールに反するマスが{n}マスあります。 |
| `hintOnly` | {cell} can only be {value}: every other number is ruled out by {where}. | {cell}は{value}しか入りません。ほかの数字は、{where}で入れないからです。 |
| `hintOnlyBy` | {cell} can only be {value}: every other number is ruled out by {where} and {by}. | {cell}は{value}しか入りません。ほかの数字は、{where}と{by}で入れないからです。 |
| `hintPlace` | In {group}, the {value} can only go in {cell}: no other cell there can hold it. | {group}で、{value}を入れられるのは{cell}だけです。ほかのマスには入りません。 |
| `hintAnswer` | {cell} is {value}. Nothing here follows from a single step, so this is the answer's own number. | {cell}は{value}です。ここは一手で決まるところがないので、答えの数字をそのまま示しています。 |
| `hintReplaces` | What is in {cell} now is wrong.  | いま{cell}に入っている数字はまちがいです。 |
| `hintDone` | Every cell is right. | すべてのマスが正しいです。 |
| `whereNumberPlace` | its row, column and box | 同じ行、列、ブロック |
| `whereDiagonal` | its row, column, box and diagonal | 同じ行、列、ブロック、対角線 |
| `whereJigsaw` | its row, column and region | 同じ行、列、領域 |
| `whereSumCages` | its row, column, box and cage | 同じ行、列、ブロック、囲み |
| `whereMoreOrLess` | its row and column | 同じ行と列 |
| `whereTowers` | its row and column | 同じ行と列 |
| `byCage` | the cage's sum | 囲みの合計 |
| `byMarks` | the more-than marks | 不等号 |
| `byClues` | the clues round the edge | 盤の外の数字 |
| `groupRow` | row {n} | 第{n}行 |
| `groupColumn` | column {n} | 第{n}列 |
| `groupBox` | box {n} | 第{n}ブロック |
| `groupRegion` | region {n} | 第{n}領域 |
| `groupDiagonal` | the diagonal from the top left | 左上から右下への対角線 |
| `groupDiagonalOther` | the diagonal from the top right | 右上から左下への対角線 |
| `paused` | Paused | 一時停止中 |
