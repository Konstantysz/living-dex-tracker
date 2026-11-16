# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev                     # Vite dev server
npm run build                   # tsc -b && vite build
npm test                        # vitest run (all tests, incl. scripts/ and src/)
npx vitest run src/core/layout.test.ts          # one test file
npx vitest run -t "Paldea-only"                 # one test by name
npm run lint                    # eslint + prettier --check (both must pass)
npm run format                  # prettier --write
npm run data:build              # regenerate layout.json + download sprites (tsx)
```

## Architecture

Static React app (no backend) for a Pokémon Living Dex box planner. Three layers; only the first
two are game-specific:

1. **Game config** — `src/games/<id>/config.ts` exports a declarative `GameConfig` (type in
   `src/core/types.ts`): dex list, forms, female forms, HOME regional forms, battle forms, extras,
   merged evolution lines, label overrides. This is the only thing to write for a new game.
2. **Data generator** — `scripts/buildLayout.ts` is a pure function from a `GameConfig` and the
   PokeAPI CSV tables to `{ groups, extra }`. It is a faithful port of
   `reference/build_sv_layout_reference.py`.
   `npm run data:build` runs it and writes `src/games/<id>/generated/layout.json` (committed) and
   downloads sprites to `public/sprites/pokemon/…` (committed). CSVs are pinned to `POKEAPI_SHA` in
   `scripts/pokeapi.ts` and cached in `scripts/cache/<sha>/` (committed) so builds work offline.
3. **Engine + UI** — game-independent. `src/core/layout.ts` (`packBoxes`, `layoutBoxes`, option
   filters), `src/core/storage.ts` (per-game localStorage, backup code), `src/core/entry.ts`
   (labels, search, text export), `src/components/*`.

`src/games/configs.ts` (configs only) is deliberately separate from `src/games/index.ts` (registry
that imports the generated JSON) so scripts can import configs without loading generated data.
A new game needs: config → add to `configs.ts` → `data:build` → import its `layout.json` in
`index.ts` → golden test (see README "Jak dodać nową grę" steps).

## Things that need care

- **`reference/` is the spec and must not be edited.** `sv-layout-golden.json` is the fixture:
  `scripts/golden.test.ts` requires generator output (and the committed `layout.json`) to equal it
  exactly. Entry `id`s are the "caught" keys and the backup-code payload, so they must not change.
- If the reference looks wrong, record it in `NOTES.md` and ask; do not change data silently.
  Do not guess Pokémon data — it comes from config + CSVs only.
- Layout invariants are pinned by tests in `src/core/layout.test.ts`: defaults give 31 boxes /
  917 slots / 13 empty, box 7 ends at `flabebe-orange`; Paldea-only gives 18 boxes (box 7 ends at
  `floette-red`); groups of 2–6 are never split when `noSplit` is on.
- Backup code = base64 of UTF-8 JSON array of ids, identical to the prototype. For `sv`,
  `storage.ts` also reads the prototype's old localStorage keys as a fallback.
- Updating PokeAPI data: change `POKEAPI_SHA`, delete the old `scripts/cache/<sha>/`, run
  `data:build`, and check the golden test.
- Component tests rely on `src/test-setup.ts`, which emulates `<dialog>.showModal()` for jsdom.
- UI strings are in Polish. Routing is by hash (`#sv`); `base: './'` keeps it working under the
  GitHub Pages sub-path (deployed by `.github/workflows/deploy.yml` on push to `main`).

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
