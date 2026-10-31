// Renders preview.html states to PNG. Usage: node render-plan.mjs [only-name]
import { createRequire } from 'module';
const require = createRequire('/home/box/team/factory/demo/package.json');
const { chromium } = require('playwright');
const dir = new URL('.', import.meta.url).pathname;
const jobs = [
  ['plan-layout-desktop', 'mode=layout', 1200, 1],
  ['plan-sensor-added-desktop', 'mode=sensorAdded', 1200, 1],
  ['plan-final-desktop', 'mode=final&sel=cnc3', 1200, 1],
  ['plan-final-mobile', 'mode=final&compact=1&sel=cnc3', 390, 2],
  ['plan-sensor-added-mobile', 'mode=sensorAdded&compact=1', 390, 2],
  ['plan-layout-suggested-desktop', 'mode=layout&suggested=1&sel=none', 1200, 1],
].filter((j) => !process.argv[2] || j[0] === process.argv[2]);
const b = await chromium.launch({ args: ['--disable-gpu'] });
for (const [name, qs, w, s] of jobs) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: s });
  await p.goto(`file://${dir}preview.html?${qs}`, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForSelector('svg.pp-plan');
  await (await p.$('.wrap')).screenshot({ path: `${dir}${name}.png` });
  console.log(name);
  await p.close();
}
await b.close();
