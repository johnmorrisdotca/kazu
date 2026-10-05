import { newShikaku, encodeShikaku, decodeShikaku, shikakuFinished, SHIKAKU_CHALLENGE_PACKS, generateShikakuChallenge } from "./dist/shikaku-entry.js";
import { mountShikaku } from "./dist/shikaku-play-entry.js";
const get = id => document.getElementById(id), params = new URLSearchParams(location.search);
let activeSettings, activeChallenge = null, handle, worker, started = Date.now(), stopped = null, language = params.get("lang") === "ja" ? "ja" : "en";
const words = {
  en: ["A place for every number.", "Divide the grid into rectangles. One number in each, telling you how many cells belong inside.", "Your board", "Size", "Rectangle mix", "Board material", "Numbers", "Seed", "New puzzle →", "Share puzzle", "Every generated puzzle has one proved answer. All play stays on your device.", "Shikaku is a Nikoli puzzle. These puzzles are generated here; none are copied from Nikoli.", "Making a unique puzzle…", "Puzzle link copied.", "Unable to make this puzzle. Try another seed.", "Small", "Mixed", "Large", "Ivory", "Wood", "Slate", "Ink", "Tiles"],
  ja: ["数字の居場所を見つけよう。", "盤を長方形に分けます。一つの長方形に一つの数字。その数字が面積を教えてくれます。", "あなたの盤", "大きさ", "長方形の組み合わせ", "盤の素材", "数字", "シード", "新しい問題 →", "問題を共有", "作った問題の答えは一つだけ。遊びの記録はこの端末に保存します。", "四角に切れはニコリのパズルです。ここでは問題を自動で作り、ニコリの問題は使っていません。", "答えが一つの問題を作っています…", "リンクをコピーしました。", "問題を作れませんでした。別のシードを試してください。", "小さい", "混合", "大きい", "象牙色", "木", "石板", "インク", "タイル"]
};
const ids = ["title", "intro", "field-title", "size-label", "level-label", "material-label", "pieces-label", "seed-label", "new", "share", "unique", "origin"];
function translate() {
  document.documentElement.lang = language;
  get("width-label").textContent = language === "ja" ? "幅" : "Width"; get("height-label").textContent = language === "ja" ? "高さ" : "Height";
  ids.forEach((id, i) => { const element = get(id); if (element) element.textContent = words[language][i]; });
  ["level", "material", "pieces"].forEach((id, group) => [...get(id).options].forEach((o, i) => o.textContent = words[language][15 + [0, 3, 6][group] + i]));
  get("pack-label").textContent = language === "ja" ? "チャレンジパック" : "Challenge pack";
  get("challenge-label").textContent = language === "ja" ? "問題" : "Challenge";
  get("play-challenge").textContent = language === "ja" ? "チャレンジを始める" : "Play challenge";
  fillChallenges();
  handle?.set({ language });
}
function fillChallenges() {
  const pack = get("pack").value, challenge = get("challenge"), entries = pack ? SHIKAKU_CHALLENGE_PACKS[pack].challenges : [];
  challenge.replaceChildren(...entries.map((entry, i) => { const option = document.createElement("option"); option.value = String(i + 1); option.textContent = `${entry.name} · ${entry.level}`; return option; }));
  challenge.disabled = !pack; get("play-challenge").disabled = !pack;
}
function playChallenge() {
  const pack = get("pack").value, index = Number(get("challenge").value);
  if (!pack) return;
  worker?.terminate(); worker = null; get("new").disabled = false;
  const challenge = generateShikakuChallenge(pack, index), puzzle = challenge.puzzle;
  activeChallenge = { pack: challenge.pack, challenge: String(index) };
  for (const id of ["width", "height", "level", "seed"]) get(id).value = String(challenge[id]);
  get("size").value = puzzle.width === puzzle.height ? String(puzzle.width) : puzzle.width > puzzle.height ? "wide" : "tall";
  get("notice").textContent = `${challenge.packTitle} · ${challenge.name}`;
  play(puzzle, encodeShikaku(newShikaku(puzzle)));
}
function appearance() { return { material: get("material").value, pieces: get("pieces").value, language }; }
function remember(game) {
  try { localStorage.setItem("kazu-shikaku-v1", JSON.stringify({ progress: encodeShikaku(game), ...activeSettings, ...appearance() })); } catch { /* Storage is optional. */ }
}
function play(board, progress) {
  get("size").value = board.width === board.height && [5, 7, 9, 12].includes(board.width) ? String(board.width) : board.width === 10 && board.height === 6 ? "wide" : board.width === 6 && board.height === 10 ? "tall" : "custom";
  activeSettings = { size: get("size").value, width: String(board.width), height: String(board.height), seed: get("seed").value, level: get("level").value, ...(activeChallenge ?? {}) };
  handle?.destroy(); started = Date.now(); stopped = null;
  handle = mountShikaku(get("board"), { board, progress, ...appearance(), onChange: remember, onFinish: game => { stopped = Date.now(); remember(game); } });
  if (shikakuFinished(handle.game())) stopped = started;
  get("summary").textContent = `${board.width} × ${board.height} · ${board.clues.filter(Boolean).length}`;
  remember(handle.game());
}
function make() {
  if (!get("setup").reportValidity()) return;
  activeChallenge = null;
  worker?.terminate(); get("new").disabled = true; get("notice").textContent = words[language][12];
  worker = new Worker(new URL("./dist/shikakuWorker.js", import.meta.url), { type: "module" });
  const done = () => { worker?.terminate(); worker = null; get("new").disabled = false; };
  const settings = { width: Number(get("width").value), height: Number(get("height").value), level: get("level").value, seed: Number(get("seed").value) };
  worker.onmessage = e => { done(); if (e.data.error) { get("notice").textContent = words[language][14]; return; } get("notice").textContent = ""; for (const id of ["width", "height", "level", "seed"]) get(id).value = String(settings[id]); play(e.data.puzzle, encodeShikaku(newShikaku(e.data.puzzle))); };
  worker.onerror = () => { done(); get("notice").textContent = words[language][14]; };
  worker.postMessage(settings);
}
for (const id of ["size", "width", "height", "level", "seed", "material", "pieces"]) if (params.has(id)) get(id).value = params.get(id);
function dimensionsOfPreset() {
  const preset = get("size").value;
  if (preset === "custom") return;
  const [width, height] = preset === "wide" ? [10, 6] : preset === "tall" ? [6, 10] : [Number(preset), Number(preset)];
  get("width").value = width; get("height").value = height;
}
if (!params.has("width") && !params.has("height")) dimensionsOfPreset();
get("size").onchange = dimensionsOfPreset;
for (const id of ["width", "height"]) get(id).onchange = () => { get("size").value = "custom"; };
get("setup").onsubmit = e => { e.preventDefault(); make(); };
get("pack").onchange = fillChallenges;
get("play-challenge").onclick = playChallenge;

