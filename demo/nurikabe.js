import { generateNurikabe, encodeNurikabe } from "./dist/nurikabe-entry.js";
import { mountNurikabe } from "./dist/nurikabe-play-entry.js";
let player;
familyLanguage({
  id: "kazu",
  words: {
    en: { pitch: "Shade the sea around numbered islands. Each island has the numbered area; sea cells connect and never form a 2×2 square.", name: "Kazu (数) is Japanese for number.", nameLink: "About the name", pageBack: "Number puzzles", pageDocs: "Docs", pageApi: "API", foot: "Nurikabe: islands and a connected sea." },
    ja: { pitch: "数字の面積を持つ島の周りを海として塗ります。海はつながり、2×2の塗りつぶしを作りません。", name: "Kazu（数）は数字を表す言葉です。", nameLink: "名前について", pageBack: "数字のパズル", pageDocs: "ドキュメント", pageApi: "APIリファレンス", foot: "ぬりかべ。島とつながる海のパズルです。" },
  },
  onChange: language => player?.set({ language }),
});
const mount = () => {
  try {
    const seed = Number(document.querySelector("#seed").value), key = "kazu-nurikabe-progress", puzzle = generateNurikabe(seed);
    player?.destroy();
    const saved = JSON.parse(localStorage.getItem(key) || "null");
    player = mountNurikabe(document.querySelector("#board"), { board: puzzle, progress: saved?.seed === seed ? saved.progress : undefined,
      language: document.documentElement.lang === "ja" ? "ja" : "en", material: "ivory", pieces: "tiles",
      onChange: game => localStorage.setItem(key, JSON.stringify({ seed, progress: encodeNurikabe(game) })) });
    document.querySelector("#notice").textContent = `Seed ${seed}`;
  } catch (error) { document.querySelector("#notice").textContent = error.message; }
};
document.querySelector("#new").onclick = mount; mount();

import { attachDocsLink } from "./docs-link.js";
attachDocsLink();
