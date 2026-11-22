---
title: Project decisions and acceptance status
type: analysis
sources: [conversation:2026-11-16, README.md, NOTES.md]
updated: 2026-11-16
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

## Acceptance criteria (from the task brief)

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
