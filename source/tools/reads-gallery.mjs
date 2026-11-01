// "What it can read" gallery: one small illustration per reader, shown above the reads table.
// Inline SVG (no image files), so build-site.mjs's "only used images" checks are not affected.
// Colours come from design/tokens.css where a token exists. Generic instruments only: no brands, no chip names.

const TILES = [];
const tile = (name, label, svg) => TILES.push({ name, label, svg });

// ---------- Screens and control panels: LCD controller ----------
{
  let btns = "";
  [["\u25b2", 24], ["\u25bc", 36], ["SET", 48]].forEach(([t, y]) => {
    btns += `<rect x="110" y="${y}" width="22" height="9" rx="2" fill="url(#rg-btn)" stroke="#6a6a68" stroke-width=".6"/><text x="121" y="${y + 6.4}" font-family="Inter, system-ui, sans-serif" font-size="${t === "SET" ? 5 : 5.5}" font-weight="700" fill="#2a2c2e" text-anchor="middle">${t}</text>`;
  });
  tile("Screens and panels", "Controller panel with an LCD screen showing temperature 21.4 degrees and humidity 65 percent, the temperature boxed by the camera", `
  <defs>
    <linearGradient id="rg-panel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3f3f2"/><stop offset="1" stop-color="#c1c3bc"/></linearGradient>
    <linearGradient id="rg-lcd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cfdcb8"/><stop offset="1" stop-color="#a7bc89"/></linearGradient>
    <linearGradient id="rg-btn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d8d8d4"/></linearGradient>
  </defs>
  <rect x="16" y="14" width="128" height="72" rx="5" fill="url(#rg-panel)" stroke="#8e8b8b"/>
  ${[[21, 19], [139, 19], [21, 81], [139, 81]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#a6a6a6" stroke="#6a6a68" stroke-width=".5"/>`).join("")}
  <rect x="25" y="22" width="78" height="44" rx="2.5" fill="#2a2c2e"/>
  <rect x="28" y="25" width="72" height="38" rx="1" fill="url(#rg-lcd)"/>
  <g font-family="JetBrains Mono, ui-monospace, monospace" fill="#1f2a14">
    <text x="32" y="33" font-size="5">TEMP</text><text x="96" y="43" font-size="13" font-weight="500" text-anchor="end">21.4\u00b0</text>
    <text x="32" y="51" font-size="5">RH</text><text x="96" y="58" font-size="8" font-weight="500" text-anchor="end">65 %</text>
  </g>
  <rect x="55" y="30" width="44" height="16" rx="1.5" fill="none" stroke="#2f8fd0" stroke-width="1.4"/>
  ${btns}
  <circle cx="114" cy="68" r="2.6" fill="#0ca30c"/><circle cx="114" cy="68" r="4.5" fill="#0ca30c" opacity=".2"/>
  <circle cx="125" cy="68" r="2.6" fill="#c1c3bc"/>
  <rect x="25" y="72" width="78" height="7" rx="1" fill="#d8d8d4"/>
  <text x="64" y="77.4" font-family="Inter, system-ui, sans-serif" font-size="4.6" font-weight="600" fill="#5f5f5d" text-anchor="middle" letter-spacing=".6">CONTROLLER</text>`);
}

// ---------- Digits and text: seven-segment display ----------
const SEGS = { 0: "abcdef", 1: "bc", 2: "abged", 3: "abgcd", 4: "fgbc", 5: "afgcd", 6: "afgedc", 7: "abc", 8: "abcdefg", 9: "abcdfg" };
function digit(x, y, d, w = 17, h = 34, t = 4) {
  const hh = h / 2, g = 0.8;
  const r = {
    a: [x + t + g, y, w - 2 * t - 2 * g, t], d: [x + t + g, y + h - t, w - 2 * t - 2 * g, t], g: [x + t + g, y + hh - t / 2, w - 2 * t - 2 * g, t],
    f: [x, y + t + g, t, hh - t - 2 * g], b: [x + w - t, y + t + g, t, hh - t - 2 * g],
    e: [x, y + hh + g, t, hh - t - 2 * g], c: [x + w - t, y + hh + g, t, hh - t - 2 * g],
  };
  const on = SEGS[d];
  return Object.entries(r).map(([k, [rx, ry, rw, rh]]) =>
    `<rect x="${rx.toFixed(1)}" y="${ry.toFixed(1)}" width="${rw.toFixed(1)}" height="${rh.toFixed(1)}" rx="1.2" fill="${on.includes(k) ? "url(#rg-seg-on)" : "#24090a"}"/>`).join("");
}
tile("Digit displays", "Seven-segment display showing 07.28", `
  <defs><linearGradient id="rg-seg-on" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5a4a"/><stop offset="1" stop-color="#e5372a"/></linearGradient></defs>
  <rect x="30" y="28" width="100" height="48" rx="4" fill="#1f2328"/>
  <rect x="34" y="32" width="92" height="40" rx="2" fill="#120707"/>
  ${[0, 7, 2, 8].map((d, i) => digit(39 + i * 21.5, 35, d)).join("")}
  <circle cx="79.5" cy="68" r="1.9" fill="url(#rg-seg-on)"/>`);

