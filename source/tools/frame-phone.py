# Put the 390 px demo screenshot in a simple phone outline (like design/src/img/s6-logging.png).
import sys
from PIL import Image, ImageDraw
src, dst = sys.argv[1], sys.argv[2]
s = Image.open(src).convert("RGB")
W = s.width + 2*28; H = s.height + 2*28 + 70
img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
d.rounded_rectangle([0, 0, W-1, H-1], radius=110, fill=(255, 255, 255, 255), outline=(214, 211, 204, 255), width=5)
d.rounded_rectangle([14, 14, W-15, H-15], radius=96, outline=(230, 228, 222, 255), width=3)
mask = Image.new("L", s.size, 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, s.width-1, s.height-1], radius=70, fill=255)
img.paste(s, (28, 28+70), mask)
d.rounded_rectangle([W//2-110, 34, W//2+110, 82], radius=24, fill=(232, 230, 226, 255))
img.save(dst)
print("wrote", dst, img.size)
