'use client';

import { useEffect, useRef } from 'react';

/**
 * The interactive half of <Schedule>: days as tabs, and strand chips that
 * filter the sessions. Kept as a tiny client component so the day-by-day
 * data loading in Schedule.tsx stays server-side. Scopes itself to the
 * nearest ancestor [data-schedule] via a hidden anchor + ref, mirroring the
 * original script's `document.querySelectorAll('[data-schedule]')` but for
 * exactly this component instance.
 */
export function ScheduleController() {
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = anchorRef.current?.closest<HTMLElement>('[data-schedule]');
    if (!root) return undefined;

    const tabs = [...root.querySelectorAll<HTMLAnchorElement>('[data-tab]')];
    const panels = [...root.querySelectorAll<HTMLElement>('[data-day]')];
    const list = root.querySelector<HTMLElement>('[data-tablist]');
    if (!list || !tabs.length) return undefined;

    // Days as tabs.
    list.setAttribute('role', 'tablist');
    list.querySelectorAll('li').forEach((li) => li.setAttribute('role', 'presentation'));
    tabs.forEach((tab) => {
      tab.setAttribute('role', 'tab');
      tab.id = `tab-${tab.dataset.tab}`;
      tab.setAttribute('aria-controls', `day-${tab.dataset.tab}`);
    });
    panels.forEach((p) => {
      p.setAttribute('role', 'tabpanel');
      p.setAttribute('aria-labelledby', `tab-${p.dataset.day}`);
      p.tabIndex = -1;
    });
    const select = (id: string, focus = false) => {
      tabs.forEach((tab) => {
        const on = tab.dataset.tab === id;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        if (on) {
          tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
          if (focus) tab.focus();
        }
      });
      panels.forEach((p) => (p.hidden = p.dataset.day !== id));
    };

    const clickHandlers = tabs.map((tab) => (e: MouseEvent) => {
      e.preventDefault();
      select(tab.dataset.tab!);
      history.replaceState(null, '', `#day-${tab.dataset.tab}`);
    });
    const keydownHandlers = tabs.map((tab, i) => (e: KeyboardEvent) => {
      const to = ({ ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 } as Record<string, number>)[e.key];
      if (to === undefined) return;
      e.preventDefault();
      const next = tabs[(to + tabs.length) % tabs.length];
      select(next.dataset.tab!, true);
      history.replaceState(null, '', `#day-${next.dataset.tab}`);
    });
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', clickHandlers[i]);
      tab.addEventListener('keydown', keydownHandlers[i]);
    });

    // Open on the linked day, today during the festival, or the first day.
    const fromHash = location.hash.replace('#day-', '');
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const ids = tabs.map((t) => t.dataset.tab!);
    select(ids.includes(fromHash) ? fromHash : ids.includes(today) ? today : ids[0]);

    // Strand filter.
    const bar = root.querySelector<HTMLElement>('[data-filter-bar]');
    const status = root.querySelector<HTMLElement>('[data-filter-status]');
    const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-strand-filter]')];
    let chipHandlers: (() => void)[] = [];
    if (bar) {
      bar.hidden = false;
      const all = status?.textContent ?? '';
      chipHandlers = chips.map((chip) => () => {
        const id = chip.dataset.strandFilter!;
        chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
        let shown = 0;
        panels.forEach((p) => {
          let n = 0;
          p.querySelectorAll<HTMLElement>('.session').forEach((s) => {
            const on = id === 'all' || s.dataset.strand === id;
            s.hidden = !on;
            if (on) n++;
          });
          p.querySelector('[data-empty]')?.classList.toggle('hidden', n > 0);
          shown += n;
        });
        if (status) status.textContent = id === 'all' ? all : `${shown} ${chip.textContent?.trim()} sessions over the five days`;
      });
      chips.forEach((chip, i) => chip.addEventListener('click', chipHandlers[i]));
    }

    return () => {
      tabs.forEach((tab, i) => {
        tab.removeEventListener('click', clickHandlers[i]);
        tab.removeEventListener('keydown', keydownHandlers[i]);
      });
      chips.forEach((chip, i) => chip.removeEventListener('click', chipHandlers[i]));
    };
  }, []);

  return <span ref={anchorRef} hidden data-schedule-anchor />;
}
