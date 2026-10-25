import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto('http://localhost:4321/ivanlabs/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.evaluate(async () => {
  const h = document.documentElement.scrollHeight;
  for (let y = 0; y < h; y += Math.round(window.innerHeight * 0.7)) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 150));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(700);
const hidden = await page.evaluate(() =>
  [...document.querySelectorAll('[data-reveal]:not(.is-in)')].map((el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName,
      cls: el.className.slice(0, 60),
      top: Math.round(r.top + window.scrollY),
      h: Math.round(r.height),
      display: cs.display,
      opacity: cs.opacity,
    };
  }),
);
const vh = await page.evaluate(() => [window.innerHeight, document.documentElement.scrollHeight]);
console.log(JSON.stringify({ vh, hidden }, null, 2));
await browser.close();
