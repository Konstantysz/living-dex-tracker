# LLM Wiki: schema

This folder is a persistent wiki. The LLM writes and maintains it. The human adds sources and asks
questions. Git tracks everything. Read this file before every wiki task.

## Scope

Default scope: knowledge about the `living-dex-tracker` project and its domain (Living Dex rules,
Pokémon game dexes, PokeAPI data). The human can change the scope here at any time.

## Layers

| Path                  | Owner | Rule                                                      |
| --------------------- | ----- | --------------------------------------------------------- |
| `raw/`                | human | Sources. Immutable. The LLM reads them and never edits.   |
| `raw/assets/`         | human | Images for sources. Local copies only.                    |
| `sources/`            | LLM   | One summary page per raw source.                          |
| `entities/`           | LLM   | One page per person, thing, game, tool, dataset.          |
| `concepts/`           | LLM   | One page per idea, rule, or pattern.                      |
| `analyses/`           | LLM   | Filed answers: comparisons, syntheses, decisions.         |
| `index.md`            | LLM   | Catalog of all pages. Update on every change.             |
| `log.md`              | LLM   | Append-only history of ingest, query, and lint.           |

## Page format

- File names: `kebab-case.md`. One topic per page.
- Start with YAML frontmatter:

```yaml
---
title: Page title
type: source | entity | concept | analysis
sources: [raw/file.md] # raw files that support this page
updated: 2026-11-16
---
```

- `sources:` may also list repo files (path from the repo root, e.g. `reference/sv-layout-golden.json`)
  or `conversation:<date>` for facts from a work session. Prefer repo files when they exist.
- Link pages with relative markdown links: `[Wooper](../entities/wooper.md)`.
- Every factual claim cites a source: `(source: [name](../sources/name.md))`.
- When two sources disagree, write both claims and mark it: `> **Conflict:** …`.
- A claim without a source is marked `> **Unverified:** …`. Do not present it as fact.
- Use short sentences. Keep one idea per paragraph.

## Operations

### Ingest (one source at a time)

1. Read the raw source fully. Do not edit it.
2. Tell the human the key takeaways. Wait for guidance if the source is unclear.
3. Write `sources/<name>.md`: summary, key claims, link to the raw file.
4. Update or create the related entity and concept pages. Add links both ways.
5. Mark conflicts with older pages. Do not delete old claims silently.
6. Update `index.md`.
7. Append an entry to `log.md`.
8. Commit: `wiki: ingest <name>`. Ask the human before the first commit of a session.

### Query

1. Read `index.md`. Open the relevant pages. Do not answer from memory.
2. Answer with citations to wiki pages.
3. If the answer has lasting value, offer to file it in `analyses/`. Then update `index.md` and `log.md`.

### Lint (when asked, or after about 10 ingests)

Check for:

- contradictions between pages
- stale claims that newer sources replace
- orphan pages with no inbound links
- concepts mentioned often but with no page
- claims without a source
- broken links and pages missing from `index.md`

Report findings first. Fix only what the human approves. Log the lint pass.

## index.md format

Group by category. One line per page: `- [Title](path) — one-line summary`.

## log.md format

Append only. Each entry starts with a fixed prefix, so `grep "^## \[" log.md` works:

```
## [2026-11-16] ingest | Source title
Pages touched: sources/x.md, entities/y.md. Notes: …
```

Types: `ingest`, `query`, `lint`, `schema`.

## Limits

- `index.md` is enough up to a few hundred pages. Add a search tool (for example `qmd`) only after that.
- Never invent data. If a source does not say it, mark it unverified or leave it out.
- Change this schema only with the human. Log each change as `schema`.
