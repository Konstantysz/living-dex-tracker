---
title: LPIPS gate for the base SVG (findings of #45, #54 and #58)
type: analysis
sources:
  [
    conversation:2026-11-23,
    docs/adr/0003-area-map-as-svg-data.md,
    docs/adr/0005-traced-game-picture-as-base-art.md,
  ]
updated: 2026-11-23
---

# LPIPS gate for the base SVG (findings of #45)

Issue #45 asked if an agent can make `map-base.svg` that looks like the source picture, with LPIPS
as the gate. The answer is yes. The prototype is on branch `prototype/lpips-gate` (draft PR #55).
Do not merge that branch.

## How the test worked

- The agent cut one 1024 px fragment (a city and a desert) from a 3000 px flat-colour map.
- The agent traced the fragment, rendered the SVG with resvg, and scored it against the fragment.
- LPIPS used the AlexNet network. The score is the mean over 256 px tiles. The test also reports the
  worst tile, because a mean can hide one bad tile.
- A JPEG re-save at quality 85 scored 0.020. Use that value as the noise floor.
- The source picture is look-only art. The user approved it for this spike only. No part of it is in
  the repo.

(source: conversation:2026-11-23.)

## Results

| Trace                  | LPIPS mean | Worst tile | SVG size | Full map (x9) |
| ---------------------- | ---------- | ---------- | -------- | ------------- |
| vtracer medium         | 0.082      | 0.229      | 820 KB   | about 7 MB    |
| vtracer fine           | 0.050      | 0.121      | 1244 KB  | about 11 MB   |
| VectorCraft detail 5   | 0.109      | 0.184      | 649 KB   | about 6 MB    |
| VectorCraft detail 10  | 0.079      | 0.143      | 738 KB   | about 7 MB    |
| VectorCraft detail 20  | 0.059      | 0.111      | 876 KB   | about 8 MB    |
| VectorCraft detail 50  | 0.022      | 0.030      | 2092 KB  | about 19 MB   |
| VectorCraft detail 100 | 0.0185     | 0.028      | 3851 KB  | about 35 MB   |

(source: conversation:2026-11-23.) The "Full map" column is the fragment size times 9. It is an
extrapolation, not a measurement. The resvg render of the fragment took 270 to 450 ms.

## Gate accepted by eye

The user judged the detail 20 and detail 50 renders "gorgeous".

- Coarse level: mean LPIPS 0.06 or lower.
- Finest level: mean 0.03 or lower and worst tile 0.04 or lower. Replaced for the Serebii source
  by the gate in "Seam test (#58)".
- Detail 100 gains almost nothing over detail 50 and costs 1.8 times the size.

(source: conversation:2026-11-23.)

## What the test found

- A lower trace detail in VectorCraft does not shrink the file below level 20. The anchors of the
  coast and terrain stay. The detail setting is the wrong tool for a coarse level.
- VectorCraft output uses `M`, `L`, `C` and `Z`. Most segments are `C` curves. The engine prototype
  reads only `M`, `L` and `Z`. The project needs a flattening step or an engine that reads `C`. Not
  yet decided. Issue #48 (the file contract) may decide it.
- Serebii map tiles stop at zoom 3. `tile_3-7-7.png` exists. `tile_4-*` and `tile_5-*` return 404.
  The grid is 16 by 16 tiles of 256 px, so the best reference is 4096 px. (An earlier version of
  this page said 8 by 8 tiles of 512 px. That was wrong.)

(source: conversation:2026-11-23.)

## Four LODs (#54)

The test traced LOD 8, 4, 2 and 1 (scale 1/8, 1/4, 1/2 and full size) with `noise` 1, 1, 2 and 3.
The plan was `colorDetail` 20, 20, 20 and 50. The test scored each coarse LOD against its own
downscale. The test used one fragment only.

(source: conversation:2026-11-23.)

> **Unverified:** the claim that all four LODs work, and the total of about 27 MB. Both come from
> that one fragment.

## Seam test (#58)

The test stitched the 256 Serebii tiles and traced four tile files of LOD 1: A, B, sea and mountain.
Each file is 1000 px plus 8 px of overlap on each side. VectorCraft used `automatic`,
`colorDetail` 50 and `noise` 3. The test painted file B over file A. The seam is between A and B.

- No Serebii tile is blank or transparent. No tile needs a Bulbagarden patch.
- The owner saw no seam at full zoom.
- A and B match in the 16 px overlap. The mean difference is 3.2 of 255. 0.1 % of pixels differ
  by more than 40.

| Strip (256 px windows)  | Mean  | Worst |
| ----------------------- | ----- | ----- |
| Across the seam         | 0.033 | 0.052 |
| Inside file A (control) | 0.041 | 0.063 |
| Inside file B (control) | 0.036 | 0.053 |

| Tile file               | Size    | Paths | LPIPS mean / worst   |
| ----------------------- | ------- | ----- | -------------------- |
| A (central terrain)     | 1.30 MB | 2350  | not scored per file  |
| B (east desert)         | 1.43 MB | 3287  | not scored per file  |
| Sea (row 0, col 0)      | 0.51 MB | 1071  | 0.024 / 0.052        |
| Mountain (row 0, col 1) | 1.06 MB | 2671  | 0.027 / 0.075        |

A tile file is about 1.1 MB on average. Nine tile files are about 10 MB.

The old worst-tile limit of 0.04 fails on this source, also inside one tile. The cause is thin
contour lines that `noise` 3 removes. The owner accepted this gate for the fine LOD:

- Mean 0.04 or lower.
- Worst window 0.08 or lower.
- The seam strip scores no worse than the interior strips.

> **Unverified:** the limit of 0.08 rests on two scored tile files and one seam. The mountain file
> scored 0.075, so the margin is small. The control strip in file A has mean 0.041. That is above
> the mean limit of 0.04.

The prototype scripts are on the unmerged branch `prototype/seam-check`.

(source: conversation:2026-11-23.)

## Related

- [VectorCraft](../entities/vectorcraft.md)
- [Project decisions and acceptance status](project-decisions.md)
