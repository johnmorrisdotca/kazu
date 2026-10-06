export const MASYU_STRINGS = {
  en: { title: "Masyu", help: "Draw one loop through every pearl. White pearls go straight and turn at a neighboring cell; black pearls turn and go straight through the neighboring cell on each side.", undo: "Undo", hint: "Hint", check: "Check", restart: "Restart", won: "Solved!", helped: "Solved with help.", good: "The loop is still open. Keep going.", bad: "Check the marked line ends and pearls.", pearl: ["empty", "white pearl", "black pearl"] },
  ja: { title: "ましゅ", help: "すべての真珠を通る一つの輪を描きます。白真珠では直進して隣のマスで曲がり、黒真珠では曲がって両隣のマスで直進します。", undo: "戻す", hint: "ヒント", check: "確認", restart: "やり直す", won: "完成！", helped: "ヒントを使って完成。", good: "輪はまだ閉じていません。続けましょう。", bad: "線の端や真珠の周りを確認してください。", pearl: ["なし", "白真珠", "黒真珠"] },
} as const;
