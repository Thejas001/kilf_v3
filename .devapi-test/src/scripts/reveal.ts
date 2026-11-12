/**
 * Scroll reveals for static HTML, driven by Motion's small vanilla API.
 * - [data-reveal]        rises and un-blurs into place
 * - [data-reveal-group]  its children arrive one after another
 * - [data-count]         a number counts up once, e.g. data-count="100" data-suffix="+"
 * The `js` class (set in <head>) hides them first; without JS or with
 * reduced motion nothing is hidden. Paused motion shows everything at once.
 */
import { animate } from 'motion/mini';
import { inView, stagger } from 'motion';

const root = document.documentElement;
(window as unknown as { __kilfReveal?: boolean }).__kilfReveal = true;

const ease = [0.22, 1, 0.36, 1] as const;
const margin = '0px 0px -12% 0px';

function showAll() {
  document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-group] > *').forEach((el) => (el.style.opacity = '1'));
}

function countUp(el: HTMLElement) {
  const end = Number(el.dataset.count);
  const suffix = el.dataset.suffix ?? '';
  const pad = Number(el.dataset.pad ?? 0);
  const fmt = (n: number) => {
    const s = Math.round(n).toLocaleString('en-IN');
    return (pad ? s.padStart(pad, '0') : s) + suffix;
  };
  if (!root.classList.contains('js') || root.dataset.motion === 'paused') {
    el.textContent = fmt(end);
    return;
  }
  el.textContent = fmt(0);
  inView(
    el,
    () => {
      const start = performance.now();
      const dur = 1600;
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        el.textContent = fmt(end * (1 - Math.pow(1 - t, 4)));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },
    { margin },
  );
}

let motionBound = false;

/** Wires up the [data-reveal]/[data-count] elements currently in the DOM; call again after each client-side navigation. */
export function initReveal() {
  document.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
  
  if (root.classList.contains('js')) {
    if (root.dataset.motion === 'paused') {
      showAll();
    } else {
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        inView(
          el,
          () => {
            animate(
              el,
              { opacity: [0, 1], transform: ['translateY(28px)', 'none'], filter: ['blur(6px)', 'blur(0px)'] },
              { duration: 1.1, ease, delay: Number(el.dataset.revealDelay ?? 0) },
            );
          },
          { margin },
        );
      });
      document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
        const kids = Array.from(group.children) as HTMLElement[];
        inView(
          group,
          () => {
            animate(kids, { opacity: [0, 1], transform: ['translateY(24px)', 'none'] }, { duration: 0.9, ease, delay: stagger(0.08) });
          },
          { margin },
        );
      });
      // If the visitor pauses motion mid-page, reveal whatever is still hidden.
      if (!motionBound) {
      motionBound = true;
      window.addEventListener('kilf:motion', () => root.dataset.motion === 'paused' && showAll());
    }
    }
  }
}
