# Index

Catalog of all wiki pages. The LLM updates this file on every change.

## Sources

- [SV prototype (single-file HTML)](sources/sv-prototype.md) — the behaviour and look spec
- [SV layout generator script and golden file](sources/sv-layout-script.md) — origin of the layout rules and the test fixture

## Entities

- [living-dex-tracker (project)](entities/living-dex-tracker.md) — overview, stack, status, links
- [Generator and PokeAPI data](entities/generator-and-pokeapi.md) — build scripts, pinned SHA, cache, sprites
- [SV game config](entities/sv-game-config.md) — the declarative `GameConfig` for Scarlet/Violet
- [GitHub Pages deployment](entities/github-pages-deployment.md) — live URL, workflow, open warnings

## Concepts

- [Architecture](concepts/architecture.md) — three layers and folder map
- [Layout rules](concepts/layout-rules.md) — which entries exist, order, kinds, extra box
- [Packing algorithm](concepts/packing-algorithm.md) — `packBoxes`, no-split rule, verified numbers
- [Options and filters](concepts/options-and-filters.md) — six toggles and defaults
- [Backup code and storage](concepts/backup-and-storage.md) — code format, localStorage keys, migration
- [UI behaviour](concepts/ui-behaviour.md) — cells, search, tooltip, dialogs, routing
- [Adding a new game](concepts/adding-a-new-game.md) — step-by-step

## Analyses

- [Reference quirks](analyses/reference-quirks.md) — odd details in the reference files, awaiting a decision
- [Project decisions and acceptance status](analyses/project-decisions.md) — decisions, criteria, open points
