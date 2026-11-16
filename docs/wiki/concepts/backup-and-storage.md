---
title: Backup code and storage
type: concept
sources: [src/core/storage.ts, src/core/storage.test.ts, reference/sv-artifact-template.html]
updated: 2026-11-16
---

# Backup code and storage

## Backup code

Base64 of the UTF-8 JSON array of caught ids. This is the same format as the
[prototype](../sources/sv-prototype.md), so a code from the prototype loads in the app.

- Export: `exportCode(set)`.
- Import: `importCode(text)` returns the set, or `null` when the code is invalid. Valid means:
  decodes as base64 and UTF-8, parses as JSON, and is an array of strings.
- Unknown ids are accepted. They are ignored in the progress count.

## localStorage

- Keys per game: `ldt:<gameId>:caught` and `ldt:<gameId>:opts`.
- Fallback for `sv` only: the prototype keys `paldea-living-dex-v1` and `sv-living-dex-opt-v2`
  are read when the new keys are empty. Their option names (`optReg`, …) are mapped to the new
  names.
- Every access is wrapped in `try/catch`. The app works in memory when storage is blocked.

## Related

- [Options and filters](options-and-filters.md)
