/**
 * Entry point. Runs on every page (view transitions swap the DOM, not this script),
 * so everything re-binds on astro:page-load with per-element guards.
 */
import Lenis from 'lenis';
import { initTheme } from './theme';
import { initNav } from './nav';
import { initReveals } from './reveal';
import { initHud } from './hud';
import { initScramble } from './scramble';
import { initPalette } from './palette';
import { initCopy } from './copy';
import { initHang } from './hang';

let lenis: Lenis | null = null;
let rafStarted = false;

function initSmoothScroll(): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  lenis?.destroy();
  lenis = null;

  if (reduced) return;

  lenis = new Lenis({
    duration: 1.1,
    anchors: { offset: -70 },
  });

  if (rafStarted) return;
  rafStarted = true;
  const loop = (time: number) => {
    lenis?.raf(time);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

function init(): void {
  initTheme();
  initNav();
  initReveals();
  initHud();
  initScramble();
  initPalette();
  initCopy();
  initHang();
  initSmoothScroll();
}

// ClientRouter fires astro:page-load on the initial load and after every navigation
document.addEventListener('astro:page-load', init);
if (document.readyState === 'complete') init();
