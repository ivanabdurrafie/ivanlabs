import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:4321/ivanlabs/', { waitUntil: 'networkidle' });
await p.click('#themeToggle');
await p.waitForTimeout(600);
const r = await p.evaluate(() => ({
  theme: document.documentElement.getAttribute('data-theme'),
  metricsBg: getComputedStyle(document.getElementById('metrics')).backgroundColor,
  metricsColor: getComputedStyle(document.getElementById('metrics')).color,
  hudBg: getComputedStyle(document.querySelector('.hud-left')).backgroundColor,
  hudColor: getComputedStyle(document.querySelector('.hud-left')).color,
  contactBg: getComputedStyle(document.getElementById('connect')).backgroundColor,
}));
console.log(JSON.stringify(r, null, 2));
await b.close();
