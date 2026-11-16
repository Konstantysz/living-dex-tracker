---
title: Generator and PokeAPI data
type: entity
sources: [scripts/pokeapi.ts, scripts/buildLayout.ts, scripts/data-build.ts, scripts/golden.test.ts]
updated: 2026-11-16
---

# Generator and PokeAPI data

Build-time Node/TypeScript scripts. Run with `npm run data:build` (uses `tsx`).

## Files

- `scripts/pokeapi.ts`: downloads CSV files, caches them, parses them (small RFC 4180 parser),
  downloads sprites.
- `scripts/buildLayout.ts`: pure function `buildLayout(config, tables)`. It is a port of
  [the reference script](../sources/sv-layout-script.md), driven by a `GameConfig`.
- `scripts/data-build.ts`: for each game config, writes
  `src/games/<id>/generated/layout.json` and downloads missing sprites. Prints warnings for sprites
  that do not exist upstream (SV: 0 missing).
- `scripts/golden.test.ts`: generator output equals the golden file, and the committed
  `layout.json` equals it too.

## Data pinning

- CSV files come from PokeAPI at a pinned commit: `e4f981e5cb03c1fe33d436b1ee8e1197fbb0af84`
  (`POKEAPI_SHA`). Cache folder: `scripts/cache/<sha>/` (committed, about 645 KB).
- Files used: `pokemon_dex_numbers`, `pokedexes`, `pokemon_species`, `pokemon`, `pokemon_forms`,
  `pokemon_species_names` (English names, language id 9).
- Why pinned: PokeAPI `master` can change, and then the golden test would fail without any change
  in this repo. To update: change the SHA, delete the old cache folder, run `data:build`, check
  the golden test.
- Sprites come from `PokeAPI/sprites` (`master`) into `public/sprites/pokemon/…` (about 2 MB,
  committed). File naming: `{id}.png`, `{id}-{form}.png` for cosmetic forms, `female/{id}.png`
  for females. The layout field `s` is used as a path as is.

## Fidelity notes

- Python `str.title()` is reproduced with a regex helper (capital letter after any non-letter).
- Species with equal dex numbers are ordered by species id compared as a string (as in Python).
- The male-marker logic and its oddities are ported literally: see
  [Reference quirks](../analyses/reference-quirks.md).
- The first run of the port matched the golden file exactly.
