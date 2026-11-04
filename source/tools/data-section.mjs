// "Your data, your choice" section: on-prem or cloud. Injected by build-site.mjs after "How it works".
// 4 Nov (Catalin): customers do not want their production data on the internet. Show the on-prem option first,
// with a small PanelPal computer in the building, and the cloud as the simple option.
// Inline SVG only (no image files). Colours are design/tokens.css variables where a token exists.

const lock = (x, y, s = 1, fill = "#2874d2") => `<g transform="translate(${x} ${y}) scale(${s})">
  <circle r="15" fill="${fill}"/><circle r="15" fill="none" stroke="#fff" stroke-width="2.5"/>
  <path d="M-5 -1 v-3.5 a5 5 0 0 1 10 0 v3.5" fill="none" stroke="#fff" stroke-width="2.2"/>
  <rect x="-7.5" y="-1.5" width="15" height="11" rx="2" fill="#fff"/><circle cy="3.5" r="1.8" fill="${fill}"/></g>`;

const lockIcon = (cls = "") => `<svg${cls ? ` class="${cls}"` : ""} viewBox="-16 -16 32 32" aria-hidden="true">${lock(0, 0)}</svg>`;

const machine = (x, y, name) => `<g>
  <rect x="${x}" y="${y}" width="116" height="58" rx="8" fill="#fff" stroke="#a6a6a6" stroke-width="1.5"/>
  <rect x="${x + 10}" y="${y + 10}" width="44" height="26" rx="3" fill="#1f2328"/>
  <rect x="${x + 14}" y="${y + 15}" width="22" height="5" rx="1" fill="#6fd06f"/><rect x="${x + 14}" y="${y + 24}" width="32" height="5" rx="1" fill="#7fb3ee"/>
  <text x="${x + 10}" y="${y + 50}" font-size="12" font-weight="600" fill="#161616">${name}</text>
  <rect x="${x + 70}" y="${y + 6}" width="22" height="16" rx="4" fill="#fff" stroke="#5f5f5d" stroke-width="1.4"/>
  <circle cx="${x + 81}" cy="${y + 14}" r="4.4" fill="#2874d2"/><circle cx="${x + 81}" cy="${y + 14}" r="1.6" fill="#fff"/>
  </g>`;

