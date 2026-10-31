# PanelPal — design hand-off for Factory Build

Concept demo. Every machine, name and number in these files is **example data**. Nothing here is published or deployed.
Light theme. All colours, type, radius and shadows come from `tokens.css` (owned by the tokens worker. Do not edit it here).

## Tokens and system (from the tokens worker)
| File | Use |
|---|---|
| `tokens.css` | CSS variables. The source of truth. `src/site.css` and `screens/src/app.css` import it. |
| `tokens.json` | The same tokens as JSON. |
| `theme.tailwind.css` | Tailwind v4 `@theme` mapping of the tokens. |
| `DESIGN-SYSTEM.md`, `contrast-report.md`, `tokens-preview.png`, `src/tokens-preview.html` | Notes on the system, WCAG contrast checks and a preview. |
| `scripts/build_tokens.py` | Builds the token files. |

## Logo — `logo/`
Chosen (by Catalin): **Option C "Camera pal"**. A small camera on its clip mount. The lens is a dial with a blue needle. "Panel" is in ink and "Pal" is in accent `#2874d2`. The wordmark is outlined, so no font is needed. C was tidied for small sizes: a wider landscape case and the LED moved to the top left, so it does not look like a generic photo-app icon at 16 px. The favicon is a solid version.
| File | Use |
|---|---|
| `panelpal-lockup-horizontal-light.svg/.png` | Main logo on white or light backgrounds (header, docs). |
| `panelpal-lockup-horizontal-dark.svg/.png` | Logo on dark backgrounds (`#0f1720`). |
| `panelpal-mark.svg/.png` | The mark alone (avatar, small spaces). |
| `panelpal-favicon.svg`, `panelpal-favicon-32.png` | Favicon. A solid, simplified C (blue tile, white camera, blue dial) that stays clear at 16–32 px. |
| `panelpal-app-icon.svg/.png` | App icon: blue tile with a white mark. |
| `c-cam/…` | Full set for the chosen option C (the main files above are copies), plus `mark-dark`, `favicon.svg`, `favicon-16.png`, `favicon-32.png` and `app-icon-180.png` (apple-touch-icon). |
| `a-dial/…`, `b-value/…` | Earlier options A ("scan dial", the main logo before Catalin chose C) and B ("boxed value"). Kept for history only. Do not use them. |
| `contact-sheet.png` (+ `.html`) | C (marked "Chosen"), then the earlier options A and B, on light and dark backgrounds and at small sizes. |
| `scripts/make_logos.py` | Makes all the logo SVGs. Run it again if you change a colour. |

PNGs are rendered at 4× unless the name gives a pixel size.

## Marketing site — `src/` + renders
| File | Use |
|---|---|
| `src/site.html` | One static, responsive page (breakpoint 760 px). Has `noindex, nofollow`, `lang="en-GB"` and the "Concept demo · example data" banner. Sections: hero, how it works, camera view with confidence, what it reads (reader table), camera hardware renders, AI suggestions, lab example, plans (Free/Pro/Business), privacy & data, book a demo / join the waitlist, footer. |
| `src/site.css` | Page styles. They import `../tokens.css`. |
| `src/img/` | Assets for the page. `s*-*.png` / `sa…sd` are phone screens cropped from the source PDF, with a transparent outside. `img-007/008/009/011/012.jpg` are the camera renders (captioned "rendered mock-ups, not photos"). `cnc-hmi-camera-view.png` is the hero camera view (CNC mill 3, matches the phone). `camera-view.jpg` (growth room controller, from the PDF) is used in the camera section and captioned as a growth room controller. `tier-*.png` are crops of the plan cards. Also logo copies. |
| `site-desktop.png` | Full-page render at 1440 px wide. |
| `site-mobile.png` | Full-page render at 390 px wide (2×). |

Build notes for the site:
- "Try the demo" links to `demo/`. Change it to the real demo URL.
- The waitlist form is design only. It has no action and no backend.
- Load the fonts listed in `tokens.css`: Inter and Source Serif 4 (JetBrains Mono for confidence values).
- You can replace the phone crops with live screenshots from the demo.

## Extra app screens — `screens/`
These use the same app style as the PDF: Site/Machines/Insights/Settings (side nav on desktop, tab bar on mobile), status pills, reading tiles and confidence chips. The data matches `demo/src/data.ts` (Example Factory Ltd · Unit 1, 12 machines, CNC mill 3 / CAM-07 is the first camera).
| File | Use |
|---|---|
| `screens/sensor-added-desktop.png` (1440×900) | After the first camera is added. CNC mill 3 is live with 4 readings and a confidence score for each, a camera view, a 1-hour chart and a run log. The other 11 machines are greyed out with "Inactive · no sensor yet" and **Add device**. |
| `screens/sensor-added-mobile.png` (390×844 @2×) | Mobile version: a live card, then a list of the inactive machines with Add device. |
| `screens/final-factory-desktop.png` (1440×900) | All 12 machines live. Status summary, 2D plan coloured by status, and 3 AI suggestion cards (machine, likely cause, one action) like PDF screen 7. |
| `screens/final-factory-mobile.png` (390×844 @2×) | Mobile version: summary, suggestion cards, then machine tiles. |
| `screens/*-mobile-full.png` | Full-length mobile renders for reference. The fixed tab bar shows in the middle of these images. That comes from the full-page capture and is not a bug in the layout. |
| `screens/src/sensor-added.html`, `final-factory.html`, `app.css` | Source. Responsive: one file gives both the desktop and the mobile layout. |
| `screens/src/cnc-hmi-camera-view.html` → `screens/src/img/cnc-hmi-camera-view.png` (1600×1000) | The camera view of the CNC mill 3 operator screen, made by us (generic HMI, no brand). It shows the 4 values the cards read, each in a blue box with its confidence score (0.97 / 0.96 / 0.98 / ▲ 0.88 check), plus the "Live · read 2 s ago" pill, the CAM-07 tag and an "Example data" tag. Re-render: `node $R/render.mjs <abs>/cnc-hmi-camera-view.html <abs>/img/cnc-hmi-camera-view.png 1600 1000 1`. Also used in the site hero (`src/img/cnc-hmi-camera-view.png`). |
| `screens/src/gen.py` | Makes the two HTML files from example data (`python3 gen.py`). |

## How to re-render
```
R=/home/box/team/factory/design/scripts
node $R/render.mjs      /abs/path/in.html out.png 1440 900 1     # viewport shot
node $R/render.mjs      /abs/path/in.html out.png 390 844 2
node $R/render-full.mjs /abs/path/in.html out.png 1440 [scale]   # full page
```
Use absolute paths.

## Copy rules used
- UK English. UI copy is plain English. Technical copy (steps, hardware, privacy) follows ASD-STE100: short sentences, one instruction in each sentence.
- No customer logos, testimonials or invented stats. No "up to X%" claims. Every figure is labelled "Example data".
- Generic machine names only. No brand-attributed manuals.
- Privacy makes no hosting or location claims ("We will confirm this before launch").
- The only plan number is Free "up to 3 machines", which comes from the source doc and is labelled "example plan". Pro and Business say "Price to come".
