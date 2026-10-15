import { VERSION, KAZU_KINDS, KAZU_LEVELS, KAZU_SPECS, isKazuSize } from "./dist/index.js";
import { kazuNameOf } from "./dist/strings.js";
import { KAZU_SEED_MOST, isKazuSeed } from "./dist/random.js";
import { KazuBoard, KAZU_EMBED_OPTION_KEYS } from "./dist/element.js";
import { embedDay } from "./dist/embed-day.js";
import "./dist/element-define.js";
import { familyEmbedBuilder, FAMILY_EMBED_BUILDER_WORDS } from "./family-embed-builder.js";
const words = {
  en: {
    ...FAMILY_EMBED_BUILDER_WORDS.en,pageDocs:"Docs",pageApi: "API",
    pitch: "Choose a number puzzle or a UTC daily puzzle, preview it, and copy the code for your page.",
    name: "Kazu means number in Japanese.",
    nameLink: "About the name",
    foot: "The setup is in the link. No game or personal data is stored.",
    toGallery: "The puzzles",
    makerBoard: "A board",
    makerBoardSays: "Six number puzzles, each generated from a seed with one answer.",
    copyLink: "Copy a link to this puzzle",
    badDay: "Use a real UTC date written YYYY-MM-DD, today or off.",
    badGrid: "Choose a grid supported by this puzzle kind.",
    badSeed: "Choose a whole-number seed in the displayed range."
  },
  ja: {
    ...FAMILY_EMBED_BUILDER_WORDS.ja,pageDocs:"ドキュメント",pageApi:"API（英語）",
    pitch: "数のパズル、またはUTCの日替わり問題を選び、表示を確認して、ページに埋め込むコードをコピーできます。",
    name: "「数」は英語のnumberに当たる日本語です。",
    nameLink: "名前について",
    foot: "設定はリンクに入ります。ゲームや個人情報は保存しません。",
    toGallery: "パズルの一覧",
    makerBoard: "盤",
    makerBoardSays: "6種類の数のパズルを、答えが1つになるようにシードから作ります。",
    copyLink: "このパズルへのリンクをコピー",
    badDay: "実在する日付をYYYY-MM-DD形式で入力するか、todayまたはoffを指定してください。UTCの日付を使います。",
    badGrid: "この種類のパズルに対応する盤の大きさを選んでください。",
    badSeed: "表示された範囲の整数をシードに指定してください。"
  },
};
const row = (id, kind, en, ja, extra = {}) => ({ id, kind, group: "board", names: { board: id, ...(id === "size" ? {} : { mount: ({ grid: "size", lang: "language", "tap-to-step": "tapToStep" }[id] ?? id) }) }, say: { en: { label: en[0], help: en[1] }, ja: { label: ja[0], help: ja[1] } }, ...extra });
const grids = [...new Set(Object.values(KAZU_SPECS).flatMap((spec) => spec.sizes))].sort((a, b) => a - b).map(String);
const options = [
  row("kind", "choice", ["Puzzle", "Choose one of the six kinds."], ["パズル", "6種類の中から選びます。"], { default: "number-place", choices: KAZU_KINDS, choiceLabels: Object.fromEntries(["en", "ja"].map((lang) => [lang, Object.fromEntries(KAZU_KINDS.map((kind) => [kind, kazuNameOf(kind, lang)]))])) }),
  row("grid", "choice", ["Grid", "The number of cells on each side, depending on puzzle kind."], ["盤の大きさ", "1辺のマスの数です。パズルの種類によって選べる数が変わります。"], { default: "9", choices: grids, control: "select" }),
  row("level", "choice", ["Difficulty", "Easy, medium or hard."], ["むずかしさ", "やさしい・ふつう・むずかしいから選びます。"], { default: "medium", choices: KAZU_LEVELS }),
  row("seed", "number", ["Seed", "A fixed seed repeats a puzzle; blank chooses a new one. Daily mode replaces it."], ["シード", "同じシードで同じ問題になります。空欄なら新しい問題を作ります。日替わりでは別のシードを使います。"], { range: { min: 1, max: KAZU_SEED_MOST, step: 1 } }),
  row("daily", "text", ["Daily", "YYYY-MM-DD, today, or off. The day is counted in UTC."], ["日替わり", "YYYY-MM-DD、today、offを指定します。UTCの日付を使います。"]),
  row("size", "choice", ["Display size", "Small, medium or large; independent of the grid."], ["表示の大きさ", "小・中・大を選びます。盤のマスの数とは別です。"], { default: "medium", choices: ["small", "medium", "large"] }),
  row("width", "number", ["Width", "The puzzle's width in pixels, fitting a narrower parent."], ["幅", "表示の幅をピクセルで指定します。狭い表示枠にも収まります。"], { range: { min: 200, max: 1000, step: 10 } }),
  row("theme", "choice", ["Theme", "Light, dark or the device's preference."], ["配色", "明るい配色・暗い配色、または端末の設定に合わせます。"], { default: "auto", choices: ["auto", "light", "dark"] }),
  row("lang", "choice", ["Language", "The language of controls and spoken cells."], ["言語", "操作ボタンと読み上げるマスの言語です。"], { choices: ["en", "ja"] }),
  row("label", "text", ["Spoken label", "An optional label for a screen reader."], ["読み上げる名前", "スクリーンリーダー用の名前です。指定は任意です。"]),
  row("hints", "choice", ["Hints", "Place the answer, show a hint, or turn hints off."], ["ヒント", "答えを入れる、ヒントを示す、ヒントなしから選びます。"], { default: "place", choices: ["place", "show", "off"] }),
  row("check", "choice", ["Check", "Count errors, show them, or turn checks off."], ["確かめる", "まちがいを数える、印を付ける、確認なしから選びます。"], { default: "count", choices: ["count", "show", "off"] }),
  ...["conflicts", "peers", "tidy", "tap-to-step", "clock", "controls"].map((id, at) => row(id, "boolean", [["Conflicts", "Mark entries that break a rule."], ["Peers", "Highlight the selected cell's groups."], ["Tidy notes", "Remove a written value from peer notes."], ["Tap to step", "Tap the selected cell to step its value."], ["Clock", "Show elapsed play time."], ["Controls", "Show the number pad and buttons."]][at], [["ルール違反", "ルールに反する数字に印を付けます。"], ["関連するマス", "選んだマスと同じグループを強調します。"], ["メモの整理", "書いた数字を関連するマスのメモから消します。"], ["タップで進める", "選んだマスをタップすると数字が進みます。"], ["時計", "遊んだ時間を表示します。"], ["操作ボタン", "数字のパッドとボタンを表示します。"]][at], { default: true })),
];
const leftOut = {};
for (const name of ["givens", "solution", "run", "notes", "elapsed"]) for (const scope of ["board", "mount"]) leftOut[`${scope}.${name}`] = "Custom puzzles and kept play state belong to host code; the builder makes fresh seeded puzzles.";
for (const name of ["onChange", "onHint", "onCheck", "onSolve"]) leftOut[`mount.${name}`] = "Host callbacks belong to options; native events carry the same detail.";
let mounted;
const page = globalThis.familyLanguage({ id: "kazu", words, onChange: () => mounted?.draw() });
const heights = {};
const key = (settings) => JSON.stringify(settings);
function problem(settings) { try { const day = embedDay(settings.daily); if (day === null && settings.seed !== undefined && !isKazuSeed(Number(settings.seed))) return "badSeed"; } catch { return "badDay"; } return isKazuSize(settings.kind ?? "number-place", Number(settings.grid ?? 9)) ? null : "badGrid"; }
const builder = familyEmbedBuilder({ id: "kazu", packageName: "@johnmorrisdotca/kazu", major: VERSION.split(".")[0], site: "https://johnmorrisdotca.github.io/kazu/", title: "Kazu · number puzzle", titleJa: "数のパズルの埋め込み", options, leftOut, groups: { board: { en: "The puzzle", ja: "パズルの設定" } }, makers: { board: { names: "board", element: "board", tag: "kazu-board", embed: "embed/", required: ["kind", "grid"], description: "makerBoardSays", formats: ["element", "iframe", "module", "react", "vue", "svelte", "angular", "html", "url"], width: 640, height: (settings) => heights[key(settings)] ?? ({ small: 780, medium: 940, large: 1100 }[settings.size] ?? 940) } }, code: ({ maker, format, settings }) => {
  if (problem(settings) !== null) return null;
  if ((format === "iframe" || format === "url") && settings.lang === undefined) return builder.codeFor(maker, format, options, { ...settings, lang: page.lang });
  return undefined;
} });
builder.validateCoverage({ board: KazuBoard.observedAttributes, mount: KAZU_EMBED_OPTION_KEYS });
mounted = builder.mount({ words, language: () => page, initial: { board: { kind: "number-place", grid: "9", seed: 1, size: "medium", lang: page.lang } }, renderPreview: ({ stage, attrs, settings, note, say }) => {
  if (problem(settings) !== null) { note.textContent = say(problem(settings)); return { destroy() {} }; }
  const board = globalThis.document.createElement("kazu-board"); for (const [name, value] of attrs) board.setAttribute(name, value);
  board.addEventListener("kazu-load", () => { const actual = board.getBoundingClientRect(); const intended = Math.min(Number(settings.width) || ({ small: 320, medium: 480, large: 640 }[settings.size] ?? 480), 624); heights[key(settings)] = Math.ceil(intended + actual.height - actual.width) + 32; mounted?.refreshCode(); });
  stage.append(board); return { destroy() { board.remove(); } };
} });
globalThis.document.getElementById("bld-groups").addEventListener("click", (event) => {
  if (!event.target.closest("#opt-kind button")) return;
  globalThis.queueMicrotask(() => { const settings = mounted.settings; const kind = settings.kind ?? "number-place"; if (isKazuSize(kind, Number(settings.grid ?? 9))) return; const grid = globalThis.document.getElementById("opt-grid"); grid.value = String(KAZU_SPECS[kind].defaultSize); grid.dispatchEvent(new globalThis.Event("change", { bubbles: true })); });
});

import { attachDocsLink } from "./docs-link.js";
attachDocsLink();
