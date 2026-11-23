"""PROTOTYPE (throwaway), issue #45: trace one fragment, score with LPIPS.
Run: uv run python gate.py   (source picture is git-ignored, spike only)"""
import time, io, os, sys
import numpy as np, torch, lpips, vtracer, resvg_py
from PIL import Image

SRC = "../cache/bulbagarden/paldea.png"
BOX = (1200, 1900, 2224, 2924)  # 1024 px fragment: city + desert
OUT = "out"; os.makedirs(OUT, exist_ok=True)
img = Image.open(SRC).convert("RGB").crop(BOX); img.save(f"{OUT}/ref.png")
net = lpips.LPIPS(net="alex", verbose=False)

def t(im):  # PIL -> [-1,1] tensor
    return torch.from_numpy(np.asarray(im, dtype=np.float32) / 127.5 - 1).permute(2, 0, 1)[None]

def score(a, b, tile=256):  # mean LPIPS over tiles (net wants small patches)
    A, B = t(a), t(b); s = []
    for y in range(0, A.shape[2], tile):
        for x in range(0, A.shape[3], tile):
            with torch.no_grad(): s.append(net(A[..., y:y+tile, x:x+tile], B[..., y:y+tile, x:x+tile]).item())
    return float(np.mean(s)), float(np.max(s))

PRESETS = {  # name: vtracer kwargs
    "coarse": dict(filter_speckle=16, color_precision=4, layer_difference=32, corner_threshold=60, path_precision=1),
    "medium": dict(filter_speckle=6, color_precision=5, layer_difference=16, corner_threshold=60, path_precision=1),
    "fine":   dict(filter_speckle=2, color_precision=6, layer_difference=8,  corner_threshold=60, path_precision=1),
}
print("jpeg-ish noise floor (re-save q85):", end=" ")
buf = io.BytesIO(); img.save(buf, "JPEG", quality=85); print(score(img, Image.open(buf).convert("RGB")))
for name, kw in PRESETS.items():
    img.save(f"{OUT}/in.png"); t0 = time.time()
    vtracer.convert_image_to_svg_py(f"{OUT}/in.png", f"{OUT}/{name}.svg", colormode="color", hierarchical="stacked", mode="spline", **kw)
    t_trace = time.time() - t0; svg = open(f"{OUT}/{name}.svg", encoding="utf8").read()
    t0 = time.time(); png = bytes(resvg_py.svg_to_bytes(svg_string=svg, width=1024, height=1024)); t_ren = time.time() - t0
    r = Image.open(io.BytesIO(png)).convert("RGB"); r.save(f"{OUT}/{name}.png")
    m, mx = score(img, r)
    print(f"{name}: LPIPS mean={m:.4f} worst-tile={mx:.4f} svg={len(svg)/1024:.0f} KB paths={svg.count('<path')} trace={t_trace:.1f}s render={t_ren*1000:.0f}ms")
