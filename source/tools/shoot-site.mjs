// Screenshot every site section at 1440 px and 390 px. Usage: node tools/shoot-site.mjs <url> <outDir> [prefix]
import { chromium } from "../demo/node_modules/playwright/index.mjs";
import { mkdirSync, writeFileSync } from "node:fs";
const [url, out, prefix = "site"] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const errs = [];
for (const [vn, vp] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: vn === "mobile" ? 2 : 1, isMobile: vn === "mobile", hasTouch: vn === "mobile" });
  const p = await ctx.newPage();
  p.on("console", (m) => { if (["error", "warning"].includes(m.type())) errs.push(`[${vn}] ${m.type()}: ${m.text()}`); });
  p.on("pageerror", (e) => errs.push(`[${vn}] pageerror: ${e.message}`));
  p.on("requestfailed", (r) => errs.push(`[${vn}] requestfailed: ${r.url()}`));
  await p.goto(url, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: `${out}/${prefix}-00-top-hero-${vn}.png` });
  // Sticky nav would cover section tops: make it static for section shots.
  await p.addStyleTag({ content: "header.nav{position:static!important}" });
  const ids = await p.$$eval("main section[id], footer", (els) => els.map((e, i) => e.id || (e.tagName === "FOOTER" ? "footer" : "s" + i)));
  let i = 1;
  for (const id of ids) {
    const loc = id === "footer" ? p.locator("footer").first() : p.locator(`section#${id}`);
    await loc.scrollIntoViewIfNeeded(); await p.waitForTimeout(150);
    await loc.screenshot({ path: `${out}/${prefix}-${String(i++).padStart(2, "0")}-${id}-${vn}.png` });
  }
  await ctx.close();
}
await b.close();
writeFileSync(`${out}/${prefix}-console-log.txt`, errs.join("\n") || "No console errors, warnings or failed requests.\n");
console.log(errs.length ? errs.join("\n") : "NO CONSOLE ERRORS");
