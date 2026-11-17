# Sources for SV game data

Read this file before you research which forms or species belong to a dex.

## Where a fact lives

| Question                                                                    | Source                                                                                                                                                                                                        |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Is a species in the Paldea, Kitakami or Blueberry dex, and at which number? | `scripts/cache/<sha>/pokemon_dex_numbers.csv`: columns `species_id,pokedex_id,pokedex_number`; pokedex 31 = Paldea, 32 = Kitakami, 33 = Blueberry. This file decides placement.                               |
| How is a form obtained (wild, trade, gift, breeding, evolution)?            | Serebii per species: `https://www.serebii.net/pokedex-sv/<species>/`                                                                                                                                          |
| Which species are in each dex?                                              | Serebii `paldeapokedex.shtml`, `kitakamipokedex.shtml`, `blueberrypokedex.shtml` (under `/scarletviolet/`). They list species only; form names appear as image suffixes (`-a` Alola, `-g` Galar, `-h` Hisui). |
| Anything else                                                               | Pokémon Wiki, Pokepedia, game8. Bulbapedia returns 403 to `WebFetch`; read it through `WebSearch` snippets.                                                                                                   |

## How to read the pages

- `WebFetch` summarises only the first 100,000 characters. Location tables and "Alternate Forms" are far down: call again with `offset`.
- Give each fetch one narrow question (one species, one dex).

## Rules for changing `config.ts`

- The owner's own sources and statements win over a research report.
- A form moves or disappears only when two sources agree, or the dex CSV and one source agree.
- Record each decision in `NOTES.md` with its source. Example of a wrong report: it put Tatsugiri forms in different dexes, but all three spawn at Casseroya Lake and the species has a number only in the Paldea dex.
