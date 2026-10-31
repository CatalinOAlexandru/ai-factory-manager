// Usage: node shoot.mjs <baseUrl> <outDir> <json list of [name, hashOrPath, waitMs, action?]>
import { chromium } from "../demo/node_modules/playwright/index.mjs";
import { mkdirSync, writeFileSync } from "node:fs";
const [base, out, listJson] = process.argv.slice(2);
const list = JSON.parse(listJson);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const errors = [];
for (const [vpName, vp] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: vpName === "mobile" ? 2 : 1, isMobile: vpName === "mobile", hasTouch: vpName === "mobile" });
  const page = await ctx.newPage();
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(`[${vpName}] ${m.type()}: ${m.text()}`); });
  page.on("pageerror", (e) => errors.push(`[${vpName}] pageerror: ${e.message}`));
  for (const [name, path, wait, action, full] of list) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    if (action) await page.evaluate(action);
    await page.waitForTimeout(wait ?? 600);
    await page.screenshot({ path: `${out}/${name}-${vpName}.png`, fullPage: !!full });
  }
  await ctx.close();
}
await browser.close();
writeFileSync(`${out}/console-log.txt`, errors.join("\n") || "No console errors or warnings.\n");
console.log(errors.length ? errors.join("\n") : "NO CONSOLE ERRORS");
