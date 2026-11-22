---
title: Packing algorithm
type: concept
sources: [src/core/layout.ts, src/core/layout.test.ts, reference/sv-artifact-template.html]
updated: 2026-11-22
---

# Packing algorithm

`packBoxes(groups)` in `src/core/layout.ts` is a pure function. It is a port of `layout()` from
the [prototype](../sources/sv-prototype.md). `layoutBoxes(layout, options)` first filters entries
by the [toggles](options-and-filters.md), then calls it.

## Rules

- A box has 30 slots (6 × 5). Slots run continuously across species.
- A species of any size flows across box boundaries.
- A species from another dex (prefix K, B) always starts a new box. The app fills the rest of the
  old box with empty slots (`null`).
- Issue #20 removed the `noSplit` option. It moved a species of 2 to 6 entries to a new box.

## Verified results (default options)

| Setup                                             | Result                                     |
| ------------------------------------------------- | ------------------------------------------ |
| Full SV data                                      | 30 boxes, 875 slots, 25 empty              |
| Full SV data, box 7 last entry                    | `flabebe-orange`                           |
| Paldea dex only, no DLC-only forms                | 18 boxes, box 7 ends at `floette-red`      |
| Alcremie entries                                  | always 63                                  |

"DLC-only forms" are eight ids: `wooper`, `wooper-female`, `tauros`, `diglett-alola`,
`dugtrio-alola`, `slowpoke-galar`, `slowbro-galar`, `slowking-galar`. The test hard-codes them.

(source: `src/core/layout.test.ts`)

> **Unverified:** the rows "box 7 last entry" and "Paldea dex only" come from an older version of
> this page. The current `layout.test.ts` does not check them.

> **Unverified:** the older version of this page had 31 boxes and 917 slots for the full SV data.
> This change did not check the cause of the difference.

## Related

- [Layout rules](layout-rules.md) define the groups that are packed.
