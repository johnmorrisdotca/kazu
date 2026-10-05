import { decodeAkari, encodeAkari, generateAkari } from "./dist/akari-entry.js";
import { mountAkari } from "./dist/akari-play-entry.js";

const get = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
let active;
let handle;
let started = Date.now();
let stopped = null;
let language = params.get("lang") === "ja" ? "ja" : "en";

const words = {
  en: [
    "Light every white square without letting bulbs see one another.",
    "Your board", "Size", "Width", "Height", "Board material", "Bulbs", "Seed",
    "New puzzle →", "Share puzzle",
    "Every generated puzzle has one proved answer. Progress stays on your device.",
    "Akari is a Nikoli puzzle. These boards are generated here; no Nikoli puzzles are copied.",
    "Ivory", "Wood", "Slate", "Ink", "Tiles", "Puzzle link copied.",
    "The puzzle could not be generated. Try another seed.", "Rules",
    "Place bulbs in white squares. A bulb lights along its row and column until a black square or the edge. Light every white square; bulbs cannot see one another. Each numbered black square touches exactly that many bulbs.",
  ],
  ja: [
    "電球同士が見えないように、白マスすべてを照らします。",
    "あなたの盤", "大きさ", "幅", "高さ", "盤の素材", "電球", "シード",
    "新しい問題 →", "問題を共有",
    "作った問題の答えは一つだけ。進行状況はこの端末に保存します。",
    "美術館はニコリのパズルです。ここでは問題を自動で作り、ニコリの問題は使っていません。",
    "象牙色", "木", "石板", "インク", "タイル", "リンクをコピーしました。",
    "問題を作れませんでした。別のシードを試してください。", "ルール",
    "白マスに電球を置きます。電球は黒マスか盤の端まで縦横に光ります。白マスすべてを照らし、電球同士が見えないようにします。数字のある黒マスには、その数だけ電球を隣接させます。",
  ],
};

function translate() {
  document.documentElement.lang = language;
  const ids = [
    "intro", "field-title", "size-label", "width-label", "height-label", "material-label",
    "pieces-label", "seed-label", "new", "share", "unique", "origin", "rules-title", "rules",
  ];
  ids.forEach((id, index) => {
    const element = get(id);
    if (element) element.textContent = words[language][index];
  });
  ["material", "pieces"].forEach((id, group) => {
    [...get(id).options].forEach((option, index) => {
      option.textContent = words[language][12 + group * 3 + index];
    });
  });
  get("title").textContent = language === "ja" ? "美術館 · Akari" : "Akari · 美術館";
  get("level-label").textContent = get("level-label").dataset[language];
  for (const option of get("level").options) option.textContent = option.dataset[language];
  handle?.set({ language });
}

function appearance() {
  return {
    material: get("material").value,
    pieces: get("pieces").value,
    language,
  };
}

function remember(game) {
  try {
    localStorage.setItem("kazu-akari-v1", JSON.stringify({
      progress: encodeAkari(game),
      ...active,
      ...appearance(),
    }));
  } catch {
    // Storage is optional.
  }
}

function play(board, progress) {
  const preset = board.width === board.height && [5, 7, 10, 14].includes(board.width)
    ? String(board.width)
    : board.width === 10 && board.height === 6
      ? "wide"
      : board.width === 6 && board.height === 10
        ? "tall"
        : "custom";
  get("size").value = preset;
  active = {
    size: preset,
    width: String(board.width),
    height: String(board.height),
    seed: get("seed").value,
    level: get("level").value,
  };

  handle?.destroy();
  started = Date.now();
  stopped = null;
  handle = mountAkari(get("board"), {
    board,
    progress,
    ...appearance(),
    onChange: remember,
    onFinish: game => {
      stopped = Date.now();
      remember(game);
    },
  });
  get("summary").textContent = `${board.width} × ${board.height} · ${board.cells.filter(cell => cell === null).length}`;
  remember(handle.game());
}

function dimensions() {
  const preset = get("size").value;
  if (preset === "custom") return;
  const [width, height] = preset === "wide"
    ? [10, 6]
    : preset === "tall"
      ? [6, 10]
      : [Number(preset), Number(preset)];
  get("width").value = width;
  get("height").value = height;
}

function make() {
  if (!get("setup").reportValidity()) return;
  try {
    const width = Number(get("width").value);
    const height = Number(get("height").value);
    const seed = Number(get("seed").value);
    play(generateAkari(width, height, seed, get("level").value));
    get("notice").textContent = "";
  } catch {
    get("notice").textContent = words[language][18];
  }
}

for (const id of ["size", "width", "height", "level", "seed", "material", "pieces"]) {
  if (params.has(id)) get(id).value = params.get(id);
}
if (!params.has("width") && !params.has("height")) dimensions();
get("size").onchange = dimensions;
for (const id of ["width", "height"]) {
  get(id).onchange = () => { get("size").value = "custom"; };
}
get("setup").onsubmit = event => {
  event.preventDefault();
  make();
};
for (const id of ["material", "pieces"]) {
  get(id).onchange = () => {
    handle?.set(appearance());
    if (handle) remember(handle.game());
  };
}
get("share").onclick = async () => {
  const query = new URLSearchParams({ ...(active ?? {}), ...appearance() });
  const url = `${location.origin}${location.pathname}?${query}`;
  try {
    await navigator.clipboard.writeText(url);
    get("notice").textContent = words[language][17];
  } catch {
    get("notice").textContent = url;
  }
};

setInterval(() => {
  const seconds = Math.floor(((stopped ?? Date.now()) - started) / 1000);
  const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  get("clock").textContent = `${language === "ja" ? "時間" : "Time"} ${time}`;
}, 1000);

const pageLanguage = familyLanguage({
  id: "kazu",
  words: {
    en: {
      pitch: "Akari: light every white square without letting bulbs see one another.",
      name: "Kazu (数) is Japanese for ‘number’. Akari is a light-placement puzzle.",
      nameLink: "About the name",
      pageBack: "Number puzzles",
      pageApi: "API reference",
      foot: "Akari, a puzzle about placing lights.",
    },
    ja: {
      pitch: "美術館。電球同士が見えないように、白マスすべてを照らします。",
      name: "Kazu（数）は数字のこと。美術館は電球を置くパズルです。",
      nameLink: "名前について",
      pageBack: "数字のパズル",
      pageApi: "APIリファレンス",
      foot: "電球を置いて盤を照らすパズル。",
    },
  },
  onChange: nextLanguage => {
    language = nextLanguage;
    translate();
    if (handle) remember(handle.game());
  },
});
language = pageLanguage.lang;
translate();

let saved;
try {
  saved = JSON.parse(localStorage.getItem("kazu-akari-v1") ?? "null");
} catch {
  // A corrupt save starts fresh.
}
const restored = !params.has("seed") && saved && decodeAkari(saved.progress);
if (restored) {
  if (!params.has("lang") && ["en", "ja"].includes(saved.language)) pageLanguage.set(saved.language);
  for (const id of ["size", "width", "height", "level", "seed", "material", "pieces"]) {
    get(id).value = saved[id] ?? (id === "level" ? "medium" : "custom");
  }
  play(restored.board, saved.progress);
} else {
  make();
}
