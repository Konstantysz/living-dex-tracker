# Living Dex Tracker

A static web app that shows a planned Living Dex box layout (6 × 5 = 30 slots per box). You tick
the Pokémon you caught. Progress is stored in the browser (`localStorage`). There is no backend.

Games now: **Pokémon Scarlet/Violet** (Paldea + Kitakami + Blueberry).

## Run

```bash
npm install
npm run dev        # dev server
npm run build      # production build in dist/
npm test           # Vitest
npm run lint       # ESLint + Prettier check
npm run data:build # regenerate layout.json and sprites from PokeAPI
npm run data:locations # read SV locations from Serebii into locations.json
```

Open a game with a hash, for example `#sv`.

## Structure

```
reference/                  prototype, generator script and golden layout (do not edit)
scripts/                    build-time data generator (Node + tsx)
  pokeapi.ts                CSV download + cache, pinned PokeAPI commit SHA
  buildLayout.ts            pure function: GameConfig + CSV tables -> layout
  cache/<sha>/              committed CSV cache (offline builds)
src/core/                   game-independent engine: types, packBoxes, storage, search
src/games/<id>/config.ts    declarative rules of one game
src/games/<id>/generated/   layout.json made by data:build (committed)
src/games/index.ts          game registry
src/components/             React UI
public/sprites/             sprites downloaded by data:build (committed)
```

## Data pipeline

`npm run data:build` reads each game config, loads PokeAPI CSV files, writes
`src/games/<id>/generated/layout.json`, and downloads missing sprites. The CSV files come from a
pinned PokeAPI commit (`POKEAPI_SHA` in `scripts/pokeapi.ts`), so the result is reproducible. To
update the data, change the SHA, delete the old cache folder, run `data:build`, and check the
golden test.

`npm run data:locations` reads the Serebii species page of each SV entry (ADR 0001) and writes
`src/games/sv/generated/locations.json`. It sends at most 1 request per second and caches the raw
HTML in `scripts/cache/serebii/` (git-ignored). A full run with an empty cache takes 10 to 15
minutes. The date in the file is the download date of the oldest cached page. The parser (`scripts/serebii.ts`) stops on HTML it does not know. The log lists the
entries without data and the lines that it could not give to one entry.

## How to add a new game

1. **Config.** Create `src/games/<id>/config.ts` that exports a `GameConfig` (see
   `src/core/types.ts` and `src/games/sv/config.ts`). Set the dex list, forms, gender differences,
   regional and battle forms, extras, merged lines and label overrides.
2. **Register the config.** Add it to the `games` array in `src/games/configs.ts`.
3. **Generate data.** Run `npm run data:build`. It writes `src/games/<id>/generated/layout.json`
   and downloads the sprites. Read the "missing sprite" warnings, if any.
4. **Register the layout.** Import the JSON in `src/games/index.ts` and add it to `layouts`.
   The game now shows in the header selector and at `#<id>`.
   **Theme.** Create `src/games/<id>/theme.css` with one `:root[data-theme='<id>']` block that
   overrides the colour tokens in `src/styles.css` with values sampled from the game's PC box
   screen, and import it in `src/games/index.ts`. Without it, the game uses the fallback palette.
5. **Test.** Add a reference layout file and a golden test like `scripts/golden.test.ts`.
   Add `packBoxes` expectations (box count, slot count, empty slots) for the default options.

Do not guess Pokémon data. Every fact must come from the config and the PokeAPI CSV files.

## Layout rules

- Each species appears once, in the first dex that has it.
- Forms, females and regional forms follow their species directly, even when they come from DLC.
- Order in a group: base (♂) → female → native forms → HOME regional forms → battle forms.
- Slots run continuously. With "do not split small groups", a group of 2–6 that does not fit in
  the current box starts a new box. Larger groups flow across box boundaries.
- The extras box always starts a new box.

## License

MIT. Pokémon and sprites belong to their owners. Data and sprites come from PokeAPI.
