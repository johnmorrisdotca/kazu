// Builds the static demo for GitHub Pages into ./site: the page, written here from the family's
// shared header and footer, with the family's stylesheet, Kazu's own, the page's script and the
// compiled library beside it.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

import { API_CSS, apiPage } from "./api.mjs";
import { FAMILY_SCRIPT, familyFooter, familyHead, familyHeader, familyUnreviewed } from "./family-template.mjs";

const id = "kazu";
const ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%232f5d4a'/%3E%3Ctext x='50' y='72' font-size='64' text-anchor='middle' fill='%23f3efe4'%3E数%3C/text%3E%3C/svg%3E";

const uses = [
  `import { generateKazu, checkKazu } from "@johnmorrisdotca/kazu";`,
  `const puzzle = generateKazu("sum-cages", 9, "medium", 42)  // { givens, solution, … }, the same in every browser`,
  `checkKazu("sum-cages", 9, puzzle.givens, answer)  // { ok: true }, in O(cells)`,
  `countKazuSolutions("number-place", 9, givens)  // 1`,
  `hintKazu("towers", 5, givens, entries)  // { cell, value, why: "only-place", group: { type: "row", index: 2 } }`,
  `drawKazu("jigsaw", 7, givens, { entries, selected: 10 })  // the grid as SVG text`,
  `mountKazu(element, { kind: "towers", size: 5, givens, hints: "show" })  // a board to play, by touch, mouse and keyboard`,
  `<kazu-board kind="diagonal" size="9" level="hard" seed="7"></kazu-board>`,
];
const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const row = (testid, label, help) => `<div class="setup fam-row" data-help-en="${escape(help[0])}" data-help-ja="${escape(help[1])}"><span class="fam-label" data-say="${label}"></span><div class="fam-seg" role="group" data-say-label="${label}" id="${testid}" data-testid="${testid}"></div></div>`;

