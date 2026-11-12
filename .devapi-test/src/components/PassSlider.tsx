'use client';

import { useCallback, useEffect, useRef } from 'react';
import { PassCard, type PassCardData } from '@/components/PassCard';

const STEP_MS = 1800;
const SLIDE_MS = 900;
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/**
 * Carousel. While hovered it advances one card at a time and loops at the end.
 * Each card's highlight (--t) follows its distance from the centre every frame, so the
 * next card blends into the blue position as it slides in while the previous one blends out.
 */
export function PassSlider({ passes }: { passes: PassCardData[] }) {
  const ref = useRef<HTMLUListElement>(null);
  const anim = useRef(0);

  const paint = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    for (const child of Array.from(el.children)) {
      const li = child as HTMLElement;
      const dist = Math.abs(li.offsetLeft + li.offsetWidth / 2 - mid);
      const t = Math.max(0, 1 - dist / li.offsetWidth);
      li.style.setProperty('--t', t.toFixed(3));
      li.classList.toggle('on-dark', t > 0.5);
    }
  }, []);

  const scrollToX = useCallback(
    (target: number) => {
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
    },
    [],
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      const el = ref.current;
      const card = el?.children[0] as HTMLElement | undefined;
      if (!el || !card) return;
      const max = el.scrollWidth - el.clientWidth;
      const next = el.scrollLeft + dir * card.offsetWidth;
      if (dir === 1 && el.scrollLeft >= max - 4) scrollToX(0);
      else scrollToX(Math.min(max, Math.max(0, Math.round(next / card.offsetWidth) * card.offsetWidth)));
    },
    [scrollToX],
  );

  useEffect(() => {
    paint();
    window.addEventListener('resize', paint);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = reduce ? 0 : window.setInterval(() => ref.current?.parentElement?.matches(':hover, :focus-within') && step(1), STEP_MS);
    return () => {
      window.removeEventListener('resize', paint);
      clearInterval(timer);
      cancelAnimationFrame(anim.current);
    };
  }, [paint, step]);

  const btn = 'flex size-12 items-center justify-center border border-line bg-cream text-xl text-navy transition-colors hover:bg-blue hover:text-white';
  return (
    <div>
      <ul
        ref={ref}
        onScroll={paint}
        className="flex snap-x snap-mandatory overflow-x-auto border-l border-t border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {passes.map((p, i) => (
          <PassCard key={p.id} p={p} index={i} hi={i === 1} className="w-full shrink-0 snap-start sm:w-1/2 lg:w-1/3" />
        ))}
      </ul>
      <div className="mt-6 flex justify-end gap-3">
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
