import type { KazuKind } from "./kinds.ts";

/**
 * WHAT EACH PUZZLE IS CALLED, and what it is, in English and Japanese: the name a player searches for,
 * its Japanese name, a line saying how it is played, and a few lines of rules. Plain data, for a page
 * that lists the puzzles (a chooser, a rules page); `strings.ts` has the words a playable board says.
 *
 * The English names are the ones players search for: Sudoku, Killer Sudoku, Futoshiki, Skyscrapers.
 * 数独 is Nikoli's mark in Japan, so Sudoku's Japanese name here is ナンプレ (Number Place, the puzzle's
 * own original name, and the word Japanese publishers use); the others keep names of their own. The
 * keys the package uses are `number-place`, `sum-cages`, `more-or-less`, `towers`: what each one is, not
 * somebody's trademark.
 */
export type KazuName = {
  /** The name players search for. */
  en: string;
  /** The Japanese name. */
  ja: string;
  /** Other names the same puzzle goes by. */
  alsoKnownAs: readonly string[];
  /** How it is played, in a line. */
  tagline: { en: string; ja: string };
  /** The rules, a few lines each. */
  rules: { en: readonly string[]; ja: readonly string[] };
  /** Where it comes from, in a sentence. */
  origin: { en: string; ja: string };
};

