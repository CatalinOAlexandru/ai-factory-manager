// Build the marketing site from Factory Design's design/src/site.html (copied, never edited).
// Writes site/index.html and site/public/*. Vite serves (5191) and builds (site/dist) it.
// Env: DEMO_URL  "Try the demo" target. Default http://localhost:5190/ ; combined build uses ./demo/
//      HERO_PHONE path of a phone image that replaces the design-crop hero phone (img/s6-logging.png).
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
const ROOT = resolve(new URL("..", import.meta.url).pathname);
const D = `${ROOT}/design`, SITE = `${ROOT}/site`, PUB = `${SITE}/public`;
const DEMO_URL = process.env.DEMO_URL ?? "http://localhost:5190/";
const HERO_PHONE = process.env.HERO_PHONE ?? "";
const brand = JSON.parse(readFileSync(`${ROOT}/brand.config.json`, "utf8"));

rmSync(PUB, { recursive: true, force: true });
mkdirSync(`${PUB}/brand`, { recursive: true });
mkdirSync(`${PUB}/fonts`, { recursive: true });
mkdirSync(`${PUB}/img`, { recursive: true }); // only images the final HTML uses are copied (below)
for (const [name, rel] of Object.entries(brand.files)) cpSync(`${ROOT}/${rel}`, `${PUB}/brand/${name}`);
// tokens.css without its comments (design notes are not published).
writeFileSync(`${PUB}/tokens.css`, readFileSync(`${D}/tokens.css`, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\n\s*\n+/g, "\n"));
writeFileSync(`${PUB}/site.css`, readFileSync(`${D}/src/site.css`, "utf8").replace('@import url("../tokens.css");', '@import url("tokens.css");'));
writeFileSync(`${PUB}/robots.txt`, "User-agent: *\nDisallow: /\n");

// Fonts: local copies of Inter, Source Serif 4 and JetBrains Mono (latin).
const FS = `${SITE}/node_modules/@fontsource`;
const fonts = [["Inter", "inter", [[400, "normal"], [500, "normal"], [600, "normal"], [700, "normal"]]],
  ["Source Serif 4", "source-serif-4", [[400, "normal"], [400, "italic"], [600, "normal"]]],
  ["JetBrains Mono", "jetbrains-mono", [[400, "normal"], [500, "normal"]]]];
let css = "/* Local fonts (copied from @fontsource). */\n";
for (const [family, pkg, faces] of fonts) for (const [w, st] of faces) {
  const f = `${pkg}-latin-${w}-${st}.woff2`;
  if (!existsSync(`${FS}/${pkg}/files/${f}`)) continue;
  cpSync(`${FS}/${pkg}/files/${f}`, `${PUB}/fonts/${f}`);
  css += `@font-face{font-family:"${family}";font-style:${st};font-weight:${w};font-display:swap;src:url("fonts/${f}") format("woff2")}\n`;
}
css += `.tnum,.n,table{font-variant-numeric:tabular-nums}\n`;
writeFileSync(`${PUB}/fonts.css`, css);

if (HERO_PHONE) cpSync(HERO_PHONE, `${PUB}/img/hero-phone-cnc3.png`);

let h = readFileSync(`${D}/src/site.html`, "utf8");
const n = (re) => (h.match(re) || []).length;
const counts = { demo: n(/href="demo\/"/g) };
h = h.replaceAll('href="demo/"', `href="${DEMO_URL}"`);
h = h.replace('<link rel="icon" href="img/favicon.svg" type="image/svg+xml">',
  '<link rel="icon" href="brand/favicon.svg" type="image/svg+xml">\n<link rel="icon" href="brand/favicon-32.png" sizes="32x32" type="image/png">\n<link rel="icon" href="brand/favicon-16.png" sizes="16x16" type="image/png">\n<link rel="apple-touch-icon" href="brand/apple-touch-icon.png">');
