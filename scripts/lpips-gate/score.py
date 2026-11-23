"""PROTOTYPE (throwaway): score SVGs against out/ref.png. uv run python score.py out/a.svg ..."""
import io, sys, time, numpy as np, torch, lpips, resvg_py
from PIL import Image
net = lpips.LPIPS(net="alex", verbose=False)
ref = Image.open("out/ref.png").convert("RGB")
t = lambda im: torch.from_numpy(np.asarray(im, dtype=np.float32) / 127.5 - 1).permute(2, 0, 1)[None]
for p in sys.argv[1:]:
    svg = open(p, encoding="utf8").read(); t0 = time.time()
    r = Image.open(io.BytesIO(bytes(resvg_py.svg_to_bytes(svg_string=svg, width=1024, height=1024)))).convert("RGB")
    ms = (time.time() - t0) * 1000; r.save(p.replace(".svg", ".png"))
    A, B = t(ref), t(r)
    s = [net(A[..., y:y+256, x:x+256], B[..., y:y+256, x:x+256]).item() for y in range(0, 1024, 256) for x in range(0, 1024, 256)]
    print(f"{p}: mean={np.mean(s):.4f} worst={max(s):.4f} size={len(svg)/1024:.0f}KB render={ms:.0f}ms")
