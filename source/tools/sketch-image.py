"""Re-encode the hand floor sketch for the demo: no metadata (EXIF/GPS/ICC/XMP), about 1600 px wide, JPEG 200-300 KB."""
import io, sys
from PIL import Image, ImageOps
src, dst = sys.argv[1], sys.argv[2]
im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
w = 1600; im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
clean = Image.frombytes("RGB", im.size, im.tobytes())  # pixels only, no info dict
best = None
for q in range(90, 50, -3):
    b = io.BytesIO(); clean.save(b, "JPEG", quality=q, optimize=True, progressive=True)
    best = b.getvalue()
    if len(best) <= 300_000: break
open(dst, "wb").write(best)
print(f"{dst}: {clean.size[0]}x{clean.size[1]}, {len(best)//1024} KB, quality {q}")
