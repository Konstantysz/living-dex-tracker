# Base art is a committed trace of the Serebii map picture

The Paldea area map (ADR 0003, ADR 0004) needs a base layer. We trace the Serebii map tiles (zoom 3, 8x8 tiles, stitched to 4096 px) to SVG with VectorCraft and commit the SVG files. A trace of a game picture is a copy in vector form. The owner accepts this risk. We chose it over drawing our own art, because the trace looks like the game map and the work is small.

Rules:

- The source picture stays in the git-ignored cache. Only the traced SVG files are committed. No raster image is committed.
- Where Serebii has no tile or a blank area, we patch the stitched picture from the Bulbagarden Archives `Paldea.png` (3000 px, scaled by 4096/3000). We patch whole rectangles, never a mix inside one tile. Each patched rectangle (in game units) is recorded in `NOTES.md`.
- The fine LOD is traced from the picture downscaled to 3000 px, in 3x3 tiles with a 16 px overlap. The tested LPIPS and size numbers come from this setup.

The trace is hard to remove from git history. A history rewrite is the only way.
