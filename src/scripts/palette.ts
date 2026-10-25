/** ⌘K / Ctrl+K command palette. Items are server-rendered in Base.astro; this only filters & routes. */
export function initPalette(): void {
  const overlay = document.getElementById('paletteOverlay');
  const input = document.getElementById('paletteInput') as HTMLInputElement | null;
  const results = document.getElementById('paletteResults');
  const empty = document.getElementById('paletteEmpty');
  const openBtn = document.getElementById('paletteBtn');
  if (!overlay || !input || !results) return;

  const getItems = () => Array.from(results.querySelectorAll<HTMLElement>('[data-palette-item]'));
  let visible: HTMLElement[] = [];
  let selected = 0;

  const render = () => {
    const query = input.value.trim().toLowerCase();
    visible = [];
    let any = false;

    for (const item of getItems()) {
      const match = query === '' || (item.textContent ?? '').toLowerCase().includes(query);
      item.hidden = !match;
      item.setAttribute('aria-selected', 'false');
      if (match) {
        visible.push(item);
        any = true;
      }
    }

    if (empty) empty.hidden = any;
    selected = 0;
    if (visible[0]) visible[0].setAttribute('aria-selected', 'true');
    results.scrollTop = 0;
  };

  const open = () => {
    overlay.classList.add('open');
    input.value = '';
    render();
    input.focus();
  };

  const close = (refocus = true) => {
    overlay.classList.remove('open');
    if (refocus) openBtn?.focus();
  };

  const isOpen = () => overlay.classList.contains('open');

  const move = (delta: number) => {
    if (visible.length === 0) return;
    visible[selected]?.setAttribute('aria-selected', 'false');
    selected = (selected + delta + visible.length) % visible.length;
    const next = visible[selected];
    next?.setAttribute('aria-selected', 'true');
    next?.scrollIntoView({ block: 'nearest' });
  };

  // Bindings (elements are replaced on every view transition — dataset guard covers double init)
  if (overlay.dataset.bound) return;
  overlay.dataset.bound = '1';

  openBtn?.addEventListener('click', open);
  input.addEventListener('input', render);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      move(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      move(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      visible[selected]?.click();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  // Clicking a result navigates (links are real anchors → view transitions apply)
  results.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('[data-palette-item]')) close(false);
  });

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      isOpen() ? close() : open();
    } else if (e.key === 'Escape' && isOpen()) {
      close();
    }
  });
}
