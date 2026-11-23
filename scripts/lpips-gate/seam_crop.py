"""PROTOTYPE (throwaway), issue #58 step 2: crop fine-LOD tiles (1000 px + 8 px overlap each side) from the 3000 px source."""
from PIL import Image
im = Image.open("../cache/serebii/stitched3000.png")
def box(r, c): return (max(0, 1000*c-8), max(0, 1000*r-8), min(3000, 1000*(c+1)+8), min(3000, 1000*(r+1)+8))
import os; os.makedirs("out/seam", exist_ok=True)
for name, (r, c) in {"A": (1, 1), "B": (1, 2), "sea": (0, 0), "mtn": (0, 1)}.items():
    b = box(r, c); im.crop(b).save(f"out/seam/{name}.png"); print(name, b)