const ART = `<svg class="dp-art" viewBox="0 0 600 340" role="img" aria-labelledby="dp-art-t">
  <title id="dp-art-t">On-prem: the cameras on three machines send their readings to a small PanelPal computer in your building. A screen in the office shows the dashboard. The link to the cloud is cut: nothing leaves your site.</title>
  <defs>
    <linearGradient id="dp-box" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3d40"/><stop offset="1" stop-color="#1f2328"/></linearGradient>
    <pattern id="dp-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#ededec" stroke-width="1"/></pattern>
  </defs>
  <g font-family="Inter, system-ui, sans-serif">
  <!-- building -->
  <rect x="14" y="34" width="440" height="292" rx="18" fill="url(#dp-grid)" stroke="#2874d2" stroke-width="2.5"/>
  <rect x="14" y="34" width="440" height="292" rx="18" fill="#fff" opacity=".55"/>
  <rect x="30" y="20" width="214" height="30" rx="15" fill="#2874d2"/>
  <text x="137" y="40" font-size="13.5" font-weight="600" fill="#fff" text-anchor="middle">Your building · your network</text>
  <!-- machines with cameras -->
  ${machine(40, 76, "CNC mill 3")}${machine(40, 160, "Press 2")}${machine(40, 244, "Oven 1")}
  <!-- links: cameras to the box -->
  <g fill="none" stroke="#2874d2" stroke-width="2.2" stroke-dasharray="5 6" class="dp-flow">
    <path d="M132 90 C 200 90, 200 196, 238 206"/><path d="M132 174 C 190 174, 200 212, 238 214"/><path d="M132 258 C 200 258, 200 228, 238 222"/>
  </g>
  <!-- the PanelPal box -->
  <rect x="238" y="188" width="112" height="52" rx="10" fill="url(#dp-box)"/>
  <rect x="248" y="200" width="44" height="4" rx="2" fill="#5f5f5d"/><rect x="248" y="208" width="44" height="4" rx="2" fill="#5f5f5d"/><rect x="248" y="216" width="44" height="4" rx="2" fill="#5f5f5d"/>
  <circle cx="334" cy="228" r="4" fill="#0ca30c"/><circle cx="334" cy="228" r="7.5" fill="#0ca30c" opacity=".25"/>
  <rect x="246" y="240" width="96" height="5" rx="2" fill="#161616" opacity=".25"/>
  <text x="294" y="266" font-size="13" font-weight="700" fill="#161616" text-anchor="middle">PanelPal box</text>
  <text x="294" y="283" font-size="11.5" fill="#5f5f5d" text-anchor="middle">runs on your site</text>
  ${lock(346, 190)}
  <!-- office screen with the dashboard -->
  <path d="M300 188 V 176 H 368 V 167" fill="none" stroke="#5f5f5d" stroke-width="2"/>
  <rect x="300" y="64" width="136" height="88" rx="8" fill="#1f2328"/>
  <rect x="306" y="70" width="124" height="72" rx="4" fill="#fff"/>
  <rect x="312" y="76" width="36" height="24" rx="3" fill="#dbf1db"/><rect x="352" y="76" width="36" height="24" rx="3" fill="#dbf1db"/><rect x="392" y="76" width="32" height="24" rx="3" fill="#fdf3dc"/>
  <text x="318" y="93" font-size="10" font-weight="700" fill="#0b7a0b">312</text><text x="358" y="93" font-size="10" font-weight="700" fill="#0b7a0b">87%</text><text x="397" y="93" font-size="10" font-weight="700" fill="#8a5a00">42%</text>
  <polyline points="312,132 328,124 344,128 360,114 376,118 392,108 408,112 424,104" fill="none" stroke="#2874d2" stroke-width="2"/>
  <rect x="356" y="152" width="24" height="10" fill="#5f5f5d"/><rect x="344" y="162" width="48" height="5" rx="2" fill="#5f5f5d"/>
  <text x="368" y="58" font-size="11.5" fill="#5f5f5d" text-anchor="middle">Your dashboard</text>
  <!-- cut link to the cloud -->
  <path d="M454 214 H 520" stroke="#c1c3bc" stroke-width="2.5" stroke-dasharray="4 5"/>
  <circle cx="488" cy="214" r="13" fill="#fff" stroke="#d03b3b" stroke-width="2.5"/>
  <path d="M482 208 l12 12 M494 208 l-12 12" stroke="#d03b3b" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M528 222 a16 16 0 0 1 2 -31 a22 22 0 0 1 42 -4 a15 15 0 0 1 14 25 a12 12 0 0 1 -6 10 z" fill="#f3f3f2" stroke="#c1c3bc" stroke-width="2"/>
  <text x="556" y="250" font-size="12" font-weight="600" fill="#b42d2d" text-anchor="middle">Nothing</text>
  <text x="556" y="265" font-size="12" font-weight="600" fill="#b42d2d" text-anchor="middle">leaves</text>
  <text x="556" y="280" font-size="12" font-weight="600" fill="#b42d2d" text-anchor="middle">your site</text>
  </g>
</svg>`;

const ICON_BOX = `<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="13" width="30" height="16" rx="4" fill="#1f2328"/><rect x="9" y="18" width="12" height="2" rx="1" fill="#8e8b8b"/><rect x="9" y="22" width="12" height="2" rx="1" fill="#8e8b8b"/><circle cx="30" cy="25" r="2" fill="#0ca30c"/></svg>`;
const ICON_CLOUD = `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M11 30 a7 7 0 0 1 1 -14 a10 10 0 0 1 19 -2 a7 7 0 0 1 -1 16 z" fill="#e5effa" stroke="#2874d2" stroke-width="2"/></svg>`;

