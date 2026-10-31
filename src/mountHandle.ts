import { decodeCells, symbolOf } from "./cells.ts";
import { kazuCellName, kazuWhere } from "./draw.ts";
import { enterNumber, gameConflicts, isPrinted, isSolved, restartKazu, undoKazu } from "./game.ts";
import { hintKazu, type KazuHint } from "./hint.ts";
import type { KazuMount } from "./mount.ts";
import type { MountSession } from "./mountSession.ts";

/** The handle a page keeps: load, enter, undo, hint, check and the clock's words. */
export function mountHandle(s: MountSession): KazuMount {
  const api: KazuMount = {
    host: s.host,
    game: () => s.game,
    detail: s.detail,
    load: (puzzle) => {
      const next = s.start(puzzle);
      if (next === null) return false;
      s.stopClock();
      s.game = next;
      s.solution = puzzle.solution ?? null;
      s.level = puzzle.level;
      s.seed = puzzle.seed;
      s.banked = puzzle.elapsed ?? 0;
      s.selected = null;
      s.pencilOn = false;
      s.hints = 0;
      s.checks = 0;
      s.hintCell = null;
      s.wrongCells = [];
      s.solved = isSolved(s.game);
      s.drawn = "";
      s.setSays("tap");
      s.buildPad();
      s.render();
      return true;
    },
    set: (changes) => {
      const { language: nextLanguage, ...rest } = changes;
      s.settings = {
        ...s.settings,
        ...Object.fromEntries(Object.entries(rest).filter(([, value]) => value !== undefined)),
      } as typeof s.settings;
      if ("language" in changes) {
        s.explicitLanguage.value = nextLanguage;
        s.language = nextLanguage ?? s.languageOfPage();
      }
      s.drawn = "";
      s.render();
    },
    select: (cell) => {
      s.selected = cell !== null && cell >= 0 && cell < s.game.size * s.game.size ? cell : null;
      if (s.hintCell !== null && s.hintCell !== s.selected) s.hintCell = null;
      s.render();
    },
    enter: (value) => {
      if (s.selected !== null) s.write(s.selected, value);
    },
    pencil: (on) => {
      s.pencilOn = on ?? !s.pencilOn;
      if (!s.solved) s.tapWords();
      s.render();
    },
    undo: () => {
      const next = undoKazu(s.game);
      if (next === s.game || s.solved) return;
      s.game = next;
      s.changed();
    },
    hint: () => {
      if (s.solved || s.settings.hints === "off") return;
      const found = hintKazu(s.game.kind, s.game.size, s.game.givens, s.game.entries, s.answerKey() ?? undefined);
      if (found === null) {
        s.setSays("hintDone");
        s.render();
        return;
      }
      s.hints += 1;
      s.selected = found.cell;
      const words = hintWords(found);
      if (s.settings.hints === "place") {
        s.runClock();
        s.game = enterNumber(s.game, found.cell, found.value, s.settings.tidy);
        s.changed();
        if (!s.solved) s.setSays("", undefined, false, words);
        s.hintCell = found.cell;
        s.render();
      } else {
        s.hintCell = found.cell;
        s.wrongCells = [];
        s.setSays("", undefined, false, words);
        s.render();
      }
      s.emit("kazu-hint", { hint: found });
    },
    check: () => {
      if (s.solved || s.settings.check === "off") return;
      s.checks += 1;
      const answer = decodeCells(s.answerKey() ?? "", s.game.size);
      const wrong: number[] = [];
      const empty = s.game.entries.filter((value, index) => !isPrinted(s.game, index) && value === 0).length;
      if (answer !== null)
        s.game.entries.forEach((value, index) => {
          !isPrinted(s.game, index) && value !== 0 && value !== answer[index] ? wrong.push(index) : undefined;
        });
      else wrong.push(...gameConflicts(s.game).filter((index) => !isPrinted(s.game, index)));
      s.wrongCells = s.settings.check === "show" ? wrong : [];
      s.hintCell = null;
      if (wrong.length === 0 && empty === 0) s.setSays("checkRight");
      else if (wrong.length === 0) s.setSays("checkOnlyEmpty", { empty });
      else if (empty === 0) s.setSays("checkWrongNoneEmpty", { wrong: wrong.length }, true);
      else s.setSays("checkWrong", { wrong: wrong.length, empty }, true);
      s.render();
      s.emit("kazu-check");
    },
    restart: () => {
      s.stopClock();
      s.game = restartKazu(s.game);
      s.banked = 0;
      s.hints = 0;
      s.checks = 0;
      s.selected = null;
      s.hintCell = null;
      s.wrongCells = [];
      s.solved = isSolved(s.game);
      s.setSays("tap");
      s.render();
      s.emit("kazu-change");
    },
    destroy: () => {
      s.stopClock();
      s.box.removeEventListener("click", s.onClick);
      s.box.removeEventListener("keydown", s.onKey);
      s.box.removeEventListener("focus", s.onFocus);
      s.document.removeEventListener("visibilitychange", s.onVisible);
      s.watching?.disconnect();
      s.host.replaceChildren();
      s.host.classList.remove("kazu-play");
      for (const name of ["solved", "pencil", "kind", "size"]) delete s.host.dataset[name];
    },
  };

  /** The line a hint says, in the board's language. */
  function hintWords(found: KazuHint): string {
    const cell = kazuCellName(s.game.size, found.cell, s.language);
    const value = symbolOf(found.value);
    const lead = found.replaces ? s.say("hintReplaces", { cell }) : "";
    if (found.why === "answer") return lead + s.say("hintAnswer", { cell, value });
    if (found.why === "only-number") {
      const where = kazuWhere(s.game.kind, s.language);
      return (
        lead +
        (found.by === undefined
          ? s.say("hintOnly", { cell, value, where })
          : s.say("hintOnlyBy", {
              cell,
              value,
              where,
              by: s.say(found.by === "cage" ? "byCage" : found.by === "marks" ? "byMarks" : "byClues"),
            }))
      );
    }
    const group = found.group!;
    const diagonal = group.type === "diagonal" ? s.say(group.index === 0 ? "groupDiagonal" : "groupDiagonalOther") : "";
    const named =
      group.type === "diagonal"
        ? diagonal
        : s.say(`group${group.type[0]!.toUpperCase()}${group.type.slice(1)}`, { n: group.index + 1 });
    return lead + s.say("hintPlace", { group: named, value, cell });
  }

  return api;
}