h = h.replaceAll('src="img/lockup-horizontal-light.svg"', 'src="brand/logo-light.svg"').replaceAll('src="img/lockup-horizontal-dark.svg"', 'src="brand/logo-dark.svg"')
     .replaceAll('src="img/mark.svg"', 'src="brand/mark.svg"').replaceAll('src="img/mark-dark.svg"', 'src="brand/mark-dark.svg"');
h = h.replace('<link rel="stylesheet" href="site.css">', '<link rel="stylesheet" href="fonts.css">\n<link rel="stylesheet" href="site.css">');
h = h.replace('aria-label="Join the waitlist (design only)"', 'aria-label="Join the waitlist (example form, not live)"')
     .replace('<span class="fine">Design only. This form does not send anything.</span>', '<span class="fine"><b>Example form · not live.</b> This form does not send anything.</span>');
if (HERO_PHONE) h = h.replace('<img class="phone" src="img/s6-logging.png" alt="Phone screen: a machine logging live, with speed, load, parts and uptime.">',
  '<img class="phone" src="img/hero-phone-cnc3.png" alt="Phone screen from the PanelPal demo: CNC mill 3 logging live. Spindle speed 8,000 rpm, load 42 %, parts today 312, uptime today 87 %. Example data.">');
// Copy fixes (approved): cost wording, and a "Planned" label on every promise that is not yet a product fact.
const must = (from, to) => { if (!h.includes(from)) throw new Error(`copy fix: text not found: ${from}`); h = h.replace(from, to); };
must("<b>Camera, about $10</b>", "<b>Target cost about $10</b>");
// 31 Oct 17:33 (Catalin): no "Planned" labels anywhere on the site (plans list, offer lines, privacy cards).
// Camera images with no text over them (tools/camera): the hero CNC view and the growth chamber view.
must('<img class="cam" src="img/cnc-hmi-camera-view.png" alt="Camera view of a CNC mill operator screen. Spindle speed, spindle load, parts today and alarm are each boxed and labelled with a confidence score. Example data.">',
  '<img class="cam" src="img/cnc-hmi-camera-clean.png" alt="Camera view of a CNC mill operator screen. Spindle speed, spindle load, parts today and alarm are each boxed. Example data.">');
must('<img src="img/camera-view.jpg" alt="Camera view of a growth chamber controller with four boxed values and confidence scores">',
  '<img src="img/camera-view-clean.jpg" alt="Camera view of a growth chamber controller with four boxed values">');
// Hardware: the smaller case (img-011) is the current case. It replaces img-007. No separate "next" figure. No chip names.
must('<figure class="c"><div class="im"><img src="img/img-007.jpg" alt="Two white camera cases on base plates, one tilted back on its hinge"></div><figcaption><b>Current case</b>Tilt hinge with a bolt, base plate, USB-C on top.</figcaption></figure>',
  '<figure class="c c2"><div class="im"><img src="img/img-011.jpg" alt="Small white camera case with a round lens window, alone and on a magnetic stand"></div><figcaption><b>Current case</b>About 25 × 30 × 19 mm, with a status light and a magnetic stand.</figcaption></figure>');
