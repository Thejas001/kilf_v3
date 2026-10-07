'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { MotionRoot, useCalmMotion, useStableId, wavePath } from './shared';

/**
 * A calm backdrop of rings spreading across still water, for section
 * backgrounds. With `follow`, a faint ripple trails the mouse across the
 * parent section. Decorative only.
 */
type Tone = 'light' | 'dark' | 'lime' | 'coral';
interface Props {
  tone?: Tone;
  /** Where the rings start, as percentages of the section. */
  x?: number;
  y?: number;
  rings?: number;
  /** Largest ring radius in px. */
  size?: number;
  /** Ellipse flattening: 1 = circles, 0.3 = rings seen across water. */
  squash?: number;
  waves?: boolean;
  follow?: boolean;
  className?: string;
}

const colors: Record<Tone, string> = {
  light: '#1B37E6',
  dark: '#FFFFFF',
  lime: '#E7EF93',
  coral: '#0F1C74',
};
const strength: Record<Tone, number> = { light: 0.16, dark: 0.22, lime: 0.3, coral: 0.2 };

type Trail = { id: number; x: number; y: number };

function Field({ tone = 'light', x = 78, y = 70, rings = 4, size = 520, squash = 0.42, waves = false, follow = false, className = '' }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const active = useCalmMotion(wrap);
  const color = colors[tone];
  const o = strength[tone];
  const [trail, setTrail] = useState<Trail[]>([]);
  const nextId = useStableId();

  useEffect(() => {
    const host = wrap.current?.parentElement;
    if (!follow || !active || !host || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let last = 0;
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - last < 420) return;
      last = now;
      const r = wrap.current!.getBoundingClientRect();
      const id = nextId();
      setTrail((t) => [...t.slice(-4), { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
      setTimeout(() => setTrail((t) => t.filter((p) => p.id !== id)), 2600);
    };
    host.addEventListener('pointermove', onMove, { passive: true });
    return () => host.removeEventListener('pointermove', onMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [follow, active]);

  const ringList = Array.from({ length: rings }, (_, i) => i);
  const period = 11;

  return (
    <div ref={wrap} className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <svg className="absolute inset-0 size-full" focusable="false">
        <g fill="none" stroke={color} strokeWidth={1.5}>
          {ringList.map((i) => {
            const still = 0.35 + (i / rings) * 0.75;
            return (
              <m.ellipse
                key={i}
                cx={`${x}%`}
                cy={`${y}%`}
                rx={size}
                ry={size * squash}
                vectorEffect="non-scaling-stroke"
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                initial={{ scale: still, opacity: o * (1 - i / rings) }}
                animate={
                  active
                    ? { scale: [0.2, 1.1], opacity: [0, o, 0] }
                    : { scale: still, opacity: o * (1 - i / rings) }
                }
                transition={
                  active
                    ? { duration: period, repeat: Infinity, ease: 'easeOut', delay: (i * period) / rings, times: [0, 0.2, 1] }
                    : { duration: 1.2 }
                }
              />
            );
          })}
        </g>
        {waves && (
          <g fill="none" stroke={color} strokeLinecap="round">
            {[0, 1, 2].map((i) => (
              <svg key={i} y={`${80 + i * 7}%`} overflow="visible">
                <m.path
                  d={wavePath(-160, 0, 2400, 5 + i * 2, 90 + i * 30)}
                  strokeWidth={1.4}
                  opacity={o * (1.2 - i * 0.25)}
                  animate={active ? { x: [0, -(90 + i * 30)] } : { x: 0 }}
                  transition={active ? { duration: 9 + i * 4, repeat: Infinity, ease: 'linear' } : { duration: 1 }}
                />
              </svg>
            ))}
          </g>
        )}
        <AnimatePresence>
          {trail.flatMap((p) =>
            [0, 0.3].map((delay, i) => (
              <m.ellipse
                key={`${p.id}-${i}`}
                cx={p.x}
                cy={p.y}
                rx={70}
                ry={70 * squash}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                initial={{ scale: 0.15, opacity: 0 }}
                animate={{ scale: 1.6, opacity: [0, o * 1.8, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.2, ease: 'easeOut', delay, times: [0, 0.2, 1] }}
              />
            )),
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}

export default function RippleField(props: Props) {
  return (
    <MotionRoot>
      <Field {...props} />
    </MotionRoot>
  );
}

