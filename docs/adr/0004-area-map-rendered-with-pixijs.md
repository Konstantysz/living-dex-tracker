# 4. The area map is rendered with PixiJS from two SVG files

Status: accepted (2026-11-23). Replaces the renderer parts, the tracer part and the file name
`map.svg` of ADR 3. The phone check (issue "Phone check of the Pixi area-map prototype") can reopen it.

## Context

ADR 3 chose SVG in the DOM as the first renderer. Later work changed the target. The map must pan
and zoom, show markers and filters, and work by touch from version one. It must use Canvas or WebGL.

An engine ticket compared MapLibre GL, PixiJS and plain Canvas 2D in a prototype. The branch is
`prototype/area-map-engines` and the page is `prototype-map.html`. All three engines read the same
stand-in for `map-areas.svg`. The prototype generates the shapes in code. It writes them as an SVG
string and parses that string. It is not a drawn map.

The stand-in has these parts:

- 30 paths in game coordinates 0 to 5000: 4 seas, 20 land areas, 4 nested areas and 2 tiny areas
  of about 76 units
- 300 markers
- a 4096 px raster base

## Decision

- The render engine is **PixiJS v8** (WebGL). `pixi.js` becomes a production dependency when the
  renderer issue builds the map. The prototype's own `View` class (pan, pinch, wheel) is a model for
  the gesture code, to be rewritten, not copied.
- **Coordinate system:** game units, 0 to 5000, y down. `map-base.svg` and `map-areas.svg` share one
  `viewBox="0 0 5000 5000"`. In Pixi one `Container` holds the base, the areas and the outlines. Its
  position and scale are the camera. Markers and labels are in screen space (constant size).
- **Data format:** the files stay SVG. At load, the app converts each `<path id>` to a polygon (an
  array of x,y numbers), keeps `data-z` as draw order, and gives the polygons to Pixi `Graphics`.
  The prototype converts only `M`, `L` and `Z`. The map-file contract must either limit `map-areas.svg`
  to those commands or name a flattening step for curves.
- **Enclaves (2026-11-23, #15):** some Areas lie inside another Area on the same level, for example
  Socarrat Trail inside Casseroya Lake and Cortondo inside South Province Area Two. The parent path
  has one more ring for each enclave: same corners, opposite winding. The enclave has the same
  `data-z` as its parent (1). The renderer must read a path as a list of rings and cut the extra
  rings out of the shape (a hole), so a tap in the enclave never hits the parent. The table is
  `ENCLAVES` in `src/games/sv/mapAreas.ts`, and `map.test.ts` pins it. A layer above its parent (a
  cave, a tiny Area) is not an enclave. It keeps a higher `data-z` and no hole.
- **Hit-test:** Pixi's own event system (`rootBoundary.hitTest`). Sample the tap point and 4 points at
  12 px around it. Take the area with the highest `z`. This picked the right area on every tap in the
  prototype, including the tiny areas.
- **Labels:** Pixi `Text` in screen space. A label is hidden when the larger side of its area is 50 px
  or less on screen.
  Pixi has no label collision. The renderer issue decides if that is enough.

## Results (desktop Chrome, pane visible, 8 s pan and zoom, 300 markers)

| Engine   | Mode                           | Init       | Avg frame | p95  | Max | Frames over 33 ms |
| -------- | ------------------------------ | ---------- | --------- | ---- | --- | ----------------- |
| MapLibre | normal                         | 392 ms     | 16.7 ms   | 16.8 | 17  | 0/480             |
| Pixi     | normal                         | 446 ms     | 16.7 ms   | 16.8 | 17  | 0/480             |
| Canvas   | normal                         | 20 ms      | 28.2 ms   | 50.1 | 150 | 117/284           |
| MapLibre | stress (5,000 points per area) | 12 to 35 s | not valid |      |     |                   |
| Pixi     | stress                         | 131 ms     | 16.7 ms   | 16.8 | 17  | 0/480             |
| Canvas   | stress                         | 25 ms      | 42.1 ms   | 66.8 | 200 | 151/190           |

Hit-test time: Pixi 0.4 to 1.0 ms (normal), 0.6 to 3.5 ms (stress). Canvas under 0.1 ms. MapLibre 0.6
to 3.4 ms (normal), not measured in stress mode.

## Why not the others

- **MapLibre:** fine in normal mode, and it gives gestures and label collision for free. But it needs
  an explicit worker URL under Vite (`setWorkerUrl`, else "Worker failed to load"). With 150k points
  it took 12 to 35 s to show the map, because it cuts GeoJSON into tiles in a worker. Its frame
  timer also did not show that cost. It fits a geographic map better than a game map.
- **Plain Canvas 2D:** the quickest to start and to hit-test, and it needs no dependency. But a full
  redraw every frame dropped to 36 fps (normal) and 24 fps (stress), with spikes to 200 ms. Culling
  and caching could fix this, but they are code we would write and keep.

## Not tested, so open

- **Phone.** No test of pinch feel, finger-sized taps or sharpness on a real phone. The renderer
  issue must test them before it relies on this ADR. If the phone fails, reopen the engine choice.
- **Real paths.** The stand-in is synthetic. 5,000 points per area is a hard upper bound. Hand-drawn
  paths are likely much smaller.
- **Raster sharpness at high zoom.** The prototype uses one 4096 px texture with mipmaps. A tile
  pyramid (like PokéMaps) was not tried.
- **Gestures.** No inertia, no rotation lock, no keyboard use. These are for the renderer issue.

## Still valid from ADR 3

An own SVG, not the game's picture. One path per area, `id` = area slug. A test that every area slug
has a path or is a listed exception. Paldea first. The tracer part (VectorCraft) is replaced by the
decisions on the map: a human draws the areas.
