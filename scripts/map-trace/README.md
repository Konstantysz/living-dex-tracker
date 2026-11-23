# Trace the base art of the Paldea map (#15, ADR 5)

An agent makes `src/games/sv/map-base-*.svg` from the Serebii map tiles. The source picture and
all work files stay in `scripts/cache/serebii/` (git-ignored). Only the SVG files are committed.

You need: `uv`, and the VectorCraft MCP tools (`mcp__vectorcraft__*`).

## Steps

1. Make the source picture. It downloads 256 tiles and stitches them to 4096 px.

   ```
   uv run scripts/map-trace/stitch.py
   ```

2. Cut the inputs. LOD 8, 4 and 2 are 1/8, 1/4 and 1/2 of a 3000 px map. LOD 1 is 9 tiles of
   1000 px with 16 px overlap.

   ```
   uv run scripts/map-trace/prepare.py
   ```

3. Save four tracing presets in VectorCraft (`imageTrace.presets.save`, start from `Default`).
   All four use `mode` `color` and `palette` `automatic`.

   | Preset  | `colorDetail` | `noise` | Input folder (`scripts/cache/serebii/map-trace/in/`) |
   | ------- | ------------- | ------- | ---------------------------------------------------- |
   | `map-8` | 20            | 1       | `8`                                                  |
   | `map-4` | 20            | 1       | `4`                                                  |
   | `map-2` | 20            | 2       | `2`                                                  |
   | `map-1` | 50            | 3       | `1`                                                  |

4. Trace each folder with `addon.document.batchTraceFolder`. Use `expand: true` and
   `format: "svg"`. Set `destinationFolder` to `scripts/cache/serebii/map-trace/out/<lod>/`. Use
   absolute Windows paths.

5. Put the output into the contract of #48 (`viewBox="0 0 5000 5000"`, no raster):

   ```
   uv run scripts/map-trace/finish.py
   ```

6. Run `npx vitest run src/games/sv/map.test.ts`. Then run the LPIPS gate (see
   `docs/wiki/analyses/lpips-gate-findings.md`) and record the scores in `NOTES.md`.

## Draw the area paths (`map-areas.svg`)

A human draws the paths in the draw mode of the overlay page. No editor is needed.

1. Run `npm run map:overlay`. Open `scripts/cache/serebii/map-overlay.html` in a browser.
2. Pick a slug in the list. Press **D** (or **Draw**), then click the corners on the picture. Close
   the shape with **Enter** or a click on the first point. The list then moves to the next slug
   without a path.
3. To change a path, click it to select it. Drag a white point to move it. Drag a small grey point
   to add a corner. Right-click a white point to delete it.
4. **Snap** reuses a nearby corner of any path, so shared borders have no gap. Turn it off to
   draw free.
5. Controls: scroll zooms, a drag pans, **Ctrl+Z** undoes, **Esc** cancels, **Delete** removes the
   selected path.
6. The browser keeps the draft in `localStorage`. Click **Download map-areas.svg** and move the file
   to `src/games/sv/map-areas.svg`. Reload the page after `npm run map:overlay` to start from that
   file. **Reset to file** throws the draft away.

The `data-z` of each path comes from `AREA_Z` in `src/games/sv/mapAreas.ts`. Change it there.
When the file is complete, remove the two `it.skip` markers in `src/games/sv/map.test.ts`.

## Size of the result

About 17 MB for 12 files: LOD 8 1.0 MB, LOD 4 2.9 MB, LOD 2 4.5 MB, nine LOD 1 tiles 0.3 to 1.7 MB
each (8.8 MB).
