---
title: Packing algorithm
type: concept
sources: [src/core/layout.ts, src/core/layout.test.ts, reference/sv-artifact-template.html]
updated: 2026-11-16
---

# Packing algorithm

`packBoxes(groups, { noSplit, extra })` in `src/core/layout.ts` is a pure function. It is a port of
`layout()` from the [prototype](../sources/sv-prototype.md). `layoutBoxes(layout, options)` first
filters entries by the [toggles](options-and-filters.md), then calls it.

## Rules

- A box has 30 slots (6 × 5). Slots run continuously across groups.
- With `noSplit`, a group of **2 to 6** entries that does not fit in the current box starts a new
  box. The rest of the old box is filled with empty slots (`null`).
- Larger groups (Vivillon line, Flabébé line, Alcremie, and Minior with 8) flow across box
  boundaries.
- A group of 1 is never moved.
- `extra` entries always start a new box, and each is placed as its own group.

## Verified results (default options)

| Setup                                             | Result                                     |
| ------------------------------------------------- | ------------------------------------------ |
| Full SV data                                      | 31 boxes, 917 slots, 13 empty              |
| Full SV data, box 7 last entry                    | `flabebe-orange`                           |
| Paldea dex only, no DLC-only forms                | 18 boxes; box 7 ends at `floette-red`      |
| Alcremie toggle off                               | 917 − 62 slots                             |

"DLC-only forms" are eight ids: `wooper`, `wooper-female`, `tauros`, `diglett-alola`,
`dugtrio-alola`, `slowpoke-galar`, `slowbro-galar`, `slowking-galar`. The test hard-codes them.

(source: `src/core/layout.test.ts`)

## Related

- [Layout rules](layout-rules.md) define the groups that are packed.
