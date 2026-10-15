---
title: "入力・メモ・標準の進捗を保存する"
section: how-to
order: 5
description: "プレイヤーの状態と問題の同一性を組にします。"
---

## 進捗と印刷ヒントを分ける

```ts
import {generateKazu,newKazuGame,toggleNote,encodeRun,encodeNotes,decodeRun,decodeNotes} from "@johnmorrisdotca/kazu";
const puzzle = generateKazu("number-place",4,"easy",42);
const game = newKazuGame(puzzle.kind,4,puzzle.givens)!;
const cell = game.printed.cells.findIndex(value=>value===0);
const noted = toggleNote(game,cell,1);
const restored = newKazuGame(puzzle.kind,4,puzzle.givens,{entries:decodeRun(encodeRun(noted.entries),4)!,notes:decodeNotes(encodeNotes(noted.notes),4)!});
console.log(restored?.notes[cell]);
```

種類、サイズ、完全な印刷コードを入力とメモに添えます。印刷マスの入力は0、メモは値`v`のビットで、`v-1`ではありません。`valuesOf`はヒントと入力を合わせ、`answerOf`は現在の答えを書きます。保存した入力文字列が全取消履歴も保つとは限りません。

## 専用の種類

各種類は自分のコードで盤と印を保存します。`encodeShikaku`、`encodeHitori`、`encodeRegionsGame`と対応する読取を使い、不正な状態は`null`です。同じ寸法でも他の種類の進捗を渡さないでください。

保存やダウンロードはホスト側で決めます。標準iframeは保存を読まず、全体のデモは従来の端末内の進捗を保ちます。結果の規則で使うなら助けと時間も保持します。ブラウザーの時間だけでサーバーの証明にはなりません。[コード](encodings.md)と[埋め込み](native-embeds.md)を参照してください。
