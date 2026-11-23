# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow"]
# ///
"""Step 6a of #15: cut the inputs for VectorCraft from the stitched source picture.

Run: uv run scripts/map-trace/prepare.py
Input:  scripts/cache/serebii/map-source-4096.png (made by stitch.py)
Output: scripts/cache/serebii/map-trace/in/<lod>/*.png and in/layout.json (git-ignored, ADR 5)

The map is traced at 3000 px (ADR 5). LOD 8, 4 and 2 are 1/8, 1/4 and 1/2 of that. The fine LOD
"1" is 9 tiles of 1000 px with 8 px of extra picture on each side (16 px overlap, clamped at the
map edge). layout.json holds the crop box of each file in 3000 px units for finish.py.
"""
import json
from pathlib import Path

from PIL import Image

FULL, GRID, PAD = 3000, 3, 8
CACHE = Path(__file__).resolve().parents[1] / "cache" / "serebii"
IN = CACHE / "map-trace" / "in"

src = Image.open(CACHE / "map-source-4096.png").convert("RGB").resize((FULL, FULL), Image.LANCZOS)
layout = {}


def save(lod: str, name: str, im: Image.Image, box: tuple[int, int, int, int]):
    (IN / lod).mkdir(parents=True, exist_ok=True)
    im.save(IN / lod / f"{name}.png")
    layout[f"{lod}/{name}"] = {"box": box, "px": FULL}  # box is in FULL units. The file has its own size.


for lod, div in (("8", 8), ("4", 4), ("2", 2)):
    s = FULL // div
    save(lod, f"map-base-{lod}", src.resize((s, s), Image.LANCZOS), (0, 0, FULL, FULL))

core = FULL // GRID
for r in range(GRID):
    for c in range(GRID):
        box = (
            max(0, c * core - PAD),
            max(0, r * core - PAD),
            min(FULL, (c + 1) * core + PAD),
            min(FULL, (r + 1) * core + PAD),
        )
        save("1", f"map-base-1-{r}-{c}", src.crop(box), box)

(IN / "layout.json").write_text(json.dumps(layout, indent=1))
print(f"wrote {len(layout)} inputs in {IN}")
