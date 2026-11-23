"""PROTOTYPE (throwaway), issue #54: per LOD, LPIPS of (a) the plain downscale and (b) the trace, vs full ref, and (b) vs the downscale.
Run: uv run python lods.py"""
import io, numpy as np, torch, lpips, resvg_py
from PIL import Image
net = lpips.LPIPS(net="alex", verbose=False)
t = lambda im: torch.from_numpy(np.asarray(im, dtype=np.float32) / 127.5 - 1).permute(2, 0, 1)[None]
def sc(a, b):
    A, B = t(a), t(b)
    s = [net(A[..., y:y+256, x:x+256], B[..., y:y+256, x:x+256]).item() for y in range(0, 1024, 256) for x in range(0, 1024, 256)]
    return f"mean={np.mean(s):.4f} worst={max(s):.4f}"
ref = Image.open("out/ref.png").convert("RGB")
for n, s, svg in (("1/8", 128, "lod8_n1"), ("1/4", 256, "lod4_n1"), ("1/2", 512, "lod2_n2"), ("1/1", 1024, "lod1_n3")):
    up = ref.resize((s, s), Image.LANCZOS).resize((1024, 1024), Image.BICUBIC)
    r = Image.open(io.BytesIO(bytes(resvg_py.svg_to_bytes(svg_string=open(f"out/lod/{svg}.svg", encoding="utf8").read(), width=1024, height=1024)))).convert("RGB")
    print(f"{n}: raster-floor vs ref [{sc(ref, up)}] | trace vs ref [{sc(ref, r)}] | trace vs own downscale [{sc(up, r)}]")
