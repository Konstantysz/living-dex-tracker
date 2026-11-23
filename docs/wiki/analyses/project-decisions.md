---
title: Project decisions and acceptance status
type: analysis
sources: [conversation:2026-11-16, conversation:2026-11-22, README.md, NOTES.md, docs/adr]
updated: 2026-11-23
---

# Project decisions and acceptance status

## Decisions (with the reason)

- **Pin PokeAPI to a commit SHA and commit the CSV cache.** Reason: `master` drifts, which could
  break the golden test, and offline builds need the files. The user approved.
- **MIT licence, owner `konstantysz`.** The user said that they own the licence.
- **Public GitHub repo.** Reason: free GitHub Pages needs it.
- **Keep prototype storage keys as a read-only fallback for `sv`.** Reason: do not lose progress.
- **No "exclusions" field in the config.** Reason: excluded forms are simply not listed.
- **Sprite folder `public/sprites/pokemon/…`**, not `public/sprites/…`. Reason: `s` in the golden
  file is `sprites/pokemon/…`, so it works unchanged.
- **Commits in small steps. No push without a request.** The first push came with the Pages
  request.

## Later decisions (2026-11-22)

Formal decisions now live as ADRs in `docs/adr/`. Domain terms live in `GLOSSARY.md`.

- ADR 0001: Serebii is the source of location data, through a build-time scraper.
- ADR 0002: collectibles (e.g. ruin stakes) share the caught set. See
  [Backup code and storage](../concepts/backup-and-storage.md).
- ADR 0003: the area map is our own SVG path data, not a copied picture.
- ADR 0004: the area map uses PixiJS (WebGL). It replaces the renderer parts of ADR 0003.
  (source: `docs/adr/0004-area-map-rendered-with-pixijs.md`)
- Area map (2026-11-23): a human draws the 31 Paldea Areas. Reference maps are for looking only.
  A prototype on desktop chose PixiJS. The phone check is still open.
  (source: `conversation:2026-11-23`) See
  [Paldea area map, research and decisions](paldea-area-map-research.md).
- In-game names (places, shrines, Pokémon) stay in English in the UI. (source: `GLOSSARY.md`)
- Badges work like trophies or achievements: title, info, image, `is_hidden`. The split into base
  game and DLC is automatic. (source: issue #12)

## Acceptance criteria (from the task brief)

These are the criteria of the first version (2026-11-16). Later commits limited the dex to the
forms the PC can store, so the box and slot numbers in rows 2 and 3 are historical.

| # | Criterion                                                    | Status                         |
| - | ------------------------------------------------------------ | ------------------------------ |
| 1 | `data:build` output equals the golden file (test)            | Done, passes                   |
| 2 | Defaults: 31 boxes, 917 slots, 13 empty, box 7 → `flabebe-orange` | Done, tested             |
| 3 | Paldea-only: 18 boxes, box 7 → `floette-red`                 | Done, tested                   |
| 4 | Manual comparison with the prototype                         | **Open** (user to check)       |
| 5 | `build`, `test`, `lint` pass                                 | Done                           |
| 6 | README with "how to add a new game"                          | Done                           |

Criteria 2 and 3 were first checked by simulating the prototype's `layout()` on the golden file,
before any code was written.

## Open points

- Criterion 4 (manual comparison).
- The user has not decided on any item in [Reference quirks](reference-quirks.md).
- Node 20 deprecation warnings in the deploy workflow: [GitHub Pages deployment](../entities/github-pages-deployment.md).
