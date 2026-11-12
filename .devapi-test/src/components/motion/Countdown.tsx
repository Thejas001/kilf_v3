'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { MotionRoot, calm } from './shared';

/**
 * Countdown to the first chapter. Digits roll gently when they change.
 * `initial` is computed at build time so the server HTML and the first
 * client render match; the real time takes over after hydration.
 */
interface Props {
  target: string;
  initial: [number, number, number];
  labels: { title: string; days: string; hours: string; minutes: string; live: string };
  tone?: 'dark' | 'light';
}

function split(ms: number): [number, number, number] {
  return [Math.floor(ms / 86400000), Math.floor((ms % 86400000) / 3600000), Math.floor((ms % 3600000) / 60000)];
}

function Digit({ value, still }: { value: string; still: boolean }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden align-top">
      <AnimatePresence initial={false} mode="popLayout">
        <m.span
          key={value}
          className="absolute inset-0 text-center"
          initial={still ? false : { y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={still ? undefined : { y: '-100%', opacity: 0 }}
          transition={{ duration: 0.9, ease: calm }}
        >
          {value}
        </m.span>
      </AnimatePresence>
    </span>
  );
}

function Clock({ target, initial, labels, tone = 'dark' }: Props) {
  const [left, setLeft] = useState<[number, number, number] | null>(initial);
  const reduce = useReducedMotion();
  const dark = tone === 'dark';

  useEffect(() => {
    const end = new Date(target).getTime();
    const tick = () => {
      const diff = end - Date.now();
      setLeft(diff > 0 ? split(diff) : null);
      return diff > 0;
    };
    if (!tick()) return;
    const id = setInterval(() => !tick() && clearInterval(id), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!left) {
    return <p className="font-display text-2xl font-bold">{labels.live}</p>;
  }

  const units: [string, number][] = [
    [labels.days, left[0]],
    [labels.hours, left[1]],
    [labels.minutes, left[2]],
  ];

  return (
    <div>
      <p className={`eyebrow ${dark ? 'text-mist' : 'text-muted'}`}>{labels.title}</p>
      <div className="mt-4 flex items-end gap-3 sm:gap-5" role="timer" aria-live="off">
        {units.map(([label, value], i) => (
          <div key={label} className="flex items-end gap-3 sm:gap-5">
            {i > 0 && <span aria-hidden="true" className={`numeral pb-7 text-4xl sm:text-5xl ${dark ? 'text-coral' : 'text-coral-dark'}`}>·</span>}
            <div>
              <span className={`numeral block text-[3.4rem] sm:text-[4.75rem] ${dark ? 'text-lime' : 'text-blue'}`}>
                <span className="sr-only">{value}</span>
                <span aria-hidden="true">
                  {String(value)
                    .padStart(2, '0')
                    .split('')
                    .map((d, j, all) => (
                      <Digit key={all.length - j} value={d} still={!!reduce} />
                    ))}
                </span>
              </span>
              <span className={`mt-2 block text-[0.72rem] font-bold uppercase tracking-[0.18em] ${dark ? 'text-cream/85' : 'text-muted'}`}>{label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Countdown(props: Props) {
  return (
    <MotionRoot>
      <Clock {...props} />
    </MotionRoot>
  );
}
