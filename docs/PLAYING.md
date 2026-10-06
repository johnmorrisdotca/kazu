# Playing it in a page

`mountKazu`, its options and keys, and the `<kazu-board>` element. Back to the [README](../README.md#playing-it-in-a-page).

## Playing it in a page

```ts
import { mountKazu } from "@johnmorrisdotca/kazu/play";

const board = mountKazu(document.getElementById("here")!, {
  kind: "towers", size: 6, givens, solution, level: "hard", seed: 1234,
  hints: "show", check: "count",
  onChange: ({ run, notes, elapsedMs }) => keep(run, notes, elapsedMs),   // to carry on a puzzle half done
  onSolve: ({ answer, elapsedMs, helped }) => send(answer, elapsedMs, helped),   // `answer` is what checkKazu takes
});
board?.undo(); board?.hint(); board?.load({ kind: "diagonal", size: 9, givens: other });
```

Tap a cell and tap a number on the pad (or type it); tap the chosen cell again to step its number on, 1, 2, 3
… and round to empty. Turn **Pencil** on and the pad writes small notes instead, and a number written takes itself
out of the notes of the cells it shares a group with. **Undo** takes the last change back, **Hint** says which
cell to fill next and why, **Check** says how many cells are wrong, never which. A clock starts on the first entry
and stops when the last cell is right, and waits while the page is hidden.

The keys: the arrows move, a number (1 to 9, then A to G on the 16×16 and on to P on the 25×25) fills the chosen cell, Shift with a
number writes it as a pencil mark, Backspace empties the cell, N turns Pencil on or off (the slash key on the 25×25, where N is the number 23), Ctrl or Cmd with Z
undoes, Escape lets the cell go. The board's box keeps one steady square, and the lines of words under it keep
the room their longest wording takes, so nothing moves as numbers are written or messages come and go. Nothing
the player touches can be selected. Its words are English and Japanese and follow the page's `lang`.

| Option | What it does |
| --- | --- |
| `kind`, `size`, `givens`, `solution` | the puzzle; `solution` is worked out when Hint or Check needs it if you leave it out |
| `level`, `seed` | carried in the events, to say which puzzle it was |
| `run`, `notes`, `elapsed` | a run kept half done (`decodeRun`'s code), its pencil marks, and the milliseconds already on the clock |
| `hints` | `place` (default) writes the number it found, `show` only points at the cell and says why, `off` takes the button away |
| `check` | `count` (default) says how many are wrong, `show` marks them too, `off` takes the button away |
| `conflicts`, `peers`, `tidy`, `tapToStep` | each on by default: cells that break a rule in red, the chosen cell's lines washed, a written number rubbed out of the notes beside it, a tap on the chosen cell stepping it on |
| `clock`, `controls` | the clock (default on); the number pad and buttons (default on) |
| `language` | `en` or `ja`; left out, the host's `lang` or the page's, and it follows the page's |
| `onChange`, `onHint`, `onCheck`, `onSolve` | callbacks, and the same four as DOM events on the host: `kazu-change`, `kazu-hint`, `kazu-check`, `kazu-solve`. Each `detail` has `run`, `notes`, `answer`, `progress`, `elapsedMs`, `hints`, `checks`, `helped` and `solved` |

Everything a button does is also a method on the handle (`undo`, `hint`, `check`, `restart`, `pencil`, `select`,
`enter`, `load`, `set`, `destroy`). The rules it plays by are `game.ts`'s, which are pure and need no page
(`newKazuGame`, `enterNumber`, `toggleNote`, `undoKazu`, `isSolved`), so a server can replay a game.

### The element

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/kazu@2/dist/element-define.js"></script>
<kazu-board kind="sum-cages" size="9" level="medium" seed="42"></kazu-board>
<kazu-board kind="towers" size="5" givens="…" solution="…" hints="show" lang="ja"></kazu-board>
```

Or `import "@johnmorrisdotca/kazu/element/define"` in a bundle. Attributes, each read again when it changes:
`kind` (the key of one of the six), `size`, `level` (`easy`, `medium` or `hard`) and `seed` (a new one if left out): the
puzzle is made in the page; or `size` with `givens` and `solution`, a puzzle of your own; `run`, `notes` and
`elapsed`, to carry on a puzzle half done; `hints` (`place`, `show`, `off`); `check` (`count`, `show`, `off`);
`conflicts`, `peers`, `tidy`, `tap-to-step`, `clock` and `controls`, each on unless set to `off`; and `lang`. It
fires the four events above and has the methods `undo()`, `hint()`, `check()`, `restart()`, `pencil()` and
`select()`. Importing either entry on a server is safe.

| Import | What it holds |
| --- | --- |
| `@johnmorrisdotca/kazu` | the generator, the solver, the check, the hint, the codes, and the game in play as pure functions: everything but the drawing and the page |
| `@johnmorrisdotca/kazu/draw` | `drawKazu` and the rest of the drawing as SVG text, its style, where everything sits in it, the words and the names; no page needed |
| `@johnmorrisdotca/kazu/play` | `mountKazu`: a puzzle played in any element by touch, mouse and keyboard, with its pad, buttons, clock, words and events |
| `@johnmorrisdotca/kazu/element` | the `KazuBoard` class behind `<kazu-board>`, to extend or to define under another name |
| `@johnmorrisdotca/kazu/element/define` | defines `<kazu-board>` on the page, for its effect |
