---
title: Adding a new game
type: concept
sources: [README.md, src/games/index.ts, src/games/configs.ts]
updated: 2026-11-16
---

# Adding a new game

1. Create `src/games/<id>/config.ts` exporting a `GameConfig`. Copy the structure of the
   [SV game config](../entities/sv-game-config.md).
2. Add it to the `games` array in `src/games/configs.ts`.
3. Run `npm run data:build`. Read any "missing sprite" warnings.
4. Import the generated `layout.json` in `src/games/index.ts` and add it to `layouts`. The game
   then shows in the header selector and at `#<id>`.
5. Add a reference layout and a golden test like `scripts/golden.test.ts`. Add `packBoxes`
   expectations (boxes, slots, empty slots) for default options.

Never guess Pokémon data. Every fact comes from the config or the PokeAPI CSV files.
If the reference looks wrong, write it in `NOTES.md` and ask.

Known limit: step 4 is manual (the layout import map is typed by hand).
