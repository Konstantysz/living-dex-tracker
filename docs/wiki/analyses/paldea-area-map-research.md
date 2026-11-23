---
title: Paldea area map, research and decisions
type: analysis
sources: [docs/research/sources.md, docs/adr/0003-area-map-as-svg-data.md, src/games/sv/generated/locations.json, conversation:2026-11-23]
updated: 2026-11-23
---

# Paldea area map, research and decisions

The area map is not built yet. Issue #43 is a wayfinding map. It charts the decisions that issue #15
needs. #15 draws the SVG. #16 builds the renderer. #17 covers the other regions.
(source: `conversation:2026-11-23`)

The map has these tickets:

- Where do the area borders come from? Closed.
- Which reference lets a human place the 31 Areas? Closed.
- Which slugs get a path, and which get an exception? Open.
- Which render engine? Open.
- How good is the LPIPS gate for the base art? Open.
- What is the contract of the map files for #15? Open. Three tickets block it.

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

> **Note:** ADR 0003 describes the 1024×1024 picture that we have. Serebii serves tiles up to 4096
> px. The two do not contradict. ADR 0004 must say which one is the reference for the base art.

## Reference maps for a human

A human draws our own Area shapes (the fallback of ADR 0003). The human looks at two references.
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

PokéMaps is the quality bar for our map. A visitor test found these facts.
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
  share one scale.
- The map has two layers in one coordinate system. `map-base.svg` is the terrain art. `map-areas.svg`
  has one `<path id="<slug>">` per Area. A human checks the Areas on an overlay.
- LPIPS is the quality gate for the base art only. The tool lives in `scripts/`, outside
  `package.json`.
- The owner chose a Canvas or WebGL renderer for the slippy map, with touch from version one. A
  prototype ticket compares engines. It must include SVG with a CSS transform as the baseline,
  because PokéMaps uses it.
- ADR 0004 replaces ADR 0003 when the engine ticket closes.

## Open points

- `areazero` and `greatcraterofpaldea` are two Serebii slugs. PokéMaps has one shape for both.
- Seas, caves, `pokemonleague` and `cortondo` need a decision: path, point marker or no mark.
- The overlay page for the human check is not designed.
- The tool for tracing the base art is not chosen. VectorCraft is alpha.

## Related

- [Location data](../concepts/location-data.md)
- [Project decisions](project-decisions.md)
