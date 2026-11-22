---
title: Location data
type: concept
sources: [docs/adr/0001-serebii-as-source-of-location-data.md, scripts/serebii.ts, scripts/data-locations.ts, src/core/locations.ts, src/components/DetailsDialog.tsx, scripts/golden.test.ts, .gitattributes, README.md, conversation:2026-11-22]
updated: 2026-11-22
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

Planned change (source: `conversation:2026-11-22`):

- #36: a change summary after each scrape, to paste into the pull request.

## Checks

A data test reads `layout.json` and `locations.json` of each game that has location data. Every
area slug of an entry must be a key of the Area table. A version exclusive must have no Areas in the
other version. On the data before the Alolan fix
(#33), this test fails for Vulpix, Sandshrew and Sandslash. See [SV game config](../entities/sv-game-config.md).
(source: `scripts/golden.test.ts`)

## Related

- [UI behaviour](ui-behaviour.md)
- [SV game config](../entities/sv-game-config.md)
- [Generator and PokeAPI data](../entities/generator-and-pokeapi.md)
- [Project decisions](../analyses/project-decisions.md)
