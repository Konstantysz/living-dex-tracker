---
title: Options and filters
type: concept
sources: [src/core/layout.ts, src/core/storage.ts, src/components/SettingsDialog.tsx]
updated: 2026-11-22
---

# Options and filters

The player sets two toggles in "Ustawienia". The app saves them per game and changes the layout
live.

| Option | Meaning                                 | Default | Effect          |
| ------ | --------------------------------------- | ------- | --------------- |
| `go`   | all Vivillon patterns (need Pokémon GO) | off     | shows kind `go` |
| `dim`  | dim caught sprites                      | off     | look only       |

Notes:

- `keep()` in `src/core/layout.ts` never shows kinds `reg`, `bat`, `xreg` and `xbat`. The game PC
  cannot store HOME-only regional forms and battle forms. The data stays in `layout.json`.
- All other kinds (for example `nreg`, `fem`, `form`, `alc`) always show. Only `go` hides
  entries.
- `dim` is stored with the options but is not part of `LayoutOptions`. It toggles the body class
  `dimcaught`.
- The prototype had toggles for `reg`, `bat` and `extra`. The app removed them when it limited the
  dex to what the PC can store.

- Issue #20 removed the toggles `alc` (all 63 Alcremie) and `noSplit` (do not split species of 2
  to 6 entries). All 63 Alcremie always show. Packing always lets a species flow across boxes.
  The app ignores the old saved keys. See [Backup code and storage](backup-and-storage.md).
  (source: `src/core/layout.ts`, `src/core/layout.test.ts`)

## Related

- [Packing algorithm](packing-algorithm.md)
- [Backup code and storage](backup-and-storage.md)
