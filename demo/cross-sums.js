import { decodeCrossSums, encodeCrossSums, generateCrossSums } from "./dist/cross-sums-entry.js";
import { mountCrossSums } from "./dist/cross-sums-play-entry.js";

const get = id => document.getElementById(id), params = new URLSearchParams(location.search);
let language = params.get("lang") === "ja" ? "ja" : "en", handle;
const strings = {
  en: { title: "Cross Sums", seed: "Seed", material: "Board material", pieces: "Digits", new: "New puzzle →", share: "Share puzzle", unique: "Each generated puzzle has one proved answer. Progress stays on this device.", ready: "Ready.", copied: "Puzzle link copied.", failed: "Could not make this puzzle. Try another seed.", summary: "crossing runs", ivory: "Ivory", wood: "Wood", slate: "Slate", ink: "Ink", tiles: "Tiles", pitch: "Cross Sums: fill each run with distinct digits that add to its clue. Every generated puzzle has one proved answer.", name: "Kazu (数) is Japanese for number. Cross Sums is a crossword of sums.", nameLink: "About the name", pageBack: "Number puzzles", pageApi: "API reference", foot: "Cross Sums, a crossword of sums." },
  ja: { title: "カックロ", seed: "シード", material: "盤の素材", pieces: "数字", new: "新しい問題 →", share: "問題を共有", unique: "作った問題の答えは一つだけ。進行状況はこの端末に保存します。", ready: "準備完了。", copied: "リンクをコピーしました。", failed: "問題を作れませんでした。別のシードを試してください。", summary: "横と縦の連続マス", ivory: "象牙色", wood: "木", slate: "石板", ink: "インク", tiles: "タイル", pitch: "カックロ。各列の数字を重複させず、ヒントの合計に合わせます。作った問題の答えは一つだけ。", name: "Kazu（数）は数字のこと。カックロは数字のクロスワードです。", nameLink: "名前について", pageBack: "数字のパズル", pageApi: "APIリファレンス", foot: "合計を使うクロスワード、カックロ。" }
};
function translate() {
  document.documentElement.lang = language;
  for (const id of ["size-label", "level-label"]) get(id).textContent = get(id).dataset[language];
  for (const option of get("level").options) option.textContent = option.dataset[language];
  for (const [id, key] of [["field-title", "title"], ["seed-label", "seed"], ["material-label", "material"], ["pieces-label", "pieces"], ["new", "new"], ["share", "share"], ["unique", "unique"]]) get(id).textContent = strings[language][key];
  ["material", "pieces"].forEach(id => [...get(id).options].forEach(option => { option.textContent = strings[language][option.value]; }));
  handle?.set({ language });
}
function appearance() { return { language, material: get("material").value, pieces: get("pieces").value }; }
const settings = () => ({ seed: get("seed").value, size: get("size").value, level: get("level").value });
function save(game) { try { localStorage.setItem("kazu-cross-sums-v1", JSON.stringify({ progress: encodeCrossSums(game), ...settings(), ...appearance() })); } catch { /* Storage is optional. */ } }
function play(puzzle, progress) {
  handle?.destroy();
  handle = mountCrossSums(get("board"), { board: puzzle, progress, ...appearance(), onChange: save, onFinish: save });
  get("summary").textContent = `${puzzle.width} × ${puzzle.height} · ${strings[language].summary}`; save(handle.game());
}
function make() {
  if (!get("setup").reportValidity()) return;
  get("new").disabled = true;
  try { const puzzle = generateCrossSums(Number(get("seed").value), get("level").value, Number(get("size").value)); play(puzzle); get("notice").textContent = ""; }
  catch { get("notice").textContent = strings[language].failed; }
  finally { get("new").disabled = false; }
}
for (const id of ["seed", "size", "level", "material", "pieces"]) if (params.has(id)) get(id).value = params.get(id);
get("setup").onsubmit = event => { event.preventDefault(); make(); };
for (const id of ["material", "pieces"]) get(id).onchange = () => { handle?.set(appearance()); if (handle) save(handle.game()); };
get("share").onclick = async () => { const query = new URLSearchParams(); for (const id of ["seed", "size", "level", "material", "pieces"]) query.set(id, handle ? (["seed", "size", "level"].includes(id) ? get(id).value : appearance()[id]) : get(id).value); query.set("lang", language); const url = `${location.origin}${location.pathname}?${query}`; try { await navigator.clipboard.writeText(url); get("notice").textContent = strings[language].copied; } catch { get("notice").textContent = url; } };
const familyText = lang => ({ pitch: strings[lang].pitch, name: strings[lang].name, nameLink: strings[lang].nameLink, pageBack: strings[lang].pageBack, pageApi: strings[lang].pageApi, foot: strings[lang].foot });
const pageLanguage = familyLanguage({ id: "kazu", words: { en: familyText("en"), ja: familyText("ja") }, onChange: lang => { language = lang; translate(); if (handle) save(handle.game()); } });
language = pageLanguage.lang; translate();
let saved;
try { saved = JSON.parse(localStorage.getItem("kazu-cross-sums-v1") ?? "null"); } catch { /* A corrupt save starts fresh. */ }
const restored = !params.has("seed") && saved && decodeCrossSums(saved.progress);
if (restored) { if (!params.has("lang") && ["en", "ja"].includes(saved.language)) pageLanguage.set(saved.language); for (const id of ["seed", "size", "level", "material", "pieces"]) get(id).value = saved[id] ?? get(id).value; play(restored.board, saved.progress); }
else if (params.has("seed")) make(); else make();
