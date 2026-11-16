---
title: GitHub Pages deployment
type: entity
sources: [.github/workflows/deploy.yml, vite.config.ts, conversation:2026-11-16]
updated: 2026-11-16
---

# GitHub Pages deployment

- **URL:** https://konstantysz.github.io/living-dex-tracker/ (the user confirmed it works in the
  browser).
- **Repo:** `Konstantysz/living-dex-tracker`, public (free Pages needs a public repo). Created with
  `gh repo create`. Pages build type: GitHub Actions.
- **Workflow:** `.github/workflows/deploy.yml`. On push to `main` (and manually): `npm ci`,
  `npm run lint`, `npm test`, `npm run build`, then upload `dist/` and deploy.
- **Paths:** `base: './'` in `vite.config.ts` and hash routing (`#sv`) work under the sub-path
  `/living-dex-tracker/`. Sprites load from `import.meta.env.BASE_URL + entry.s`.
- **Open point:** the workflow log warns that Node 20 actions are deprecated and that
  `ubuntu-latest` will move to Ubuntu 26 (from 2026-10-19). The deploy works; no change made yet.
