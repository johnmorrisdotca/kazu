import type { KazuGame } from "./game.ts";
import type { KazuLevel } from "./kinds.ts";
import type { KazuEventDetail, KazuMountOptions } from "./mount.ts";
import type { KazuLanguage } from "./strings.ts";

/** The settings a board can change after it is mounted, every one resolved to a value. */
export type MountSettings = {
  hints: NonNullable<KazuMountOptions["hints"]>;
  check: NonNullable<KazuMountOptions["check"]>;
  conflicts: boolean;
  peers: boolean;
  tidy: boolean;
  tapToStep: boolean;
  clock: boolean;
  controls: boolean;
};

/** The line under the board: a message key, the values it names, whether it warns, or text said as it is. */
export type MountSays = {
  key: string;
  values?: Record<string, string | number>;
  warn?: boolean;
  text?: string;
};

/** The board mountKazu closes over, shared with its handle. */
export interface MountSession {
  host: HTMLElement;
  options: KazuMountOptions;
  document: Document;
  view: Window & typeof globalThis;
  firstGame: KazuGame | null;
  game: KazuGame;
  level: KazuLevel | undefined;
  seed: number | undefined;
  solution: string | null;
  settings: MountSettings;
  explicitLanguage: { value: KazuLanguage | undefined };
  callbacks: KazuMountOptions;
  selected: number | null;
  pencilOn: boolean;
  hintCell: number | null;
  wrongCells: number[];
  says: MountSays;
  hints: number;
  checks: number;
  solved: boolean;
  banked: number;
  ranSince: number | null;
  tick: ReturnType<typeof setInterval> | null;
  language: KazuLanguage;
  drawn: string;
  announced: string;
  bar: HTMLDivElement;
  clockEl: HTMLSpanElement;
  progressEl: HTMLSpanElement;
  box: HTMLDivElement;
  inner: HTMLDivElement;
  keysNote: HTMLParagraphElement;
  announce: HTMLParagraphElement;
  pad: HTMLDivElement;
  controls: HTMLDivElement;
  saysEl: HTMLParagraphElement;
  button: (name: string, onPress: () => void, parent: HTMLElement, className?: string) => HTMLButtonElement;
  undoButton: HTMLButtonElement;
  pencilButton: HTMLButtonElement;
  hintButton: HTMLButtonElement;
  checkButton: HTMLButtonElement;
  padKeys: HTMLButtonElement[];
  eraseKey: HTMLButtonElement | null;
  say: (key: string, values?: Record<string, string | number>) => string;
  onClick: (event: Event) => void;
  onKey: (event: KeyboardEvent) => void;
  onFocus: () => void;
  onVisible: () => void;
  resumeOnShow: boolean;
  watching: MutationObserver | null;
  detail: () => KazuEventDetail;
  stopClock: () => void;
  setSays: (key: string, values?: Record<string, string | number>, warn?: boolean, text?: string) => void;
  buildPad: () => void;
  render: () => void;
  write: (cell: number, value: number) => void;
  changed: () => void;
  tapWords: () => void;
  answerKey: () => string | null;
  emit: (name: "kazu-change" | "kazu-hint" | "kazu-check" | "kazu-solve", extra?: Partial<KazuEventDetail>) => void;
  runClock: () => void;
  languageOfPage: () => KazuLanguage;
  elapsed: () => number;
  paintClock: () => void;
  sayText: () => string;
  cellDescription: (index: number) => string;
  start: (options: Pick<KazuMountOptions, "kind" | "size" | "givens" | "run" | "notes">) => KazuGame | null;
}
