---
title: VectorCraft
type: entity
sources: [conversation:2026-11-23, docs/adr/0003-area-map-as-svg-data.md]
updated: 2026-11-23
---

# VectorCraft

VectorCraft is a vector illustration app. The plan for the area map uses its image trace to make
`map-base.svg` (source: [ADR 0003](../../adr/0003-area-map-as-svg-data.md)). The ADR calls the app
"alpha".

- **Install:** `C:\Program Files\ArtCraft\VectorCraft\`. The command-line tool is
  `vectorcraft-cli.exe`. `vectorcraft-cli mcp` starts the MCP server on stdio.
- **MCP setup:** add the server with `claude mcp add vectorcraft -- "<path>\vectorcraft-cli.exe" mcp`
  in the project folder. A server saved under another project folder does not load here. A path with
  a space must stay in one argument.
- **Trace command:** `imageTrace.makeAndExpand`. Select the image first (`select.all`).
- **Settings that worked:** `mode` color, `palette` automatic, `colorDetail` and `paths` 20 or 50,
  `method` abutting. See [LPIPS gate findings](../analyses/lpips-gate-findings.md) for the scores.
- **Output:** SVG paths with `M`, `L`, `C` and `Z`.

(source: conversation:2026-11-23.)
