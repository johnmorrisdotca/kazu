---
title: "ナンプレと数字の盤の規則"
section: how-to
order: 2
description: "印刷コードと種類ごとの制約を組にします。"
---

## 標準の種類を選ぶ

`number-place` は通常のナンプレ、jigsaw は不規則な領域、diagonal は長い対角線、`sum-cages` は合計の領域です。`more-or-less` は不等号、towers は外周の見える塔の数を使います。種類でコードの読み方と答えの規則が決まります。

```ts
import {KAZU_KINDS,KAZU_SPECS,isKazuSize,generateKazu,checkKazu} from "@johnmorrisdotca/kazu";
console.log(KAZU_KINDS.map(kind=>[kind,KAZU_SPECS[kind].sizes]));
const puzzle = generateKazu("more-or-less",4,"easy",42);
console.log(isKazuSize("more-or-less",4),checkKazu(puzzle.kind,puzzle.size,puzzle.givens,puzzle.solution));
```

## 印刷された問題を全部保持する

コードには数字の後に領域、合計、不等号、外周のヒントが入る場合があります。検証の前に `size * size` だけへ切り詰めないでください。`readGivens` と種類別の読取を使い、`decodeCells` は数字の部分だけに使います。別の不等号・見え方の規則では `layoutOfGivens` が `null` になる場合があります。

種は 1〜`KAZU_SEED_MOST` の整数、難度は easy/medium/hard です。未対応の入力は例外です。大きな盤や難しい種類は同期処理で待つため、独自の画面では Worker を使えます。[従来の難度の説明](../../LEVELS.md)も参照してください。
