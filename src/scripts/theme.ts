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

export function initTheme(): void {
  const toggle = document.getElementById('themeToggle');
  if (!toggle || toggle.dataset.bound) return;
  toggle.dataset.bound = '1';

  toggle.addEventListener('click', () => {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    if (isDark) {
      html.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      html.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  });
}
