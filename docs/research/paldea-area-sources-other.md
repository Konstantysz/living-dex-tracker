# Non-Serebii references for the 31 Paldea areas (issue #49)

Date: 2026-11-23. Parent map: #43. Related: #44, ADR 0003,
`docs/research/paldea-area-borders.md` (branch `research/paldea-area-borders`).

## Verdict

Bulbagarden Archives has one "area highlighted" map per Paldea area. Each file is a crop of the
in-game Paldea map with a magenta outline around one area. The archive also has the full map
(`File:Paldea.png`, 3000×3000 px) in the same art.

I tested it. A script placed all 30 crops on the full map automatically (match score 0.998 to
0.999). The full map fits Serebii's tile map exactly. So each outline converts to game units
(0 to 5000) with one formula.

- Coverage: 30 of 31 Paldea slugs. `areazero` has no file.
- Recommendation: a human draws `map-areas.svg` from these 30 outlines, on an overlay in game
  units. This source is not approved yet. The owner must approve it (see "Approval needed").

## Ranked candidates

| Rank | Candidate                                                                                                                                     | Gives                                                                                                                                                                                                        | Coverage                                                        | Precision                                                                                                                     | Coordinates                                  | Licence / terms                                                                                                                                                          | Tested?                                                                                         | Effort                                                                      |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1    | Bulbagarden Archives "Area highlighted maps": `https://archives.bulbagarden.net/wiki/File:Paldea_<Area_Name>_Map.png`, plus `File:Paldea.png` | One crop per area with a magenta outline. Full map 3000×3000 px in the same art.                                                                                                                             | 30 of 31                                                        | Crop px = 1.85 full-map px = about 3.1 game units. Outline about 5 crop px thick. Borders of neighbours do not match exactly. | Crop px. Converts to game units (see below). | Each file page: "screenshot from a Pokémon game … the contributor claims this to be fair use". Site text: CC BY-NC-SA 2.5. robots.txt allows `/wiki/`, `Crawl-delay: 5`. | Yes, all 30 files and the full map.                                                             | Low: one script places all 30 outlines. A human still draws and reconciles. |
| 2    | Bulbapedia area articles, e.g. `https://bulbapedia.bulbagarden.net/wiki/South_Province_(Area_One)`                                            | Neighbour text, e.g. "west of South Province (Area Five) and east of South Province (Area Four). It connects to Cabo Poco to the south and Mesagoza to the north." The infobox shows the same map as rank 1. | Expected 31 (one article per area). Not counted.                | Text only: neighbours, no shape.                                                                                              | None.                                        | Same wiki, CC BY-NC-SA 2.5 for text.                                                                                                                                     | No. Read only through WebSearch snippets. `sources.md` says Bulbapedia returns 403 to WebFetch. | Low. Useful for a check, not to draw.                                       |
| 3    | Thonky area guides, e.g. `https://www.thonky.com/pokemon-scarlet-violet/south-province-area-one`                                              | Hand-drawn sketch maps with items and trainers ("Map by Thonky.com").                                                                                                                                        | Unknown. The sample shows only the south-east part of one area. | Low. A sketch with no scale and no grid.                                                                                      | None.                                        | "© 2026 Thonky.com". No reuse terms on the page.                                                                                                                         | Yes, one image (1881×979 px).                                                                   | High. Cannot be placed on the map automatically.                            |

## Rank 1 in detail: what I tested

### Files

The Paldea file category (`https://archives.bulbagarden.net/wiki/Category:Paldea_maps`, page 1)
lists files named `Paldea <Area Name> Map.png`. A file summary says, for example: "This is an
in-game map of the Paldea region from Pokémon Scarlet and Violet, with Cortondo highlighted."
The files are in the category "Area highlighted maps".

I downloaded the file page and the image for each of the 30 slugs below, with a pause of 5 s after
each request. All 30 exist. Pixel sizes (crop width × height):