export const KAZU_NAMES: Record<KazuKind, KazuName> = {
  "number-place": {
    en: "Sudoku",
    ja: "ナンプレ",
    alsoKnownAs: ["Number Place", "Nanpure"],
    tagline: {
      en: "Fill the grid so every row, column and box holds each number once.",
      ja: "どの行、列、ブロックにも、同じ数字が一つずつ入るように、盤を埋めます。",
    },
    rules: {
      en: [
        "Fill every empty cell with a number from 1 up to the side of the grid, so that each row, each column and each box holds every number exactly once.",
        "The numbers already printed are the givens. They stay where they are, and every puzzle has exactly one answer that fits them.",
        "The 16×16 Giant has sixteen symbols: 1 to 9, then A to G for 10 to 16. The 25×25 Colossus has twenty-five: A to P for 10 to 25.",
        "Easy yields to reasoning alone: every cell can be found from what is already there. Medium and hard ask you to try something and see.",
      ],
      ja: [
        "空いているマスに、1から盤の一辺の数までの数字を入れます。どの行、列、ブロックにも、同じ数字が一つずつ入ります。",
        "最初から書かれている数字はそのままです。どの問題も、答えはちょうど一つだけです。",
        "16×16の「特大」は、1から9までの数字に、10から16までを表すAからGを足した16種類を使います。25×25の「巨大」は、10から25までを表すAからPまでを使う25種類です。",
        "やさしい問題は、推理だけで全部のマスが決まります。ふつうとむずかしい問題では、試してみる場面があります。",
      ],
    },
    origin: {
      en: "Howard Garns's Number Place, printed by Dell in 1979; Nikoli took it to Japan in 1984 and named it Sudoku.",
      ja: "1979年にデル社が載せた、ハワード・ガーンズの「ナンバー・プレース」です。1984年にニコリが日本に紹介し、数独と名づけました。",
    },
  },
  jigsaw: {
    en: "Jigsaw Sudoku",
    ja: "変形ナンプレ",
    alsoKnownAs: ["Nonomino", "Irregular Sudoku"],
    tagline: {
      en: "Sudoku with the boxes cut into irregular regions.",
      ja: "ブロックが、いびつな形の領域に変わったナンプレです。",
    },
    rules: {
      en: [
        "Fill every empty cell with a number from 1 up to the side of the grid, so that each row, each column and each outlined region holds every number exactly once.",
        "The regions are drawn in heavier lines, and each has as many cells as the grid is wide, in a shape of its own.",
        "Every puzzle has exactly one answer. Easy yields to reasoning alone.",
      ],
      ja: [
        "空いているマスに、1から盤の一辺の数までの数字を入れます。どの行、列、太線で囲まれた領域にも、同じ数字が一つずつ入ります。",
        "領域は太い線で描かれ、どれも盤の一辺と同じ数のマスでできていて、形はそれぞれ違います。",
        "どの問題も、答えはちょうど一つです。やさしい問題は、推理だけで解けます。",
      ],
    },
    origin: {
      en: "Sudoku with its boxes traded for irregular shapes, printed under names such as Nonomino and Jigsaw Sudoku. With no boxes it is not tied to sides that divide evenly, so it comes at five and seven as well.",
      ja: "ブロックをいびつな形に置きかえたナンプレで、ノノミノやジグソー数独などの名前で載っています。ブロックがないので、5×5や7×7もあります。",
    },
  },
  diagonal: {
    en: "Diagonal Sudoku",
    ja: "対角ナンプレ",
    alsoKnownAs: ["Sudoku X", "X-Sudoku"],
    tagline: {
      en: "Sudoku where the two long diagonals must hold each number once too.",
      ja: "二本の対角線にも、同じ数字が一つずつ入るナンプレです。",
    },
    rules: {
      en: [
        "Fill every empty cell with a number from 1 up to the side of the grid, so that each row, each column and each box holds every number exactly once.",
        "The two long diagonals, shaded corner to corner, must each hold every number exactly once as well.",
        "Every puzzle has exactly one answer, and the diagonals are part of reaching it: fewer numbers are printed than a plain grid would need.",
      ],
      ja: [
        "空いているマスに、1から盤の一辺の数までの数字を入れます。どの行、列、ブロックにも、同じ数字が一つずつ入ります。",
        "角から角へ色のついた二本の対角線にも、同じ数字が一つずつ入ります。",
        "どの問題も、答えはちょうど一つです。対角線も手がかりなので、ふつうの盤より書かれている数字は少なめです。",
      ],
    },
    origin: {
      en: "The most common extra rule laid on Sudoku: the two diagonals count as groups as well. Newspapers print it as Sudoku X.",
      ja: "ナンプレにいちばんよく足される決まりで、二本の対角線もグループとして数えます。新聞では「数独X」の名で載っています。",
    },
  },
  "sum-cages": {
    en: "Killer Sudoku",
    ja: "サムナンプレ",
    alsoKnownAs: ["Sumdoku", "Sum Number Place"],
    tagline: {
      en: "Sudoku with almost no numbers printed: dashed cages each give the sum of the numbers inside them.",
      ja: "数字はほとんど書かれていません。点線の囲みごとに、中の数字の合計だけが示されます。",
    },
    rules: {
      en: [
        "Fill every cell with a number from 1 up to the side of the grid, so that each row, each column and each box holds every number exactly once.",
        "The dashed outlines are cages. The small number in a cage's corner is the sum of the numbers inside it, and no number appears twice in one cage.",
        "Almost nothing is printed: the sums are the clues. Every puzzle has exactly one answer, and the harder levels have fewer, bigger cages.",
      ],
      ja: [
        "すべてのマスに、1から盤の一辺の数までの数字を入れます。どの行、列、ブロックにも、同じ数字が一つずつ入ります。",
        "点線で囲まれた部分が「囲み」です。囲みの角の小さな数字は、中の数字の合計で、同じ数字は一つの囲みに二度入りません。",
        "ほとんど何も書かれておらず、合計が手がかりです。どの問題も答えはちょうど一つで、むずかしいほど囲みは大きく、数は少なくなります。",
      ],
    },
    origin: {
      en: "Played in Japan in the 1990s as sum number place, and made famous as Killer Sudoku by The Times in 2005.",
      ja: "1990年代の日本で「サムナンプレ」として遊ばれ、2005年に英国のタイムズ紙が「キラー数独」として広めました。",
    },
  },
  "more-or-less": {
    en: "Futoshiki",
    ja: "不等式",
    alsoKnownAs: ["Unequal", "Greater Than Sudoku"],
    tagline: {
      en: "Fill the square so every row and column holds each number once, and every more-than mark is true.",
      ja: "どの行と列にも同じ数字が一つずつ入り、不等号がすべて正しくなるように、盤を埋めます。",
    },
    rules: {
      en: [
        "Fill every cell with a number from 1 up to the side of the square, so that each row and each column holds every number exactly once.",
        "A mark between two cells says which is the bigger: the open end faces the larger number, the point the smaller.",
        "Every puzzle has exactly one answer, and every mark and given is needed to reach it.",
      ],
      ja: [
        "すべてのマスに、1から盤の一辺の数までの数字を入れます。どの行にも列にも、同じ数字が一つずつ入ります。",
        "二つのマスのあいだの印は、どちらが大きいかを示します。開いているほうが大きい数字、とがっているほうが小さい数字です。",
        "どの問題も、答えはちょうど一つです。書かれている数字と印は、すべて必要なものだけです。",
      ],
    },
    origin: {
      en: "Futoshiki 不等式, Tamaki Seimiya's puzzle of 2001, which Nikoli published.",
      ja: "2001年に日本で考案された不等式のパズルで、ニコリが載せました。",
    },
  },
  towers: {
    en: "Skyscrapers",
    ja: "摩天楼",
    alsoKnownAs: ["Towers", "Building Heights"],
    tagline: {
      en: "Every number is a tower's height. The clues around the edge say how many towers you can see from there.",
      ja: "数字は塔の高さです。盤の外の数字は、そこから見える塔の数を表します。",
    },
    rules: {
      en: [
        "Fill every cell with a tower from 1 up to the side of the square, so that each row and each column holds every height exactly once.",
        "A number outside the square says how many towers can be seen looking in from there. A taller tower hides every shorter one behind it.",
        "So a 1 means the tallest tower stands right beside the clue, and a clue as big as the square means the towers climb one step at a time.",
      ],
      ja: [
        "すべてのマスに、1から盤の一辺の数までの高さの塔を置きます。どの行にも列にも、同じ高さが一つずつ入ります。",
        "盤の外の数字は、そこから中を見たときに見える塔の数です。高い塔は、その後ろの低い塔を隠します。",
        "つまり、1は一番高い塔がすぐ隣にあること、盤の一辺と同じ数は、塔が一段ずつ高くなることを意味します。",
      ],
    },
    origin: {
      en: "A Japanese logic puzzle known in English as Skyscrapers, set at the first World Puzzle Championship in 1992; Simon Tatham's puzzle collection calls it Towers.",
      ja: "英語ではスカイスクレイパーと呼ばれる日本のロジックパズルで、1992年の第1回世界パズル選手権で出題されました。",
    },
  },
};

