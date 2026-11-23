# Log

Append only. Newest entry at the bottom.

## [2026-11-16] schema | Wiki created

Created the folder structure, `CLAUDE.md` schema, `index.md` and `log.md`. No sources yet.

## [2026-11-16] schema | Allow repo files as sources

`sources:` frontmatter may list repo files or `conversation:<date>`. Reason: project facts live in
code and reference files, not in `raw/`.

## [2026-11-16] ingest | Project knowledge from the build session

Pages touched: sources/sv-prototype.md, sources/sv-layout-script.md, entities/living-dex-tracker.md,
entities/generator-and-pokeapi.md, entities/sv-game-config.md, entities/github-pages-deployment.md,
concepts/architecture.md, concepts/layout-rules.md, concepts/packing-algorithm.md,
concepts/options-and-filters.md, concepts/backup-and-storage.md, concepts/ui-behaviour.md,
concepts/adding-a-new-game.md, analyses/reference-quirks.md, analyses/project-decisions.md,
index.md. Notes: written from the session and the repo files; open points are in
analyses/project-decisions.md.

## [2026-11-22] schema | ASD-STE100 writing style
Pages touched: CLAUDE.md. Notes: wiki prose follows ASD-STE100. Terms come from GLOSSARY.md. Lint checks the rules. Existing pages are not rewritten yet.

## [2026-11-22] lint | ASD-STE100 structural rules
Pages touched: analyses/project-decisions.md, concepts/layout-rules.md, concepts/options-and-filters.md, concepts/packing-algorithm.md, concepts/ui-behaviour.md, entities/github-pages-deployment.md, entities/sv-game-config.md, sources/sv-prototype.md. Notes: removed all semicolons and one synonym pair. `npm run wiki:lint` now runs scripts/ste-lint.py. It skips raw/, CLAUDE.md and log.md. 24 advisory findings (possible passive voice) stay.

## [2026-11-22] ingest | Repo changes 2026-11-16 to 2026-11-22
Pages touched: entities/living-dex-tracker.md, entities/github-pages-deployment.md, entities/sv-game-config.md, entities/za-game-config.md (new), concepts/architecture.md, concepts/options-and-filters.md, concepts/backup-and-storage.md, concepts/ui-behaviour.md, analyses/project-decisions.md, index.md. Notes: sources are the repo files and commits since 2026-11-16 (Z-A, version exclusives, PC box look, PC-only forms, undo, Guide, ADRs, GLOSSARY, CODING_STANDARDS, check workflow). Options now have four toggles, not six. Not checked again: layout-rules, packing-algorithm and adding-a-new-game.

## [2026-11-22] ingest | Issue #20: remove the alc and noSplit options
Pages touched: concepts/options-and-filters.md, concepts/packing-algorithm.md, concepts/layout-rules.md, concepts/backup-and-storage.md, concepts/ui-behaviour.md. Notes: source is the change for issue #20. The packing table now uses the numbers from src/core/layout.test.ts.

## [2026-11-22] ingest | Details dialog (#10)
Pages touched: concepts/ui-behaviour.md. Notes: source is the #10 change. The page now describes the details gesture per device and the details dialog.

## [2026-11-22] ingest | Locations (#31), Alolan exclusives (#33), generated files (#37), exclusives checks (#38)
Pages touched: concepts/location-data.md (new), entities/sv-game-config.md, entities/generator-and-pokeapi.md, entities/living-dex-tracker.md, concepts/ui-behaviour.md, concepts/architecture.md, index.md. Notes: sources are the merged changes and the review session. The location page describes the current locations.json format. #35 changes that format.

## [2026-11-22] ingest | Normalized Location data (#35)
Pages touched: concepts/location-data.md. Notes: source is the #35 change. The page now describes the Area table, the shared list or per-version object, and the new slug check.

## [2026-11-22] ingest | Areas tab (#14)
Pages touched: concepts/location-data.md, concepts/ui-behaviour.md. Notes: source is the #14 change. The pages now describe the "Obszary" tab, the `regions` field, the Pokéarth link and the details tip.

## [2026-11-23] schema | wiki:lint runs wiki-structure.py
Pages touched: CLAUDE.md. Notes: the Lint section now says that `wiki:lint` also runs `scripts/wiki-structure.py` (callout markers, links, index, `updated:` date, source warnings). Reason: a review found these problems by hand. The glossary "Avoid" check was tried and dropped, because an Avoid word is wrong only for one term.
## [2026-11-23] ingest | Paldea area map research (#43, #15)
Pages touched: analyses/paldea-area-map-research.md (new), concepts/location-data.md, analyses/project-decisions.md, index.md. Notes: sources are the research of tickets #44 and #49 (unmerged branches `research/paldea-area-borders` and `research/paldea-area-sources-other`), a visitor test of PokéMaps, and docs/research/sources.md. The new page holds the findings. The rules of use stay in sources.md.

## [2026-11-23] ingest | Render engine decision (#47)
Pages touched: analyses/paldea-area-map-research.md, analyses/project-decisions.md, concepts/architecture.md, index.md. Notes: source is ADR 0004 and the engine prototype (unmerged branch `prototype/area-map-engines`). Ticket list updated for #46 and #47. All timings come from a desktop browser.

## [2026-11-23] lint | Review fixes for the render engine ingest
Pages touched: analyses/paldea-area-map-research.md, analyses/project-decisions.md, concepts/architecture.md, index.md unchanged. Notes: added missing sources, removed an outdated "Open points" line, replaced the Note marker with Unverified, bumped one date, fixed phrasal verbs, long sentences and the word "region". Also fixed ADR 0003, ADR 0004 and sources.md.
