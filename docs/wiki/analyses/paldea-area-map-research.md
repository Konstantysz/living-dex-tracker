---
title: Paldea area map, research and decisions
type: analysis
sources: [docs/research/sources.md, docs/adr/0003-area-map-as-svg-data.md, docs/adr/0004-area-map-rendered-with-pixijs.md, src/games/sv/generated/locations.json, conversation:2026-11-23]
updated: 2026-11-23
---

# Paldea area map, research and decisions

The area map is not built yet. Issue #43 is the planning map of this work. It lists the decisions
that issue #15 needs. #15 draws the SVG. #16 builds the renderer. #17 covers the Kitakami and
Blueberry dexes. (source: `conversation:2026-11-23`)

The map has these tickets:

- Where do the area borders come from? Closed.
- Which reference lets a human place the 31 Areas? Closed.
- Which slugs get a path, and which get an exception? Closed. 30 of 31 slugs get a path.
  `greatcraterofpaldea` is the only exception.
- Which render engine? Closed. PixiJS (ADR 0004).
- How good is the LPIPS gate for the base art? Open.
- What is the contract of the map files for #15? Open. The LPIPS ticket blocks it.
- Does the Pixi prototype work on a real phone? Open.

(source: `conversation:2026-11-23`, `docs/adr/0004-area-map-rendered-with-pixijs.md`)

## Scope

`locations.json` has 54 Area slugs. `regions` marks 31 of them as `paldea`. The other 23 belong to
Kitakami or Blueberry. The test of #15 covers the 31 Paldea slugs. #17 covers the rest.
(source: `src/games/sv/generated/locations.json`, `conversation:2026-11-23`)

## Where the borders come from

No approved Serebii source gives an Area border. (source: `conversation:2026-11-23`)

- The images `/pokearth/maps/paldea/<n>.jpg` are 640×360 screenshots of the player in the game.
  They show no border. Coverage is 0 of 31.
- The marker data of `pokearth/paldea/` has no Area names. A marker has only a position and a table
  id. A spawn table lists Pokémon, level and biomes.
- The Serebii map is a Leaflet tile layer with zoom 0 to 3. The picture is 4096 px wide at zoom 3.
  Markers use game units from 0 to 5000. The standard spawns form a grid of 250 units.

> **Unverified:** which picture is the reference for the base art. ADR 0003 names the 1024×1024
> picture that we have. Serebii serves tiles up to 4096 px. ADR 0004 does not decide this. The LPIPS
> ticket must decide it. (source: `docs/adr/0003-area-map-as-svg-data.md`)

## Reference maps for a human

A human draws our own Area shapes (the fallback of ADR 0003). The human examines two references.
The rules of use are in [`docs/research/sources.md`](../../research/sources.md). The owner approved both on
2026-11-23. (source: `docs/research/sources.md`)

| Source            | Coverage | Notes                                                                                                   |
| ----------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| Bulbagarden Archives | 30 of 31 | One map per Area with a magenta outline. Neighbouring outlines do not match exactly. No `areazero`. |
| PokéMaps          | 30 of 31 | An "Area outlines" option draws all Areas. `greatcraterofpaldea` has no shape. `areazero` has one.      |

Both sources are for looking only. Do not scrape, trace or copy them. Bulbagarden files are game
screenshots. PokéMaps names no source for its Area shapes and has no licence.
(source: `docs/research/sources.md`)

> **Unverified:** the accuracy of the PokéMaps borders, and their geometry at high zoom. A visitor
> checked only the full-island view.

## How PokéMaps works

PokéMaps is the quality target for our map. A visitor test found these facts.
(source: `conversation:2026-11-23`)

- It uses a custom web component. It does not use Leaflet, MapLibre or WebGL.
- The world is a pixel box that moves with a CSS transform.
- The base is raster tiles in webp. It swaps small tiles (300 px) for large tiles (1300 px) when
  the user zooms in.
- Area shapes are inline SVG paths made from JSON. Markers are HTML elements.
- It stays sharp and smooth at about 40 times zoom. Nobody tested a pan with many markers.
- It cannot be embedded. It sends `X-Frame-Options: SAMEORIGIN` and `frame-ancestors 'self'`. A
  plain link works (#50).

## Decisions

- A human draws the Areas. Do not trace the Serebii images. (source: `conversation:2026-11-23`)
- Game units (0 to 5000) are the coordinates of `map-areas.svg`. Our paths and the Serebii markers
  share one scale. (source: `docs/adr/0004-area-map-rendered-with-pixijs.md`)
- The map has two layers in one coordinate system. `map-base.svg` is the terrain art. `map-areas.svg`
  has one `<path id="<slug>">` per Area. A human checks the Areas on an overlay.
  (source: `conversation:2026-11-23`)
- LPIPS is the quality gate for the base art only. The tool lives in `scripts/`, outside
  `package.json`. (source: `conversation:2026-11-23`)
- The owner chose a Canvas or WebGL renderer for a map that pans and zooms, with touch from version
  one. (source: `conversation:2026-11-23`)
- The render engine is PixiJS v8. ADR 0004 replaces the renderer parts of ADR 0003.
  (source: `docs/adr/0004-area-map-rendered-with-pixijs.md`)

## Render engine

A prototype compared MapLibre GL, PixiJS and plain Canvas 2D. It used a stand-in for `map-areas.svg`
with 30 paths, 300 markers and a 4096 px base. The branch is `prototype/area-map-engines`. It is not
merged. (source: `docs/adr/0004-area-map-rendered-with-pixijs.md`)

| Engine   | Normal mode | Stress mode (5,000 points per Area)    |
| -------- | ----------- | -------------------------------------- |
| PixiJS   | 60 fps      | 60 fps, start 131 ms                   |
| Canvas   | 36 fps      | 24 fps, spikes to 200 ms               |
| MapLibre | 60 fps      | start took 12 to 35 s, no valid timing |

- All numbers come from a desktop browser with a visible window. A phone was not tested.
  (source: `docs/adr/0004-area-map-rendered-with-pixijs.md`)
- Pixi hit-tests took 0.4 to 3.5 ms. They found the right Area on every tap, also for the tiny Areas.
  (source: `docs/adr/0004-area-map-rendered-with-pixijs.md`)
- MapLibre needs an explicit worker URL under Vite. Without it, it logs "Worker failed to load".
  (source: `docs/adr/0004-area-map-rendered-with-pixijs.md`)
- The prototype reads only the path commands `M`, `L` and `Z`. The contract ticket decides how
  curves work. (source: `docs/adr/0004-area-map-rendered-with-pixijs.md`)
- Our own code must handle pan, pinch and label hiding. Pixi has no label collision.
  (source: `docs/adr/0004-area-map-rendered-with-pixijs.md`)

> **Unverified:** phone behaviour, real path sizes, and sharpness of the base at high zoom.

## Open points

These points are open. (source: `conversation:2026-11-23`)

- The ticket "Phone check of the Pixi area-map prototype" can reopen the engine choice.
- Sharpness of the base at high zoom: one 4096 px texture or a tile pyramid.
- The path commands that `map-areas.svg` may use. The prototype reads only `M`, `L` and `Z`.
- Small Areas (`cortondo`, `inletgrotto`) may be too small to tap on a phone. The contract ticket
  and #16 decide how to mark them.
- `greatcraterofpaldea` has no shape. #16 decides the hint in the UI.
- The overlay page for the human check is not designed.
- The tool for tracing the base art is not chosen. VectorCraft is alpha.

## Related

- [Location data](../concepts/location-data.md)
- [Project decisions](project-decisions.md)
