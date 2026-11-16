---
title: Reference quirks
type: analysis
sources: [NOTES.md, reference/build_sv_layout_reference.py, reference/sv-artifact-template.html]
updated: 2026-11-16
---

# Reference quirks

Odd details found in the reference files. The generator keeps them, so the output equals the
golden file. The user should decide if any must change. Full list: `NOTES.md`.

1. **Male-marker logic** (script lines 86–91) is hard to read. It works for current data.
2. **Dead code** (line 93): `('Kanto' if False else '')` always gives `''`.
3. **Minior has 8 entries** with default options. A group larger than 6 can split across boxes
   even with "do not split small groups". This matches the prototype.
4. **Alcremie base form** is set in three places in the script (`OVR`, `ALT[1:]`, final loop).
   In the new code: `baseFormOverrides`, `slice(1)` in the config, and `toggleableForms`.
5. **Search** matches numbers exactly and names as substrings. See
   [UI behaviour](../concepts/ui-behaviour.md).
6. **Backup import** accepts unknown ids. See [Backup code and storage](../concepts/backup-and-storage.md).
7. **Sprite paths** keep the upstream layout under `public/sprites/pokemon/`.

Related: [SV layout script](../sources/sv-layout-script.md), [SV prototype](../sources/sv-prototype.md).
