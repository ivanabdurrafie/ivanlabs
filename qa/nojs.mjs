import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  javaScriptEnabled: false,
});
const page = await ctx.newPage();
await page.goto('http://localhost:4321/ivanlabs/', { waitUntil: 'load' });
await page.waitForTimeout(800);
await page.screenshot({ path: 'qa/shots/50-nojs.png', fullPage: false });
await browser.close();
console.log('done');
