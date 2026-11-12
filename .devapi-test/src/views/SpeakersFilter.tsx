'use client';

import { useEffect, useRef } from 'react';

/**
 * The interactive half of the Speakers page: strand-filter chips that show
 * or hide cards in the grid below. Scoped to the nearest ancestor
 * [data-speakers-page] via a hidden anchor + ref, mirroring the original
 * script's page-wide querySelectorAll but for exactly this page instance.
 */
export function SpeakersFilter() {
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = anchorRef.current?.closest<HTMLElement>('[data-speakers-page]');
    if (!root) return undefined;

    const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-filter]')];
    const items = [...root.querySelectorAll<HTMLElement>('[data-speaker-grid] > li')];
    const status = root.querySelector('[data-filter-status]');

    const handlers = buttons.map((btn) => () => {
      const f = btn.dataset.filter!;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      let n = 0;
      items.forEach((li) => {
        const cats = li.dataset.categories || '';
        const show = f === 'all' || cats === 'always' || cats.split(' ').includes(f);
        li.hidden = !show;
        if (show && cats !== 'always') n++;
      });
      if (status) status.textContent = `${n} speakers shown`;
    });
    buttons.forEach((btn, i) => btn.addEventListener('click', handlers[i]));

    return () => {
      buttons.forEach((btn, i) => btn.removeEventListener('click', handlers[i]));
    };
  }, []);

  return <span ref={anchorRef} hidden data-speakers-filter-anchor />;
}
