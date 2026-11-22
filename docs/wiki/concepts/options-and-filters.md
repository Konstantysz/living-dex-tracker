---
title: Options and filters
type: concept
sources: [src/core/layout.ts, src/core/storage.ts, reference/sv-artifact-template.html]
updated: 2026-11-16
---

# Options and filters

Six toggles. They are saved per game and change the layout live.

| Option    | Meaning                                   | Default | Filters kind          |
| --------- | ----------------------------------------- | ------- | --------------------- |
| `reg`     | regional forms only through HOME          | on      | `reg`                 |
| `alc`     | all Alcremie (63)                         | on      | `alc`                 |
| `bat`     | battle forms                              | off     | `bat`, with `extra` also `xbat` |
| `extra`   | box with forms outside every dex          | off     | `xreg`, `xbat`        |
| `noSplit` | do not split small groups (≤ 6)           | on      | packing only          |
| `dim`     | dim caught sprites                        | off     | display only          |

Notes:

- `xbat` entries need both `extra` and `bat`.
- `nreg` (regional forms native to SV) and all other kinds are always shown.
- `dim` is stored with the options but is not part of `LayoutOptions`. It toggles the body class
  `dimcaught`.

## Related

- [Packing algorithm](packing-algorithm.md)
- [Backup code and storage](backup-and-storage.md)
