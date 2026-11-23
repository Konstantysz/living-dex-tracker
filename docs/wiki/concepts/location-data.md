---
title: Location data
type: concept
sources: [docs/adr/0001-serebii-as-source-of-location-data.md, scripts/serebii.ts, scripts/data-locations.ts, src/core/locations.ts, src/components/DetailsDialog.tsx, src/components/AreaList.tsx, src/components/MapTab.tsx, src/components/MapCanvas.tsx, src/core/areaMap.ts, scripts/golden.test.ts, .gitattributes, README.md, conversation:2026-11-22]
updated: 2026-11-23
---

# Location data

A Location tells where a player can obtain an entry in one game version. Now it holds only Areas.
Fixed encounters and Tera Raid stars come in later slices of #11. Serebii is the single source
(ADR 0001). PokeAPI has no SV encounter data. (source: `docs/adr/0001-serebii-as-source-of-location-data.md`)

## Script

`npm run data:locations` is separate from `npm run data:build`. It reads the Serebii SV dex lists
for the page slug of each species. Then it reads one species page per species. (source: `scripts/data-locations.ts`)

- It sends at most 1 request per second, with a generic User-Agent.
- It caches the raw HTML in `scripts/cache/serebii/`. Git ignores this folder.
- A full run with an empty cache takes 10 to 15 minutes. (source: `README.md`)
- The scrape date in the file is the download date of the oldest cached page.
- It writes `src/games/sv/generated/locations.json`. It does not write the file when a page has a
  parse error, or when no entry has data.

The first full scrape gave areas to 596 of 893 PC entries. Most entries without data evolve, breed
or come from a trade. (source: `conversation:2026-11-22`)

## Parser rules

`parseSpeciesPage` reads the "Locations" table of a species page. It stops on HTML that it does not
know, so a changed page never gives empty data. (source: `scripts/serebii.ts`)

- It stops when the table is missing, when a row is unknown, or when an HTML entity is unknown.
- It stops when a Pokéarth link has a format that it cannot read.
- It skips the "Fixed:", "Titan:" and "Tera Raid Battles:" lines. A later slice reads them.
- It skips the spawn biome rows and the Legends: Z-A rows.
- It reads area slugs with an apostrophe, for example `reveler'sroad`.

Serebii has an empty link on the Scyther page (Terarium). The parser drops it, so one area is
missing there. (source: `conversation:2026-11-22`)

## Matcher rules

`matchEntries` gives each line of the table to the entries that it names. It never invents data.
(source: `scripts/serebii.ts`)

1. The candidates are the entries of the species, without the DLC forms of other dexes.
2. A line whose note names a form, for example "(Bloodmoon)", goes to no entry.
3. A line with a form label goes to the one candidate whose form label starts the line label.
4. A line without a label goes to all candidates, only when they share one form label.
5. All other lines go to no entry. The build log lists them.

So some forms have no data, because Serebii does not separate them. Examples are the forms of
Vivillon, Rotom, Squawkabilly and Tatsugiri. (source: `conversation:2026-11-22`)

## Data and app

`areasFor(locations, id, version)` is the only function that reads the data shape. It returns the
Areas of one version, or of all versions without duplicates when the version is null. It returns
null when there is no data, never an empty list. (source: `src/core/locations.ts`)

The details dialog shows the Areas for the "Moja wersja" setting, or for both versions. It shows
"Źródło: Serebii", the scrape date and a link to the species page. An entry without data shows
"Brak danych — sprawdź na Serebii." (source: `src/components/DetailsDialog.tsx`)

