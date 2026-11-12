'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, m, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from 'motion/react';
import { MotionRoot, useCalmMotion } from './shared';

/**
 * A ribbon of strand names across the full width of the coral band, set in
 * capitals with a small star between them. It drifts left on its own; page
 * scrolling pushes it along (down: left and faster, up: back to the right).
 * It eases to a stop on hover or focus. The page's "Pause motion" buttons
 * stop it (WCAG 2.2.2), and it stays still for reduced motion.
 */
interface Props {
  items: string[];
  listLabel: string;
  lang?: string;
  /** Pixels per second. */
  speed?: number;
}

function Star() {
  return (
    <svg viewBox="0 0 12 12" className="mx-8 size-2.5 shrink-0 opacity-70 sm:mx-14" aria-hidden="true">
      <path d="M6 0v12M0 6h12M1.8 1.8l8.4 8.4M10.2 1.8l-8.4 8.4" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function Ribbon({ items, listLabel, lang, speed = 42 }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const active = useCalmMotion(wrap);
  const [hold, setHold] = useState(false);
  const x = useMotionValue(0);
  const pace = useMotionValue(1);
  const direction = useRef(1);

  // Scrolling the page adds to the drift, in the direction of the scroll.
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, [-1500, 0, 1500], [-4, 0, 4], { clamp: true });

  useEffect(() => {
    const c = animate(pace, hold ? 0 : 1, { duration: hold ? 1.1 : 1.6, ease: [0.22, 1, 0.36, 1] });
    return () => c.stop();
  }, [hold, pace]);

  useAnimationFrame((_, delta) => {
    if (!active || !row.current) return;
    const half = row.current.scrollWidth / 2;
    if (!half) return;
    const b = boost.get();
    if (b < -0.05) direction.current = -1;
    else if (b > 0.05) direction.current = 1;
    const step = (speed * Math.min(delta, 64)) / 1000;
    let next = x.get() - direction.current * step * pace.get() * (1 + Math.abs(b));
    if (next <= -half) next += half;
    else if (next > 0) next -= half;
    x.set(next);
  });

  const copy = (key: string) =>
    [...items, ...items].map((item, i) => (
      <span key={`${key}-${i}`} className="flex shrink-0 items-center">
        <span>{item}</span>
        <Star />
      </span>
    ));

  return (
    <div ref={wrap} className="relative" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
      <ul className="sr-only" aria-label={listLabel} lang={lang}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="overflow-hidden" aria-hidden="true">
        <m.div ref={row} style={{ x }} className="flex w-max items-center whitespace-nowrap text-[1.05rem] font-semibold uppercase tracking-[0.06em] sm:text-[1.3rem]" lang={lang}>
          {copy('a')}
          {copy('b')}
        </m.div>
      </div>
    </div>
  );
}

export default function Marquee(props: Props) {
  return (
    <MotionRoot>
      <Ribbon {...props} />
    </MotionRoot>
  );
}
