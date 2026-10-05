import { decodeSlitherlink, generateSlitherlink } from "./dist/slitherlink-entry.js";
import { mountSlitherlink } from "./dist/slitherlink-play-entry.js";
const get = id => document.getElementById(id);
const query = new URLSearchParams(location.search);
let language = query.get("lang") === "ja" ? "ja" : "en";
let handle;
let settings;
const text = {
  en: { field: "Your board", size: "Size", material: "Board material", seed: "Seed", make: "New puzzle", share: "Share puzzle", rulesTitle: "How to play", rules: "Join neighbouring dots to make one loop. Each number tells how many of its four sides belong to the loop. The line cannot branch or cross itself.", made: "Puzzle ready.", failed: "Could not prove a unique puzzle for these settings.", copied: "Puzzle link copied.", width: "Width", height: "Height", unique: "Every puzzle is proved to have one answer. Play stays on this device." },
  ja: { field: "盤面", size: "大きさ", material: "盤の素材", seed: "シード", make: "新しい問題", share: "問題を共有", rulesTitle: "遊び方", rules: "隣り合う点を線で結び、一本の輪を作ります。数字は、そのマスの四辺のうち線が通る辺の数です。線は分岐も交差もしません。", made: "問題ができました。", failed: "答えが一つの問題を作れませんでした。", copied: "問題のリンクをコピーしました。", width: "幅", height: "高さ", unique: "作った問題の答えは一つだけ。遊びの記録はこの端末に保存します。" }
};
function translate() {
  const w = text[language];
  document.documentElement.lang = language;
  for (const [id, key] of [["field-title", "field"], ["size-label", "size"], ["material-label", "material"], ["seed-label", "seed"], ["new", "make"], ["share", "share"], ["rules-title", "rulesTitle"], ["rules", "rules"], ["unique", "unique"]]) get(id).textContent = w[key];
  document.querySelectorAll(".dimensions label")[0].firstElementChild.textContent = w.width;
  document.querySelectorAll(".dimensions label")[1].firstElementChild.textContent = w.height;
  handle?.set({ language });
}
function dimensions() {
  const value = get("size").value;
  if (value === "custom") return;
  const [width, height] = value === "wide" ? [10, 6] : value === "tall" ? [6, 10] : [Number(value), Number(value)];
  get("width").value = String(width); get("height").value = String(height);
}
function start() {
  const width = Number(get("width").value), height = Number(get("height").value), seed = Number(get("seed").value);
  settings = { width, height, seed, material: get("material").value };
  try {
    const puzzle = generateSlitherlink(width, height, seed);
    handle?.destroy();
    let saved;
    try { saved = JSON.parse(localStorage.getItem("kazu-slitherlink-v1") ?? "null"); } catch { saved = null; }
    const restored = !query.has("seed") && saved && saved.width === width && saved.height === height && saved.seed === seed
      ? decodeSlitherlink(saved.progress) : null;
    handle = mountSlitherlink(get("board"), {
      board: puzzle,
      progress: restored ? saved.progress : undefined,
      material: settings.material,
      language,
      onChange: game => {
        try { localStorage.setItem("kazu-slitherlink-v1", JSON.stringify({ progress: JSON.stringify({ version: 1, board: game.board, edges: game.edges, helped: game.helped }), ...settings, language })); } catch { /* Storage is optional. */ }
      },
    });
    get("summary").textContent = `${width} × ${height}`;
    get("notice").textContent = text[language].made;
  } catch { get("notice").textContent = text[language].failed; }
}
for (const id of ["size", "width", "height", "seed", "material"]) if (query.has(id)) get(id).value = query.get(id);
if (query.has("width") || query.has("height")) get("size").value = "custom"; else dimensions();
get("size").onchange = dimensions;
for (const id of ["width", "height"]) get(id).onchange = () => { get("size").value = "custom"; };
get("setup").onsubmit = event => { event.preventDefault(); start(); };
get("material").onchange = () => { handle?.set({ material: get("material").value }); };
get("share").onclick = async () => {
  const params = new URLSearchParams({ ...settings, lang: language });
  const url = `${location.origin}${location.pathname}?${params}`;
  try { await navigator.clipboard.writeText(url); get("notice").textContent = text[language].copied; } catch { get("notice").textContent = url; }
};
const family = familyLanguage({ id: "kazu", words: { en: { pitch: "Slitherlink: connect dots into one loop, following the numbers around the cells.", name: "Kazu number puzzles", nameLink: "About the name", pageBack: "Number puzzles", pageApi: "API reference", foot: "A loop puzzle played on a grid of dots." }, ja: { pitch: "スリザーリンク。数字を手がかりに点を線で結び、一本の輪を作ります。", name: "Kazu 数字のパズル", nameLink: "名前について", pageBack: "数字のパズル", pageApi: "APIリファレンス", foot: "点を線で結び一本の輪を作るパズル。" } }, onChange: lang => { language = lang; translate(); } });
language = family.lang; translate();
if (query.has("seed")) start(); else start();
