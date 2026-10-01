// The demo page's own script: a Kazu puzzle to play, any of the six, any size and level, played by the package's own
// `mountKazu` (the drawing, the number pad, pencil marks, Undo, Hint, Check, the clock), with every option the package has
// on a settings panel, kept on this device between visits, and spoken in the language the header's chooser picks.
// The page itself only chooses a puzzle and hands the settings on.
import { generateKazu, KAZU_KINDS, KAZU_LEVELS, KAZU_SPECS, freshKazuSeed, isKazuLevel, isKazuSeed } from "./dist/index.js";
import { KAZU_NAMES, KAZU_SIZE_NAMES } from "./dist/draw-entry.js";
import { mountKazu } from "./dist/play-entry.js";

// The page's own words, in the two languages it speaks. Set as text, never as HTML.
const WORDS = {
  en: {
    pageApi: "API reference",
    pitch: "Six number puzzles on one square grid: Sudoku, Jigsaw, Diagonal and Killer Sudoku, Futoshiki and Skyscrapers. Every puzzle has exactly one answer. Tap a cell, then a number; turn Pencil on to make notes; ask for a Hint to be told which cell to fill next, and why.",
    name: "Kazu (数) is Japanese for “number”, the everyday word, as in 数を数える, to count numbers.",
    nameLink: "About the name",
    puzzle: "Puzzle",
    size: "Size",
    level: "Level",
    levels: { easy: "Easy", medium: "Medium", hard: "Hard" },
    newPuzzle: "New puzzle",
    restart: "Restart",
    seed: (seed) => `Seed ${seed}`,
    play: "While you play",
    hints: "Hint",
    hintsOptions: { place: "Fills it in", show: "Points only", off: "Off" },
    check: "Check",
    checkOptions: { count: "Counts", show: "Marks them", off: "Off" },
    conflicts: "Rule breaks",
    peers: "Highlight",
    on: "On",
    off: "Off",
    rulesTitle: (name) => `How ${name} is played`,
    alsoKnown: (names) => (names.length === 0 ? "" : `Also known as ${names.join(", ")}.`),
    moreTitle: "Using it",
    moreText: "The board above is the package itself: the generator, the rules, the hint and the drawing. Each line below is all it takes.",
    tagTitle: "As a tag",
    tagText: "The same board in one element, with no framework: a Killer Sudoku made from a seed, asked to point at the hint instead of filling it in.",
    foot: "Every puzzle is made in your browser from a seed, and is proved to have exactly one answer. Nothing leaves this page.",
  },
  ja: {
    pageApi: "API（英語）",
    pitch: "一つの正方形の盤で遊ぶ、六つの数字パズルです：ナンプレ、変形ナンプレ、対角ナンプレ、サムナンプレ、不等式、摩天楼。どの問題も、答えはちょうど一つです。マスをタップして数字を選びます。メモをオンにすると下書きができ、ヒントでは次に入れるマスと、その理由がわかります。",
    name: "「数」（かず）は、数字やかずを表す、ふだんのことばです。「数を数える」のように使います。",
    nameLink: "名前について（英語）",
    puzzle: "パズル",
    size: "大きさ",
    level: "むずかしさ",
    levels: { easy: "やさしい", medium: "ふつう", hard: "むずかしい" },
    newPuzzle: "新しい問題",
    restart: "やり直す",
    seed: (seed) => `シード ${seed}`,
    play: "遊ぶときの助け",
    hints: "ヒント",
    hintsOptions: { place: "入れる", show: "指すだけ", off: "なし" },
    check: "確かめる",
    checkOptions: { count: "数だけ", show: "印をつける", off: "なし" },
    conflicts: "ルール違反",
    peers: "ハイライト",
    on: "あり",
    off: "なし",
    rulesTitle: (name) => `${name}の遊び方`,
    alsoKnown: (names) => (names.length === 0 ? "" : `別名：${names.join("、")}。`),
    moreTitle: "使い方",
    moreText: "上の盤面は、このパッケージそのもの（問題の作成、ルール、ヒント、描画）で動いています。下の各行がそれぞれ必要なコードのすべてです。",
    tagTitle: "タグとして",
    tagText: "同じ盤面を、フレームワークなしの一つの要素で。シードから作ったサムナンプレで、ヒントは数字を入れず、指すだけにしています。",
    foot: "どの問題も、あなたのブラウザーでシードから作られ、答えがちょうど一つであることが確かめられています。このページの外には何も送られません。",
  },
};

const KEY = "kazu.page";
const params = new URLSearchParams(location.search);

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
};
const write = (value) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* Not remembered on this device; the board still plays. */
  }
};
const pick = (asked, allowed, kept, fallback) => (allowed.includes(asked) ? asked : allowed.includes(kept) ? kept : fallback);

const kept = read();
let kind = pick(params.get("kind"), KAZU_KINDS, kept.kind, "number-place");
const sizes = { ...(kept.sizes ?? {}) };
const sizeOf = () => (KAZU_SPECS[kind].sizes.includes(Number(params.get("size"))) ? Number(params.get("size")) : KAZU_SPECS[kind].sizes.includes(sizes[kind]) ? sizes[kind] : KAZU_SPECS[kind].defaultSize);
let size = sizeOf();
let level = isKazuLevel(params.get("level")) ? params.get("level") : isKazuLevel(kept.level) ? kept.level : "medium";
let seed = isKazuSeed(Number(params.get("seed"))) ? Number(params.get("seed")) : isKazuSeed(kept.seed) && kept.kind === kind && kept.size === size && kept.level === level ? kept.seed : freshKazuSeed();
const play = {
  hints: pick(params.get("hints"), ["place", "show", "off"], kept.play?.hints, "place"),
  check: pick(params.get("check"), ["count", "show", "off"], kept.play?.check, "count"),
  conflicts: params.has("conflicts") ? params.get("conflicts") !== "off" : kept.play?.conflicts !== false,
  peers: params.has("peers") ? params.get("peers") !== "off" : kept.play?.peers !== false,
};
// What was written on this very puzzle, kept so that leaving the page half way costs nothing.
let progress = kept.progress ?? null;
let mount = null;

