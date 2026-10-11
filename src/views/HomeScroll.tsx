'use client';

import { useEffect, useRef } from 'react';

/**
 * The two scroll-linked effects on the home page:
 * - the hero picture drifts slower than the page and the words lift away
 *   as you scroll past it;
 * - Khasakkinte Ithihasam's book opens as you scroll, via a `--p` custom
 *   property on [data-khasak] (consumed by KhasakBook's styles).
 * Scoped to this page instance via a hidden anchor + closest([data-home]),
 * mirroring the original inline <script>'s querySelectorAll calls.
 */
export function HomeScroll() {
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = anchorRef.current?.closest<HTMLElement>('[data-home]');
    if (!root) return undefined;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    import('motion').then(({ animate, scroll }) => {
      if (cancelled) return;
      const cleanups: VoidFunction[] = [];

      const hero = root.querySelector<HTMLElement>('[data-hero]');
      const art = hero?.querySelector<HTMLElement>('[data-hero-art]');
      const copy = hero?.querySelector<HTMLElement>('[data-hero-copy]');
      if (hero && art && copy && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const range = { target: hero, offset: ['start start', 'end start'] as ['start start', 'end start'] };
        cleanups.push(scroll(animate(art, { transform: ['translateY(0px)', 'translateY(18vh)'] }, { ease: 'linear' }), range));
        cleanups.push(scroll(animate(copy, { transform: ['translateY(0px)', 'translateY(-8vh)'], opacity: [1, 0.2] }, { ease: 'linear' }), range));
      }

      const khasak = root.querySelector<HTMLElement>('[data-khasak]');
      const book = khasak?.querySelector<HTMLElement>('[data-book]');
      if (khasak && book) {
        const wide = matchMedia('(min-width: 1024px)');
        const still = matchMedia('(prefers-reduced-motion: reduce)');
        // On phones --p lives on the stage (book + beam) only, so each scroll frame restyles
        // that small subtree instead of the whole section; on desktop the section needs it.
        const stage = khasak.querySelector<HTMLElement>('[data-khasak-stage]') ?? khasak;
        let target: HTMLElement = khasak;
        let last = '';
        // Skip the write when the value hasn't changed (e.g. while the section is off-screen
        // and p is pinned at 0 or 1) so no style recalculation is triggered.
        const set = (p: number) => {
          const v = p.toFixed(3);
          if (v === last) return;
          last = v;
          target.style.setProperty('--p', v);
        };
        let stop: VoidFunction | undefined;
        const setup = () => {
          stop?.();
          stop = undefined;
          khasak.removeAttribute('data-scrolly');
          khasak.style.removeProperty('--p');
          stage.style.removeProperty('--p');
          last = '';
          if (still.matches) return;
          if (wide.matches) {
            target = khasak;
            khasak.setAttribute('data-scrolly', '');
            stop = scroll(set, { target: khasak, offset: ['start start', 'end end'] });
          } else {
            target = stage;
            stop = scroll(set, { target: book, offset: ['start 95%', 'center 50%'] });
          }
        };
        setup();
        wide.addEventListener('change', setup);
        still.addEventListener('change', setup);
        cleanups.push(() => {
          stop?.();
          wide.removeEventListener('change', setup);
          still.removeEventListener('change', setup);
        });
      }

      cleanup = () => cleanups.forEach((fn) => fn());
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return <span ref={anchorRef} hidden data-home-scroll-anchor />;
}
