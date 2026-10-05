import { encodeYajilin, generateYajilin } from "./dist/yajilin-entry.js";
import { mountYajilin } from "./dist/yajilin-play-entry.js";

const get = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
let language = params.get("lang") === "ja" ? "ja" : "en", player;
const words = {
  en: { intro: "Shade the cells each arrow counts, then draw one loop through every other unshaded cell.", seed: "Seed", material: "Board", pieces: "Clues", new: "New puzzle", origin: "Yajilin is a loop puzzle. These original boards are generated here; no Nikoli puzzle grids are used.", pitch: "Yajilin: match each arrow's shaded-cell count and draw one loop through every other open cell.", pageBack: "Number puzzles", pageApi: "API reference", foot: "Arrows, shaded cells and a single loop." },
  ja: { intro: "矢印が示す数だけマスを黒くし、残りの空きマスすべてを一つの輪にします。", seed: "シード", material: "盤の素材", pieces: "手がかり", new: "新しい問題", origin: "やじりんは輪を描くパズルです。盤はここで作り、ニコリの問題図は使いません。", pitch: "やじりん。矢印の数だけ黒くし、残りの空きマスを一つの輪にします。", pageBack: "数字のパズル", pageApi: "APIリファレンス", foot: "矢印と黒マスで輪を描くパズル。" },
};
const labels = ["intro", "seed-label", "material-label", "pieces-label", "new", "origin"];
function translate() {
  document.documentElement.lang = language;
  labels.forEach((id, index) => { get(id).textContent = words[language][["intro", "seed", "material", "pieces", "new", "origin"][index]]; });
}
const pageLanguage = familyLanguage({ id: "kazu", words: {
  en: { pitch: words.en.pitch, name: "Kazu (数) is Japanese for number. Yajilin is a loop puzzle.", nameLink: "About the name", pageBack: words.en.pageBack, pageApi: words.en.pageApi, foot: words.en.foot },
  ja: { pitch: words.ja.pitch, name: "Kazu（数）は数字のこと。やじりんは輪のパズルです。", nameLink: "名前について", pageBack: words.ja.pageBack, pageApi: words.ja.pageApi, foot: words.ja.foot },
}, onChange: next => { language = next; translate(); if (player) start(false); } });
language = pageLanguage.lang;
function appearance() { return { material: get("material").value, pieces: get("pieces").value, language }; }
function start(reset = true) {
  const seed = Number(get("seed").value), key = "kazu-yajilin-progress";
  try {
    const puzzle = generateYajilin(5, seed);
    let progress;
    if (!reset) progress = player?.progress();
    else {
      try {
        const saved = JSON.parse(localStorage.getItem(key) || "null");
        if (saved?.seed === seed) progress = saved.progress;
      } catch { /* An unreadable save starts a fresh board. */ }
    }
    player?.destroy();
    player = mountYajilin(get("board"), { board: puzzle, progress, ...appearance(), onChange: game => localStorage.setItem(key, JSON.stringify({ seed, progress: encodeYajilin(game) })) });
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
