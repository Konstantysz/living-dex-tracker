# 1. Serebii is the source of location data

Status: accepted (2026-11-22)

## Context

The guide shows where to obtain each entry. PokeAPI has no encounter data for Scarlet/Violet or
Legends Z-A. The app is static and has no backend, so it cannot fetch data at run time.

## Decision

- Serebii is the single source of truth for locations. Its layout has been stable for many years.
- A build-time script (`npm run data:locations`, separate from `data:build`) reads the species pages
  `https://www.serebii.net/pokedex-sv/<species>/`. For each entry it takes, per version: the area
  names and their Pokéarth slugs, "Fixed" encounters and Tera Raid stars.
- Output: `src/games/sv/generated/locations.json` (committed). Raw HTML goes to
  `scripts/cache/serebii/` (git-ignored). Only parsed data goes into the repository.
- The script sends at most 1 request per second, with a generic User-Agent. `robots.txt` does not
  disallow `/pokedex-sv/` or `/pokearth/`.
- Regional forms get data only when Serebii separates them on the species page. Otherwise the entry
  has no location.
- Scarlet/Violet first. Legends Z-A later.

## Consequences

- A build with an empty cache needs the network and takes about 15 minutes.
- If Serebii changes its HTML, the parser breaks. The parser must fail loudly, not write empty data.
- The content is © Serebii.net. We publish only short facts (area names, slugs) and link back to
  Serebii.
