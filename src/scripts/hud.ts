import { site } from '../data/site';

let clockInterval: ReturnType<typeof setInterval> | null = null;

/** HUD: ticking local clock (bottom-left). Scroll % lives in nav.ts's progress loop. */
export function initHud(): void {
  if (clockInterval) clearInterval(clockInterval);

  const clock = document.getElementById('hudClock');
  if (!clock) return;

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: site.timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const tick = () => {
    clock.textContent = formatter.format(new Date());
  };

  tick();
  clockInterval = setInterval(tick, 1000);
}
