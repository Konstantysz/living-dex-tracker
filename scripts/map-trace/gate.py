# /// script
# requires-python = ">=3.11,<3.14"
# dependencies = ["torch", "lpips", "resvg-py", "pillow", "numpy"]
# ///
"""Step 7 of #15: LPIPS gate for the traced base art.

Run: uv run scripts/map-trace/gate.py
Needs: map-source-4096.png (stitch.py), prepare.py output, and src/games/sv/map-base-*.svg.

Fine LOD (9 tiles painted in order, rendered at 3000 px, scored against the 3000 px source):
  per tile: mean <= 0.04 and worst 256 px window <= 0.08
  seams: windows across each tile seam score no worse than the interior windows (mean)
Coarse LODs (8, 4, 2): scored against their own downscale, judged by eye. No limit here.
Windows are 256 px, AlexNet LPIPS (see docs/wiki/analyses/lpips-gate-findings.md).
"""
import io
import re
from pathlib import Path

import lpips
import numpy as np
import resvg_py
import torch
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SV = ROOT / "src" / "games" / "sv"
IN = ROOT / "scripts" / "cache" / "serebii" / "map-trace" / "in"
FULL, GRID, W = 3000, 3, 256
net = lpips.LPIPS(net="alex", verbose=False)


def render(svg: str, size: int) -> Image.Image:
    png = resvg_py.svg_to_bytes(svg_string=svg, width=size, height=size)
    return Image.open(io.BytesIO(bytes(png))).convert("RGB")


def tensor(im: Image.Image, box):
    a = np.asarray(im.crop(box), dtype=np.float32) / 127.5 - 1
    return torch.from_numpy(a).permute(2, 0, 1)[None]


def window(ref, got, x, y, w=W):
    box = (x, y, min(x + w, ref.width), min(y + w, ref.height))
    if box[2] - box[0] < 64 or box[3] - box[1] < 64:
        return None
    with torch.no_grad():
        return net(tensor(ref, box), tensor(got, box)).item()


def stats(scores):
    s = [v for v in scores if v is not None]
    return f"mean={np.mean(s):.4f} worst={max(s):.4f} (n={len(s)})"


# --- fine LOD
ref = Image.open(ROOT / "scripts" / "cache" / "serebii" / "map-source-4096.png").convert("RGB")
ref = ref.resize((FULL, FULL), Image.LANCZOS)
inner = "".join(
    re.search(r"<svg[^>]*>(.*)</svg>", (SV / f"map-base-1-{r}-{c}.svg").read_text("utf8"), re.S).group(1)
    for r in range(GRID)
    for c in range(GRID)
)
got = render(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5000 5000">{inner}</svg>', FULL)

core = FULL // GRID
print("FINE LOD (limit: mean <= 0.04, worst <= 0.08)")
for r in range(GRID):
    for c in range(GRID):
        # windows of 256 px inside the tile core, so no window crosses a seam
        scores = [
            window(ref, got, c * core + x, r * core + y)
            for y in range(0, core - W + 1, W)
            for x in range(0, core - W + 1, W)
        ]
        m, wst = np.mean(scores), max(scores)
        print(f"  tile {r}-{c}: mean={m:.4f} worst={wst:.4f} {'OK' if m <= 0.04 and wst <= 0.08 else 'FAIL'}")

seam, interior = [], []
for k in range(1, GRID):  # seam at 1000 and 2000, vertical and horizontal
    for t in range(0, FULL - W + 1, W):
        seam.append(window(ref, got, k * core - W // 2, t))
        seam.append(window(ref, got, t, k * core - W // 2))
for k in range(GRID):  # interior windows centred in a tile
    for t in range(0, FULL - W + 1, W):
        interior.append(window(ref, got, k * core + (core - W) // 2, t))
        interior.append(window(ref, got, t, k * core + (core - W) // 2))
sm, im = np.mean([s for s in seam if s is not None]), np.mean([s for s in interior if s is not None])
print(f"  seam strips:     {stats(seam)}")
print(f"  interior strips: {stats(interior)}")
print(f"  seam {'OK (not worse)' if sm <= im else 'FAIL (worse than interior)'}")

# --- coarse LODs, against their own downscale, by eye
print("COARSE LODs vs own downscale (no limit, judge by eye)")
for lod, size in (("8", FULL // 8), ("4", FULL // 4), ("2", FULL // 2)):
    own = Image.open(IN / lod / f"map-base-{lod}.png").convert("RGB")
    g = render((SV / f"map-base-{lod}.svg").read_text("utf8"), size)
    w = 128 if size < 512 else W
    sc = [window(own, g, x, y, w) for y in range(0, size, w) for x in range(0, size, w)]
    print(f"  LOD {lod} ({size} px): {stats(sc)}")
    g.save(ROOT / "scripts" / "cache" / "serebii" / "map-trace" / f"render-lod{lod}.png")
got.save(ROOT / "scripts" / "cache" / "serebii" / "map-trace" / "render-lod1.png")
