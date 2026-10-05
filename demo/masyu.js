import { encodeMasyu, generateMasyu } from "./dist/masyu-entry.js";
import { mountMasyu } from "./dist/masyu-play-entry.js";

const get = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
let language = params.get("lang") === "ja" ? "ja" : "en", player;
const words = {
  en: { intro: "Draw a single loop through every pearl. Use the white and black pearls to work out where the line bends and goes straight.", seed: "Seed", material: "Board", pieces: "Pearls", new: "New puzzle", origin: "Masyu is a loop puzzle. These original boards are generated here; no Nikoli puzzle grids are used.", pitch: "Masyu: one loop passes through every pearl, obeying its straight and turn rules.", pageBack: "Number puzzles", pageApi: "API reference", foot: "A loop puzzle with white and black pearls." },
  ja: { intro: "すべての真珠を通る一つの輪を描きます。白と黒の真珠を手がかりに、直進と曲がり方を考えます。", seed: "シード", material: "盤の素材", pieces: "真珠", new: "新しい問題", origin: "ましゅは輪を描くパズルです。盤はここで作り、ニコリの問題図は使いません。", pitch: "ましゅ。白と黒の真珠のルールに従い、一つの輪ですべてを通ります。", pageBack: "数字のパズル", pageApi: "APIリファレンス", foot: "白真珠と黒真珠を通る輪のパズル。" },
};
const labels = ["intro", "seed-label", "material-label", "pieces-label", "new", "origin"];
function translate() {
  document.documentElement.lang = language;
  labels.forEach((id, index) => { get(id).textContent = words[language][["intro", "seed", "material", "pieces", "new", "origin"][index]]; });
}
const pageLanguage = familyLanguage({ id: "kazu", words: {
  en: { pitch: words.en.pitch, name: "Kazu (数) is Japanese for number. Masyu is a loop puzzle.", nameLink: "About the name", pageBack: words.en.pageBack, pageApi: words.en.pageApi, foot: words.en.foot },
  ja: { pitch: words.ja.pitch, name: "Kazu（数）は数字のこと。ましゅは輪のパズルです。", nameLink: "名前について", pageBack: words.ja.pageBack, pageApi: words.ja.pageApi, foot: words.ja.foot },
}, onChange: next => { language = next; translate(); if (player) start(false); } });
language = pageLanguage.lang;
function appearance() { return { material: get("material").value, pieces: get("pieces").value, language }; }
function start(reset = true) {
  const seed = Number(get("seed").value), key = "kazu-masyu-progress";
  try {
    const puzzle = generateMasyu(5, seed);
    let progress;
    if (!reset) progress = player?.progress();
    else {
      try {
        const saved = JSON.parse(localStorage.getItem(key) || "null");
        if (saved?.seed === seed) progress = saved.progress;
      } catch { /* An unreadable save starts a fresh board. */ }
    }
    player?.destroy();
    player = mountMasyu(get("board"), { board: puzzle, progress, ...appearance(), onChange: game => localStorage.setItem(key, JSON.stringify({ seed, progress: encodeMasyu(game) })) });
    get("notice").textContent = "";
    get("seed-note").textContent = `${words[language].seed} ${seed}`;
  } catch (error) { get("notice").textContent = error.message; }
}
translate();
if (params.has("seed")) get("seed").value = params.get("seed");
if (params.has("material")) get("material").value = params.get("material");
if (params.has("pieces")) get("pieces").value = params.get("pieces");
get("setup").onsubmit = event => { event.preventDefault(); start(); };
for (const id of ["material", "pieces"]) get(id).onchange = () => start(false);
start();
