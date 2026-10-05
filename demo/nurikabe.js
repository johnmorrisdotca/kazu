import { generateNurikabe, encodeNurikabe } from "./dist/nurikabe-entry.js";
import { mountNurikabe } from "./dist/nurikabe-play-entry.js";
let player;
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
