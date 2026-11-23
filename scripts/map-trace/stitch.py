# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow"]
# ///
"""Step 1 of #15: download the Serebii Paldea map tiles (zoom 3) and stitch them to 4096 px.

Run: uv run scripts/map-trace/stitch.py
Output (git-ignored, ADR 5): scripts/cache/serebii/map/tile_3-<x>-<y>.png and
scripts/cache/serebii/map-source-4096.png
"""
import time
import urllib.request
from pathlib import Path

from PIL import Image

N, TILE = 16, 256
URL = "https://www.serebii.net/pokearth/paldea/map/tile_3-{x}-{y}.png"
CACHE = Path(__file__).resolve().parents[1] / "cache" / "serebii"
TILES = CACHE / "map"
TILES.mkdir(parents=True, exist_ok=True)

for x in range(N):
    for y in range(N):
        f = TILES / f"tile_3-{x}-{y}.png"
        if f.exists():
            continue
        req = urllib.request.Request(URL.format(x=x, y=y), headers={"User-Agent": "map-trace/1.0"})
        f.write_bytes(urllib.request.urlopen(req, timeout=30).read())
        time.sleep(0.2)  # polite: 256 requests in about a minute

out = Image.new("RGB", (N * TILE, N * TILE))
flat = []
for x in range(N):
    for y in range(N):
        t = Image.open(TILES / f"tile_3-{x}-{y}.png").convert("RGB")
        assert t.size == (TILE, TILE), f"tile {x},{y} is {t.size}"
        if t.getextrema() == ((t.getextrema()[0][0],) * 2, (t.getextrema()[1][0],) * 2, (t.getextrema()[2][0],) * 2):
            flat.append((x, y))
        out.paste(t, (x * TILE, y * TILE))
out.save(CACHE / "map-source-4096.png")
print("saved", CACHE / "map-source-4096.png", "| single-colour tiles:", flat or "none")
