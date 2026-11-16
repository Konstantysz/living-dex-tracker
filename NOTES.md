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