/** What each side is for, under its size on a chooser: the quick one, the usual one, the long one. */
export const KAZU_SIZE_NAMES: Record<KazuKind, Record<number, { en: string; ja: string }>> = {
  "number-place": { 4: { en: "Quick", ja: "速" }, 6: { en: "Short", ja: "短" }, 9: { en: "Classic", ja: "定番" }, 16: { en: "Giant", ja: "特大" }, 25: { en: "Colossus", ja: "巨大" } },
  jigsaw: { 5: { en: "Quick", ja: "速" }, 6: { en: "Short", ja: "短" }, 7: { en: "Standard", ja: "定番" }, 9: { en: "Classic", ja: "本格" } },
  diagonal: { 6: { en: "Short", ja: "短" }, 9: { en: "Classic", ja: "定番" } },
  "sum-cages": { 6: { en: "Short", ja: "短" }, 9: { en: "Classic", ja: "定番" } },
  "more-or-less": { 4: { en: "Quick", ja: "速" }, 5: { en: "Standard", ja: "定番" }, 6: { en: "Longer", ja: "長め" }, 7: { en: "Long", ja: "長" } },
  towers: { 4: { en: "Quick", ja: "速" }, 5: { en: "Standard", ja: "定番" }, 6: { en: "Longer", ja: "長め" }, 7: { en: "Long", ja: "長" } },
};