const page = `<!doctype html>
<html lang="en">
  <head>
    ${familyHead({
      id,
      title: "Kazu · Sudoku, Killer Sudoku, Futoshiki and Skyscrapers",
      description: "Play six number puzzles in your browser: Sudoku (4×4 to a 16×16 Giant), Jigsaw, Diagonal and Killer Sudoku, Futoshiki and Skyscrapers. Pencil marks, hints that say why, undo and a clock. Free and open source, in English and Japanese.",
      ogTitle: "Kazu number puzzles",
      ogDescription: "Sudoku, Killer Sudoku, Futoshiki, Skyscrapers and more. Every puzzle has exactly one answer.",
    })}
    <link rel="icon" href="${ICON}" />
    <link rel="stylesheet" href="family.css" />
    <link rel="stylesheet" href="kazu.css" />
  </head>
  <body>
    <main>
      ${familyHeader({ id, links: [{ href: "api.html", say: "pageApi" }] })}
      <nav aria-label="More grid puzzles"><a href="shikaku.html">Shikaku</a> · <a href="hitori.html">Hitori</a> · <a href="nurikabe.html">Nurikabe</a> · <a href="akari.html">Akari</a> · <a href="juosan.html">Juosan</a> · <a href="slitherlink.html">Slitherlink</a></nav>
      ${row("kinds", "puzzle", ["Choose which of the six puzzles to play. Each one has its own rules, listed below the board.", "遊ぶパズルを、六つの中から選びます。ルールは盤の下に載っています。"])}
      ${row("sizes", "size", ["Choose the size of the grid. A bigger grid takes longer.", "盤の大きさを選びます。大きいほど時間がかかります。"])}
      ${row("levels", "level", ["Choose how hard the puzzle is. Easy can be solved by reasoning alone; hard may ask you to try something and see.", "問題のむずかしさを選びます。やさしい問題は推理だけで解け、むずかしい問題では試してみる場面があります。"])}
      <div class="setup fam-row" data-help-en="Start a different puzzle of this kind, size and level. The seed names it, so the same seed always makes the same puzzle." data-help-ja="同じ種類、大きさ、むずかしさの別の問題を始めます。シードが問題の名前で、同じシードからはいつも同じ問題ができます。">
        <button type="button" class="fam-button" id="new" data-testid="new" data-say="newPuzzle"></button>
        <button type="button" class="fam-button" id="restart" data-testid="restart" data-say="restart">Restart</button>
        <span class="fam-chip" id="seed" data-testid="seed"></span>
      </div>
      <div class="table fam-felt" id="board" data-testid="board"></div>
      <section class="settings" aria-labelledby="play-title">
        <h2 id="play-title" data-say="play"></h2>
        ${row("hints", "hints", ["What the Hint button does: fills the cell in, only points at it and says why, or is taken away. A solve that used a hint counts as helped.", "ヒントボタンの動きです。数字を入れる、指して理由を言うだけ、ボタンをなくす、から選びます。ヒントを使って解くと「助けあり」になります。"])}
        ${row("check", "check", ["What the Check button does: says how many cells are wrong, also marks them, or is taken away. It never says which unless you choose Marks them.", "確かめるボタンの動きです。まちがいの数を言う、印もつける、ボタンをなくす、から選びます。「印をつける」以外では、どこがまちがいかは言いません。"])}
        ${row("conflicts", "conflicts", ["Show in red any number that breaks a rule, as soon as you write it, without saying what the answer is.", "ルールに反する数字を、書いたらすぐ赤く表示します。答えは教えません。"])}
        ${row("peers", "peers", ["Colour the row, column and group of the cell you chose, and every cell holding the same number.", "選んだマスの行、列、グループと、同じ数字のマスに色をつけます。"])}
      </section>
      <section class="more rules" aria-labelledby="rules-title">
        <h2 id="rules-title"></h2>
        <p id="rules-tagline"></p>
        <ul id="rules-list"></ul>
        <p id="rules-origin"></p>
      </section>
      ${familyUnreviewed({ id })}
      <section class="more" aria-labelledby="more-title">
        <h2 id="more-title" data-say="moreTitle"></h2>
        <p data-say="moreText"></p>
        <ul class="uses">
          ${uses.map((line) => `<li><code>${escape(line)}</code></li>`).join("\n          ")}
        </ul>
      </section>
      <section class="more tag" aria-labelledby="tag-title">
        <h2 id="tag-title" data-say="tagTitle"></h2>
        <p data-say="tagText"></p>
        <kazu-board id="tag" data-testid="tag" kind="sum-cages" size="6" level="easy" seed="42" hints="show"></kazu-board>
      </section>
      ${familyFooter({ id })}
    </main>
    <script>${FAMILY_SCRIPT}</script>
    <script type="module" src="dist/element-define.js"></script>
    <script type="module" src="demo.js"></script>
  </body>
</html>
`;

rmSync("site", { recursive: true, force: true });
mkdirSync("site", { recursive: true });
cpSync("demo", "site", { recursive: true });
cpSync("dist", "site/dist", { recursive: true });
writeFileSync("site/index.html", page);
// The API reference, made from the source: every export of every entry point.
writeFileSync("site/api.css", API_CSS);
writeFileSync("site/api.html", apiPage({ id, name: "Kazu", icon: ICON }));
console.log("site/ is ready: serve it, or let the Pages workflow publish it.");

for (const game of ["shikaku", "hitori", "nurikabe", "akari", "juosan", "slitherlink"]) {
  const gamePage = readFileSync(`demo/${game}.html`, "utf8")
    .replace("<!--family-header-->", familyHeader({ id, links: [{ href: "index.html", say: "pageBack" }, { href: "api.html", say: "pageApi" }] }))
    .replace("<!--family-footer-->", familyFooter({ id }))
    .replace("<!--family-unreviewed-->", familyUnreviewed({ id }))
    .replace("<!--family-script-->", `<script>${FAMILY_SCRIPT}</script>`);
  writeFileSync(`site/${game}.html`, gamePage);
}