The file has a normalized format (#35). `areas` is one Area table: slug to name, sorted by slug. An
entry holds `page` and `areas`. `areas` is one list of slugs when all versions are equal. Otherwise it
is an object with a list per version. An entry without data has no `areas` key. (source: `src/core/locations.ts`)

`buildLocations` in `scripts/serebii.ts` writes this shape. It stops when one slug has two names.
`formatLocations` writes one entry per line, so a new scrape changes only the lines of the entries
that changed. (source: `scripts/serebii.ts`)

The file is about 88 KB on disk. It was about 458 KB before #35. GitHub marks it as generated, so a
pull request collapses its diff. (source: `.gitattributes`, `conversation:2026-11-22`)

The file also has `regions`: area slug to Pokéarth region (`paldea`, `kitakami` or `terarium`). The
scraper reads the region from each Pokéarth link. `pokearthUrl` builds the link
`https://www.serebii.net/pokearth/<region>/<slug>.shtml`. The slug alone cannot give the region.
(source: `src/core/locations.ts`, `scripts/serebii.ts`, `conversation:2026-11-22`)

## Areas tab (#14)

The "Obszary" tab of the Guide lists the Areas for the "Moja wersja" setting. (source: `src/components/AreaList.tsx`)

- `missingByArea` counts the entries that the player has not caught in each Area. It sorts by that
  count, then by name. (source: `src/core/locations.ts`)
- An Area with missing entries opens to a list. A tap on an entry opens its details dialog. It does
  not toggle caught.
- An Area with no missing entries is one line, "kompletne".
- Each Area links to its Pokéarth page.
- `crowdedArea` finds the Area of an entry with the most missing entries. The details dialog shows
  a tip when this count is `MANY_MISSING` (10) or more.

## Map tab (#16)

The "Mapa" tab of the Guide shows the Areas on a PixiJS map. (source: `src/components/MapTab.tsx`,
`src/components/MapCanvas.tsx`)

- The tab shows only when every Paldea Area has a shape in `map-areas.svg` or is listed in `NO_PATH`.
  The tab lists an Area in `NO_PATH` as text under the map. (source: `src/games/index.ts`)
- The player picks an entry by search. Its Areas for "Moja wersja" light up.
- A tap on the map calls `hitTest`. The rules (sample points, `data-z`, tie-break) are in
  [ADR 0004](../../adr/0004-area-map-rendered-with-pixijs.md). (source: `src/core/areaMap.ts`)
- A tap on an Area lists its missing entries, as in the Areas tab.
- The base art uses the LODs 8, 4 and 2. The 9 fine tiles lie above them when the view touches 4
  tiles or fewer. Each tile file has a 5000-unit viewBox, so the app cuts the viewBox to the square
  of the tile (`tileRect`) before it makes the texture. The app keeps 4 tiles at most.
  (source: `src/core/areaMap.ts`, `src/components/MapCanvas.tsx`)
  > **Unverified:** a phone may run out of memory or drop frames with the tiles. Phone check #51
  > is open.
- The canvas has no keyboard control. The Areas tab is the route for a keyboard (owner decision).

## Checks

A data test reads `layout.json` and `locations.json` of each game that has location data. Every
area slug of an entry must be a key of the Area table. A version exclusive must have no Areas in the
other version. On the data before the Alolan fix
(#33), this test fails for Vulpix, Sandshrew and Sandslash. See [SV game config](../entities/sv-game-config.md).
(source: `scripts/golden.test.ts`)

## PokéMaps links (#50)

The Areas tab and the Details dialog link to [PokéMaps](https://pokemaps.net). We cannot embed it,
because the site blocks frames. We never copy its data. (source: `src/core/locations.ts`)

- An area link shows for a Paldea Area only. The slug is the lowercase hyphenated name. The
  Area `greatcraterofpaldea` links to `area-zero`.
- An entry link shows only when the entry has a Paldea Area. The slug comes from the species name,
  not from the Serebii page slug. Example: `great-tusk`, not `greattusk`.
- A test pins the slug rule. It also fails when a new name has an apostrophe, a period or a
  gender sign.

On 2026-11-23, a hand check loaded 11 of 12 sampled area slugs and 5 species slugs. The site
answers 200 for a wrong slug and shows an empty page. (source: `conversation:2026-11-23`)

> **Unverified:** about 330 entry slugs follow the rule but nobody loaded them.

## Related

- [UI behaviour](ui-behaviour.md)
- [SV game config](../entities/sv-game-config.md)
- [Generator and PokeAPI data](../entities/generator-and-pokeapi.md)
- [Project decisions](../analyses/project-decisions.md)
- [Paldea area map, research and decisions](../analyses/paldea-area-map-research.md)
