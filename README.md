# PanelPal

Demo with example data. Live at https://panelpal.co.uk/

- `build/`: the static files that GitHub Pages publishes (site at the root, guided demo in `build/demo/`). The Pages workflow uploads only this folder.
- `source/`: the code that makes `build/`.
  - `source/demo/`: the guided demo (React, TypeScript, Vite).
  - `source/site/` and `source/tools/build-site.mjs`: the marketing site build.
  - `source/design/`: design system, tokens, logo and site design.
  - `source/shared/`, `source/assets/`: shared code and images.

## Rebuild

1. In `source/demo/` and `source/site/`, run `npm ci`.
2. Start the demo dev server on port 5190 (`npm run dev` in `source/demo/`).
3. Run `source/tools/build-combined.sh`. The output goes to `source/deploy/out/`.
4. Copy `source/deploy/out/` into `build/`, then commit and push.
