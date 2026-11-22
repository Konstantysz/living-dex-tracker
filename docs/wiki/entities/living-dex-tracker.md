---
title: living-dex-tracker (project)
type: entity
sources: [README.md, package.json, conversation:2026-11-16, conversation:2026-11-22]
updated: 2026-11-22
---

# living-dex-tracker

A static React app that shows a planned Living Dex box layout (6 × 5 = 30 slots per box). The
user ticks caught Pokémon. There is no backend. It started as a rewrite of the
[SV prototype](../sources/sv-prototype.md).

- **Stack:** Vite, React 19, TypeScript (strict), CSS Modules and custom properties, Vitest with
  React Testing Library, ESLint, Prettier, npm.
- **Games now:**
  - Pokémon Scarlet/Violet: Paldea, Kitakami and Blueberry dexes. See [SV game config](sv-game-config.md).
  - Pokémon Legends: Z-A: Lumiose and Hyperspace dexes. See [Z-A game config](za-game-config.md).
- **More games:** see [Architecture](../concepts/architecture.md) and
  [Adding a new game](../concepts/adding-a-new-game.md).
- **Live site:** https://konstantysz.github.io/living-dex-tracker/ (see
  [GitHub Pages deployment](github-pages-deployment.md)).
- **Repo:** `Konstantysz/living-dex-tracker` (public), branch `main`. The MIT licence names
  `konstantysz` as owner.
- **Scripts:** `dev`, `build`, `test`, `lint`, `typecheck`, `check`, `data:build`,
  `golden:update`, `wiki:lint`.
- **Status (2026-11-22):** `npm run check` passes with 30 tests.

## Features

- Box screen in the look of each game's PC box, with version-exclusive marks. See
  [UI behaviour](../concepts/ui-behaviour.md).
- Undo for each toggle and a confirmation before an import.
- The Guide ("Poradnik") with the SV ruin stake checklist.
- Backup code and per-game storage. See [Backup code and storage](../concepts/backup-and-storage.md).

## Plans

GitHub issues hold the plan. The main threads (source: `conversation:2026-11-22`):

- Badges like trophies or achievements: #20, #24, #12, #21, #22, #23.
- Details dialog, my-version setting, missing-only view: #10, #7, #8.
- Locations from Serebii, areas, area map: #11, #13, #14, #15, #16, #17.

## Where to read next

- Rules: [Layout rules](../concepts/layout-rules.md), [Packing algorithm](../concepts/packing-algorithm.md)
- Data: [Generator and PokeAPI data](generator-and-pokeapi.md)
- Decisions and open points: [Project decisions](../analyses/project-decisions.md),
  [Reference quirks](../analyses/reference-quirks.md)
