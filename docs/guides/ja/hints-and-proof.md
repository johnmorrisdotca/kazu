---
title: "解答の検証・ヒント・証明を分ける"
section: how-to
order: 4
description: "探索完了を一意性の判断に含めます。"
---

## 正しい解答と一意性は別

```ts
import {generateHitori,checkHitori,solveHitori} from "@johnmorrisdotca/kazu/hitori";
const puzzle = generateHitori(5,42,"easy");
const proof = solveHitori(puzzle,{limit:2,nodes:20000});
console.log(checkHitori(puzzle,puzzle.solution).ok,proof.count,proof.complete);
console.log(proof.complete && proof.count===1);
```

検証は与えた解答が標準のヒントに合うかを調べます。探索は予算内で答えを探し、未完で止まる場合があります。打切り後に一つ見つかっただけでは一意性の証明になりません。上限を2にし、完了してcount 1か確認します。六つの数字の盤の数だけの関数では、完了を個数だけから推測しないでください。

## ヒントの意味

数字のヒントは、唯一の数や唯一の位置を先に探します。答えから補う手は`why:"answer"`と示し、推論による一手と偽りません。間違った入力は推論の前提にしません。各種類のヒントは長方形、マス、辺などを返し、使える手がなければ`null`です。標準のプレイは助けを記録します。助けを使った結果を未使用と報告しないでください。[hintKazu](api:hintKazu)と[プレイヤーのモード](../../PLAYING.md)を参照してください。
