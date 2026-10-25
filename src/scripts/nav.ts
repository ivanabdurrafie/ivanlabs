/** Mobile menu + scroll progress bar. Active-page state is rendered server-side in Nav.astro. */
export function initNav(): void {
  initMobileMenu();
  bindScrollProgressOnce();
}

function initMobileMenu(): void {
  const hamburger = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (!hamburger || !links || hamburger.dataset.bound) return;
  hamburger.dataset.bound = '1';

  const close = () => {
    links.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  };

  hamburger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(open));
  });

  links.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', close);
  });
}

let progressBound = false;

function bindScrollProgressOnce(): void {
  if (progressBound) return;
  progressBound = true;

  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

        const bar = document.getElementById('scrollProgress');
        if (bar) bar.style.transform = `scaleX(${progress})`;

        const hud = document.getElementById('hudScroll');
        if (hud) hud.textContent = `${String(Math.round(progress * 100)).padStart(3, '0')}%`;

        ticking = false;
      });
    },
    { passive: true },
  );
}