export const DATA_SECTION_HTML = `<section id="data"><div class="wrap">
  <div class="sec-head"><p class="eyebrow">Your data, your choice</p><h2 class="h2">Run it in your building, or in our cloud.</h2><p>Every reading belongs to you. You choose where it lives.</p></div>
  <div class="dp-top">
    <figure class="dp-fig">${ART.replace(/\n\s*/g, "")}<figcaption>On-prem: the cameras talk only to a small PanelPal computer on your site.</figcaption></figure>
    <blockquote class="dp-quote">
      ${lockIcon("dp-lock")}
      <p class="q">Your data is yours. <em>Keep it in your building.</em></p>
      <p>Output, cycle times and machine settings show how your business runs. They are your trade secrets. With on-prem, they stay on your own network and never go on the internet.</p>
    </blockquote>
  </div>
  <div class="dp">
    <div class="card dp-opt on">
      <div class="dp-h">${ICON_BOX}<div><span class="dp-tag">Most private</span><h3>On-prem</h3><span class="dp-sub">Your own computer, in your building</span></div></div>
      <ul><li>A small PanelPal computer runs on your site</li><li>The cameras send readings only to it, over your own network</li><li>Readings, history and dashboards stay in your building</li><li>You decide if anything goes outside</li></ul>
    </div>
    <div class="card dp-opt">
      <div class="dp-h">${ICON_CLOUD}<div><span class="dp-tag soft">Simplest</span><h3>Cloud</h3><span class="dp-sub">We run it for you</span></div></div>
      <ul><li>Nothing to install or look after</li><li>See your sites from anywhere</li><li>Updates are done for you</li><li>The quickest way to start</li></ul>
    </div>
  </div>
  <p class="note">Tell us which one you need when you book your demo.</p>
</div></section>

`;

export const DATA_SECTION_CSS = `.dp-top{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:24px;align-items:stretch}
.dp-fig{margin:0;background:var(--color-surface-2);border-radius:var(--radius-card);padding:22px 22px 16px;display:flex;flex-direction:column;justify-content:center}
.dp-art{width:100%;height:auto;display:block}
.dp-fig figcaption{font-size:var(--type-sm);color:var(--color-muted);margin-top:10px;text-align:center}
.dp-flow{animation:dp-flow 1.2s linear infinite}
@keyframes dp-flow{to{stroke-dashoffset:-22}}
@media (prefers-reduced-motion:reduce){.dp-flow{animation:none}}
.dp-quote{margin:0;background:var(--color-ink);color:#fff;border-radius:var(--radius-card);padding:36px 34px;display:flex;flex-direction:column;justify-content:center}
.dp-lock{width:44px;height:44px;margin-bottom:18px}
.dp-quote .q{font-family:var(--font-display);font-size:34px;line-height:1.15;margin:0 0 16px;letter-spacing:-.01em}
.dp-quote .q em{font-style:italic;color:#9cc4f2}
.dp-quote p:not(.q){margin:0;color:#d8d8d4;font-size:var(--type-base);line-height:var(--leading-relaxed)}
.dp{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:24px}
.dp-opt{padding:24px 26px}
.dp-opt.on{border:2px solid var(--color-accent)}
.dp-h{display:flex;gap:14px;align-items:flex-start;margin-bottom:14px}
.dp-h svg{width:44px;height:44px;flex:none;background:var(--color-surface-2);border-radius:10px}
.dp-h h3{font-family:var(--font-display);font-weight:400;font-size:var(--type-2xl);margin:4px 0 0}
.dp-sub{font-size:var(--type-sm);color:var(--color-muted)}
.dp-tag{display:inline-block;font-size:var(--type-xs);font-weight:600;border-radius:var(--radius-pill);padding:2px 10px;background:var(--color-accent);color:var(--color-accent-ink)}
.dp-tag.soft{background:var(--color-accent-soft);color:var(--color-accent-strong)}
.dp-opt ul{padding:0;margin:0;list-style:none;display:grid;gap:8px;font-size:var(--type-sm)}
.dp-opt li{display:grid;grid-template-columns:18px 1fr;gap:8px}
.dp-opt li::before{content:"✓";color:var(--color-running-dot);font-weight:700}
.own{display:flex;gap:10px;align-items:center;margin:22px 0 0;font-size:var(--type-sm);color:var(--color-muted)}
.own svg{width:28px;height:28px;flex:none}
.own b{color:var(--color-text)}
@media (max-width:760px){.dp-top,.dp{grid-template-columns:1fr}.dp-fig{padding:14px 10px 12px}.dp-quote{padding:28px 24px}.dp-quote .q{font-size:28px}}`;

// Hero line under the buttons: links to the section.
export const HERO_LINE_HTML = `\n    <p class="own">${lockIcon()}<span><b>Your data stays yours.</b> Run it on site, or in our cloud. <a href="#data">See how</a></span></p>`;
