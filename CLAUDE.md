# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Scripts are in `package.json`. Use `npm run check` (lint, typecheck, test) before you finish.
`npm test` also runs the tests in `scripts/`. `npx vitest run -t "<name>"` runs one test.

## Architecture

Static React app (no backend) for a Pokémon Living Dex box planner. Three layers; only the first
two are game-specific:

1. **Game config** — `src/games/<id>/config.ts` exports a declarative `GameConfig` (type in
   `src/core/types.ts`): dex list, forms, female forms, forms moved to a DLC dex (`dlcForms`),
   merged evolution lines, label overrides. This is the only thing to write for a new game.
   The app shows only what a player can store in the game's PC: HOME-only regional forms and
   battle forms stay in the data but are hidden (`keep` in `src/core/layout.ts`).
2. **Data generator** — `scripts/buildLayout.ts` is a pure function from a `GameConfig` and the
   PokeAPI CSV tables to `{ groups, extra, dlc }`. It started as a port of
   `reference/build_sv_layout_reference.py`, which is now historical.
   `npm run data:build` runs it and writes `src/games/<id>/generated/layout.json` (committed) and
   downloads sprites to `public/sprites/pokemon/…` (committed). CSVs are pinned to `POKEAPI_SHA` in
   `scripts/pokeapi.ts` and cached in `scripts/cache/<sha>/` (committed) so builds work offline.
3. **Engine + UI** — game-independent. `src/core/layout.ts` (`packBoxes`, `layoutBoxes`, option
   filters), `src/core/storage.ts` (per-game localStorage, backup code), `src/core/entry.ts`
   (labels, search, text export), `src/components/*`.

`src/games/configs.ts` (configs only) is deliberately separate from `src/games/index.ts` (registry
that imports the generated JSON) so scripts can import configs without loading generated data.
A new game needs: config → add to `configs.ts` → `data:build` → import its `layout.json` in
`index.ts` → `theme.css` with the PC box colours (imported in `index.ts`) → golden test (see README "Jak dodać nową grę" steps).

## Things that need care

- **`reference/sv-layout-golden.json` is a snapshot of the generator output.**
  `scripts/golden.test.ts` requires generator output (and the committed `layout.json`) to equal it,
  so it catches unintended data changes. After an intended change in `config.ts`, run
  `npm run golden:update` and review the diff; record the change in `NOTES.md`. Do not edit the
  other files in `reference/`. Entry `id`s are the "caught" keys and the backup-code payload, so
  they must not change.
- Do not guess Pokémon data — it comes from config + CSVs only. Sources and rules for changing
  forms: `docs/research/sources.md`. Dex numbers of a species:
  `scripts/cache/<sha>/pokemon_dex_numbers.csv` (pokedex 31 Paldea, 32 Kitakami, 33 Blueberry).
- Layout invariants are pinned by tests in `src/core/layout.test.ts` (box and slot counts, DLC
  dexes start on a new box, DLC forms follow their dex number, groups of 2–6 are not split when
  `noSplit` is on). Change the numbers there, nowhere else.
- Backup code = base64 of UTF-8 JSON array of ids, identical to the prototype. For `sv`,
  `storage.ts` also reads the prototype's old localStorage keys as a fallback.
- Updating PokeAPI data: change `POKEAPI_SHA`, delete the old `scripts/cache/<sha>/`, run
  `golden:update`, and review the diff.
- Component tests rely on `src/test-setup.ts`, which emulates `<dialog>.showModal()` for jsdom.
- UI strings are in Polish. Routing is by hash (`#sv`); `base: './'` keeps it working under the
  GitHub Pages sub-path (deployed by `.github/workflows/deploy.yml` on push to `main`).

## Workflow

- Before the first change, run `git fetch --prune`. If the current branch shows `[gone]`, start
  from an up-to-date `main`.
- Before a PR, run the `code-review` skill against `main`. The reviewer uses `CODING_STANDARDS.md`.
- To check UI in the browser pane, see `docs/agents/ui-verification.md`.

## Wiki

`docs/wiki/` is an LLM-maintained project wiki with its own schema in `docs/wiki/CLAUDE.md`.
Read that file before touching anything under `docs/wiki/`.

## Agent skills

### Issue tracker

GitHub Issues of `Konstantysz/living-dex-tracker`, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context (`GLOSSARY.md` and `docs/adr/` at the repo root). See `docs/agents/domain.md`.
