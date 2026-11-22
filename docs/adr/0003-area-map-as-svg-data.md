# 3. The area map is SVG path data, traced with help from an agent

Status: accepted (2026-11-22)

## Context

The guide gets an interactive map like Serebii Pokéarth (`/pokearth/paldea/`). Pokéarth area pages
have no wild Pokémon in their static HTML. Its spawn points come from JavaScript and are shown only
"within a radius". The map picture is game art.

## Decision

- First version: an area map. Select an entry and its areas light up. Click an area and see the
  entries that are not caught there. Spawn points are a separate research issue.
- We do not publish Serebii's or the game's map picture. We publish our own SVG:
  `src/games/sv/map.svg`, one `<path>` per area, `id` = area slug (see ADR 1).
- The path data does not depend on the renderer. The first renderer is SVG in the DOM (native hover,
  click, focus, accessibility, no new dependency). Canvas or WebGL comes in a separate issue, only for
  an effect that SVG cannot do (e.g. animated spawn points).
- The SVG is made semi-automatically: an agent traces the source picture with the VectorCraft MCP
  server, names the paths, and splits or joins regions. A human checks an overlay of the SVG on the
  source picture. The source picture stays in a git-ignored cache.
- A test checks that every area slug in `locations.json` has a path in `map.svg`.
- Paldea first. Kitakami, Blueberry Academy and Lumiose (Z-A) are later issues.

## Risks

- The tracer makes regions by colour. The 1024×1024 Paldea picture we have shows biomes, with no area
  borders and no labels, so tracing it alone does not give areas. The first step is a spike on one
  area. It must find where the borders come from, e.g. Serebii area pages
  (`/pokearth/maps/paldea/<n>.jpg`) that may show one area highlighted. If the spike fails, a human
  draws the areas by hand.
- VectorCraft is "alpha".