// ---------- Dial: round pressure gauge ----------
{
  const cx = 80, cy = 46, R = 33, a0 = -225, a1 = 45; // sweep 270 degrees, clockwise from bottom left
  const pt = (deg, r) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
  let ticks = "", nums = "";
  for (let i = 0; i <= 50; i++) {
    const deg = a0 + ((a1 - a0) * i) / 50, major = i % 5 === 0;
    const [x1, y1] = pt(deg, R - 3), [x2, y2] = pt(deg, R - (major ? 8 : 5.5));
    ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#161616" stroke-width="${major ? 1.1 : 0.5}"/>`;
    if (major && i % 10 === 0) { const [tx, ty] = pt(deg, R - 13.5); nums += `<text x="${tx.toFixed(1)}" y="${(ty + 2).toFixed(1)}">${i / 10}</text>`; }
  }
  const red = (() => { const s = pt(a0 + 270 * 0.84, R - 4.2), e = pt(a1, R - 4.2); return `<path d="M${s[0].toFixed(1)} ${s[1].toFixed(1)} A${R - 4.2} ${R - 4.2} 0 0 1 ${e[0].toFixed(1)} ${e[1].toFixed(1)}" fill="none" stroke="#d03b3b" stroke-width="2.4"/>`; })();
  const nd = a0 + 270 * 0.62, [nx, ny] = pt(nd, R - 7), [tx, ty] = pt(nd + 180, 7);
  tile("Dial", "Round pressure gauge with a needle at about 3 bar", `
  <defs>
    <linearGradient id="rg-bezel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f4f2"/><stop offset=".5" stop-color="#9a9c98"/><stop offset="1" stop-color="#e2e3df"/></linearGradient>
    <linearGradient id="rg-brass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a5a1c"/><stop offset=".5" stop-color="#d49a52"/><stop offset="1" stop-color="#8a5a1c"/></linearGradient>
  </defs>
  <rect x="76" y="80" width="8" height="12" rx="1" fill="url(#rg-brass)"/>
  <circle cx="${cx}" cy="${cy}" r="${R + 5}" fill="url(#rg-bezel)"/>
  <circle cx="${cx}" cy="${cy}" r="${R + 1}" fill="#6a6a68"/>
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="#fff"/>
  ${red}${ticks}
  <g font-family="Inter, system-ui, sans-serif" font-size="6" font-weight="600" fill="#161616" text-anchor="middle">${nums}<text x="${cx}" y="${cy + 17}" font-size="5" font-weight="500" fill="#5f5f5d">bar</text></g>
  <line class="rg-needle" x1="${tx.toFixed(1)}" y1="${ty.toFixed(1)}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="#161616" stroke-width="1.8" stroke-linecap="round"/>
  <circle cx="${cx}" cy="${cy}" r="3" fill="#161616"/>
  <path d="M${cx - R + 6} ${cy - 12} A${R} ${R} 0 0 1 ${cx + 8} ${cy - R + 3}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2"/>`);
}

