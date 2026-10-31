import { symbolOf } from "./cells.ts";
import { kazuClockText } from "./clock.ts";
import { drawKazu } from "./draw.ts";
import { gameConflicts, kazuProgress, numberCounts } from "./game.ts";
import type { MountSession } from "./mountSession.ts";
import { kazuNameOf } from "./strings.ts";

/** From this side up the letter N is a number (A is 10, so N is 23), and Pencil moves to the slash key. */
export const NOTES_KEY_IS_A_NUMBER = 23;

/** Draw the board, the pad and the words again from the session. */
export function renderBoard(s: MountSession): void {
  const conflicts = s.settings.conflicts ? gameConflicts(s.game) : [];
  const svg = drawKazu(s.game.kind, s.game.size, s.game.givens, {
    entries: s.game.entries,
    notes: s.game.notes,
    selected: s.selected,
    peers: s.settings.peers,
    conflicts,
    wrong: s.wrongCells,
    hint: s.hintCell,
    done: s.solved,
    interactive: !s.solved,
    language: s.language,
  });
  if (svg !== null && svg !== s.drawn) {
    s.inner.innerHTML = svg;
    s.drawn = svg;
  }
  s.box.dataset.over = String(s.solved);
  s.host.dataset.solved = String(s.solved);
  s.host.dataset.pencil = String(s.pencilOn);
  s.host.dataset.kind = s.game.kind;
  s.host.dataset.size = String(s.game.size);
  s.box.setAttribute("aria-label", s.say("board", { name: kazuNameOf(s.game.kind, s.language), size: s.game.size }));
  s.keysNote.textContent = s.say(s.game.size >= NOTES_KEY_IS_A_NUMBER ? "keysColossus" : "keys");
  const counts = numberCounts(s.game);
  s.padKeys.forEach((key, at) => {
    const value = at + 1;
    key.disabled = s.solved;
    key.dataset.done = String(counts[value]! >= s.game.size);
    key.setAttribute(
      "aria-label",
      s.say(counts[value]! >= s.game.size ? "padDone" : "padNumber", { n: symbolOf(value) }),
    );
  });
  if (s.eraseKey !== null) {
    s.eraseKey.disabled = s.solved;
    s.eraseKey.setAttribute("aria-label", s.say("erase"));
  }
  s.pad.setAttribute("aria-label", s.say("pad"));
  s.undoButton.textContent = s.say("undo");
  s.undoButton.disabled = s.game.past.length === 0 || s.solved;
  s.pencilButton.textContent = s.say("pencil");
  s.pencilButton.title = s.say("pencilTitle");
  s.pencilButton.setAttribute("aria-pressed", String(s.pencilOn));
  s.pencilButton.disabled = s.solved;
  s.hintButton.textContent = s.say("hint");
  s.hintButton.title = s.say("hintTitle");
  s.hintButton.hidden = s.settings.hints === "off";
  s.hintButton.disabled = s.solved;
  s.checkButton.textContent = s.say("check");
  s.checkButton.title = s.say("checkTitle");
  s.checkButton.hidden = s.settings.check === "off";
  s.checkButton.disabled = s.solved;
  s.controls.hidden = !s.settings.controls;
  s.pad.hidden = !s.settings.controls;
  s.clockEl.hidden = !s.settings.clock;
  s.clockEl.setAttribute("aria-label", s.say("clock"));
  const progress = kazuProgress(s.game);
  s.progressEl.textContent = `${progress.filled} / ${progress.total}`;
  s.paintClock();
  const text = s.solved
    ? s.say(s.banked > 0 || s.ranSince !== null ? "solvedIn" : "solved", { time: kazuClockText(s.elapsed()) })
    : s.sayText();
  s.saysEl.textContent = text;
  s.saysEl.dataset.warn = String(s.says.warn === true && !s.solved);
  const note = s.selected === null ? "" : s.cellDescription(s.selected);
  if (note !== s.announced) {
    s.announced = note;
    s.announce.textContent = note;
  }
}
