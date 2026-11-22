---
title: Backup code and storage
type: concept
sources:
  [
    src/core/storage.ts,
    src/core/storage.test.ts,
    src/core/entry.ts,
    docs/adr/0002-collectibles-in-caught-set.md,
    reference/sv-artifact-template.html,
  ]
updated: 2026-11-22
---

# Backup code and storage

## Caught set

The caught set holds two kinds of ids (ADR 0002):

- **Entry ids**, for example `sprigatito`. They never contain `:`.
- **Collectible ids** `<set>:<section>-<n>`, for example `stake:ting-lu-1` for an SV ruin stake.

`src/core/entry.ts` keeps the rule in one place: `collectibleId` makes an id, and `isEntryId` and
`entryCount` tell the two kinds apart. Progress, the text export and the import confirmation count
entries only. A test checks that no entry id of any game contains `:`.

## Backup code

Base64 of the UTF-8 JSON array of the caught set. This is the same format as the
[prototype](../sources/sv-prototype.md), so a code from the prototype loads in the app. The code
also carries collectibles.

- Export: `exportCode(set)`.
- Import: `importCode(text)` returns the set, or `null` when the code is invalid. Valid means:
  decodes as base64 and UTF-8, parses as JSON, and is an array of strings.
- Unknown ids are accepted. They are ignored in the progress count.
- The UI asks before an import replaces the caught set. A toast can undo the import for 5 s. See
  [UI behaviour](ui-behaviour.md).

## localStorage

- Keys per game: `ldt:<gameId>:caught` and `ldt:<gameId>:opts`.
- Fallback for `sv` only: the app reads the prototype keys `paldea-living-dex-v1` and
  `sv-living-dex-opt-v2` when the new keys are empty. It maps the old option name `optDim` to
  `dim`.
- The app ignores the removed options `alc` and `noSplit` (and `optAlc`, `optNoSplit`). When the
  saved options have `alc: false`, `hidAlcremie()` returns true. The app then shows a notice once
  and saves the options again without the old key.
- Every access is wrapped in `try/catch`. The app works in memory when storage is blocked.

## Related

- [Options and filters](options-and-filters.md)
