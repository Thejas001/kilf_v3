import type { CSSProperties } from 'react';
import { LimeButton } from '@/components/LimeButton';
import { BuyButton } from '@/components/BuyButton';

export interface PassCardData {
  id: string;
  name: string;
  audience: string;
  description: string;
  includes: string[];
  highlighted: boolean;
  price?: string;
  priceNote?: string;
  buyUrl?: string;
  /** Set for live API tickets that are on sale: shows the in-page checkout. */
  checkout?: { ticketId: string; unitPrice: number; currency: string; maxQuantity?: number };
}

/** Colour that blends from `off` to `on` as the card's --t (0..1) goes from resting to highlighted. */
const mix = (off: string, on: string) =>
  `color-mix(in srgb, ${on} clamp(0%, calc((var(--t) - 0.5) * 400%), 100%), ${off})`;
const c = (n: string) => `var(--color-${n})`;

const s = {
  card: { backgroundColor: mix(c('cream'), c('blue')), color: mix(c('navy'), '#fff') },
  muted: { color: mix(c('muted'), 'rgb(255 255 255 / 0.85)') },
  price: { color: mix(c('blue-bright'), c('lime')) },
  rule: { borderColor: mix(c('line'), 'rgb(255 255 255 / 0.2)') },
  dot: { backgroundColor: mix(c('blue'), c('lime')) },
  badge: { opacity: 'clamp(0, calc((var(--t) - 0.5) * 4), 1)' },
} satisfies Record<string, CSSProperties>;

/**
 * A pass card. Its look is driven by the CSS variable --t (0 = resting, 1 = highlighted),
 * so a slider can animate it continuously by updating --t as the card crosses the centre.
 * `data-pass-card` + the `on-dark` class (flipped by the slider past t > 0.5) restyle the button.
 */
export function PassCard({ p, index, hi, className = '' }: { p: PassCardData; index: number; hi: boolean; className?: string }) {
  return (
    <li
      data-pass-card
      className={['flex flex-col border-b border-r border-line p-8 sm:p-10', hi ? 'on-dark' : '', className].join(' ')}
      style={{ '--t': hi ? 1 : 0, ...s.card } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="eyebrow">
          <span lang="en">{String(index + 1).padStart(2, '0')}</span> / {p.audience}
        </p>
        <span className="bg-lime px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-ink" style={s.badge} aria-hidden={!hi}>
          Most complete
        </span>
      </div>
      <h3 className="display mt-10 text-[2.2rem] sm:text-[2.5rem]">{p.name}</h3>
      <p className="mt-4 text-[1.02rem] leading-relaxed" style={s.muted}>
        {p.description}
      </p>
      {p.price && (
        <p className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="numeral text-[3.4rem] leading-none sm:text-[3.8rem]" style={s.price}>
            {p.price}
          </span>
          {p.priceNote && (
            <span className="text-[0.95rem]" style={s.muted}>
              {p.priceNote}
            </span>
          )}
        </p>
      )}
      <ul className="mt-7 flex-1 border-t" style={s.rule}>
        {p.includes.map((inc) => (
          <li key={inc} className="flex items-start gap-3 border-b py-3 text-[0.98rem]" style={s.rule}>
            <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0" style={s.dot}></span>
            <span>{inc}</span>
          </li>
        ))}
      </ul>
      <div className="mt-9">
        {p.checkout ? (
          <BuyButton name={p.name} {...p.checkout} />
        ) : p.price && p.buyUrl ? (
          <LimeButton href={p.buyUrl} label={`Buy · ${p.price}`} className="w-full" external />
        ) : (
          <>
            <p className="eyebrow mb-4" style={s.muted}>
              On sale soon
            </p>
            <LimeButton href="#notify" label="Notify me" className="w-full justify-between" />
          </>
        )}
      </div>
    </li>
  );
}
