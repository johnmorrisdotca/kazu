import { decodeHeyawake, encodeHeyawake, generateHeyawake } from "./dist/heyawake-entry.js";
import { mountHeyawake } from "./dist/heyawake-play-entry.js";

const get = id => document.getElementById(id), params = new URLSearchParams(location.search);
let handle, language = params.get("lang") === "ja" ? "ja" : "en", activeSettings = null, started = Date.now(), stopped = null;
const words = {
  en: { title: "Heyawake", field: "Your puzzle", width: "Width", height: "Height", level: "Clue mix", material: "Board material", pieces: "Marks", seed: "Seed", newPuzzle: "New puzzle →", share: "Share puzzle", unique: "Generated puzzles are returned only after a unique answer is proved.", progress: "Making a puzzle…", copied: "Puzzle link copied.", failed: "Could not prove this puzzle unique. Try another seed or a smaller board.", levels: ["More clues", "Mixed", "Fewer clues"], materials: ["Ivory", "Wood", "Slate"], piecesList: ["Ink", "Tiles"] },
  ja: { title: "へやわけ", field: "あなたの問題", width: "幅", height: "高さ", level: "ヒントの数", material: "盤の素材", pieces: "印", seed: "シード", newPuzzle: "新しい問題 →", share: "問題を共有", unique: "答えが一つだと確かめた問題だけを表示します。", progress: "問題を作っています…", copied: "リンクをコピーしました。", failed: "答えが一つだと確かめられませんでした。別のシードか小さい盤を試してください。", levels: ["多め", "混合", "少なめ"], materials: ["象牙色", "木", "石板"], piecesList: ["インク", "タイル"] }
};

function translate() {
  const w = words[language]; document.documentElement.lang = language;
  for (const [id, text] of Object.entries({ title: w.title, "field-title": w.field, "width-label": w.width, "height-label": w.height, "level-label": w.level, "material-label": w.material, "pieces-label": w.pieces, "seed-label": w.seed, new: w.newPuzzle, share: w.share, unique: w.unique })) get(id).textContent = text;
  ["level", "material", "pieces"].forEach((id, group) => [...get(id).options].forEach((option, index) => option.textContent = (group === 0 ? w.levels : group === 1 ? w.materials : w.piecesList)[index]));
  handle?.set({ language });
}

function appearance() { return { language, material: get("material").value, pieces: get("pieces").value }; }
function remember(game) {
  try { localStorage.setItem("kazu-heyawake-v1", JSON.stringify({ progress: encodeHeyawake(game), ...activeSettings, language, ...appearance() })); } catch { /* Local storage is optional. */ }
}
function play(board, progress) {
  activeSettings = { width: String(board.width), height: String(board.height), level: get("level").value, seed: get("seed").value };
  handle?.destroy(); started = Date.now(); stopped = null;
  handle = mountHeyawake(get("board"), { board, progress, ...appearance(), onChange: remember, onFinish: game => { stopped = Date.now(); remember(game); } });
  get("summary").textContent = `${board.width} × ${board.height} · ${board.rooms.length}`;
  remember(handle.game());
}
function make() {
  if (!get("setup").reportValidity()) return;
  get("new").disabled = true; get("notice").textContent = words[language].progress;
  const settings = { width: Number(get("width").value), height: Number(get("height").value), level: get("level").value, seed: Number(get("seed").value) };
  try {
    const puzzle = generateHeyawake(settings.width, settings.height, settings.level, settings.seed);
    for (const id of Object.keys(settings)) get(id).value = String(settings[id]);
    get("notice").textContent = ""; play(puzzle, null);
  } catch {
    get("notice").textContent = words[language].failed;
  } finally { get("new").disabled = false; }
}

for (const id of ["width", "height", "level", "seed", "material", "pieces"]) if (params.has(id)) get(id).value = params.get(id);
get("setup").onsubmit = event => { event.preventDefault(); make(); };
for (const id of ["material", "pieces"]) get(id).onchange = () => { handle?.set(appearance()); if (handle) remember(handle.game()); };
get("share").onclick = async () => {
  const query = new URLSearchParams();
  for (const id of ["width", "height", "level", "seed", "material", "pieces"]) query.set(id, activeSettings?.[id] ?? get(id).value);
  query.set("lang", language); const url = `${location.origin}${location.pathname}?${query}`;
  try { await navigator.clipboard.writeText(url); get("notice").textContent = words[language].copied; } catch { get("notice").textContent = url; }
};
setInterval(() => {
  const seconds = Math.floor(((stopped ?? Date.now()) - started) / 1000);
  get("clock").textContent = `${language === "ja" ? "時間" : "Time"} ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}, 1000);
const pageLanguage = familyLanguage({ id: "kazu", words: {
  en: { pitch: "Heyawake: mark black cells in numbered rooms. Blacks cannot touch; whites stay connected and straight white runs span at most two rooms.", name: "Kazu (数) is Japanese for number. Heyawake is a room-and-cell logic puzzle.", nameLink: "About the name", pageBack: "Number puzzles", pageApi: "API reference", foot: "Heyawake, a puzzle of rooms and connected white cells." },
  ja: { pitch: "へやわけ。部屋の黒マス数を手がかりに、黒マスを塗ります。黒マスは辺でつながらず、白マスは一続きで、白い直線は二部屋までです。", name: "Kazu（数）は数字のこと。へやわけは部屋とマスを使う推理パズルです。", nameLink: "名前について", pageBack: "数字のパズル", pageApi: "APIリファレンス", foot: "へやわけ。部屋と白マスのつながりを考えるパズル。" }
}, onChange: lang => { language = lang; translate(); if (handle) remember(handle.game()); } });
language = pageLanguage.lang; translate();
let saved;
try { saved = JSON.parse(localStorage.getItem("kazu-heyawake-v1") ?? "null"); } catch { /* A corrupt save starts a new puzzle. */ }
const restored = !params.has("seed") && saved?.progress ? decodeHeyawake(saved.progress) : null;
if (restored) {
  for (const id of ["width", "height", "level", "seed", "material", "pieces"]) get(id).value = saved[id] ?? get(id).value;
  if (!params.has("lang") && ["en", "ja"].includes(saved.language)) pageLanguage.set(saved.language);
  play(restored.board, saved.progress);
} else {
  for (const id of ["width", "height", "level", "seed", "material", "pieces"]) if (!params.has(id)) get(id).value = id === "width" ? "5" : id === "height" ? "4" : id === "seed" ? "17" : get(id).value;
  make();
}
