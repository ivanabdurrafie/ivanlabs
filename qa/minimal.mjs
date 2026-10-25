import { chromium } from 'playwright';

const BASE = 'http://localhost:4321/ivanlabs';
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('console: ' + m.text());
});

const activeNav = () =>
  page.evaluate(() =>
    [...document.querySelectorAll('.nav-link')].map((a) => ({
      label: a.textContent.trim(),
      active: a.classList.contains('active'),
      current: a.getAttribute('aria-current'),
    })),
  );

async function scrollThrough() {
  await page.mouse.move(720, 450);
  let last = -1;
  let stable = 0;
  for (let i = 0; i < 80 && stable < 3; i++) {
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(150);
    const cur = await page.evaluate(() => Math.round(window.scrollY));
    if (cur === last) stable += 1;
    else stable = 0;
    last = cur;
  }
  for (let i = 0; i < 60; i++) {
    const cur = await page.evaluate(() => Math.round(window.scrollY));
    if (cur <= 0) break;
    await page.mouse.wheel(0, -2400);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(500);
}

const revealState = () =>
  page.evaluate(() => {
    const all = document.querySelectorAll('[data-reveal]');
    const hidden = [...all].filter((el) => !el.classList.contains('is-in'));
    return { total: all.length, stillHidden: hidden.length };
  });

const meta = () =>
  page.evaluate(() => ({
    h1: document.querySelector('h1')?.textContent.replace(/\s+/g, ' ').trim(),
    robots: document.querySelector('meta[name="robots"]')?.content,
    hasFooterSwitch: !!document.querySelector('.min-footer a[href$="/ivanlabs/"]'),
  }));

// --- ALT HOME ---
await page.goto(BASE + '/alt/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const home = {
  ...(await meta()),
  active: await activeNav(),
  stats: await page.evaluate(() => document.querySelectorAll('.m-stat').length),
  rows: await page.evaluate(() => document.querySelectorAll('.m-row').length),
  stack: await page.evaluate(() => document.querySelectorAll('.m-stack span:not(.m-sep)').length),
};
await scrollThrough();
home.reveals = await revealState();
await page.screenshot({ path: 'qa/shots/60-alt-home.png', fullPage: false });
await page.screenshot({ path: 'qa/shots/61-alt-home-full.png', fullPage: true });

// --- nav to /alt/about ---
await page.click('.nav-link[href$="/alt/about"]');
await page.waitForTimeout(1400);
const about = {
  url: page.url(),
  ...(await meta()),
  active: await activeNav(),
  sections: await page.evaluate(() =>
    [...document.querySelectorAll('.m-head h2')].map((e) => e.textContent.trim()),
  ),
};
await scrollThrough();
about.reveals = await revealState();
await page.screenshot({ path: 'qa/shots/62-alt-about-full.png', fullPage: true });

// --- nav to /alt/work ---
await page.click('.nav-link[href$="/alt/work"]');
await page.waitForTimeout(1400);
const work = {
  url: page.url(),
  ...(await meta()),
  active: await activeNav(),
  rows: await page.evaluate(() => document.querySelectorAll('.m-row').length),
};
await scrollThrough();
work.reveals = await revealState();
await page.screenshot({ path: 'qa/shots/63-alt-work-full.png', fullPage: true });

// --- case study still marks Work active ---
await page.click('.m-row-title');
await page.waitForTimeout(1400);
const caseStudy = {
  url: page.url(),
  ...(await meta()),
  active: await activeNav(),
};
await page.screenshot({ path: 'qa/shots/64-alt-case.png', fullPage: false });

// --- palette points at /alt routes ---
await page.keyboard.press('Control+k');
await page.waitForTimeout(400);
const palette = await page.evaluate(() =>
  [...document.querySelectorAll('[data-palette-item]')].map((a) => a.getAttribute('href')),
);
await page.keyboard.press('Escape');

const origin = new URL(page.url()).origin;
const internal = [...new Set(palette.filter((h) => h && !h.startsWith('http') && !h.startsWith('mailto:')))];
const statuses = {};
for (const href of internal) {
  const r = await page.request.get(origin + href.split('#')[0]);
  statuses[href] = r.status();
}

// --- sitemap lists /alt, brutalist home cross-links to /alt ---
const sm = await page.request.get(BASE + '/sitemap-0.xml');
let sitemapAlt = null;
if (sm.ok()) sitemapAlt = (await sm.text()).includes('/alt');

await page.goto(BASE + '/', { waitUntil: 'networkidle' });
const brutalistCrosslink = await page.evaluate(
  () => !!document.querySelector('.footer a[href$="/alt"]'),
);
const brutalistRobots = await page.evaluate(
  () => document.querySelector('meta[name="robots"]')?.content,
);

console.log(JSON.stringify({
  home,
  about,
  work,
  caseStudy,
  paletteCount: palette.length,
  paletteStatuses: statuses,
  sitemapAlt,
  brutalistCrosslink,
  brutalistRobots,
  errors,
}, null, 2));

await browser.close();