must('\n    <figure class="c"><div class="im"><img src="img/img-011.jpg" alt="Proposed small white camera case with a round lens window, alone and on a magnetic stand"></div><figcaption><b>Next: a smaller case</b>About 25 × 30 × 19 mm, with a status light and a magnetic stand.</figcaption></figure>', "");
// 30 Oct 22:01 (Catalin): remove the inside (exploded) view of the camera, with its caption. img-012 is then not shipped.
must('\n    <figure class="c"><div class="im"><img src="img/img-012.jpg" alt="Exploded view of the proposed case and its parts"></div><figcaption><b>Inside</b>An ESP32-S3 board and a small camera module, held by two M2 screws.</figcaption></figure>', "");
h = h.replace("</head>", '<style>.hw .c2{grid-column:span 6;justify-self:center;width:calc(50% - 10px)}@media (max-width:760px){.hw .c2{grid-column:span 2;width:calc(50% - 7px)}}</style>\n</head>');
if (/esp32|xiao/i.test(h)) throw new Error("chip name in site HTML");
// Make every remaining form inert, too.
h = h.replace(/<form(?![^>]*onsubmit)/g, '<form onsubmit="return false"');
if (!/name="robots" content="noindex/.test(h)) h = h.replace("<head>", '<head>\n<meta name="robots" content="noindex, nofollow">');
// 30 Oct 22:38 (Catalin via COF): the #join form opens an email to contact@panelpal.co.uk. This replaces the "inert form" rule for #join only.
// No network call, no form service, no stored data. With JavaScript off, the form action is a plain mailto (text/plain) fallback.
must(`    <form class="wl" onsubmit="return false" aria-label="Join the waitlist (example form, not live)">
      <label>Work email<input type="email" placeholder="you@example.com"></label>
      <label>What do you want to monitor?<select><option>`,
`    <form class="wl" id="join-form" action="mailto:contact@panelpal.co.uk?subject=PanelPal%20demo%20request" method="post" enctype="text/plain" aria-label="Book a demo by email">
      <label>Work email<input type="email" name="Work email" placeholder="you@example.com" required></label>
      <label>What do you want to monitor?<select name="What do you want to monitor?"><option>`);
must(`      <button class="btn primary" type="submit">Join the waitlist</button>
      <span class="fine"><b>Example form · not live.</b> This form does not send anything.</span>
    </form>`,
`      <button class="btn primary" type="submit">Book a demo</button>
      <span class="fine">This opens your email app with a message to <a href="mailto:contact@panelpal.co.uk">contact@panelpal.co.uk</a>. Nothing goes out until you send it.</span>
    </form>
    <script>document.getElementById("join-form").addEventListener("submit",function(e){e.preventDefault();var f=e.currentTarget,l=[];f.querySelectorAll("label").forEach(function(x){var c=x.querySelector("input,select,textarea");if(c)l.push(x.firstChild.textContent.trim()+": "+c.value.trim())});location.href="mailto:contact@panelpal.co.uk?subject="+encodeURIComponent("PanelPal demo request")+"&body="+encodeURIComponent(l.join("\\r\\n"))})</script>`);
if (!h.includes('<a href="mailto:contact@panelpal.co.uk">contact@panelpal.co.uk</a>')) throw new Error("join: visible contact link missing");
// 30 Oct 22:58 (Reviewer H1, allowed by Catalin): no waitlist. The CTA and both buttons point to "Book a demo" (email).
// 31 Oct 17:33 (Catalin): the hero keeps one "Book a demo" button and "Try the demo". Remove the second (soft) button.
must('\n      <a class="btn soft" href="#join">Join the waitlist</a>', '');
must('<a class="btn ghost" href="#join">Join the waitlist</a>', '<a class="btn ghost" href="#join">Book a demo</a>');
must('Book a short demo, or join the waitlist and we will tell you when it is ready.', 'Book a short demo. Send us an email and we will reply.');
if (/wait ?list/i.test(h.replace(/<[^>]*>/g, ""))) throw new Error("visible 'waitlist' text left in site HTML");
// Title, meta description, banner, footer and plans note: remove only that one word (the match texts below must quote the source). "Demo" and "example data" stay.
// Camera section (Grow Chamber 3 card): temperature labels that match the photo. Same order and the same colours (high, check, low).
must('<span style="background:var(--color-cam-high)">0.97 high</span><span style="background:var(--color-cam-mid)">0.81 check</span><span style="background:var(--color-cam-low)">0.42 low</span>',
  '<span style="background:var(--color-cam-high)">30 °C high</span><span style="background:var(--color-cam-mid)">22 °C check</span><span style="background:var(--color-cam-low)">15 °C low</span>');
// 30 Oct 22:01 (Catalin): img-008 re-rendered with the current case (assets/img copy). Alt text follows the new image.
// 30 Oct 22:33 (Catalin): img-008 lens turned toward the screen. img-009 is the ORIGINAL design image again (camera on a gooseneck above the screen).
must('<img src="img/img-008.jpg" alt="White camera case on a lab bench, angled up at an incubator touchscreen">',
  '<img src="img/img-008.jpg" alt="Small white cube camera on a round stand on a lab bench, with its lens turned toward an incubator touchscreen">');
must('<img src="img/img-009.jpg" alt="Two growth chambers, each with a small white camera on a gooseneck arm in front of the controller">',
  '<img src="img/img-009.jpg" alt="Two growth chambers. On each, a small white camera on a gooseneck arm sits above the controller screen and points down at it">');
const mustAll = (from, to, n) => { const c = h.split(from).length - 1; if (c !== n) throw new Error(`wording fix: expected ${n} x ${from}, found ${c}`); h = h.replaceAll(from, to); };
// 30 Oct 22:32 (Catalin, voice): "What it can read" table. Keep the table and every row. Remove the Status column. All rows show as current functionality.
must("<th>Examples</th><th>Status</th></tr>", "<th>Examples</th></tr>");
{ const before = h.length;
  h = h.replace(/<td><span class="pill (?:run|next|later)"><span class="dot"><\/span>(?:In the demo|Next|Later)<\/span><\/td><\/tr>/g, "</tr>");
  for (const r of ["Dial", "Counter", "Colour", "Level", "Presence", "Motion", "Count", "Area"]) must(`<tr><td>${r}</td>`, `<tr class="built"><td>${r}</td>`);
  if (/In the demo<\/span><\/td>|>Next<\/span><\/td>|>Later<\/span><\/td>/.test(h) || h.length === before) throw new Error("reads table: status cells not removed"); }
mustAll("<title>PanelPal · the everything sensor (concept demo)</title>", "<title>PanelPal · the everything sensor (demo)</title>", 1);
mustAll("Concept demo with example data.", "Demo with example data.", 1);
mustAll("<b>Concept demo · example data.</b>", "<b>Demo · example data.</b>", 1);
mustAll("<span>Concept demo · example data</span>", "<span>Demo · example data</span>", 1);
mustAll("Plans are a concept and can change.", "Plans can change.", 1);
if (/planned/i.test(h)) throw new Error("'Planned' left in site HTML");
if (/concept/i.test(h)) throw new Error("word left in site HTML: " + h.match(/.{0,40}concept.{0,40}/i)[0]);
if (!h.includes("Demo · example data")) throw new Error("banner missing");
writeFileSync(`${SITE}/index.html`, h);
// Copy only the img/ files that the final HTML references. Unused design images are not published.
const used = [...new Set([...h.matchAll(/(?:src|href)="(img\/[^"]+)"/g)].map((m) => m[1]))];
for (const p of used) if (!existsSync(`${PUB}/${p}`) && existsSync(`${ROOT}/assets/${p}`)) cpSync(`${ROOT}/assets/${p}`, `${PUB}/${p}`); // our own copies first
for (const p of used) if (!existsSync(`${PUB}/${p}`) && existsSync(`${D}/src/${p}`)) cpSync(`${D}/src/${p}`, `${PUB}/${p}`);
const stray = readdirSync(`${PUB}/img`).filter((f) => !used.includes(`img/${f}`));
if (stray.length) throw new Error(`unused images in site/public/img: ${stray.join(", ")}`);
// Brand: the build fails if site/public/brand holds a file that the final HTML does not use.
const brandUsed = new Set([...h.matchAll(/(?:src|href)="brand\/([^"]+)"/g)].map((m) => m[1]));
const strayBrand = readdirSync(`${PUB}/brand`).filter((f) => !brandUsed.has(f));
if (strayBrand.length) throw new Error(`unused files in site/public/brand: ${strayBrand.join(", ")}`);
const unbranded = [...h.matchAll(/src="(img\/[^"]+)"/g)].map((m) => m[1]).filter((p) => !existsSync(`${PUB}/${p}`));
console.log(`site built: demo links ${counts.demo} -> ${DEMO_URL}; hero phone ${HERO_PHONE ? "replaced" : "kept (design crop)"}; missing images: ${unbranded.length ? unbranded.join(", ") : "none"}`);
