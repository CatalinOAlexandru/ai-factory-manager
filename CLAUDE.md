# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

PanelPal: a marketing site plus a guided product demo, published at https://panelpal.co.uk/. Everything shown is example data. UK English throughout.

- `build/` — the static files GitHub Pages serves (site at the root, demo in `build/demo/`). `.github/workflows/pages.yml` uploads this folder as-is on push to `main`. There is **no CI build step**. A change reaches the live site only when the rebuilt output is committed into `build/` and merged to `main`.
- `source/` — the code that produces `build/`.

## Commands

Run `npm ci` in `source/site/` and `source/demo/` first. Neither project has tests or a linter. The demo's type check is `tsc --noEmit`, which runs as part of `npm run build`.

```bash
cd source/demo && npm run dev     # demo dev server, port 5190
cd source/site && npm run dev     # site dev server, port 5191 (runs build-site.mjs first)
cd source/demo && npm run build   # tsc --noEmit + vite build
```

Full rebuild (needs the demo dev server running on 5190, because it screenshots the demo for the hero phone):

```bash
source/tools/build-combined.sh    # output: source/deploy/out/  ->  copy into build/
```

Site-only rebuild, when only the marketing page changed and the existing hero phone image is reused:

```bash
cd source/site && DEMO_URL=./demo/ HERO_PHONE="$PWD/generated/hero-phone-cnc3.png" node ../tools/build-site.mjs && npx vite build --outDir ../deploy/.site-dist --emptyOutDir
# copy deploy/.site-dist/* into build/ (keep build/demo and build/.nojekyll), then
cd source/site && node ../tools/build-site.mjs   # put the local preview back (Try the demo -> localhost:5190)
```

## Architecture

### Marketing site: patched, not authored
`source/design/src/site.html` and `site.css` are the design hand-off and are **never edited**. `source/tools/build-site.mjs` reads them and writes `source/site/index.html` and `source/site/public/`. All copy changes, image swaps, injected sections and styles are applied there as string replacements:

- `must(from, to)` throws if `from` is missing, so any drift in the design HTML breaks the build loudly. `mustAll` also checks the match count.
- Each patch has a dated comment recording who approved it. Keep that convention.
- Guards fail the build if banned text comes back: "waitlist", "Planned", "concept", chip names (`esp32`/`xiao`), or a missing noindex or banner.
- Only images that the final HTML references are copied into `site/public/img/`, from `source/assets/img/` first and then `design/src/img/`. Unused images or brand files fail the build.
- Extra sections are kept in their own modules and injected by a `must` patch. For example, `tools/reads-gallery.mjs` holds the inline-SVG reader illustrations in "What it can read", and `tools/data-section.mjs` holds the on-prem / cloud section ("Your data, your choice") and the hero line that links to it. `tools/security-section.mjs` lists security standards with an honest status for each: PanelPal holds no certificate yet, and the build fails on a "certified" claim.

`source/site/index.html` and `site/public/` are generated. Do not hand-edit them.

### Demo (`source/demo/`)
React 18 + TypeScript + Vite + Tailwind v4, routed with react-router (`/step/:n/:s?`). `src/script.ts` defines the guided steps, `src/steps/Step*.tsx` holds one phone screen per step, and `App.tsx` swaps in full desktop layouts (`Desktop5`, `Desktop7`) on wide screens. Example data lives in `src/data.ts`. The 3D floor (`components/Scene3D.tsx`, `components/floor/`) uses three.js/R3F and is lazy-loaded. `BASE_PATH=./` gives the relative base used for `/demo/`.

`tools/sync-design-assets.sh` copies (never edits) the design assets the demo uses into `demo/public/` and rewrites the import paths in `design/plan2d/FloorPlan2D.tsx` into `demo/src/plan/visual/`.

### Design and brand
- `source/design/tokens.css` is the source of truth for colours, type, radius and shadows. Use its CSS variables rather than new hex values where a token exists.
- `source/brand.config.json` lists the only brand files that get published. The builds fail on unused brand files.
- `source/design/README.md` has the copy rules: plain UK English, ASD-STE100 style for technical copy, no invented stats or testimonials, every figure labelled example data, generic machine names only, no hosting or location claims.

### Publishing invariants (checked by `build-combined.sh`)
Both pages carry `<meta name="robots" content="noindex, nofollow">`. `robots.txt` disallows all. The site links "Try the demo" to `./demo/`. Forms make no network calls: `#join` opens a `mailto:` to contact@panelpal.co.uk.
