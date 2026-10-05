import { encodeHitori, generateHitori } from "./dist/hitori-entry.js";
import { mountHitori } from "./dist/hitori-play-entry.js";

let player, language = "en";
const labels = {
  en: { title: "Hitori", rules: "Shade cells so numbers are unique in each row and column. Shaded cells cannot touch, and all unshaded cells stay connected.", size: "Size", level: "Level", seed: "Seed", new: "New puzzle" },
  ja: { title: "ひとりにしてくれ", rules: "各行と列で数字が重ならないようにマスを黒くします。黒マスは辺で隣り合えず、白マスはすべてつながります。", size: "大きさ", level: "むずかしさ", seed: "シード", new: "新しい問題" },
};
const get = id => document.getElementById(id);
const translate = () => {
  const words = labels[language];
  document.documentElement.lang = language;
  for (const id of ["title", "rules", "size-label", "level-label", "seed-label", "new"]) get(id).textContent = words[id.replace(/-label$/, "")];
  for (const option of get("level").options) option.textContent = option.dataset[language];
  player?.set({ language });
};

const mount = () => {
  try {
    const seed = Number(get("seed").value), size = Number(get("size").value), level = get("level").value, key = "kazu-hitori-progress";
    const puzzle = generateHitori(size, seed, level);
    player?.destroy();
    const saved = JSON.parse(localStorage.getItem(key) || "null");
    player = mountHitori(get("board"), {
      board: puzzle,
      progress: saved?.seed === seed && saved?.size === size && (saved?.level ?? "medium") === level ? saved.progress : undefined,
      language,
      material: "ivory",
      pieces: "tiles",
      onChange: game => localStorage.setItem(key, JSON.stringify({ seed, size, level, progress: encodeHitori(game) })),
    });
    get("notice").textContent = `${language === "ja" ? "シード" : "Seed"} ${seed}`;
  } catch (error) {
    get("notice").textContent = error.message;
  }
};

const pageLanguage = familyLanguage({
  id: "kazu",
  words: {
    en: { pitch: "Hitori: shade the duplicates and keep the remaining numbers connected.", name: "Kazu (数) is Japanese for number. Hitori is a number logic puzzle.", nameLink: "About the name", pageBack: "Number puzzles", pageApi: "API reference", foot: "Hitori, a number puzzle of black and white cells." },
    ja: { pitch: "ひとりにしてくれ。重複する数字を黒くし、白マスをつなげます。", name: "Kazu（数）は数字のこと。ひとりにしてくれは数字のパズルです。", nameLink: "名前について", pageBack: "数字のパズル", pageApi: "APIリファレンス", foot: "黒マスと白マスで遊ぶ数字のパズル。" },
  },
  onChange: next => { language = next; translate(); },
});
language = pageLanguage.lang;
translate();
get("new").onclick = mount;
mount();
