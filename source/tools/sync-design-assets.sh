#!/usr/bin/env bash
# Copy (never edit) Factory Design assets that the demo uses into demo/public/img and demo/public/brand.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
D="$ROOT/design"; P="$ROOT/demo/public/img"
rm -rf "$P/pdf" "$P/screens"; mkdir -p "$P/screens"
# Camera view with no text over the image: rendered by tools/camera/render.mjs from a copy of the design HTML.
cp "$ROOT/assets/img/cnc-hmi-camera-clean.png" "$P/"; rm -f "$P/cnc-hmi-camera-view.png"
# Only the design screens the demo shows.
for f in s1-describe s2-generating tier-free tier-pro tier-business; do cp "$D/src/img/$f.png" "$P/screens/"; done
# img-008 (incubator) is no longer shown in the demo; step 8 uses the centrifuge render. The site keeps img-008.
rm -f "$P/img-007.jpg" "$P/img-008.jpg" "$P/img-009.jpg" "$P/img-012.jpg"
for f in img-011; do cp "$D/src/img/$f.jpg" "$P/"; done
# Lab centrifuge render with the current case (re-rendered 30 Oct 22:03; the design copy shows the old hinged case).
cp "$ROOT/assets/img/lab-centrifuge-camera.jpg" "$P/"
cp "$ROOT/assets/img/lab-centrifuge-device.jpg" "$P/"   # 8/1 "Photo of the device" thumbnail (generated product shot, no text).
# Factory Design's 2D plan visual: copy, and rewrite its import paths for the new folder.
V="$ROOT/demo/src/plan/visual"; mkdir -p "$V"
sed -e 's#"\.\./\.\./shared/#"../../../../shared/#g' "$D/plan2d/FloorPlan2D.tsx" > "$V/FloorPlan2D.tsx"
cp "$D/plan2d/plan2d.css" "$V/plan2d.css"
# Hand floor sketch (step 1 input): re-encoded with no metadata (no EXIF/GPS), about 1600 px wide.
if [ -f "$ROOT/handoff/factory-sketch-original.jpg" ]; then python3 "$ROOT/tools/sketch-image.py" "$ROOT/handoff/factory-sketch-original.jpg" "$P/factory-sketch.jpg"; fi
test -f "$P/factory-sketch.jpg" || { echo "missing $P/factory-sketch.jpg"; exit 1; }
# Brand: copy only the files listed in brand.config.json "files" (the used ones). Old files are removed first.
B="$ROOT/demo/public/brand"; rm -rf "$B"; mkdir -p "$B"
node -e 'const c=require(process.argv[1]);for(const [n,r] of Object.entries(c.files))console.log(n+"\t"+r)' "$ROOT/brand.config.json" |
  while IFS=$'\t' read -r n r; do cp "$ROOT/$r" "$B/$n"; done
echo "design assets synced into $P and $B"
