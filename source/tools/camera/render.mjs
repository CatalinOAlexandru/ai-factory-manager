// Render tools/camera/cnc-hmi-camera-view-clean.html to assets/img/cnc-hmi-camera-clean.png (1600 x 1000).
import { chromium } from "../../demo/node_modules/playwright/index.mjs";
import { resolve } from "node:path";
const ROOT = resolve(new URL("../..", import.meta.url).pathname);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
await p.goto(`file://${ROOT}/tools/camera/cnc-hmi-camera-view-clean.html`); await p.waitForTimeout(500);
await p.screenshot({ path: `${ROOT}/assets/img/cnc-hmi-camera-clean.png` }); await b.close();
