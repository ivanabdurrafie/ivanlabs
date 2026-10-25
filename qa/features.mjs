import { chromium } from 'playwright';

const BASE = 'http://localhost:4321/ivanlabs/';
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  permissions: ['clipboard-read', 'clipboard-write'],
});
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('console: ' + m.text());
});

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// 1. Marquee present + animating
const marquee = await page.evaluate(() => {
  const track = document.querySelector('[data-marquee]');
  if (!track) return null;
  const anim = track.getAnimations()[0];
  return {
    items: track.querySelectorAll('.marquee-item').length,
    groups: track.querySelectorAll('.marquee-group').length,
    playing: anim ? anim.playState : 'none',
  };
});
const marqueeBox = await page.evaluate(() => {
  const el = document.querySelector('.marquee');
  return el ? { top: Math.round(el.getBoundingClientRect().top + window.scrollY), h: Math.round(el.getBoundingClientRect().height) } : null;
});
await page.evaluate((y) => window.scrollTo(0, y - 200), marqueeBox.top);
await page.waitForTimeout(700);
await page.screenshot({ path: 'qa/shots/20-marquee.png' });

// 2. Blur-decay reveal: hero already revealed (is-in), blur cleared
const revealed = await page.evaluate(() => {
  const el = document.querySelector('.hero-title') || document.querySelector('[data-reveal]');
  if (!el) return null;
  const s = getComputedStyle(el);
  return { hasIn: el.classList.contains('is-in'), filter: s.filter, opacity: s.opacity };
});

// 3. Shine on connect email (pseudo-element exists)
const shine = await page.evaluate(() => {
  const el = document.querySelector('.connect-email');
  if (!el) return null;
  const after = getComputedStyle(el, '::after');
  return { hasPseudo: after.content !== 'none', transform: after.transform };
});

// 4. Copy-email: click copies + toast, mailto still the href
await page.evaluate(() => document.querySelector('.connect-email').scrollIntoView({ block: 'center' }));
await page.waitForTimeout(600);
const href = await page.getAttribute('.connect-email', 'href');
await page.click('.connect-email', { noWaitAfter: true }).catch(() => {});
await page.waitForTimeout(500);
const clipboard = await page.evaluate(() => navigator.clipboard.readText().catch(() => 'READ_FAIL'));
const toast = await page.evaluate(() => {
  const t = document.querySelector('.toast');
  return t ? { text: t.textContent, visible: t.classList.contains('is-visible') } : null;
});
await page.screenshot({ path: 'qa/shots/21-copy-toast.png' });

// 5. Hanging monogram: present + drifts (physics running)
const hangBefore = await page.evaluate(() => {
  const t = document.querySelector('.hang-tag');
  return t ? t.style.transform : null;
});
await page.waitForTimeout(400);
const hangAfter = await page.evaluate(() => {
  const t = document.querySelector('.hang-tag');
  return t ? t.style.transform : null;
});
await page.evaluate(() => document.querySelector('.footer').scrollIntoView({ block: 'center' }));
await page.waitForTimeout(500);
await page.screenshot({ path: 'qa/shots/22-hang.png' });

console.log(
  JSON.stringify({ marquee, revealed, shine, href, clipboard, toast, hangBefore, hangAfter, errors }, null, 2),
);

await browser.close();
