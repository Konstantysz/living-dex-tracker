# 5. The base art is a committed trace of the Serebii map

Status: accepted (2026-11-23). Replaces the rule in ADR 3 that we do not publish the game's map
picture, and the Serebii and Bulbagarden rules in `docs/research/sources.md`.

## Context

The area map (ADR 3, ADR 4) needs base art under the area paths. The options were our own drawn art
or a vector trace of the Serebii map tiles. The owner chose the trace. It looks like the game map,
and the work is small. The risk is copyright: a trace of a game picture is a copy in vector form.
The owner accepts this risk.

## Decision

- The source picture is the Serebii map tiles at zoom 3, stitched to 4096 px. See
  `docs/research/sources.md`. An agent traces it to SVG with VectorCraft and we commit the SVG files.
- The source picture stays in a git-ignored cache. We commit no raster image of the base art.
- If Serebii has no tile or a blank area, we patch the source picture from the Bulbagarden Archives
  `Paldea.png`. We patch whole rectangles, never a mix inside one tile. Each patched rectangle (in
  game units) goes into `NOTES.md`.
- The fine LOD is traced from the source picture downscaled to 3000 px, in 3x3 tiles with a 16 px
  overlap. The measurements and the gate numbers for this setup are in
  `docs/wiki/analyses/lpips-gate-findings.md`. They are not part of this decision.
- The Serebii zoom-3 grid is 16 by 16 tiles of 256 px. All 256 tiles exist and none is blank, so no
  rectangle needs a patch.

## Consequences

A trace in git history is hard to remove. Only a history rewrite removes it.

The gate in `docs/wiki/analyses/lpips-gate-findings.md` is not met by four of the nine fine tiles.
The cause is the striped deep sea, which the trace makes one flat colour. The owner accepted the
scores as measured on 2026-11-23. The numbers are in `NOTES.md`.
