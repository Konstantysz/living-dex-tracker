# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Step 6c of #15: put the VectorCraft output into the contract of #48.

Run: uv run scripts/map-trace/finish.py
Input:  scripts/cache/serebii/map-trace/out/<lod>/*.svg and in/layout.json
Output: src/games/sv/map-base-{8,4,2}.svg and map-base-1-<row>-<col>.svg (committed)

Each file gets viewBox="0 0 5000 5000". The traced paths stay as they are. One <g transform>
moves and scales them to the place of the file on the map (game units, y down).
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TRACE = ROOT / "scripts" / "cache" / "serebii" / "map-trace"
OUT = ROOT / "src" / "games" / "sv"
GAME, FULL = 5000, 3000
layout = json.loads((TRACE / "in" / "layout.json").read_text())

num = lambda v: f"{v:.6f}".rstrip("0").rstrip(".")

for key, info in layout.items():
    lod, name = key.split("/")
    svg = (TRACE / "out" / lod / f"{name}.svg").read_text(encoding="utf8")
    root = re.search(r"<svg\b[^>]*>", svg).group(0)
    w = float(re.search(r'\swidth="([\d.]+)', root).group(1))
    x0, y0, x1, _ = info["box"]
    k = (x1 - x0) * GAME / FULL / w  # file px -> game units
    inner = svg[svg.index(root) + len(root) : svg.rindex("</svg>")]
    inner = re.sub(r"<title>.*?</title>\s*", "", inner, flags=re.S)
    assert not re.search(r"<image|data:", inner), f"{name} holds a raster"
    out = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {GAME} {GAME}">'
        f'<g transform="translate({num(x0 * GAME / FULL)} {num(y0 * GAME / FULL)}) scale({num(k)})">'
        f"{inner.strip()}</g></svg>\n"
    )
    (OUT / f"{name}.svg").write_text(out, encoding="utf8")
    print(f"{name}.svg  {len(out) / 1e6:.2f} MB")
