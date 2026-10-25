/**
 * Hero char-scramble: characters near the pointer flicker to ':' and settle back.
 * Reads are batched into one rAF (no layout thrash), writes follow — fine pointers only.
 */
export function initScramble(): void {
  const title = document.getElementById('heroTitle');
  if (!title || title.dataset.scrambleBound) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;
  title.dataset.scrambleBound = '1';

  const chars: HTMLElement[] = [];
  title.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    const text = (el.textContent ?? '').trim();
    el.textContent = '';
    for (const ch of text) {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch;
      span.dataset.content = ch;
      el.appendChild(span);
      chars.push(span);
    }
  });

  const RADIUS = 130;
  let queued = false;

  title.addEventListener('pointermove', (e) => {
    if (queued) return;
    queued = true;
    const { clientX: mx, clientY: my } = e;

    requestAnimationFrame(() => {
      queued = false;

      // Phase 1: read every rect (layout untouched)
      const positions = chars.map((c) => {
        const r = c.getBoundingClientRect();
        return { c, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
      });

      // Phase 2: write only the chars in range
      for (const { c, cx, cy } of positions) {
        if (c.dataset.scrambling) continue;
        const dx = mx - cx;
        const dy = my - cy;
        const dist = Math.hypot(dx, dy);
        if (dist >= RADIUS) continue;

        const original = c.dataset.content ?? '';
        if (original.trim() === '') continue;

        c.dataset.scrambling = '1';
        c.textContent = ':';
        const settle = 90 + (dist / RADIUS) * 180;
        setTimeout(() => {
          c.textContent = original;
          delete c.dataset.scrambling;
        }, settle);
      }
    });
  });
}
