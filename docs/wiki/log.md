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
