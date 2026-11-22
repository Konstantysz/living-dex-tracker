---
title: Architecture
type: concept
sources: [README.md, CLAUDE.md, src/core, src/games, scripts]
updated: 2026-11-22
---

# Architecture

Three layers, so a new game needs only a config.

1. **Data generator** (build time, `scripts/`): [Generator and PokeAPI data](../entities/generator-and-pokeapi.md).
   Reads a game config and PokeAPI CSV files, writes `layout.json` and sprites.
2. **Game config** (declarative, `src/games/<id>/config.ts`): [SV game config](../entities/sv-game-config.md),
   [Z-A game config](../entities/za-game-config.md).
3. **Engine and UI** (runtime, game-independent): `src/core/` and `src/components/`.

## Folders

```
reference/                  prototype, script, golden (do not edit)
scripts/                    generator, cache/<sha>/, ste-lint.py, wiki-lint.py
src/core/                   types, layout (packBoxes), storage, entry helpers (ids, labels)
src/games/configs.ts        list of configs (no JSON imports)
src/games/index.ts          registry: config + layout per game, imports theme.css
src/games/<id>/             config.ts, theme.css, generated/layout.json
src/components/             React UI
public/sprites/pokemon/     sprites
docs/adr/                   decisions (ADR 0001 to 0003)
docs/wiki/                  this wiki
GLOSSARY.md                 domain terms (EN, PL, code identifier)
CODING_STANDARDS.md         judgement rules for the reviewer
```

## Design choices

- `configs.ts` is separate from `index.ts`, so the generator can import configs without loading
  generated JSON.
- State is React state plus `localStorage`. No Redux, no backend.
- `src/core/layout.ts` is a pure function and has full unit tests. See
  [Packing algorithm](packing-algorithm.md).
- The golden test ties the generator to the reference data. See
  [Project decisions](../analyses/project-decisions.md).
- Collectibles share the caught set with entries (ADR 0002). See
  [Backup code and storage](backup-and-storage.md).

## Checks

- `npm run check` runs lint, typecheck and tests. The pre-commit hook runs lint-staged, typecheck
  and tests.
- `npm run wiki:lint` runs the ASD-STE100 linter on the wiki.
- `.github/workflows/check.yml` runs `npm run check`, the wiki linter and the build on every pull
  request. See [GitHub Pages deployment](../entities/github-pages-deployment.md).
