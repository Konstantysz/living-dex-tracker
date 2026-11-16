---
title: living-dex-tracker (project)
type: entity
sources: [README.md, package.json, conversation:2026-11-16]
updated: 2026-11-16
---

# living-dex-tracker

A static React app that shows a planned Living Dex box layout (6 × 5 = 30 slots per box). The
user ticks caught Pokémon. There is no backend. It recreates every feature of the
[SV prototype](../sources/sv-prototype.md) as a proper app.

- **Stack:** Vite, React 18, TypeScript (strict), CSS Modules and custom properties, Vitest with
  React Testing Library, ESLint, Prettier, npm.
- **Games now:** Pokémon Scarlet/Violet (Paldea + Kitakami + Blueberry). The architecture is made
  for more games: see [Architecture](../concepts/architecture.md) and
  [Adding a new game](../concepts/adding-a-new-game.md).
- **Live site:** https://konstantysz.github.io/living-dex-tracker/ (see
  [GitHub Pages deployment](github-pages-deployment.md)).
- **Repo:** `Konstantysz/living-dex-tracker` (public), branch `main`. The MIT licence names
  `konstantysz` as owner.
- **Scripts:** `dev`, `build`, `test`, `lint`, `data:build`.
- **Status (2026-11-16):** build, 21 tests and lint pass. Not done: a manual side-by-side check
  against the prototype (acceptance criterion 4).

## Where to read next

- Rules: [Layout rules](../concepts/layout-rules.md), [Packing algorithm](../concepts/packing-algorithm.md)
- Data: [Generator and PokeAPI data](generator-and-pokeapi.md), [SV game config](sv-game-config.md)
- Decisions and open points: [Project decisions](../analyses/project-decisions.md),
  [Reference quirks](../analyses/reference-quirks.md)
