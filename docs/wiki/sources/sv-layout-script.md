---
title: SV layout generator script and golden file
type: source
sources: [reference/build_sv_layout_reference.py, reference/sv-layout-golden.json]
updated: 2026-11-16
---

# SV layout generator script and golden file

`reference/build_sv_layout_reference.py` made the SV data from PokeAPI CSV files.
`reference/sv-layout-golden.json` is its output: `{ groups: [{ sp, items }], extra: [...] }`.

## Key facts

- It is the **source of the layout rules**: dex order, forms, females, regional and battle forms,
  merged evolution lines. See [Layout rules](../concepts/layout-rules.md).
- Dex order: PokeAPI pokedex ids 31 (Paldea, no prefix), 32 (Kitakami, `K`), 33 (Blueberry, `B`).
  Within a dex, entries sort by dex number, then species id as a string.
- Entry shape: `id, n, nat, name, form, g, k, s` (plus a temporary `fs` that is removed).
- The new generator is a faithful port: see
  [Generator and PokeAPI data](../entities/generator-and-pokeapi.md).
- The golden file is the test fixture: the generator output must equal it.
- Species and group counts in the generated data: 660 groups, 932 distinct sprites.

## Related

- [SV game config](../entities/sv-game-config.md) holds the script's tables as data.
- Odd details of the script: [Reference quirks](../analyses/reference-quirks.md).
