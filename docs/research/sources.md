# Sources for SV game data

Read this file before you research which forms or species belong to a dex.

## Where a fact lives

| Question                                                                    | Source                                                                                                                                                                                                        |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Is a species in the Paldea, Kitakami or Blueberry dex, and at which number? | `scripts/cache/<sha>/pokemon_dex_numbers.csv`: columns `species_id,pokedex_id,pokedex_number`; pokedex 31 = Paldea, 32 = Kitakami, 33 = Blueberry. This file decides placement.                               |
| How is a form obtained (wild, trade, gift, breeding, evolution)?            | Serebii per species: `https://www.serebii.net/pokedex-sv/<species>/`                                                                                                                                          |
| Which species are in each dex?                                              | Serebii `paldeapokedex.shtml`, `kitakamipokedex.shtml`, `blueberrypokedex.shtml` (under `/scarletviolet/`). They list species only; form names appear as image suffixes (`-a` Alola, `-g` Galar, `-h` Hisui). |
| Where is a Paldea area on the map?                                          | Bulbagarden Archives: `https://archives.bulbagarden.net/wiki/File:Paldea_<Area_Name>_Map.png` (one area outlined, 30 of 31) and `File:Paldea.png`. See "Area map references".                                 |
| Where is a Paldea area on the map (second reference)?                       | PokéMaps: `https://pokemaps.net/maps/sv/paldea/`. Its "Area outlines" option draws the border of every area. See "Area map references".                                                                       |
| Anything else                                                               | Pokémon Wiki, Pokepedia, game8. Bulbapedia returns 403 to `WebFetch`; read it through `WebSearch` snippets.                                                                                                   |

## How to read the pages

- `WebFetch` summarises only the first 100,000 characters. Location tables and "Alternate Forms" are far down: call again with `offset`.
- Give each fetch one narrow question (one species, one dex).

## Area map references

Approved by the owner on 2026-11-23, for the Paldea area map (issues #15 and #49). Findings: branch
`research/paldea-area-sources-other`, file `docs/research/paldea-area-sources-other.md`.

- Use: a human examines the files to draw our own paths. Do not trace the outlines automatically. Do not copy the files, or any part of them, into the repository or the app.
- Store the downloads only in a git-ignored cache.
- Terms: the files are game screenshots ("fair use" on each file page). The site text is CC BY-NC-SA 2.5. `robots.txt` allows `/wiki/` and disallows `/w/`. Crawl delay is 5 seconds.
- Coverage: 30 of the 31 Paldea slugs. `areazero` has no file, and no source shows its shape.
- Scale: `File:Paldea.png` is 3000×3000 px and fits the Serebii map. `game units = px × 5000 / 3000`.
- Neighbouring outlines do not match exactly. The human chooses one shared border.

PokéMaps (`pokemaps.net`), approved by the owner on 2026-11-23 as a second reference:

- Use: the same rule as above. A human examines the map to draw our own paths. Do not scrape its data, tiles or polygons. Do not copy them into the repository or the app.
- Terms: no licence and no statement about reuse. The imprint names a private, non-commercial fan project (Terastal.net, Germany). `robots.txt` disallows only `/internal/`.
- Embedding is blocked: the page sends `X-Frame-Options: SAMEORIGIN` and `frame-ancestors 'self'`. Link to it. Do not embed it.
- Coverage (a visitor test on 2026-11-23): "Area outlines" draws every area. 30 of our 31 Paldea slugs have a shape with a matching title.
- `greatcraterofpaldea` has no shape. The site shows it only as the subtitle of Area Zero.
- The geometry and the accuracy of the borders are not checked.
- The site names no source for its area shapes. It says only "Contains data from PokeDB".
- Deep links: `https://pokemaps.net/maps/sv/paldea/<slug>`. An area slug is the lowercase, hyphenated name without parentheses (`south-province-area-two`). A Pokémon slug is the lowercase name (`lechonk`).
- It also has maps of other games. Check it first for the later maps (Kitakami, Blueberry, Lumiose and other games).

## Rules for changing `config.ts`

- The owner's own sources and statements win over a research report.
- A form moves or disappears only when two sources agree, or the dex CSV and one source agree.
- Record each decision in `NOTES.md` with its source. Example of a wrong report: it put Tatsugiri forms in different dexes, but all three spawn at Casseroya Lake and the species has a number only in the Paldea dex.

## Sources for the area map (base art)

- **Serebii map tiles:** `https://www.serebii.net/pokearth/paldea/map/tile_{z}-{x}-{y}.png`. Zoom 3 is
  the maximum (8 by 8 tiles of 512 px, 4096 px). Zoom 4 and 5 return 404. The user approved it
  as an LPIPS reference. The cache is git-ignored (`scripts/cache/serebii/`). The user approved
  tracing the stitched tiles to SVG for the base art, and we commit the SVG (ADR 5). We never
  commit the tiles.
- **Bulbagarden Archives maps:** look only. Never copy or scrape them. The user approved two
  exceptions. On 2026-11-23, a spike of #45 traced a crop of `paldea.png` to test the LPIPS gate.
  Later the same day, the user approved patching gaps in the Serebii picture with `paldea.png`
  before the trace (ADR 5). The picture is in `scripts/cache/bulbagarden/` (git-ignored). Only the
  traced SVG enters the repo. A new source for the base art needs the user's approval.
- **PokéMaps (`pokemaps.net`):** look only. Link to it. Do not embed it. The site blocks embedding.
