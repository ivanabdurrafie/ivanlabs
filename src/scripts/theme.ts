/** Dark-mode toggle. Initial theme is applied by an inline <head> script (no FOUC). */

/**
 * Re-apply the stored theme. On a view-transition swap Astro syncs <html>
 * attributes from the incoming static page — which ships none — wiping
 * data-theme, and the identical inline head script is deduped (never re-runs).
 * astro:after-swap fires before paint, so this restores without a flash.
 */
function applyStoredTheme(): void {
  try {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  } catch {
    /* storage unavailable — leave attributes as they are */
  }
}

// Module scope: bound exactly once, while initTheme re-runs per page-load
document.addEventListener('astro:after-swap', applyStoredTheme);

/**
 * Flip the theme behind a circular wipe that expands from the clicked
 * toggle (View Transitions API + the .theme-swap rules in tokens.css).
 * Falls back to an instant swap without startViewTransition or under
 * prefers-reduced-motion.
 */
function swapTheme(mutate: () => void, origin: { x: number; y: number } | null): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof document.startViewTransition !== 'function' || reduced || !origin) {
    mutate();
    return;
  }

  const html = document.documentElement;

  // A wipe is already mid-flight — flip instantly rather than queue a second one.
  if (html.classList.contains('theme-swap')) {
    mutate();
    return;
  }

  const { x, y } = origin;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const tokens = getComputedStyle(html);
  const duration = parseFloat(tokens.getPropertyValue('--dur-med')) * 1000 || 450;
  const easing = tokens.getPropertyValue('--ease-out-expo').trim() || 'cubic-bezier(0.16, 1, 0.3, 1)';

  html.style.setProperty('--theme-swap-x', `${x}px`);
  html.style.setProperty('--theme-swap-y', `${y}px`);
  html.classList.add('theme-swap');

  const transition = document.startViewTransition(mutate);

  transition.ready
    .then(() => {
      html.animate(
        [
          { clipPath: `circle(0px at ${x}px ${y}px)` },
          { clipPath: `circle(${radius}px at ${x}px ${y}px)` },
        ],
        { duration, easing, pseudoElement: '::view-transition-new(root)' },
      );
    })
    .catch(() => {
      /* transition superseded — the instant swap already happened */
    });

  transition.finished
    .catch(() => {})
    .finally(() => {
      html.classList.remove('theme-swap');
      html.style.removeProperty('--theme-swap-x');
      html.style.removeProperty('--theme-swap-y');
    });
}

export function initTheme(): void {
  const toggle = document.getElementById('themeToggle');
  if (!toggle || toggle.dataset.bound) return;
  toggle.dataset.bound = '1';

  toggle.addEventListener('click', () => {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';

    const rect = toggle.getBoundingClientRect();
    swapTheme(
      () => {
        if (isDark) {
          html.removeAttribute('data-theme');
          localStorage.setItem('theme', 'light');
        } else {
          html.setAttribute('data-theme', 'dark');
          localStorage.setItem('theme', 'dark');
        }
      },
      { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
    );
  });
}
