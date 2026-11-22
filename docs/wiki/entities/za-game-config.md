---
title: Z-A game config
type: entity
sources: [src/games/za/config.ts, scripts/za-boxes.test.ts, src/games/za/theme.css]
updated: 2026-11-22
---

# Z-A game config

`src/games/za/config.ts` exports `zaConfig: GameConfig` for Pokémon Legends: Z-A (hash `#za`). The
type is in `src/core/types.ts`. The fields have the same meaning as in the
[SV game config](sv-game-config.md).

| Field               | Content (Z-A)                                                                  |
| ------------------- | ------------------------------------------------------------------------------ |
| `dexes`             | pokedex 34 Lumiose (`''`), 35 Hyperspace (`H`)                                 |
| `baseFormOverrides` | vivillon → `vivillon-fancy`                                                    |
| `forms`             | Vivillon (Garden, Tundra), Flabébé line colours, Eternal Floette, Furfrou trims, Pumpkaboo and Gourgeist sizes, Rotom, regional forms (Alola, Galar, Hisui), … |
| `genderDifferences` | species that get a `<base>-female` slot                                        |
| `femaleForms`       | Meowstic, Indeedee                                                             |
| `mergedLines`       | Scatterbug+Spewpa+Vivillon, Flabébé+Floette+Florges                            |
| other fields        | empty: no HOME-only forms, battle forms, extras, exclusives or collectibles    |

## Source and check

- The forms come from the owner's screenshots of the in-game PC boxes (r/LegendsZA, 2026-11-21).
  (source: comment in `src/games/za/config.ts`)
- `scripts/za-boxes.test.ts` checks that every box holds 30 slots and ends at the dex number that
  the game prints on it, for Lumiose and for Hyperspace.
- Not in the data: Mega Evolutions (the boxes do not store them) and the "+1" slot after #232.

## Related

- [Architecture](../concepts/architecture.md)
- [Adding a new game](../concepts/adding-a-new-game.md)
