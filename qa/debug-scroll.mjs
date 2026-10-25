import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto('http://localhost:4321/ivanlabs/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
const trace = await page.evaluate(async () => {
  const out = [];
  const h = document.documentElement.scrollHeight;
  for (let y = 0; y < h; y += Math.round(window.innerHeight * 0.7)) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 150));
    out.push({ asked: y, actual: Math.round(window.scrollY) });
  }
  return out;
});
console.log(JSON.stringify(trace));
await browser.close();
