# PanelPal design system v1 (light) — 30 Oct 2026

Files: `tokens.css` (`:root` variables), `theme.tailwind.css` (Tailwind v4 `@theme`, same values), `tokens.json`, `contrast-report.md`, `tokens-preview.png`. Source of truth: `scripts/build_tokens.py`. Edit the script, then run `python3 scripts/build_tokens.py`. Do not edit the CSS by hand.

The look follows the overview PDF screens (p-02 to p-08, images/img-001 to img-006, img-010): white pages, light grey panels, thin grey outlines, one calm blue, small coloured dots for status. It is flat. Use outlines, not heavy shadows.

## Palette (sampled from the PDF renders with PIL)
| Token | Hex | Use | Source |
|---|---|---|---|
| bg / surface | #ffffff | page, cards | all pages |
| surface-2 | #f3f3f2 | quiet fills, inactive tiles | p-04, p-07 |
| surface-3 | #ededec | grey panels: camera preview, notice box, plan canvas | p-03, p-04, p-07 |
| border | #d8d8d4 | card and phone outlines | p-04, p-05 |
| border-strong | #c1c3bc | inputs, unselected chips | img-001 |
| text | #161616 | body and titles | p-03, p-07 |
| muted | #5f5f5d | secondary text | p-05, p-06 |
| faint | #6a6a68 | captions, hints (PDF #7c7c7c darkened for AA) | p-03 |
| accent | #2874d2 | brand blue: progress, selected tab, primary outline, chart line, focus | img-001..006 (#2a78d6, 1 step darker) |
| accent-strong | #1d5fae | blue text on grey or on accent-soft; hover | derived |
| accent-soft | #e5effa | primary button fill, selected chip, highlighted box | img-001..006 |

## Status colours
Rule: every status = icon + word + colour. Never use colour alone. Use `--color-X` for text and icons, `--color-X-dot` for small dots on white, `--color-X-soft` for chip fill.
| Status | Text | Dot | Soft | Icon + word | Source |
|---|---|---|---|---|---|
| running | #0b7a0b | #0ca30c | #dbf1db | ● Running | img-001, img-003 |
| idle | #6141c9 | #7c5ce6 | #eee9fc | ❚❚ Idle | new (PDF has none) |
| warning | #8a5a00 | #fab219 | #fdf3dc | ▲ Warning | img-004 |
| fault | #b42d2d | #d03b3b | #fbf0f0 | ✕ Fault / Alarm | img-004, img-006 |
| offline | #5f5f5d | #8e8b8b | #ededec | ◌ No signal (dashed outline) | p-08 |
| inactive | #6b6b69 | #c1c3bc | #f3f3f2 | ○ Not set up (grey tile, no value) | img-002 |
- `warning-dot` (#fab219) is 1.8:1 on white. Use it only for bars and fills next to warning text and an icon.
- Inactive is for the "sensor added, other machines inactive" page. Inactive machines show a grey tile, the word "Not set up" and an "Add camera" link. Do not show numbers for them.
- Offline means a camera was set up but now sends nothing. Show "No signal". Never show the last value as live.

## Type (free OFL Google fonts)
`<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">`
- Display: **Source Serif 4** 400. Use it for marketing headlines and section titles ("How it works"). The PDF uses a light serif here.
- UI and body: **Inter** 400/500/600. App screen titles are Inter 600 (PDF style). Readings use tabular figures (`.reading`).
- Mono: **JetBrains Mono**. Use it only for device IDs and confidence numbers.
- The PDF fonts (Anthropic Serif/Sans) are not free. These are the closest free matches.
- Scale (`--type-*`): xs 12, sm 13, base 15, lg 17, xl 20, 2xl 24, 3xl 32, 4xl 44, 5xl 60 px. Line height: tight 1.15 (headlines), snug 1.3 (titles), normal 1.5 (body), relaxed 1.6 (marketing body). Weights: 400, 500, 600 only.

## Radius, spacing, shadow, focus
- Radius: sm 4, control 8 (buttons, inputs), card 10, lg 16 (panels, camera view), phone 28, pill 999 (chips, segmented tabs).
- Spacing (`--space-*`): 0, 4, 8, 12, 16, 24, 32, 48, 64, 96 px. Page padding 24, card padding 16.
- Shadows: card = 1 px hairline only; raised = menus and sheets; phone = device frame on the marketing site.
- Focus: 2 px blue ring, 2 px offset (`--shadow-focus` or `:focus-visible` outline). Do not remove it.

## Components
- **Card:** white, 1 px `border`, radius card, padding 16. Label in `muted` 13 px, value in `text` 24 px 600.
- **Primary button (PDF style):** `accent-soft` fill, 1.5 px `accent` outline, `text` label, 600. Full width at the bottom of a phone step.
- **Solid button (marketing CTA only, e.g. "Book a demo"):** `accent` fill, white label.
- **Secondary button:** white, `border-strong` outline.
- **Chips:** pill. Selected = `accent-soft` fill + `accent` outline. Add chip = dashed outline.
- **Segmented tabs (Machines / 2D plan / 3D view):** pill track, selected = `accent-soft`.
- **Step bar:** 4 segments, 3 px high; done = `accent`, to do = `border`.
- **AI suggestion card:** white card with a 4 px left bar in the status `-dot` colour, a dot + small label, a bold title, muted text, one action button.
- **Camera-view value boxes** (on the dark camera photo, img-010): 1.5 px `cam-box` outline around each value. Label above it: "Name value unit · confidence", white text on a fill:
  - 0.90 or more: `cam-high` #0c6992.
  - 0.70 to 0.89: `cam-mid` #9a6500, add "▲ check".
  - below 0.70: `cam-low` #b42d2d, dashed box, add "✕ unsure".
  - LIVE pill: `cam-scrim` #1f2328, red dot `cam-live` #e5372a, text "LIVE · cam-04 · every 2 s".
- **Charts:** line `chart-line`, second series `chart-line-2`, alert limit = dashed `chart-limit` with the word "limit", grid `chart-grid`, axis text `chart-axis`. Label all figures "Example data".

## Contrast (WCAG 2.2 AA) — 0 failures, 54 checks (see contrast-report.md)
- All text tokens pass 4.5:1 on bg, surface-2 and surface-3. Status text passes on its own soft fill.
- Dots, focus ring and chart lines pass 3:1.
- Fixes made: accent #2a78d6 → #2874d2 (white on blue was 4.42); faint #737371 → #6a6a68; status text colours darkened from the PDF dots.
- Rule: `accent` text only on white. On grey, use `accent-strong`.

## Switching from the dark theme
Legacy aliases (zone-*, paper*, ink*, *-on-light, chart-baseline, chart-anomaly, machine-fill, grid-line) are kept and mapped to light values, so the old demo still compiles. Remove them later.

Names match `factory/design/tokens` v1: `--color-bg/surface/surface-2/surface-3/border/text/muted/faint/accent/accent-soft/accent-ink/accent-strong`, status names, `--radius-*`, `--spacing-*`, `--space-*`, `--type-*`. Replace the `@theme` block in `src/theme.css` with `theme.tailwind.css`. New: `*-dot`, `inactive*`, `border-strong`, `chart-limit`, `chart-line-2`, `chart-axis`, `cam-*`, `plan-*`, `radius-phone`, `leading-*`, `font-weight-*`, `shadow-raised/phone/focus`. Note: `accent-ink` is now white (was dark).
