---
title: "専用の論理パズルを使う"
section: how-to
order: 3
description: "長方形、塗り、電球、ループに合う状態を選びます。"
---

## 長方形と塗り

四角に切れは面積のヒントに合う長方形を置きます。ひとりにしてくれは重複数字を塗り、白をつなぎます。ぬりかべは島と海、美術館は白いマスを照らす電球と壁の数字、縦横は領域内の線、へやわけは部屋と直線の条件を使います。

```ts
import {generateJuosan,checkJuosan} from "@johnmorrisdotca/kazu/juosan";
import {generateMasyu,checkMasyu} from "@johnmorrisdotca/kazu/masyu";
const marks = generateJuosan(3,2,"easy",42);
const loop = generateMasyu(5,42);
console.log(checkJuosan(marks,marks.solution),checkMasyu(loop,loop.solution));
```

## 辺と部屋の数字

Loop は格子の頂点の辺、ましゅはマス中心を通る真珠付きの線です。ヤジリンは塗りとマス中心の線を組み合わせ、辺の配列は互換ではありません。波及効果は部屋の数字と同じ数字の距離、カックロは交差する合計と重複しない数字、Regions は同じ数字をその数の大きさの領域につなぎます。

名前付きの専用入口を読み、必要なときだけ `/draw`、`/play` を加えます。生成の現状は、縦横が 3×2/2×3、ましゅとヤジリンが 5×5、波及効果が 9×9 です。サイズ定数や独自盤の読取が、全サイズの生成を保証するわけではありません。[全種類の説明](../../PUZZLES.md)、[Regions](../../REGIONS.md)、[へやわけ](../../HEYAWAKE.md)に詳しい規則と資料があります。
