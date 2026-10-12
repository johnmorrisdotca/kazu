---
title: "標準プレイヤーの描画と埋め込み"
section: how-to
order: 6
description: "種類ごとの設置を使い、表示と規則を分けます。"
---

## 数字の盤を設置する

```ts no-run
import {generateKazu} from "@johnmorrisdotca/kazu";
import {mountKazu} from "@johnmorrisdotca/kazu/play";
const puzzle = generateKazu("number-place",4,"easy",42);
const host = document.createElement("div");document.body.append(host);
const board = mountKazu(host,{...puzzle,hints:"show",onSolve:detail=>console.log(detail.solved)});
console.log(board?.detail().progress);board?.destroy();
```

不正な設定には `mountKazu` が `null` です。専用の種類は `{board:puzzle}` と各自の型で設置します。撤去する盤面は破棄します。SVG は別入口で、画像を返し、操作を設置するものではありません。

## 作成する種類を選ぶ

[ビルダー](https://johnmorrisdotca.github.io/kazu/builder.html)には数字の盤と専用の種類、固定・日替わりの種、助け、表示設定、各種の埋め込みコードがあります。表示の `size` は small/medium/large、問題寸法は作成する種類の grid 項目です。コールバックや構造化した盤・進捗はホスト側の設定として説明します。

標準イベントは意味を保ち、Shadow DOM を越えて伝わります。iframe の detail では origin と送信元を確認します。日替わりの種は設置時に決まり、切替タイマーはありません。[従来の全仕様](../../embeds.md)にプロパティ、優先順、ホストの設定、フレームの検証があります。各デモの Docs は選択中の言語に従います。
