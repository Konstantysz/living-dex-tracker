---
title: Options and filters
type: concept
sources: [src/core/layout.ts, src/core/storage.ts, src/components/SettingsDialog.tsx]
updated: 2026-11-22
---

# Options and filters

The player sets four toggles in "Ustawienia". The app saves them per game and changes the layout
live.

| Option    | Meaning                                                  | Default | Effect                |
| --------- | -------------------------------------------------------- | ------- | --------------------- |
| `alc`     | all Alcremie (63)                                        | on      | shows kind `alc`      |
| `go`      | all Vivillon patterns (need Pokémon GO)                  | off     | shows kind `go`       |
| `noSplit` | do not split small species blocks (2 to 6 entries)       | off     | packing only          |
| `dim`     | dim caught sprites                                       | off     | look only             |

Notes:

- `keep()` in `src/core/layout.ts` never shows kinds `reg`, `bat`, `xreg` and `xbat`. The game PC
  cannot store HOME-only regional forms and battle forms. The data stays in `layout.json`.
- All other kinds (for example `nreg`, `fem`, `form`) always show.
- `dim` is stored with the options but is not part of `LayoutOptions`. It toggles the body class
  `dimcaught`.
- The prototype had toggles for `reg`, `bat` and `extra`. The app removed them when it limited the
  dex to what the PC can store.

> **Planned:** issue #20 removes `alc` and `noSplit`. Then all Alcremie always show and packing
> always splits. (source: `conversation:2026-11-22`)

## Related

- [Packing algorithm](packing-algorithm.md)
- [Backup code and storage](backup-and-storage.md)
