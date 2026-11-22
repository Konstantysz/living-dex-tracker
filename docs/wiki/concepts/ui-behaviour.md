---
title: UI behaviour
type: concept
sources: [src/components, src/core/entry.ts, src/components/App.test.tsx]
updated: 2026-11-16
---

# UI behaviour

Components: `App`, `Header`, `BoxGrid`, `Box`, `Cell`, `Tooltip`, `LayoutTextDialog`,
`BackupDialog`, `Legend`, plus a small `Dialog` wrapper.

- **Cell:** a `<button>` with `aria-pressed` and `aria-label`. Enter and Space toggle it. Empty
  slots are dashed frames and are not buttons. A missing sprite falls back to the species name.
- **Box header:** "Box N", number range (first – last), `caught/total`, and a highlight when
  complete. A box with only extra entries shows "dodatki".
- **Header:** progress bar and `X / Y (Z%)`, stats "N boxów · N slotów · N pustych", toggles,
  search, buttons, game selector.
- **Search:** matches the label (name + form + gender) as a substring, or the number exactly:
  `145`, `#145`, `K12`, `b43`. Hits are highlighted and the first one scrolls into view.
- **Tooltip:** full name with form and gender, then "Paldea/Kitakami/Blueberry #N · nat. #N".
  Entries outside every dex show only "nat. #N".
- **Text dialog:** boxes in 5 rows of 6, `—` for empty slots, copy button.
- **Backup dialog:** shows the export code. The import validates and shows "Nieprawidłowy kod."
- **Routing:** hash, for example `#sv`. An unknown hash falls back to the first game.
- **Performance:** `Box` and `Cell` use `React.memo`. The tooltip listens to mouse events on the
  grid instead of re-rendering the app.

## Testing note

jsdom has no modal `<dialog>`. `src/test-setup.ts` emulates `showModal` and `close` by setting
the `open` attribute.
