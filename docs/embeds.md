# Embed a seeded or daily number puzzle

[Open the builder](https://johnmorrisdotca.github.io/kazu/builder.html) to choose any of the six `KAZU_KINDS`, preview it and copy an element, iframe, module, React 19, Vue, Svelte, Angular, plain HTML block or iframe URL. The setup is in the link, and the iframe stores nothing. Its npm pin follows the package major.

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/kazu@2/dist/element-define.js"></script>
<kazu-board kind="number-place" grid="9" seed="7" size="medium"></kazu-board>
<kazu-board kind="towers" grid="5" daily="2026-10-09" size="small"></kazu-board>
```

`size="small|medium|large"` selects display widths 320, 480 or 640 pixels. `grid` selects a side supported by the puzzle kind; existing numeric `size` values remain aliases for it. A new grid/daily embed defaults to medium display width. `width` overrides it and fits the parent. `theme` is light, dark or auto, including explicit themes inside shadow roots. `label` is a spoken label rendered as text. Native `lang` remains a reflected browser property.

`daily="today"`, an empty attribute, `on`, `true` or `1` resolves the current UTC day; a real `YYYY-MM-DD` fixes one. Off aliases are `off`, `false`, `no` and `0`. Daily mode uses the shared UTC date-seed helper, namespaced by kind, grid and difficulty, and takes precedence over an explicit seed. A custom `givens` puzzle takes precedence over daily mode. Each new day starts fresh play even when it yields a repeated puzzle. There is no daily rollover timer and no persisted score or game.

Every observed attribute has a property. Off values are respected by all switches; Hint and Check also accept the off aliases. The `check` property keeps its callable method when read while framework assignments write its attribute. Existing `game`, `detail`, `mount`, `undo()`, `hint()`, `check()`, `restart()`, `pencil()` and `select()` remain available. `options` holds host callbacks, read at event time without restarting play. `defineBoard(tag?)` registers a standard or custom tag without replacing a definition.

The builder checks coverage against observed attributes and the real mounted-board option keys. It leaves custom givens, solutions and kept run/notes/elapsed data to host code with a reason. It adjusts an incompatible grid when changing puzzle kind. Clearing a starter seed or disabling a default control remains cleared/disabled when the builder link is reloaded. Once the board loads, it measures its controls to print a frame height that fits the square puzzle.

The iframe is `embed/?kind=number-place&grid=9&seed=7&size=medium`. It validates kinds, grid/level choices, seeds, dates, display choices, width, label, givens/solution codes and kept run/notes data. Invalid values are ignored. It is transparent, noindex, supports light/dark schemes, and reuses the player's keyboard controls and reduced motion. Its play clock is the existing client UI, started by play; it makes no background requests.

The existing `kazu-change`, `kazu-hint`, `kazu-check` and `kazu-solve` events now bubble across shadow boundaries with JSON-safe detail; unset optional keys are omitted. `kazu-load` adds `{ kind, grid, day, seed }`; `kazu-error` adds `{ message }`. The iframe forwards the identical detail as `{ type: event.type, detail: event.detail }`. A host must check `event.origin === "https://johnmorrisdotca.github.io"` and `event.source === iframe.contentWindow` before using a message. No visitor identity fields are included.