// ---------- Counter: rolling digit wheels ----------
{
  const wheel = (x, top, mid, bg, fg, off = 0) => `
    <g clip-path="url(#rg-wheel-${x})">
      <rect x="${x}" y="30" width="22" height="40" fill="${bg}"/>
      <g font-family="JetBrains Mono, ui-monospace, monospace" font-size="30" font-weight="500" fill="${fg}" text-anchor="middle">
        ${top !== null ? `<text x="${x + 11}" y="${61 - 36 + off}">${top}</text>` : ""}<text x="${x + 11}" y="${61 + off}">${mid}</text>
      </g>
      <rect x="${x}" y="30" width="22" height="40" fill="url(#rg-roll)"/>
    </g>
    <clipPath id="rg-wheel-${x}"><rect x="${x}" y="30" width="22" height="40" rx="1.5"/></clipPath>`;
  tile("Counter", "Mechanical counter with rolling digit wheels, the last wheel turning from 7 to 8", `
  <defs>
    <linearGradient id="rg-roll" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>
    <linearGradient id="rg-frame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2e3df"/><stop offset=".5" stop-color="#8e8b8b"/><stop offset="1" stop-color="#c1c3bc"/></linearGradient>
  </defs>
  <rect x="26" y="24" width="108" height="52" rx="5" fill="url(#rg-frame)"/>
  <rect x="30" y="28" width="100" height="44" rx="3" fill="#161616"/>
  ${wheel(33, null, 2, "#2a2c2e", "#f3f3f2")}${wheel(57, null, 0, "#2a2c2e", "#f3f3f2")}${wheel(81, null, 1, "#2a2c2e", "#f3f3f2")}${wheel(105, 8, 7, "#c8302a", "#fff", 15)}`);
}

