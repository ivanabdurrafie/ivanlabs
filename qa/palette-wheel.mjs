/**
 * ⌘K palette scroll regression: while the palette is open, wheel over the
 * results list → the LIST scrolls (native), the background page does NOT
 * (body locked, Lenis stopped). After Escape → unlock, page stays put.
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:4321/ivanlabs';
const results = [];
const fail = (name, detail) => results.push({ name, ok: false, detail });
const pass = (name, detail = '') => results.push({ name, ok: true, detail });

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

await page.goto(`${BASE}/about`, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);

// Establish background scroll with Lenis active (mouse wheel, not scrollTo).
await page.mouse.move(720, 450);
await page.mouse.wheel(0, 700);
await page.waitForTimeout(900);
const pre = await page.evaluate(() => window.scrollY);
if (pre > 50) pass('background scrolled before open', `scrollY=${pre}`);
else fail('background scrolled before open', `scrollY=${pre}`);

// Open the palette.
await page.keyboard.press('Control+k');
await page.waitForTimeout(350);
const openState = await page.evaluate(() => ({
  open: document.getElementById('paletteOverlay')?.classList.contains('open'),
  overflow: document.body.style.overflow,
  lenisStopped: window.__lenis ? window.__lenis.isStopped === true : 'no-lenis',
}));
if (openState.open && openState.overflow === 'hidden') pass('palette open + page locked', JSON.stringify(openState));
else fail('palette open + page locked', JSON.stringify(openState));
if (openState.lenisStopped) pass('Lenis stopped while open');
else fail('Lenis stopped while open', JSON.stringify(openState));

const snap = () =>
  page.evaluate(() => {
    const el = document.getElementById('paletteResults');
    return {
      pageY: window.scrollY,
      listTop: el.scrollTop,
      listScrollable: el.scrollHeight - el.clientHeight,
    };
  });

const before = await snap();
if (before.listScrollable <= 0) fail('results list actually scrollable', JSON.stringify(before));
else pass('results list actually scrollable', `overflowPx=${before.listScrollable}`);

// Wheel over the middle of the results list.
const box = await page.locator('#paletteResults').boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
for (let i = 0; i < 6; i++) {
  await page.mouse.wheel(0, 240);
  await page.waitForTimeout(80);
}
await page.waitForTimeout(400);
const after = await snap();

if (after.listTop > before.listTop + 40) pass('wheel scrolls the palette list', `${before.listTop} → ${after.listTop}`);
else fail('wheel scrolls the palette list', `${before.listTop} → ${after.listTop}`);

if (after.pageY === before.pageY) pass('background page did not move', `scrollY=${after.pageY}`);
else fail('background page did not move', `${before.pageY} → ${after.pageY}`);

// Arrow keys still work (the original workaround).
await page.keyboard.press('ArrowDown');
await page.keyboard.press('ArrowDown');
await page.waitForTimeout(250);
const arrows = await page.evaluate(() => {
  const sel = document.querySelector('#paletteResults [aria-selected="true"]');
  return { sel: !!sel, idx: Array.from(document.querySelectorAll('#paletteResults [data-palette-item]')).indexOf(sel) };
});
if (arrows.sel && arrows.idx === 2) pass('arrow navigation unaffected', JSON.stringify(arrows));
else fail('arrow navigation unaffected', JSON.stringify(arrows));

// Escape unlocks the page without jumping it.
await page.keyboard.press('Escape');
await page.waitForTimeout(350);
const closed = await page.evaluate(() => ({
  open: document.getElementById('paletteOverlay')?.classList.contains('open'),
  overflow: document.body.style.overflow,
  pageY: window.scrollY,
  lenisRunning: !!window.__lenis && (typeof window.__lenis.isStopped === 'function' ? !window.__lenis.isStopped() : true),
}));
if (!closed.open && closed.overflow === '' && closed.lenisRunning) pass('close restores scroll + Lenis', JSON.stringify(closed));
else fail('close restores scroll + Lenis', JSON.stringify(closed));
if (closed.pageY === before.pageY) pass('page still at original position after close', `scrollY=${closed.pageY}`);
else fail('page still at original position after close', `${before.pageY} → ${closed.pageY}`);

await browser.close();

let bad = 0;
for (const r of results) {
  if (!r.ok) bad++;
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  (${r.detail})` : ''}`);
}
console.log(bad === 0 ? '\nAll palette-wheel checks passed.' : `\n${bad} check(s) FAILED.`);
process.exit(bad === 0 ? 0 : 1);
