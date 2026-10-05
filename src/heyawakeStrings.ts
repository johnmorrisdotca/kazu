export function heyawakeWords(language: "en" | "ja" = "en") {
  return language === "ja" ? {
    title: "へやわけ", ready: "マスを選び、白・黒・空白を切り替えます", wrong: "ルールに合わないマスがあります", checked: "今のところ矛盾はありません", won: "完成しました", helped: "ヒントを使って完成しました", undo: "元に戻す", check: "確認", hint: "ヒント", restart: "やり直す", help: "黒マスは辺でつながらず、白マスは一続きです。白い直線は部屋を二つまで通ります。", black: "黒", white: "白", blank: "未入力", row: "行", column: "列", noHint: "一意に解ける状態ではありません"
  } : {
    title: "Heyawake", ready: "Select a cell to cycle white, black and blank", wrong: "Some cells break a rule", checked: "No contradiction found so far", won: "Puzzle complete", helped: "Solved with a hint", undo: "Undo", check: "Check", hint: "Hint", restart: "Restart", help: "Black cells do not touch; white cells stay connected. A straight white run spans at most two rooms.", black: "black", white: "white", blank: "blank", row: "row", column: "column", noHint: "A unique solution is not established"
  };
}
