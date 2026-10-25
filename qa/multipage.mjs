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
      label: a.textContent.replace(/\d+/g, '').trim(),
      active: a.classList.contains('active'),
      current: a.getAttribute('aria-current'),
    })),
  );

/** Scroll the whole page with real wheel events (Lenis hijacks window.scrollTo)
    so IntersectionObserver reveals fire like they do for a user, then return to top. */
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

// --- HOME ---
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const homeActive = await activeNav();
const homeH1 = await page.evaluate(() => document.querySelector('h1')?.textContent.replace(/\s+/g, ' ').trim());
const hasMetrics = await page.evaluate(() => document.querySelectorAll('.hero-metrics .stat-item').length);
const hasStack = await page.evaluate(() => document.querySelectorAll('.stack-item').length);
const hasMarquee = await page.evaluate(() => document.querySelectorAll('.marquee-item').length);
const hasConnect = await page.evaluate(() => !!document.querySelector('.connect-email'));
await scrollThrough();
const homeReveals = await revealState();
await page.screenshot({ path: 'qa/shots/40-home.png', fullPage: false });
await page.screenshot({ path: 'qa/shots/41-home-full.png', fullPage: true });

// --- NAV to /about via view transition ---
await page.click('.nav-link[href$="/about"]');
await page.waitForTimeout(1400);
const aboutUrl = page.url();
const aboutActive = await activeNav();
const aboutH1 = await page.evaluate(() => document.querySelector('h1')?.textContent.trim());
const aboutSections = await page.evaluate(() =>
  [...document.querySelectorAll('.section-header .section-title')].map((e) => e.textContent.trim()),
);
await scrollThrough();
const aboutReveals = await revealState();
await page.screenshot({ path: 'qa/shots/42-about.png', fullPage: true });

// --- NAV to /work ---
await page.click('.nav-link[href$="/work"]');
await page.waitForTimeout(1400);
const workUrl = page.url();
const workActive = await activeNav();
const workH1 = await page.evaluate(() => document.querySelector('h1')?.textContent.trim());
const workCards = await page.evaluate(() => document.querySelectorAll('.project-card').length);
await scrollThrough();
const workReveals = await revealState();
await page.screenshot({ path: 'qa/shots/43-work.png', fullPage: true });

// --- case study still reachable from /work ---
await page.click('.project-hit');
await page.waitForTimeout(1400);
const caseUrl = page.url();
const caseH1 = await page.evaluate(() => document.querySelector('h1')?.textContent.trim());
const workActiveOnCase = await activeNav();

// --- palette points at real routes ---
await page.keyboard.press('Control+k');
await page.waitForTimeout(400);
const palette = await page.evaluate(() =>
  [...document.querySelectorAll('[data-palette-item]')].map((a) => a.getAttribute('href')),
);
await page.keyboard.press('Escape');

// --- verify every palette href responds 200 (internal only) ---
const origin = new URL(page.url()).origin;
const internal = [...new Set(palette.filter((h) => h && !h.startsWith('http') && !h.startsWith('mailto:')))];
const statuses = {};
for (const href of internal) {
  const r = await page.request.get(origin + href.split('#')[0]);
  statuses[href] = r.status();
}

// --- sitemap lists the new pages ---
const sm2 = await page.request.get(BASE + '/sitemap-0.xml');
let sitemapHas = null;
if (sm2.ok()) {
  const txt = await sm2.text();
  sitemapHas = { about: txt.includes('/about'), work: txt.includes('/work') };
}

console.log(JSON.stringify({
  home: { h1: homeH1, active: homeActive, hasMetrics, hasStack, hasMarquee, hasConnect, reveals: homeReveals },
  about: { url: aboutUrl, h1: aboutH1, active: aboutActive, sections: aboutSections, reveals: aboutReveals },
  work: { url: workUrl, h1: workH1, active: workActive, cards: workCards, reveals: workReveals },
  caseStudy: { url: caseUrl, h1: caseH1, active: workActiveOnCase },
  paletteCount: palette.length,
  paletteStatuses: statuses,
  sitemap: sitemapHas,
  errors,
}, null, 2));

await browser.close();
