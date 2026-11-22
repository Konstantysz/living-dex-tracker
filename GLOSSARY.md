# Glossary

Domain terms of the Living Dex tracker. The documentation is in English. The UI is in Polish, so
each term also has its Polish UI name. Use these terms in code, issues and docs. Do not use the
"Avoid" synonyms.

Terms marked _(planned)_ name features that are not built yet.

| Term (EN)                  | UI name (PL)     | Meaning                                                                                                                          | Avoid                        |
| -------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Entry                      | Wpis             | One slot to fill: a species form (base, female, regional, etc.). Its `id` is the key in the caught set and in the backup code.   | slot (for the data), pokemon |
| Caught set                 | Złapane          | The set of entry ids the player marked as caught. Stored per game in localStorage.                                               | progress, save               |
| Group                      | Grupa            | Entries of one evolution line (after `mergedLines`), kept together in a box.                                                     | family, chain                |
| Dex                        | Pokédex          | A regional dex of the game (Paldea, Kitakami, Blueberry; Lumiose and Hyperspace in Z-A).                                         | region                       |
| Version exclusive          | Ekskluzyw        | A species that one version of the game (e.g. Scarlet) has and the other does not.                                                | exclusive pokemon            |
| Badge _(planned)_          | Odznaka          | An award computed from the caught set, e.g. a full group, a full dex, all entries of a type. Never stored.                       | achievement, trophy          |
| Ruin stake _(planned)_     | Kołek            | One of 32 collectibles (8 per shrine) that unlock a Treasure of Ruin. Its id (`stake:<shrine>-<n>`) is stored in the caught set. | wedge, collectible           |
| Shrine _(planned)_         | Świątynia        | One of the 4 Treasures of Ruin shrines. Opens when its 8 stakes are pulled.                                                      | ruin, temple                 |
| Area _(planned)_           | Obszar           | A named place on the game map. Its key is the slug from the Serebii Pokéarth URL (e.g. `eastprovinceareaone`).                   | zone, location               |
| Location _(planned)_       | Miejsce złapania | Where an entry can be obtained in one version: areas, fixed encounters, Tera Raid stars. Data from Serebii.                      | spawn, habitat               |
| Tip _(planned)_            | Porada           | A hint computed from the caught set and locations, e.g. "evolve X you have", "breed X".                                          | guide (for one hint)         |
| Guide _(planned)_          | Poradnik         | All help for obtaining entries: locations, tips, the map.                                                                        | walkthrough                  |
| Details dialog _(planned)_ | Szczegóły        | The dialog of one entry. Desktop: "i" button on hover or right click. Phone: long press.                                         | modal, popup                 |
| Area map _(planned)_       | Mapa             | The interactive game map. Areas are SVG path data with `id` = area slug.                                                         | world map                    |
