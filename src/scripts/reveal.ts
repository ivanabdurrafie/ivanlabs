const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** IntersectionObserver reveals + metric count-ups. ~20 lines replace GSAP ScrollTrigger. */
export function initReveals(): void {
  initRevealElements();
  initCountUps();
}

function initRevealElements(): void {
  const elements = document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])');
  if (elements.length === 0) return;

  if (reducedMotion()) {
    elements.forEach((el) => {
      el.classList.add('is-in');
      el.dataset.revealed = '1';
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );

  elements.forEach((el) => {
    el.dataset.revealed = '1';
    observer.observe(el);
  });
}

function initCountUps(): void {
  const counters = document.querySelectorAll<HTMLElement>('[data-count]:not([data-counted])');
  if (counters.length === 0) return;

  const skip = reducedMotion();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        observer.unobserve(el);
        if (!skip) animateCount(el);
      }
    },
    { threshold: 0.5 },
  );

  counters.forEach((el) => {
    el.dataset.counted = '1';
    const suffix = el.dataset.suffix ?? '';
    if (!skip) el.textContent = `0${suffix}`;
    observer.observe(el);
  });
}

function animateCount(el: HTMLElement): void {
  const target = Number(el.dataset.count ?? '0');
  const suffix = el.dataset.suffix ?? '';
  const duration = 1100;
  const start = performance.now();

  const tick = (now: number) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(2, -10 * t); // ease-out-expo
    const value = Math.round(target * eased);
    el.textContent = `${value}${suffix}`;
    if (t < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}
