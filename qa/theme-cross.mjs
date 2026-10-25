import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto('http://localhost:4321/ivanlabs/', { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
await page.click('#themeToggle');
await page.waitForTimeout(250);
await page.click('.footer a[href$="/alt"]');
await page.waitForTimeout(1500);
const after = await page.evaluate(() => ({
  url: location.pathname,
  attr: document.documentElement.getAttribute('data-theme'),
  stored: localStorage.getItem('theme'),
  bg: getComputedStyle(document.body).backgroundColor,
}));
console.log(JSON.stringify(after));
await browser.close();
