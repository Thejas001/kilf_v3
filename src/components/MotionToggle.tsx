'use client';

import { useEffect, useState } from 'react';
import { MOTION_EVENT } from './motion/shared';

/**
 * Pauses or resumes every looping animation on the site (WCAG 2.2.2).
 * The choice is remembered on this device. All toggles on a page stay in sync
 * via the shared `kilf:motion` window event.
 */
interface Props {
  tone?: 'light' | 'dark';
  className?: string;
  lang?: 'en' | 'ml';
}

export function MotionToggle({ tone = 'dark', className = '', lang = 'en' }: Props) {
  const labels = lang === 'ml' ? { pause: 'ചലനം നിർത്തുക', play: 'ചലനം തുടരുക' } : { pause: 'Pause motion', play: 'Play motion' };
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const sync = () => setPaused(document.documentElement.dataset.motion === 'paused');
    sync();
    window.addEventListener(MOTION_EVENT, sync);
    return () => window.removeEventListener(MOTION_EVENT, sync);
  }, []);

  const onClick = () => {
    const next = document.documentElement.dataset.motion !== 'paused';
    if (next) document.documentElement.dataset.motion = 'paused';
    else delete document.documentElement.dataset.motion;
    try {
      localStorage.setItem('kilf-motion', next ? 'paused' : 'on');
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event(MOTION_EVENT));
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={paused}
      className={[
        'inline-flex min-h-11 shrink-0 items-center gap-2.5 whitespace-nowrap px-4 text-sm font-medium transition-colors',
        tone === 'dark' ? 'text-white ring-1 ring-inset ring-white/35 hover:bg-white/10' : 'text-navy ring-1 ring-inset ring-navy/30 hover:bg-navy/5',
        className,
      ].join(' ')}
    >
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
        <path d="M8 5h3v14H8zM13 5h3v14h-3z" fill="currentColor" className={paused ? 'hidden' : ''} />
        <path d="M8 5.5v13l10.5-6.5Z" fill="currentColor" className={paused ? '' : 'hidden'} />
      </svg>
      <span>{paused ? labels.play : labels.pause}</span>
    </button>
  );
}
