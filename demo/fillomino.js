import { decodeFillomino, encodeFillomino, fillominoFinished, newFillomino } from "../dist/fillomino-entry.js";
import { mountFillomino } from "../dist/fillomino-play-entry.js";

const byId = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const names = ["Your puzzle", "Width", "Height", "Clue mix", "Board material", "Numbers", "Seed", "New puzzle →", "Share puzzle", "Every generated puzzle is counted to prove it has one solution.", "Making a puzzle with one proved solution…", "Puzzle link copied.", "This seed did not produce a puzzle in the search budget. Try another seed or a smaller board.", "More clues", "Mixed", "Fewer clues", "Ivory", "Wood", "Slate", "Ink", "Tiles"];
const japanese = ["問題", "幅", "高さ", "ヒントの数", "盤の素材", "数字", "シード", "新しい問題 →", "問題を共有", "作った問題は答えを数えて一つだけと確かめます。", "答えが一つの問題を作っています…", "問題のリンクをコピーしました。", "このシードでは制限内に問題を作れませんでした。別のシードか小さな盤を試してください。", "多め", "標準", "少なめ", "象牙色", "木", "石板", "インク", "タイル"];
const textIds = ["field-title", "width-label", "height-label", "level-label", "material-label", "pieces-label", "seed-label", "new", "share", "unique"];
let language = params.get("lang") === "ja" ? "ja" : "en";
let player;
let activeSettings;
let worker;
let started = Date.now();
let stoppedAt;

const family = familyLanguage({
  id: "kazu",
  words: {
    en: { pitch: "Fillomino: each connected region has as many cells as its number. Every generated puzzle has one proved answer.", name: "Kazu (数) is Japanese for number.", nameLink: "About the name", pageBack: "Number puzzles", pageApi: "API reference", foot: "Fill every region with its exact area." },
    ja: { pitch: "フィロミノ。同じ数字がつながった領域のマス数を、その数字に合わせます。作った問題は答えが一つだけ。", name: "Kazu（数）は数字のことです。", nameLink: "名前について", pageBack: "数字のパズル", pageApi: "APIリファレンス", foot: "数字と同じ面積の領域を作ります。" },
  },
  onChange: value => { language = value; translate(); player?.set({ language }); if (player) remember(player.game()); },
});
language = family.lang;

function translate() {
  document.documentElement.lang = language;
  const words = language === "ja" ? japanese : names;
  textIds.forEach((id, index) => { const node = byId(id); if (node) node.textContent = words[index]; });
  ["level", "material", "pieces"].forEach((id, group) => {
    const offset = [13, 16, 19][group];
    [...byId(id).options].forEach((option, index) => { option.textContent = words[offset + index]; });
  });
  byId("title").textContent = language === "ja" ? "フィロミノ" : "Fillomino";
  player?.set({ language });
}

function appearance() {
  return { language, material: byId("material").value, pieces: byId("pieces").value };
}

function remember(game) {
  try {
    localStorage.setItem("kazu-fillomino-v1", JSON.stringify({ progress: encodeFillomino(game), ...activeSettings, ...appearance() }));
  } catch { /* Local storage is optional. */ }
}

function start(board, progress) {
  activeSettings = {
    width: String(board.width), height: String(board.height), level: byId("level").value, seed: byId("seed").value,
  };
  player?.destroy();
  started = Date.now();
  stoppedAt = undefined;
  player = mountFillomino(byId("board"), {
    board,
    progress,
    ...appearance(),
    onChange: remember,
    onFinish: game => { stoppedAt = Date.now(); remember(game); },
  });
  const game = player.game();
  if (fillominoFinished(game)) stoppedAt = started;
  byId("summary").textContent = `${board.width} × ${board.height} · ${board.givens.filter(Boolean).length}`;
  remember(game);
}

function generate() {
  if (!byId("setup").reportValidity()) return;
  worker?.terminate();
  byId("new").disabled = true;
  byId("notice").textContent = (language === "ja" ? japanese : names)[10];
  worker = new Worker(new URL("../dist/fillominoWorker.js", import.meta.url), { type: "module" });
  const finish = () => { worker?.terminate(); worker = undefined; byId("new").disabled = false; };
  const settings = {
    width: Number(byId("width").value), height: Number(byId("height").value),
    level: byId("level").value, seed: Number(byId("seed").value),
  };
  worker.onmessage = event => {
    finish();
    if (event.data.error) { byId("notice").textContent = (language === "ja" ? japanese : names)[12]; return; }
    byId("notice").textContent = "";
    for (const id of ["width", "height", "level", "seed"]) byId(id).value = String(settings[id]);
    start(event.data.puzzle, encodeFillomino(newFillomino(event.data.puzzle)));
  };
  worker.onerror = () => { finish(); byId("notice").textContent = (language === "ja" ? japanese : names)[12]; };
  worker.postMessage(settings);
}

for (const key of ["width", "height", "level", "material", "pieces", "seed"]) {
  if (params.has(key)) byId(key).value = params.get(key);
}
byId("setup").addEventListener("submit", event => { event.preventDefault(); generate(); });
for (const key of ["material", "pieces"]) byId(key).addEventListener("change", () => { player?.set(appearance()); if (player) remember(player.game()); });
byId("share").addEventListener("click", async () => {
  const query = new URLSearchParams({ ...activeSettings, ...appearance() });
  try { await navigator.clipboard.writeText(`${location.origin}${location.pathname}?${query}`); byId("notice").textContent = (language === "ja" ? japanese : names)[11]; }
  catch { byId("notice").textContent = `${location.origin}${location.pathname}?${query}`; }
});
setInterval(() => {
  const seconds = Math.floor(((stoppedAt ?? Date.now()) - started) / 1000);
  byId("clock").textContent = `${language === "ja" ? "時間" : "Time"} ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}, 1000);

translate();
let saved;
try { saved = JSON.parse(localStorage.getItem("kazu-fillomino-v1") ?? "null"); } catch { /* A corrupt save starts with a new puzzle. */ }
const restored = !params.has("seed") && saved?.progress ? decodeFillomino(saved.progress) : null;
if (restored) {
  for (const key of ["width", "height", "level", "seed", "material", "pieces"]) byId(key).value = saved[key] ?? byId(key).value;
  if (!params.has("lang") && ["en", "ja"].includes(saved.language)) family.set(saved.language);
  start(restored.board, saved.progress);
} else {
  if (!params.has("width")) byId("width").value = "5";
  if (!params.has("height")) byId("height").value = "5";
  if (!params.has("seed")) byId("seed").value = "17";
  generate();
}
