---
title: SV game config
type: entity
sources: [src/games/sv/config.ts, src/core/types.ts]
updated: 2026-11-22
---

# SV game config

`src/games/sv/config.ts` exports `svConfig: GameConfig`. It is the only place that describes the
game. The type is in `src/core/types.ts`.

| Field                | Content (SV)                                                              |
| -------------------- | ------------------------------------------------------------------------- |
| `dexes`              | pokedex 31 Paldea (`''`), 32 Kitakami (`K`), 33 Blueberry (`B`)           |
| `baseFormOverrides`  | wooper → `wooper-paldea`, tauros → `tauros-paldea-combat-breed`, minior → `minior-red`, alcremie → vanilla-cream-berry |
| `forms`              | native forms after the species (Vivillon 18 patterns, Rotom, Oricorio, Ogerpon masks, Alcremie, native regional forms of DLC species, …) |
| `nativeRegional`     | form ids that get kind `nreg`                                             |
| `genderDifferences`  | species that get a `<base>-female` slot                                   |
| `femaleForms`        | females that are separate forms: Oinkologne, Indeedee, Meowstic, Basculegion |
| `homeRegional`       | regional forms only through HOME (kind `reg`)                             |
| `battleForms`        | Mimikyu busted, Palafin hero, Eiscue noice, Morpeko hangry, Cramorant, Minior meteor, Terapagos |
| `extras`             | Galarian Articuno/Zapdos/Moltres (`xreg`), Pirouette Meloetta, Crowned Zacian/Zamazenta (`xbat`) |
| `mergedLines`        | Scatterbug+Spewpa+Vivillon, Flabébé+Floette+Florges                       |
| `labelOverrides`     | raw title-cased label → display label (e.g. "Paldea Combat Breed" → "Combat") |
| `formNames`          | forced labels: Wooper and Wooper ♀ "Johto", Tauros "Kanto"                |
| `toggleableForms`    | `alcremie`: non-base forms get kind `alc`                                 |
| `goForms`            | Vivillon patterns that need Pokémon GO: kind `go`                         |
| `dlcForms`           | forms that only a DLC gives: they move to that DLC dex, at the species number there |
| `exclusives`         | `S` Scarlet and `V` Violet with their exclusive species (source: Serebii exclusives page, 2026-11-21) |
| `collectibles`       | one set, `stake` "Słupki ruin": 4 shrines × 8 stakes, with Serebii image and mini-map links |

Config files may contain code. Alcremie forms are computed from lists of creams and sweets
(`slice(1)` drops the base form). Hand-written lists (`exclusives`, `collectibles`) have a comment
with the source URL and the date.

## Related

- [Layout rules](../concepts/layout-rules.md)
- [Adding a new game](../concepts/adding-a-new-game.md)
- [Generator and PokeAPI data](generator-and-pokeapi.md)
