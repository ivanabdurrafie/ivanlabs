import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome' });

// dark mode
const dark = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await dark.addInitScript(() => localStorage.setItem('theme', 'dark'));
const d = await dark.newPage();
await d.goto('http://localhost:4321/ivanlabs/alt/', { waitUntil: 'networkidle' });
await d.waitForTimeout(1200);
await d.screenshot({ path: 'qa/shots/65-alt-dark.png' });

// mobile + open hamburger
const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const m = await mob.newPage();
await m.goto('http://localhost:4321/ivanlabs/alt/', { waitUntil: 'networkidle' });
await m.waitForTimeout(1000);
await m.screenshot({ path: 'qa/shots/66-alt-mobile.png' });
await m.tap('#hamburger');
await m.waitForTimeout(400);
await m.screenshot({ path: 'qa/shots/67-alt-mobile-menu.png' });

await browser.close();
console.log('done');