| Slug                           | Bulbagarden name                       | Crop px            |
| ------------------------------ | -------------------------------------- | ------------------ |
| `alfornadacavern`              | Alfornada Cavern                       | 242×256            |
| `asadodesert`                  | Asado Desert                           | 511×310            |
| `casseroyalake`                | Casseroya Lake                         | 666×554            |
| `cortondo`                     | Cortondo                               | 166×150            |
| `dalizapapassage`              | Dalizapa Passage                       | 462×295            |
| `eastpaldeansea`               | East Paldean Sea                       | 426×748            |
| `eastprovinceareaone`          | East Province (Area One)               | 639×538            |
| `eastprovinceareatwo`          | East Province (Area Two)               | 495×379            |
| `eastprovinceareathree`        | East Province (Area Three)             | 626×379            |
| `glaseadomountain`             | Glaseado Mountain                      | 740×843            |
| `greatcraterofpaldea`          | Great Crater of Paldea                 | 519×529            |
| `inletgrotto`                  | Inlet Grotto                           | 156×158            |
| `northpaldeansea`              | North Paldean Sea                      | 1448×700           |
| `northprovinceareaone`         | North Province (Area One)              | 509×550            |
| `northprovinceareatwo`         | North Province (Area Two)              | 468×799            |
| `northprovinceareathree`       | North Province (Area Three)            | 364×280            |
| `pokemonleague`                | Pokémon League                         | 229×220            |
| `socarrattrail`                | Socarrat Trail                         | 362×246            |
| `southpaldeansea`              | South Paldean Sea                      | 1605×362           |
| `southprovinceareaone` … `six` | South Province (Area One) … (Area Six) | 375×341 to 546×438 |
| `tagtreethicket`               | Tagtree Thicket                        | 315×296            |
| `westpaldeansea`               | West Paldean Sea                       | 247×743            |
| `westprovinceareaone`          | West Province (Area One)               | 630×672            |
| `westprovinceareatwo`          | West Province (Area Two)               | 496×282            |
| `westprovinceareathree`        | West Province (Area Three)             | 425×540            |

The name matches our slug when you remove spaces, brackets and the accent, and write the number
as a word. This is true for all 30.

`areazero`: `File:Paldea_Area_Zero_Map.png` returns 404. The category has `Upper Area Zero.png`
(800×450), a screenshot, not a highlighted map. I found no highlighted map for Area Zero.

### Experiment 1: place each crop on the full map

Script (scratchpad, not in the repo): masked template match of each crop on `File:Paldea.png`.
The magenta outline is masked out. The script searches scale 1.70 to 2.00.

Result for all 30 crops:

- Match score (normalised cross-correlation): 0.9979 to 0.9992.
- Scale: 1.84 to 1.86 full-map px per crop px. No result was at the edge of the search range.
- By eye on an overlay of all 30 outlines: every outline sits on the right terrain. Example:
  `southprovinceareaone` encloses Los Platos and the coast south of Mesagoza.

### Experiment 2: link the full map to game units

I downloaded the 4 Serebii zoom-0 tiles (`/pokearth/paldea/map/tile_0-{x}-{y}.png`, 256 px each),
which are approved as a reference. I joined them to one 512×512 picture. Then I matched
`File:Paldea.png` against it.

Result: score 0.9998. The 3000 px map fits the 512 px picture at size 512 and offset (0, 0). The
two maps show the same square.

The #44 research says that 512 Serebii units = 5000 game units. So:

```
game_x = px_x × 5000 / 3000      game_z = px_y × 5000 / 3000
```

`px` is a pixel on `File:Paldea.png`. For a crop, first add the crop offset and multiply by the
crop scale (the script gives both).

### Experiment 3: do neighbouring outlines agree?

I filled each outline to a region and measured overlaps between pairs.

- Many neighbours overlap by 1 % to 20 % of the smaller area. Part of this is the thick outline.
  By eye, the outlines of neighbours often run parallel a few pixels apart, and sometimes cross.
  Each file is drawn on its own. The outlines are not one shared partition.
- Large overlaps are caves inside an area: `inletgrotto` is 98.8 % inside `southprovinceareaone`;
  `dalizapapassage` is 84.5 % inside `glaseadomountain`. `pokemonleague` overlaps
  `greatcraterofpaldea` (37 %) and `southprovinceareatwo` (36 %).
- The four seas are blocky rectangles that follow the coast. They overlap the land areas along
  the coast.

Effect: a human must decide one shared border where two outlines differ. The outlines are a
reference for drawing, not a finished partition.

### What I do not know

- How the outlines were made. The file pages say "in-game map … highlighted". They do not say if
  the game shows these borders or if an editor drew them. I did not check this in the game.
