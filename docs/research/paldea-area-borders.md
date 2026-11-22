# Where do Paldea area borders come from? (issue #44)

Date: 2026-11-22. Parent map: #43. Related: ADR 0001, ADR 0003.

## Verdict

The spike fails. The approved sources do not give area borders.

- `/pokearth/maps/paldea/<n>.jpg` files are in-game screenshots. They do not show a map. They do not
  highlight an area.
- The marker data of `pokearth/paldea/` has no area names. A marker has a position and a spawn-table
  ID only. A spawn table lists Pokémon with Biomes and Location (Land, Water, Flying).

Recommendation: use the fallback in ADR 0003. A human draws the 31 Paldea areas by hand on the
overlay page. Do not trace `<n>.jpg` files.

## Scope: 31 Paldea areas

`src/games/sv/generated/locations.json` has 54 area slugs. `regions` marks 31 of them as `paldea`:

`alfornadacavern`, `areazero`, `asadodesert`, `casseroyalake`, `cortondo`, `dalizapapassage`,
`eastpaldeansea`, `eastprovinceareaone`, `eastprovinceareatwo`, `eastprovinceareathree`,
`glaseadomountain`, `greatcraterofpaldea`, `inletgrotto`, `northpaldeansea`,
`northprovinceareaone`, `northprovinceareatwo`, `northprovinceareathree`, `pokemonleague`,
`socarrattrail`, `southpaldeansea`, `southprovinceareaone` … `southprovinceareasix` (6),
`tagtreethicket`, `westpaldeansea`, `westprovinceareaone`, `westprovinceareatwo`,
`westprovinceareathree`.

The other 23 slugs are `kitakami` or `terarium` (Blueberry). They are out of scope.

Note: `cortondo` is a town, but it is an area slug in our data. `pokemonleague`, `areazero`,
`inletgrotto`, `alfornadacavern` and `dalizapapassage` are small places or caves. The four
`…paldeansea` slugs are open water. A human must decide what shape these get.

## Spike: `/pokearth/maps/paldea/<n>.jpg`

Requests (3 in total, with a pause of 3 s):

| n   | HTTP | Size      | Pixels  | Content                                                         |
| --- | ---- | --------- | ------- | --------------------------------------------------------------- |
| 1   | 200  | 787 bytes | 640×1   | Empty strip. Probably a placeholder.                            |
| 2   | 200  | 58,328 B  | 640×360 | In-game screenshot of a town street. Minimap in the corner.     |
| 10  | 200  | 42,057 B  | 640×360 | In-game screenshot of a lake and cliffs. Minimap in the corner. |

Facts:

- The images are third-person screenshots of the player at a place. They are not a top-down map.
- No image shows an area border or a highlighted area.
- The minimap in the corner is about 100 px wide. It shows no border and no area name.
- Resolution is 640×360. This is too small to trace a border, even if one were there.

Coverage of Paldea areas by this source: 0 of 31.

### Mapping from `<n>` to a slug

The images do not say which area they show. The page `pokearth/paldea/` does not link to any
`maps/paldea/<n>.jpg` (0 matches in its HTML). The mapping is probably in the area pages
(`/pokearth/paldea/<slug>.shtml`). These pages are not approved sources, so I did not read them.
Because the images have no borders, the mapping has no value for this issue. I did not research it
more.

## Data and script of `pokearth/paldea/`

One request to `https://www.serebii.net/pokearth/paldea/` (436 KB HTML) and one to
`/pokearth/paldea/spawntable/1.txt`.

### Map engine

- Leaflet 1.7.1, `crs: L.CRS.Simple`, zoom 0 to 3.
- Correction to #43: the map is not one flat raster. It is a tile layer:
  `/pokearth/paldea/map/tile_{z}-{x}-{y}.png`. At zoom 3 the bounds are 4096×4096 px
  (`map.unproject([0, 4096] / [4096, 0], maxZoom)`).
- Game coordinates go to map coordinates with `cvert`: `x * 512/5000` and `-z * 512/5000`. So 5000
  game units = 512 map units at zoom 0 = 4096 px at zoom 3. The `y` value (height) is not used.

### Markers

- `pmarkers` is one inline array with 2524 records. Each record has exactly four keys: `coords`
  (`[x, y, z]` game units), `icon`, `tableID`, `layer`. No record has a name or an area.
- Marker kinds: `laySymbol` 536, `layPokeball` 323, `layCoin` 306, `layRaid` 300, `layViolet` 275,
  `layTrainer` 271, `layScarlet` 232, `layTera` 68, `layFly` 68 (34 fly, 34 PC), and some others.
- Coordinate range: x 61 to 4875, z 375 to 4875. The standard-spawn markers (`layPokeball`) sit on
  a 250-unit grid (for example x 1375, 1625, 1875; z 3875, 4125, 4375).
- A click loads `/pokearth/paldea/spawntable/<tableID>.txt`. That file is an HTML table. It lists
  Pokémon, Level, Biomes (for example "Forest", "Lake, River, Swamp") and Location ("Land", "Water",
  "Flying"). It has no area name.
- `pokeFilter` maps a species number to a list of `tableID`s. It has no area name.

Result: the claim in #43 is confirmed. Marker data has no area names.

### Where area names do appear

The page has a `<select>` navigation menu with 56 Paldea entries. It lists all 31 area slugs and
also towns, academies, squad bases and research stations, in alphabetical order, as
`/pokearth/paldea/<slug>.shtml`. The menu has no coordinates and no shapes.

## Can the markers give borders indirectly?

Not with the approved data. A border would need a link from a marker to an area. No such link
exists in the data. Biomes cross area borders, so a biome is not an area.

## Recommendation

1. Draw the 31 Paldea areas by hand. Use the overlay page from #43 on the biome picture or on the
   map tiles (in the git-ignored cache).
2. Use game coordinates as the coordinate system of `map-areas.svg`: the range 0 to 5000 on x and z.
   Then the Serebii markers and our paths fit with one scale factor (`512/5000` per zoom-0 unit).
3. The human needs a reference for where each area is. The approved sources do not give one. Ask the
   owner to approve one more source, for example the in-game town map with area labels or the
   Serebii area pages `/pokearth/paldea/<slug>.shtml`. I did not read these pages.

## Open risks

- Without a new approved reference, the human draws the borders from memory of the game. The
  precision is low, and a test cannot check it.
- Seas, caves and small places (`areazero`, `pokemonleague`, `inletgrotto`, `alfornadacavern`,
  `dalizapapassage`, `cortondo`) need a decision: polygon, point, or no shape.
- `areazero` and the caves are below the surface. A top-down shape can overlap the areas above them.
- I checked only 3 of the `<n>.jpg` values. Some other `<n>` can be a different kind of image. The
  two non-empty samples were the same kind (screenshot, 640×360), so this is unlikely.

## Cache

All downloads are in `scripts/cache/serebii/pokearth/` (git-ignored by `scripts/cache/serebii/`).
Nothing from Serebii is in the repository.
