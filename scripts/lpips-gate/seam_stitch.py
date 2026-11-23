"""PROTOTYPE (throwaway), issue #58 step 1: stitch Serebii z3 tiles, report blank tiles."""
import numpy as np
from PIL import Image
T = "../cache/serebii/tiles/tile_3-{x}-{y}.png"
big = Image.new("RGBA", (4096, 4096))
for x in range(16):
    for y in range(16):
        big.paste(Image.open(T.format(x=x, y=y)).convert("RGBA"), (x * 256, y * 256))
a = np.asarray(big)
print("alpha<255 px:", int((a[..., 3] < 255).sum()))
for x in range(16):
    for y in range(16):
        t = a[y*256:(y+1)*256, x*256:(x+1)*256]
        if (t[..., 3] < 255).mean() > 0.01 or t[..., :3].std() < 3:
            print("suspect tile", x, y, "transp", round(float((t[..., 3] < 255).mean()), 3), "std", round(float(t[..., :3].std()), 1))
big.convert("RGB").save("../cache/serebii/stitched4096.png")
big.convert("RGB").resize((3000, 3000), Image.LANCZOS).save("../cache/serebii/stitched3000.png")