// ---------- Colour: indicator lamps ----------
{
  const lamp = (cx, on, glow, base) => `
    <circle cx="${cx}" cy="50" r="17" fill="url(#rg-lamp-ring)"/>
    <circle cx="${cx}" cy="50" r="12.5" fill="${on ? `url(#rg-lamp-${base})` : "url(#rg-lamp-off)"}"/>
    ${on ? `<circle cx="${cx}" cy="50" r="20" fill="${glow}" opacity=".18"/>` : ""}
    <ellipse cx="${cx - 4}" cy="45" rx="5" ry="3" fill="#fff" opacity="${on ? 0.55 : 0.7}"/>`;
  tile("Colour", "Three indicator lamps: off, green on, off", `
  <defs>
    <linearGradient id="rg-lamp-ring" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8e8b8b"/><stop offset=".5" stop-color="#2a2c2e"/><stop offset="1" stop-color="#5f5f5d"/></linearGradient>
    <radialGradient id="rg-lamp-off" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#d8d8d4"/><stop offset="1" stop-color="#8e8b8b"/></radialGradient>
    <radialGradient id="rg-lamp-green" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#b8f5b8"/><stop offset=".55" stop-color="#0ca30c"/><stop offset="1" stop-color="#0b5a0b"/></radialGradient>
  </defs>
  ${lamp(42, false)}${lamp(80, true, "#0ca30c", "green")}${lamp(118, false)}`);
}

// ---------- Level: sight glass ----------
{
  let scale = "";
  for (let i = 0; i <= 8; i++) { const y = 18 + i * 8; scale += `<line x1="96" y1="${y}" x2="${i % 4 === 0 ? 103 : 100}" y2="${y}" stroke="#5f5f5d" stroke-width="${i % 4 === 0 ? 1 : 0.6}"/>`; }
  tile("Level", "Sight glass tube about 60 percent full", `
  <defs>
    <linearGradient id="rg-glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cfe3f2"/><stop offset=".35" stop-color="#f6fbff"/><stop offset="1" stop-color="#b9cfe0"/></linearGradient>
    <linearGradient id="rg-liquid" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1d5fae"/><stop offset=".4" stop-color="#4a92e6"/><stop offset="1" stop-color="#1d5fae"/></linearGradient>
    <linearGradient id="rg-cap" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8e8b8b"/><stop offset=".45" stop-color="#f3f3f2"/><stop offset="1" stop-color="#6a6a68"/></linearGradient>
  </defs>
  <rect x="68" y="10" width="24" height="8" rx="2" fill="url(#rg-cap)"/>
  <rect x="68" y="82" width="24" height="8" rx="2" fill="url(#rg-cap)"/>
  <rect x="72" y="16" width="16" height="68" rx="7" fill="url(#rg-glass)" stroke="#8e8b8b" stroke-width="1"/>
  <rect x="73.5" y="43" width="13" height="39.5" rx="5.5" fill="url(#rg-liquid)"/>
  <rect x="73.5" y="42" width="13" height="2.5" rx="1" fill="#7fb3ee"/>
  <rect x="76" y="20" width="2.5" height="60" rx="1.2" fill="#fff" opacity=".7"/>
  ${scale}
  <text x="106" y="47" font-family="JetBrains Mono, ui-monospace, monospace" font-size="7" fill="#1d5fae" font-weight="500">60 %</text>
  <path d="M93 43 l3 -2.5 v5 z" fill="#1d5fae"/>`);
}

// ---------- Presence: tray on a shelf, boxed by the camera ----------
tile("Presence", "A tray on a shelf, boxed by the camera and marked present", `
  <rect x="22" y="70" width="116" height="5" rx="1" fill="#a6a6a6"/>
  <rect x="28" y="75" width="4" height="16" fill="#c1c3bc"/><rect x="128" y="75" width="4" height="16" fill="#c1c3bc"/>
  <path d="M48 52 h44 l-4 18 h-36 z" fill="#ededec" stroke="#8e8b8b"/>
  <rect x="46" y="49" width="48" height="5" rx="1.5" fill="#d8d8d4" stroke="#8e8b8b"/>
  <rect x="104" y="58" width="22" height="12" rx="1" fill="none" stroke="#c1c3bc" stroke-dasharray="2 2"/>
  <rect x="40" y="42" width="60" height="32" rx="2" fill="none" stroke="#2f8fd0" stroke-width="1.6"/>
  <rect x="40" y="30" width="46" height="12" rx="2" fill="#0c6992"/>
  <text x="44" y="38.5" font-family="Inter, system-ui, sans-serif" font-size="7" font-weight="600" fill="#fff">✓ present</text>`);

// ---------- Motion: fan that turns ----------
{
  const blade = (r) => `<path d="M80 50 C 74 40, 76 30, 84 27 C 90 33, 88 43, 80 50 z" fill="#5f5f5d" transform="rotate(${r} 80 50)"/>`;
  tile("Motion", "A fan that turns, marked running", `
  <circle cx="80" cy="50" r="30" fill="#ededec" stroke="#8e8b8b" stroke-width="1.5"/>
  <circle cx="80" cy="50" r="26" fill="#f6f6f5"/>
  <g class="rg-spin">${blade(0)}${blade(120)}${blade(240)}</g>
  <circle cx="80" cy="50" r="4.5" fill="#2a2c2e"/>
  <g fill="none" stroke="#2f8fd0" stroke-width="1.6" stroke-linecap="round">
    <path d="M118 36 a40 40 0 0 1 0 28"/><path d="M124 31 a48 48 0 0 1 0 38" opacity=".55"/>
  </g>
  <rect x="104" y="80" width="42" height="12" rx="6" fill="#dbf1db"/>
  <circle cx="111" cy="86" r="2.4" fill="#0ca30c"/>
  <text x="116" y="88.5" font-family="Inter, system-ui, sans-serif" font-size="7" font-weight="600" fill="#0b7a0b">running</text>`);
}

// ---------- Count: pots in a tray ----------
{
  let pots = "";
  [[46, 40], [80, 40], [114, 40], [46, 70], [80, 70], [114, 70]].forEach(([x, y], i) => {
    pots += `<circle cx="${x}" cy="${y}" r="11" fill="#8a5a1c"/><circle cx="${x}" cy="${y}" r="8.5" fill="#5c3a10"/>
      <path d="M${x} ${y} c-8 -2 -9 -9 -6 -10 c4 0 6 4 6 10 z M${x} ${y} c8 -2 9 -9 6 -10 c-4 0 -6 4 -6 10 z M${x} ${y} c-3 6 1 9 0 9 c-1 0 3 -3 0 -9 z" fill="#3fa34d"/>
      <rect x="${x - 13}" y="${y - 13}" width="26" height="26" rx="2" fill="none" stroke="#2f8fd0" stroke-width="1.1"/>
      <circle cx="${x + 11}" cy="${y - 11}" r="4.6" fill="#0c6992"/><text x="${x + 11}" y="${y - 8.6}" font-family="Inter, system-ui, sans-serif" font-size="6.2" font-weight="700" fill="#fff" text-anchor="middle">${i + 1}</text>`;
  });
  tile("Count", "A tray of six pots, each one boxed and numbered", `
  <rect x="28" y="22" width="104" height="66" rx="4" fill="#2a2c2e"/>${pots}`);
}

// ---------- Area: canopy cover in a tray ----------
tile("Area", "Top view of a tray, with the green leaf area outlined and 42 percent covered", `
  <defs><pattern id="rg-soil" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#6b4a26"/><circle cx="2" cy="2" r=".8" fill="#83603a"/><circle cx="5" cy="4.5" r=".6" fill="#553a1c"/></pattern></defs>
  <rect x="28" y="20" width="104" height="66" rx="4" fill="url(#rg-soil)" stroke="#2a2c2e" stroke-width="2"/>
  <path d="M38 34 c10 -10 28 -8 34 2 c8 -6 22 -2 22 10 c10 2 12 14 2 20 c2 10 -12 14 -20 8 c-8 8 -24 6 -26 -4 c-12 0 -18 -12 -10 -20 c-6 -4 -6 -12 -2 -16 z" fill="#3fa34d"/>
  <path d="M46 40 c6 -4 12 -2 14 2 M70 52 c6 -4 12 -2 14 4 M54 62 c4 -3 10 -2 12 2" fill="none" stroke="#2c7a37" stroke-width="1.2"/>
  <path d="M38 34 c10 -10 28 -8 34 2 c8 -6 22 -2 22 10 c10 2 12 14 2 20 c2 10 -12 14 -20 8 c-8 8 -24 6 -26 -4 c-12 0 -18 -12 -10 -20 c-6 -4 -6 -12 -2 -16 z" fill="none" stroke="#2f8fd0" stroke-width="1.4" stroke-dasharray="3 2"/>
  <rect x="104" y="26" width="24" height="12" rx="2" fill="#0c6992"/>
  <text x="116" y="34.6" font-family="JetBrains Mono, ui-monospace, monospace" font-size="7" font-weight="500" fill="#fff" text-anchor="middle">42 %</text>`);

export const READS_GALLERY_HTML = `<ul class="rg" aria-label="Examples of what each reader reads">
${TILES.map((t) => `    <li><div class="rg-im"><svg viewBox="0 0 160 100" role="img" aria-label="${t.label}. Illustration."><title>${t.label}</title>${t.svg.replace(/\n\s*/g, "")}</svg></div><span>${t.name}</span></li>`).join("\n")}
  </ul>
  `;

export const READS_GALLERY_CSS = `.rg{list-style:none;margin:0 0 28px;padding:0;display:grid;grid-template-columns:repeat(5,1fr);gap:20px 16px}
.rg li{margin:0;text-align:center}
.rg-im{background:var(--color-surface-2);border-radius:var(--radius-card);height:140px;display:flex;align-items:center;justify-content:center;overflow:hidden}
.rg-im svg{width:100%;max-width:200px;height:100%;display:block}
.rg span{display:block;margin-top:10px;font-size:var(--type-sm);font-weight:500;color:var(--color-text)}
.rg-spin{transform-origin:80px 50px;transform-box:view-box;animation:rg-spin 1.6s linear infinite}
@keyframes rg-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.rg-spin{animation:none}}
@media (max-width:760px){.rg{grid-template-columns:1fr 1fr;gap:14px}.rg-im{height:112px}}`;
