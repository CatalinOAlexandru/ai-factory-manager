"""Copy design/src/img/camera-view.jpg to assets/img/camera-view-clean.jpg with the text chips removed
(the LIVE chip and the 4 value labels drawn over the camera image). Each chip is filled by vertical
interpolation between the rows just above and just below it. design/ is not changed."""
from pathlib import Path
from PIL import Image
import numpy as np
ROOT = Path(__file__).resolve().parents[2]
im = np.array(Image.open(ROOT / "design/src/img/camera-view.jpg").convert("RGB")).astype(float)
# x0, x1, y0, y1 in image pixels (1600 x 1200), measured from the label colours.
# Last value: margin below (the value box starts about 9 px under each label).
RECTS = [(28, 402, 26, 74, 12, 12), (218, 565, 379, 415, 9, 2), (826, 1111, 388, 424, 9, 2), (225, 487, 635, 671, 9, 2), (822, 1101, 646, 682, 9, 2)]
def band(y0, y1, x0, x1, k=41):
    row = np.pad(im[y0:y1].mean(axis=0), ((k, k), (0, 0)), mode="edge")[x0:x1 + 1 + 2 * k]  # clean rows, then a wide horizontal blur
    ker = np.ones(k) / k
    sm = np.stack([np.convolve(row[:, c], ker, mode="same") for c in range(3)], axis=1)
    return sm[k:-k]
for x0, x1, y0, y1, m, mb in RECTS:
    x0, x1, y0, y1 = max(x0 - m, 0), x1 + m, max(y0 - m, 2), y1 + mb
    top, bot = band(y0 - 3, y0, x0, x1), band(y1 + 1, y1 + 3, x0, x1)
    for y in range(y0, y1 + 1):
        t = (y - y0 + 1) / (y1 - y0 + 2)
        im[y, x0:x1 + 1] = top * (1 - t) + bot * t
out = ROOT / "assets/img/camera-view-clean.jpg"
Image.fromarray(im.clip(0, 255).astype(np.uint8)).save(out, quality=88)
print(out)