for (const id of ["material", "pieces"]) get(id).onchange = () => { handle?.set(appearance()); if (handle) remember(handle.game()); };
get("share").onclick = async () => {
  const query = new URLSearchParams(); for (const id of ["size", "width", "height", "level", "seed", "material", "pieces"]) query.set(id, activeSettings?.[id] ?? get(id).value); if (activeChallenge) for (const [id, value] of Object.entries(activeChallenge)) query.set(id, value); query.set("lang", language);
  const url = `${location.origin}${location.pathname}?${query}`;
  try { await navigator.clipboard.writeText(url); get("notice").textContent = words[language][13]; } catch { get("notice").textContent = url; }
};
setInterval(() => { const seconds = Math.floor(((stopped ?? Date.now()) - started) / 1000); get("clock").textContent = `${language === "ja" ? "時間" : "Time"} ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`; }, 1000);
const pageLanguage = familyLanguage({ id: "kazu", words: {
  en: { pitch: "Shikaku: divide the grid into rectangles, each holding one number equal to its area. Every generated puzzle has one proved answer.", name: "Kazu (数) is Japanese for “number”. Shikaku is its rectangle puzzle.", nameLink: "About the name", pageBack: "Number puzzles", pageApi: "API reference", foot: "Shikaku, a number puzzle played with rectangles." },
  ja: { pitch: "四角に切れ。盤を長方形に分け、各長方形に、その面積と同じ数字を一つ入れます。作った問題の答えは一つだけ。", name: "Kazu（数）は数字のこと。四角に切れは長方形を作るパズルです。", nameLink: "名前について", pageBack: "数字のパズル", pageApi: "APIリファレンス", foot: "数字を手がかりに長方形を描くパズル。" }
}, onChange: lang => { language = lang; translate(); if (handle) remember(handle.game()); } });
language = pageLanguage.lang; translate();
let saved;
try { saved = JSON.parse(localStorage.getItem("kazu-shikaku-v1") ?? "null"); } catch { /* A corrupt save starts fresh. */ }
const restored = !params.has("seed") && saved && decodeShikaku(saved.progress);
if (params.has("pack") && ["square", "wide", "tall"].includes(params.get("pack"))) {
  get("pack").value = params.get("pack"); fillChallenges(); get("challenge").value = params.get("challenge") ?? "1"; playChallenge();
} else if (restored) { if (!params.has("lang") && ["en", "ja"].includes(saved.language)) { pageLanguage.set(saved.language); } for (const id of ["size", "width", "height", "level", "seed", "material", "pieces"]) get(id).value = saved[id] ?? (id === "width" ? restored.board.width : id === "height" ? restored.board.height : "custom"); play(restored.board, saved.progress); } else make();
