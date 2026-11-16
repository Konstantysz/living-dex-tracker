---
title: Architecture
type: concept
sources: [README.md, src/core, src/games, scripts]
updated: 2026-11-16
---

# Architecture

Three layers, so a new game needs only a config.

1. **Data generator** (build time, `scripts/`): [Generator and PokeAPI data](../entities/generator-and-pokeapi.md).
   Reads a game config and PokeAPI CSV files, writes `layout.json` and sprites.
2. **Game config** (declarative, `src/games/<id>/config.ts`): [SV game config](../entities/sv-game-config.md).
3. **Engine and UI** (runtime, game-independent): `src/core/` and `src/components/`.

## Folders

```
reference/                  prototype, script, golden (do not edit)
scripts/                    generator + cache/<sha>/
src/core/                   types, layout (packBoxes), storage, entry helpers
src/games/configs.ts        list of configs (no JSON imports)
src/games/index.ts          registry: config + layout per game
src/games/<id>/             config.ts, generated/layout.json
src/components/             React UI
public/sprites/pokemon/     sprites
docs/wiki/                  this wiki
```

## Design choices

- `configs.ts` is separate from `index.ts`, so the generator can import configs without loading
  generated JSON.
- State is React state plus `localStorage`. No Redux, no backend.
- `src/core/layout.ts` is a pure function and has full unit tests. See
  [Packing algorithm](packing-algorithm.md).
- The golden test ties the generator to the reference data. See
  [Project decisions](../analyses/project-decisions.md).
