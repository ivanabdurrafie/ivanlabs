import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

const snap = (tag) =>
  page.evaluate((t) => ({
    tag: t,
    attr: document.documentElement.getAttribute('data-theme'),
    stored: localStorage.getItem('theme'),
    bg: getComputedStyle(document.body).backgroundColor,
  }), tag);

await page.goto('http://localhost:4321/ivanlabs/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
console.log(JSON.stringify(await snap('home-initial (light)')));

await page.click('#themeToggle');
await page.waitForTimeout(300);
console.log(JSON.stringify(await snap('after-toggle')));

// client-side nav via view transition
await page.click('.nav-link[href$="/work"]');
await page.waitForTimeout(1400);
console.log(JSON.stringify(await snap('after-nav-to-work')));

// back home, toggle to explicit light, nav again
await page.click('.nav-link[href$="/ivanlabs/"], .nav-link[href="/ivanlabs/"]');
await page.waitForTimeout(1400);
await page.click('#themeToggle'); // dark -> light
await page.waitForTimeout(300);
console.log(JSON.stringify(await snap('after-toggle-to-light')));
await page.click('.nav-link[href$="/about"]');
await page.waitForTimeout(1400);
console.log(JSON.stringify(await snap('after-nav-light')));

// and across into the /alt family via the footer switcher (shared theme script)
await page.click('.footer a[href$="/alt"]');
await page.waitForTimeout(1400);
console.log(JSON.stringify(await snap('cross-to-alt')));

await browser.close();
