'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PassCard, type PassCardData } from '@/components/PassCard';

const STEP_MS = 1800;
const SLIDE_MS = 900;
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Carousel. While hovered it advances one card at a time and loops at the end.
 * Each card's highlight (--t) follows its distance from the centre every frame, so the
 * next card blends into the blue position as it slides in while the previous one blends out.
 * On mobile a row of ticket stubs above the cards shows every pass at once, and the next
 * card peeks in from the edge, so it's clear there's more than one to choose from.
 */
export function PassSlider({ passes }: { passes: PassCardData[] }) {
  const ref = useRef<HTMLUListElement>(null);
  const anim = useRef(0);
  const [active, setActive] = useState(0);
  // With three or fewer passes they all fit side by side on desktop, so no arrows are needed there.
  const few = passes.length <= 3;

  const paint = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const li = child as HTMLElement;
      const dist = Math.abs(li.offsetLeft + li.offsetWidth / 2 - mid);
      if (dist < bestDist) [best, bestDist] = [i, dist];
      const t = Math.max(0, 1 - dist / li.offsetWidth);
      li.style.setProperty('--t', t.toFixed(3));
      li.classList.toggle('on-dark', t > 0.5);
    });
    setActive(best);
  }, []);

  const scrollToX = useCallback((target: number) => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(anim.current);
    const from = el.scrollLeft;
    const start = performance.now();
    el.style.scrollSnapType = 'none';
    const frame = (now: number) => {
      const p = Math.min(1, (now - start) / SLIDE_MS);
      el.scrollLeft = from + (target - from) * ease(p);
      if (p < 1) anim.current = requestAnimationFrame(frame);
      else el.style.scrollSnapType = '';
    };
    anim.current = requestAnimationFrame(frame);
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const el = ref.current;
      const li = el?.children[i] as HTMLElement | undefined;
      if (!el || !li) return;
      // Centre the chosen card so the cards either side peek in.
      const x = li.offsetLeft - (el.clientWidth - li.offsetWidth) / 2;
      scrollToX(Math.min(el.scrollWidth - el.clientWidth, Math.max(0, x)));
    },
    [scrollToX],
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      const el = ref.current;
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 4) return;
      if (dir === 1 && el.scrollLeft >= max - 4) goTo(0);
      else goTo(Math.min(passes.length - 1, Math.max(0, active + dir)));
    },
    [goTo, active, passes.length],
  );

  useEffect(() => {
    paint();
    window.addEventListener('resize', paint);
    return () => {
      window.removeEventListener('resize', paint);
      cancelAnimationFrame(anim.current);
    };
  }, [paint]);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = reduce ? 0 : window.setInterval(() => ref.current?.parentElement?.matches(':hover, :focus-within') && step(1), STEP_MS);
    return () => clearInterval(timer);
  }, [step]);

  const btn = 'flex size-12 items-center justify-center border border-line bg-cream text-xl text-navy transition-colors hover:bg-blue hover:text-white';
  // Half-circle notches on a stub's sides make it read as a ticket.
  const notch = 'absolute top-1/2 size-3 -translate-y-1/2 rounded-full border border-line bg-cream';

  return (
    <div>
      <div className="mb-5 sm:hidden">
        <p className="eyebrow mb-3 flex items-center justify-between text-muted">
          <span>{passes.length} passes · pick one</span>
          <span aria-hidden="true">Swipe →</span>
        </p>
        <div role="tablist" aria-label="Choose a pass" className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${passes.length}, minmax(0, 1fr))` }}>
          {passes.map((p, i) => {
            const on = active === i;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => goTo(i)}
                className={[
                  'relative flex min-w-0 flex-col items-start overflow-visible border border-dashed px-3 py-2.5 text-left transition-colors',
                  on ? 'border-blue bg-blue text-white' : 'border-line bg-cream text-navy',
                ].join(' ')}
              >
                <span aria-hidden="true" className={`${notch} -left-1.5`} />
                <span aria-hidden="true" className={`${notch} -right-1.5`} />
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.14em] opacity-70">{pad(i + 1)}</span>
                <span className="w-full truncate text-[0.8rem] font-semibold leading-tight">{p.name}</span>
                {p.price && <span className={['text-[0.78rem] font-semibold', on ? 'text-lime' : 'text-blue-bright'].join(' ')}>{p.price}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <ul
        ref={ref}
        onScroll={paint}
        className="flex snap-x snap-mandatory overflow-x-auto border-l border-t border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {passes.map((p, i) => (
          <PassCard key={p.id} p={p} index={i} hi={i === 1} className="w-[86%] shrink-0 snap-center sm:w-1/2 sm:snap-start lg:w-1/3" />
        ))}
      </ul>

      <div className={['mt-6 flex items-center justify-end gap-3', few ? 'lg:hidden' : ''].join(' ')}>
        <div className="mr-auto flex items-center gap-3 sm:hidden" aria-hidden="true">
          <span className="numeral text-lg text-navy">
            {pad(active + 1)} <span className="text-muted">/ {pad(passes.length)}</span>
          </span>
          <span className="flex gap-1.5">
            {passes.map((p, i) => (
              <span key={p.id} className={['h-1.5 transition-all', active === i ? 'w-6 bg-blue' : 'w-1.5 bg-line'].join(' ')} />
            ))}
          </span>
        </div>
        <button type="button" onClick={() => step(-1)} aria-label="Previous passes" className={btn}>
          ←
        </button>
        <button type="button" onClick={() => step(1)} aria-label="Next passes" className={btn}>
          →
        </button>
      </div>
    </div>
  );
}
