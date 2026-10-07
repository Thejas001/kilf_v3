'use client';

import { useTranslations, localizePath, type Lang, type UIKey } from '@/i18n/ui';

/**
 * Four ways into the festival as colour blocks in a 2×2 grid with shared
 * hairlines. Hovering a block sends a ring across it, like a drop on water.
 */
interface Props {
  lang?: Lang;
}

const cards: { key: 'lit' | 'music' | 'youth' | 'stage'; href: string; surface: string; body: string; icon?: 'quote' | 'wave' }[] = [
  { key: 'lit', href: '/programme', surface: 'on-dark bg-blue text-white', body: 'text-white/85', icon: 'quote' },
  { key: 'music', href: '/programme#strands', surface: 'bg-coral text-ink', body: 'text-ink/80', icon: 'wave' },
  { key: 'youth', href: '/youth', surface: 'bg-lime text-ink', body: 'text-ink/80' },
  { key: 'stage', href: '/khasak', surface: 'bg-sky text-navy', body: 'text-navy/80' },
];

export function WaysIn({ lang = 'en' }: Props) {
  const t = useTranslations(lang);
  const lp = (p: string) => localizePath(p, lang);

  return (
    <>
      <ul className="grid border-l border-t border-line md:grid-cols-2" data-reveal-group>
        {cards.map((c, i) => (
          <li key={c.key} className={['border-b border-r border-line', c.surface].join(' ')}>
            <a href={lp(c.href)} className="ways group relative flex h-full min-h-[23rem] flex-col overflow-hidden p-8 sm:min-h-[26rem] sm:p-10 lg:p-12">
              <div className="flex items-start justify-between gap-6">
                <p className="eyebrow">
                  <span lang="en">{String(i + 1).padStart(2, '0')}</span> / {t(`home.ways.${c.key}.label` as UIKey)}
                </p>
                <span aria-hidden="true" className="-mt-1 text-[1.6rem] leading-none transition-transform duration-500 ease-[var(--ease-calm)] group-hover:-translate-y-1 group-hover:translate-x-1">
                  ↗
                </span>
              </div>
              {c.icon === 'quote' && (
                <svg viewBox="0 0 40 28" className="mt-7 h-7 w-10 text-lime" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M8.6 28C3.7 28 0 24.5 0 19.3 0 12.6 5.1 5.2 13.4 0l2.4 3.2C11 6.6 8.4 10.4 7.9 13.8c.4-.1.9-.2 1.5-.2 4.2 0 7.4 3 7.4 7.1C16.8 24.9 13.4 28 8.6 28Zm21.6 0c-4.9 0-8.6-3.5-8.6-8.7 0-6.7 5.1-14.1 13.4-19.3l2.4 3.2c-4.8 3.4-7.4 7.2-7.9 10.6.4-.1.9-.2 1.5-.2 4.2 0 7.4 3 7.4 7.1 0 4.2-3.4 7.3-8.2 7.3Z"
                  />
                </svg>
              )}
              {c.icon === 'wave' && (
                <span className="bars mt-7 flex h-9 items-center gap-[7px]" aria-hidden="true">
                  {[0.4, 0.75, 0.5, 1, 0.6, 0.85, 0.35, 0.7, 0.95, 0.5, 0.8, 0.45].map((h, j) => (
                    <span key={j} className="block w-[2px] bg-current" style={{ height: `${Math.round(h * 100)}%`, '--j': j } as React.CSSProperties} />
                  ))}
                </span>
              )}
              <h3 className="display mt-auto pt-12 text-[2.05rem] sm:text-[2.45rem]">
                {t(`home.ways.${c.key}.h` as UIKey)}
                <br />
                {t(`home.ways.${c.key}.accent` as UIKey)}
              </h3>
              <p className={['mt-5 max-w-md text-[1.02rem] leading-relaxed', c.body].join(' ')}>{t(`home.ways.${c.key}.text` as UIKey)}</p>
              {c.key === 'lit' && <p className="eyebrow mt-8 text-white/90">{t('home.ways.lit.tags')}</p>}
            </a>
          </li>
        ))}
      </ul>

      <style jsx>{`
        /* A ring spreads from the corner arrow across the block on hover */
        .ways::before,
        .ways::after {
          content: '';
          position: absolute;
          right: 2.1rem;
          top: 2.1rem;
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          border: 1px solid currentColor;
          opacity: 0;
          transform: scale(0.2);
          pointer-events: none;
        }
        .ways:hover::before,
        .ways:focus-visible::before {
          animation: spread 2.4s var(--ease-calm) 1;
        }
        .ways:hover::after,
        .ways:focus-visible::after {
          animation: spread 2.4s var(--ease-calm) 0.35s 1;
        }
        @keyframes spread {
          0% {
            opacity: 0.45;
            transform: scale(0.2);
          }
          100% {
            opacity: 0;
            transform: scale(16);
          }
        }
        /* The music waveform breathes slowly */
        .bars > span {
          transform-origin: center;
          animation: breathe-bar 2.8s ease-in-out infinite;
          animation-delay: calc(var(--j) * -0.23s);
        }
        @keyframes breathe-bar {
          0%,
          100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(0.55);
          }
        }
      `}</style>
    </>
  );
}
