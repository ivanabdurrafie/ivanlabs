import { chromium } from 'playwright';

const BASE = 'http://localhost:4321/ivanlabs/';
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('console: ' + m.text());
});

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);

// 1. hero gutter restored?
const heroLeft = await page.evaluate(() => document.querySelector('.hero-title').getBoundingClientRect().left);
const activeAtTop = await page.evaluate(() => document.querySelectorAll('.nav-link.active').length);
await page.screenshot({ path: 'qa/shots/11-hero-fixed.png' });

// 2. dark-mode primary button colors
await page.click('#themeToggle');
await page.waitForTimeout(700);
const btn = await page.evaluate(() => {
  const s = getComputedStyle(document.querySelector('.btn-primary'));
  return { bg: s.backgroundColor, color: s.color };
});
await page.screenshot({ path: 'qa/shots/12-dark-btn.png' });

// 3. palette item order
await page.keyboard.press('Control+k');
await page.waitForTimeout(400);
const order = await page.evaluate(() =>
  [...document.querySelectorAll('[data-palette-item]')]
    .slice(0, 8)
    .map((e) => e.textContent.trim().replace(/\s+/g, ' ')),
);
await page.screenshot({ path: 'qa/shots/13-palette-fixed.png' });
await page.keyboard.press('Escape');
await page.waitForTimeout(300);

// 4. view transition into a case study and back
await page.click('a[href="/ivanlabs/work/fitness-ai"]');
await page.waitForTimeout(1400);
const url1 = page.url();
const h1 = (await page.textContent('h1'))?.trim().slice(0, 50);
await page.screenshot({ path: 'qa/shots/14-case-fitness.png' });

await page.click('.case-back');
await page.waitForTimeout(1400);
const url2 = page.url();

// 5. footer vs HUD overlap at the very bottom
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await page.waitForTimeout(1000);
const footerClear = await page.evaluate(() => {
  const f = document.querySelector('.footer span').getBoundingClientRect();
  const h = document.querySelector('.hud-left').getBoundingClientRect();
  return f.bottom < h.top; // footer text sits above the HUD chip
});
await page.screenshot({ path: 'qa/shots/15-bottom-fixed.png' });

// 6. Lenis anchor navigation from nav click
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);
await page.click('.nav-link[href="#timeline"]');
await page.waitForTimeout(1800);
const anchor = await page.evaluate(() => ({
  scrollY: Math.round(window.scrollY),
  timelineTop: Math.round(document.getElementById('timeline').getBoundingClientRect().top),
}));

console.log(
  JSON.stringify({ heroLeft, activeAtTop, btn, order, url1, h1, url2, footerClear, anchor, errors }, null, 2),
);

await browser.close();
