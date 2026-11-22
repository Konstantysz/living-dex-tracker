# Notes on the reference

Things in `reference/` that look odd. The generator keeps them as they are, so the output stays
equal to `sv-layout-golden.json`. Please decide if any should change.

1. **Male marker logic** (`build_sv_layout_reference.py`, lines 86-91). The second `if` compares
   `fs` with `fs[:-7].replace('-female','')`. This is hard to read. It works for the current data.
2. **Dead code** (line 93). `('Kanto' if False else '')` always gives `''`.
3. **Minior has 8 entries** with default options. A group larger than 6 can be split across boxes,
   even when "do not split small groups" is on. This matches the prototype.
4. **Alcremie base form** is set in three places: `OVR`, `ALT[1:]` and the final loop.
   In the new code it is `baseFormOverrides`, a `slice(1)` in the config, and `toggleableForms`.
5. **Search** matches the number only by exact value (`145` does not find `1450`). Name matching
   is a substring match on the label with form and gender.
6. **Backup code** is base64 of UTF-8 JSON. Unknown ids are accepted on import and ignored in the
   progress count (the prototype does the same).
7. **Sprite paths** keep the upstream layout: `public/sprites/pokemon/...`, so `s` in the layout
   JSON is used as is.

## Changes to the golden fixture (approved)

- **Exeggutor-Alola and Qwilfish-Hisui** changed from kind `reg` to `nreg` in
  `sv-layout-golden.json`. Serebii lists both in the Blueberry Pokédex, so they are native to SV.
  Only `k` changed; ids and order are the same. The config now lists them in `forms` and
  `nativeRegional`.
- **Vivillon.** Serebii says Vivillon is locked to Fancy in SV; the other patterns need a Pokémon GO
  postcard. Poké Ball is not obtainable. The golden group changed: `vivillon-poke-ball` removed, and
  Meadow plus 17 patterns got the new kind `go` (shown only with the "go" option, default off).
  Fancy stays kind `form`.
- **Ogerpon.** Only the Teal Mask Ogerpon can be caught (Serebii). The three other mask forms are
  form changes through a held mask, so they are removed from the config and from the fixture.
- **DLC-only forms.** The Alolan, Galarian and Hisuian forms Serebii lists in the Blueberry dex
  (Diglett to Golem, Sandshrew, Vulpix, Slowpoke line, Qwilfish) also move to `dlc` with `B<n>`
  when the species group is in Paldea or Kitakami (Exeggutor already sits in Blueberry).
  Johto Wooper (and female), white-striped Basculin and Kanto Tauros leave
  their species group and go to the new top-level `dlc` list. `d` is the DLC prefix plus the
  species number in that dex (`K5` for Wooper, `K194` for Basculin, `B22` for Tauros). The app
  puts each form before the first entry of that dex with a higher number. The golden file has a new `dlc` key. Serebii lists Johto Wooper
  as a trade in Cascarrafa, but the owner says it is caught in Kitakami, so it is treated as DLC.
- **Round-2 research** (`docs/research/`, plus the owner's own sources). Hisuian Growlithe and
  Arcanine are obtainable in Kitakami (gift, evolution) and have numbers K78 and K79, so they moved
  to `dlc`. Galarian Meowth is a gift in the base game, but it is left out at the owner's request
  (Perrserker is in no SV dex). Alolan Meowth (League Club trade) and Alolan Persian are also left
  out for now: Meowth has no Blueberry number. They wait for a section of obtainable Pokémon that
  are in no dex (a GitHub issue is planned). Roaming Gimmighoul is not obtainable in SV (Pokémon GO transfer) and is removed.
  The research agent said Tatsugiri forms differ by dex; the owner showed that all three spawn at
  Casseroya Lake, so Tatsugiri stays in Paldea.
- **Hidden kinds.** `reg`, `bat`, `xreg` and `xbat` entries stay in the data but the app never shows
  them (they cannot be stored in the PC of the game).
- **Version exclusives.** Entries of species exclusive to Scarlet or Violet get `v: 'S' | 'V'`
  (Serebii exclusives page, 2026-11-21). Tauros is on both lists, so it has no mark. DLC forms
  have no mark. This only adds the `v` key; no id or order changes.
- **Alolan exclusives.** The Serebii exclusives page shows the Alolan forms of Vulpix, Ninetales,
  Sandshrew and Sandslash (icons `037-a` etc., Ice type), not the Kanto forms. The Kanto forms are
  in Kitakami in both games. So `exclusives` can now name an entry id: `vulpix-alola` and
  `ninetales-alola` get `v: 'S'`, `sandshrew-alola` and `sandslash-alola` get `v: 'V'`, and the
  Kanto forms lose their mark. No id or order changes.