const language = familyLanguage({ id: "kazu", words: WORDS, onChange: () => render() });
const say = (key, ...args) => {
  const word = WORDS[language.lang][key];
  return typeof word === "function" ? word(...args) : word;
};
const keep = () => write({ kind, sizes, level, seed, size, play, progress });
const puzzleKey = () => `${kind}/${size}/${level}/${seed}`;

const host = document.getElementById("board");

function seg(parent, items, chosen, choose, labelOf, extra) {
  parent.replaceChildren(
    ...items.map((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.value = String(item);
      button.setAttribute("aria-pressed", String(item === chosen));
      extra?.(button, item);
      button.append(...[].concat(labelOf(item)));
      button.addEventListener("click", () => choose(item));
      return button;
    }),
  );
}

function label(main, sub) {
  const nodes = [document.createTextNode(main)];
  if (sub !== undefined) {
    const small = document.createElement("span");
    small.className = "sub";
    small.textContent = sub;
    nodes.push(small);
  }
  return nodes;
}

function settings() {
  const lang = language.lang;
  seg(document.getElementById("kinds"), KAZU_KINDS, kind, (value) => choose({ kind: value }), (value) => label(KAZU_NAMES[value][lang]));
  seg(document.getElementById("sizes"), KAZU_SPECS[kind].sizes, size, (value) => choose({ size: value }), (value) => label(`${value}×${value}`, KAZU_SIZE_NAMES[kind][value]?.[lang]));
  seg(document.getElementById("levels"), KAZU_LEVELS, level, (value) => choose({ level: value }), (value) => label(say("levels")[value]));
  seg(document.getElementById("hints"), ["place", "show", "off"], play.hints, (value) => changePlay({ hints: value }), (value) => label(say("hintsOptions")[value]));
  seg(document.getElementById("check"), ["count", "show", "off"], play.check, (value) => changePlay({ check: value }), (value) => label(say("checkOptions")[value]));
  seg(document.getElementById("conflicts"), [true, false], play.conflicts, (value) => changePlay({ conflicts: value }), (value) => label(say(value ? "on" : "off")));
  seg(document.getElementById("peers"), [true, false], play.peers, (value) => changePlay({ peers: value }), (value) => label(say(value ? "on" : "off")));
  document.getElementById("seed").textContent = say("seed", seed);
}

function rules() {
  const lang = language.lang;
  const info = KAZU_NAMES[kind];
  document.getElementById("rules-title").textContent = say("rulesTitle", info[lang]);
  document.getElementById("rules-tagline").textContent = info.tagline[lang];
  document.getElementById("rules-list").replaceChildren(
    ...info.rules[lang].map((line) => {
      const item = document.createElement("li");
      item.textContent = line;
      return item;
    }),
  );
  document.getElementById("rules-origin").textContent = `${info.origin[lang]} ${say("alsoKnown", info.alsoKnownAs)}`.trim();
}

function render() {
  language.say();
  settings();
  rules();
}

function changePlay(next) {
  Object.assign(play, next);
  keep();
  mount?.set(play);
  settings();
}

/** Put the address, the device and the page in step with the puzzle being played. */
function remember() {
  const query = new URLSearchParams(location.search);
  for (const [name, value] of Object.entries({ kind, size, level, seed })) query.set(name, String(value));
  history.replaceState(history.state, "", `${location.pathname}?${query.toString()}${location.hash}`);
  keep();
}

function put() {
  const made = generateKazu(kind, size, level, seed);
  const same = progress !== null && progress.key === puzzleKey();
  const entry = { kind, size, givens: made.givens, solution: made.solution, level, seed, run: same ? progress.run : undefined, notes: same ? progress.notes : undefined, elapsed: same ? progress.elapsed : undefined };
  if (mount === null) {
    mount = mountKazu(host, {
      ...entry,
      ...play,
      onChange: (detail) => {
        progress = detail.run.replace(/\./g, "") === "" && detail.notes === "" ? null : { key: puzzleKey(), run: detail.run, notes: detail.notes, elapsed: detail.elapsedMs };
        keep();
        host.dataset.filled = String(detail.progress.filled);
      },
      onSolve: () => {
        progress = null;
        keep();
      },
    });
  } else mount.load(entry);
  host.dataset.seed = String(seed);
  host.dataset.filled = String(mount.detail().progress.filled);
}

/** Choose another puzzle, size or level: a puzzle of the choice, from a new seed. */
function choose(next) {
  if (next.kind !== undefined) {
    sizes[kind] = size;
    kind = next.kind;
    size = KAZU_SPECS[kind].sizes.includes(sizes[kind]) ? sizes[kind] : KAZU_SPECS[kind].defaultSize;
  }
  if (next.size !== undefined) {
    size = next.size;
    sizes[kind] = size;
  }
  if (next.level !== undefined) level = next.level;
  seed = freshKazuSeed();
  progress = null;
  params.delete("size");
  params.delete("kind");
  params.delete("level");
  params.delete("seed");
  remember();
  put();
  render();
}

document.getElementById("new").addEventListener("click", () => {
  seed = freshKazuSeed();
  progress = null;
  remember();
  put();
  render();
});
document.getElementById("restart").addEventListener("click", () => {
  mount?.restart();
  progress = null;
  keep();
});

remember();
put();
render();
host.dataset.ready = "true";
