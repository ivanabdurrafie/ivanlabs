import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:4321/ivanlabs/';
const OUT = 'qa/shots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' }); // use system Chrome, no download

// --- Desktop ---
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);
await page.screenshot({ path: `${OUT}/01-hero-light.png` });

await page.locator('#work').scrollIntoViewIfNeeded();
await page.waitForTimeout(1400);
await page.screenshot({ path: `${OUT}/02-work.png` });

await page.locator('#metrics').scrollIntoViewIfNeeded();
await page.waitForTimeout(1600);
await page.screenshot({ path: `${OUT}/03-metrics.png` });

await page.locator('#connect').scrollIntoViewIfNeeded();
await page.waitForTimeout(1400);
await page.screenshot({ path: `${OUT}/04-connect.png` });

// Dark mode (back at hero)
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(600);
await page.click('#themeToggle');
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}/05-hero-dark.png` });

// Command palette
await page.keyboard.press('Control+k');
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/06-palette.png` });
await page.keyboard.press('Escape');

// Case study page
await page.goto(`${BASE}work/cqrs-enterprise`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/07-case.png` });

await ctx.close();

// --- Mobile ---
const mctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
});
const mp = await mctx.newPage();
await mp.goto(BASE, { waitUntil: 'networkidle' });
await mp.waitForTimeout(1600);
await mp.screenshot({ path: `${OUT}/08-mobile-hero.png` });

await mp.locator('#hamburger').tap();
await mp.waitForTimeout(500);
await mp.screenshot({ path: `${OUT}/09-mobile-menu.png` });

await mp.evaluate(() => document.getElementById('work')?.scrollIntoView());
await mp.waitForTimeout(1400);
await mp.screenshot({ path: `${OUT}/10-mobile-work.png` });

await mctx.close();
await browser.close();
console.log('QA screenshots written to', OUT);
