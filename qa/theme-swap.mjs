/**
 * Theme toggle effect: clicking #themeSwap's twin (#themeToggle) flips
 * data-theme behind a circular view-transition wipe — .theme-swap must
 * appear on <html> for the duration and clear afterwards, and the stored
 * preference must survive. Reduced-motion context falls back to instant.
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:4321/ivanlabs';
const results = [];
const fail = (name, detail) => results.push({ name, ok: false, detail });
const pass = (name, detail = '') => results.push({ name, ok: true, detail });

const browser = await chromium.launch({ channel: 'chrome' });

for (const skin of [
  { path: '/', label: 'brutalist' },
  { path: '/alt', label: 'minimal' },
]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  await page.goto(`${BASE}${skin.path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const themeOf = () => page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  const wasDark = (await themeOf()) === 'dark';

  // Click the toggle and sample .theme-swap while the wipe is in flight.
  await page.locator('#themeToggle').click();
  await page.waitForTimeout(120);
  const mid = await page.evaluate(() => ({
    themeSwap: document.documentElement.classList.contains('theme-swap'),
    x: document.documentElement.style.getPropertyValue('--theme-swap-x'),
    theme: document.documentElement.getAttribute('data-theme'),
  }));
  if (mid.themeSwap && mid.x.endsWith('px')) pass(`${skin.label}: wipe engaged`, JSON.stringify(mid));
  else fail(`${skin.label}: wipe engaged`, JSON.stringify(mid));
  if ((mid.theme === 'dark') !== wasDark) pass(`${skin.label}: theme flipped during wipe`);
  else fail(`${skin.label}: theme flipped during wipe`, `wasDark=${wasDark} now=${mid.theme}`);

  // Wipe cleans up and preference persists.
  await page.waitForTimeout(900);
  const after = await page.evaluate(() => ({
    themeSwap: document.documentElement.classList.contains('theme-swap'),
    x: document.documentElement.style.getPropertyValue('--theme-swap-x'),
    stored: localStorage.getItem('theme'),
    theme: document.documentElement.getAttribute('data-theme'),
  }));
  if (!after.themeSwap && after.x === '') pass(`${skin.label}: wipe cleaned up`);
  else fail(`${skin.label}: wipe cleaned up`, JSON.stringify(after));
  const expectStored = after.theme === 'dark' ? 'dark' : 'light';
  if (after.stored === expectStored) pass(`${skin.label}: preference stored`, `${after.stored}`);
  else fail(`${skin.label}: preference stored`, JSON.stringify(after));

  if (pageErrors.length === 0) pass(`${skin.label}: no page errors`);
  else fail(`${skin.label}: no page errors`, pageErrors.join('; '));

  await context.close();
}

// Reduced motion → instant swap, no wipe class, no errors.
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const before = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  await page.locator('#themeToggle').click();
  await page.waitForTimeout(300);
  const st = await page.evaluate(() => ({
    themeSwap: document.documentElement.classList.contains('theme-swap'),
    theme: document.documentElement.getAttribute('data-theme'),
  }));
  if ((st.theme === 'dark') !== (before === 'dark')) pass('reduced-motion: instant flip');
  else fail('reduced-motion: instant flip', `${before} → ${st.theme}`);
  if (!st.themeSwap) pass('reduced-motion: no wipe class');
  else fail('reduced-motion: no wipe class', JSON.stringify(st));

  await context.close();
}

await browser.close();

let bad = 0;
for (const r of results) {
  if (!r.ok) bad++;
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  (${r.detail})` : ''}`);
}
console.log(bad === 0 ? '\nAll theme-swap checks passed.' : `\n${bad} check(s) FAILED.`);
process.exit(bad === 0 ? 0 : 1);
