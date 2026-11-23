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

## Size of the result

About 17 MB for 12 files: LOD 8 1.0 MB, LOD 4 2.9 MB, LOD 2 4.5 MB, nine LOD 1 tiles 0.3 to 1.7 MB
each (8.8 MB).
