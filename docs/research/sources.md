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

## Sources for the area map (base art)

- **Serebii map tiles:** `https://www.serebii.net/pokearth/paldea/map/tile_{z}-{x}-{y}.png`. Zoom 3 is
  the maximum (8 by 8 tiles of 512 px, 4096 px). Zoom 4 and 5 return 404. The user approved it
  as an LPIPS reference. The cache is git-ignored (`scripts/cache/serebii/`). We publish nothing
  from it.
- **Bulbagarden Archives maps:** look only. Never copy, scrape or trace them into the repo. The user
  approved one exception on 2026-11-23: a spike of #45 traced a crop of `paldea.png` to test the
  LPIPS gate. The picture is in `scripts/cache/bulbagarden/` (git-ignored). No result of that trace
  enters the repo. A new source for the real base art needs the user's approval.
- **PokéMaps (`pokemaps.net`):** look only. Link to it. Do not embed it. The site blocks embedding.
