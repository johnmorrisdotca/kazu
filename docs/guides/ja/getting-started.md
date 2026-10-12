---
title: "はじめに"
section: tutorial
order: 1
description: "小さなナンプレを作って検証し、盤面を設置します。"
---

## 小さな標準の盤から

npm で `@johnmorrisdotca/kazu` をインストールします。主入口には六つの数字の盤と、名前付きの他のパズルのエンジンがあります。各種類に専用の規則、描画、プレイヤーの入口もあります。

```ts
import {generateKazu,checkKazu,newKazuGame,enterNumber,decodeCells,kazuProgress} from "@johnmorrisdotca/kazu";
const puzzle = generateKazu("number-place",4,"easy",42);
const game = newKazuGame(puzzle.kind,puzzle.size,puzzle.givens)!;
const solution = decodeCells(puzzle.solution,4)!;
const cell = game.printed.cells.findIndex(value=>value===0);
console.log(checkKazu(puzzle.kind,4,puzzle.givens,puzzle.solution));
console.log(kazuProgress(enterNumber(game,cell,solution[cell])));
```

非 null 表明は検証済みの生成問題に使っています。貼り付けたコードには `null` の分岐が必要です。印刷された数字と入力は別で、印刷マスの入力は 0 のままです。操作は新しい状態を返します。

[数字の盤](number-grids.md)、[他の種類](other-families.md)、[証明とヒント](hints-and-proof.md)、[埋め込み](native-embeds.md)を参照してください。全種類が 4×4 に対応すると考えず、`KAZU_SPECS` を確認します。