- If the outlines are correct. I have no second source with borders to compare them against.

## Other candidates (failed or low value)

| Candidate                                                                                         | What I did                   | Result                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| game8 area pages (`game8.co/games/Pokemon-Scarlet-Violet/archives/397303`)                        | One WebFetch                 | HTTP 402. Not tested. I did not try to bypass it.                                                                                                                                                                            |
| GamerGuides interactive map (`gamerguides.com/pokemon-scarlet-and-violet/maps/paldea-region-map`) | One WebFetch                 | The page loads the map with script. The filter list has point categories (Stakes, Locations, Pokémon …). No area polygons or area category in the page text. Tiles and marker data were not in the HTML. Not tested further. |
| PokémonDB location page (`pokemondb.net/location/paldea-south-province-area-one`)                 | One request                  | Encounter list only. No map image.                                                                                                                                                                                           |
| Wikimedia Commons                                                                                 | WebSearch                    | No Paldea map found. A Wikipedia mirror lists "Paldea region map.jpg" as non-free fair use. Official art is not free.                                                                                                        |
| GitHub `lincoln-lm/paldea-map-assets`                                                             | Repo metadata and file names | Map tiles for `sv-live-map`. No licence. No area data. Tiles not downloaded.                                                                                                                                                 |
| GitHub `Lincoln-LM/sv-live-map`                                                                   | Repo metadata and file names | GPL-3.0. A Tera raid den map tool. Has `den_locations.json`, no area polygons. Not downloaded.                                                                                                                               |
| GitHub `sebastian-ch/paldea-map`                                                                  | Repo metadata and file names | A Mapbox slippy map. No licence. Source files show no area data.                                                                                                                                                             |
| GitHub `Andrei243/antigravity-pokemon-test` `…/paldea/townmap.json`                               | Read the head of the file    | A fan engine's own town map: "every word is ours". A 45×28 cell grid of its own world. Not the game's geometry. Rejected.                                                                                                    |
| GitHub code search `southprovinceareaone`                                                         | `gh search code`             | Hits are encounter lists only. No polygons.                                                                                                                                                                                  |
| Reddit / forums                                                                                   | WebSearch                    | No labelled area-border map found.                                                                                                                                                                                           |

## Approval needed

`docs/research/sources.md` and #43 list the approved sources. Bulbagarden Archives is not on the
list for maps. Before a human uses rank 1, the owner must approve it.

- Use for a human to look at: the files are fair-use game screenshots on a public wiki. Looking at
  them to draw our own paths does not copy them. Keep the downloads in a git-ignored cache. Do not
  commit or publish them.
- Do not trace the outlines automatically into `map-areas.svg`. That copies Bulbagarden's work.
  A human draws our own paths and uses the outlines as a guide. This is my reading, not legal
  advice.

## Recommendation

1. Approve Bulbagarden Archives "Area highlighted maps" plus `File:Paldea.png` as the reference
   for #49.
2. Put the 30 files and the full map in a git-ignored cache (for example
   `scripts/cache/bulbagarden/`). Respect `Crawl-delay: 5`. Use only `/wiki/` and `/media/`
   paths.
3. On the overlay page, show each outline in game units (formula above) under our path. The human
   draws one shared border where two outlines differ.
4. Decide `areazero` separately. No reference shows its shape. It is below
   `greatcraterofpaldea`.
5. Precision target: within the outline width (about 15 to 20 game units) where neighbours agree.
   Where they disagree, the human chooses.

## Tools and requests

- Tools: `curl` (Git Bash), `uv run` with `opencv-python-headless` and `numpy`, `gh` (repo
  metadata, code search), WebSearch, WebFetch.
- Requests: Bulbagarden Archives about 75 (robots.txt, 3 category pages, about 36 file pages,
  33 images), with a pause of 5 s in the batch. Serebii: robots.txt and 4 zoom-0 tiles. Thonky: robots.txt and 1
  image. PokémonDB: robots.txt and 1 page. game8 and GamerGuides: 1 WebFetch each.
- Error: I made 1 request to a `/w/index.php` URL (the "next page" link of the category).
  Bulbagarden's robots.txt disallows `/w/`. I did not repeat it.
- All downloads and scripts are in the session scratchpad. Nothing from a third party is in the
  repository.
