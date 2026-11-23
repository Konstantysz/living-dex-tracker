"""PROTOTYPE (throwaway), issue #58 step 3: composite traced tiles A (x 992..2008) and B (x 1992..3000), LPIPS on a strip across the seam x=2000."""
import io, numpy as np, torch, lpips, resvg_py
from PIL import Image
net = lpips.LPIPS(net="alex", verbose=False)
src = Image.open("../cache/serebii/stitched3000.png").convert("RGB")
def rend(n, w, h): return Image.open(io.BytesIO(bytes(resvg_py.svg_to_bytes(svg_string=open(f"out/seam/{n}.svg", encoding="utf8").read(), width=w, height=h)))).convert("RGB")
A, B = rend("A", 1016, 1016), rend("B", 1008, 1016)
canvas = Image.new("RGB", (3000, 3000)); canvas.paste(A, (992, 992)); canvas.paste(B, (1992, 992))  # B painted over A
canvas.crop((1872, 992, 2128, 2008)).save("out/seam/strip_trace.png"); src.crop((1872, 992, 2128, 2008)).save("out/seam/strip_src.png")
t = lambda im: torch.from_numpy(np.asarray(im, dtype=np.float32) / 127.5 - 1).permute(2, 0, 1)[None]
def strip(img, x0=1872, w=256):
    s = []
    for y in range(992, 2008 - 256 + 1, 64):
        with torch.no_grad(): s.append(net(t(src.crop((x0, y, x0+w, y+256))), t(img.crop((x0, y, x0+w, y+256)))).item())
    return np.mean(s), max(s)
print("seam strip (x1872-2128): mean=%.4f worst=%.4f" % strip(canvas))
print("control strip inside A (x1400-1656): mean=%.4f worst=%.4f" % strip(canvas, 1400))
print("control strip inside B (x2400-2656): mean=%.4f worst=%.4f" % strip(canvas, 2400))
# overlap disagreement: A vs B on the 16 px overlap
ov = np.abs(np.asarray(A.crop((1000, 0, 1016, 1016)), dtype=int) - np.asarray(B.crop((0, 0, 16, 1016)), dtype=int))
print("overlap A vs B: mean abs diff %.2f/255, share of px with diff>40: %.3f" % (ov.mean(), (ov.max(2) > 40).mean()))
for n, w, h in (("sea", 1008, 1008), ("mtn", 1016, 1008)):
    r = rend(n, w, h); b = {"sea": (0, 0), "mtn": (992, 0)}[n]; ref = src.crop((b[0], b[1], b[0]+w, b[1]+h)); r.save(f"out/seam/{n}_r.png")
    s = [net(t(ref.crop((x, y, x+256, y+256))), t(r.crop((x, y, x+256, y+256)))).item() for y in range(0, h-255, 256) for x in range(0, w-255, 256)]
    print(f"{n}: mean={np.mean(s):.4f} worst={max(s):.4f}")
