/**
 * Hanging monogram easter egg (footer).
 * Pendulum: gravity + damping + drag-to-fling. Disabled under reduced-motion.
 */

const GRAVITY = 1.2;
const DAMPING = 0.995;
const ROPE = 34; // px, visual length of the string

export function initHang(): void {
  const root = document.querySelector<HTMLElement>('[data-hanging]');
  if (!root || root.dataset.bound) return;
  root.dataset.bound = '1';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const tag = root.querySelector<HTMLElement>('.hang-tag');
  const stringEl = root.querySelector<HTMLElement>('.hang-string');
  if (!tag) return;

  let angle = 0; // radians from vertical
  let velocity = 0;
  let dragging = false;
  let lastPointerAngle = 0;
  let lastMoveTime = 0;
  let raf = 0;

  const pivotX = () => root.offsetWidth / 2;

  const render = () => {
    const x = Math.sin(angle) * ROPE;
    const y = Math.cos(angle) * ROPE;
    tag.style.transform = `translate(${x}px, ${y}px) rotate(${angle}rad)`;
    if (stringEl) {
      stringEl.style.height = `${y}px`;
      stringEl.style.transform = `translateX(${x}px)`;
      stringEl.style.transformOrigin = 'top center';
    }
  };

  const pointerAngleFromPivot = (e: PointerEvent): number => {
    const rect = root.getBoundingClientRect();
    const dx = e.clientX - (rect.left + pivotX());
    const dy = e.clientY - rect.top;
    return Math.atan2(dx, Math.max(dy, 1));
  };

  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    const now = performance.now();
    const next = pointerAngleFromPivot(e);
    const dt = Math.max(now - lastMoveTime, 1) / 1000;
    velocity = (next - lastPointerAngle) / dt;
    angle = next;
    lastPointerAngle = next;
    lastMoveTime = now;
    render();
  };

  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    // clamp fling energy so a wild flick can't spin forever
    velocity = Math.max(-6, Math.min(6, velocity));
  };

  tag.addEventListener('pointerdown', (e) => {
    dragging = true;
    lastPointerAngle = pointerAngleFromPivot(e);
    lastMoveTime = performance.now();
    velocity = 0;
    tag.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  tag.addEventListener('pointermove', onMove);
  tag.addEventListener('pointerup', onUp);
  tag.addEventListener('pointercancel', onUp);

  const loop = () => {
    if (!dragging) {
      velocity += -GRAVITY * Math.sin(angle);
      velocity *= DAMPING;
      angle += velocity;
      if (Math.abs(angle) < 0.0005 && Math.abs(velocity) < 0.0005) {
        angle = 0;
        velocity = 0;
      }
      render();
    }
    raf = requestAnimationFrame(loop);
  };

  // Small initial kick so it isn't dead-still on load
  velocity = 0.03;
  raf = requestAnimationFrame(loop);

  // Stop the loop if the footer is torn down (view transition)
  document.addEventListener(
    'astro:before-swap',
    () => {
      cancelAnimationFrame(raf);
      root.dataset.bound = '';
    },
    { once: true },
  );
}
