#!/usr/bin/env bash
# Combined static build: site at the root, demo at /demo/. Output: deploy/out. Local only, no deploy.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; OUT="$ROOT/deploy/out"
"$ROOT/tools/sync-design-assets.sh"
# 1. Hero phone: 390 px screenshot of the demo CNC mill 3 view (needs the demo dev server on 5190).
node "$ROOT/tools/hero-phone.mjs" "${DEMO_DEV_URL:-http://localhost:5190/}"
python3 "$ROOT/tools/frame-phone.py" "$ROOT/site/generated/demo-cnc3-390.png" "$ROOT/site/generated/hero-phone-cnc3.png"
# 2. Demo with a relative base.
(cd "$ROOT/demo" && BASE_PATH=./ npx tsc --noEmit -p tsconfig.json && BASE_PATH=./ npx vite build --outDir "$ROOT/deploy/.demo-dist" --emptyOutDir)
# 3. Site with "Try the demo" -> ./demo/ and the demo phone in the hero.
(cd "$ROOT/site" && DEMO_URL=./demo/ HERO_PHONE="$ROOT/site/generated/hero-phone-cnc3.png" node "$ROOT/tools/build-site.mjs" && npx vite build --outDir "$ROOT/deploy/.site-dist" --emptyOutDir)
rm -rf "$OUT"; mkdir -p "$OUT"
cp -r "$ROOT/deploy/.site-dist/." "$OUT/"; cp -r "$ROOT/deploy/.demo-dist" "$OUT/demo"
rm -rf "$ROOT/deploy/.site-dist" "$ROOT/deploy/.demo-dist"
# 4. Put the local preview site back (Try the demo -> http://localhost:5190/, design hero phone).
(cd "$ROOT/site" && node "$ROOT/tools/build-site.mjs")
# 5. Checks.
for f in "$OUT/index.html" "$OUT/demo/index.html"; do grep -q 'name="robots" content="noindex' "$f" || { echo "noindex missing in $f"; exit 1; }; done
grep -q "Disallow: /" "$OUT/robots.txt"
grep -q 'href="./demo/"' "$OUT/index.html"; grep -q 'hero-phone-cnc3.png' "$OUT/index.html"
# Brand: fail if brand/ holds a file that the page HTML or JS does not reference.
for d in "$OUT" "$OUT/demo"; do for f in "$d"/brand/*; do n="$(basename "$f")"
  grep -qsF "brand/$n" "$d/index.html" "$d"/assets/*.js || { echo "unused brand file: ${f#$OUT/}"; exit 1; }; done; done
echo "Combined build OK: $OUT"
