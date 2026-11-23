---
title: LPIPS gate for the base SVG (findings of #45)
type: analysis
sources: [conversation:2026-11-23, docs/adr/0003-area-map-as-svg-data.md]
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
- Finest level: mean 0.03 or lower and worst tile 0.04 or lower.
- Detail 100 gains almost nothing over detail 50 and costs 1.8 times the size.

(source: conversation:2026-11-23.)

## What the test found

- A lower trace detail in VectorCraft does not shrink the file below level 20. The anchors of the
  coast and terrain stay. The detail setting is the wrong tool for a coarse level.
- VectorCraft output uses `M`, `L`, `C` and `Z`. Most segments are `C` curves. The engine prototype
  reads only `M`, `L` and `Z`. Either a flattening step or an engine that reads `C` is needed. Not
  yet decided. Issue #48 (the file contract) may decide it.
- Serebii map tiles stop at zoom 3. `tile_3-7-7.png` exists. `tile_4-*` and `tile_5-*` return 404.
  The grid is 8 by 8 tiles of 512 px, so the best reference is 4096 px.

(source: conversation:2026-11-23.)

> **Unverified:** four levels of detail (LODs: 1/8, 1/4, 1/2 and full size, detail 20, 20, 20 and 50). This is a
> proposal. A coarse level may need a downscaled source picture. Issue #54 tests it. Do not treat it
> as a decision.

## Related

- [VectorCraft](../entities/vectorcraft.md)
- [Project decisions and acceptance status](project-decisions.md)
