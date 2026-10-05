import { generateJuosan, newJuosan, encodeJuosan, decodeJuosan } from "./dist/juosan-entry.js";
import { mountJuosan } from "./dist/juosan-play-entry.js";
const get = id => document.getElementById(id), params = new URLSearchParams(location.search);
let language = params.get("lang") === "ja" ? "ja" : "en", handle, active = null;
const words = {
  en: { intro: "Juosan fills each territory with horizontal and vertical marks. Its small training boards have one answer proved from the printed clues and line rules.", board: "Board", material: "Board material", pieces: "Marks", seed: "Seed", make: "New puzzle →", origin: "Juosan is a Nikoli puzzle. These original training boards were made for this demo.", limits: "The built-in generator currently offers 3 × 2 and 2 × 3 training boards. The player accepts any valid supplied board up to 16 × 16.", error: "That seed could not make a puzzle.", summary: "cells", back: "Number puzzles", api: "API reference", foot: "Horizontal and vertical marks in territories." },
  ja: { intro: "陣地の各マスに横線か縦線を入れる、じゅうさんの練習問題です。印刷された数字と線のルールから、答えが一つだけと確かめています。", board: "盤", material: "盤の素材", pieces: "線", seed: "シード", make: "新しい問題 →", origin: "じゅうさんはニコリのパズルです。このページの練習問題は独自に作っています。", limits: "問題作成機能では3×2と2×3の練習盤を選べます。プレイヤーは最大16×16の有効な盤を読み込めます。", error: "問題を作れませんでした。", summary: "マス", back: "数字のパズル", api: "APIリファレンス", foot: "陣地の中に横線と縦線を入れるパズル。" }
};
function translate() {
  const w = words[language]; document.documentElement.lang = language;
  for (const [id, key] of [["intro","intro"],["field-title","board"],["size-label","board"],["material-label","material"],["pieces-label","pieces"],["seed-label","seed"],["new","make"],["origin","origin"],["limits","limits"]]) get(id).textContent = w[key];
  handle?.set({ language });
}
function appearance() { return { material: get("material").value, pieces: get("pieces").value, language }; }
function remember(game) { try { localStorage.setItem("kazu-juosan-v1", JSON.stringify({ progress: encodeJuosan(game), width: active?.width, height: active?.height, seed: active?.seed, ...appearance() })); } catch { /* Storage is optional. */ } }
function play(puzzle, progress) {
  active = puzzle; handle?.destroy(); handle = mountJuosan(get("board"), { board: puzzle, progress, ...appearance(), onChange: remember });
  get("summary").textContent = `${puzzle.width} × ${puzzle.height} · ${puzzle.width * puzzle.height} ${words[language].summary}`; remember(handle.game());
}
function make() { if (!get("setup").reportValidity()) return; const [width,height] = get("size").value.split("x").map(Number), seed = Number(get("seed").value); try { const puzzle = generateJuosan(width,height,"easy",seed); play(puzzle,encodeJuosan(newJuosan(puzzle))); get("notice").textContent = ""; } catch { get("notice").textContent = words[language].error; } }
for (const [param,id] of [["size","size"],["seed","seed"],["material","material"],["pieces","pieces"]]) if (params.has(param)) get(id).value = params.get(param);
get("setup").onsubmit = e => { e.preventDefault(); make(); };
for (const id of ["material","pieces"]) get(id).onchange = () => { handle?.set(appearance()); if (handle) remember(handle.game()); };
const pageLanguage = familyLanguage({ id: "kazu", words: {
  en: { pitch: words.en.intro, name: "Kazu 数 · Juosan", nameLink: "About the name", pageBack: words.en.back, pageApi: words.en.api, foot: words.en.foot },
  ja: { pitch: words.ja.intro, name: "Kazu 数 · じゅうさん", nameLink: "名前について", pageBack: words.ja.back, pageApi: words.ja.api, foot: words.ja.foot }
}, onChange: lang => { language = lang; translate(); if (handle) remember(handle.game()); } });
language = pageLanguage.lang; translate();
let saved; try { saved = JSON.parse(localStorage.getItem("kazu-juosan-v1") ?? "null"); } catch { /* A corrupt save starts fresh. */ }
const restored = !params.has("seed") && saved && decodeJuosan(saved.progress);
if (restored && ["3x2","2x3"].includes(`${saved.width}x${saved.height}`)) { for (const id of ["material","pieces"]) get(id).value = saved[id] ?? get(id).value; get("size").value = `${saved.width}x${saved.height}`; get("seed").value = saved.seed ?? "42"; play(restored.board && { ...restored.board, seed: saved.seed ?? 42, level: "easy", solution: [] }, saved.progress); } else make();
