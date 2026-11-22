---
title: UI behaviour
type: concept
sources:
  [
    src/components,
    src/core/entry.ts,
    src/components/App.test.tsx,
    src/games/sv/theme.css,
    conversation:2026-11-22,
  ]
updated: 2026-11-22
---

# UI behaviour

Components: `App`, `Header`, `BoxGrid`, `Box`, `Cell`, `Tooltip`, `Legend`, `SettingsDialog`,
`LayoutTextDialog`, `BackupDialog`, `GuideDialog`, plus a small `Dialog` wrapper.

## Box screen

- **Look:** the box screen copies the PC box of each game. `src/games/<id>/theme.css` holds the
  colours, sampled from game screenshots. `App` sets `data-theme` on `<html>`.
- **Cell:** a `<button>` with `aria-pressed` and `aria-label`. A click, Enter or Space toggles it.
  Empty slots are dashed frames and are not buttons. A missing sprite falls back to the species
  name. A version exclusive shows its version letter (for example S or V).
- **Box header:** "Box N", number range (first – last), `caught/total`, and a highlight when
  complete. A box with only extra entries shows "dodatki".
- **Header:** title, game selector, progress bar and `X / Y (Z%)`, stats
  "N boxów · N slotów · N pustych", and search. Buttons open the settings, the Guide, the text
  layout and the backup. On a phone (CSS only), everything except the title, progress and search folds behind
  "Więcej".
- **Legend:** colour stripes for the entry kinds and the version letters. It is open on desktop.
- **Search:** matches the label (name + form + gender) as a substring, or the number exactly:
  `145`, `#145`, `K12`, `b43`. Hits are highlighted and the first one scrolls into view.
- **Tooltip:** full name with form and gender, then "Paldea/Kitakami/Blueberry #N · nat. #N".
  Entries outside every dex show only "nat. #N".

## Undo toast

Each toggle shows a toast for 5 s, for example "Złapano Sprigatito · Cofnij". "Cofnij" restores the
caught set from before the last change (one step). An import shows "Wczytano kopię postępu ·
Cofnij". (source: `src/components/App.tsx`)

## Dialogs

- **Settings:** the toggles. See [Options and filters](options-and-filters.md).
- **Guide ("Poradnik"):** one checklist per collectible set of the game. In SV the set is
  "Słupki ruin": 4 shrines with 8 stakes each, and a counter "x/8" per shrine. Each stake links to
  its Serebii image and mini-map. The button shows only for a game with collectibles. On a phone (up to
  600 px) the Guide fills the screen. See [Backup code and storage](backup-and-storage.md) for the
  ids.
- **Text dialog:** boxes in 5 rows of 6, `—` for empty slots, copy button.
- **Backup dialog:** shows the export code. "Wczytaj" checks the code ("Nieprawidłowy kod.")
  and then asks: "Złapane w kodzie: N. Obecnie: M. Wczytać i zastąpić obecny postęp?". The counts
  include entries only, not collectibles.

## Other

- **Routing:** hash, for example `#sv` or `#za`. An unknown hash falls back to the first game.
- **Performance:** `Box` and `Cell` use `React.memo`. `toggle` reads the caught set through a ref,
  so it stays the same function and the cells do not re-render. The tooltip listens to mouse events
  on the grid instead of re-rendering the app.

## Testing note

jsdom has no modal `<dialog>`. `src/test-setup.ts` emulates `showModal` and `close` by setting
the `open` attribute. For checks in the browser pane, see `docs/agents/ui-verification.md`.
