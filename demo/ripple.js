import { decodeRipple, encodeRipple, generateRipple } from "./dist/ripple-entry.js";
import { mountRipple } from "./dist/ripple-play-entry.js";
const get = id => document.getElementById(id), params = new URLSearchParams(location.search);
let language = params.get("lang") === "ja" ? "ja" : "en", handle, activeSeed = Number(params.get("seed") ?? 42), started = Date.now(), stopped = null;
const words = {
  en: { field: "Your board", size: "Board size", material: "Board material", pieces: "Numbers", seed: "Seed", make: "New puzzle →", share: "Share puzzle", unique: "Every generated board has one proved solution. Play stays on this device.", rulesTitle: "How to play", rules: "Fill each room with 1 through its size. If the same number appears twice in a row or column, there must be at least that many cells between them.", ready: "Unique puzzle ready.", failed: "Could not prove a unique board. Try another seed.", copied: "Puzzle link copied.", origin: "Ripple Effect is a Nikoli puzzle. These boards are generated here; no Nikoli puzzles are used.", small: "9 × 9 · small rooms" },
  ja: { field: "盤面", size: "盤の大きさ", material: "盤の素材", pieces: "数字", seed: "シード", make: "新しい問題 →", share: "問題を共有", unique: "作った盤は解が一つだけ。遊びの記録はこの端末に保存します。", rulesTitle: "遊び方", rules: "部屋には1から部屋の大きさまでの数字を一つずつ入れます。同じ数字を同じ行・列に置くときは、その数字以上のマスを間に空けます。", ready: "答えが一つの問題ができました。", failed: "答えが一つの盤を作れませんでした。別のシードを試してください。", copied: "問題のリンクをコピーしました。", origin: "Ripple Effectはニコリのパズルです。ここで問題を作り、ニコリの問題は使っていません。", small: "9 × 9 · 小さな部屋" }
};
const pageIds = [["field-title", "field"], ["size-label", "size"], ["material-label", "material"], ["pieces-label", "pieces"], ["seed-label", "seed"], ["new", "make"], ["share", "share"], ["unique", "unique"], ["rules-title", "rulesTitle"], ["rules", "rules"]];
function translate() {
  const w = words[language]; document.documentElement.lang = language;
  pageIds.forEach(([id, key]) => { get(id).textContent = w[key]; });
  handle?.set({ language });
}
function appearance() { return { material: get("material").value, pieces: get("pieces").value, language }; }
function play(board, progress) {
  handle?.destroy(); started = Date.now(); stopped = null;
  handle = mountRipple(get("board"), { board, progress, ...appearance(), onChange: game => { try { localStorage.setItem("kazu-ripple-v1", JSON.stringify({ progress: encodeRipple(game), seed: activeSeed, ...appearance() })); } catch { /* Storage may be disabled. */ } }, onFinish: game => { if (game.values.every(Boolean)) stopped = Date.now(); } });
  get("summary").textContent = `${board.width} × ${board.height} · ${words[language].small}`;
  try { localStorage.setItem("kazu-ripple-v1", JSON.stringify({ progress: handle.progress(), seed: activeSeed, ...appearance() })); } catch { /* Storage may be disabled. */ }
}
function start() {
  activeSeed = Number(get("seed").value);
  try {
    const puzzle = generateRipple(9, 9, activeSeed);
    let saved; try { saved = JSON.parse(localStorage.getItem("kazu-ripple-v1") ?? "null"); } catch { saved = null; }
    const restored = !params.has("seed") && saved?.seed === activeSeed ? decodeRipple(saved.progress) : null;
    play(puzzle, restored ? saved.progress : undefined);
    get("notice").textContent = words[language].ready;
  } catch { get("notice").textContent = words[language].failed; }
}
for (const id of ["material", "pieces"]) if (params.has(id)) get(id).value = params.get(id);
if (params.has("seed")) get("seed").value = params.get("seed");
get("setup").onsubmit = event => { event.preventDefault(); start(); };
for (const id of ["material", "pieces"]) get(id).onchange = () => { handle?.set(appearance()); };
get("share").onclick = async () => {
  const query = new URLSearchParams({ seed: String(activeSeed), ...appearance() }); const url = `${location.origin}${location.pathname}?${query}`;
  try { await navigator.clipboard.writeText(url); get("notice").textContent = words[language].copied; } catch { get("notice").textContent = url; }
};
setInterval(() => { const seconds = Math.floor(((stopped ?? Date.now()) - started) / 1000); get("clock").textContent = `${language === "ja" ? "時間" : "Time"} ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`; }, 1000);
const pageLanguage = familyLanguage({ id: "kazu", words: { en: { pitch: "Ripple Effect: fill rooms with consecutive numbers and leave enough space between repeats.", name: "Kazu number puzzles", nameLink: "About the name", pageBack: "Number puzzles", pageApi: "API reference", foot: "A room-and-spacing puzzle played with numbers." }, ja: { pitch: "波及効果。部屋に数字を入れ、同じ数字の間隔を空けます。", name: "Kazu 数字のパズル", nameLink: "名前について", pageBack: "数字のパズル", pageApi: "APIリファレンス", foot: "部屋と数字の間隔を考えるパズル。" } }, onChange: lang => { language = lang; translate(); if (handle) handle.set({ language }); } });
language = pageLanguage.lang; translate();
let saved; try { saved = JSON.parse(localStorage.getItem("kazu-ripple-v1") ?? "null"); } catch { saved = null; }
if (!params.has("seed") && saved?.seed && Number.isInteger(saved.seed)) { activeSeed = saved.seed; get("seed").value = String(activeSeed); for (const id of ["material", "pieces"]) get(id).value = saved[id] ?? get(id).value; if (!params.has("lang") && ["en", "ja"].includes(saved.language)) pageLanguage.set(saved.language); }
start();
