// Screenshot the demo CNC mill 3 view (step 6) at 390 px mobile, for the site hero phone.
// Usage: node tools/hero-phone.mjs [demoUrl] ; writes site/generated/demo-cnc3-390.png
import { chromium } from "../demo/node_modules/playwright/index.mjs";
import { mkdirSync } from "node:fs";
const base = process.argv[2] ?? "http://localhost:5190/";
const out = new URL("../site/generated/", import.meta.url).pathname;
mkdirSync(out, { recursive: true });
// PW_CHROMIUM: optional path to a Chromium binary, when the demo's Playwright has no browser of its own installed.
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined, args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
await p.goto(base + "#/step/6?still", { waitUntil: "networkidle" });
await p.waitForTimeout(800); // still mode: tick 0, load 42 %, parts 312, as in the camera image
await p.locator('section[aria-label="App screen"]').screenshot({ path: out + "demo-cnc3-390.png" });
await b.close();
console.log("wrote", out + "demo-cnc3-390.png");
