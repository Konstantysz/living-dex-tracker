---
title: SV prototype (single-file HTML)
type: source
sources: [reference/sv-artifact-template.html, reference/sv-artifact-reference.html]
updated: 2026-11-16
---

# SV prototype (single-file HTML)

`reference/sv-artifact-reference.html` (~2 MB, sprites as data URIs) is the working prototype.
`reference/sv-artifact-template.html` is the same page without data (`__DATA__`, `__SPRITES__`
placeholders). The prototype is the **specification of behaviour and look** for the React app.

## Key facts

- Dark theme. Fonts: Space Grotesk and JetBrains Mono. Colours are CSS custom properties
  (`--fem`, `--form`, `--reg`, `--bat`, `--caught`, and others).
- Box grid: `repeat(auto-fill, minmax(330px, 1fr))`; each box has 6 columns × 5 rows.
- `layout()` filters entries by toggles and packs them into boxes. See
  [Packing algorithm](../concepts/packing-algorithm.md).
- Toggles and defaults: see [Options and filters](../concepts/options-and-filters.md).
- Search, tooltip, text export and backup: see [UI behaviour](../concepts/ui-behaviour.md).
- Backup code format: see [Backup code and storage](../concepts/backup-and-storage.md).
- Prototype storage keys: `paldea-living-dex-v1` (caught) and `sv-living-dex-opt-v2` (options).

## Related

- [SV layout generator script](sv-layout-script.md) produced the data inside this file.
- Odd details of the prototype: [Reference quirks](../analyses/reference-quirks.md).
