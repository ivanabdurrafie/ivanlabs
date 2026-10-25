/** Copy-to-clipboard + toast. Re-inits on view transitions via per-element guards. */

let toastEl: HTMLDivElement | null = null;
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function ensureToast(): HTMLDivElement {
  if (toastEl && document.body.contains(toastEl)) return toastEl;
  toastEl = document.createElement('div');
  toastEl.className = 'toast';
  toastEl.setAttribute('role', 'status');
  toastEl.setAttribute('aria-live', 'polite');
  document.body.appendChild(toastEl);
  return toastEl;
}

function showToast(message: string): void {
  const el = ensureToast();
  el.textContent = message;
  el.classList.add('is-visible');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2200);
}

async function copyText(text: string): Promise<void> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for non-secure contexts / older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    showToast('Copied to clipboard');
  } catch {
    showToast('Copy failed — long-press to copy');
  }
}

export function initCopy(): void {
  document.querySelectorAll<HTMLElement>('[data-copy-email]').forEach((el) => {
    if (el.dataset.copyBound) return;
    el.dataset.copyBound = '1';
    el.addEventListener('click', () => {
      const value = el.getAttribute('data-copy-email');
      if (value) void copyText(value);
    });
  });
}
